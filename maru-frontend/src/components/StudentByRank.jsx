import React, { useState } from 'react'

const API_BASE = 'http://127.0.0.1:8000/api'

export default function StudentByRank() {
  const [q, setQ] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function searchByRank(e) {
    e && e.preventDefault()
    const rankQuery = q.trim().toLowerCase()
    if (!rankQuery) {
      setResults([])
      return
    }
    setLoading(true)
    setError(null)
    try {
      // Fetch all students
      const res = await fetch(`${API_BASE}/students`)
      if (!res.ok) throw new Error('Failed to load students')
      const students = await res.json()

      // For each student fetch ranks
      const rankPromises = students.map(async (s) => {
        try {
          const rr = await fetch(`${API_BASE}/students/${s.StudentID}/rank`)
          if (!rr.ok) return { student: s, ranks: [] }
          const ranks = await rr.json()
          return { student: s, ranks }
        } catch (err) {
          return { student: s, ranks: [] }
        }
      })

      const withRanks = await Promise.all(rankPromises)

      // wanna filter stud. where any rank matches query by rankname or beltbolor
      const filtered = withRanks.filter(item => {
        if (!item.ranks || item.ranks.length === 0) return false
        return item.ranks.some(r => {
          const name = (r.RankName || '').toString().toLowerCase()
          const color = (r.BeltColor || '').toString().toLowerCase()
          return name.includes(rankQuery) || color.includes(rankQuery)
        })
      }).map(item => {
        return {
          StudentID: item.student.StudentID,
          FirstName: item.student.FirstName,
          LastName: item.student.LastName,
          DateOfBirth: item.student.DateOfBirth,
          JoinDate: item.student.JoinDate,
          Ranks: item.ranks
        }
      })

      setResults(filtered)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{background:'#fff',padding:16,borderRadius:6,boxShadow:'0 1px 3px rgba(0,0,0,0.06)'}}>
      <h2 style={{marginTop:0}}>Search Students by Rank</h2>
      <form onSubmit={searchByRank} style={{marginBottom:12}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Enter rank name or belt color (e.g., 'Black', 'Blue', 'Brown')" style={{padding:8,width:320}} />
        <button style={{marginLeft:8,padding:'8px 12px'}}>Search</button>
      </form>
      {loading && <div>Searching...</div>}
      {error && <div style={{color:'red'}}>Error: {error}</div>}
      {results.length === 0 && !loading && <div className="small">No students found for that rank.</div>}
      {results.length > 0 &&
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th style={{border:'1px solid #ddd',padding:8}}>ID</th>
              <th style={{border:'1px solid #ddd',padding:8}}>Name</th>
              <th style={{border:'1px solid #ddd',padding:8}}>DOB</th>
              <th style={{border:'1px solid #ddd',padding:8}}>Join</th>
              <th style={{border:'1px solid #ddd',padding:8}}>Ranks</th>
            </tr>
          </thead>
          <tbody>
            {results.map(s => (
              <tr key={s.StudentID}>
                <td style={{border:'1px solid #ddd',padding:8}}>{s.StudentID}</td>
                <td style={{border:'1px solid #ddd',padding:8}}>{s.FirstName} {s.LastName}</td>
                <td style={{border:'1px solid #ddd',padding:8}}>{s.DateOfBirth}</td>
                <td style={{border:'1px solid #ddd',padding:8}}>{s.JoinDate}</td>
                <td style={{border:'1px solid #ddd',padding:8}}>
                  {s.Ranks.map(r => (<div key={r.RankID}>{r.RankName} ({r.BeltColor}) - {r.DateAwarded}</div>))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    </div>
  )
}
