// import { useState } from 'react'
// import { api } from '../../api/api'
// import { Async } from '../../components/Async'
// import { PageHead } from '../../components/ui'
// import { useToast } from '../../store/toast'

// function monthDays(y: number, m: number) {
//   const days: (string | null)[] = []; const first = new Date(y, m, 1).getDay(); const total = new Date(y, m + 1, 0).getDate()
//   for (let i = 0; i < first; i++) days.push(null)
//   for (let d = 1; d <= total; d++) days.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
//   return days
// }

// export default function MyAvailability() {
//   const toast = useToast()
//   const now = new Date()
//   const [y, setY] = useState(now.getFullYear()); const [m, setM] = useState(now.getMonth())
//   return (
//     <Async fetcher={api.myProfile}>
//       {(p: any) => <AvailForm p={p} y={y} m={m} setY={setY} setM={setM} toast={toast} />}
//     </Async>
//   )
// }

// function AvailForm({ p, y, m, setY, setM, toast }: any) {
//   const emp = p.employee || {}
//   const [sel, setSel] = useState<Set<string>>(new Set((emp.availabilitySlots || []).map((s: any) => s.date)))
//   const [availType, setAvailType] = useState(emp.availabilityType || 'immediate')
//   const [availFrom, setAvailFrom] = useState(emp.availableFrom || '')
//   const days = monthDays(y, m)
//   const toggle = (d: string) => { const n = new Set(sel); n.has(d) ? n.delete(d) : n.add(d); setSel(n) }
//   const monthName = new Date(y, m, 1).toLocaleString('default', { month: 'long' })
//   const save = async () => {
//     const slots = [...sel].sort().map(date => ({ date, start: '10:00', end: '18:00', status: 'free' }))
//     await api.setAvailability(slots)
//     await api.updateProfile({ availabilityType: availType, availableFrom: availFrom })
//     toast('Availability saved')
//   }
//   return (
//     <>
//       <PageHead title="My Availability" sub="Tap dates you're available; set your availability type" />
//       <div className="two">
//         <div className="card pad">
//           <div><label className="fld">Availability type</label>
//             <select value={availType} onChange={e => setAvailType(e.target.value)}>
//               <option value="immediate">Immediate</option><option value="notice">On notice</option><option value="fromDate">From a date</option><option value="unavailable">Unavailable</option>
//             </select></div>
//           <label className="fld">Available from</label><input className="input" value={availFrom} onChange={e => setAvailFrom(e.target.value)} placeholder="2026-03-20" />
//           <button className="btn" style={{ marginTop: 14 }} onClick={save}>Save availability</button>
//         </div>
//         <div className="card pad">
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
//             <button className="btn ghost sm" onClick={() => { if (m === 0) { setM(11); setY(y - 1) } else setM(m - 1) }}>‹</button>
//             <b style={{ flex: 1, textAlign: 'center' }}>{monthName} {y}</b>
//             <button className="btn ghost sm" onClick={() => { if (m === 11) { setM(0); setY(y + 1) } else setM(m + 1) }}>›</button>
//           </div>
//           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
//             {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="muted" style={{ textAlign: 'center', fontSize: 11 }}>{d}</div>)}
//             {days.map((d, i) => d ? (
//               <button key={i} onClick={() => toggle(d)} style={{
//                 padding: '8px 0', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12,
//                 background: sel.has(d) ? 'var(--primary)' : '#fff', color: sel.has(d) ? '#fff' : 'var(--ink)'
//               }}>{Number(d.slice(-2))}</button>
//             ) : <div key={i} />)}
//           </div>
//           <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>{sel.size} day(s) marked free</div>
//         </div>
//       </div>
//     </>
//   )
// }


import { useState } from 'react'
import { api } from '../../api/api'
import { Async } from '../../components/Async'
import { PageHead } from '../../components/ui'
import { useToast } from '../../store/toast'

