import { useEffect, useState, useCallback, ReactNode } from 'react'
import { Loader } from './ui'

export function Async<T>({ fetcher, children }: { fetcher: () => Promise<T>; children: (data: T, reload: () => void) => ReactNode }) {
  const [data, setData] = useState<T | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick(t => t + 1), [])
  useEffect(() => {
    let alive = true
    setData(null); setErr(null)
    fetcher().then(d => alive && setData(d)).catch(e => alive && setErr(e.message || 'Failed'))
    return () => { alive = false }
  }, [tick])
  if (err) return <div className="card pad" style={{ textAlign: 'center', color: 'var(--bad)' }}>
    ⚠️ {err}<div style={{ marginTop: 10 }}><button className="btn ghost sm" onClick={reload}>Retry</button></div></div>
  if (data == null) return <Loader />
  return <>{children(data, reload)}</>
}
