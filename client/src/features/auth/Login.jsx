import React, { useState, useContext } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../../services/api'
import Input from '../../components/Input'
import Button from '../../components/Button'
import { AuthContext } from './authContext'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useContext(AuthContext)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await api.post('/auth/login', { email, password })
      login(res.data.access_token)
      navigate('/')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Login failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base text-text-primary">
      <div className="w-full max-w-sm space-y-6">
        <h2 className="text-2xl font-bold text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Logging in…' : 'Login'}
          </Button>
        </form>
        <p className="text-center text-sm">
          Don’t have an account?{' '}
          <Link to="/register" className="text-accent-green hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  )
}
