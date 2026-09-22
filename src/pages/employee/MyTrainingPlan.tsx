import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { fileUrl } from '../../api/client'
import { Async } from '../../components/Async'
import { useToast } from '../../store/toast'

const extUrl = (u = '') => /^https?:\/\//i.test(u) ? u : `https://${u}`
const fmtDate = (s?: string) => s ? new Date(s).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

export default function MyTrainingPlan() {
  const { planId } = useParams()
  const nav = useNavigate()
  return (
    <Async fetcher={() => api.myTrainingPlan(planId!)}>
      {(d: any) => <PlanPage initial={d} onBack={() => nav('/my-training')} nav={nav} />}
    </Async>
  )
}

function PlanPage({ initial, onBack, nav }: any) {
  const toast = useToast()
  const [tab, setTab] = useState<'modules' | 'assessments' | 'notes'>('modules')
  const [mods, setMods] = useState<any[]>(initial.modules || [])
  const [assessments] = useState<any[]>(initial.assessments || [])
  const [notes, setNotes] = useState<any[]>(initial.notes || [])
  const [busy, setBusy] = useState<string | null>(null)

  const total = mods.length
  const done = mods.filter(m => m.completed).length
  const pct = total ? Math.round(100 * done / total) : 0

  const toggle = async (m: any) => {
    const next = !m.completed
    setBusy(m.key)
    setMods(a => a.map(x => x.key === m.key ? { ...x, completed: next } : x))
    try { await api.completeModule({ planId: initial.id, key: m.key, title: m.title, completed: next }) }
    catch (e: any) { setMods(a => a.map(x => x.key === m.key ? { ...x, completed: !next } : x)); toast(e.message || 'Failed') }
    finally { setBusy(null) }
  }

  return (
    <div>
      <a onClick={onBack} style={{ cursor: 'pointer', fontWeight: 600, display: 'inline-flex', gap: 6, marginBottom: 16 }}>← Back to My Training</a>

      {/* Header card */}
      <div className="card" style={{ padding: 22, marginBottom: 18, background: 'linear-gradient(135deg, var(--primary-50), #fff)' }}>
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ width: 76, height: 76, borderRadius: 16, background: '#fff', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', fontSize: 34 }}>📘</div>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div style={{ fontSize: 26, fontWeight: 780 }}>{initial.name}</div>
            <div style={{ marginTop: 4 }}><span className="muted">Target Role · </span><b>{initial.targetRole || '—'}</b></div>
            <div style={{ marginTop: 2 }}><span className="muted">Skills · </span>{[initial.primarySkill, ...(initial.skillsCovered?.map((s: any) => s.skill) || [])].filter(Boolean).join(' · ') || '—'}</div>
            <div style={{ marginTop: 8 }}>
              <span className={`badge ${pct === 100 ? 'b-ok' : 'b-info'}`}>{pct === 100 ? 'Completed' : 'In Progress'}</span>
            </div>
          </div>
          <div style={{ minWidth: 240 }}>
            <div className="muted" style={{ fontSize: 13, fontWeight: 600 }}>Overall Progress</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 6 }}>
              <div style={{ flex: 1, height: 8, background: 'var(--mut-bg)', borderRadius: 99 }}>
                <div style={{ width: `${pct}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg, var(--primary), #8b5cf6)', transition: 'width .25s' }} />
              </div>
              <b style={{ fontSize: 18 }}>{pct}%</b>
            </div>
            <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>{done} of {total} modules completed</div>
          </div>
          {(initial.startDate || initial.expectedEndDate) && (
            <div className="card pad" style={{ minWidth: 190 }}>
              <div className="muted" style={{ fontSize: 12 }}>Start Date</div>
              <b>{fmtDate(initial.startDate)}</b>
              <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Expected End Date</div>
              <b>{fmtDate(initial.expectedEndDate)}</b>
            </div>)}
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'modules' ? 'active' : ''}`} onClick={() => setTab('modules')}>📖 Modules</button>
        <button className={`tab ${tab === 'assessments' ? 'active' : ''}`} onClick={() => setTab('assessments')}>📝 Assessments</button>
        <button className={`tab ${tab === 'notes' ? 'active' : ''}`} onClick={() => setTab('notes')}>🗒️ Notes</button>
      </div>

      {tab === 'modules' && (
        <div className="two" style={{ alignItems: 'start' }}>
          {/* Modules list */}
          <div className="card pad">
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <b style={{ flex: 1, fontSize: 17 }}>Training Modules</b>
              <b style={{ color: 'var(--ok)' }}>{done} / {total} Completed</b>
            </div>
            {mods.length === 0 && <p className="muted">No modules in this plan.</p>}
            {mods.map((m, i) => (
              <div key={m.key} className="card pad" style={{ marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <button onClick={() => toggle(m)} disabled={busy === m.key} title="Toggle complete"
                  style={{ width: 34, height: 34, borderRadius: 999, border: 'none', cursor: 'pointer', flexShrink: 0, fontWeight: 700,
                    background: m.completed ? 'var(--ok)' : 'var(--mut-bg)', color: m.completed ? '#fff' : 'var(--ink)' }}>
                  {m.completed ? '✓' : i + 1}
                </button>
                <div style={{ flex: 1 }}>
                  <b>{m.title}</b>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {m.week ? <span>Week {m.week}</span> : null}
                    {m.materialTitle && <span>📄 {m.materialTitle}</span>}
                    {m.duration && <span>⏱ {m.duration}</span>}
                  </div>
                </div>
                <span className={`badge ${m.completed ? 'b-ok' : 'b-mut'}`}>{m.completed ? 'Completed' : 'Not Started'}</span>
                {m.url && (m.materialType === 'link'
                  ? <a className="btn ghost sm" href={extUrl(m.url)} target="_blank" rel="noreferrer">↗</a>
                  : <a className="btn ghost sm" href={fileUrl(m.downloadUrl || m.url)} target="_blank" rel="noreferrer">⬇</a>)}
              </div>))}
          </div>

          {/* Sidebar: assessments + notes summary */}
          <div>
            <div className="card pad" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ flex: 1 }}>Assessments</b>
                {assessments.length > 0 && <a onClick={() => setTab('assessments')} style={{ cursor: 'pointer', fontSize: 13 }}>View All</a>}
              </div>
              {assessments.length === 0 ? <p className="muted" style={{ fontSize: 13 }}>None linked.</p>
                : assessments.slice(0, 4).map((a, i) => <AssessRow key={i} a={a} onClick={() => nav('/my-assessments')} />)}
            </div>
            <div className="card pad">
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
                <b style={{ flex: 1 }}>Notes</b>
                <a onClick={() => setTab('notes')} style={{ cursor: 'pointer', fontSize: 13 }}>View All</a>
              </div>
              {notes.length === 0 ? <p className="muted" style={{ fontSize: 13 }}>No notes yet.</p>
                : notes.slice(0, 3).map((n, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0' }}>
                    <span style={{ fontSize: 18 }}>🗒️</span>
                    <div style={{ flex: 1 }}><b style={{ fontSize: 13.5 }}>{n.title || 'Note'}</b>
                      <div className="muted" style={{ fontSize: 12.5 }}>{n.body}</div></div>
                    <span className="muted" style={{ fontSize: 11 }}>{fmtDate(n.date)}</span>
                  </div>))}
            </div>
          </div>
        </div>)}

      {tab === 'assessments' && (
        <div className="card pad">
          <b style={{ fontSize: 17 }}>Assessments</b>
          <div style={{ marginTop: 10 }}>
            {assessments.length === 0 ? <p className="muted">No assessments linked to this plan.</p>
              : assessments.map((a, i) => <AssessRow key={i} a={a} onClick={() => nav('/my-assessments')} big />)}
          </div>
        </div>)}

      {tab === 'notes' && (
        <NotesPanel planId={initial.id} notes={notes} setNotes={setNotes} />)}
    </div>
  )
}

