import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
type T = { id: number; msg: string; kind: 'ok' | 'err' }
const Ctx = createContext<(msg: string, kind?: 'ok' | 'err') => void>(() => {})
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<T[]>([])
  const push = useCallback((msg: string, kind: 'ok' | 'err' = 'ok') => {
    const id = Date.now() + Math.random()
    setItems(x => [...x, { id, msg, kind }])
    setTimeout(() => setItems(x => x.filter(i => i.id !== id)), 3200)
  }, [])
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="toasts">
        {items.map(i => <div key={i.id} className={`toast ${i.kind}`}>{i.msg}</div>)}
      </div>
    </Ctx.Provider>
  )
}
