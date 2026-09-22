import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, statusBadge, pctBadge, Bar } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal } from '../components/Form'
import { useToast } from '../store/toast'
import { useAuth } from '../store/auth'
import {can} from '../perms'


const STATUSES = ['newEntry', 'assessmentDue', 'trainingPlanned', 'trainingInProgress', 'assessment', 'deployable', 'proposed', 'deployed', 'released']

export default function Employees() {
  const toast = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [form, setForm] = useState<any>(null)
  const [statusFor, setStatusFor] = useState<any>(null)
  const [detail, setDetail] = useState<any>(null)
  const [q, setQ] = useState('')

  return (
    <Async fetcher={api.employees}>
      {(rows: any[], reload) => {
        const filtered = rows.filter(e => !q || `${e.name} ${e.id} ${e.bu} ${e.targetRole}`.toLowerCase().includes(q.toLowerCase()))
        return (
          <>
            {/* <PageHead title="Bench Employees" sub="Single source of truth — IDs like LS1703"
              actions={<button className="btn" onClick={() => setForm({})}>+ Add Employee</button>} /> */}
            {can(user, 'add') && <button className="btn" onClick={() => setForm({})}>+ Add Employee</button>}
            <input className="input" style={{ maxWidth: 320, marginBottom: 14 }} placeholder="Search name / ID / BU / role"
              value={q} onChange={e => setQ(e.target.value)} />
            <Table rows={filtered} empty="No employees"
              cols={[
                { h: 'ID', c: r => <b>{r.id}</b> },
                { h: 'Name', c: r => <a onClick={() => setDetail(r)} style={{ cursor: 'pointer' }}>{r.name}</a> },
                { h: 'BU', c: r => `${r.bu || ''}` },
                { h: 'email', c: r => r.email || '—' },
                { h: 'Bench Age', c: r => r.benchStart ? `${Math.max(0, Math.floor((Date.now() - new Date(r.benchStart).getTime()) / 864e5))} days` : '—' },
              
                { h: 'Status', c: r => statusBadge(r.status) },
              ]}
              actions={r => (<>
                <button className="btn ghost sm" onClick={() => setDetail(r)}>Details</button>
                <button className="btn ghost sm" onClick={() => setStatusFor(r)}>Status</button>
                <button className="btn ghost sm" onClick={() => setForm(r)}>Edit</button>
              </>)} />

            {form && <FormModal title={form.id ? 'Edit Employee' : 'Add Employee'} onClose={() => setForm(null)}
              fields={form.id ? [
                { key: 'name', label: 'Full name', value: form.name },
                { key: 'email', label: 'Email (login)', value: form.email },
                { key: 'phone', label: 'Mobile number', value: form.phone },
                { key: 'practice', label: 'Practice', value: form.practice },
                { key: 'targetRole', label: 'Target role', value: form.targetRole },
                { key: 'manager', label: 'Manager', value: form.manager },
                { key: 'benchReason', label: 'Bench reason', type: 'textarea', value: form.benchReason },
              ] : [
                { key: 'employeeId', label: 'LS ID (e.g. LS1703)' },
                { key: 'name', label: 'Full name' },
                { key: 'email', label: 'Email (login)' },
                { key: 'phone', label: 'Mobile number' },
                ...(isAdmin ? [{ key: 'manager', label: 'Manager' }] : []),
              ]}
              onSubmit={async v => {
                if (form.id) { await api.editEmployee(form.id, v); toast('Saved') }
                else { const r = await api.addEmployee(v); toast(`Added ${r.id} · ${r.loginEmail} / ${r.tempPassword}`) }
                reload()
              }} />}

            {statusFor && <FormModal title={`Set status — ${statusFor.name}`} onClose={() => setStatusFor(null)}
              fields={[{ key: 'status', label: 'Status', type: 'select', options: STATUSES, value: statusFor.status }]}
              onSubmit={async v => { await api.setStatus(statusFor.id, v.status); reload(); toast('Status updated') }} />}

            {detail && <EmployeeDrawer emp={detail} onClose={() => setDetail(null)} />}
          </>
        )
      }}
    </Async>
  )
}


