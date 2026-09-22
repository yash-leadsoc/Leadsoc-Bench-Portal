import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, Kpi } from '../components/ui'
import { Table } from '../components/Table'
import { BarCard, DonutCard } from '../components/Charts'

const INACTIVE = ['deployed', 'released', 'transferred']
const IN_TRAINING = ['newEntry', 'trainingPlanned', 'trainingInProgress', 'assessment', 'assessmentDue']
const ALLOCATED = ['deployed', 'proposed']
const ageOf = (e: any) => { try { return Math.max(0, Math.floor((Date.now() - new Date(e.benchStart).getTime()) / 864e5)) } catch { return 0 } }

export default function Ctodashboard() {
  return (
    <Async fetcher={() => Promise.all([
      api.employees(), api.assessmentReport(), api.trainingReport(),
      api.assignments(), api.requirements(), api.results(),
    ])}>
      {([emps, assess, training, assigns, reqs, results]: any) => {
        const active = emps.filter((e: any) => !INACTIVE.includes(e.status))
        const kpi = {
          total: emps.length,
          bench: active.length,
          available: active.filter((e: any) => e.status === 'deployable').length,
          training: emps.filter((e: any) => IN_TRAINING.includes(e.status)).length,
          ready: active.filter((e: any) => (e.readinessScore || 0) >= 80 || e.status === 'deployable').length,
          allocated: emps.filter((e: any) => ALLOCATED.includes(e.status)).length,
          critical: active.filter((e: any) => ageOf(e) > 60).length,
        }

        // analytics
        const benchByBU: any = {}; active.forEach((e: any) => { const b = e.bu || 'Other'; benchByBU[b] = (benchByBU[b] || 0) + 1 })
        const benchBySkill: any = {}; active.forEach((e: any) => (e.skills || []).forEach((s: any) => { benchBySkill[s.skill] = (benchBySkill[s.skill] || 0) + 1 }))
        const skillTop = Object.fromEntries(Object.entries(benchBySkill).sort((a: any, b: any) => b[1] - a[1]).slice(0, 6))
        const aging = { '0–30': 0, '31–60': 0, '61–90': 0, '90+': 0 }
        active.forEach((e: any) => { const a = ageOf(e); aging[a <= 30 ? '0–30' : a <= 60 ? '31–60' : a <= 90 ? '61–90' : '90+']++ })
        const trainingProg = { 'Not Started': 0, 'In Progress': 0, 'Completed': 0 }
        const trainByEmp: any = {}
        ;(training.rows || []).forEach((r: any) => {
          trainByEmp[r.employeeId] = r
          if (r.items > 0 && r.completed === r.items) trainingProg['Completed']++
          else if ((r.avgPct || 0) > 0) trainingProg['In Progress']++
          else trainingProg['Not Started']++
        })
        const totItems = (training.rows || []).reduce((s: number, r: any) => s + r.items, 0)
        const totDone = (training.rows || []).reduce((s: number, r: any) => s + r.completed, 0)
        const completionPct = totItems ? Math.round(100 * totDone / totItems) : 0

        // attention required
        const empName: any = {}; emps.forEach((e: any) => empName[e.id] = e.name)
        const longBench = active.filter((e: any) => ageOf(e) > 60).sort((a: any, b: any) => ageOf(b) - ageOf(a))
        const pendingAssess = assigns.filter((a: any) => a.status !== 'completed')
        const latestResult: any = {}
        results.forEach((r: any) => { const k = r.employeeId; if (!latestResult[k] || (r.attemptNumber || 0) >= (latestResult[k].attemptNumber || 0)) latestResult[k] = r })
        const failed = Object.values(latestResult).filter((r: any) => r.passed === false)
        const readyNotAlloc = active.filter((e: any) => ((e.readinessScore || 0) >= 80 || e.status === 'deployable') && !ALLOCATED.includes(e.status))
        const behind = active.filter((e: any) => IN_TRAINING.includes(e.status) && (trainByEmp[e.id]?.avgPct ?? 0) < 40)

        return (
          <>
            <PageHead title="CTO Dashboard" sub="Organization-wide workforce & training intelligence" />

            <div className="grid kpis">
              <Kpi label="Total Employees" value={kpi.total} icon="👥" />
              <Kpi label="Total Bench" value={kpi.bench} icon="🪑" />
              <Kpi label="Available" value={kpi.available} icon="✅" />
              <Kpi label="In Training" value={kpi.training} icon="🎓" />
              <Kpi label="Ready for Allocation" value={kpi.ready} icon="🚀" />
              <Kpi label="Allocated" value={kpi.allocated} icon="💼" />
              <Kpi label="Critical Bench" value={kpi.critical} icon="⚠️" />
            </div>

            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14, marginTop: 18 }}>
              <DonutCard title="Bench by BU" data={benchByBU} />
              <BarCard title="Bench by Skill" data={skillTop} />
              <DonutCard title="Bench Aging" data={aging} />
              <BarCard title={`Training Progress · ${completionPct}% complete`} data={trainingProg} />
            </div>

            {/* Open requirements + skill gaps */}
            <div className="two" style={{ marginTop: 14, alignItems: 'start' }}>
              <div className="card pad">
                <div className="sec-title">Open Requirements</div>
                <Table rows={reqs} empty="No open requirements"
                  cols={[
                    { h: 'Role / Skill', c: (r: any) => <b>{r.role || r.title || r.skill || 'Requirement'}</b> },
                    { h: 'BU', c: (r: any) => r.bu || '—' },
                    { h: 'Openings', c: (r: any) => r.openings ?? r.count ?? r.positions ?? 1 },
                  ]} />
              </div>
              <div className="card pad">
                <div className="sec-title">Skill Gaps (demand vs available bench)</div>
                <Table rows={reqs} empty="No requirements to analyse"
                  cols={[
                    { h: 'Skill', c: (r: any) => r.skill || r.role || r.title || '—' },
                    { h: 'Needed', c: (r: any) => r.openings ?? r.count ?? 1 },
                    { h: 'Available', c: (r: any) => (benchBySkill[r.skill] || 0) },
                    { h: 'Gap', c: (r: any) => {
                        const gap = (r.openings ?? r.count ?? 1) - (benchBySkill[r.skill] || 0)
                        return gap > 0 ? <span className="badge b-bad">-{gap}</span> : <span className="badge b-ok">covered</span>
                      } },
                  ]} />
              </div>
            </div>

            {/* Attention required */}
            <div className="sec-title" style={{ marginTop: 22 }}>⚠️ Attention Required</div>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 14 }}>
              <AttnCard title="Long-bench employees (>60 days)" rows={longBench}
                render={(e: any) => `${e.name} (${e.id}) · ${ageOf(e)}d`} />
              <AttnCard title="Ready but not allocated" rows={readyNotAlloc}
                render={(e: any) => `${e.name} (${e.id}) · ${e.readinessScore || 0}%`} />
              <AttnCard title="Pending assessments" rows={pendingAssess}
                render={(a: any) => `${empName[a.employeeId] || a.employeeId} · due ${a.dueDate || '—'}`} />
              <AttnCard title="Failed assessments" rows={failed}
                render={(r: any) => `${empName[r.employeeId] || r.employeeId} · ${r.scoreMarks}/${r.totalMarks}`} />
              <AttnCard title="Training behind (<40%)" rows={behind}
                render={(e: any) => `${e.name} (${e.id}) · ${trainByEmp[e.id]?.avgPct ?? 0}%`} />
            </div>
          </>
        )
      }}
    </Async>
  )
}

function AttnCard({ title, rows, render }: any) {
  return (
    <div className="card pad">
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
        <b style={{ flex: 1 }}>{title}</b>
        <span className={`badge ${rows.length ? 'b-warn' : 'b-ok'}`}>{rows.length}</span>
      </div>
      {rows.length === 0 ? <p className="muted" style={{ fontSize: 13 }}>All clear.</p> :
        rows.slice(0, 8).map((r: any, i: number) => (
          <div key={i} style={{ fontSize: 13.5, padding: '5px 0', borderBottom: '1px solid var(--line)' }}>{render(r)}</div>))}
      {rows.length > 8 && <div className="muted" style={{ fontSize: 12, marginTop: 6 }}>+{rows.length - 8} more</div>}
    </div>
  )
}