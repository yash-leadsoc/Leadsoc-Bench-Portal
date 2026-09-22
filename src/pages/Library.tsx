import { useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../store/auth'
import { Async } from '../components/Async'
import { PageHead, Badge } from '../components/ui'
import { FormModal, DownloadBtn } from '../components/Form'
import { Modal } from '../components/Modal'
import { useToast } from '../store/toast'

export default function Library() {
  const { user } = useAuth()
  const staff = ['admin', 'buHead', 'ta'].includes(user?.role)
  const [tab, setTab] = useState('domains')
  const tabs = staff ? ['domains', 'docs', 'pending'] : ['domains', 'docs']
  return (
    <>
      <PageHead title="Knowledge Library" sub="Domain-wise material — read, then take the domain quiz" />
      <div className="tabs">{tabs.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
      {tab === 'domains' && <Domains staff={staff} />}
      {tab === 'docs' && <Docs />}
      {tab === 'pending' && <Pending />}
    </>
  )
}

function Docs() {
  const toast = useToast(); const { user } = useAuth(); const [form, setForm] = useState(false)
  return <Async fetcher={api.libDocs}>{(rows: any[], reload) => {
    const byDomain: any = {}; rows.forEach(d => (byDomain[d.domain || 'General'] = byDomain[d.domain || 'General'] || []).push(d))
    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm(true)}>+ Add / Upload</button></div>
        {rows.length === 0 && <div className="card"><div className="empty">No documents yet</div></div>}
        {Object.entries(byDomain).map(([dom, items]: any) => (
          <div key={dom} className="card pad" style={{ marginBottom: 12 }}>
            <b>{dom}</b>
            {items.map((d: any) => (
              <div key={d.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                <span style={{ flex: 1 }}><b>{d.title}</b> {d.approved !== true && <Badge text="Pending" kind="warn" />}<div className="muted" style={{ fontSize: 11 }}>by {d.uploadedByName}</div></span>
                <DownloadBtn url={d.url} />
              </div>))}
          </div>))}
        {form && <FormModal title="Add document" onClose={() => setForm(false)} upload={{ label: 'Upload file (pdf/doc/ppt/xlsx)' }}
          fields={[{ key: 'domain', label: 'Domain (e.g. Java, VLSI)' }, { key: 'title', label: 'Title' },
            { key: 'type', label: 'Type', type: 'select', options: ['pdf', 'doc', 'ppt', 'excel', 'link'], value: 'pdf' },
            { key: 'url', label: 'External URL (optional if uploading)' }, { key: 'description', label: 'Description', type: 'textarea' }]}
          onSubmit={async v => { await api.addLibDoc(v); reload(); toast(user?.role === 'benchEngineer' ? 'Submitted — awaiting approval' : 'Added') }} />}
      </>
    )
  }}</Async>
}

function Pending() {
  const toast = useToast()
  return <Async fetcher={api.libPending}>{(rows: any[], reload) => (
    <>
      {rows.length === 0 && <div className="card"><div className="empty">Nothing awaiting approval</div></div>}
      {rows.map((d: any) => (
        <div key={d.id} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}><b>{d.title}</b> · {d.domain}<div className="muted">by {d.uploadedByName} · {d.type}</div></div>
          <button className="btn ghost sm" onClick={async () => { await api.approveLibDoc(d.id); reload(); toast('Approved') }}>Approve</button>
          <button className="btn ghost sm danger" onClick={async () => { await api.deleteLibDoc(d.id); reload() }}>Reject</button>
        </div>))}
    </>
  )}</Async>
}

function Domains({ staff }: { staff: boolean }) {
  const toast = useToast(); const [quizFor, setQuizFor] = useState<any>(null); const [take, setTake] = useState<any>(null); const [prog, setProg] = useState<any>(null)
  return <Async fetcher={api.libDomains}>{(d: any, reload) => (
    <>
      {(d.rows || []).length === 0 && <div className="card"><div className="empty">No domains yet — add documents first</div></div>}
      {(d.rows || []).map((r: any) => (
        <div key={r.domain} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
          <div style={{ flex: 1 }}><b>{r.domain}</b><div className="muted">{r.docCount} doc(s) · {r.hasQuiz ? `${r.quizQuestions} quiz Qs` : 'no quiz'}</div></div>
          {r.myScorePct != null && <Badge text={`${r.myScorePct}%`} kind={r.completed ? 'ok' : 'warn'} />}
          {staff && <button className="btn ghost sm" onClick={() => setQuizFor(r.domain)}>Set Quiz</button>}
          {staff && <button className="btn ghost sm" onClick={() => setProg(r.domain)}>Progress</button>}
          {!staff && r.hasQuiz && <button className="btn ghost sm" onClick={() => setTake(r.domain)}>{r.completed ? 'Retake' : 'Take Quiz'}</button>}
        </div>))}
      {quizFor && <SetQuiz domain={quizFor} onClose={() => setQuizFor(null)} onSaved={() => { reload(); toast('Quiz saved') }} />}
      {take && <TakeQuiz domain={take} onClose={() => setTake(null)} onDone={() => reload()} />}
      {prog && <Modal title={`${prog} — progress`} onClose={() => setProg(null)} footer={<button className="btn ghost" onClick={() => setProg(null)}>Close</button>}>
        <Async fetcher={() => api.libDomainProgress(prog)}>{(x: any) => (x.rows || []).length === 0 ? <p className="muted">No one has taken this quiz.</p> :
          (x.rows || []).map((p: any, i: number) => <div key={i} style={{ display: 'flex', padding: '6px 0' }}><span style={{ flex: 1 }}>{p.name || p.employeeId}</span><Badge text={`${p.scorePct || 0}%`} kind={p.completed ? 'ok' : 'warn'} /></div>)}</Async>
      </Modal>}
    </>
  )}</Async>
}

