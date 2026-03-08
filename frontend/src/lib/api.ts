/**
 * Skim Pintar – API client
 * Connects the React frontend to the FastAPI backend.
 * Base URL is controlled by VITE_API_URL env var (default: http://localhost:8000).
 */

const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000"

function getToken(): string | null {
  return localStorage.getItem("sp_token")
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  }
  if (token) headers["Authorization"] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail: unknown
    try {
      detail = await res.json()
    } catch {
      detail = { message: res.statusText }
    }
    // On 401 (invalid/expired token), clear auth and redirect to sign-in so user can log in again
    if (res.status === 401) {
      localStorage.removeItem("sp_token")
      localStorage.removeItem("sp_user")
      const signInPath = "/sign-in?session_expired=1"
      if (typeof window !== "undefined" && window.location.pathname !== "/sign-in") {
        window.location.href = signInPath
      }
    }
    throw { status: res.status, detail }
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// ─── Auth ───────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  nric: string
  full_name: string
  email: string
  password: string
  phone: string
  address: string
  postal_code: string
  date_of_birth: string
  preferred_language?: string
  dependents?: DependentPayload[]
}

export interface DependentPayload {
  full_name: string
  date_of_birth: string
  relationship: string
  same_address: boolean
  address?: string
  nric?: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
  user: import("@/contexts/AuthContext").UserProfile
}

export const auth = {
  register: (payload: RegisterPayload) =>
    request<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload: LoginPayload) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  me: () => request<import("@/contexts/AuthContext").UserProfile>("/api/auth/me"),
  updateLanguage: (language: "en" | "ms") =>
    request("/api/users/language", {
      method: "PUT",
      body: JSON.stringify({ language }),
    }),
}

// ─── Dependents ─────────────────────────────────────────────────────────────

export interface Dependent {
  id: string
  user_id: string
  full_name: string
  date_of_birth: string
  relationship: string
  same_address: boolean
  address: string
  nric: string
  created_at: string
}

export const dependents = {
  list: () => request<Dependent[]>("/api/dependents"),
  add: (payload: DependentPayload) =>
    request<Dependent>("/api/dependents", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: DependentPayload) =>
    request<Dependent>(`/api/dependents/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  remove: (id: string) =>
    request<void>(`/api/dependents/${id}`, { method: "DELETE" }),
}

// ─── Membership ─────────────────────────────────────────────────────────────

export const membership = {
  selectTier: (tier: "PINTAR" | "PINTAR_PLUS") =>
    request<{ ok: boolean; tier: string; amount: number; membership_id: string }>(
      "/api/membership/select-tier",
      { method: "POST", body: JSON.stringify({ tier }) }
    ),
}

// ─── Payments ───────────────────────────────────────────────────────────────

export interface PayNowResponse {
  qr_data: string
  reference: string
  amount: number
  payment_id: string
  uen: string
}

export interface GiroPayload {
  bank_name: string
  account_number: string
  account_holder_name: string
}

export interface GiroResponse {
  payment_id: string
  reference: string
  amount: number
  bank_name: string
  mandate_ref: string
  status: string
  message: string
}

export interface Payment {
  id: string
  user_id: string
  amount: number
  payment_type: string
  status: string
  reference: string
  created_at: string
  period_month?: number | null
  period_year?: number | null
}

export const payments = {
  generatePayNow: (params: { amount?: number; period_month: number; period_year: number }) =>
    request<PayNowResponse>("/api/payments/paynow", {
      method: "POST",
      body: JSON.stringify(params),
    }),
  setupGiro: (payload: GiroPayload) =>
    request<GiroResponse>("/api/payments/giro", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  confirm: (paymentId: string) =>
    request<{ ok: boolean; status: string }>(
      `/api/payments/${paymentId}/confirm`,
      { method: "POST" }
    ),
  list: () => request<Payment[]>("/api/payments"),
}
