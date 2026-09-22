// // import { motion } from 'framer-motion'
// // import { api } from '../api/api'
// // import { useAuth } from '../store/auth'
// // import { Async } from '../components/Async'
// // import { PageHead, Kpi } from '../components/ui'
// // import { BarCard, DonutCard } from '../components/Charts'
// // import { useState } from 'react'

// // export default function Dashboard() {
// //   const { user } = useAuth()
// //   const isAdmin = user?.role === 'admin'


// //   return (
// //     <Async fetcher={api.dashboardKpis}>
// //       {(k: any, reload) => (
// //         <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
// //           <PageHead title={isAdmin ? 'Admin Dashboard' : 'BU Dashboard'}
// //             sub={isAdmin ? 'Organization overview' : `Overview for ${user?.bu || ''}`}
// //             actions={<button className="btn ghost" onClick={reload}>↻ Refresh</button>} />
// //           <div className="grid kpis">

            
// //             <Kpi label="Total Employees" value={k.totalEmployees} icon="👥" />
// //             <Kpi label="Active Bench" value={k.activeBench} icon="🪑" />
// //             {/* <Kpi label="Bench Rate" value={`${k.benchRatePct}%`} icon="％" /> */}
// //             {/* <Kpi label="Avg Bench Days" value={k.avgBenchDays} icon="📅" /> */}
// //             {/* <Kpi label="Critical Bench" value={k.criticalBench} icon="⚠️" /> */}
// //             {/* <Kpi label="Available" value={k.availableEmployees} icon="✅" /> */}
// //             {/* <Kpi label="New Bench" value={k.newBench} icon="➕" /> */}
// //             <Kpi label="Deployed" value={k.deployed} icon="🚀" />
// //             {/* <Kpi label="Deployed / Month" value={k.deployedThisMonth} icon="📈" /> */}
// //             {/* <Kpi label="Utilization" value={`${k.utilizationPct}%`} icon="⚡" /> */}
// //             {/* <Kpi label="Profile Completion" value={`${k.profileCompletionPct}%`} icon="🪪" /> */}
// //             {isAdmin ? <Kpi label="Total BUs" value={k.totalBUs} icon="🏢" />
// //               : <Kpi label="Ready Employees" value={k.readyEmployees} icon="🎯" />}
// //             {/* <Kpi label="Training Completion" value={`${k.trainingCompletionPct}%`} icon="🎓" /> */}
// //             {/* <Kpi label="Avg Assessment" value={`${k.avgAssessmentScore}%`} icon="📝" /> */}
// //           </div>
          
// //           <div style={{ height: 22 }} />
// //           <div className="two">
// //             <BarCard title="Bench Aging" data={k.benchAging} />
// //             <BarCard title="Skill Availability" data={k.skillAvailability} />
// //           </div>
// //           <div style={{ height: 14 }} />
// //           <div className="two">
// //             <DonutCard title="Employee Status" data={k.statusDistribution} />
// //             <DonutCard title="Readiness Distribution" data={k.readinessDistribution} />
// //           </div>
// //           {isAdmin && <><div style={{ height: 14 }} /><BarCard title="BU-wise Distribution" data={k.buDistribution} /></>}
// //         </motion.div>
// //       )}
// //     </Async>
// //   )
// // }


// import { useMemo, useState } from 'react'
// import { motion } from 'framer-motion'
// import { api } from '../api/api'
// import { useAuth } from '../store/auth'
// import { Async } from '../components/Async'
// import { PageHead, statusBadge, titlecase } from '../components/ui'
// import { Table } from '../components/Table'
// import { FormModal } from '../components/Form'
// import { useToast } from '../store/toast'

// // ---- KPI status mapping (edit these buckets to taste) ----------------------
// const INACTIVE = ['deployed', 'released', 'transferred']
// const IN_PROCESS = ['newEntry', 'assessmentDue', 'trainingPlanned', 'trainingInProgress', 'assessment']
// const ALLOCATED = ['proposed', 'deployed']
// const CRITICAL_DAYS = 60

