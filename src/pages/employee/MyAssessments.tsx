import { useState } from 'react'
import { api } from '../../api/api'
import { Async } from '../../components/Async'
import { PageHead, statusBadge, Badge, Empty } from '../../components/ui'
import { Modal } from '../../components/Modal'
import { useToast } from '../../store/toast'

export default function MyAssessments() {
  const [take, setTake] = useState<any>(null); const [result, setResult] = useState<any>(null)
  return (
    <Async fetcher={api.myAssignments}>
      {(rows: any[], reload) => (
        <>
          <PageHead title="My Assessments" sub="Attempt assigned assessments and view results" />
          {rows.length === 0 && <div className="card"><Empty msg="No assessments assigned" /></div>}
          {rows.map((a: any) => {
            const used = a.attemptsUsed || 0; const limit = a.attemptLimit || 1; const canAttempt = used < limit && a.status !== 'completed' || (a.status === 'completed' && used < limit)
            return (
              <div key={a.id} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <b>{a.assessmentName || a.name}</b>
                  <div className="muted" style={{ fontSize: 12 }}>Due {a.dueDate || '—'} · attempts {used}/{limit}</div>
                </div>
                {statusBadge(a.status)}
                {a.result && <Badge text={`${a.result.scoreMarks}/${a.result.totalMarks}`} kind={a.result.passed ? 'ok' : 'bad'} />}
                {(a.status === 'completed' || used > 0) && <button className="btn ghost sm" onClick={() => setResult(a)}>Result</button>}
                {used < limit && <button className="btn sm" onClick={() => setTake(a)}>{used > 0 ? 'Re-attempt' : 'Start'}</button>}
              </div>)
          })}
          {take && <TakeAssessment asg={take} onClose={() => setTake(null)} onDone={reload} />}
          {result && <ResultModal asg={result} onClose={() => setResult(null)} />}
        </>
      )}
    </Async>
  )
}

function TakeAssessment({ asg, onClose, onDone }: any) {
  const toast = useToast()
  return <Async fetcher={() => api.assessment(asg.assessmentId || asg.id)}>
    {(a: any) => <TakeForm a={a} asg={asg} onClose={onClose} onDone={onDone} toast={toast} />}
  </Async>
}
function TakeForm({ a, asg, onClose, onDone, toast }: any) {
  const qs = a.questions || []; const [ch, setCh] = useState<any>({}); const [start] = useState(Date.now())
  return <Modal lg title={a.name} onClose={onClose} footer={
    <><button className="btn ghost" onClick={onClose}>Cancel</button>
           <button className="btn" onClick={async () => {
        let correct = 0
        const answers = qs.map((q: any, i: number) => {
          const chosen = ch[i]
          const correctIndex = q.correctIndex ?? 0
          const isCorrect = chosen === correctIndex
          if (isCorrect) correct++
          return {
            text: q.text,
            chosenIndex: chosen ?? null,
            chosenText: chosen != null ? q.options?.[chosen] : null,
            correctIndex,
            correctText: q.options?.[correctIndex],
            correct: isCorrect,
          }
        })
        const timeSec = Math.round((Date.now() - start) / 1000)
        await api.submit(asg.id, { scoreMarks: correct, totalMarks: qs.length, correct, incorrect: qs.length - correct, timeTakenSeconds: timeSec, answers })
        onClose(); onDone(); toast(`Scored ${correct}/${qs.length}`)
      }}>Submit</button></>
  }>
    {qs.length === 0 && <p className="muted">This assessment has no questions.</p>}
    {qs.map((q: any, i: number) => (
      <div key={i} style={{ marginBottom: 14 }}>
        <b>Q{i + 1}. {q.text}</b>
        {(q.options || []).map((o: string, oi: number) => (
          <label key={oi} style={{ display: 'flex', gap: 8, padding: '4px 0', alignItems: 'center' }}>
            <input type="radio" checked={ch[i] === oi} onChange={() => setCh({ ...ch, [i]: oi })} /> {o}</label>))}
      </div>))}
  </Modal>
}
function ResultModal({ asg, onClose }: any) {
  return <Modal lg title="Assessment result" onClose={onClose} footer={<button className="btn ghost" onClick={onClose}>Close</button>}>
    <Async fetcher={() => api.assignmentResult(asg.id)}>
      {(r: any) => (
        <>
          <div className="grid kpis">
            <div className="card kpi"><div className="ic">🏆</div><div><div className="v">{r.scoreMarks}/{r.totalMarks}</div><div className="l">Score</div></div></div>
            <div className="card kpi"><div className="ic">%</div><div><div className="v">{r.scorePct || Math.round(100 * r.scoreMarks / (r.totalMarks || 1))}%</div><div className="l">Percentage</div></div></div>
            <div className="card kpi"><div className="ic">{r.passed ? '✅' : '❌'}</div><div><div className="v">{r.passed ? 'Pass' : 'Fail'}</div><div className="l">Result</div></div></div>
          </div>
          {(r.answers || r.questions || []).length > 0 && <div className="sec-title" style={{ marginTop: 14 }}>Question review</div>}
          {(r.answers || r.questions || []).map((q: any, i: number) => (
            <div key={i} className="card pad" style={{ marginBottom: 8 }}>
              <b>Q{i + 1}. {q.text}</b>
              <div>Your answer: {q.chosenText ?? q.chosen ?? '—'}</div>
              <div>Correct answer: {q.correctText ?? '—'}</div>
              <Badge text={q.correct ? 'Correct' : 'Incorrect'} kind={q.correct ? 'ok' : 'bad'} />
            </div>))}
        </>
      )}
    </Async>
  </Modal>
}
