import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, statusBadge, Badge } from '../components/ui'
import { Table } from '../components/Table'
import { Modal } from '../components/Modal'
import { Confirm } from '../components/Form'
import { useToast } from '../store/toast'

export default function Assessments() {
  const toast = useToast()
  const [edit, setEdit] = useState<any>(null)
  const [assign, setAssign] = useState<any>(null)
  const [viewR, setViewR] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  return (
    <Async fetcher={api.assessments}>
      {(rows: any[], reload) => (
        <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn" onClick={() => setEdit({ questions: [] })}>+ New Assessment</button>
          </div>
          <Table rows={rows} empty="No assessments"
            cols={[
              { h: 'Name', c: r => <b>{r.name}</b> },
              { h: 'Skill', c: r => r.skill },
              { h: 'Questions', c: r => (r.questions || []).length },
              { h: 'Pass %', c: r => `${r.passingScorePct ?? 60}%` },
              { h: 'Status', c: r => statusBadge(r.status) },
            ]}
            actions={r => (<>
              <button className="btn ghost sm" onClick={() => setViewR(r)}>Results</button>
              <button className="btn ghost sm" onClick={() => setAssign(r)}>Assign</button>
              <button className="btn ghost sm" onClick={() => setEdit(r)}>Edit</button>
              <button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button>
            </>)} />
          {edit && <Builder a={edit} onClose={() => setEdit(null)} onSaved={() => { reload(); toast('Saved') }} />}
          {assign && <AssignMany a={assign} onClose={() => setAssign(null)} onDone={() => toast('Assigned')} />}
          {viewR && <ResultsView a={viewR} onClose={() => setViewR(null)} />}
          {del && <Confirm msg="Delete this assessment?" onClose={() => setDel(null)}
            onYes={async () => { await api.deleteAssessment(del.id); reload(); toast('Deleted') }} />}
        </>
      )}
    </Async>
  )
}

function Builder({ a, onClose, onSaved }: any) {
  const [name, setName] = useState(a.name || ''); const [skill, setSkill] = useState(a.skill || '')
  const [pass, setPass] = useState(a.passingScorePct ?? 60); const [status, setStatus] = useState(a.status || 'draft')
  const [qs, setQs] = useState<any[]>(a.questions ? JSON.parse(JSON.stringify(a.questions)) : [])
  const save = async () => {
    const body = { name, skill, passingScorePct: Number(pass), status, difficulty: a.difficulty || 'medium', questions: qs }
    a.id ? await api.editAssessment(a.id, body) : await api.createAssessment(body); onClose(); onSaved()
  }
  return <Modal lg title={a.id ? 'Edit Assessment' : 'New Assessment'} onClose={onClose} footer={
    <><button className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" onClick={save}>Save</button></>
  }>
    <label className="fld">Name</label><input className="input" value={name} onChange={e => setName(e.target.value)} />
    <div className="two">
      <div><label className="fld">Skill</label><input className="input" value={skill} onChange={e => setSkill(e.target.value)} /></div>
      <div><label className="fld">Pass %</label><input className="input" type="number" value={pass} onChange={e => setPass(e.target.value)} /></div>
    </div>
    <label className="fld">Status</label>
    <select value={status} onChange={e => setStatus(e.target.value)}><option>draft</option><option>published</option><option>archived</option></select>
    <div style={{ display: 'flex', alignItems: 'center', marginTop: 14 }}>
      <b style={{ flex: 1 }}>Questions</b>
      <button className="btn ghost sm" onClick={() => setQs([...qs, { text: '', options: ['', ''], correctIndex: 0 }])}>+ Add question</button>
    </div>
    {qs.map((q, i) => (
      <div key={i} className="card pad" style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea  className="input" placeholder="Question" value={q.text} onChange={e => { q.text = e.target.value; setQs([...qs]) }} />
          <button className="btn ghost sm danger" onClick={() => setQs(qs.filter((_, j) => j !== i))}>✕</button>
        </div>
        {q.options.map((o: string, oi: number) => (
          <div key={oi} style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <input type="radio" checked={q.correctIndex === oi} onChange={() => { q.correctIndex = oi; setQs([...qs]) }} />
            <textarea className="input" placeholder={`Option ${oi + 1}`} value={o} onChange={e => { q.options[oi] = e.target.value; setQs([...qs]) }} />
          </div>))}
        <button className="btn ghost sm" style={{ marginTop: 6 }} onClick={() => { q.options.push(''); setQs([...qs]) }}>+ Option</button>
      </div>))}
  </Modal>
}

