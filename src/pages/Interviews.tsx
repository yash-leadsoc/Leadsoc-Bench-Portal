import { useState } from 'react'
import { api } from '../api/api'
import { fileUrl } from '../api/client'
import { Async } from '../components/Async'
import { PageHead, statusBadge, Badge } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal, Confirm } from '../components/Form'
import { AssignEmp } from './Plans'
import { useToast } from '../store/toast'

export default function Interviews() {
  const [tab, setTab] = useState('panels')
  return (
    <>
      <PageHead title="Interviews" sub="Panels, mock interviews, scheduling and availability" />
      <div className="tabs">
        {['panels', 'mocks', 'schedule', 'availability'].map(t =>
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}
      </div>
      {tab === 'panels' && <Panels />}
      {tab === 'mocks' && <Mocks />}
      {tab === 'schedule' && <Schedule />}
      {tab === 'availability' && <Availability />}
    </>
  )
}
const MeetCell = (u: string) => u ? <a href={fileUrl(u)} target="_blank" rel="noreferrer">join ↗</a> : ''

function Panels() {
  const toast = useToast(); const [form, setForm] = useState<any>(null); const [assign, setAssign] = useState<any>(null); const [del, setDel] = useState<any>(null)
  return <Async fetcher={api.panels}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm({})}>+ New Panel</button></div>
      <Table rows={rows} empty="No panels"
        cols={[
          { h: 'Panel', c: r => <b>{r.name}</b> }, { h: 'Members', c: r => (r.members || []).map((m: any) => m.name).join(', ') },
          { h: 'Rounds', c: r => (r.rounds || []).join(', ') }, { h: 'Assigned', c: r => (r.assignments || []).length },
        ]}
        actions={r => (<><button className="btn ghost sm" onClick={() => setAssign(r)}>Assign</button><button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button></>)} />
      {form && <FormModal title="New Panel" onClose={() => setForm(null)}
        fields={[{ key: 'name', label: 'Panel name' }, { key: 'members', label: 'Members (comma-separated)' }, { key: 'rounds', label: 'Rounds (comma-separated)' }]}
        onSubmit={async v => { await api.createPanel({ name: v.name, members: String(v.members).split(',').map((s: string) => ({ name: s.trim() })).filter((m: any) => m.name), rounds: String(v.rounds).split(',').map((s: string) => s.trim()).filter(Boolean) }); reload(); toast('Created') }} />}
      {assign && <AssignEmp title="Assign panel" onClose={() => setAssign(null)} onPick={async id => { await api.assignPanel(assign.id, id); toast('Assigned') }} />}
      {del && <Confirm msg="Delete panel?" onClose={() => setDel(null)} onYes={async () => { await api.deletePanel(del.id); reload() }} />}
    </>
  )}</Async>
}

function Mocks() {
  const toast = useToast(); const [form, setForm] = useState(false); const [score, setScore] = useState<any>(null)
  return <Async fetcher={api.mocks}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm(true)}>+ Schedule Mock</button></div>
      <Table rows={rows} empty="No mock interviews"
        cols={[
          { h: 'Role', c: r => <b>{r.role}</b> }, { h: 'Employee', c: r => r.employeeId }, { h: 'When', c: r => r.scheduledAt },
          { h: 'Meet', c: r => MeetCell(r.meetLink) }, { h: 'Status', c: r => statusBadge(r.status) },
        ]}
        actions={r => r.status === 'completed' ? null : <button className="btn ghost sm" onClick={() => setScore(r)}>Scorecard</button>} />
      {form && <MockForm onClose={() => setForm(false)} onDone={() => { reload(); toast('Scheduled') }} />}
      {score && <FormModal title="Mock Scorecard" onClose={() => setScore(null)}
        fields={[{ key: 'overall', label: 'Overall (0-10)', type: 'number' }, { key: 'recommendation', label: 'Recommendation', type: 'textarea' }]}
        onSubmit={async v => { await api.mockScorecard(score.id, { overall: Number(v.overall) || 0, recommendation: v.recommendation, rounds: [] }); reload(); toast('Saved') }} />}
    </>
  )}</Async>
}
function MockForm({ onClose, onDone }: any) {
  const today = new Date().toISOString().slice(0, 10)
  return <Async fetcher={() => Promise.all([api.employees(), api.panels()])}>{([emps, panels]: any) => (
    <FormModal title="Schedule Mock Interview" onClose={onClose}
      fields={[
        { key: 'employeeId', label: 'Employee', type: 'select', value: emps[0]?.id,
          options: emps.map((e: any) => ({ value: e.id, label: `${e.name} (${e.id})` })) },
        { key: 'panelId', label: 'Panel', type: 'select', value: '',
          options: [{ value: '', label: '— none —' }, ...panels.map((p: any) => ({ value: p.id, label: p.name }))] },
        { key: 'role', label: 'Role' },
        { key: 'date', label: 'Date', type: 'date', value: today },
        { key: 'time', label: 'Time', type: 'time', value: '10:00' },
        { key: 'meetLink', label: 'Google Meet link (optional — blank = auto-generate)' },
      ]}
      onSubmit={async v => {
        await api.createMock({ employeeId: v.employeeId, panelId: v.panelId || null, role: v.role,
          scheduledAt: `${v.date}T${v.time}:00`, meetLink: v.meetLink || undefined })
        onDone(); onClose()
      }} />
  )}</Async>
}

