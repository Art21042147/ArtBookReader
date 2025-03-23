import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axios'

export default function Home() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await api.post('logout/')
    setUser(null)
    navigate('/login')
  }

  useEffect(() => {
    api.get('profile/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">🏠 Home</h1>
      {loading && <p>Loading...</p>}
      {!loading && user && (
        <p className="text-green-600">👋 Wellcome, {user.username}!</p>
      )}
      {!loading && !user && (
        <p className="text-red-600">You are not logged in</p>
      )}
      {user && (
       <button
         onClick={handleLogout}
         className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
       >
         Log Out
       </button>
       )}
    </div>
  )
}
