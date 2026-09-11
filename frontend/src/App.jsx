import { Link, Route, Routes } from 'react-router-dom'

import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'

function Home() {
  return <h2>VetBridge</h2>
}

function Dashboard() {
  return <h2>My Claims</h2>
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