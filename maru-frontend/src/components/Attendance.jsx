import { useEffect, useState } from 'react'

export default function Attendance(){
  const [meetings, setMeetings] = useState([])
  const [students, setStudents] = useState([])
  const [meetingId, setMeetingId] = useState('')
  const [studentId, setStudentId] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(()=> {
    fetch('/api/meetings.php').then(r=>r.json()).then(setMeetings).catch(()=>setMeetings([]))
    fetch('/api/students.php').then(r=>r.json()).then(setStudents).catch(()=>setStudents([]))
  },[])

  async function submit(e){
    e.preventDefault()
    if(!meetingId||!studentId) return setMsg('Choose both')
    await fetch('/api/attendance.php', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify({ MeetingID:+meetingId, StudentID:+studentId })
    })
    setMsg('Recorded')
  }

  return (
    <div>
      <h2>Record Attendance</h2>
      {msg && <div style={{color:'green'}}>{msg}</div>}
      <form onSubmit={submit}>
        <label>Meeting
          <select value={meetingId} onChange={e=>setMeetingId(e.target.value)} required>
            <option value="">-- select --</option>
            {meetings.map(m => <option key={m.MeetingID} value={m.MeetingID}>{m.MeetingText || `${m.Level} ${m.MeetingDate}`}</option>)}
          </select>
        </label>
        <label>Student
          <select value={studentId} onChange={e=>setStudentId(e.target.value)} required>
            <option value="">-- select --</option>
            {students.map(s => <option key={s.StudentID} value={s.StudentID}>{s.FirstName} {s.LastName}</option>)}
          </select>
        </label>
        <div style={{marginTop:8}}><button type="submit">Record</button></div>
      </form>
    </div>
  )
}
