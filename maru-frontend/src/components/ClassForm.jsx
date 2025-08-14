import React, { useEffect, useState } from 'react'
const API_BASE = 'http://localhost/maru/public/api' // change if needed

export default function ClassForm({ initial, onSaved, onCancel }) {
  const [level, setLevel] = useState(initial?.Level || 'Beginner')
  const [day, setDay] = useState(initial?.DayOfWeek || 'Monday')
  const [time, setTime] = useState(initial?.Time || '17:00:00')
  const [location, setLocation] = useState(initial?.Location || '')
  const [instructorId, setInstructorId] = useState(initial?.InstructorID || '')
  const [instructors, setInstructors] = useState([])
  const editing = !!initial

  useEffect(()=> {
    async function loadInstructors() {
      try {
        const res = await fetch(`${API_BASE}/students`)
        const data = await res.json()
        setInstructors(data)
      } catch (e) {
        setInstructors([])
      }
    }
    loadInstructors()
  }, [])

  async function submit(e) {
    e.preventDefault()
    const payload = { Level:level, DayOfWeek:day, Time:time, Location:location, InstructorID: instructorId ? Number(instructorId) : null }
    try {
      if (editing) {
        const res = await fetch(`${API_BASE}/classes/${initial.ClassID}`, {
          method: 'PUT',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Update failed')
      } else {
        const res = await fetch(`${API_BASE}/classes`, {
          method: 'POST',
          headers: {'Content-Type':'application/json'},
          body: JSON.stringify(payload)
        })
        if (!res.ok) throw new Error('Create failed')
      }
      onSaved && onSaved()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <form onSubmit={submit} style={{marginTop:10}}>
      <label>Level
        <select value={level} onChange={e=>setLevel(e.target.value)}>
          <option>Beginner</option><option>Intermediate</option><option>Advanced</option>
        </select>
      </label><br/>
      <label>Day
        <select value={day} onChange={e=>setDay(e.target.value)}>
          <option>Monday</option><option>Tuesday</option><option>Wednesday</option>
          <option>Thursday</option><option>Friday</option><option>Saturday</option><option>Sunday</option>
        </select>
      </label><br/>
      <label>Time <input type="time" value={time} onChange={e=>setTime(e.target.value)} required /></label><br/>
      <label>Location <input value={location} onChange={e=>setLocation(e.target.value)} required /></label><br/>
      <label>Instructor
        <select value={instructorId} onChange={e=>setInstructorId(e.target.value)}>
          <option value=''>(none)</option>
          {instructors.map(i => <option key={i.StudentID} value={i.StudentID}>{i.FirstName} {i.LastName}</option>)}
        </select>
      </label>
      <div style={{marginTop:8}}>
        <button type="submit">{editing ? 'Save' : 'Create'}</button>{' '}
        <button type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
