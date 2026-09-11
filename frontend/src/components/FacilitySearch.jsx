import { useState } from 'react'
import axios from 'axios'

export default function FacilitySearch({ onPick }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  async function handleSearch() {
    if (!query.trim()) {
      return
    }
    setSearching(true)
    setError('')
    setResults([])

    try {
      // plain axios, not our api instance - we do not want to send
      // our JWT to someone else's server
      const response = await axios.get(
        'https://nominatim.openstreetmap.org/search',
        {
          params: {
            format: 'json',
            limit: 5,
            q: `veterans affairs ${query}`,
          },
        },
      )
      if (response.data.length === 0) {
        setError('No VA facilities found for that search.')
      }
      setResults(response.data)
    } catch {
      setError('Could not reach the facility search right now.')
    } finally {
      setSearching(false)
    }
  }

  return (
    <div>
      <h4>Find a VA facility</h4>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Dallas TX or 75001"
      />{' '}
      <button type="button" onClick={handleSearch} disabled={searching}>
        {searching ? 'Searching...' : 'Search'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {results.length > 0 && (
        <ul>
          {results.map((result) => (
            <li key={result.place_id}>
              {result.display_name}{' '}
              <button
                type="button"
                onClick={() =>
                  onPick(
                    result.name || result.display_name.split(',')[0],
                    result.display_name,
                  )
                }
              >
                use this
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}