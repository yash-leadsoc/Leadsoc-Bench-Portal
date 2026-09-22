import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { api } from '../api/api'
import { setToken, getToken } from '../api/client'

type User = Record<string, any> | null
interface AuthCtx {
  user: User; unread: number; loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  refresh: () => Promise<void>
  setUser: (u: User) => void
}
const Ctx = createContext<AuthCtx>(null as any)
export const useAuth = () => useContext(Ctx)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null)
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  const refresh = async () => {
    const boot = await api.bootstrap()
    setUser(boot.user)
    setUnread(boot.unreadNotifications || 0)
  }
  const login = async (email: string, password: string) => {
    const res = await api.login(email.trim().toLowerCase(), password)
    setToken(res.access_token)
    setUser(res.user)
    if (!res.user.mustChangePassword) await refresh()
  }
  const logout = () => { setToken(null); setUser(null); setUnread(0) }

  useEffect(() => {
    (async () => {
      if (getToken()) { try { await refresh() } catch { setToken(null) } }
      setLoading(false)
    })()
  }, [])

  return <Ctx.Provider value={{ user, unread, loading, login, logout, refresh, setUser }}>{children}</Ctx.Provider>
}
