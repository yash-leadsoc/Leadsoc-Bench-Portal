// import { api } from '../api/api'
// import { Async } from '../components/Async'
// import { PageHead } from '../components/ui'
// import { Table } from '../components/Table'
// import { downloadServerCSV, downloadCSV, printReport } from '../utils/download'
// import { useToast } from '../store/toast'

// export default function Reports() {
//   const toast = useToast()
//   return (
//     <Async fetcher={() => Promise.all([api.employees(), api.benchReport(), api.assessmentReport(), api.trainerReport(), api.interviewReport()])}>
//       {([emps, bench, assess, trainers, iv]: any) => {
//         const table = emps.map((e: any) => ({
//           LSID: e.id, Name: e.name, BU: e.bu, Role: e.targetRole, BenchDays: '',
//           Status: e.status, Skills: (e.skills || []).map((s: any) => s.skill).join('; '),
//           Certifications: (e.certifications || []).length, Profile: `${e.profileCompletionPct || 0}%`,
//           Readiness: `${e.readinessScore || 0}%`, PreferredLocation: e.preferredLocation || '',
//           Availability: e.availabilityType || e.availability || '', Manager: e.manager || '',
//         }))
//         return (
//           <>
//             <PageHead title="Reports" sub="Detailed employee performance & aging"
//               actions={<>
//                 <button className="btn ghost" onClick={() => downloadCSV(table, 'employees.csv')}>⬇ CSV</button>
//                 <button className="btn ghost" onClick={() => downloadServerCSV(api.exportCsvUrl('readiness'), 'readiness.csv').catch(() => toast('Export failed', 'err'))}>⬇ Readiness</button>
//                 <button className="btn ghost" onClick={() => printReport('rep')}>🖨 Print / PDF</button>
//               </>} />
//             <div id="rep">
//               <div className="two">
//                 <div className="card pad"><div className="sec-title">Bench Aging (days)</div>
//                   {Object.entries(bench.ageing || {}).map(([k, v]: any) => <div key={k} className="muted">• {k}: {v}</div>)}</div>
//                 <div className="card pad"><div className="sec-title">Readiness Distribution</div>
//                   {Object.entries(bench.readiness || {}).map(([k, v]: any) => <div key={k} className="muted">• {k}: {v}</div>)}</div>
//               </div>
//               <div className="card pad" style={{ marginTop: 14 }}><div className="sec-title">Interview funnel</div>
//                 <div className="muted">Mocks: {iv.mocks} (completed {iv.mocksCompleted})</div>
//                 {Object.entries(iv.funnel || {}).map(([k, v]: any) => <div key={k} className="muted">• {k}: {v}</div>)}</div>
//               <div className="sec-title" style={{ marginTop: 18 }}>Employees</div>
//               <Table rows={table} empty="No employees"
//                 cols={[
//                   { h: 'LSID', c: r => <b>{r.LSID}</b> }, { h: 'Name', c: r => r.Name }, { h: 'BU', c: r => r.BU },
//                   { h: 'Role', c: r => r.Role }, { h: 'Status', c: r => r.Status }, { h: 'Skills', c: r => r.Skills },
//                   { h: 'Profile', c: r => r.Profile }, { h: 'Readiness', c: r => r.Readiness },
//                   { h: 'Pref. Location', c: r => r.PreferredLocation }, { h: 'Availability', c: r => r.Availability }, { h: 'Manager', c: r => r.Manager },
//                 ]} />
//               <div className="sec-title" style={{ marginTop: 18 }}>Assessment pass rates</div>
//               <Table rows={assess.rows || []} empty="No results"
//                 cols={[{ h: 'Assessment', c: r => r.name }, { h: 'Attempts', c: r => r.attempts }, { h: 'Passed', c: r => r.passed }, { h: 'Pass %', c: r => `${r.passRatePct}%` }]} />
//               <div className="sec-title" style={{ marginTop: 18 }}>Trainer utilisation</div>
//               <Table rows={trainers.rows || []} empty="No trainers"
//                 cols={[{ h: 'Trainer', c: r => r.name }, { h: 'Assigned', c: r => r.assigned }, { h: 'Capacity', c: r => `${r.capacity}h` }, { h: 'Rating', c: r => r.rating }]} />
//             </div>
//           </>
//         )
//       }}
//     </Async>
//   )
// }


import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, Kpi, statusBadge } from '../components/ui'
import { Table } from '../components/Table'
import { BarCard, DonutCard } from '../components/Charts'
import { downloadCSV, downloadServerCSV, printReport } from '../utils/download'
import { useToast } from '../store/toast'

const INACTIVE = ['deployed', 'released', 'transferred']
const IN_TRAINING = ['newEntry', 'trainingPlanned', 'trainingInProgress', 'assessment', 'assessmentDue']
const ALLOCATED = ['deployed', 'proposed']
const bucket = (d: number) => d <= 15 ? '0–15 days' : d <= 30 ? '16–30 days' : d <= 45 ? '31–45 days' : d <= 60 ? '46–60 days' : '> 60 days'

