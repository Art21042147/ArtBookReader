import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import api from './axios'

export default function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('profile/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading...</p>

  return user ? children : <Navigate to="/login" replace />
}
