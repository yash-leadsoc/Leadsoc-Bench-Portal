import { ReactNode } from 'react'
import { Empty } from './ui'

export interface Col { h: string; c: (r: any) => ReactNode }
export function Table({ cols, rows, actions, empty = 'Nothing here yet' }: {
  cols: Col[]; rows: any[]; actions?: (r: any) => ReactNode; empty?: string
}) {
  if (!rows?.length) return <div className="card"><Empty msg={empty} /></div>
  return (
    <div className="card" style={{ overflowX: 'auto' }}>
      <table>
        <thead><tr>{cols.map((c, i) => <th key={i}>{c.h}</th>)}{actions && <th style={{ textAlign: 'right' }}>Actions</th>}</tr></thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.id || r._id || i}>
              {cols.map((c, j) => <td key={j}>{c.c(r)}</td>)}
              {actions && <td><div className="rowact">{actions(r)}</div></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
