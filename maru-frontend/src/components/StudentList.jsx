import React, { useEffect, useState } from 'react'
import StudentForm from './StudentForm'
import StudentCreateModal from './StudentCreateModal'
const API_BASE = 'http://localhost/api';


export default function StudentList() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [showCreate, setShowCreate] = useState(false)

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

  function openCreate() { setEditing(null); setShowCreate(true) }
  function openEdit(s) { setEditing(s); setShowForm(true) }

  return (
    <div>
      <h2>Students</h2>
      <div style={{marginBottom:10, display:'flex', alignItems:'center', gap:8, flexWrap:'wrap'}}>
        <form onSubmit={doSearch} style={{display:'flex', alignItems:'center', gap:8}}>
          <input type="text" placeholder="Search by name..." value={q} onChange={e=>setQ(e.target.value)} style={{ padding:'10px 12px', borderRadius:10, border:'1px solid #e5e7eb', minWidth:320 }} />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <button className="btn" onClick={()=>{ setQ(''); loadAll() }}>Reset</button>
        <button className="btn btn-primary" onClick={openCreate}>+ Add Student</button>
      </div>

      {showForm && <StudentForm initial={editing} onSaved={() => { setShowForm(false); loadAll(); }} onCancel={() => setShowForm(false)} />}
      {showCreate && (
        <StudentCreateModal
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); loadAll() }}
        />
      )}

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
                  <button className="btn btn-primary" onClick={()=>openEdit(s)}>Edit</button>{' '}
                  <button className="btn btn-danger" onClick={()=>doDelete(s.StudentID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  )
}
