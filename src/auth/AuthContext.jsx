import { createContext, useContext, useState, useCallback } from 'react'

const SESSION_KEY = 'factoryos-session'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(SESSION_KEY))
    } catch {
      return null
    }
  })

  const signIn = useCallback(u => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(u))
    setUser(u)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

/** Landing route per role — each person opens the app on their own screen. */
export function homeFor(role) {
  switch (role) {
    case 'owner': return '/'
    case 'operations': return '/orders'
    case 'production': return '/orders'
    case 'lab': return '/orders'
    case 'driver': return '/orders'
    case 'engineering': return '/equipment'
    case 'accountant': return '/reports'
    default: return '/orders'
  }
}
