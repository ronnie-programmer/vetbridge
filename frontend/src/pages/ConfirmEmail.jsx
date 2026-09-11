import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { useAuth } from '../context/AuthContext'

export default function ConfirmEmail() {
  const { token } = useParams()
  const { confirm } = useAuth()
  const [state, setState] = useState('working')

  useEffect(() => {
    confirm(token)
      .then(() => setState('done'))
      .catch(() => setState('failed'))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  if (state === 'working') {
    return <p>Confirming your account...</p>
  }

  if (state === 'failed') {
    return (
      <div>
        <h2>That link did not work</h2>
        <p>It may have already been used.</p>
        <Link to="/register">Sign up again</Link>
      </div>
    )
  }

  return (
    <div>
      <h2>Your account is confirmed</h2>
      <Link to="/login">Log in</Link>
    </div>
  )
}