/**
 * Root component – sets up routing, authentication context, navbar, and toast.
 * Protected routes redirect unauthenticated users to /login.
 */
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, AuthContext } from './features/auth/authContext'
import Navbar from './components/Navbar'
import Toast from './components/Toast'
import Login from './features/auth/Login'
import Register from './features/auth/Register'
import MapView from './features/map/MapView'
import CourtDetail from './features/booking/CourtDetail'
import MyBookings from './features/booking/MyBookings'

// Simple wrapper that checks for a token and redirects if missing
function ProtectedRoute({ children }) {
  const { token } = React.useContext(AuthContext)
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen flex flex-col bg-base text-text-primary">
          <Navbar />
          <Toast />
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MapView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/courts/:id"
                element={
                  <ProtectedRoute>
                    <CourtDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute>
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              {/* Fallback – redirect unknown routes to home or login */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  )
}
