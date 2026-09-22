import { useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../store/auth'
import { Async } from '../components/Async'
import { PageHead, Badge } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal } from '../components/Form'
import { Modal } from '../components/Modal'
import { roleLabel } from '../nav'
import { useToast } from '../store/toast'

export default function Admin() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const [tab, setTab] = useState(isAdmin ? 'bus' : 'users')
  const tabs = isAdmin ? ['bus', 'users', 'ctos', 'roles', 'integrations', 'readiness', 'audit'] : ['users']
    const labels: any = { bus: 'Business Units', users: isAdmin ? 'Users' : 'Users & TAs', ctos: 'CTOs', roles: 'Roles', integrations: 'Integrations', readiness: 'Readiness', audit: 'Audit' }
  return (
    <>
      <PageHead title={isAdmin ? 'Administration' : 'BU Administration'} sub="Manage the organization" />
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{labels[t]}</button>)}</div>
      {tab === 'bus' && <BUs />}
      {tab === 'ctos' && <CTOs />}
      {tab === 'users' && <Users />}
      {tab === 'roles' && <Roles />}
      {tab === 'integrations' && <Integrations />}
      {tab === 'readiness' && <Weights />}
      {tab === 'audit' && <Audit />}
    </>
  )
}

function BUs() {
  const toast = useToast(); const [form, setForm] = useState(false); const [created, setCreated] = useState<any>(null)
  return <Async fetcher={api.businessUnits}>{(rows: any[], reload) => (
    <>
      <div style={{ marginBottom: 12 }}><button className="btn" onClick={() => setForm(true)}>+ Register Business Unit</button>
        <span className="muted" style={{ marginLeft: 8 }}>Creates the BU and its BU-Head login.</span></div>
      <Table rows={rows} empty="No BUs yet"
        cols={[{ h: 'Code', c: r => <b>{r.code}</b> }, { h: 'Name', c: r => r.name }, { h: 'Practices', c: r => (r.practices || []).join(', ') },
          { h: 'Active', c: r => r.active === false ? <Badge text="No" kind="bad" /> : <Badge text="Yes" kind="ok" /> }]}
        actions={r => <button className="btn ghost sm" onClick={async () => { await api.toggleBu(r.code); reload() }}>{r.active === false ? 'Activate' : 'Deactivate'}</button>} />
      {form && <FormModal title="Register Business Unit" onClose={() => setForm(false)} submitLabel="Register BU"
        fields={[{ key: 'name', label: 'BU name' }, { key: 'code', label: 'BU code' }, { key: 'practices', label: 'Practices (comma-separated)' },
          { key: 'headName', label: 'BU-Head name' }, { key: 'password', label: 'BU-Head temp password' }]}
        onSubmit={async v => { const r = await api.createBu({ ...v, practices: String(v.practices).split(',').map((s: string) => s.trim()).filter(Boolean) }); reload(); setCreated(r.head) }} />}
      {created && <Modal title="BU registered" onClose={() => setCreated(null)} footer={<button className="btn" onClick={() => setCreated(null)}>Done</button>}>
        <p>BU-Head login:</p><div className="card pad"><b>{created.email}</b><br />Temp password: <b>{created.tempPassword}</b></div>
        <p className="muted" style={{ marginTop: 8 }}>They must change it on first login.</p></Modal>}
    </>
  )}</Async>
}

function Users() {
  const toast = useToast(); const [ta, setTa] = useState(false)
  return <Async fetcher={api.users}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setTa(true)}>+ Register TA</button></div>
      <Table rows={rows} empty="No users"
        cols={[{ h: 'Name', c: r => <b>{r.name}</b> }, { h: 'Email', c: r => r.email }, { h: 'Role', c: r => <Badge text={roleLabel(r.role)} kind="info" /> },
          { h: 'BU', c: r => r.bu }, { h: 'Active', c: r => r.active === false ? <Badge text="No" kind="bad" /> : <Badge text="Yes" kind="ok" /> }]}
        actions={r => r.role === 'admin' ? null : <button className="btn ghost sm" onClick={async () => { await api.toggleUser(r.id); reload() }}>{r.active === false ? 'Activate' : 'Deactivate'}</button>} />
      {ta && <FormModal title="Register TA" onClose={() => setTa(false)} submitLabel="Register TA"
        fields={[{ key: 'name', label: 'TA name' }, { key: 'password', label: 'Temp password' }]}
        onSubmit={async v => { const r = await api.createTa(v); reload(); toast(`TA: ${r.email} / ${r.tempPassword}`) }} />}
    </>
  )}</Async>
}

