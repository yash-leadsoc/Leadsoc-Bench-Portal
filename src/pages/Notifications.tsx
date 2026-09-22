import { api } from '../api/api'
import { useAuth } from '../store/auth'
import { Async } from '../components/Async'
import { PageHead } from '../components/ui'

export default function Notifications() {
  const { refresh } = useAuth()
  return (
    <Async fetcher={api.notifications}>
      {(d: any, reload) => (
        <>
          <PageHead title="Notifications"
            actions={<button className="btn ghost" onClick={async () => { await api.markAllRead(); await refresh(); reload() }}>Mark all read</button>} />
          {(d.rows || []).length === 0 && <div className="card"><div className="empty">No notifications</div></div>}
          {(d.rows || []).map((n: any) => (
            <div key={n.id} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 20 }}>{n.read ? '🔕' : '🔔'}</span>
              <div style={{ flex: 1 }}><b style={{ fontWeight: n.read ? 400 : 700 }}>{n.title}</b><div className="muted">{n.body}</div></div>
              {!n.read && <button className="btn ghost sm" onClick={async () => { await api.markRead(n.id); await refresh(); reload() }}>Read</button>}
            </div>))}
        </>
      )}
    </Async>
  )
}
