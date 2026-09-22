import { api } from '../../api/api'
import { Async } from '../../components/Async'
import { PageHead, Kpi, Bar, Badge } from '../../components/ui'

function benchDays(s: any) { if (!s) return 0; try { return Math.max(0, Math.floor((Date.now() - new Date(s).getTime()) / 86400000)) } catch { return 0 } }

export default function EmployeeHome() {
  return (
    <Async fetcher={() => Promise.all([api.insightMe(), api.myProfile()])}>
      {([ins, p]: any) => {
        const emp = p.employee || {}
        const comp = p.profileCompletion || { pct: 0, missing: [] }
        return (
          <>
            <PageHead title="My Dashboard" sub="Your status, readiness and next steps" />
            <div className="grid kpis">
              <Kpi label="Current Status" value={emp.status || '—'} icon="🪪" />
              <Kpi label="Bench Days" value={benchDays(emp.benchStart)} icon="📅" />
              <Kpi label="Profile" value={`${comp.pct || 0}%`} icon="👤" />
              <Kpi label="Availability" value={emp.availabilityType || emp.availability || '—'} icon="✅" />
              <Kpi label="Skills" value={(emp.skills || []).length} icon="⭐" />
              <Kpi label="Certifications" value={(emp.certifications || []).length} icon="🎖️" />
              <Kpi label="Training" value={`${ins.trainingCompletionPct || 0}%`} icon="🎓" />
              <Kpi label="Assessment" value={`${ins.assessmentPassRatePct || 0}%`} icon="📝" />
              <Kpi label="Readiness" value={`${ins.readinessScore || 0}%`} icon="🎯" />
            </div>
            <div style={{ height: 20 }} />
            <div className="two">
              <div className="card pad">
                <div className="sec-title">Profile completion</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><Bar value={comp.pct || 0} /><b>{comp.pct || 0}%</b></div>
                {(comp.missing || []).length > 0 && <>
                  <div className="muted" style={{ margin: '12px 0 6px' }}>Complete these to improve readiness:</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {(comp.missing || []).map((m: string, i: number) => <Badge key={i} text={m} kind="warn" />)}</div>
                </>}
              </div>
              <div className="card pad">
                <div className="sec-title">AI summary <Badge text={ins.provider || 'rule-based'} kind="info" /></div>
                <p>{ins.summary || 'Keep your profile, training and assessments up to date to raise your readiness.'}</p>
                {(ins.suggestions || []).slice(0, 4).map((s: string, i: number) => <div key={i} style={{ padding: '4px 0' }}>→ {s}</div>)}
              </div>
            </div>
          </>
        )
      }}
    </Async>
  )
}
