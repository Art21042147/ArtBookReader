import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ProtectedRoute from './ProtectedRoute'
import Reader from './pages/Reader'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/reader" element={
        <ProtectedRoute>
          <Reader />
        </ProtectedRoute>
      } />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
    </Routes>
  )
}

export default App