function EmployeeDrawer({ emp, onClose }: { emp: any; onClose: () => void }) {
  return (
    <>
      <div className="drawer-ov" onClick={onClose} />
      <div className="drawer">
        <div className="head">
          <b style={{ fontSize: 18, flex: 1 }}>{emp.name} · {emp.id}</b>
          {statusBadge(emp.status)}
          <button className="btn ghost sm" onClick={onClose}>✕</button>
        </div>
        <div className="body">
          <Async fetcher={() => Promise.all([api.employee360(emp.id), api.progressLogs(emp.id)])}>
            {([d, logs]: any) => {
              const e = d.employee || {}
              const S = ({ t }: { t: string }) => <div className="sec-title" style={{ marginTop: 18 }}>{t}</div>
              return (
                <div>
                  <div className="grid kpis">
                    <div className="card kpi"><div className="ic">🎯</div><div><div className="v">{e.readinessScore || 0}%</div><div className="l">Readiness</div></div></div>
                    <div className="card kpi"><div className="ic">🎓</div><div><div className="v">{d.insight?.trainingCompletionPct || 0}%</div><div className="l">Training</div></div></div>
                    <div className="card kpi"><div className="ic">📝</div><div><div className="v">{d.insight?.assessmentPassRatePct || 0}%</div><div className="l">Pass rate</div></div></div>
                  </div>
                  <S t="Profile" />
                  <div className="card pad">
                    <div>Email: {e.email || '—'} · Phone: {e.phone || '—'}</div>
                    <div>BU/Practice: {e.bu} · {e.practice}</div>
                    <div>Target role: {e.targetRole || '—'} · Manager: {e.manager || '—'}</div>
                    <div>Preferred: {e.preferredRole || '—'} · {e.preferredLocation || '—'} · {e.workMode || '—'}</div>
                    <div>Availability: {e.availabilityType || e.availability || '—'} · from {e.availableFrom || '—'}</div>
                    <div>Bench since: {e.benchStart || '—'}</div>
                  </div>
                  <S t="Skills" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(e.skills || []).map((s: any, i: number) => <span key={i} className="badge b-info">{s.skill} · {s.level || s.proficiency || ''}</span>)}
                    {(e.skills || []).length === 0 && <span className="muted">None</span>}
                  </div>
                  <S t="Training progress" />
                  {(d.progress || []).map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                      <span style={{ flex: 1 }}>{p.title || p.materialId}</span><Bar value={p.pct || 0} /><span>{p.pct || 0}%</span>
                    </div>))}
                  {(d.progress || []).length === 0 && <span className="muted">No training assigned.</span>}
                  <S t="Daily updates" />
                  {(logs || []).map((l: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, padding: '3px 0', fontSize: 13 }}>
                      <b style={{ width: 92 }}>{l.date}</b><span style={{ flex: 1 }}>{l.materialTitle}: {l.note}</span><span>{l.pct}%</span>
                    </div>))}
                  {(logs || []).length === 0 && <span className="muted">No daily updates.</span>}
                  <S t="Assessment results" />
                  {(d.results || []).map((r: any, i: number) => (
                    <div key={i} style={{ padding: '3px 0' }}>{r.assessmentId} · {r.scoreMarks}/{r.totalMarks} · {r.passed ? 'PASS' : 'FAIL'}</div>))}
                  {(d.results || []).length === 0 && <span className="muted">No attempts.</span>}
                  <S t="Mock interviews" />
                  {(d.mocks || []).map((m: any, i: number) => <div key={i} style={{ padding: '3px 0' }}>{m.role} · {m.scheduledAt} · {m.status}</div>)}
                  {(d.mocks || []).length === 0 && <span className="muted">None.</span>}
                  <S t="AI summary" />
                  <div className="card pad">{d.insight?.summary || '—'}</div>
                </div>
              )
            }}
          </Async>
        </div>
      </div>
    </>
  )
}