// // ---- small derivations off an employee row ---------------------------------
// const primarySkill = (e: any) => e.skills?.[0]?.skill || '—'
// const experience = (e: any) => {
//   const y = Math.max(0, ...((e.skills || []).map((s: any) => Number(s.years) || 0)))
//   return y ? `${y} yrs` : '—'
// }
// const ageDays = (e: any) => {
//   try { return Math.floor((Date.now() - new Date(e.benchStart).getTime()) / 864e5) }
//   catch { return 0 }
// }
// const sinceLabel = (d: string) =>
//   d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'

// export default function Dashboard() {
//   const { user } = useAuth()
//   const toast = useToast()
//   const isAdmin = user?.role === 'admin'
//   const [q, setQ] = useState('')
//   const [buF, setBuF] = useState('')
//   const [skillF, setSkillF] = useState('')
//   const [statusF, setStatusF] = useState('')
//   const [form, setForm] = useState<any>(null)

//   return (
//     <Async fetcher={() => Promise.all([api.employees(), api.requirements()])}>
//       {([rows, reqs]: any, reload) => {
//         const bench = rows.filter((e: any) => !INACTIVE.includes(e.status))
//         const kpi = {
//           total: bench.length,
//           available: bench.filter((e: any) => e.status === 'deployable').length,
//           inProcess: bench.filter((e: any) => IN_PROCESS.includes(e.status)).length,
//           allocated: rows.filter((e: any) => ALLOCATED.includes(e.status)).length,
//           critical: bench.filter((e: any) => ageDays(e) > CRITICAL_DAYS).length,
//         }

//         const aging = { '0–30 Days': 0, '31–60 Days': 0, '61–90 Days': 0, '90+ Days': 0 }
//         bench.forEach((e: any) => {
//           const a = ageDays(e)
//           const k = a <= 30 ? '0–30 Days' : a <= 60 ? '31–60 Days' : a <= 90 ? '61–90 Days' : '90+ Days'
//           aging[k as keyof typeof aging]++
//         })

//         // filter option lists (built from live data)
//         const opts = (fn: (e: any) => string) =>
//           Array.from(new Set(rows.map(fn).filter(Boolean))).sort()
//         const buOpts = opts((e: any) => e.bu)
//         const skillOpts = opts(primarySkill).filter(s => s !== '—')
//         const statusOpts = opts((e: any) => e.status)

//         const filtered = rows.filter((e: any) => {
//           const hay = `${e.name} ${e.id} ${e.bu} ${primarySkill(e)} ${e.targetRole}`.toLowerCase()
//           return (!q || hay.includes(q.toLowerCase()))
//             && (!buF || e.bu === buF)
//             && (!skillF || primarySkill(e) === skillF)
//             && (!statusF || e.status === statusF)
//         })

//         const sel = { maxWidth: 150 } as const
//         return (
//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
//             <PageHead title="Bench Management"
//               sub={isAdmin ? 'Organization overview' : `Overview for ${user?.bu || ''}`}
//               actions={<button className="btn ghost" onClick={reload}>↻ Refresh</button>} />

//             {/* ---- KPI strip ---- */}
//             <div className="grid kpis">
//               <Kpi label="Total Bench" value={kpi.total} icon="🪑" />
//               <Kpi label="Available" value={kpi.available} icon="✅" />
//               <Kpi label="In Process" value={kpi.inProcess} icon="⏳" />
//               <Kpi label="Allocated" value={kpi.allocated} icon="🚀" />
//               <Kpi label="Critical" value={kpi.critical} icon="⚠️" />
//             </div>

//             <div style={{ height: 22 }} />

