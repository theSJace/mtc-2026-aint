/**
 * Skim Pintar – API client v2
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"

function getToken(): string | null {
  return localStorage.getItem("sp_token")
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail: unknown
    try { detail = await res.json() } catch { detail = { message: res.statusText } }
    if (res.status === 401) {
      localStorage.removeItem("sp_token")
      localStorage.removeItem("sp_user")
      if (typeof window !== "undefined" && window.location.pathname !== "/sign-in") {
        window.location.href = "/sign-in?session_expired=1"
      }
    }
    throw { status: res.status, detail }
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Auth ───────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  nric: string; full_name: string; email: string; password: string
  phone: string; address: string; postal_code: string; date_of_birth: string
  preferred_language?: string; dependents?: DependentPayload[]
}
export interface DependentPayload {
  full_name: string; date_of_birth: string; relationship: string
  same_address: boolean; address?: string; nric?: string
}
export interface LoginPayload { email: string; password: string }
export interface AuthResponse {
  access_token: string; token_type: string
  user: import("@/contexts/AuthContext").UserProfile
}

export const auth = {
  register: (p: RegisterPayload) => request<AuthResponse>("/api/auth/register", { method: "POST", body: JSON.stringify(p) }),
  login: (p: LoginPayload) => request<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(p) }),
  me: () => request<import("@/contexts/AuthContext").UserProfile>("/api/auth/me"),
  updateLanguage: (language: "en" | "ms") => request("/api/users/language", { method: "PUT", body: JSON.stringify({ language }) }),
}

// ─── Dependents ─────────────────────────────────────────────────────────────
export interface Dependent {
  id: string; user_id: string; full_name: string; date_of_birth: string
  relationship: string; same_address: boolean; address: string; nric: string; created_at: string
}
export const dependents = {
  list: () => request<Dependent[]>("/api/dependents"),
  add: (p: DependentPayload) => request<Dependent>("/api/dependents", { method: "POST", body: JSON.stringify(p) }),
  update: (id: string, p: DependentPayload) => request<Dependent>(`/api/dependents/${id}`, { method: "PUT", body: JSON.stringify(p) }),
  remove: (id: string) => request<void>(`/api/dependents/${id}`, { method: "DELETE" }),
}

// ─── Membership ─────────────────────────────────────────────────────────────
export const membership = {
  selectTier: (tier: "PINTAR" | "PINTAR_PLUS") =>
    request<{ ok: boolean; tier: string; amount: number; membership_id: string }>(
      "/api/membership/select-tier", { method: "POST", body: JSON.stringify({ tier }) }
    ),
}

// ─── GIRO ───────────────────────────────────────────────────────────────────
export interface GiroRegisterPayload {
  bank_name: string; account_number: string; account_holder_name: string
}
export interface GiroRegisterResponse {
  mandate_ref: string; bank_name: string; account_number_masked: string; status: string; message: string
}
export const giro = {
  register: (p: GiroRegisterPayload) =>
    request<GiroRegisterResponse>("/api/giro/register", { method: "POST", body: JSON.stringify(p) }),
  cancel: () => request<{ ok: boolean; message: string }>("/api/giro/cancel", { method: "DELETE" }),
  simulateCycle: (month: number, year: number) =>
    request(`/api/payments/giro/simulate-cycle?month=${month}&year=${year}`, { method: "POST" }),
}

// ─── Payments ───────────────────────────────────────────────────────────────
export interface PayNowResponse {
  qr_data: string; reference: string; amount: number; payment_id: string; uen: string
}
export interface GiroPayload { bank_name: string; account_number: string; account_holder_name: string }
export interface GiroResponse {
  payment_id: string; reference: string; amount: number; bank_name: string
  mandate_ref: string; status: string; message: string
}
export interface Payment {
  id: string; user_id: string; amount: number; payment_type: string
  payment_category: string   // "SUBSCRIPTION" | "DONATION"
  status: string; reference: string; created_at: string
  period_month?: number | null; period_year?: number | null
}
export interface MonthlyStatus {
  paid: boolean; month: number; year: number
  days_until_end_of_month: number; giro_active: boolean
  consecutive_failed_months: number; is_deactivated: boolean
}

export const payments = {
  generatePayNow: (params: {
    amount?: number; period_month: number; period_year: number
    category?: "SUBSCRIPTION" | "DONATION"
  }) => request<PayNowResponse>("/api/payments/paynow", { method: "POST", body: JSON.stringify(params) }),
  setupGiro: (p: GiroPayload) =>
    request<GiroResponse>("/api/payments/giro", { method: "POST", body: JSON.stringify(p) }),
  confirm: (paymentId: string) =>
    request<{ ok: boolean; status: string }>(`/api/payments/${paymentId}/confirm`, { method: "POST" }),
  list: () => request<Payment[]>("/api/payments"),
  monthlyStatus: () => request<MonthlyStatus>("/api/payments/monthly-status"),
}
