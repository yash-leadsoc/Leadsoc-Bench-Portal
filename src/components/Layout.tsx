import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../store/auth'
import { NAV, roleLabel } from '../nav'

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, unread, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const loc = useLocation()
  const role = user?.role
  const items = NAV.filter(n => n.roles.includes(role))
  const current = items.find(i => i.path === loc.pathname)
  const initials = (user?.name || '?').split(/\s+/).map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="shell">
      <aside className={`side ${open ? 'open' : ''}`}>
        <div className="top"><span className="logo">◆</span> LeadSoc TEDP</div>
        <nav className="nav">
          {items.map((n, i) => (
            <NavLink key={n.path + i} to={n.path} onClick={() => setOpen(false)}
              className={({ isActive }) => isActive ? 'active' : ''}>
              <span>{n.icon}</span> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="usr">
          <div className="avatar">{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
            <div style={{ color: '#94a3b8', fontSize: 11 }}>{roleLabel(role)}{user?.bu ? ` · ${user.bu}` : ''}</div>
          </div>
          <button className="bell" style={{ width: 34, height: 34 }} onClick={logout} title="Log out">⏻</button>
        </div>
      </aside>
      <div className="main">
        <div className="topbar">
          <button className="menu-btn" onClick={() => setOpen(o => !o)}>☰</button>
          <h1>{current?.label || 'LeadSoc TEDP'}</h1>
          <div className="spacer" />
          <NavLink to="/notifications" className="bell">🔔{unread > 0 && <span className="dot">{unread}</span>}</NavLink>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  )
}