//             {/* ---- Bench Employees ---- */}
//             <div className="card pad">
//               <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
//                 <div className="sec-title" style={{ flex: 1, margin: 0 }}>Bench Employees</div>
//                 <button className="btn" onClick={() => setForm({})}>+ Add Employee</button>
//               </div>
//               <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
//                 <input className="input" style={{ maxWidth: 240 }} placeholder="Search employees…"
//                   value={q} onChange={e => setQ(e.target.value)} />
//                 <select style={sel} value={buF} onChange={e => setBuF(e.target.value)}>
//                   <option value="">BU ▾</option>{buOpts.map(o => <option key={o}>{o}</option>)}
//                 </select>
//                 <select style={sel} value={skillF} onChange={e => setSkillF(e.target.value)}>
//                   <option value="">Skill ▾</option>{skillOpts.map(o => <option key={o}>{o}</option>)}
//                 </select>
//                 <select style={sel} value={statusF} onChange={e => setStatusF(e.target.value)}>
//                   <option value="">Status ▾</option>
//                   {statusOpts.map(o => <option key={o} value={o}>{titlecase(o)}</option>)}
//                 </select>
//               </div>
//               <Table rows={filtered} empty="No employees"
//                 cols={[
//                   { h: 'Employee', c: (r: any) => <b>{r.name}</b> },
//                   { h: 'BU', c: (r: any) => r.bu || '—' },
//                   { h: 'Skill', c: (r: any) => primarySkill(r) },
//                   { h: 'Experience', c: (r: any) => experience(r) },
//                   { h: 'Bench Since', c: (r: any) => sinceLabel(r.benchStart) },
//                   { h: 'Status', c: (r: any) => statusBadge(r.status) },
//                 ]} />
//             </div>

//             <div style={{ height: 14 }} />

//             {/* ---- Bench Aging + Open Requirements ---- */}
//             <div className="two">
//               <div className="card pad">
//                 <div className="sec-title">Bench Aging</div>
//                 {Object.entries(aging).map(([k, v]) => <StatRow key={k} label={k} value={v} />)}
//               </div>
//               {/* <div className="card pad">
//                 <div className="sec-title">Open Requirements</div>
//                 {reqs.length === 0
//                   ? <p className="muted">No open requirements.</p>
//                   : reqs.map((r: any, i: number) =>
//                     <StatRow key={i} label={r.role || r.title || r.name || 'Requirement'}
//                       value={r.openings ?? r.count ?? r.positions ?? 1} />)}
//               </div> */}
//             </div>

//             {/* ---- Add Employee (same call as the Employees page) ---- */}
//             {form && <FormModal title="Add Employee" onClose={() => setForm(null)}
//               fields={[
//                 { key: 'employeeId', label: 'Employee ID (e.g. LS1703)' },
//                 { key: 'name', label: 'Full name' },
//                 { key: 'email', label: 'Email (login)' },
//                 { key: 'phone', label: 'Mobile number' },
//                 ...(isAdmin ? [{ key: 'bu', label: 'BU' }] : []),
//                 { key: 'practice', label: 'Practice' },
//                 { key: 'targetRole', label: 'Target role' },
//                 { key: 'manager', label: 'Manager' },
//                 { key: 'password', label: 'Password (blank = firstname@123)' },
//               ]}
//               onSubmit={async v => {
//                 const r = await api.addEmployee(v)
//                 toast(`Added ${r.id} · ${r.loginEmail} / ${r.tempPassword}`)
//                 reload()
//               }} />}
//           </motion.div>
//         )
//       }}
//     </Async>
//   )
// }

// function Kpi({ label, value, icon }: { label: string; value: any; icon?: string }) {
//   return (
//     <div className="card kpi">
//       <div className="ic">{icon || '📊'}</div>
//       <div><div className="v">{value ?? 0}</div><div className="l">{label}</div></div>
//     </div>
//   )
// }

// function StatRow({ label, value }: { label: string; value: any }) {
//   return (
//     <div style={{
//       display: 'flex', alignItems: 'center', justifyContent: 'space-between',
//       padding: '10px 0', borderBottom: '1px solid var(--line)',
//     }}>
//       <span>{label}</span>
//       <b style={{ fontSize: 16 }}>{value}</b>
//     </div>
//   )
// }


import { useState } from 'react'
import { motion } from 'framer-motion'
import { api } from '../api/api'
import { useAuth } from '../store/auth'
import { Async } from '../components/Async'
import { PageHead, statusBadge, pctBadge, titlecase, Bar } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal } from '../components/Form'
import { useToast } from '../store/toast'

// ---- KPI status mapping (edit these buckets to taste) ----------------------
const INACTIVE = ['deployed', 'released', 'transferred']
const IN_PROCESS = ['newEntry', 'assessmentDue', 'trainingPlanned', 'trainingInProgress', 'assessment']
const ALLOCATED = ['proposed', 'deployed']
const CRITICAL_DAYS = 60

