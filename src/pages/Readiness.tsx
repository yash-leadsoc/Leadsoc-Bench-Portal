import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, pctBadge, Bar, Badge } from '../components/ui'
import { Table } from '../components/Table'
import { Modal } from '../components/Modal'

export default function Readiness() {
  const [ins, setIns] = useState<any>(null)
  return (
    <Async fetcher={api.benchReadiness}>
      {(rows: any[]) => (
        <>
          <PageHead title="Readiness" sub="Blended from skills, training and assessments" />
          <Table rows={rows} empty="No employees"
            cols={[
              { h: 'Employee', c: r => <b>{r.name} <span className="muted">{r.id}</span></b> },
              { h: 'BU', c: r => r.bu },
              { h: 'Readiness', c: r => <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Bar value={r.readiness} />{pctBadge(r.readiness)}</div> },
              { h: 'Deployable', c: r => r.deployable ? <Badge text="Yes" kind="ok" /> : <Badge text="Not yet" kind="mut" /> },
            ]}
            actions={r => <button className="btn ghost sm" onClick={() => setIns(r)}>AI insight</button>} />
          {ins && <Modal lg title={`Insight — ${ins.name}`} onClose={() => setIns(null)} footer={<button className="btn ghost" onClick={() => setIns(null)}>Close</button>}>
            <Async fetcher={() => api.insightEmployee(ins.id)}>
              {(x: any) => (
                <>
                  <div className="grid kpis">
                    <div className="card kpi"><div className="ic">🎯</div><div><div className="v">{x.readinessScore || 0}%</div><div className="l">Readiness</div></div></div>
                    <div className="card kpi"><div className="ic">🎓</div><div><div className="v">{x.trainingCompletionPct || 0}%</div><div className="l">Training</div></div></div>
                    <div className="card kpi"><div className="ic">📝</div><div><div className="v">{x.assessmentPassRatePct || 0}%</div><div className="l">Pass rate</div></div></div>
                  </div>
                  <div className="card pad" style={{ marginTop: 12 }}><b>Summary</b> <Badge text={x.provider} kind="info" /><p style={{ marginTop: 8 }}>{x.summary}</p></div>
                  <div className="sec-title" style={{ marginTop: 12 }}>Upgrade suggestions</div>
                  {(x.suggestions || []).map((s: string, i: number) => <div key={i} className="card pad" style={{ marginBottom: 8 }}>→ {s}</div>)}
                </>
              )}
            </Async>
          </Modal>}
        </>
      )}
    </Async>
  )
}
