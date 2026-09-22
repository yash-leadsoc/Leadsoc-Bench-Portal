import { useState } from 'react'
import { api } from '../../api/api'
import { useAuth } from '../../store/auth'
import { Async } from '../../components/Async'
import { PageHead, Bar, Badge } from '../../components/ui'
import { Modal } from '../../components/Modal'
import { http, fileUrl } from '../../api/client'
import ChangePassword from '../ChangePassword'
import { useToast } from '../../store/toast'

export default function MyProfile() {
  const [pw, setPw] = useState(false)
  if (pw) return <ChangePassword />
  return <Async fetcher={api.myProfile}>{(p: any, reload) => <Editor p={p} reload={reload} onChangePw={() => setPw(true)} />}</Async>
}

function Editor({ p, reload, onChangePw }: any) {
  const { refresh } = useAuth(); const toast = useToast()
  const emp = p.employee || {}
  const comp = p.profileCompletion || { pct: 0, missing: [], sections: {} }
  const [f, setF] = useState<any>({
    name: p.name || '', phone: emp.phone || '', location: emp.location || '',
    designation: emp.designation || '', dateOfJoining: emp.dateOfJoining || '',
    totalExperience: emp.totalExperience || '', relevantExperience: emp.relevantExperience || '',
    previousExperience: emp.previousExperience || '', primaryDomain: emp.primaryDomain || '', secondaryDomain: emp.secondaryDomain || '',
    preferredRole: emp.preferredRole || '', preferredTechnology: emp.preferredTechnology || '', preferredDomain: emp.preferredDomain || '',
    preferredLocation: emp.preferredLocation || '', secondaryLocation: emp.secondaryLocation || '',
    willingToRelocate: emp.willingToRelocate || false, workMode: emp.workMode || 'hybrid',
    availabilityType: emp.availabilityType || 'immediate', availableFrom: emp.availableFrom || '', noticePeriod: emp.noticePeriod || '',
    github: emp.github || '', linkedin: emp.linkedin || '', resumeUrl: emp.resumeUrl || '',
  })
  const [skills, setSkills] = useState<any[]>(emp.skills || [])
  const [certs, setCerts] = useState<any[]>(emp.certifications || [])
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: any) => setF((x: any) => ({ ...x, [k]: v }))
  const T = (k: string, label: string, ph = '') => (
    <div><label className="fld">{label}</label><input className="input" value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph} /></div>)

  const uploadResume = async (file: File) => {
    try { const r = await http.upload('/files/upload', file); set('resumeUrl', r.url); toast('Resume uploaded') } catch { toast('Upload failed', 'err') }
  }
  const save = async () => {
    setBusy(true)
    try {
      await api.updateProfile({ ...f, skills, certifications: certs })
      await refresh(); reload(); toast('Profile saved')
    } catch (e: any) { toast(e.message || 'Failed', 'err') } finally { setBusy(false) }
  }

  return (
    <>
      <PageHead title="My Profile" sub="Single source of truth — everything else reads from here"
        actions={<><button className="btn ghost" onClick={onChangePw}>🔒 Password</button><button className="btn" onClick={save} disabled={busy}>{busy ? <span className="spin w" /> : 'Save profile'}</button></>} />

      <div className="card pad" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <b style={{ fontSize: 16 }}>Profile completion</b><div style={{ flex: 1 }}><Bar value={comp.pct || 0} /></div><b>{comp.pct || 0}%</b>
        </div>
        {(comp.missing || []).length > 0 && <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
          {(comp.missing || []).map((m: string, i: number) => <Badge key={i} text={m} kind="warn" />)}</div>}
      </div>

      <Section title="Basic information">
        <div className="two">{T('name', 'Full name')}{T('phone', 'Phone')}</div>
        <div className="two">{T('location', 'Current location')}{T('designation', 'Designation')}</div>
        <div className="two">{T('dateOfJoining', 'Date of joining', 'YYYY-MM-DD')}<div><label className="fld">Employee ID</label><input className="input" value={emp.id || p.employeeId || ''} disabled /></div></div>
        <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>BU: {emp.bu || '—'} · Role: {emp.targetRole || '—'} · Manager: {emp.manager || '—'} (set by your BU)</div>
      </Section>

      <Section title="Professional information">
        <div className="two">{T('totalExperience', 'Total experience (yrs)')}{T('relevantExperience', 'Relevant experience (yrs)')}</div>
        <div className="two">{T('primaryDomain', 'Primary domain')}{T('secondaryDomain', 'Secondary domain')}</div>
        {T('previousExperience', 'Previous experience / employers')}
      </Section>

      <Section title="Skills">
        <SkillEditor skills={skills} setSkills={setSkills} />
      </Section>

      <Section title="Preferences">
        <div className="two">{T('preferredRole', 'Preferred role')}{T('preferredTechnology', 'Preferred technology')}</div>
        <div className="two">{T('preferredDomain', 'Preferred domain')}{T('preferredLocation', 'Preferred location')}</div>
        <div className="two">{T('secondaryLocation', 'Secondary location')}
          <div><label className="fld">Work mode</label><select value={f.workMode} onChange={e => set('workMode', e.target.value)}>
            <option value="office">Office</option><option value="hybrid">Hybrid</option><option value="remote">Remote</option></select></div></div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
          <input type="checkbox" checked={!!f.willingToRelocate} onChange={e => set('willingToRelocate', e.target.checked)} /> Willing to relocate</label>
      </Section>

      <Section title="Availability">
        <div className="two">
          <div><label className="fld">Availability type</label><select value={f.availabilityType} onChange={e => set('availabilityType', e.target.value)}>
            <option value="immediate">Immediate</option><option value="notice">On notice</option><option value="fromDate">From a date</option><option value="unavailable">Unavailable</option></select></div>
          {T('availableFrom', 'Available from', 'YYYY-MM-DD')}
        </div>
        {T('noticePeriod', 'Notice period (days)')}
      </Section>

      <Section title="Certifications">
        <CertEditor certs={certs} setCerts={setCerts} />
      </Section>

      <Section title="Links & resume">
        <div className="two">{T('github', 'GitHub URL')}{T('linkedin', 'LinkedIn URL')}</div>
        {T('resumeUrl', 'Resume URL')}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 8 }}>
          <input type="file" accept=".pdf,.doc,.docx" onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])} />
          {f.resumeUrl && <a className="btn ghost sm" href={fileUrl(f.resumeUrl)} target="_blank" rel="noreferrer">View current</a>}
        </div>
      </Section>

      <div style={{ marginTop: 16 }}><button className="btn" onClick={save} disabled={busy}>{busy ? <span className="spin w" /> : 'Save profile'}</button></div>
    </>
  )
}

