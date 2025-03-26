import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axios'

export default function Home() {
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/profile/')
      .then(() => {
        navigate('/reader')
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-8xl font-bold opacity-50 mb-12">ArtBookReader</h1>
      {!loading && (
        <div className="flex gap-6">
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded"
          >
            Log In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded"
          >
            Add User
          </button>
        </div>
      )}
    </div>
  )
}
