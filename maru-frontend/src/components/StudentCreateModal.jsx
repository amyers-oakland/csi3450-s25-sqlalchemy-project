import React, { useMemo, useState } from 'react'

const API_BASE = 'http://localhost/api'

export default function StudentCreateModal({ onClose, onCreated }) {
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [dob, setDob] = useState('')
  const [join, setJoin] = useState(new Date().toISOString().slice(0, 10))
  const [rankId, setRankId] = useState(1)
  const [isInstructor, setIsInstructor] = useState(false)
  const [status, setStatus] = useState('Volunteer')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const beltOptions = useMemo(() => ([
    { id: 1, label: 'White Belt' },
    { id: 2, label: 'Yellow Belt' },
    { id: 3, label: 'Green Belt' },
    { id: 4, label: 'Blue Belt' },
    { id: 5, label: 'Brown Belt' },
  ]), [])

  async function handleCreate(e) {
    e && e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const payload = {
        FirstName: first.trim(),
        LastName: last.trim(),
        DateOfBirth: dob,
        JoinDate: join,
        RankID: Number(rankId),
        instructor: isInstructor ? 'true' : 'false',
      }
      if (isInstructor) {
        payload.Status = status
      }

      const res = await fetch(`${API_BASE}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        const msg = data?.error || (data?.errors && JSON.stringify(data.errors)) || 'Failed to create student'
        throw new Error(msg)
      }
      onCreated && onCreated(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{position:'fixed', inset:0, zIndex:50}}>
      <div onClick={onClose} className="modal-overlay" />
      <div role="dialog" aria-modal="true" className="modal-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8}}>
          <h3 style={{margin:0}}>Create Student</h3>
          <button onClick={onClose} className="btn">✕</button>
        </div>

        <form onSubmit={handleCreate}>
          <div className="modal-grid">
            <div>
              <label className="label">First Name</label>
              <input className="input" value={first} onChange={e=>setFirst(e.target.value)} required placeholder="First name" />
            </div>
            <div>
              <label className="label">Last Name</label>
              <input className="input" value={last} onChange={e=>setLast(e.target.value)} required placeholder="Last name" />
            </div>
            <div>
              <label className="label">Date of Birth</label>
              <input className="input" type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
            </div>
            <div>
              <label className="label">Join Date</label>
              <input className="input" type="date" value={join} onChange={e=>setJoin(e.target.value)} required />
            </div>
            <div>
              <label className="label">Initial Rank</label>
              <select className="select" value={rankId} onChange={e=>setRankId(Number(e.target.value))}>
                {beltOptions.map(o => (
                  <option key={o.id} value={o.id}>{o.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Instructor</label>
              <div className="checkbox-row">
                <input id="inst" type="checkbox" checked={isInstructor} onChange={e=>setIsInstructor(e.target.checked)} />
                <label htmlFor="inst">Mark as instructor</label>
              </div>
            </div>
            {isInstructor && (
              <div style={{gridColumn:'1 / -1'}}>
                <label className="label">Status</label>
                <div className="radio-row">
                  <label style={{display:'flex', alignItems:'center', gap:6}}>
                    <input type="radio" name="status" value="Volunteer" checked={status==='Volunteer'} onChange={()=>setStatus('Volunteer')} /> Volunteer
                  </label>
                  <label style={{display:'flex', alignItems:'center', gap:6}}>
                    <input type="radio" name="status" value="Compensated" checked={status==='Compensated'} onChange={()=>setStatus('Compensated')} /> Compensated
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && <div style={{color:'red', marginTop:10}}>{error}</div>}

          <div className="button-row">
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


