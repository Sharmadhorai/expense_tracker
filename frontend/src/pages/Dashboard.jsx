import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'

const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(n || 0)

const COLORS = ['#0ea5e9', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6', '#ec4899', '#3b82f6', '#14b8a6']

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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [sumRes, trendRes, catRes, recRes] = await Promise.allSettled([
          API.get('/reports/summary'),
          API.get(`/reports/trend?period=monthly&year=${year}`),
          API.get('/reports/category-breakdown'),
          API.get('/reports/recent-transactions?limit=8'),
        ])
        if (sumRes.status === 'fulfilled') setSummary(sumRes.value.data)
        if (trendRes.status === 'fulfilled') setTrend(trendRes.value.data)
        if (catRes.status === 'fulfilled') setBreakdown(catRes.value.data)
        if (recRes.status === 'fulfilled') setRecent(recRes.value.data)
      } catch (e) {
        console.error('Dashboard error:', e)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [year])

  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'60vh' }}>
      <div className="spinner" style={{ width:40, height:40 }} />
    </div>
  )

  const hour = now.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'
  const firstName = user?.name ? user.name.split(' ')[0] : 'there'

  const totalIncome = summary?.total_income ?? 0
  const totalExpenses = summary?.total_expenses ?? 0
  const totalBalance = summary?.balance ?? summary?.net ?? (parseFloat(totalIncome) - parseFloat(totalExpenses))
  const txCount = summary?.total_transactions ?? summary?.transaction_count ?? recent.length ?? 0

  const stats = [
    {
      label: 'TOTAL BALANCE',
      value: fmt(totalBalance, cur),
      sub: 'All time',
      accent: 'var(--primary)',
      bg: 'var(--primary-light)',
      icon: '💰'
    },
    {
      label: 'TOTAL INCOME',
      value: fmt(totalIncome, cur),
      sub: 'All time',
      accent: 'var(--income-color)',
      bg: 'rgba(16,185,129,0.12)',
      icon: '📈'
    },
    {
      label: 'TOTAL EXPENSES',
      value: fmt(totalExpenses, cur),
      sub: 'All time',
      accent: 'var(--expense-color)',
      bg: 'rgba(244,63,94,0.12)',
      icon: '📉'
    },
    {
      label: 'TRANSACTIONS',
      value: txCount,
      sub: 'Total records',
      accent: 'var(--secondary)',
      bg: 'rgba(245,158,11,0.12)',
      icon: '🔄'
    },
  ]

  return (
    <div className="dashboard-page animate-fadeIn">
      {/* Header */}
      <div className="page-header" style={{ marginBottom:'1.75rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:800, letterSpacing:'-0.02em' }}>
            {greeting}, {firstName}! 👋
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.9rem', marginTop:'0.25rem' }}>
            Here's your financial overview
          </p>
        </div>
        <div style={{ color:'var(--text-secondary)', fontSize:'0.85rem' }}>
          {now.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card animate-fadeIn"
            style={{ '--card-accent': s.accent, '--card-accent-bg': s.bg, animationDelay: `${i*0.07}s` }}>
            <div className="stat-card-icon">{s.icon}</div>
            <div className="stat-card-label">{s.label}</div>
            <div className="stat-card-value" style={{ color: s.accent }}>{s.value}</div>
            <div className="stat-card-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts row (Visible on desktop/tablets) */}
      <div className="dashboard-charts" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
        {/* Income vs Expense Bar Chart */}
        <div className="card">
          <div style={{ fontWeight:700, marginBottom:'1.25rem', fontSize:'1rem' }}>
            📊 Income vs Expenses — {year}
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend} margin={{ top:0, right:0, left:-20, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="label" tick={{ fill:'var(--text-secondary)', fontSize:11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'var(--text-secondary)', fontSize:11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'var(--bg-modal)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-primary)' }} />
              <Bar dataKey="income"  fill="var(--income-color)" radius={[4,4,0,0]} name="Income" />
              <Bar dataKey="expense" fill="var(--expense-color)" radius={[4,4,0,0]} name="Expense" />
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
                  contentStyle={{ background:'var(--bg-modal)', border:'1px solid var(--border)', borderRadius:10, color:'var(--text-primary)' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize:11, color:'var(--text-secondary)' }} />
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

      {/* Recent Transactions Listing (Type + Amount) */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ fontWeight:700, marginBottom:'1rem', fontSize:'1rem', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <span>🕐</span>
            <span>Recent Transactions</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
            <Link to="/transactions" className="btn btn-primary" style={{ padding:'0.35rem 0.75rem', fontSize:'0.78rem', textDecoration:'none', borderRadius:8 }}>
              + Add / View All
            </Link>
          </div>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state" style={{ padding: '2.5rem 1rem' }}>
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-text" style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>
              No transactions recorded yet.
            </div>
            <Link to="/transactions" className="btn btn-primary" style={{ textDecoration:'none', padding:'0.5rem 1.25rem' }}>
              + Add Your First Transaction
            </Link>
          </div>
        ) : (
          <div className="tx-list-container" style={{ display:'flex', flexDirection:'column', gap:'0.65rem' }}>
            {recent.map(t => {
              const isIncome = t.type === 'income'
              return (
                <div key={t.id} className="tx-list-item" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '12px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  transition: 'background 0.2s, transform 0.2s',
                }}>
                  {/* Left: Type Badge */}
                  <span style={{
                    fontSize: '0.78rem',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '99px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    background: isIncome ? 'rgba(5,150,105,0.15)' : 'rgba(220,38,38,0.15)',
                    color: isIncome ? 'var(--income-color)' : 'var(--expense-color)',
                    border: `1px solid ${isIncome ? 'rgba(5,150,105,0.35)' : 'rgba(220,38,38,0.35)'}`,
                    letterSpacing: '0.75px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: isIncome ? 'var(--income-color)' : 'var(--expense-color)' }} />
                    {t.type}
                  </span>

                  {/* Right: Amount */}
                  <div style={{
                    textAlign: 'right',
                    fontWeight: 800,
                    fontSize: '1.1rem',
                    color: isIncome ? 'var(--income-color)' : 'var(--expense-color)',
                  }}>
                    {isIncome ? '+' : '-'}{fmt(t.amount, cur)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
