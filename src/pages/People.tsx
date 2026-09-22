import { useState } from 'react'
import { api } from '../api/api'
import { Async } from '../components/Async'
import { PageHead } from '../components/ui'
import { Table } from '../components/Table'
import { FormModal, Confirm } from '../components/Form'
import { AssignEmp } from './Plans'
import { useToast } from '../store/toast'

export default function People() {
  const [tab, setTab] = useState<'tr' | 'sk'>('tr')
  return (
    <>
      <PageHead title="People & Capacity" sub="Trainers and the skills directory" />
      <div className="tabs">
        <button className={`tab ${tab === 'tr' ? 'active' : ''}`} onClick={() => setTab('tr')}>Trainers</button>
        <button className={`tab ${tab === 'sk' ? 'active' : ''}`} onClick={() => setTab('sk')}>Skills Directory</button>
      </div>
      {tab === 'tr' ? <Trainers /> : <Skills />}
    </>
  )
}

function Trainers() {
  const toast = useToast()
  const [form, setForm] = useState<any>(null); const [assign, setAssign] = useState<any>(null); const [del, setDel] = useState<any>(null)
  return <Async fetcher={api.trainers}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm({})}>+ Add Trainer</button></div>
      <Table rows={rows} empty="No trainers"
        cols={[
          { h: 'Name', c: r => <b>{r.name}</b> },
          { h: 'Type', c: r => r.internal ? 'Internal' : 'External' },
          { h: 'Expertise', c: r => (r.expertise || []).join(', ') },
          { h: 'Capacity', c: r => `${r.capacityHoursPerWeek || 0}h/wk` },
          { h: 'Assigned', c: r => (r.assignments || []).length },
        ]}
        actions={r => (<>
          <button className="btn ghost sm" onClick={() => setAssign(r)}>Assign</button>
          <button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button>
        </>)} />
      {form && <FormModal title="Add Trainer" onClose={() => setForm(null)}
        fields={[
          { key: 'name', label: 'Name' }, { key: 'email', label: 'Email' },
          { key: 'expertise', label: 'Expertise (comma-separated)' },
          { key: 'capacityHoursPerWeek', label: 'Capacity (hrs/week)', type: 'number' },
          { key: 'internal', label: 'Internal trainer', type: 'switch', value: true },
        ]}
        onSubmit={async v => { await api.addTrainer({ ...v, expertise: String(v.expertise).split(',').map((s: string) => s.trim()).filter(Boolean), capacityHoursPerWeek: Number(v.capacityHoursPerWeek) || 0 }); reload(); toast('Added') }} />}
      {assign && <AssignEmp title="Assign trainer" onClose={() => setAssign(null)} onPick={async id => { await api.assignTrainer(assign.id, id); toast('Assigned') }} />}
      {del && <Confirm msg="Delete trainer?" onClose={() => setDel(null)} onYes={async () => { await api.deleteTrainer(del.id); reload() }} />}
    </>
  )}</Async>
}

function Skills() {
  const toast = useToast()
  const [form, setForm] = useState<any>(null); const [del, setDel] = useState<any>(null)
  return <Async fetcher={api.skills}>{(rows: any[], reload) => (
    <>
      <div style={{ textAlign: 'right', marginBottom: 12 }}><button className="btn" onClick={() => setForm({})}>+ Add Skill</button></div>
      <Table rows={rows} empty="No skills"
        cols={[{ h: 'Skill', c: r => <b>{r.name}</b> }, { h: 'Category', c: r => r.category }, { h: 'Levels', c: r => (r.levels || []).join(', ') }]}
        actions={r => <button className="btn ghost sm danger" onClick={() => setDel(r)}>Delete</button>} />
      {form && <FormModal title="Add Skill" onClose={() => setForm(null)}
        fields={[{ key: 'name', label: 'Skill name' }, { key: 'category', label: 'Category' }]}
        onSubmit={async v => { await api.addSkill(v); reload(); toast('Added') }} />}
      {del && <Confirm msg="Delete skill?" onClose={() => setDel(null)} onYes={async () => { await api.deleteSkill(del.id); reload() }} />}
    </>
  )}</Async>
}
