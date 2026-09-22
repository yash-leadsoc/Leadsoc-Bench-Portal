import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal, DownloadBtn, Confirm } from '../components/Form'
import { useToast } from '../store/toast'

export default function Prep() {
  const [tab, setTab] = useState<'mat' | 'bank'>('mat')
  return (
    <>
      <PageHead title="Interview Prep" sub="Company-wise materials and question banks (document upload)" />
      <div className="tabs">
        <button className={`tab ${tab === 'mat' ? 'active' : ''}`} onClick={() => setTab('mat')}>Prep Materials</button>
        <button className={`tab ${tab === 'bank' ? 'active' : ''}`} onClick={() => setTab('bank')}>Question Banks</button>
      </div>
      {tab === 'mat' ? <PrepMaterials /> : <Banks />}
    </>
  )
}

function PrepMaterials() {
  const toast = useToast()
  const [form, setForm] = useState<any>(null); const [del, setDel] = useState<any>(null)
  return <Async fetcher={api.prepMaterials}>{(rows: any[], reload) => {
    const byClient: any = {}; rows.forEach(m => (byClient[m.client || 'General'] = byClient[m.client || 'General'] || []).push(m))
    return (
      <>
        <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm({})}>+ Add Material</button></div>
        {rows.length === 0 && <div className="card"><div className="empty">No prep material yet</div></div>}
        {Object.entries(byClient).map(([client, items]: any) => (
          <div key={client} className="card pad" style={{ marginBottom: 12 }}>
            <b>🏢 {client}</b>
            {items.map((m: any) => (
              <div key={m.id} style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '6px 0' }}>
                <span style={{ flex: 1 }}><b>{m.title}</b> · {m.type} {m.role ? `· ${m.role}` : ''}</span>
                <DownloadBtn url={m.url} />
                <button className="btn ghost sm danger" onClick={() => setDel(m)}>Delete</button>
              </div>))}
          </div>))}
        {form && <FormModal title="Add Prep Material" onClose={() => setForm(null)} upload={{ label: 'Upload file (pdf/doc/ppt/xlsx)' }}
          fields={[
            { key: 'title', label: 'Title' }, { key: 'client', label: 'Company / Client', value: 'General' },
            { key: 'role', label: 'Role' },
            { key: 'type', label: 'Type', type: 'select', options: ['pdf', 'doc', 'ppt', 'excel', 'link', 'other'], value: 'pdf' },
            { key: 'url', label: 'External URL (optional if uploading)' },
            { key: 'description', label: 'Description', type: 'textarea' },
          ]}
          onSubmit={async v => { await api.addPrepMaterial(v); reload(); toast('Added') }} />}
        {del && <Confirm msg="Delete material?" onClose={() => setDel(null)} onYes={async () => { await api.deletePrepMaterial(del.id); reload() }} />}
      </>
    )
  }}</Async>
}

function Banks() {
  const toast = useToast()
  const [form, setForm] = useState<any>(null); const [del, setDel] = useState<any>(null)
  return <Async fetcher={api.banks}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm({})}>+ New Question Bank</button></div>
      <Table rows={rows} empty="No question banks"
        cols={[
          { h: 'Title', c: r => <b>{r.name}</b> }, { h: 'Client', c: r => r.client },
          { h: 'Role', c: r => r.role }, { h: 'Technology', c: r => r.technology }, { h: 'Questions', c: r => r.questionCount || 0 },
        ]}
        actions={r => (<><DownloadBtn url={r.docUrl} /><button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button></>)} />
      {form && <FormModal title="New Question Bank" onClose={() => setForm(null)} upload={{ label: 'Question document (PDF/DOC/PPT)' }}
        fields={[
          { key: 'name', label: 'Title' }, { key: 'client', label: 'Client / Company' }, { key: 'role', label: 'Role' },
          { key: 'technology', label: 'Technology' }, { key: 'category', label: 'Category' },
        ]}
        onSubmit={async v => { await api.createBank({ ...v, docUrl: v.url, fileName: v.fileName, fileType: v.fileType }); reload(); toast('Created') }} />}
      {del && <Confirm msg="Delete bank?" onClose={() => setDel(null)} onYes={async () => { await api.deleteBank(del.id); reload() }} />}
    </>
  )}</Async>
}
