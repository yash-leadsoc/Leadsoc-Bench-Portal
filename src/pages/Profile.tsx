import { useState } from 'react'
import { api } from '../api/api'
import { useAuth } from '../store/auth'
import { Async } from '../components/Async'
import { PageHead } from '../components/ui'
import ChangePassword from './ChangePassword'
import { useToast } from '../store/toast'

export default function Profile() {
  const { refresh } = useAuth(); const toast = useToast()
  const [pw, setPw] = useState(false)
  if (pw) return <ChangePassword />
  return (
    <Async fetcher={api.myProfile}>
      {(p: any) => {
        return <ProfileForm p={p} onSaved={refresh} toast={toast} onChangePw={() => setPw(true)} />
      }}
    </Async>
  )
}

function ProfileForm({ p, onSaved, toast, onChangePw }: any) {
  const emp = p.employee || {}
  const [name, setName] = useState(p.name || '')
  const [phone, setPhone] = useState(emp.phone || '')
  const [loc, setLoc] = useState(emp.location || '')
  return (
    <>
      <PageHead title="Profile & Settings" sub="Your account details" />
      <div className="card pad" style={{ maxWidth: 560 }}>
        <b>Account</b><div className="muted" style={{ margin: '4px 0 14px' }}>{p.email} · {p.role}{p.bu ? ` · ${p.bu}` : ''}</div>
        <label className="fld">Full name</label><input className="input" value={name} onChange={e => setName(e.target.value)} />
        <div className="two" style={{ marginTop: 10 }}>
          <div><label className="fld">Phone</label><input className="input" value={phone} onChange={e => setPhone(e.target.value)} /></div>
          <div><label className="fld">Location</label><input className="input" value={loc} onChange={e => setLoc(e.target.value)} /></div>
        </div>
        <button className="btn" style={{ marginTop: 14 }} onClick={async () => { await api.updateProfile({ name, phone, location: loc }); await onSaved(); toast('Saved') }}>Save changes</button>
      </div>
      <div className="card pad" style={{ maxWidth: 560, marginTop: 12 }}>
        <b>Security</b><div style={{ marginTop: 10 }}><button className="btn ghost" onClick={onChangePw}>🔒 Change password</button></div>
      </div>
    </>
  )
}
