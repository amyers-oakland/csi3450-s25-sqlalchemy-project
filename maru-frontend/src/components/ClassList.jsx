import React, { useEffect, useState } from 'react'
import ClassForm from './ClassForm'
const API_BASE = 'http://localhost/api' // change if needed

export default function ClassList() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  async function loadAll() {
    setLoading(true)
    const res = await fetch(`${API_BASE}/meetings`)
    const data = await res.json()
    setClasses(data)
    setLoading(false)
  }

  useEffect(()=> { loadAll() }, [])

  async function doSearch(e) {
    e && e.preventDefault()
    if (!q) return loadAll()
    setLoading(true)
    const res = await fetch(`${API_BASE}/classes/search/${encodeURIComponent(q)}`)
    const data = await res.json()
    setClasses(data)
    setLoading(false)
  }

  async function doDelete(id) {
    if (!confirm('Delete this class?')) return
    const res = await fetch(`${API_BASE}/classes/${id}`, { method: 'DELETE' })
    if (res.ok) setClasses(prev => prev.filter(c => c.ClassID !== id))
    else alert('Delete failed')
  }

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(c) { setEditing(c); setShowForm(true) }

  return (
    <div>
      <h2>Classes</h2>
      <div style={{marginBottom:10}}>
        <form onSubmit={doSearch} style={{display:'inline-block', marginRight:12}}>
          <input type="text" placeholder="Search classes..." value={q} onChange={e=>setQ(e.target.value)} />
          <button type="submit">Search</button>
        </form>
        <button onClick={()=>{ setQ(''); loadAll() }}>Reset</button>
        <button onClick={openCreate} style={{marginLeft:12}}>+ Add Class</button>
      </div>

      {showForm && <ClassForm initial={editing} onSaved={() => { setShowForm(false); loadAll(); }} onCancel={() => setShowForm(false)} />}

      {loading ? <div className="small">Loading...</div> :
        classes.length === 0 ? <div className="small">No classes.</div> :
        <table>
          <thead><tr><th>ID</th><th>Level</th><th>Day</th><th>Time</th><th>Location</th><th>Instructor</th><th></th></tr></thead>
          <tbody>
            {classes.map(c => (
              <tr key={c.ClassID}>
                <td>{c.ClassID}</td>
                <td>{c.Level}</td>
                <td>{c.DayOfWeek}</td>
                <td>{c.Time}</td>
                <td>{c.Location}</td>
                <td>{c.InstructorName || '-'}</td>
                <td>
                  <button onClick={()=>openEdit(c)}>Edit</button>{' '}
                  <button onClick={()=>doDelete(c.ClassID)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  )
}
