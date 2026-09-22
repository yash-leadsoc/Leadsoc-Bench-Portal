import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../store/auth'
import { useToast } from '../store/toast'
import { API_BASE } from '../api/client'

export default function Login() {
  const { login } = useAuth()
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [busy, setBusy] = useState(false)

  const go = async () => {
    if (!email || !pass) return toast('Enter email and password', 'err')
    setBusy(true)
    try { await login(email, pass) }
    catch (e: any) { toast(e.status === 401 ? 'Invalid credentials' : (e.message || 'Login failed'), 'err') }
    finally { setBusy(false) }
  }

  return (
    <div className="auth">
      <div className="brand">
        <div className="brandmark"><span className="logo">◆</span> LeadSoc TEDP</div>
        <h1>Talent Enablement &amp;<br />Deployment Platform</h1>
        <p style={{ color: '#c7d2fe', maxWidth: 440 }}>One connected system for bench, skills, training, assessments, interviews, projects and deployment.</p>
        <div style={{ marginTop: 26, display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {['Bench', 'Skills', 'Training', 'Assessments', 'Interviews', 'Readiness', 'Reports'].map(f => <span key={f} className="chip">{f}</span>)}
        </div>
      </div>
      <div className="formwrap">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} style={{ width: '100%', maxWidth: 400 }}>
          <h2 style={{ fontSize: 26, margin: '0 0 6px' }}>Sign in</h2>
          <p className="muted">Use your work email and password.</p>
          <label className="fld">Work email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@leadsoc.com" />
          <label className="fld">Password</label>
          <input className="input" type="password" value={pass} onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && go()} placeholder="••••••••" />
          <button className="btn block" style={{ marginTop: 18 }} onClick={go} disabled={busy}>
            {busy ? <span className="spin w" /> : 'Sign in'}</button>
          {/* <div className="tip" style={{ marginTop: 16 }}>
            <b>Demo logins</b><br />
            admin@leadsoc.com / admin123 · sanjay.rao@leadsoc.com / buhead123 (BU)<br />
            tara.nair@leadsoc.com / ta12345 (TA) · aditya.kumar@leadsoc.com / emp12345 (Employee)
          </div> */}
          {/* <div className="muted" style={{ textAlign: 'center', marginTop: 10, fontSize: 11 }}>Server: {API_BASE}</div> */}
        </motion.div>
      </div>
    </div>
  )
}