function Roles() {
  return <Async fetcher={api.roles}>{(rows: any[]) => (<>{rows.map((r: any) => (
    <div key={r.role} className="card pad" style={{ marginBottom: 8 }}>
      <b>{roleLabel(r.role)}</b> {r.enterprise && <Badge text="enterprise" kind="ok" />}
      <div className="muted" style={{ marginTop: 6 }}>{Object.entries(r.permissions || {}).filter(([, v]) => v).map(([k]) => k).join(', ')}</div>
    </div>))}</>)}</Async>
}

function Integrations() {
  return <Async fetcher={api.integrations}>{(rows: any[], reload) => (<>{rows.map((it: any) => (
    <div key={it.id} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
      <div style={{ flex: 1 }}><b>{it.name}</b><div className="muted">{it.category} · {it.detail}</div></div>
      <button className="btn ghost sm" onClick={async () => { await api.toggleIntegration(it.id); reload() }}>{it.enabled ? '✅ Enabled' : '⬜ Disabled'}</button>
    </div>))}</>)}</Async>
}

function Weights() {
  const toast = useToast()
  return <Async fetcher={api.readinessWeights}>{(w: any) => <WeightForm w={w} toast={toast} />}</Async>
}
function WeightForm({ w, toast }: any) {
  const [s, setS] = useState(w.skills); const [t, setT] = useState(w.training); const [a, setA] = useState(w.assessment)
  return <div className="card pad" style={{ maxWidth: 420 }}>
    <label className="fld">Skills weight</label><input className="input" type="number" step="0.05" value={s} onChange={e => setS(e.target.value)} />
    <label className="fld">Training weight</label><input className="input" type="number" step="0.05" value={t} onChange={e => setT(e.target.value)} />
    <label className="fld">Assessment weight</label><input className="input" type="number" step="0.05" value={a} onChange={e => setA(e.target.value)} />
    <button className="btn" style={{ marginTop: 14 }} onClick={async () => { await api.setReadinessWeights(Number(s), Number(t), Number(a)); toast('Weights saved') }}>Save weights</button>
  </div>
}

function Audit() {
  return <Async fetcher={api.audit}>{(rows: any[]) => (
    <Table rows={rows} empty="No audit entries"
      cols={[{ h: 'When', c: r => <span className="muted">{r.at}</span> }, { h: 'Actor', c: r => r.actor }, { h: 'Action', c: r => <b>{r.action}</b> }, { h: 'Entity', c: r => r.entity }, { h: 'New', c: r => r.newValue || '' }]} />
  )}</Async>
}


function CTOs() {
  const toast = useToast()
  return <Async fetcher={api.users}>{(rows: any[], reload) => {
    const ctos = rows.filter(u => u.role === 'cto')
    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: 10 }}><button className="btn" onClick={() => (window as any)._openCto?.(true)} id="add-cto-btn">+ Add CTO</button></div>
        <Table rows={ctos} empty="No CTOs yet"
          cols={[
            { h: 'Name', c: r => <b>{r.name}</b> }, { h: 'Email', c: r => r.email },
            { h: 'Employee ID', c: r => r.employeeId || '—' },
            { h: 'Status', c: r => r.active === false ? <span className="badge b-bad">Inactive</span> : <span className="badge b-ok">Active</span> },
          ]}
          actions={r => (<>
            <button className="btn ghost sm" onClick={async () => { await api.toggleUser(r.id); reload() }}>{r.active === false ? 'Activate' : 'Deactivate'}</button>
            <button className="btn ghost sm" onClick={async () => { const x = await api.resetUserPassword(r.id, {}); toast(`New password: ${x.tempPassword}`) }}>Reset password</button>
          </>)} />
        <AddCtoModal reload={reload} toast={toast} />
      </>
    )
  }}</Async>
}

function AddCtoModal({ reload, toast }: any) {
  const [open, setOpen] = useState(false)
  ;(window as any)._openCto = setOpen
  if (!open) return null
  return <FormModal title="Add CTO" onClose={() => setOpen(false)}
    fields={[
      { key: 'name', label: 'CTO Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone number' },
      { key: 'employeeId', label: 'Employee ID' },
      // { key: 'bu', label: 'Department / BU' },
      { key: 'password', label: 'Password (blank = Name@123)' },
    ]}
    onSubmit={async v => { const r = await api.createCto(v); reload(); toast(`CTO ${r.email} / ${r.tempPassword}`) }} />
}