function Section({ title, children }: any) {
  return <div className="card pad" style={{ marginBottom: 14 }}><div className="sec-title">{title}</div>{children}</div>
}

function SkillEditor({ skills, setSkills }: any) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {skills.map((s: any, i: number) => (
          <span key={i} className="badge b-info" style={{ gap: 8 }}>
            {s.skill} · {s.level || 'Beginner'} {s.years ? `· ${s.years}y` : ''} {s.primary ? '★' : ''}
            <button onClick={() => setSkills(skills.filter((_: any, j: number) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button>
          </span>))}
        {skills.length === 0 && <span className="muted">No skills yet</span>}
      </div>
      <button className="btn ghost sm" style={{ marginTop: 10 }} onClick={() => setOpen(true)}>+ Add skill</button>
      {open && <SkillModal onClose={() => setOpen(false)} onAdd={(s: any) => setSkills([...skills, s])} />}
    </>
  )
}
function SkillModal({ onClose, onAdd }: any) {
  const [s, setS] = useState({ skill: '', category: '', level: 'Beginner', years: '', primary: true })
  return <Modal title="Add skill" onClose={onClose} footer={
    <><button className="btn ghost" onClick={onClose}>Cancel</button>
      <button className="btn" onClick={() => { if (s.skill) onAdd({ ...s, years: Number(s.years) || 0 }); onClose() }}>Add</button></>
  }>
    <label className="fld">Skill</label><input className="input" value={s.skill} onChange={e => setS({ ...s, skill: e.target.value })} />
    <label className="fld">Category</label><input className="input" value={s.category} onChange={e => setS({ ...s, category: e.target.value })} />
    <div className="two">
      <div><label className="fld">Level</label><select value={s.level} onChange={e => setS({ ...s, level: e.target.value })}>
        <option>Beginner</option><option>Intermediate</option><option>Advanced</option><option>Expert</option></select></div>
      <div><label className="fld">Years</label><input className="input" type="number" value={s.years} onChange={e => setS({ ...s, years: e.target.value })} /></div>
    </div>
    <label style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 10 }}>
      <input type="checkbox" checked={s.primary} onChange={e => setS({ ...s, primary: e.target.checked })} /> Primary skill</label>
  </Modal>
}
function CertEditor({ certs, setCerts }: any) {
  const [v, setV] = useState('')
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {certs.map((c: any, i: number) => (
          <span key={i} className="badge b-ok" style={{ gap: 8 }}>{typeof c === 'string' ? c : c.name}
            <button onClick={() => setCerts(certs.filter((_: any, j: number) => j !== i))} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'inherit' }}>✕</button></span>))}
        {certs.length === 0 && <span className="muted">No certifications yet</span>}
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
        <input className="input" placeholder="Certification name" value={v} onChange={e => setV(e.target.value)} />
        <button className="btn ghost sm" onClick={() => { if (v.trim()) { setCerts([...certs, { name: v.trim() }]); setV('') } }}>Add</button>
      </div>
    </>
  )
}