function SetQuiz({ domain, onClose, onSaved }: any) {
  return <Async fetcher={() => api.libQuiz(domain)}>{(qz: any) => <SetQuizForm domain={domain} initial={qz.questions || []} onClose={onClose} onSaved={onSaved} />}</Async>
}
function SetQuizForm({ domain, initial, onClose, onSaved }: any) {
  const [qs, setQs] = useState<any[]>(JSON.parse(JSON.stringify(initial)))
  return <Modal lg title={`Quiz — ${domain}`} onClose={onClose} footer={<><button className="btn ghost" onClick={onClose}>Cancel</button>
    <button className="btn" onClick={async () => { await api.setLibQuiz({ domain, questions: qs }); onClose(); onSaved() }}>Save quiz</button></>}>
    {qs.map((q, i) => (
      <div key={i} className="card pad" style={{ marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}><input className="input" placeholder="Question" value={q.text} onChange={e => { q.text = e.target.value; setQs([...qs]) }} />
          <button className="btn ghost sm danger" onClick={() => setQs(qs.filter((_, j) => j !== i))}>✕</button></div>
        {(q.options || ['', '']).map((o: string, oi: number) => (
          <div key={oi} style={{ display: 'flex', gap: 8, marginTop: 6, alignItems: 'center' }}>
            <input type="radio" checked={q.correctIndex === oi} onChange={() => { q.correctIndex = oi; setQs([...qs]) }} />
            <input className="input" value={o} onChange={e => { q.options[oi] = e.target.value; setQs([...qs]) }} /></div>))}
        <button className="btn ghost sm" style={{ marginTop: 6 }} onClick={() => { q.options = [...(q.options || []), '']; setQs([...qs]) }}>+ Option</button>
      </div>))}
    <button className="btn ghost" onClick={() => setQs([...qs, { text: '', options: ['', ''], correctIndex: 0 }])}>+ Add question</button>
  </Modal>
}
function TakeQuiz({ domain, onClose, onDone }: any) {
  const toast = useToast()
  return <Async fetcher={() => api.libQuiz(domain)}>{(qz: any) => <TakeForm qz={qz} domain={domain} onClose={onClose} onDone={onDone} toast={toast} />}</Async>
}
function TakeForm({ qz, domain, onClose, onDone, toast }: any) {
  const qs = qz.questions || []; const [ch, setCh] = useState<any>({})
  if (!qs.length) { onClose(); toast('No quiz for this domain', 'err'); return null }
  return <Modal lg title={`${domain} quiz`} onClose={onClose} footer={<><button className="btn ghost" onClick={onClose}>Cancel</button>
    <button className="btn" onClick={async () => {
      let correct = 0; qs.forEach((q: any, i: number) => { if (ch[i] === (q.correctIndex ?? 0)) correct++ })
      const r = await api.submitLibQuiz({ domain, scoreMarks: correct, totalMarks: qs.length })
      onClose(); onDone(); toast(`Scored ${r.scorePct}% — ${r.passed ? 'passed' : 'keep studying'}`, r.passed ? 'ok' : 'err')
    }}>Submit</button></>}>
    {qs.map((q: any, i: number) => (
      <div key={i} style={{ marginBottom: 12 }}><b>Q{i + 1}. {q.text}</b>
        {(q.options || []).map((o: string, oi: number) => (
          <label key={oi} style={{ display: 'flex', gap: 8, padding: '4px 0', alignItems: 'center' }}>
            <input type="radio" checked={ch[i] === oi} onChange={() => setCh({ ...ch, [i]: oi })} /> {o}</label>))}
      </div>))}
  </Modal>
}