function AssignMany({ a, onClose, onDone }: any) {
  const [sel, setSel] = useState<Set<string>>(new Set()); const [due, setDue] = useState('')
  return <Async fetcher={api.employees}>{(emps: any[]) => (
    <Modal title={`Assign — ${a.name}`} onClose={onClose} footer={
      <><button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={async () => { if (!sel.size) return; await api.assignAssessment(a.id, [...sel], due || undefined); onClose(); onDone() }}>Assign</button></>
    }>
      <label className="fld">Due date (YYYY-MM-DD)</label><input className="input" value={due} onChange={e => setDue(e.target.value)} />
      <div style={{ maxHeight: 260, overflow: 'auto', marginTop: 8 }}>
        {emps.map(e => (
          <label key={e.id} style={{ display: 'flex', gap: 8, padding: '6px 0', alignItems: 'center' }}>
            <input type="checkbox" checked={sel.has(e.id)} onChange={ev => { const n = new Set(sel); ev.target.checked ? n.add(e.id) : n.delete(e.id); setSel(n) }} />
            {e.name} <span className="muted">({e.id})</span>
          </label>))}
      </div>
    </Modal>
  )}</Async>
}

// function ResultsView({ a, onClose }: any) {
//   return <Modal lg title={`Results — ${a.name}`} onClose={onClose} footer={<button className="btn ghost" onClick={onClose}>Close</button>}>
//     <Async fetcher={() => Promise.all([api.assessmentAssignments(a.id), api.assessmentResults(a.id), api.employees()])}>
//       {([asgs, results, emps]: any) => {
//         const name: any = {}; emps.forEach((e: any) => name[e.id] = e.name)
//         const byEmp: any = {}
//         results.forEach((r: any) => {
//           const cur = byEmp[r.employeeId]
//           if (!cur || (r.attemptNumber || 0) >= (cur.attemptNumber || 0)) byEmp[r.employeeId] = r
//         })
//         return asgs.length === 0
//           ? <p className="muted">Not assigned yet.</p>
//           : asgs.map((asg: any, i: number) =>
//               <ResultRow key={i} asg={asg} r={byEmp[asg.employeeId]} name={name[asg.employeeId] || asg.employeeId} />)
//       }}
//     </Async>
//   </Modal>
// }

function ResultsView({ a, onClose }: any) {
  return <Modal lg title={`Results — ${a.name}`} onClose={onClose} footer={<button className="btn ghost" onClick={onClose}>Close</button>}>
    <Async fetcher={() => Promise.all([api.assessmentAssignments(a.id), api.assessmentResults(a.id), api.employees()])}>
      {([asgs, results, emps]: any) => {
        const name: any = {}; emps.forEach((e: any) => name[e.id] = e.name)
        const byEmp: any = {}
        results.forEach((r: any) => {
          const cur = byEmp[r.employeeId]
          if (!cur || (r.attemptNumber || 0) >= (cur.attemptNumber || 0)) byEmp[r.employeeId] = r
        })
        return asgs.length === 0
          ? <p className="muted">Not assigned yet.</p>
          : asgs.map((asg: any, i: number) =>
              <ResultRow key={i} asg={asg} r={byEmp[asg.employeeId]} name={name[asg.employeeId] || asg.employeeId} />)
      }}
    </Async>
  </Modal>
}

function ResultRow({ asg, r, name }: any) {
  const [open, setOpen] = useState(false)
  const pct = r && r.totalMarks ? Math.round(100 * r.scoreMarks / r.totalMarks) : 0
  return (
    <div className="card pad" style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <b>{name}</b> <span className="muted">({asg.employeeId})</span>
          <div className="muted" style={{ fontSize: 12 }}>Due {asg.dueDate || '—'}{r ? ` · attempt ${r.attemptNumber || 1}` : ''}</div>
        </div>
        {r ? <>
          <Badge text={`${r.scoreMarks}/${r.totalMarks} · ${pct}%`} kind={r.passed ? 'ok' : 'bad'} />
          <Badge text={r.passed ? 'PASS' : 'FAIL'} kind={r.passed ? 'ok' : 'bad'} />
          {(r.answers || []).length > 0 &&
            <button className="btn ghost sm" onClick={() => setOpen(o => !o)}>{open ? 'Hide' : 'View answers'}</button>}
        </> : statusBadge(asg.status)}
      </div>

      {open && (r.answers || []).map((q: any, qi: number) => (
        <div key={qi} style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginTop: 10 }}>
          <b>Q{qi + 1}. {q.text}</b>
          <div style={{ marginTop: 4, fontSize: 14 }}>
            <span className="muted">Answered: </span>
            <span style={{ color: q.correct ? 'var(--ok)' : 'var(--bad)' }}>{q.chosenText ?? '— not answered —'}</span>
          </div>
          {!q.correct && <div style={{ fontSize: 14 }}>
            <span className="muted">Correct: </span><span style={{ color: 'var(--ok)' }}>{q.correctText}</span>
          </div>}
          <div style={{ marginTop: 6 }}><Badge text={q.correct ? 'Correct' : 'Incorrect'} kind={q.correct ? 'ok' : 'bad'} /></div>
        </div>
      ))}
    </div>
  )
}