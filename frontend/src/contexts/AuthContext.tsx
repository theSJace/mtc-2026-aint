import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"

export interface UserProfile {
  id: string
  nric: string
  full_name: string
  email: string
  phone: string
  address: string
  postal_code: string
  date_of_birth: string
  membership_status: "NOT_REGISTERED" | "PINTAR" | "PINTAR_PLUS"
  membership_id: string | null
  email_verified: boolean
  created_at: string
  preferred_language: "en" | "ms"
}

interface AuthContextValue {
  user: UserProfile | null
  token: string | null
  isLoading: boolean
  login: (token: string, user: UserProfile) => void
  logout: () => void
  refreshUser: (updated: UserProfile) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

const TOKEN_KEY = "sp_token"
const USER_KEY = "sp_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem(USER_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [isLoading, setIsLoading] = useState(false)

  const login = useCallback((tok: string, u: UserProfile) => {
    localStorage.setItem(TOKEN_KEY, tok)
    localStorage.setItem(USER_KEY, JSON.stringify(u))
    setToken(tok)
    setUser(u)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  const refreshUser = useCallback((updated: UserProfile) => {
    localStorage.setItem(USER_KEY, JSON.stringify(updated))
    setUser(updated)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be inside <AuthProvider>")
  return ctx
}
