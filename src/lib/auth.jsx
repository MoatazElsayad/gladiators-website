/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { fetchJson } from './api'

const AuthContext = createContext(null)
const tokenStorageKey = 'gladiators_auth_token'

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(tokenStorageKey) || '')
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setPlayer(null)
      setLoading(false)
      localStorage.removeItem(tokenStorageKey)
      return undefined
    }

    let cancelled = false
    localStorage.setItem(tokenStorageKey, token)

    async function loadSession() {
      setLoading(true)
      try {
        const payload = await fetchJson('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        if (!cancelled) {
          setPlayer(payload.player || null)
        }
      } catch (error) {
        if (!cancelled) {
          setToken('')
          setPlayer(null)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadSession()

    return () => {
      cancelled = true
    }
  }, [token])

  const value = useMemo(() => {
    const applyAuthPayload = (payload) => {
      setToken(payload.token || '')
      setPlayer(payload.player || null)
    }

    return {
      token,
      player,
      loading,
      isAuthenticated: Boolean(token && player),
      login: async ({ identity, password }) => {
        const payload = await fetchJson('/api/auth/login', {
          method: 'POST',
          body: JSON.stringify({ identity, password })
        })
        applyAuthPayload(payload)
        return payload.player
      },
      register: async ({ email, username, password }) => {
        const payload = await fetchJson('/api/auth/register', {
          method: 'POST',
          body: JSON.stringify({ email, username, password })
        })
        applyAuthPayload(payload)
        return payload.player
      },
      logout: () => {
        setToken('')
        setPlayer(null)
        localStorage.removeItem(tokenStorageKey)
      }
    }
  }, [loading, player, token])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const value = useContext(AuthContext)
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.')
  }
  return value
}
