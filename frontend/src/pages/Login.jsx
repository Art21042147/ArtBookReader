import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../axios'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await api.post('login/', { username, password })
      navigate('/reader')
    } catch (err) {
      setError('Incorrect login or password')
    }
  }

  return (
    <div className="h-screen bg-gray-950 text-white flex flex-col items-center justify-center px-4 text-center">
        <div className="flex flex-col items-center opacity-50">
          <h1 className="text-8xl font-bold">ArtBookReader</h1>
            <img
              src="/static/logo.svg"
              alt="Logo"
              className="mt-6 h-96 mx-auto invert brightness-[0.5]"
            />
        </div>
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">🔐 Log In</h2>
        {error && <p className="text-red-600 mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="User Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700 placeholder-gray-400"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded bg-gray-800 border-gray-700 placeholder-gray-400"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white p-2 rounded"
          >
            Log In
          </button>
        </form>
      </div>
    </div>
  )
}
