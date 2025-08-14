import React, { useEffect, useState } from 'react'
import StudentCard from './StudentCard'
const API_BASE = 'http://localhost/api'

export default function Schedule() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      setLoading(true)
      const res = await fetch(`${API_BASE}/schedule`)
      const data = await res.json()
      setItems(data)
      setLoading(false)
    }
    load()
  }, [])

  const looksLikeStudents = items.length > 0 && items[0] && items[0].StudentID

  return (
    <div>
      <h2>Class Schedule</h2>
      {loading ? <div className="small">Loading schedule...</div> :
        items.length === 0 ? <div className="small">No schedule entries.</div> :
        looksLikeStudents ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', margin: -8 }}>
            {items.map((s) => (
              <StudentCard key={s.StudentID} student={s} />
            ))}
          </div>
        ) : (
          <table>
            <thead><tr><th>Class</th><th>Day</th><th>Time</th><th>Location</th><th>Meeting Date</th><th>Instructor</th></tr></thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx}>
                  <td>{it.Level}</td>
                  <td>{it.DayOfWeek}</td>
                  <td>{it.Time}</td>
                  <td>{it.Location}</td>
                  <td>{it.MeetingDate || '-'}</td>
                  <td>{it.InstructorName || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    </div>
  )
}

