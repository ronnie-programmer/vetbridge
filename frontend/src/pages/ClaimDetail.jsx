import FacilitySearch from '../components/FacilitySearch'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import api from '../api'

export default function ClaimDetail() {
  const { id } = useParams()
  const [claim, setClaim] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [scheduledFor, setScheduledFor] = useState('')
  const [facilityName, setFacilityName] = useState('')
  const [facilityAddress, setFacilityAddress] = useState('')

  async function loadClaim() {
    try {
      const response = await api.get(`/claims/${id}/`)
      setClaim(response.data)
    } catch (err) {
      if (err.response?.status === 404) {
        setError('That claim does not exist, or it is not yours.')
      } else {
        setError('Could not load that claim.')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadClaim()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function handleCreate(event) {
    event.preventDefault()
    setError('')
    try {
      await api.post('/appointments/', {
        claim: claim.id,
        title: title,
        scheduled_for: new Date(scheduledFor).toISOString(),
        facility_name: facilityName,
        facility_address: facilityAddress,
      })
      setTitle('')
      setScheduledFor('')
      setFacilityName('')
      setFacilityAddress('')
      loadClaim()
    } catch (err) {
      const data = err.response?.data
      setError(data ? Object.values(data).flat().join(' ') : 'Could not save.')
    }
  }

  async function handleRename(appointment) {
    const newTitle = window.prompt('New title', appointment.title)
    if (!newTitle) {
      return
    }
    setError('')
    try {
      await api.patch(`/appointments/${appointment.id}/`, { title: newTitle })
      loadClaim()
    } catch {
      setError('Could not update that appointment.')
    }
  }

  async function handleDelete(appointment) {
    if (!window.confirm(`Delete ${appointment.title}?`)) {
      return
    }
    setError('')
    try {
      await api.delete(`/appointments/${appointment.id}/`)
      loadClaim()
    } catch {
      setError('Could not delete that appointment.')
    }
  }

  if (loading) {
    return <p>Loading...</p>
  }

  if (!claim) {
    return (
      <div>
        <p style={{ color: 'red' }}>{error}</p>
        <Link to="/dashboard">Back to my claims</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/dashboard">&larr; Back to my claims</Link>
      <h2>{claim.benefit_name}</h2>
      <p>Status: {claim.status}</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleCreate}>
        <h3>Add an appointment</h3>
        <div>
          <label htmlFor="title">What is it</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="C&P exam"
            required
          />
        </div>
        <div>
          <label htmlFor="scheduled_for">When</label>
          <input
            id="scheduled_for"
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="facility_name">Facility</label>
          <input
            id="facility_name"
            value={facilityName}
            onChange={(e) => setFacilityName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="facility_address">Address</label>
          <input
            id="facility_address"
            value={facilityAddress}
            onChange={(e) => setFacilityAddress(e.target.value)}
          />
        </div>
        <FacilitySearch
            onPick={(name, address) => {
                setFacilityName(name)
                setFacilityAddress(address)
            }}
          />
        <button type="submit">Add appointment</button>
      </form>

      <hr />

      {claim.appointments.length === 0 ? (
        <p>No appointments on this claim yet.</p>
      ) : (
        <ul>
          {claim.appointments.map((appointment) => (
            <li key={appointment.id}>
              <strong>{appointment.title}</strong>
              {' - '}
              {new Date(appointment.scheduled_for).toLocaleString()}
              {appointment.facility_name && <div>{appointment.facility_name}</div>}
              {appointment.facility_address && (
                <div>{appointment.facility_address}</div>
              )}
              <button onClick={() => handleRename(appointment)}>rename</button>{' '}
              <button onClick={() => handleDelete(appointment)}>delete</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}