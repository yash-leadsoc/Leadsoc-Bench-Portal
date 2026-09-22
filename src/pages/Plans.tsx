import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { Bar } from '../components/ui'
import { Table } from '../components/Table'
import { Confirm } from '../components/Form'
import { Modal } from '../components/Modal'
import { useToast } from '../store/toast'

const CATEGORIES = ['Technical', 'Domain', 'Behavioural', 'Certification', 'Onboarding', 'Tools & Process']
const DIFFICULTY = ['Beginner', 'Intermediate', 'Advanced']
const LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Expert']
const ASSESSMENT = ['None', 'Quiz', 'Assignment', 'Practical', 'Interview']

const grid2: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }
const grid3: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12 }

export default function Plans() {
  const toast = useToast()
  const [build, setBuild] = useState<any>(null)   // {} = new, {..} = edit
  const [assign, setAssign] = useState<any>(null)
  const [view, setView] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  return (
    <Async fetcher={api.plans}>
      {(rows: any[], reload) => (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn" onClick={() => setBuild({})}>+ Create Plan</button>
          </div>
          <Table rows={rows} empty="No training plans yet"
            cols={[
              { h: 'Plan', c: r => <b>{r.name}</b> },
              { h: 'Target role', c: r => r.targetRole || '—' },
              { h: 'Primary skill', c: r => r.primarySkill || '—' },
              { h: 'Category', c: r => r.category || '—' },
              { h: 'Modules', c: r => (r.items || []).length },
              { h: 'Duration', c: r => r.durationValue ? `${r.durationValue} ${r.durationUnit || 'days'}` : '—' },
              {
                h: 'Status', c: r => r.status === 'draft'
                  ? <span className="badge b-warn">Draft</span>
                  : <span className="badge b-ok">Active</span>
              },
            ]}
            actions={r => (<>
              <button className="btn ghost sm" onClick={() => setView(r)}>View</button>
              <button className="btn ghost sm" onClick={() => setAssign(r)}>Assign</button>
              <button className="btn ghost sm" onClick={() => setBuild(r)}>Edit</button>
              <button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button>
            </>)} />

          {build && <PlanBuilder plan={build} onClose={() => setBuild(null)}
            onSaved={() => { setBuild(null); reload(); toast('Saved') }} />}

          {assign && <AssignEmp title={`Assign ${assign.name}`} onClose={() => setAssign(null)}
            onPick={async id => { await api.assignPlan(assign.id, id); toast('Assigned') }} />}

          {del && <Confirm msg="Delete this plan?" onClose={() => setDel(null)}
            onYes={async () => { await api.deletePlan(del.id); reload(); toast('Deleted') }} />}

          {view && <PlanView plan={view} onClose={() => setView(null)} />}
        </>
      )}
    </Async>
  )
}

// ---------------------------------------------------------------------------
// Small building blocks
// ---------------------------------------------------------------------------
const L = ({ t, req }: { t: string; req?: boolean }) =>
  <label className="fld">{t}{req && <span style={{ color: 'var(--bad)' }}> *</span>}</label>

function Section({ title, hint, children }: { title: string; hint?: string; children: any }) {
  return (
    <div className="card pad" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 12 }}>
        <div className="sec-title" style={{ margin: 0 }}>{title}</div>
        {hint && <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>{hint}</div>}
      </div>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Reusable plan builder (template — NOT tied to an employee)
