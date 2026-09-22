import { useState, ReactNode } from 'react'
import { Modal } from './Modal'
import { http, fileUrl } from '../api/client'

export interface Field { key: string; label: string; type?: 'text' | 'number' | 'textarea' | 'select' | 'switch' | 'date' | 'time'; options?: (string | { value: string; label: string })[]; value?: any }

// export function FormModal({ title, fields, onClose, onSubmit, submitLabel = 'Save', upload }: {
//   title: string; fields: Field[]; onClose: () => void; onSubmit: (v: any) => Promise<void>; submitLabel?: string
//     upload?: { label: string; when?: (vals: any) => boolean }
// }) {
//   const [vals, setVals] = useState<any>(() => {
//     const o: any = {}; fields.forEach(f => o[f.key] = f.value ?? (f.type === 'switch' ? false : ''))
//     return o
//   })
//   const [file, setFile] = useState<{ url: string; fileName: string; fileType: string } | null>(null)
//   const [busy, setBusy] = useState(false)
//   const set = (k: string, v: any) => setVals((x: any) => ({ ...x, [k]: v }))

//   const doUpload = async (f: File) => {
//     try { const r = await http.upload('/files/upload', f); setFile(r) } catch (e) { console.error(e) }
//   }

//   const submit = async () => {
//     setBusy(true)
//     try {
//       const payload = { ...vals }
//             if (file) { payload.url = file.url; payload.downloadUrl = (file as any).downloadUrl; payload.fileName = file.fileName; payload.fileType = file.fileType }
//       await onSubmit(payload); onClose()
//     } catch (e: any) { alert(e.message || 'Failed'); setBusy(false) }
//   }

//   return (
//     <Modal title={title} onClose={onClose} footer={
//       <>
//         <button className="btn ghost" onClick={onClose}>Cancel</button>
//         <button className="btn" onClick={submit} disabled={busy}>{busy ? <span className="spin w" /> : submitLabel}</button>
//       </>
//     }>
//       {fields.map(f => (
//         <div key={f.key}>
//           <label className="fld">{f.label}</label>
//           {f.type === 'select' ? (
//             <select value={vals[f.key]} onChange={e => set(f.key, e.target.value)}>
//               {(f.options || []).map(o => <option key={o} value={o}>{o}</option>)}
//             </select>
//           ) : f.type === 'switch' ? (
//             <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//               <input type="checkbox" checked={!!vals[f.key]} onChange={e => set(f.key, e.target.checked)} /> <span className="muted">Yes</span>
//             </label>
//           ) : f.type === 'textarea' ? (
//             <textarea value={vals[f.key]} onChange={e => set(f.key, e.target.value)} />
//           ) : (
//             <input className="input" type={f.type === 'number' ? 'number' : 'text'} value={vals[f.key]} onChange={e => set(f.key, e.target.value)} />
//           )}
//         </div>
//       ))}
//         {upload && (!upload.when || upload.when(vals)) && (
//         <div>
//           <label className="fld">{upload.label}</label>
//           <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
//             onChange={e => e.target.files?.[0] && doUpload(e.target.files[0])} />
//           {file && <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>Uploaded: {file.fileName}</div>}
//         </div>
//       )}
//     </Modal>
//   )
// }

export function FormModal({ title, fields, onClose, onSubmit, submitLabel = 'Save', upload }: {
  title: string; fields: Field[]; onClose: () => void; onSubmit: (v: any) => Promise<void>; submitLabel?: string
  upload?: { label: string; when?: (vals: any) => boolean }
}) {
  const [vals, setVals] = useState<any>(() => {
    const o: any = {}; fields.forEach(f => o[f.key] = f.value ?? (f.type === 'switch' ? false : ''))
    return o
  })
  const [file, setFile] = useState<{ url: string; downloadUrl?: string; fileName: string; fileType: string } | null>(null)
  const [uploading, setUploading] = useState(false)
  const [upErr, setUpErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: any) => setVals((x: any) => ({ ...x, [k]: v }))

  const doUpload = async (f: File) => {
    setUploading(true); setUpErr(null); setFile(null)
    try {
      const r = await http.upload('/files/upload', f)
      if (!r?.url) throw new Error('Upload returned no URL')
      setFile(r)
    } catch (e: any) {
      setUpErr(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const submit = async () => {
    if (uploading) { alert('Please wait for the file to finish uploading.'); return }
    setBusy(true)
    try {
      const payload = { ...vals }
      if (file) {
        payload.url = file.url
        payload.downloadUrl = file.downloadUrl
        payload.fileName = file.fileName
        payload.fileType = file.fileType
      }
      await onSubmit(payload); onClose()
    } catch (e: any) { alert(e.message || 'Failed'); setBusy(false) }
  }

  return (
    <Modal title={title} onClose={onClose} footer={
      <>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
        <button className="btn" onClick={submit} disabled={busy || uploading}>
          {busy ? <span className="spin w" /> : uploading ? 'Uploading…' : submitLabel}
        </button>
      </>
    }>
      {fields.map(f => (
        <div key={f.key}>
          <label className="fld">{f.label}</label>
                    {f.type === 'select' ? (
            <select value={vals[f.key]} onChange={e => set(f.key, e.target.value)}>
              {(f.options || []).map(o => {
                const opt = typeof o === 'string' ? { value: o, label: o } : o
                return <option key={opt.value} value={opt.value}>{opt.label}</option>
              })}
            </select>
          ) : f.type === 'date' || f.type === 'time' ? (
            <input className="input" type={f.type} value={vals[f.key]} onChange={e => set(f.key, e.target.value)} />
          ) : f.type === 'switch' ? (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="checkbox" checked={!!vals[f.key]} onChange={e => set(f.key, e.target.checked)} /> <span className="muted">Yes</span>
            </label>
          ) : f.type === 'textarea' ? (
            <textarea value={vals[f.key]} onChange={e => set(f.key, e.target.value)} />
          ) : (
            <input className="input" type={f.type === 'number' ? 'number' : 'text'} value={vals[f.key]} onChange={e => set(f.key, e.target.value)} />
          )}
        </div>
      ))}
      {upload && (!upload.when || upload.when(vals)) && (
        <div>
          <label className="fld">{upload.label}</label>
          <input type="file" disabled={uploading}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.png,.jpg,.jpeg,.zip"
            onChange={e => e.target.files?.[0] && doUpload(e.target.files[0])} />
          {uploading && <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>Uploading…</div>}
          {file && <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>Uploaded: {file.fileName}</div>}
          {upErr && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--bad)' }}>⚠ {upErr}</div>}
        </div>
      )}
    </Modal>
  )
}

export function DownloadBtn({ url }: { url?: string }) {
  if (!url) return null
  return <a className="btn ghost sm" href={fileUrl(url)} target="_blank" rel="noreferrer" download>⬇ Download</a>
}

export function Confirm({ msg, onClose, onYes }: { msg: string; onClose: () => void; onYes: () => void }) {
  return <Modal title="Please confirm" onClose={onClose} footer={
    <><button className="btn ghost" onClick={onClose}>Cancel</button>
      <button className="btn danger" onClick={() => { onYes(); onClose() }}>Confirm</button></>
  }><p>{msg}</p></Modal>
}
