import React, { createContext, useState, useEffect, useMemo } from 'react'
import jwtDecode from 'jwt-decode'
import toast from 'react-hot-toast'

// Create context
export const AuthContext = createContext({
  token: null,
  user: null,
  login: () => {},
  logout: () => {},
})

/**
 * AuthProvider – manages JWT token in localStorage and provides helper
 * functions to log in and out. It also extracts the user email from the token
 * payload (the ``sub`` claim) for quick access.
 */
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'))
  const [user, setUser] = useState(null)

  // Decode token to get user email (if token present)
  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token)
        setUser({ email: decoded.sub })
      } catch (e) {
        console.error('Failed to decode token', e)
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }, [token])

  const login = (newToken) => {
    localStorage.setItem('token', newToken)
    setToken(newToken)
    toast.success('Logged in successfully')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    toast.success('Logged out')
  }

  const value = useMemo(
    () => ({ token, user, login, logout }),
    [token, user]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
