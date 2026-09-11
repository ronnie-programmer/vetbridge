import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import api from '../api'

const STATUSES = [
  'researching',
  'applied',
  'in_review',
  'approved',
  'denied',
]

export default function Dashboard() {
  const [claims, setClaims] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [benefitName, setBenefitName] = useState('')
  const [status, setStatus] = useState('researching')
  const [dateApplied, setDateApplied] = useState('')
  const [notes, setNotes] = useState('')

  async function loadClaims() {
    try {
      const response = await api.get('/claims/')
      setClaims(response.data)
    } catch {
      setError('Could not load your claims.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClaims()
  }, [])

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    try {
      await api.post('/claims/', {
        benefit_name: benefitName,
        status: status,
        date_applied: dateApplied || null,
        notes: notes,
      })
      setBenefitName('')
      setDateApplied('')
      setNotes('')
      loadClaims()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not save.')
    }
  }

  async function handleStatusChange(claim, newStatus) {
    setError('')
    try {
      await api.patch(`/claims/${claim.id}/`, { status: newStatus })
      loadClaims()
    } catch {
      setError('Could not update that claim.')
    }
  }

  async function handleDelete(claim) {
    if (!window.confirm(`Delete ${claim.benefit_name}?`)) {
      return
    }
    setError('')
    try {
      await api.delete(`/claims/${claim.id}/`)
      loadClaims()
    } catch {
      setError('Could not delete that claim.')
    }
  }

  if (loading) {
    return <p>Loading your claims...</p>
  }

  return (
    <div>
      <h2>My Claims</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleCreate}>
        <h3>Track a new benefit</h3>
        <div>
          <label htmlFor="benefit_name">Benefit</label>
          <input
            id="benefit_name"
            value={benefitName}
            onChange={(e) => setBenefitName(e.target.value)}
            placeholder="Post-9/11 GI Bill"
            required
          />
        </div>
        <div>
          <label htmlFor="status">Status</label>
          <select
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="date_applied">Date applied</label>
          <input
            id="date_applied"
            type="date"
            value={dateApplied}
            onChange={(e) => setDateApplied(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit">Add claim</button>
      </form>

      <hr />

      {claims.length === 0 ? (
        <p>You are not tracking any benefits yet.</p>
      ) : (
        <ul>
          {claims.map((claim) => (
            <li key={claim.id}>
              <strong>{claim.benefit_name}</strong>{' '}
              <select
                value={claim.status}
                onChange={(e) => handleStatusChange(claim, e.target.value)}
              >
                {STATUSES.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>{' '}
              <Link to={`/claims/${claim.id}`}>
                appointments ({claim.appointments.length})
              </Link>{' '}
              <button onClick={() => handleDelete(claim)}>delete</button>
              {claim.notes && <p>{claim.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}