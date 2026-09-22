import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, pctBadge, Bar } from '../components/ui'
import { Table } from '../components/Table'
import { Modal } from '../components/Modal'

export default function Progress() {
  const [view, setView] = useState<any>(null)
  return (
    <Async fetcher={api.employees}>
      {(rows: any[]) => (
        <>
          {/* <PageHead title="Training Progress" sub="Per-employee detail with date-wise daily updates" /> */}
          <Table rows={rows} empty="No employees"
            cols={[
              { h: 'Employee', c: r => <b>{r.name} <span className="muted">{r.id}</span></b> },
              { h: 'Target role', c: r => r.targetRole },
              { h: 'Readiness', c: r => pctBadge(r.readinessScore || 0) },
            ]}
            actions={r => <button className="btn ghost sm" onClick={() => setView(r)}>View detail</button>} />
          {view && <Modal lg title={`Progress — ${view.name}`} onClose={() => setView(null)} footer={<button className="btn ghost" onClick={() => setView(null)}>Close</button>}>
            <Async fetcher={() => Promise.all([api.employeeProgress(view.id), api.progressLogs(view.id)])}>
              {([d, logs]: any) => (
                <>
                  <div className="grid kpis">
                    <div className="card kpi"><div className="ic">📈</div><div><div className="v">{d.avgPct || 0}%</div><div className="l">Avg completion</div></div></div>
                    <div className="card kpi"><div className="ic">✅</div><div><div className="v">{d.completed || 0}</div><div className="l">Completed</div></div></div>
                  </div>
                  <div className="sec-title" style={{ marginTop: 14 }}>Materials</div>
                  {(d.items || []).map((it: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '4px 0' }}>
                      <span style={{ flex: 1 }}>{it.material?.title || it.title || it.materialId}</span><Bar value={it.pct || 0} /><span>{it.pct || 0}%</span>
                    </div>))}
                  {(d.items || []).length === 0 && <p className="muted">No material assigned.</p>}
                  <div className="sec-title" style={{ marginTop: 14 }}>Daily updates (date-wise)</div>
                  {(logs || []).length === 0 ? <p className="muted">No updates.</p> : logs.map((l: any, i: number) => (
                    <div key={i} className="card pad" style={{ marginBottom: 6, display: 'flex', gap: 10 }}>
                      <b style={{ width: 92 }}>{l.date}</b><span style={{ flex: 1 }}>{l.materialTitle}: {l.note}</span><b style={{ color: 'var(--primary)' }}>{l.pct}%</b>
                    </div>))}
                </>
              )}
            </Async>
          </Modal>}
        </>
      )}
    </Async>
  )
}
