import React from 'react'

export default function StudentCard({ student }) {
  function goToStudentSchedule() {
    if (!student || !student.StudentID) return
    window.location.hash = `#/student/${student.StudentID}`
  }

  return (
    <div
      onClick={goToStudentSchedule}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToStudentSchedule() }}
      style={{
        border: '1px solid #ddd',
        borderRadius: 8,
        padding: 12,
        margin: 8,
        cursor: 'pointer',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}
    >
      <div style={{ fontSize: 14, color: '#666' }}>ID: {student.StudentID}</div>
      <div style={{ fontWeight: 600, fontSize: 16 }}>
        {student.FirstName} {student.LastName}
      </div>
    </div>
  )
}