// ---------------------------------------------------------------------------
function PlanBuilder({ plan, onClose, onSaved }: any) {
  const isEdit = !!plan.id
  const [v, setV] = useState<any>({
    name: plan.name || '', targetRole: plan.targetRole || '', primarySkill: plan.primarySkill || '',
    category: plan.category || 'Technical', difficulty: plan.difficulty || 'Beginner',
    durationValue: plan.durationValue || '', durationUnit: plan.durationUnit || 'weeks',
    description: plan.description || '', expectedOutcome: plan.expectedOutcome || '',
    trainer: plan.trainer || '',
  })
  const [skills, setSkills] = useState<any[]>(
    plan.skillsCovered?.length ? plan.skillsCovered : [{ skill: '', level: 'Beginner' }])
  const [mods, setMods] = useState<any[]>(
    plan.items?.length
      ? plan.items.map((i: any) => ({ title: i.title || '', materialId: i.materialId || '', week: i.week || 1, duration: i.duration || '', assessmentType: i.assessmentType || 'None' }))
      : [{ title: '', materialId: '', week: 1, duration: '', assessmentType: 'None' }])
  const [busy, setBusy] = useState(false)

  const set = (k: string, val: any) => setV((x: any) => ({ ...x, [k]: val }))
  const setSkill = (i: number, k: string, val: any) => setSkills(a => a.map((r, j) => j === i ? { ...r, [k]: val } : r))
  const setMod = (i: number, k: string, val: any) => setMods(a => a.map((r, j) => j === i ? { ...r, [k]: val } : r))
  const [assessmentIds, setAssessmentIds] = useState<string[]>(plan.assessmentIds || [])
  const save = async (status: string) => {
    if (!v.name.trim() || !v.targetRole.trim() || !v.primarySkill.trim() || !v.category) {
      alert('Please fill the required fields (*): Plan name, Target role, Primary skill, Category.'); return
    }
    const usedMods = mods.filter(m => m.title.trim() || m.materialId || m.duration.trim() || m.assessmentType !== 'None')
    if (usedMods.some(m => !m.title.trim())) { alert('Each training module needs a Module Name.'); return }
    setBusy(true)
    try {
      const skillsCovered = skills.filter(s => s.skill.trim())
      const items = usedMods.map((m, idx) => ({
        title: m.title, materialId: m.materialId, week: Number(m.week) || 0,
        duration: m.duration, assessmentType: m.assessmentType, mandatory: true, order: idx,
      }))
      const body = {
        ...v, durationValue: Number(v.durationValue) || 0, durationHours: Number(v.durationValue) || 0,
        skillsCovered, skills: skillsCovered.map(s => s.skill), items, assessmentIds, status,
      }
      isEdit ? await api.editPlan(plan.id, body) : await api.createPlan(body)
      onSaved()
    } catch (e: any) { alert(e.message || 'Failed'); setBusy(false) }
  }

  return (
    <Modal lg title={isEdit ? 'Edit Training Plan' : 'Create Training Plan'} onClose={onClose} footer={
      <>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn ghost" onClick={() => save('draft')} disabled={busy}>Save as Draft</button>
        <button className="btn" onClick={() => save('active')} disabled={busy}>
          {busy ? <span className="spin w" /> : (isEdit ? 'Save Plan' : 'Create Training Plan')}
        </button>
      </>
    }>
            <Async fetcher={() => Promise.all([api.materials(), api.assessments()])}>
        {([mats, assmts]: any[]) => (
          <div>
            {/* 1 — Basic Information */}
            <Section title="1 · Basic Information">
              <div style={grid2}>
                <div><L t="Training Plan Name" req /><input className="input" value={v.name} onChange={e => set('name', e.target.value)} /></div>
                <div><L t="Target Role" req /><input className="input" value={v.targetRole} onChange={e => set('targetRole', e.target.value)} /></div>
                <div><L t="Primary Skill" req /><input className="input" value={v.primarySkill} onChange={e => set('primarySkill', e.target.value)} /></div>
                <div><L t="Training Category" req /><select value={v.category} onChange={e => set('category', e.target.value)}>{CATEGORIES.map(o => <option key={o}>{o}</option>)}</select></div>
                <div><L t="Difficulty Level" /><select value={v.difficulty} onChange={e => set('difficulty', e.target.value)}>{DIFFICULTY.map(o => <option key={o}>{o}</option>)}</select></div>
                <div><L t="Estimated Duration" />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input className="input" type="number" min={0} style={{ maxWidth: 110 }} value={v.durationValue} onChange={e => set('durationValue', e.target.value)} />
                    <select value={v.durationUnit} onChange={e => set('durationUnit', e.target.value)}>{['hours', 'days', 'weeks'].map(o => <option key={o}>{o}</option>)}</select>
                  </div>
                </div>
              </div>
            </Section>

            {/* 2 — Skills Covered */}
            <Section title="2 · Skills Covered" hint="Skills this plan builds, with the level a learner should reach.">
              {skills.map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                  <input className="input" placeholder="Skill" value={s.skill} onChange={e => setSkill(i, 'skill', e.target.value)} />
                  <select style={{ maxWidth: 180 }} value={s.level} onChange={e => setSkill(i, 'level', e.target.value)}>{LEVELS.map(o => <option key={o}>{o}</option>)}</select>
                  <button className="btn ghost sm danger" title="Delete" onClick={() => setSkills(a => a.filter((_, j) => j !== i))}>✕</button>
                </div>
              ))}
              <button className="btn ghost sm" onClick={() => setSkills(a => [...a, { skill: '', level: 'Beginner' }])}>+ Add Skill</button>
            </Section>

            {/* 3 — Training Modules */}
            <Section title="3 · Training Modules" hint="Break the plan into modules. Set a Week to build a week-by-week timetable.">
              {mods.map((m, i) => (
                <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, background: 'var(--bg)', marginBottom: 10 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                    <b style={{ flex: 1 }}>Module {i + 1}</b>
                    <button className="btn ghost sm danger" onClick={() => setMods(a => a.filter((_, j) => j !== i))}>Delete</button>
                  </div>
                  <div style={grid2}>
                    <div><L t="Module Name" req /><input className="input" value={m.title} onChange={e => setMod(i, 'title', e.target.value)} /></div>
                    <div><L t="Training Material" />
                      <select value={m.materialId} onChange={e => setMod(i, 'materialId', e.target.value)}>
                        <option value="">— select material —</option>
                        {mats.map(mt => <option key={mt.id} value={mt.id}>{mt.title}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ ...grid3, marginTop: 4 }}>
                    <div><L t="Week" /><input className="input" type="number" min={1} value={m.week} onChange={e => setMod(i, 'week', e.target.value)} /></div>
                    <div><L t="Duration" /><input className="input" placeholder="e.g. 4 hours" value={m.duration} onChange={e => setMod(i, 'duration', e.target.value)} /></div>
                    <div><L t="Assessment Type" /><select value={m.assessmentType} onChange={e => setMod(i, 'assessmentType', e.target.value)}>{ASSESSMENT.map(o => <option key={o}>{o}</option>)}</select></div>
                  </div>
                </div>
              ))}
              <button className="btn ghost sm" onClick={() => setMods(a => [...a, { title: '', materialId: '', week: (Number(a[a.length - 1]?.week) || 0) + 1, duration: '', assessmentType: 'None' }])}>+ Add Module</button>
            </Section>


            <Section title="Assessments" hint="Attach existing assessments learners will see under this plan.">
              {assmts.length === 0 ? <p className="muted">No assessments created yet.</p> :
                assmts.map((a: any) => (
                  <label key={a.id} style={{ display: 'flex', gap: 8, padding: '6px 0', alignItems: 'center' }}>
                    <input type="checkbox" checked={assessmentIds.includes(a.id)}
                      onChange={e => setAssessmentIds(ids => e.target.checked ? [...ids, a.id] : ids.filter(x => x !== a.id))} />
                    {a.name} <span className="muted">({(a.questions || []).length} Qs)</span>
                  </label>))}
            </Section>
            
            {/* 4 — Plan Details */}
            <Section title="4 · Plan Details">
              <L t="Description" />
              <textarea value={v.description} onChange={e => set('description', e.target.value)} placeholder="What this plan covers and who it's for…" />
              <div style={{ height: 8 }} />
              <L t="Expected Outcome" />
              <textarea value={v.expectedOutcome} onChange={e => set('expectedOutcome', e.target.value)} placeholder="What the learner can do after completing it…" />
              <div style={{ height: 8 }} />
              <L t="Trainer (optional — can be assigned later)" />
              <input className="input" value={v.trainer} onChange={e => set('trainer', e.target.value)} />
            </Section>
          </div>
        )}
      </Async>
    </Modal>
  )
}
function PlanView({ plan, onClose }: any) {
  const modules = (plan.items || []).slice().sort((a: any, b: any) => (a.week || 0) - (b.week || 0))
  const skills = plan.skillsCovered?.length
    ? plan.skillsCovered
    : (plan.skills || []).map((s: string) => ({ skill: s, level: '' }))
  const weeks = Array.from(new Set(modules.map((m: any) => m.week || 0))).sort((a: any, b: any) => a - b)
  const active = plan.status !== 'draft'

  const Stat = ({ label, value }: any) => (
    <div style={{ flex: 1, minWidth: 92, background: 'var(--bg)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 750, color: 'var(--primary)' }}>{value}</div>
      <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>{label}</div>
    </div>
  )
  const Chip = ({ k, v }: any) => v
    ? <span style={{ background: 'rgba(255,255,255,.18)', padding: '3px 10px', borderRadius: 999, fontSize: 12.5 }}>
      <span style={{ opacity: .8 }}>{k}: </span><b>{v}</b>
    </span>
    : null

  return (
    <Modal lg title="Training Plan" onClose={onClose} footer={<button className="btn ghost" onClick={onClose}>Close</button>}>
      <Async fetcher={() => Promise.all([api.planAssignments(plan.id), api.materials()])}>
        {([d, mats]: any) => {
          const matName = (id: string) => mats.find((x: any) => x.id === id)?.title
          const rows = d.rows || []
          return (
            <div>
              {/* Gradient banner (bleeds to modal edges) */}
              <div style={{ margin: '-22px -22px 18px', padding: 22, color: '#fff', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ fontSize: 22, fontWeight: 750, flex: 1 }}>{plan.name}</div>
                  <span className="badge" style={{ background: 'rgba(255,255,255,.22)', color: '#fff' }}>{active ? 'Active' : 'Draft'}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  <Chip k="Role" v={plan.targetRole} />
                  <Chip k="Primary skill" v={plan.primarySkill} />
                  <Chip k="Category" v={plan.category} />
                  <Chip k="Difficulty" v={plan.difficulty} />
                  <Chip k="Duration" v={plan.durationValue ? `${plan.durationValue} ${plan.durationUnit || ''}` : ''} />
                  <Chip k="Trainer" v={plan.trainer} />
                </div>
              </div>

              {/* Summary stats */}
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 18 }}>
                <Stat label="Modules" value={modules.length} />
                <Stat label="Weeks" value={weeks.filter((w: any) => w).length || '—'} />
                <Stat label="Skills" value={skills.length} />
                <Stat label="Assigned" value={rows.length} />
              </div>

              {/* Skills covered */}
              {skills.length > 0 && <>
                <div className="sec-title">Skills Covered</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
                  {skills.map((s: any, i: number) => (
                    <span key={i} className="badge b-info">{s.skill}{s.level ? ` · ${s.level}` : ''}</span>
                  ))}
                </div>
              </>}

              {/* Weekly timetable */}
              <div className="sec-title">Weekly Plan</div>
              {modules.length === 0 ? <p className="muted">No modules added.</p> :
                weeks.map((w: any) => (
                  <div key={w} style={{ marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '6px 0' }}>
                      <span className="badge b-info">{w ? `Week ${w}` : 'Unscheduled'}</span>
                      <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
                    </div>
                    {modules.filter((m: any) => (m.week || 0) === w).map((m: any, i: number) => (
                      <div key={i} className="card pad" style={{ marginBottom: 8, borderLeft: '3px solid var(--primary)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <b style={{ flex: 1 }}>{m.title || '—'}</b>
                          {m.duration && <span className="muted" style={{ fontSize: 13 }}>⏱ {m.duration}</span>}
                          {m.assessmentType && m.assessmentType !== 'None' && <span className="badge b-warn">{m.assessmentType}</span>}
                        </div>
                        {m.materialId && <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>📄 {matName(m.materialId) || m.materialId}</div>}
                      </div>
                    ))}
                  </div>))}

              {/* Plan details */}
              {(plan.description || plan.expectedOutcome) && <>
                <div className="sec-title" style={{ marginTop: 6 }}>Plan Details</div>
                {plan.description && <div className="card pad" style={{ marginBottom: 8 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Description</div>{plan.description}</div>}
                {plan.expectedOutcome && <div className="card pad" style={{ marginBottom: 8 }}>
                  <div className="muted" style={{ fontSize: 12, marginBottom: 4 }}>Expected outcome</div>{plan.expectedOutcome}</div>}
              </>}

              {/* Assigned employees */}
              <div className="sec-title" style={{ marginTop: 6 }}>Assigned Employees & Progress</div>
              {rows.length === 0 ? <p className="muted">No employees assigned yet.</p> :
                rows.map((r: any, i: number) => (
                  <div key={i} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                    <b style={{ flex: 1 }}>{r.name} <span className="muted">({r.employeeId})</span></b>
                    <span style={{ fontSize: 13 }}>{r.completed}/{r.items} done</span>
                    <div style={{ width: 120 }}><Bar value={r.avgPct} /></div>
                    <span style={{ width: 40, textAlign: 'right' }}>{r.avgPct}%</span>
                  </div>))}
            </div>
          )
        }}
      </Async>
    </Modal>
  )
}

export function AssignEmp({ title, onClose, onPick }: { title: string; onClose: () => void; onPick: (id: string) => Promise<void> }) {
  const [id, setId] = useState('')
  return <Async fetcher={api.employees}>
    {(emps: any[]) => {
      if (!id && emps[0]) setId(emps[0].id)
      return <Modal title={title} onClose={onClose} footer={
        <><button className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn" onClick={async () => { await onPick(id); onClose() }}>Assign</button></>
      }>
        <label className="fld">Employee</label>
        <select value={id} onChange={e => setId(e.target.value)}>
          {emps.map(e => <option key={e.id} value={e.id}>{e.name} ({e.id})</option>)}
        </select>
      </Modal>
    }}
  </Async>
}