import React, { useEffect, useState } from 'react'
import StudentList from './components/StudentList'
import ClassList from './components/ClassList'
import Schedule from './components/Schedule'
import StudentByRank from './components/StudentByRank'
import StudentSchedulePage from './components/StudentSchedulePage'
import bgUrl from './assets/blurry_background.svg'

export default function App() {
  const [view, setView] = useState('students')
  const [routeStudentId, setRouteStudentId] = useState(null)

  useEffect(() => {
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = bgUrl;

    function handleHashChange() {
      const hash = window.location.hash || ''
      const m = hash.match(/^#\/student\/(\d+)$/)
      if (m) {
        setRouteStudentId(m[1])
        setView('student-schedule')
        return
      }
      setRouteStudentId(null)
      switch (hash) {
        case '#/students': setView('students'); break
        case '#/classes': setView('classes'); break
        case '#/schedule': setView('schedule'); break
        case '#/by-rank': setView('by-rank'); break
        case '': setView('students'); break
        default: setView('students')
      }
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange()
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])
  return (
    <div className="container">
      <h1>MARU Admin</h1>
      <nav>
        <button type="button" className={view === 'students' ? 'tab active' : 'tab'} onClick={() => { window.location.hash = '#/students' }}>Students</button>
        <button type="button" className={view === 'classes' ? 'tab active' : 'tab'} onClick={() => { window.location.hash = '#/classes' }}>Classes</button>
        <button type="button" className={view === 'schedule' ? 'tab active' : 'tab'} onClick={() => { window.location.hash = '#/schedule' }}>Schedule</button>
        <button type="button" className={view === 'by-rank' ? 'tab active' : 'tab'} onClick={() => { window.location.hash = '#/by-rank' }}>Search by Rank</button>
      </nav>
      <hr />
      {view === 'students' && <StudentList />}
      {view === 'classes' && <ClassList />}
      {view === 'schedule' && <Schedule />}
      {view === 'by-rank' && <StudentByRank />}
      {view === 'student-schedule' && <StudentSchedulePage studentId={routeStudentId} />}
    </div>
  )
}
