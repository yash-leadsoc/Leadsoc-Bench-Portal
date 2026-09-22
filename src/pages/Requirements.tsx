import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead } from '../components/ui'
import { Table } from '../components/Table'

export default function Requirements() {
  return (
    <Async fetcher={api.requirements}>
      {(reqs: any[]) => (
        <>
          <PageHead title="Requirements" sub="Open demand across business units" />
          <Table rows={reqs} empty="No open requirements"
            cols={[
              { h: 'Role / Title', c: (r: any) => <b>{r.role || r.title || 'Requirement'}</b> },
              { h: 'Skill', c: (r: any) => r.skill || '—' },
              { h: 'BU', c: (r: any) => r.bu || '—' },
              { h: 'Openings', c: (r: any) => r.openings ?? r.count ?? r.positions ?? 1 },
              { h: 'Status', c: (r: any) => <span className="badge b-info">{r.status || 'Open'}</span> },
            ]} />
        </>
      )}
    </Async>
  )
}