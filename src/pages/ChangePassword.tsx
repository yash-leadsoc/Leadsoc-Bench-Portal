import { useState } from 'react'
import { useAuth } from '../store/auth'
import { useToast } from '../store/toast'
import { api } from '../api/api'

export default function ChangePassword({ forced }: { forced?: boolean }) {
  const { refresh, setUser, user, logout } = useAuth()
  const toast = useToast()
  const [cur, setCur] = useState(''); const [nw, setNw] = useState(''); const [cf, setCf] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    if (nw.length < 6) return toast('New password too short (min 6)', 'err')
    if (nw !== cf) return toast('Passwords do not match', 'err')
    setBusy(true)
    try {
      await api.changePassword(cur, nw)
      toast('Password updated')
      setUser({ ...user, mustChangePassword: false })
      await refresh()
    } catch (e: any) { toast(e.message || 'Failed', 'err') } finally { setBusy(false) }
  }
  return (
    <div className="auth">
      <div className="brand">
        <div className="brandmark"><span className="logo">◆</span> LeadSoc TEDP</div>
        <h1>{forced ? 'Set a new password' : 'Change password'}</h1>
        {forced && <p style={{ color: '#c7d2fe' }}>Your account requires a password change before continuing.</p>}
      </div>
      <div className="formwrap">
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 24, margin: '0 0 14px' }}>New password</h2>
          <label className="fld">Current password</label>
          <input className="input" type="password" value={cur} onChange={e => setCur(e.target.value)} />
          <label className="fld">New password</label>
          <input className="input" type="password" value={nw} onChange={e => setNw(e.target.value)} />
          <label className="fld">Confirm new password</label>
          <input className="input" type="password" value={cf} onChange={e => setCf(e.target.value)} />
          <button className="btn block" style={{ marginTop: 18 }} onClick={save} disabled={busy}>
            {busy ? <span className="spin w" /> : 'Update password'}</button>
          {forced && <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button className="btn ghost sm" onClick={logout}>Log out</button></div>}
        </div>
      </div>
    </div>
  )
}
