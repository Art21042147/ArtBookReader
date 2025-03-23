import { useEffect, useState } from 'react'
import api from '../axios'

export default function Profile() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('profile/')
      .then(res => setUser(res.data))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">👤 Profile</h1>
      {loading && <p>Log In...</p>}
      {!loading && user && (
        <div>
          <p><strong>ID:</strong> {user.id}</p>
          <p><strong>User Name:</strong> {user.username}</p>
        </div>
      )}
      {!loading && !user && (
        <p className="text-red-600">You are not logged in</p>
      )}
    </div>
  )
}
