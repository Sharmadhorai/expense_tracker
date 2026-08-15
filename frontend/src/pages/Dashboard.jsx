import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0)

const COLORS = ['#6C63FF','#03DAC6','#FF6584','#FF9F43','#00D4AA','#A29BFE','#FD79A8','#74B9FF']

export default function Dashboard() {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'

  const [summary, setSummary]     = useState(null)
  const [trend, setTrend]         = useState([])
  const [breakdown, setBreakdown] = useState([])
  const [recent, setRecent]       = useState([])
  const [loading, setLoading]     = useState(true)

  const now = new Date()
  const year = now.getFullYear()
  const monthStart = `${year}-${String(now.getMonth()+1).padStart(2,'0')}-01`
  const today = now.toISOString().split('T')[0]

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [sumRes, trendRes, brkRes, recRes] = await Promise.all([
          API.get('/reports/summary'),
          API.get(`/reports/trend?period=monthly&year=${year}`),
          API.get(`/reports/category-breakdown?type=expense`),
          API.get('/reports/recent-transactions?limit=5'),
        ])
        setSummary(sumRes.data)
        setTrend(trendRes.data)
        setBreakdown(brkRes.data.slice(0, 6))
        setRecent(recRes.data)
      } catch(e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const greeting = () => {
    const h = now.getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', paddingTop:'5rem' }}>
      <div className="spinner" style={{ width:40,height:40 }} />
    </div>
  )

  const balance = (summary?.total_income || 0) - (summary?.total_expenses || 0)

  const statCards = [
    { label: 'Total Balance', value: fmt(balance, cur), icon:'💰', accent:'#6C63FF', bg:'rgba(108,99,255,0.12)', sub: 'All time' },
    { label: 'Total Income',  value: fmt(summary?.total_income, cur), icon:'📈', accent:'#00D4AA', bg:'rgba(0,212,170,0.12)', sub: 'All time' },
    { label: 'Total Expenses',value: fmt(summary?.total_expenses, cur), icon:'📉', accent:'#FF6584', bg:'rgba(255,101,132,0.12)', sub: 'All time' },
    { label: 'Transactions',  value: summary?.transaction_count || 0, icon:'🔄', accent:'#FF9F43', bg:'rgba(255,159,67,0.12)', sub: 'Total records' },
  ]

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="page-subtitle">Here's your financial overview</p>
        </div>
        <div style={{ fontSize:'0.85rem', color:'#9090BB' }}>
          {now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        {statCards.map((s, i) => (
          <div key={i} className="stat-card animate-fadeIn"
            style={{ '--card-accent': s.accent, '--card-accent-bg': s.bg, animationDelay: `${i*0.07}s` }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'2rem' }}>
        {/* Income vs Expense Bar Chart */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>
            📊 Income vs Expenses — {year}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="label" tick={{ fill:'#9090BB', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#9090BB', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#1A1A35', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#F0F0FF' }} />
              <Bar dataKey="income"  fill="#00D4AA" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="#FF6584" radius={[4,4,0,0]} name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>
            🍕 Spending by Category
          </div>
          {breakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={breakdown} dataKey="total" nameKey="category_name"
                  cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3}>
                  {breakdown.map((entry, i) => (
                    <Cell key={i} fill={entry.category_color || COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => fmt(v, cur)}
                  contentStyle={{ background:'#1A1A35', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#F0F0FF' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize:11, color:'#9090BB' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">
              <div className="empty-state-icon">🍕</div>
              <div className="empty-state-text">No expense data yet</div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card">
        <div style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span>🕐 Recent Transactions</span>
          <a href="/transactions" style={{ fontSize:'0.8rem', color:'#6C63FF', textDecoration:'none' }}>View all →</a>
        </div>
        {recent.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-text">No transactions yet. Add your first one!</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign:'right' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(t => (
                <tr key={t.id}>
                  <td style={{ color:'#9090BB' }}>{new Date(t.date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</td>
                  <td>
                    <span style={{ marginRight:'0.4rem' }}>{t.category?.icon || '📦'}</span>
                    {t.category?.name || 'Uncategorized'}
                  </td>
                  <td style={{ color:'#9090BB' }}>{t.description || '—'}</td>
                  <td style={{ textAlign:'right', fontWeight:700,
                    color: t.type === 'income' ? '#00D4AA' : '#FF6584' }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount, cur)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
