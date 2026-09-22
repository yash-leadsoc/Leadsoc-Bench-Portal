import { API_BASE, getToken } from '../api/client'

export function downloadCSV(rows: any[], filename: string) {
  if (!rows?.length) return
  const keys = Object.keys(rows[0])
  const esc = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = [keys.join(','), ...rows.map(r => keys.map(k => esc(r[k])).join(','))].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

export async function downloadServerCSV(path: string, filename: string) {
  const res = await fetch(API_BASE + path, { headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : {} })
  const text = await res.text()
  const blob = new Blob([text], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
}

export function printReport(elementId: string) {
  const el = document.getElementById(elementId)
  if (!el) return
  const w = window.open('', '_blank')
  if (!w) return
  w.document.write(`<html><head><title>Report</title><style>
    body{font-family:Arial,sans-serif;padding:24px;color:#0f172a}
    table{width:100%;border-collapse:collapse;font-size:12px} th,td{border:1px solid #ddd;padding:6px 8px;text-align:left}
    th{background:#f1f5f9} h1,h2{margin:0 0 10px}</style></head><body>${el.innerHTML}</body></html>`)
  w.document.close(); w.focus(); w.print()
}
