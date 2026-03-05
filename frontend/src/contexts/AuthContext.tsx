import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'

export const TOKEN_KEY = 'flow_board_token'
export const AUTH_LOGOUT_EVENT = 'flow_board_auth_logout'

function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

/** Call on 401 to clear token and notify AuthProvider to re-render. */
export function clearToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY)
    window.dispatchEvent(new Event(AUTH_LOGOUT_EVENT))
  } catch {
    // ignore
  }
}

type AuthContextValue = {
  token: string | null
  setToken: (t: string | null) => void
  logout: () => void
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(getStoredToken)

  useEffect(() => {
    if (token === null) {
      localStorage.removeItem(TOKEN_KEY)
    } else {
      localStorage.setItem(TOKEN_KEY, token)
    }
  }, [token])

  useEffect(() => {
    const onLogout = () => setTokenState(null)
    window.addEventListener(AUTH_LOGOUT_EVENT, onLogout)
    return () => window.removeEventListener(AUTH_LOGOUT_EVENT, onLogout)
  }, [])

  const setToken = useCallback((t: string | null) => {
    setTokenState(t)
  }, [])

  const logout = useCallback(() => {
    setTokenState(null)
  }, [])

  const value: AuthContextValue = {
    token,
    setToken,
    logout,
    isAuthenticated: !!token,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function getToken(): string | null {
  return getStoredToken()
}
