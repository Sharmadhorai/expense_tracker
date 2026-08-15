import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

const fmt = (n, currency='USD') =>
  new Intl.NumberFormat('en-US', { style:'currency', currency, maximumFractionDigits:0 }).format(n || 0)

const COLORS = ['#6C63FF','#03DAC6','#FF6584','#FF9F43','#00D4AA','#A29BFE','#FD79A8','#74B9FF']

export default function Reports() {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'
  const now = new Date()

  const [period, setPeriod]   = useState('monthly')
  const [year, setYear]       = useState(now.getFullYear())
  const [month, setMonth]     = useState(now.getMonth() + 1)
  const [summary, setSummary] = useState(null)
  const [trend, setTrend]     = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [sumRes, trendRes, brkRes] = await Promise.all([
          API.get('/reports/summary'),
          API.get(`/reports/trend?period=${period}&year=${year}${period==='daily'?`&month=${month}`:''}`),
          API.get('/reports/category-breakdown?type=expense'),
        ])
        setSummary(sumRes.data)
        setTrend(trendRes.data)
        setBreakdown(brkRes.data)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [period, year, month])

  const balance = (summary?.total_income || 0) - (summary?.total_expenses || 0)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reports</h1>
          <p className="page-subtitle">Analyze your financial patterns</p>
        </div>
        <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
          <select className="form-select" style={{ width:'auto' }} value={year}
            onChange={e => setYear(parseInt(e.target.value))}>
            {[now.getFullYear()-2, now.getFullYear()-1, now.getFullYear()].map(y =>
              <option key={y} value={y}>{y}</option>
            )}
          </select>
          {period === 'daily' && (
            <select className="form-select" style={{ width:'auto' }} value={month}
              onChange={e => setMonth(parseInt(e.target.value))}>
              {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'].map((m,i) =>
                <option key={m} value={i+1}>{m}</option>
              )}
            </select>
          )}
        </div>
      </div>

      {/* Period tabs */}
      <div className="tab-bar" style={{ marginBottom:'2rem' }}>
        {['daily','monthly','yearly'].map(p => (
          <button key={p} className={`tab-btn ${period===p?'active':''}`}
            onClick={() => setPeriod(p)}>
            {p.charAt(0).toUpperCase()+p.slice(1)}
          </button>
        ))}
      </div>

      {/* Summary cards */}
      <div className="stats-grid" style={{ marginBottom:'2rem' }}>
        {[
          { label:'Total Income',   value:fmt(summary?.total_income, cur),   accent:'#00D4AA', icon:'📈' },
          { label:'Total Expenses', value:fmt(summary?.total_expenses, cur), accent:'#FF6584', icon:'📉' },
          { label:'Net Balance',    value:fmt(balance, cur),                 accent: balance>=0?'#00D4AA':'#FF6584', icon:'💰' },
          { label:'Transactions',   value:summary?.transaction_count || 0,  accent:'#6C63FF', icon:'🔄' },
        ].map((s,i) => (
          <div key={i} className="stat-card"
            style={{ '--card-accent':s.accent, '--card-accent-bg':`${s.accent}18` }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color:s.accent }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', paddingTop:'2rem' }}>
          <div className="spinner" style={{ width:36,height:36 }} />
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
          {/* Line / Bar Trend Chart */}
          <div className="card" style={{ gridColumn:'1 / -1' }}>
            <div style={{ fontWeight:700, marginBottom:'1.25rem' }}>📊 Income vs Expenses Trend</div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill:'#9090BB', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#9090BB', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'#1A1A35', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#F0F0FF' }} formatter={v => fmt(v, cur)} />
                <Legend wrapperStyle={{ color:'#9090BB', fontSize:12 }} />
                <Line type="monotone" dataKey="income"  stroke="#00D4AA" strokeWidth={2.5} dot={false} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#FF6584" strokeWidth={2.5} dot={false} name="Expense" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Pie Chart */}
          <div className="card">
            <div style={{ fontWeight:700, marginBottom:'1.25rem' }}>🍕 Expense by Category</div>
            {breakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={breakdown} dataKey="total" nameKey="category_name"
                    cx="50%" cy="50%" innerRadius={60} outerRadius={95} paddingAngle={3}>
                    {breakdown.map((e,i) => <Cell key={i} fill={e.category_color || COLORS[i%COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v => fmt(v,cur)}
                    contentStyle={{ background:'#1A1A35', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#F0F0FF' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize:11, color:'#9090BB' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-state"><div className="empty-state-icon">🍕</div><div className="empty-state-text">No data</div></div>
            )}
          </div>

          {/* Bar Comparison */}
          <div className="card">
            <div style={{ fontWeight:700, marginBottom:'1.25rem' }}>📊 Income vs Expenses Bar</div>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="label" tick={{ fill:'#9090BB', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#9090BB', fontSize:11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background:'#1A1A35', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#F0F0FF' }} formatter={v => fmt(v,cur)} />
                <Legend wrapperStyle={{ color:'#9090BB', fontSize:12 }} />
                <Bar dataKey="income"  fill="#00D4AA" radius={[4,4,0,0]} name="Income" />
                <Bar dataKey="expense" fill="#FF6584" radius={[4,4,0,0]} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category breakdown table */}
          {breakdown.length > 0 && (
            <div className="card" style={{ gridColumn:'1 / -1' }}>
              <div style={{ fontWeight:700, marginBottom:'1.25rem' }}>📋 Category Breakdown</div>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th style={{ textAlign:'right' }}>Amount</th>
                    <th style={{ textAlign:'right' }}>Share</th>
                    <th>Distribution</th>
                  </tr>
                </thead>
                <tbody>
                  {breakdown.map((b,i) => (
                    <tr key={i}>
                      <td><span style={{ marginRight:'0.4rem' }}>{b.category_icon}</span>{b.category_name}</td>
                      <td style={{ textAlign:'right', fontWeight:600, color:'#FF6584' }}>{fmt(b.total, cur)}</td>
                      <td style={{ textAlign:'right', color:'#9090BB' }}>{b.percentage.toFixed(1)}%</td>
                      <td style={{ width:160 }}>
                        <div className="progress-bar-track">
                          <div className="progress-bar-fill" style={{ width:`${b.percentage}%`, background: b.category_color || '#6C63FF' }} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