const primarySkill = (e: any) => e.skills?.[0]?.skill || '—'
const ageDays = (e: any) => {
  try { return Math.max(0, Math.floor((Date.now() - new Date(e.benchStart).getTime()) / 864e5)) }
  catch { return 0 }
}
const initials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0]).slice(0, 2).join('').toUpperCase() || '?'

function AgeCell({ days }: { days: number }) {
  const color = days > 90 ? 'var(--bad)' : days > CRITICAL_DAYS ? 'var(--warn)' : 'var(--ink)'
  return <span style={{ color, fontWeight: 600 }}>{days} days</span>
}

export default function Dashboard() {
  const { user } = useAuth()
  const toast = useToast()
  const isAdmin = user?.role === 'admin'
  const [q, setQ] = useState('')
  const [buF, setBuF] = useState('')
  const [skillF, setSkillF] = useState('')
  const [statusF, setStatusF] = useState('')
  const [form, setForm] = useState<any>(null)
  const [detail, setDetail] = useState<any>(null)

  return (
    <Async fetcher={() => Promise.all([api.employees(), api.requirements()])}>
      {([rows, reqs]: any, reload) => {
        const bench = rows.filter((e: any) => !INACTIVE.includes(e.status))
        const kpi = {
          total: bench.length,
          available: bench.filter((e: any) => e.status === 'deployable').length,
          inProcess: bench.filter((e: any) => IN_PROCESS.includes(e.status)).length,
          allocated: rows.filter((e: any) => ALLOCATED.includes(e.status)).length,
          critical: bench.filter((e: any) => ageDays(e) > CRITICAL_DAYS).length,
        }

        const aging = { '0–30 Days': 0, '31–60 Days': 0, '61–90 Days': 0, '90+ Days': 0 }
        bench.forEach((e: any) => {
          const a = ageDays(e)
          const k = a <= 30 ? '0–30 Days' : a <= 60 ? '31–60 Days' : a <= 90 ? '61–90 Days' : '90+ Days'
          aging[k as keyof typeof aging]++
        })

        const opts = (fn: (e: any) => string) =>
          Array.from(new Set(rows.map(fn).filter(Boolean))).sort()
        const buOpts = opts((e: any) => e.bu)
        const skillOpts = opts(primarySkill).filter(s => s !== '—')
        const statusOpts = opts((e: any) => e.status)

        const filtered = rows.filter((e: any) => {
          const hay = `${e.name} ${e.id} ${e.bu} ${primarySkill(e)} ${e.targetRole}`.toLowerCase()
          return (!q || hay.includes(q.toLowerCase()))
            && (!buF || e.bu === buF)
            && (!skillF || primarySkill(e) === skillF)
            && (!statusF || e.status === statusF)
        })

        const sel = { maxWidth: 150 } as const
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <PageHead title="Bench Management"
              sub={isAdmin ? 'Organization overview' : `Overview for ${user?.bu || ''}`}
              actions={<button className="btn ghost" onClick={reload}>↻ Refresh</button>} />

            {/* ---- KPI strip ---- */}
            <div className="grid kpis">
              <Kpi label="Total Bench" value={kpi.total} icon="🪑" />
              <Kpi label="Available" value={kpi.available} icon="✅" />
              <Kpi label="In Process" value={kpi.inProcess} icon="⏳" />
              <Kpi label="Allocated" value={kpi.allocated} icon="🚀" />
              <Kpi label="Critical" value={kpi.critical} icon="⚠️" />
            </div>

            <div style={{ height: 22 }} />

            {/* ---- Bench Employees ---- */}
            <div className="card pad">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div className="sec-title" style={{ flex: 1, margin: 0 }}>Bench Employees</div>
                <button className="btn" onClick={() => setForm({})}>+ Add Employee</button>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
                <input className="input" style={{ maxWidth: 240 }} placeholder="Search employees…"
                  value={q} onChange={e => setQ(e.target.value)} />
                <select style={sel} value={buF} onChange={e => setBuF(e.target.value)}>
                  <option value="">BU ▾</option>{buOpts.map(o => <option key={o}>{o}</option>)}
                </select>
                <select style={sel} value={skillF} onChange={e => setSkillF(e.target.value)}>
                  <option value="">Skill ▾</option>{skillOpts.map(o => <option key={o}>{o}</option>)}
                </select>
                <select style={sel} value={statusF} onChange={e => setStatusF(e.target.value)}>
                  <option value="">Status ▾</option>
                  {statusOpts.map(o => <option key={o} value={o}>{titlecase(o)}</option>)}
                </select>
              </div>
              <Table rows={filtered} empty="No employees"
                cols={[
                  { h: 'ID', c: (r: any) => <b>{r.id}</b> },
                  { h: 'Name', c: (r: any) => <a onClick={() => setDetail(r)} style={{ cursor: 'pointer', fontWeight: 600 }}>{r.name}</a> },
                  { h: 'BU', c: (r: any) => r.bu || '—' },
                  { h: 'Bench Ageing', c: (r: any) => <AgeCell days={ageDays(r)} /> },
                  { h: 'Readiness', c: (r: any) => pctBadge(r.readinessScore || 0) },
                  { h: 'Status', c: (r: any) => statusBadge(r.status) },
                ]}
                actions={(r: any) => <button className="btn ghost sm" onClick={() => setDetail(r)}>Details</button>} />
            </div>

            <div style={{ height: 14 }} />

            {/* ---- Bench Aging + Open Requirements ---- */}
            <div className="two">
              <div className="card pad">
                <div className="sec-title">Bench Aging</div>
                {Object.entries(aging).map(([k, v]) => <StatRow key={k} label={k} value={v} />)}
              </div>
              <div className="card pad">
                <div className="sec-title">Open Requirements</div>
                {reqs.length === 0
                  ? <p className="muted">No open requirements.</p>
                  : reqs.map((r: any, i: number) =>
                    <StatRow key={i} label={r.role || r.title || r.name || 'Requirement'}
                      value={r.openings ?? r.count ?? r.positions ?? 1} />)}
              </div>
            </div>

            {/* ---- Add Employee: LSID, name, email, mobile (+ manager only for admin) ---- */}
            {form && <FormModal title="Add Employee" onClose={() => setForm(null)}
              fields={[
                { key: 'employeeId', label: 'LS ID (e.g. LS1703)' },
                { key: 'name', label: 'Full name' },
                { key: 'email', label: 'Email (login)' },
                { key: 'phone', label: 'Mobile number' },
                ...(isAdmin ? [{ key: 'manager', label: 'Manager' }] : []),
              ]}
              onSubmit={async v => {
                const r = await api.addEmployee(v)
                toast(`Added ${r.id} · ${r.loginEmail} / ${r.tempPassword}`)
                reload()
              }} />}

            {detail && <EmployeeDetail emp={detail} onClose={() => setDetail(null)} />}
          </motion.div>
        )
      }}
    </Async>
  )
}

