import React, { useEffect, useState } from 'react'
const API_BASE = 'http://localhost/maru/api'

export default function StudentForm({ initial, onSaved, onCancel }) {
  const [studentID, setStudentID] = useState(initial?.StudentID || '')
  const [first, setFirst] = useState(initial?.FirstName || '')
  const [last, setLast] = useState(initial?.LastName || '')
  const [dob, setDob] = useState(initial?.DateOfBirth || '')
  const [join, setJoin] = useState(initial?.JoinDate || '')
  const editing = !!initial

  useEffect(()=> {
    if (initial) {
      setStudentID(initial.StudentID)
      setFirst(initial.FirstName)
      setLast(initial.LastName)
      setDob(initial.DateOfBirth)
      setJoin(initial.JoinDate)
    }
  }, [initial])

  async function submit(e) {
    e.preventDefault()
    const payload = { FirstName:first, LastName:last, DateOfBirth:dob, JoinDate:join }
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/students/${studentID}`, {
          method: 'PUT',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Update failed')
      } else {
        const res = await fetch(`${API_BASE}/students`, {
          method: 'POST',
          headers: { 'Content-Type':'application/json' },
          body: JSON.stringify(payload)
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data?.error || 'Insert failed')
      }
      onSaved && onSaved()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={submit} style={{marginTop:10}}>
      <div>
        <label>Student ID</label><br />
        <input type="text" value={studentID} readOnly={editing} onChange={e => setStudentID(e.target.value)} placeholder={editing ? '' : 'Assigned by database'} />
      </div>
      <div>
        <input placeholder="First name" value={first} onChange={e=>setFirst(e.target.value)} required />
      </div>
      <div>
        <input placeholder="Last name" value={last} onChange={e=>setLast(e.target.value)} required />
      </div>
      <div>
        <label>DOB</label><br />
        <input type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
      </div>
      <div>
        <label>Join Date</label><br />
        <input type="date" value={join} onChange={e=>setJoin(e.target.value)} required />
      </div>
      <div style={{marginTop:8}}>
        <button type="submit">{editing ? 'Save' : 'Create'}</button>{' '}
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}