function AssessRow({ a, onClick, big }: any) {
  const done = a.status === 'completed'
  const badge = done
    ? <span className="badge b-ok">Score: {a.scoreMarks}/{a.totalMarks}</span>
    : a.status === 'pending' ? <span className="badge b-info">Pending</span> : <span className="badge b-mut">Not Started</span>
  return (
    <div onClick={onClick} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: big ? '12px 0' : '8px 0', borderBottom: '1px solid var(--line)', cursor: 'pointer' }}>
      <span style={{ width: 26, height: 26, borderRadius: 999, display: 'grid', placeItems: 'center', flexShrink: 0,
        background: done ? 'var(--ok)' : 'transparent', border: done ? 'none' : '2px solid var(--line)', color: '#fff', fontSize: 13 }}>{done ? '✓' : ''}</span>
      <b style={{ flex: 1, fontSize: big ? 15 : 13.5 }}>{a.name}</b>
      {badge}
      <span className="muted">›</span>
    </div>)
}

function NotesPanel({ planId, notes, setNotes }: any) {
  const toast = useToast()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [busy, setBusy] = useState(false)

  const add = async () => {
    if (!body.trim() && !title.trim()) return
    setBusy(true)
    try {
      const r = await api.addTrainingNote(planId, { title, body })
      setNotes([{ id: r.id, title, body, date: new Date().toISOString().slice(0, 10) }, ...notes])
      setTitle(''); setBody(''); toast('Note added')
    } catch (e: any) { toast(e.message || 'Failed') } finally { setBusy(false) }
  }
  const del = async (n: any) => {
    setNotes(notes.filter((x: any) => x.id !== n.id))
    try { await api.deleteTrainingNote(n.id) } catch { /* ignore */ }
  }

  return (
    <div className="two" style={{ alignItems: 'start' }}>
      <div className="card pad">
        <b style={{ fontSize: 17 }}>My Notes</b>
        {notes.length === 0 && <p className="muted" style={{ marginTop: 10 }}>No notes yet — add your first note.</p>}
        <div style={{ marginTop: 10 }}>
          {notes.map((n: any, i: number) => (
            <div key={i} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10 }}>
              <span style={{ fontSize: 20 }}>🗒️</span>
              <div style={{ flex: 1 }}>
                <b>{n.title || 'Note'}</b>
                <div style={{ fontSize: 14, marginTop: 2 }}>{n.body}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>{fmtDate(n.date)}</div>
              </div>
              {n.id && <button className="btn ghost sm danger" onClick={() => del(n)}>✕</button>}
            </div>))}
        </div>
      </div>
      <div className="card pad">
        <b style={{ fontSize: 17 }}>Add a note</b>
        <label className="fld">Title</label>
        <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Important Concepts" />
        <label className="fld">Note</label>
        <textarea value={body} onChange={e => setBody(e.target.value)} placeholder="Write your note…" />
        <button className="btn" style={{ marginTop: 10 }} onClick={add} disabled={busy}>{busy ? 'Saving…' : 'Add Note'}</button>
      </div>
    </div>)
}