function Kpi({ label, value, icon }: { label: string; value: any; icon?: string }) {
  return (
    <div className="card kpi">
      <div className="ic">{icon || '📊'}</div>
      <div><div className="v">{value ?? 0}</div><div className="l">{label}</div></div>
    </div>
  )
}

function StatRow({ label, value }: { label: string; value: any }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 0', borderBottom: '1px solid var(--line)',
    }}>
      <span>{label}</span>
      <b style={{ fontSize: 16 }}>{value}</b>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Attractive employee detail drawer
// ---------------------------------------------------------------------------
function MiniStat({ label, value, tint }: { label: string; value: any; tint: string }) {
  return (
    <div style={{
      flex: 1, minWidth: 110, background: '#fff', border: '1px solid var(--line)',
      borderRadius: 12, padding: '12px 14px',
    }}>
      <div style={{ fontSize: 22, fontWeight: 750, lineHeight: 1, color: tint }}>{value}</div>
      <div style={{ color: 'var(--sub)', fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  )
}

function EmployeeDetail({ emp, onClose }: { emp: any; onClose: () => void }) {
  return (
    <>
      <div className="drawer-ov" onClick={onClose} />
      <div className="drawer">
        {/* gradient header */}
        <div style={{
          padding: 22, color: '#fff',
          background: 'linear-gradient(135deg, var(--primary), #8b5cf6)',
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{
            width: 58, height: 58, borderRadius: 16, flexShrink: 0,
            background: 'rgba(255,255,255,.22)', display: 'grid', placeItems: 'center',
            fontSize: 22, fontWeight: 750,
          }}>{initials(emp.name)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 750 }}>{emp.name}</div>
            <div style={{ opacity: .85, fontSize: 13, marginTop: 2 }}>{emp.id} · {emp.bu || '—'} · {emp.practice || '—'}</div>
          </div>
          <button className="btn ghost sm" onClick={onClose} style={{ background: 'rgba(255,255,255,.18)', color: '#fff', border: 'none' }}>✕</button>
        </div>

        <div className="body">
          <Async fetcher={() => Promise.all([api.employee360(emp.id), api.progressLogs(emp.id)])}>
            {([d, logs]: any) => {
              const e = d.employee || {}
              const S = ({ t }: { t: string }) => <div className="sec-title" style={{ marginTop: 22 }}>{t}</div>
              const age = ageDays(e)
              return (
                <div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <MiniStat label="Readiness" value={`${e.readinessScore || 0}%`} tint="var(--primary)" />
                    <MiniStat label="Bench age" value={`${age}d`} tint={age > 60 ? 'var(--warn)' : 'var(--ink)'} />
                    <MiniStat label="Training" value={`${d.insight?.trainingCompletionPct || 0}%`} tint="var(--info)" />
                    <MiniStat label="Pass rate" value={`${d.insight?.assessmentPassRatePct || 0}%`} tint="var(--ok)" />
                  </div>

                  <S t="Profile" />
                  <div className="card pad" style={{ display: 'grid', gap: 6, fontSize: 14 }}>
                    <Row k="Status" v={statusBadge(e.status)} />
                    <Row k="Email" v={e.email || '—'} />
                    <Row k="Phone" v={e.phone || '—'} />
                    <Row k="Target role" v={e.targetRole || '—'} />
                    <Row k="Manager" v={e.manager || '—'} />
                    <Row k="Bench since" v={e.benchStart || '—'} />
                    <Row k="Bench reason" v={e.benchReason || '—'} />
                  </div>

                  <S t="Skills" />
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {(e.skills || []).map((s: any, i: number) =>
                      <span key={i} className="badge b-info">{s.skill} · {s.level || s.proficiency || ''}{s.years ? ` · ${s.years}y` : ''}</span>)}
                    {(e.skills || []).length === 0 && <span className="muted">None listed</span>}
                  </div>

                  <S t="Training progress" />
                  {(d.progress || []).length === 0 && <span className="muted">No training assigned.</span>}
                  {(d.progress || []).map((p: any, i: number) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0' }}>
                      <span style={{ flex: 1, fontSize: 14 }}>{p.title || p.materialId}</span>
                      <div style={{ width: 140 }}><Bar value={p.pct || 0} /></div>
                      <span style={{ width: 42, textAlign: 'right', fontSize: 13 }}>{p.pct || 0}%</span>
                    </div>))}

                  <S t="Daily updates" />
                  {(logs || []).length === 0 && <span className="muted">No daily updates.</span>}
                  {(logs || []).map((l: any, i: number) => (
                    <div key={i} style={{ display: 'flex', gap: 10, padding: '5px 0', fontSize: 13, borderBottom: '1px solid var(--line)' }}>
                      <b style={{ width: 92, color: 'var(--sub)' }}>{l.date}</b>
                      <span style={{ flex: 1 }}>{l.materialTitle}: {l.note}</span><span>{l.pct}%</span>
                    </div>))}

                  <S t="Assessment results" />
                  {(d.results || []).length === 0 && <span className="muted">No attempts.</span>}
                  {(d.results || []).map((r: any, i: number) => (
                    <div key={i} style={{ padding: '5px 0', fontSize: 14 }}>
                      {r.assessmentId} · {r.scoreMarks}/{r.totalMarks} · {r.passed
                        ? <span className="badge b-ok">Pass</span> : <span className="badge b-bad">Fail</span>}
                    </div>))}

                  {d.insight?.summary && <>
                    <S t="AI summary" />
                    <div className="card pad" style={{ fontSize: 14, lineHeight: 1.6 }}>{d.insight.summary}</div>
                  </>}
                </div>
              )
            }}
          </Async>
        </div>
      </div>
    </>
  )
}

function Row({ k, v }: { k: string; v: any }) {
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <span style={{ width: 110, color: 'var(--sub)' }}>{k}</span>
      <span style={{ flex: 1 }}>{v}</span>
    </div>
  )
}