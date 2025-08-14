import React, { useEffect, useState } from 'react'
import ClassForm from './ClassForm'
const API_BASE = 'http://localhost/api' // we can change if need

export default function ClassList() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(false)
  const [q, setQ] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [editingMeeting, setEditingMeeting] = useState(null)
  const [newMeetingDate, setNewMeetingDate] = useState('')

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

  async function doDelete(meetingId) {
    if (!confirm('Delete this meeting?')) return
    const res = await fetch(`${API_BASE}/meetings/${meetingId}`, { method: 'DELETE' })
    if (res.ok) setClasses(prev => prev.filter(c => c.MeetingID !== meetingId))
    else alert('Delete failed')
  }

  function openCreate() { setEditing(null); setShowForm(true) }
  function openEdit(c) { setEditingMeeting(c); setNewMeetingDate(c.MeetingDate || ''); }
  function cancelEdit() { setEditingMeeting(null); setNewMeetingDate('') }
  async function saveEdit() {
    if (!editingMeeting) return
    const id = editingMeeting.MeetingID
    try {
      const date = (newMeetingDate || '').trim()
      if (!date) { alert('Please select a date (YYYY-MM-DD)'); return }
      const res = await fetch(`${API_BASE}/meetings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ MeetingDate: date })
      })
      if (!res.ok) {
        let msg = `Update failed (${res.status})`
        try { const j = await res.json(); if (j?.errors) msg = Object.values(j.errors).join('\n'); if (j?.error) msg = j.error } catch {}
        throw new Error(msg)
      }
      await res.json().catch(()=>null)
      cancelEdit()
      loadAll()
    } catch (e) {
      alert(e.message)
    }
  }

  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday']

  const PALETTES = {
    Monday: { border:'#c7d2fe', bg:'linear-gradient(180deg,#ffffff,#eef2ff)', chipBg:'#eef2ff', chipColor:'#4338ca' },
    Tuesday: { border:'#bbf7d0', bg:'linear-gradient(180deg,#ffffff,#ecfdf5)', chipBg:'#dcfce7', chipColor:'#166534' },
    Wednesday: { border:'#bae6fd', bg:'linear-gradient(180deg,#ffffff,#e0f2fe)', chipBg:'#e0f2fe', chipColor:'#075985' },
    Thursday: { border:'#fed7aa', bg:'linear-gradient(180deg,#ffffff,#fff7ed)', chipBg:'#ffedd5', chipColor:'#9a3412' },
    Friday: { border:'#fecaca', bg:'linear-gradient(180deg,#ffffff,#fef2f2)', chipBg:'#ffe4e6', chipColor:'#7f1d1d' },
  }

  function formatTime(t) {
    if (!t) return '-'
    const [h, m] = String(t).split(':').map(Number)
    const d = new Date()
    d.setHours(h||0, m||0, 0, 0)
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  function groupByDay(list) {
    const map = Object.fromEntries(DAYS.map(d => [d, []]))
    const other = []
    list.forEach(item => {
      if (map[item.DayOfWeek]) map[item.DayOfWeek].push(item)
      else other.push(item)
    })
    // sort each day by time
    for (const d of DAYS) map[d].sort((a,b)=> String(a.Time).localeCompare(String(b.Time)))
    return { map, other }
  }

  return (
    <div>
      <h2>Classes</h2>


      {loading ? <div className="small">Loading...</div> :
        classes.length === 0 ? <div className="small">No classes.</div> :
        (()=>{
          const { map, other } = groupByDay(classes)
          return (
            <div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(200px, 1fr))', gap: 12 }}>
                {DAYS.map(day => (
                  <section key={day} style={{
                    border:`1px solid ${PALETTES[day].border}`,
                    borderRadius:12,
                    padding:12,
                    background:PALETTES[day].bg,
                    boxShadow:'0 1px 2px rgba(0,0,0,0.04)'
                  }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
                      <h3 style={{ margin:0, fontSize:16 }}>{day}</h3>
                      <span style={{ fontSize:12, padding:'2px 8px', borderRadius:9999, background:PALETTES[day].chipBg, color:PALETTES[day].chipColor, border:`1px solid ${PALETTES[day].border}` }}>{map[day].length}</span>
                    </div>
                    {map[day].length === 0 ? (
                      <div className="small" style={{ color:'#9ca3af' }}>No classes</div>
                    ) : (
                      <div style={{ display:'grid', gap:8 }}>
                        {map[day].map(c => (
                          <div key={`${c.ClassID}-${c.MeetingID || c.Time}`} style={{
                            position:'relative',
                            border:'1px solid #e5e7eb',
                            borderRadius:10,
                            padding:10,
                            background:'#fff',
                            boxShadow:'0 1px 2px rgba(0,0,0,0.04)'
                          }}>
                            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                              <div style={{ fontWeight:600 }}>{c.Level}</div>
                              <div className="small">Class #{c.ClassID}</div>
                            </div>
                            <div style={{ marginTop:4 }}>
                              <span style={{ fontWeight:600 }}>{formatTime(c.Time)}</span>
                              <span className="small" style={{ marginLeft:8, color:'#6b7280' }}>{c.Location}</span>
                            </div>
                            <div className="small" style={{ color:'#6b7280', marginTop:2 }}>Instructor: {c.InstructorName || '-'}</div>
                            {editingMeeting?.MeetingID === c.MeetingID ? (
                              <div style={{ marginTop:8, display:'flex', alignItems:'center', gap:8 }}>
                                <input type="date" value={newMeetingDate} onChange={e=>setNewMeetingDate(e.target.value)} />
                                <button className="btn btn-primary" onClick={saveEdit}>Save</button>
                                <button className="btn" onClick={cancelEdit}>Cancel</button>
                              </div>
                            ) : (
                              <>
                                {c.MeetingDate && <div className="small" style={{ color:'#6b7280', marginTop:2 }}>Date: {c.MeetingDate}</div>}
                                <div style={{ display:'flex', gap:6, marginTop:8 }}>
                                  <button className="btn btn-primary" onClick={()=>openEdit(c)}>Edit</button>
                                  <button className="btn btn-danger" onClick={()=>doDelete(c.MeetingID)}>Delete</button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                ))}
              </div>
              {other.length > 0 && (
                <div style={{ marginTop:12 }}>
                  <h3 style={{ margin:'8px 0' }}>Other</h3>
                  <div className="small" style={{ color:'#6b7280' }}>Days outside Monday–Friday</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:8, marginTop:8 }}>
                    {other.map(c => (
                      <div key={`other-${c.ClassID}-${c.MeetingID || c.Time}`} style={{
                        border:'1px solid #e5e7eb', borderRadius:10, padding:10, background:'#fff'
                      }}>
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                          <div style={{ fontWeight:600 }}>{c.Level}</div>
                          <div className="small">{c.DayOfWeek}</div>
                        </div>
                        <div style={{ marginTop:4 }}>
                          <span style={{ fontWeight:600 }}>{formatTime(c.Time)}</span>
                          <span className="small" style={{ marginLeft:8, color:'#6b7280' }}>{c.Location}</span>
                        </div>
                        <div className="small" style={{ color:'#6b7280', marginTop:2 }}>Instructor: {c.InstructorName || '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )
        })()
      }
    </div>
  )
}

