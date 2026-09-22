import { api } from '../../api/api'
import { fileUrl } from '../../api/client'
import { Async } from '../../components/Async'
import { PageHead, statusBadge, Empty } from '../../components/ui'

export default function MyInterviews() {
  return (
    <Async fetcher={() => Promise.all([api.myInterviews(), api.mocks()])}>
      {([iv, mocks]: any) => (
        <>
          <PageHead title="My Interviews" sub="Scheduled interviews and mock sessions" />
          <div className="sec-title">Interviews</div>
          {(iv || []).length === 0 && <div className="card"><Empty msg="No interviews scheduled" /></div>}
          {(iv || []).map((r: any, i: number) => (
            <div key={i} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1 }}><b>{r.role || 'Interview'}</b><div className="muted" style={{ fontSize: 12 }}>{r.client || ''} · {r.scheduledAt || ''} · Round {r.round || 1}</div></div>
              {r.meetLink && <a className="btn ghost sm" href={fileUrl(r.meetLink)} target="_blank" rel="noreferrer">Join ↗</a>}
              {statusBadge(r.status)}
            </div>))}
          <div className="sec-title" style={{ marginTop: 18 }}>Mock interviews</div>
          {(mocks || []).length === 0 && <div className="card"><Empty msg="No mock interviews" /></div>}
          {(mocks || []).map((m: any, i: number) => (
            <div key={i} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ flex: 1 }}><b>{m.role}</b><div className="muted" style={{ fontSize: 12 }}>{m.scheduledAt}</div></div>
              {m.scorecard && <span className="muted">Score: {m.scorecard.overall}/10</span>}
              {statusBadge(m.status)}
            </div>))}
        </>
      )}
    </Async>
  )
}
