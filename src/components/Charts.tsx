import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts'

const COLORS = ['#4f46e5', '#8b5cf6', '#06b6d4', '#16a34a', '#d97706', '#dc2626', '#0ea5e9', '#db2777']

export function BarCard({ title, data }: { title: string; data: Record<string, any> }) {
  const rows = Object.entries(data || {}).map(([name, value]) => ({ name, value: Number(value) || 0 }))
  return (
    <div className="card pad">
      <div className="sec-title">{title}</div>
      {rows.length === 0 ? <p className="muted">No data</p> :
        <ResponsiveContainer width="100%" height={Math.max(180, rows.length * 42)}>
          <BarChart data={rows} layout="vertical" margin={{ left: 10, right: 20 }}>
            <XAxis type="number" hide /><YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={18}>
              {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>}
    </div>
  )
}

export function DonutCard({ title, data }: { title: string; data: Record<string, any> }) {
  const rows = Object.entries(data || {}).map(([name, value]) => ({ name, value: Number(value) || 0 })).filter(r => r.value > 0)
  return (
    <div className="card pad">
      <div className="sec-title">{title}</div>
      {rows.length === 0 ? <p className="muted">No data</p> :
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
              {rows.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
            </Pie>
            <Tooltip /><Legend />
          </PieChart>
        </ResponsiveContainer>}
    </div>
  )
}
