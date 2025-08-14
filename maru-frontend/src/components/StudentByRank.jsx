import React, { useEffect, useMemo, useState } from 'react'

const API_BASE = 'http://localhost/api'

export default function StudentByRank() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const BELTS = useMemo(() => ([
    { id: 1, name: 'White Belt', color: '#ffffff' },
    { id: 2, name: 'Yellow Belt', color: '#f59e0b' },
    { id: 3, name: 'Green Belt', color: '#10b981' },
    { id: 4, name: 'Blue Belt', color: '#3b82f6' },
    { id: 5, name: 'Brown Belt', color: '#8b5e3c' },
  ]), [])

  const GLOW = useMemo(() => ({
    1: '0,0,0',
    2: '245,158,11',
    3: '16,185,129',
    4: '59,130,246',
    5: '139,94,60'
  }), [])

  useEffect(() => {
    let cancelled = false
    async function load() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}/students/ranks`)
        if (!res.ok) throw new Error('Failed to load student ranks')
        const data = await res.json()
        if (!cancelled) setStudents(Array.isArray(data) ? data : [])
      } catch (err) {
        if (!cancelled) setError(err.message)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  function getHighest(student) {
    const ranks = Array.isArray(student.ranks) ? student.ranks : []
    if (ranks.length === 0) return null
    const byId = [...ranks].sort((a, b) => (b.RankID || 0) - (a.RankID || 0))
    const top = byId[0]
    return top
  }

  function beltIndex(rankId) {
    const idx = BELTS.findIndex(b => b.id === rankId)
    return idx === -1 ? null : idx
  }

  return (
    <div style={{
      padding:24,
      minHeight:'100vh'
    }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <h2 style={{margin:0}}>Students by Rank</h2>
      </div>

      {loading && <div>Loading...</div>}
      {error && <div style={{color:'red'}}>Error: {error}</div>}

      {!loading && !error && (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill, minmax(260px, 1fr))',
          gap:16
        }}>
          {students.map(s => {
            const highest = getHighest(s)
            const topIdx = highest ? beltIndex(highest.RankID) : -1
            const topBeltName = highest ? highest.RankName : 'No Rank'
            const topDate = highest ? highest.DateAwarded : '—'
            return (
              <div key={s.StudentID} style={{
                background:'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.00)), radial-gradient(600px 220px at 20% -40%, rgba(59,130,246,0.08), transparent 60%), #0c1323',
                border:'1px solid rgba(148,163,184,0.12)',
                borderRadius:12,
                padding:16,
                boxShadow:'0 10px 25px rgba(2,6,23,0.65), inset 0 1px 0 rgba(255,255,255,0.03)',
                display:'flex',
                flexDirection:'column',
                minHeight:180,
                color:'#e5e7eb'
              }}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'baseline', fontFamily:"'Share Tech Mono', monospace"}}>
                  <div style={{fontWeight:700,fontSize:18,color:'#f8fafc'}}>{s.FirstName} {s.LastName}</div>
                  <div style={{fontSize:12,color:'#94a3b8'}}>ID #{s.StudentID}</div>
                </div>
                <div style={{marginTop:8,display:'grid',gridTemplateColumns:'80px 1fr',rowGap:6,columnGap:8,alignItems:'center'}}>
                  <div style={{fontSize:12,color:'#cbd5e1', fontFamily:"'Share Tech Mono', monospace"}}>Belt</div>
                  <div style={{fontSize:14,fontWeight:600,color:'#f1f5f9', fontFamily:"'Share Tech Mono', monospace"}}>{topBeltName}</div>
                  <div style={{fontSize:12,color:'#cbd5e1', fontFamily:"'Share Tech Mono', monospace"}}>Date</div>
                  <div style={{fontSize:13,color:'#e5e7eb', fontFamily:"'Share Tech Mono', monospace"}}>{topDate}</div>
                </div>
                <div style={{marginTop:'auto'}}>
                  <div style={{height:1,background:'#1f2937',margin:'12px 0'}} />
                  <div style={{display:'flex',gap:6,alignItems:'center'}}>
                    {BELTS.map((b, i) => {
                      const active = i <= topIdx
                      const bg = active ? b.color : '#374151'
                      const rgb = b.id === 1 ? '255,255,255' : (GLOW[b.id] || '255,255,255')
                      const glowWeak = `0 0 10px rgba(${rgb}, 0.35)`
                      const glowStrong = `0 0 18px rgba(${rgb}, 0.55), 0 0 28px rgba(${rgb}, 0.25)`
                      const shadow = active ? (i === topIdx ? glowStrong : glowWeak) : 'none'
                      return (
                        <div key={b.id} title={b.name} style={{
                          flex:1,
                          height:8,
                          background:bg,
                          borderRadius:999,
                          boxShadow:shadow,
                          transition:'box-shadow 160ms ease, background 160ms ease'
                        }} />
                      )
                    })}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
