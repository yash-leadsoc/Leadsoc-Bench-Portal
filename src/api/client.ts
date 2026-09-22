export const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://127.0.0.1:8000'

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) { super(message); this.status = status }
}

let token: string | null = localStorage.getItem('tedp_token')
export const setToken = (t: string | null) => {
  token = t
  if (t) localStorage.setItem('tedp_token', t)
  else localStorage.removeItem('tedp_token')
}
export const getToken = () => token

const headers = () => {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) h['Authorization'] = `Bearer ${token}`
  return h
}

async function handle(res: Response): Promise<any> {
  const ct = res.headers.get('content-type') || ''
  if (res.ok) {
    if (res.status === 204) return null
    return ct.includes('json') ? res.json() : res.text()
  }
  let msg = await res.text()
  try { const j = JSON.parse(msg); msg = j.detail || msg } catch {}
  throw new ApiError(res.status, msg)
}

const url = (p: string, q?: Record<string, any>) => {
  const u = new URL(API_BASE + p)
  if (q) Object.entries(q).forEach(([k, v]) => v != null && u.searchParams.set(k, String(v)))
  return u.toString()
}

export const http = {
  get: (p: string, q?: Record<string, any>) => fetch(url(p, q), { headers: headers() }).then(handle),
  post: (p: string, body?: any, q?: Record<string, any>) =>
    fetch(url(p, q), { method: 'POST', headers: headers(), body: JSON.stringify(body ?? {}) }).then(handle),
  put: (p: string, body?: any, q?: Record<string, any>) =>
    fetch(url(p, q), { method: 'PUT', headers: headers(), body: JSON.stringify(body ?? {}) }).then(handle),
  del: (p: string) => fetch(url(p), { method: 'DELETE', headers: headers() }).then(handle),
  upload: (p: string, file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    const h: Record<string, string> = {}
    if (token) h['Authorization'] = `Bearer ${token}`
    return fetch(url(p), { method: 'POST', headers: h, body: fd }).then(handle)
  },
}

export const fileUrl = (u: string) => (u?.startsWith('http') ? u : API_BASE + u)
