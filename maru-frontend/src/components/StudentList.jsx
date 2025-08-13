import React, { useEffect, useState } from 'react'
import StudentForm from './StudentForm'
const API_BASE = 'http://localhost/maru/public/api' // change if needed

export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function loadAll() {
    setLoading(true)
    const res = await fetch(`${API_BASE}/students`)
    const data = await res.json()
    setStudents(data)
    setLoading(false)
  }

  useEffect(()=>{ loadAll() }, [])

  async function doSearch(e) {
    e && e.preventDefault()
    if (!q) return loadAll()
    setLoading(true)
    const res = await fetch(`${API_BASE}/students/search/${encodeURIComponent(q)}`)
    const data = await res.json()
    setStudents(data)
    setLoading(false)
  }

  async function doDelete(id) {
    if (!confirm('Delete this student?')) return
    const res = await fetch(`${API_BASE}/students/${id}`, { method: 'DELETE' })
    if (res.ok) setStudents(prev => prev.filter(s => s.StudentID !== id))
    else alert('Delete failed')
  }

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(s) { setEditing(s); setShowForm(true) }

  return (
    <div>
      <h2>Students</h2>
      <div style={{marginBottom:10}}>
        <form onSubmit={doSearch} style={{display:'inline-block', marginRight:12}}>
          <input type="text" placeholder="Search by name..." value={q} onChange={e=>setQ(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <button onClick={()=>{ setQ(''); loadAll() }}>Reset</button>
        <button onClick={openCreate} style={{marginLeft:12}}>+ Add Student</button>
      </div>

      {showForm && <StudentForm initial={editing} onSaved={() => { setShowForm(false); loadAll(); }} onCancel={() => setShowForm(false)} />}

      {loading ? <div className="small">Loading...</div> :
        students.length === 0 ? <div className="small">No students.</div> :
        <table>
          <thead><tr><th>ID</th><th>Name</th><th>DOB</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {students.map(s => (
              <tr key={s.StudentID}>
                <td>{s.StudentID}</td>
                <td>{s.FirstName} {s.LastName}</td>
                <td>{s.DateOfBirth}</td>
                <td>{s.JoinDate}</td>
                <td>
                  <button onClick={()=>openEdit(s)}>Edit</button>{' '}
                  <button onClick={()=>doDelete(s.StudentID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  )
}
