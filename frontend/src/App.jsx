import { Link, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import ConfirmEmail from './pages/ConfirmEmail'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'

function Home() {
  return <h2>VetBridge</h2>
}

export default function App() {
  const { isLoggedIn, logout } = useAuth()

  return (
    <div>
      <nav>
        <Link to="/">Home</Link>{' '}
        <Link to="/dashboard">Dashboard</Link>{' '}
        {isLoggedIn ? (
          <button onClick={logout}>Log out</button>
        ) : (
          <>
            <Link to="/login">Log in</Link> <Link to="/register">Sign up</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm/:token" element={<ConfirmEmail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}