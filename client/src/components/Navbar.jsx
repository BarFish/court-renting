/**
 * Dark‑mode navigation bar.
 * Shows the app name and navigation links (Map, My Bookings).
 * Includes a Logout button that clears the auth token via AuthContext.
 */
import React, { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import Button from './Button'
import { AuthContext } from '../features/auth/authContext'

export default function Navbar() {
  const { token, logout } = useContext(AuthContext)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="flex items-center justify-between p-4 bg-base border-b border-white/10">
      <div className="text-xl font-semibold text-text-primary">Court Renter</div>
      {token && (
        <div className="flex items-center space-x-4">
          <Link to="/" className="text-text-primary hover:text-accent-green">
            Map
          </Link>
          <Link to="/my-bookings" className="text-text-primary hover:text-accent-green">
            My Bookings
          </Link>
          <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-1">
            <LogOut size={18} />
            <span>Logout</span>
          </Button>
        </div>
      )}
    </nav>
  )
}
