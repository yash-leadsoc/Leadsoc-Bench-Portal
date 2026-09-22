// import { useState } from 'react'
// import { api } from '../../api/api'
// import { fileUrl } from '../../api/client'
// import { Async } from '../../components/Async'
// import { PageHead, Bar, Empty } from '../../components/ui'
// import { Modal } from '../../components/Modal'
// import { useToast } from '../../store/toast'

// const extUrl = (u = '') => /^https?:\/\//i.test(u) ? u : `https://${u}`

// export default function MyTraining() {
//   const [plan, setPlan] = useState<any>(null)
//   return (
//         <Async fetcher={api.myTrainingPlans}>
//       {(d: any, reload) => {
//         const plans = d.plans || []
//         return (
//           <>
//             <PageHead title="My Training" sub="Your assigned training plans and weekly modules" />
//             {plans.length === 0 && <div className="card"><Empty msg="No training plans assigned yet" /></div>}
//             {plans.map((p: any) => (
//               <div key={p.id} className="card pad" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => setPlan(p)}>
//                 <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
//                   <div style={{ flex: 1 }}>
//                     <b style={{ fontSize: 16 }}>{p.name}</b>
//                     <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
//                       {[p.targetRole, p.primarySkill, p.category].filter(Boolean).join(' · ') || '—'}
//                     </div>
//                   </div>
//                   <span className="badge b-info">{p.completed}/{p.total} modules</span>
//                   <button className="btn ghost sm" onClick={e => { e.stopPropagation(); setPlan(p) }}>Open</button>
//                 </div>
//                 <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
//                   <Bar value={p.pct} /><b>{p.pct}%</b>
//                 </div>
//               </div>))}
//             {plan && <PlanDetail plan={plan}
//               onClose={() => { setPlan(null); reload() }} />}
//           </>
//         )
//       }}
//     </Async>
//   )
// }

// function PlanDetail({ plan, onClose }: any) {
//   const toast = useToast()
//   const [mods, setMods] = useState<any[]>(plan.modules || [])
//   const [busy, setBusy] = useState<string | null>(null)

//   const total = mods.length
//   const done = mods.filter(m => m.completed).length
//   const pct = total ? Math.round(100 * done / total) : 0
//   const weeks = Array.from(new Set(mods.map(m => m.week || 0))).sort((a, b) => a - b)

//   const toggle = async (m: any) => {
//     const next = !m.completed
//     setBusy(m.key)
//     setMods(a => a.map(x => x.key === m.key ? { ...x, completed: next, pct: next ? 100 : 0 } : x))  // optimistic
//     try {
//       await api.completeModule({ planId: plan.id, key: m.key, title: m.title, completed: next })
//     } catch (e: any) {
//       setMods(a => a.map(x => x.key === m.key ? { ...x, completed: !next, pct: !next ? 100 : 0 } : x))  // revert
//       toast(e.message || 'Could not update')
//     } finally { setBusy(null) }
//   }

//   return (
//     <Modal lg title="Training Plan" onClose={onClose} footer={<button className="btn ghost" onClick={onClose}>Close</button>}>
//       {/* banner */}
//       <div style={{ margin: '-22px -22px 18px', padding: 22, color: '#fff', background: 'linear-gradient(135deg, var(--primary), #8b5cf6)' }}>
//         <div style={{ fontSize: 22, fontWeight: 750 }}>{plan.name}</div>
//         <div style={{ opacity: .85, fontSize: 13, marginTop: 4 }}>
//           {[plan.targetRole, plan.primarySkill, plan.category, plan.difficulty].filter(Boolean).join(' · ') || '—'}
//         </div>
//         <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
//           <div style={{ flex: 1, height: 8, background: 'rgba(255,255,255,.25)', borderRadius: 99 }}>
//             <div style={{ width: `${pct}%`, height: '100%', background: '#fff', borderRadius: 99, transition: 'width .25s' }} />
//           </div>
//           <b>{pct}%</b>
//         </div>
//         <div style={{ fontSize: 12.5, opacity: .85, marginTop: 4 }}>{done} of {total} modules completed</div>
//       </div>

//       {plan.expectedOutcome && <p style={{ marginTop: -4, marginBottom: 14 }}><b>Goal: </b>{plan.expectedOutcome}</p>}

//       {total === 0 && <p className="muted">This plan has no modules yet.</p>}
//       {weeks.map(w => (
//         <div key={w} style={{ marginBottom: 16 }}>
//           <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0 8px' }}>
//             <span className="badge b-info">{w ? `Week ${w}` : 'Anytime'}</span>
//             <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
//           </div>
//           {mods.filter(m => (m.week || 0) === w).map(m => (
//             <div key={m.key} className="card pad" style={{ marginBottom: 8, display: 'flex', gap: 12, alignItems: 'flex-start', borderLeft: `3px solid ${m.completed ? 'var(--ok)' : 'var(--line)'}` }}>
//               <input type="checkbox" checked={!!m.completed} disabled={busy === m.key}
//                 onChange={() => toggle(m)} style={{ width: 18, height: 18, marginTop: 3, cursor: 'pointer' }} />
//               <div style={{ flex: 1 }}>
//                 <b style={{ textDecoration: m.completed ? 'line-through' : 'none', opacity: m.completed ? .6 : 1 }}>{m.title}</b>
//                 <div className="muted" style={{ fontSize: 12.5, marginTop: 3, display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
//                   {m.materialTitle && <span>📄 {m.materialTitle}</span>}
//                   {m.duration && <span>⏱ {m.duration}</span>}
//                   {m.assessmentType && m.assessmentType !== 'None' && <span className="badge b-warn">{m.assessmentType}</span>}
//                 </div>
//               </div>
//               {m.url && (m.materialType === 'link'
//                 ? <a className="btn ghost sm" href={extUrl(m.url)} target="_blank" rel="noreferrer">↗ Open</a>
//                 : <a className="btn ghost sm" href={fileUrl(m.downloadUrl || m.url)} target="_blank" rel="noreferrer">⬇ Open</a>)}
//             </div>))}
//         </div>))}
//     </Modal>
//   )
// }

import { useNavigate } from 'react-router-dom'
import { api } from '../../api/api'
import { Async } from '../../components/Async'
import { PageHead, Bar, Empty } from '../../components/ui'

export default function MyTraining() {
  const nav = useNavigate()
  return (
    <Async fetcher={api.myTrainingPlans}>
      {(d: any) => {
        const plans = d.plans || []
        return (
          <>
            <PageHead title="My Training" sub="Your assigned training plans" />
            {plans.length === 0 && <div className="card"><Empty msg="No training plans assigned yet" /></div>}
            {plans.map((p: any) => (
              <div key={p.id} className="card pad" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => nav(`/my-training/${p.id}`)}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--primary-50)', display: 'grid', placeItems: 'center', fontSize: 22 }}>📘</div>
                  <div style={{ flex: 1 }}>
                    <b style={{ fontSize: 16 }}>{p.name}</b>
                    <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                      {[p.targetRole, p.primarySkill, p.category].filter(Boolean).join(' · ') || '—'}
                    </div>
                  </div>
                  <span className="badge b-info">{p.completed}/{p.total} modules</span>
                  <button className="btn ghost sm" onClick={e => { e.stopPropagation(); nav(`/my-training/${p.id}`) }}>Open</button>
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 10 }}>
                  <Bar value={p.pct} /><b>{p.pct}%</b>
                </div>
              </div>))}
          </>
        )
      }}
    </Async>
  )
}