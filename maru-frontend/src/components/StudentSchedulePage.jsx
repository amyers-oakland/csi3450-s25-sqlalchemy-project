import React, { useEffect, useMemo, useState } from 'react'
import bgUrl from '../assets/blurry_background.svg'

const API_BASE = 'http://localhost/api'

export default function StudentSchedulePage({ studentId }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!studentId) return
      try {
        setLoading(true)
        setError('')
        const res = await fetch(`${API_BASE}/students/${studentId}/schedule`)
        if (!res.ok) throw new Error(`Request failed (${res.status})`)
        const data = await res.json()
        setItems(Array.isArray(data) ? data : [])
      } catch (e) {
        setError('Failed to load schedule')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [studentId])

  const subtitle = useMemo(() => {
    if (loading) return 'Loading…'
    if (error) return error
    if (!items.length) return 'No attendance records'
    return `${items.length} meeting${items.length === 1 ? '' : 's'}`
  }, [loading, error, items])

  function formatTime(t) {
    if (!t) return '-'
    try {
      const [h, m] = t.split(':').map(Number)
      const d = new Date()
      d.setHours(h, m || 0, 0, 0)
      return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    } catch {
      return t
    }
  }

  function formatDate(d) {
    if (!d) return '-'
    try {
      return new Date(d).toLocaleDateString()
    } catch {
      return d
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 12, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 0.5 }}>Student</div>
          <h2 style={{ margin: '4px 0 0 0' }}>ID #{studentId}</h2>
          <div style={{ color: '#6b7280', marginTop: 4 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { window.history.back() }} style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: 'white', cursor: 'pointer' }}>Back</button>
          <button disabled style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#f9fafb', color: '#9ca3af' }}>Export CSV</button>
        </div>
      </div>

      {loading ? (
        <div className="small">Loading schedule…</div>
      ) : error ? (
        <div style={{ color: '#b91c1c', background: '#fef2f2', border: '1px solid #fee2e2', padding: 12, borderRadius: 8 }}>{error}</div>
      ) : !items.length ? (
        <div className="small">No attendance records.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {items.map((it) => (
            <div key={it.MeetingID} style={{
              position: 'relative',
              border: '1px solid #e5e7eb',
              borderRadius: 12,
              padding: 12,
              background: 'transparent',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              isolation: 'isolate',
              minHeight: 0
            }}>
              <img
                src={bgUrl}
                alt=""
                aria-hidden="true"
                loading="eager"
                fetchpriority="high"
                decoding="async"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: 0.3,
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />
              <div style={{ position: 'relative', zIndex: 1, backdropFilter: 'saturate(1.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{
                  fontSize: 12,
                  padding: '2px 8px',
                  borderRadius: 9999,
                  background: '#eef2ff',
                  color: '#4338ca',
                  border: '1px solid #e0e7ff'
                }}>{it.Level}</span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>Class #{it.ClassID}</span>
              </div>

              <div style={{ fontWeight: 600 }}>{it.DayOfWeek} at {formatTime(it.Time)}</div>
              <div style={{ color: '#6b7280', marginTop: 2 }}>{formatDate(it.MeetingDate)}</div>

              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: 12, color: '#374151' }}>Location: <span style={{ fontWeight: 600 }}>{it.Location}</span></div>
                <div style={{ fontSize: 12, color: '#6b7280' }}>Meeting #{it.MeetingID}</div>
              </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


