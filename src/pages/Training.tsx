import { useState } from 'react'
import { PageHead } from '../components/ui'
import Materials from './Materials'
import Plans from './Plans'
import Assessments from './Assessments'
import Progress from './Progress'

export default function Training() {
  const [tab, setTab] = useState<'materials' | 'plans' | 'assessments' | 'progress'>('materials')
  return (
    <>
      <PageHead title="Training" sub="Learning materials, training plans, assessments, and progress" />
      <div className="tabs">
        <button className={`tab ${tab === 'materials' ? 'active' : ''}`} onClick={() => setTab('materials')}>Materials</button>
        <button className={`tab ${tab === 'assessments' ? 'active' : ''}`} onClick={() => setTab('assessments')}>Assessments</button>
        <button className={`tab ${tab === 'plans' ? 'active' : ''}`} onClick={() => setTab('plans')}>Training Plans</button>
        <button className={`tab ${tab === 'progress' ? 'active' : ''}`} onClick={() => setTab('progress')}>Training Progress</button>
      </div>
      {tab === 'materials' ? <Materials />
        : tab === 'plans' ? <Plans />
        : tab === 'assessments' ? <Assessments />
        : <Progress />}
    </>
  )
}