const TABS = ['Overview', 'Employee Report', 'Training Report', 'Assessment Report', 'Bench Aging'] as const
type Tab = typeof TABS[number]

export default function Reports() {
  const toast = useToast()
  const [tab, setTab] = useState<Tab>('Overview')
  return (
    <Async fetcher={() => Promise.all([
      api.employees(), api.benchReport(), api.assessmentReport(),
      api.trainingReport(), api.assignments(), api.assessments(),
    ])}>
      {([emps, bench, assess, training, assigns, assessments]: any) => {
        // ---- KPIs ----
        const active = emps.filter((e: any) => !INACTIVE.includes(e.status))
        const kpi = {
          total: emps.length,
          bench: active.length,
          training: emps.filter((e: any) => IN_TRAINING.includes(e.status)).length,
          ready: active.filter((e: any) => (e.readinessScore || 0) >= 80 || e.status === 'deployable').length,
          allocated: emps.filter((e: any) => ALLOCATED.includes(e.status)).length,
        }

        // ---- chart data ----
        const buDist: any = {}; emps.forEach((e: any) => { const b = e.bu || 'Other'; buDist[b] = (buDist[b] || 0) + 1 })
        const skillCount: any = {}; emps.forEach((e: any) => (e.skills || []).forEach((s: any) => { skillCount[s.skill] = (skillCount[s.skill] || 0) + 1 }))
        const skillsTop5 = Object.fromEntries(Object.entries(skillCount).sort((a: any, b: any) => b[1] - a[1]).slice(0, 5))
        const trainingProg = { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 }
        ;(training.rows || []).forEach((r: any) => {
          if (r.items > 0 && r.completed === r.items) trainingProg['Completed']++
          else if ((r.avgPct || 0) > 0) trainingProg['In Progress']++
          else trainingProg['Not Started']++
        })
        const passed = (assess.rows || []).reduce((s: number, r: any) => s + (r.passed || 0), 0)
        const attempts = (assess.rows || []).reduce((s: number, r: any) => s + (r.attempts || 0), 0)
        const passRate = { Passed: passed, Failed: Math.max(0, attempts - passed) }
        const passPct = attempts ? Math.round(100 * passed / attempts) : 0

        // ---- tables ----
        const recentBench = [...(bench.rows || [])].sort((a: any, b: any) => b.ageDays - a.ageDays).slice(0, 10)
        const empName: any = {}; emps.forEach((e: any) => empName[e.id] = e.name)
        const assessName: any = {}; assessments.forEach((a: any) => assessName[a.id] = a.name)
        const upcoming = [...assigns]
          .filter((a: any) => a.status !== 'completed')
          .sort((a: any, b: any) => String(a.dueDate || '').localeCompare(String(b.dueDate || '')))
          .slice(0, 10)

        const empTable = emps.map((e: any) => ({
          LSID: e.id, Name: e.name, BU: e.bu, Role: e.targetRole, Status: e.status,
          Skills: (e.skills || []).map((s: any) => s.skill).join('; '),
          Profile: `${e.profileCompletionPct || 0}%`, Readiness: `${e.readinessScore || 0}%`,
          Manager: e.manager || '',
        }))
        const benchTable = (bench.rows || []).map((r: any) => ({
          LSID: r.id, Name: r.name, BU: r.bu, BenchDays: r.ageDays, Bucket: bucket(r.ageDays),
          Readiness: `${r.readiness}%`, Status: r.status,
        }))

        return (
          <>
            <PageHead title="Reports" sub="Insights into training, assessments, and employee readiness"
              actions={<>
                <button className="btn ghost" onClick={() => downloadCSV(empTable, 'employees.csv')}>⬇ CSV</button>
                <button className="btn ghost" onClick={() => downloadServerCSV(api.exportCsvUrl('readiness'), 'readiness.csv').catch(() => toast('Export failed', 'err'))}>⬇ Readiness</button>
                <button className="btn" onClick={() => printReport('rep')}>⬇ Export All Reports</button>
              </>} />

            {/* Tabs */}
            <div className="tabs">
              {TABS.map(t => <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
            </div>

            {/* KPI strip */}
            <div className="grid kpis">
              <Kpi label="Total Employees" value={kpi.total} icon="👥" />
              <Kpi label="Bench Employees" value={kpi.bench} icon="🪑" />
              <Kpi label="In Training" value={kpi.training} icon="🎓" />
              <Kpi label="Ready for Allocation" value={kpi.ready} icon="🚀" />
              <Kpi label="Allocated" value={kpi.allocated} icon="💼" />
            </div>

            <div id="rep" style={{ marginTop: 18 }}>
              {tab === 'Overview' && <>
                <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
                  <DonutCard title="Employee Distribution by BU" data={buDist} />
                  <BarCard title="Training Progress" data={trainingProg} />
                  <DonutCard title="Bench Aging (Employees)" data={bench.ageing} />
                  <DonutCard title={`Assessment Pass Rate — ${passPct}%`} data={passRate} />
                  <BarCard title="Skills in Demand (Top 5)" data={skillsTop5} />
                  <DonutCard title="Readiness Distribution" data={bench.readiness} />
                </div>

                <div className="two" style={{ marginTop: 14, alignItems: 'start' }}>
                  <div className="card pad">
                    <div className="sec-title">Recent Bench Employees (Top 10)</div>
                    <Table rows={recentBench} empty="No bench employees"
                      cols={[
                        { h: 'ID', c: (r: any) => <b>{r.id}</b> },
                        { h: 'Name', c: (r: any) => r.name },
                        { h: 'BU', c: (r: any) => r.bu || '—' },
                        { h: 'Bench Days', c: (r: any) => r.ageDays },
                        { h: 'Status', c: (r: any) => <span className="badge b-info">{bucket(r.ageDays)}</span> },
                      ]} />
                  </div>
                  <div className="card pad">
                    <div className="sec-title">Upcoming Assessments</div>
                    <Table rows={upcoming} empty="No upcoming assessments"
                      cols={[
                        { h: 'Employee', c: (r: any) => `${r.employeeId} · ${empName[r.employeeId] || ''}` },
                        { h: 'Assessment', c: (r: any) => assessName[r.assessmentId] || r.assessmentId },
                        { h: 'Due', c: (r: any) => r.dueDate || '—' },
                        { h: 'Status', c: (r: any) => statusBadge(r.status) },
                      ]} />
                  </div>
                </div>
              </>}

              {tab === 'Employee Report' && (
                <div className="card pad">
                  <div style={{ display: 'flex', marginBottom: 10 }}>
                    <div className="sec-title" style={{ flex: 1, margin: 0 }}>Employee Report</div>
                    <button className="btn ghost sm" onClick={() => downloadCSV(empTable, 'employees.csv')}>⬇ CSV</button>
                  </div>
                  <Table rows={empTable} empty="No employees"
                    cols={[
                      { h: 'LSID', c: (r: any) => <b>{r.LSID}</b> }, { h: 'Name', c: (r: any) => r.Name },
                      { h: 'BU', c: (r: any) => r.BU }, { h: 'Role', c: (r: any) => r.Role },
                      { h: 'Status', c: (r: any) => statusBadge(r.Status) }, { h: 'Skills', c: (r: any) => r.Skills },
                      { h: 'Profile', c: (r: any) => r.Profile }, { h: 'Readiness', c: (r: any) => r.Readiness },
                      { h: 'Manager', c: (r: any) => r.Manager },
                    ]} />
                </div>)}

              {tab === 'Training Report' && (
                <div className="card pad">
                  <div className="sec-title">Training Report</div>
                  <Table rows={training.rows || []} empty="No training data"
                    cols={[
                      { h: 'Employee', c: (r: any) => `${r.employeeId} · ${empName[r.employeeId] || ''}` },
                      { h: 'Modules', c: (r: any) => r.items },
                      { h: 'Completed', c: (r: any) => r.completed },
                      { h: 'Avg %', c: (r: any) => `${r.avgPct}%` },
                    ]} />
                </div>)}

              {tab === 'Assessment Report' && (
                <div className="card pad">
                  <div className="sec-title">Assessment Report</div>
                  <Table rows={assess.rows || []} empty="No results"
                    cols={[
                      { h: 'Assessment', c: (r: any) => <b>{r.name}</b> },
                      { h: 'Attempts', c: (r: any) => r.attempts },
                      { h: 'Passed', c: (r: any) => r.passed },
                      { h: 'Pass %', c: (r: any) => `${r.passRatePct}%` },
                    ]} />
                </div>)}

              {tab === 'Bench Aging' && <>
                <div className="two">
                  <DonutCard title="Bench Aging (Employees)" data={bench.ageing} />
                  <DonutCard title="Readiness Distribution" data={bench.readiness} />
                </div>
                <div className="card pad" style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', marginBottom: 10 }}>
                    <div className="sec-title" style={{ flex: 1, margin: 0 }}>Bench detail</div>
                    <button className="btn ghost sm" onClick={() => downloadCSV(benchTable, 'bench-aging.csv')}>⬇ CSV</button>
                  </div>
                  <Table rows={benchTable} empty="No bench employees"
                    cols={[
                      { h: 'LSID', c: (r: any) => <b>{r.LSID}</b> }, { h: 'Name', c: (r: any) => r.Name },
                      { h: 'BU', c: (r: any) => r.BU }, { h: 'Bench Days', c: (r: any) => r.BenchDays },
                      { h: 'Bucket', c: (r: any) => <span className="badge b-info">{r.Bucket}</span> },
                      { h: 'Readiness', c: (r: any) => r.Readiness }, { h: 'Status', c: (r: any) => statusBadge(r.Status) },
                    ]} />
                </div>
              </>}
            </div>
          </>
        )
      }}
    </Async>
  )
}