function Schedule() {
  const toast = useToast(); const [form, setForm] = useState(false)
  const today = new Date().toISOString().slice(0, 10)
  return <Async fetcher={api.interviews}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm(true)}>+ Schedule Interview</button></div>
      <Table rows={rows} empty="No interviews scheduled"
        cols={[
          { h: 'Role', c: r => <b>{r.role}</b> }, { h: 'Employee', c: r => r.employeeId || r.candidateId }, { h: 'When', c: r => r.scheduledAt },
          { h: 'Meet', c: r => MeetCell(r.meetLink) }, { h: 'Status', c: r => statusBadge(r.status) },
        ]} />
      {form && <Async fetcher={() => Promise.all([api.employees(), api.panels()])}>{([emps, panels]: any) => (
        <FormModal title="Schedule Interview" onClose={() => setForm(false)}
          fields={[
            { key: 'employeeId', label: 'Employee', type: 'select', value: emps[0]?.id,
              options: emps.map((e: any) => ({ value: e.id, label: `${e.name} (${e.id})` })) },
            { key: 'panelId', label: 'Panel', type: 'select', value: '',
              options: [{ value: '', label: '— none —' }, ...panels.map((p: any) => ({ value: p.id, label: p.name }))] },
            { key: 'role', label: 'Role' },
            { key: 'date', label: 'Date', type: 'date', value: today },
            { key: 'time', label: 'Time', type: 'time', value: '11:00' },
            { key: 'meetLink', label: 'Google Meet link (optional — blank = auto-generate)' },
          ]}
          onSubmit={async v => {
            await api.scheduleInterview({ employeeId: v.employeeId, panelId: v.panelId || null, role: v.role,
              scheduledAt: `${v.date}T${v.time}:00`, meetLink: v.meetLink || undefined })
            reload(); toast('Scheduled')
          }} />
      )}</Async>}
    </>
  )}</Async>
}

function Availability() {
  return <Async fetcher={api.calendar}>{(cal: any) => {
    const events = cal.events || []; const byEmp: any = {}
    events.forEach((e: any) => (byEmp[e.employeeId] = byEmp[e.employeeId] || { name: e.employeeName || e.employeeId, id: e.employeeId, slots: [] }).slots.push(e))
    const list = Object.values(byEmp)
    return (
      <>
        <p className="muted" style={{ marginBottom: 12 }}>Days and time windows employees have marked themselves available for interviews.</p>
        {list.length === 0 && <div className="card"><div className="empty">No availability published yet</div></div>}
        {list.map((e: any, i: number) => (
          <div key={i} className="card pad" style={{ marginBottom: 8 }}>
            <b>👤 {e.name}</b> <span className="muted">({e.id}) · {e.slots.length} day(s) available</span>
            {e.slots.map((s: any, j: number) => (
              <div key={j} style={{ padding: '4px 0', display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ flex: 1 }}>📅 {s.date}</span>
                <span className="muted">{s.start}–{s.end}</span>
                <span className="badge b-ok">Available</span>
              </div>))}
          </div>))}
      </>
    )
  }}</Async>
}