function monthDays(y: number, m: number) {
  const days: (string | null)[] = []; const first = new Date(y, m, 1).getDay(); const total = new Date(y, m + 1, 0).getDate()
  for (let i = 0; i < first; i++) days.push(null)
  for (let d = 1; d <= total; d++) days.push(`${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
  return days
}

export default function MyAvailability() {
  const toast = useToast()
  const now = new Date()
  const [y, setY] = useState(now.getFullYear()); const [m, setM] = useState(now.getMonth())
  return (
    <Async fetcher={api.myProfile}>
      {(p: any) => <AvailForm p={p} y={y} m={m} setY={setY} setM={setM} toast={toast} />}
    </Async>
  )
}

function AvailForm({ p, y, m, setY, setM, toast }: any) {
  const emp = p.employee || {}
  const existing = emp.availability || emp.availabilitySlots || []
  const [sel, setSel] = useState<Set<string>>(new Set(existing.map((s: any) => s.date)))
  const [availType, setAvailType] = useState(emp.availabilityType || 'immediate')
  const [availFrom, setAvailFrom] = useState(emp.availableFrom || '')
  const [start, setStart] = useState(existing[0]?.start || '10:00')
  const [end, setEnd] = useState(existing[0]?.end || '18:00')
  const days = monthDays(y, m)
  const toggle = (d: string) => { const n = new Set(sel); n.has(d) ? n.delete(d) : n.add(d); setSel(n) }
  const monthName = new Date(y, m, 1).toLocaleString('default', { month: 'long' })
  const save = async () => {
    if (start >= end) { toast('End time must be after start time'); return }
    const slots = [...sel].sort().map(date => ({ date, start, end, status: 'available' }))
    await api.setAvailability(slots)
    await api.updateProfile({ availabilityType: availType, availableFrom: availFrom })
    toast('Interview availability saved')
  }
  return (
    <>
      <PageHead title="My Interview Availability"
        sub="Mark the days and time window when you're available to attend interviews" />
      <div className="two">
        <div className="card pad">
          <label className="fld">Availability type</label>
          <select value={availType} onChange={e => setAvailType(e.target.value)}>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>
          <label className="fld">Available from (date)</label>
          <input className="input" type="date" value={availFrom} onChange={e => setAvailFrom(e.target.value)} />
          <div className="two" style={{ marginTop: 4 }}>
            <div><label className="fld">From (time)</label><input className="input" type="time" value={start} onChange={e => setStart(e.target.value)} /></div>
            <div><label className="fld">Until (time)</label><input className="input" type="time" value={end} onChange={e => setEnd(e.target.value)} /></div>
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>This time window applies to every day you mark available.</div>
          <button className="btn" style={{ marginTop: 14 }} onClick={save}>Save availability</button>
        </div>
        <div className="card pad">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <button className="btn ghost sm" onClick={() => { if (m === 0) { setM(11); setY(y - 1) } else setM(m - 1) }}>‹</button>
            <b style={{ flex: 1, textAlign: 'center' }}>{monthName} {y}</b>
            <button className="btn ghost sm" onClick={() => { if (m === 11) { setM(0); setY(y + 1) } else setM(m + 1) }}>›</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => <div key={i} className="muted" style={{ textAlign: 'center', fontSize: 11 }}>{d}</div>)}
            {days.map((d, i) => d ? (
              <button key={i} onClick={() => toggle(d)} style={{
                padding: '8px 0', borderRadius: 8, border: '1px solid var(--line)', fontSize: 12,
                background: sel.has(d) ? 'var(--primary)' : '#fff', color: sel.has(d) ? '#fff' : 'var(--ink)'
              }}>{Number(d.slice(-2))}</button>
            ) : <div key={i} />)}
          </div>
          <div className="muted" style={{ marginTop: 8, fontSize: 12 }}>{sel.size} day(s) marked available · {start}–{end}</div>
        </div>
      </div>
    </>
  )
}