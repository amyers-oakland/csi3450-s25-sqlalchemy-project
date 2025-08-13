import React, { useState } from 'react'
import StudentList from './components/StudentList'
import ClassList from './components/ClassList'
import Schedule from './components/Schedule'

export default function App() {
  const [view, setView] = useState('students')
  return (
    <div className="container">
      <h1>MARU Admin</h1>
      <nav>
        <button onClick={() => setView('students')}>Students</button>
        <button onClick={() => setView('classes')}>Classes</button>
        <button onClick={() => setView('schedule')}>Schedule</button>
      </nav>
      <hr />
      {view === 'students' && <StudentList />}
      {view === 'classes' && <ClassList />}
      {view === 'schedule' && <Schedule />}
    </div>
  )
}
