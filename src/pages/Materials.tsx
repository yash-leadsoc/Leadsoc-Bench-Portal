import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead, Badge } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal, DownloadBtn, Confirm } from '../components/Form'
import { useToast } from '../store/toast'

export default function Materials() {
  const toast = useToast()
  const [form, setForm] = useState<any>(null)
  const [del, setDel] = useState<any>(null)
  const extUrl = (u = '') => /^https?:\/\//i.test(u) ? u : `https://${u}`
  return (
    <Async fetcher={api.materials}>
      {(rows: any[], reload) => (
        <>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <button className="btn" onClick={() => setForm({})}>+ Add Material</button>
          </div>
          <Table rows={rows} empty="No materials yet"
            cols={[
              { h: 'Title', c: r => <b>{r.title}</b> },
              { h: 'Type', c: r => <Badge text={r.type} kind="info" /> },
              { h: 'Skill', c: r => r.skill },
              { h: 'Uploaded by', c: r => r.owner || '' },
            ]}
            actions={r => (<>
              {r.type === 'link'
                ? <a className="btn ghost sm" href={extUrl(r.url)} target="_blank" rel="noreferrer">↗ Open</a>
                : <DownloadBtn url={r.downloadUrl || r.url} />}
              <button className="btn ghost sm" onClick={() => setForm(r)}>Edit</button>
              <button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button>
            </>)} />
          {form && <FormModal title={form.id ? 'Edit Material' : 'Add Material'} onClose={() => setForm(null)}
            upload={{ label: 'Upload file (pdf/doc/ppt/xlsx)', when: (v: any) => v.type !== 'link' }}
            fields={[
              { key: 'title', label: 'Title', value: form.title },
              { key: 'type', label: 'Type', type: 'select', options: ['link', 'document'], value: form.type || 'link' },
              { key: 'url', label: 'External URL (optional if uploading)', value: form.url },
              { key: 'skill', label: 'Skill', value: form.skill },
              { key: 'description', label: 'Description', type: 'textarea', value: form.description },
            ]}
            onSubmit={async v => { form.id ? await api.editMaterial(form.id, v) : await api.addMaterial(v); reload(); toast('Saved') }} />}
          {del && <Confirm msg="Delete this material?" onClose={() => setDel(null)}
            onYes={async () => { await api.deleteMaterial(del.id); reload(); toast('Deleted') }} />}
        </>
      )}
    </Async>
  )
}
