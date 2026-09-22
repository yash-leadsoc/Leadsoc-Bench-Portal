import { ReactNode } from 'react'

export const titlecase = (s: string) =>
  String(s || '').replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim()

export function PageHead({ title, sub, actions }: { title: string; sub?: string; actions?: ReactNode }) {
  return (
    <div className="pagehead">
      <div style={{ flex: 1 }}>
        <h2>{title}</h2>{sub && <p>{sub}</p>}
      </div>
      {actions}
    </div>
  )
}

export function Kpi({ label, value, icon }: { label: string; value: any; icon?: string }) {
  return (
    <div className="card kpi">
      <div className="ic">{icon || '📊'}</div>
      <div><div className="v">{value ?? 0}</div><div className="l">{label}</div></div>
    </div>
  )
}

export function Badge({ text, kind = 'mut' }: { text: string; kind?: 'ok' | 'warn' | 'bad' | 'info' | 'mut' }) {
  return <span className={`badge b-${kind}`}>{text}</span>
}

export function statusBadge(s?: string) {
  const ok = ['deployable', 'deployed', 'completed', 'published', 'active', 'reviewed', 'selected']
  const info = ['trainingInProgress', 'scheduled', 'assigned', 'inProgress']
  const warn = ['assessmentDue', 'assessment', 'trainingPlanned', 'pending', 'onHold']
  const bad = ['rejected', 'cancelled', 'overdue']
  const v = s || ''
  const k = ok.includes(v) ? 'ok' : info.includes(v) ? 'info' : warn.includes(v) ? 'warn' : bad.includes(v) ? 'bad' : 'mut'
  return <Badge text={titlecase(v || '—')} kind={k as any} />
}

export function pctBadge(n: number) {
  const k = n >= 80 ? 'ok' : n >= 50 ? 'warn' : 'bad'
  return <Badge text={`${n}%`} kind={k as any} />
}

export function Bar({ value }: { value: number }) {
  return <div className="progress"><i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} /></div>
}

export const Loader = () => <div className="center-load"><span className="spin" /></div>
export const Empty = ({ msg }: { msg: string }) => <div className="empty"><div style={{ fontSize: 40, opacity: .5 }}>📭</div><p>{msg}</p></div>
