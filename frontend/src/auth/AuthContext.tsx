import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
<<<<<<< HEAD
import { api, ApiError, type AuthResponse } from '../api'
import { AuthContext, type AuthContextValue, type AuthUser, type LoginResult } from './auth-context'
import type { Permission, UserRole } from './permissions'
import {
  clearStoredSession,
  dispatchSessionEvent,
  readStoredSession,
  SESSION_EXPIRED_EVENT,
  SESSION_UPDATED_EVENT,
  type StoredSession,
  writeStoredSession,
} from './session'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readStoredSession())
  const activeRefreshToken = session?.refreshToken

  const logout = useCallback(async () => {
    const current = readStoredSession()
    try {
      if (current) await api.logout(current.refreshToken)
    } catch {
      // Local revocation still applies if the API is temporarily unavailable.
    }
    clearStoredSession()
=======
import { AuthContext, type AuthContextValue, type AuthUser, type LoginResult } from './auth-context'
import { demoAccounts, demoPassword } from './demoAccounts'
import { permissionsForRole, roleLabels } from './permissions'

const LOCAL_SESSION_KEY = 'siih.auth.local'
const TAB_SESSION_KEY = 'siih.auth.tab'
type StoredSession = {
  user: AuthUser
  expiresAt: number
  persistent: boolean
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<StoredSession | null>(() => readSession())

  const logout = useCallback(() => {
    localStorage.removeItem(LOCAL_SESSION_KEY)
    sessionStorage.removeItem(TAB_SESSION_KEY)
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
    setSession(null)
  }, [])

  useEffect(() => {
    if (!session) return
<<<<<<< HEAD
    const remaining = Date.parse(session.refreshTokenExpiresAt) - Date.now()
    if (remaining <= 0) {
      void logout()
      return
    }
    const timeout = window.setTimeout(() => void logout(), Math.min(remaining, 2_147_000_000))
=======
    const remaining = session.expiresAt - Date.now()
    if (remaining <= 0) {
      logout()
      return
    }
    const timeout = window.setTimeout(logout, Math.min(remaining, 2_147_000_000))
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
    return () => window.clearTimeout(timeout)
  }, [logout, session])

  useEffect(() => {
<<<<<<< HEAD
    const syncSession = () => setSession(readStoredSession())
    const expireSession = () => setSession(null)
    window.addEventListener('storage', syncSession)
    window.addEventListener(SESSION_UPDATED_EVENT, syncSession)
    window.addEventListener(SESSION_EXPIRED_EVENT, expireSession)
    return () => {
      window.removeEventListener('storage', syncSession)
      window.removeEventListener(SESSION_UPDATED_EVENT, syncSession)
      window.removeEventListener(SESSION_EXPIRED_EVENT, expireSession)
    }
  }, [])

  useEffect(() => {
    if (!activeRefreshToken) return
    let active = true
    api.getMe().then((user) => {
      if (!active) return
      const current = readStoredSession()
      if (!current) return
      const normalized = normalizeUser(user)
      writeStoredSession({ ...current, user: normalized }, current.persistent)
      setSession({ ...current, user: normalized })
    }).catch(() => undefined)
    return () => { active = false }
  }, [activeRefreshToken])

  const login = useCallback(async (username: string, password: string, remember: boolean): Promise<LoginResult> => {
    try {
      const response = await api.login(username.trim(), password, remember)
      const stored = toStoredSession(response, remember)
      writeStoredSession(stored, remember)
      setSession(stored)
      dispatchSessionEvent(SESSION_UPDATED_EVENT)
      return { ok: true }
    } catch (reason) {
      return {
        ok: false,
        message: reason instanceof ApiError ? reason.message : 'No se pudo verificar el acceso con el backend.',
      }
    }
=======
    const syncSession = () => setSession(readSession())
    window.addEventListener('storage', syncSession)
    return () => window.removeEventListener('storage', syncSession)
  }, [])

  const login = useCallback(async (username: string, password: string, remember: boolean): Promise<LoginResult> => {
    await new Promise((resolve) => window.setTimeout(resolve, 320))
    const account = demoAccounts.find((candidate) => candidate.username === username.trim().toLowerCase())
    if (!account || password !== demoPassword) {
      return { ok: false, message: 'Usuario o contraseña incorrectos.' }
    }

    const user: AuthUser = {
      ...account,
      roleLabel: roleLabels[account.role],
      permissions: permissionsForRole(account.role),
    }
    const stored: StoredSession = {
      user,
      expiresAt: Date.now() + (remember ? 7 * 24 * 60 * 60 * 1000 : 8 * 60 * 60 * 1000),
      persistent: remember,
    }
    localStorage.removeItem(LOCAL_SESSION_KEY)
    sessionStorage.removeItem(TAB_SESSION_KEY)
    const storage = remember ? localStorage : sessionStorage
    storage.setItem(remember ? LOCAL_SESSION_KEY : TAB_SESSION_KEY, JSON.stringify(stored))
    setSession(stored)
    return { ok: true }
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user: session?.user ?? null,
    login,
    logout,
    hasPermission: (permission) => Boolean(session?.user.permissions.includes(permission)),
  }), [login, logout, session])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

<<<<<<< HEAD
function toStoredSession(response: AuthResponse, persistent: boolean): StoredSession {
  return {
    accessToken: response.accessToken,
    refreshToken: response.refreshToken,
    accessTokenExpiresAt: response.accessTokenExpiresAt,
    refreshTokenExpiresAt: response.refreshTokenExpiresAt,
    user: normalizeUser(response.user),
    persistent,
  }
}

function normalizeUser(user: AuthResponse['user']): AuthUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    department: user.department,
    role: user.role as UserRole,
    roleLabel: user.roleLabel,
    permissions: user.permissions as Permission[],
  }
=======
function readSession(): StoredSession | null {
  for (const [storage, key] of [[sessionStorage, TAB_SESSION_KEY], [localStorage, LOCAL_SESSION_KEY]] as const) {
    try {
      const value = storage.getItem(key)
      if (!value) continue
      const parsed = JSON.parse(value) as StoredSession
      if (parsed.expiresAt > Date.now() && parsed.user?.role) return parsed
      storage.removeItem(key)
    } catch {
      storage.removeItem(key)
    }
  }
  return null
>>>>>>> 2da726a44e5e1079ea0eccff3c60bd33c25b5e06
}
