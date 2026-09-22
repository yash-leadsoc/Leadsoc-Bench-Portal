import { api } from '../../api/api'
import { Async } from '../../components/Async'
import { PageHead, Empty } from '../../components/ui'
import { DownloadBtn } from '../../components/Form'

export default function MyPrep() {
  return (
    <Async fetcher={api.prepMaterials}>
      {(rows: any[]) => {
        const byClient: any = {}; rows.forEach(m => (byClient[m.client || 'General'] = byClient[m.client || 'General'] || []).push(m))
        return (
          <>
            <PageHead title="My Interview Prep" sub="Client-specific preparation material" />
            {rows.length === 0 && <div className="card"><Empty msg="No prep material available yet" /></div>}
            {Object.entries(byClient).map(([client, items]: any) => (
              <div key={client} className="card pad" style={{ marginBottom: 12 }}>
                <b>🏢 {client}</b>
                {items.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                    <span style={{ flex: 1 }}><b>{m.title}</b> · {m.type} {m.role ? `· ${m.role}` : ''}</span>
                    {m.url && m.type === 'link' ? <a className="btn ghost sm" href={m.url} target="_blank" rel="noreferrer">Open ↗</a> : <DownloadBtn url={m.url} />}
                  </div>))}
              </div>))}
          </>
        )
      }}
    </Async>
  )
}
