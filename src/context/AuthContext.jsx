import { createContext, useContext, useCallback, useEffect, useState } from 'react'
import {
  registerUser,
  loginUser,
  logoutUser,
  validateToken,
} from '../services/authApi'

const TOKEN_KEY = 'furnihub_token'
const USER_KEY = 'furnihub_user'

function readStoredSession() {
  try {
    const token = localStorage.getItem(TOKEN_KEY)
    const rawUser = localStorage.getItem(USER_KEY)
    return token && rawUser ? { token, user: JSON.parse(rawUser) } : null
  } catch {
    return null
  }
}

function mapUser(data) {
  return {
    id: data.userId,
    fullName: data.fullName,
    role: data.role,
    email: data.email,
  }
}

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  const [initializing, setInitializing] = useState(true)

  useEffect(() => {
    const session = readStoredSession()
    if (!session) {
      setInitializing(false)
      return
    }
    setToken(session.token)
    setUser(session.user)
    validateToken(session.token)
      .then((data) => {
        setUser((prev) => ({ ...prev, ...mapUser(data) }))
        localStorage.setItem(USER_KEY, JSON.stringify({ ...session.user, ...mapUser(data) }))
      })
      .catch(() => {
        setToken(null)
        setUser(null)
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(USER_KEY)
      })
      .finally(() => setInitializing(false))
  }, [])

  const register = useCallback(async (payload) => {
    const data = await registerUser(payload)
    return data
  }, [])

  const login = useCallback(async (payload, remember = false) => {
    const data = await loginUser(payload)
    const mapped = mapUser(data)
    setToken(data.token)
    setUser(mapped)
    if (remember) {
      localStorage.setItem(TOKEN_KEY, data.token)
      localStorage.setItem(USER_KEY, JSON.stringify(mapped))
    } else {
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    }
    return data
  }, [])

  const logout = useCallback(async () => {
    if (token) {
      try {
        await logoutUser(token)
      } catch {
        // ignore network errors on logout
      }
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
  }, [token])

  const isAuthenticated = Boolean(token)

  return (
    <AuthContext.Provider
      value={{ user, token, isAuthenticated, initializing, register, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
