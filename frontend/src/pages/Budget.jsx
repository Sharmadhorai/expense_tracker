import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

const fmt = (n, currency='USD') =>
  new Intl.NumberFormat('en-US', { style:'currency', currency, maximumFractionDigits:2 }).format(n || 0)

export default function Budget() {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'
  const now = new Date()

  const [month, setMonth]       = useState(now.getMonth() + 1)
  const [year, setYear]         = useState(now.getFullYear())
  const [budgets, setBudgets]   = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing]   = useState(null)
  const [form, setForm]         = useState({ category_id:'', amount:'' })
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await API.get(`/budgets?month=${month}&year=${year}`)
      setBudgets(res.data)
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => { fetchBudgets() }, [fetchBudgets])

  const openAdd  = () => { setEditing(null); setForm({ category_id:'', amount:'' }); setError(''); setShowModal(true) }
  const openEdit = b => { setEditing(b); setForm({ category_id: b.category_id||'', amount: b.amount }); setError(''); setShowModal(true) }

  const onSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = {
        category_id: form.category_id ? parseInt(form.category_id) : null,
        amount: parseFloat(form.amount),
        month, year
      }
      if (editing) await API.put(`/budgets/${editing.id}`, { amount: payload.amount })
      else await API.post('/budgets', payload)
      setShowModal(false)
      fetchBudgets()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async id => {
    if (!window.confirm('Delete this budget?')) return
    await API.delete(`/budgets/${id}`)
    fetchBudgets()
  }

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

  const getBarColor = (spent, budget) => {
    const pct = (spent / budget) * 100
    if (pct >= 100) return '#FF6584'
    if (pct >= 80)  return '#FF9F43'
    return '#00D4AA'
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Budget</h1>
          <p className="page-subtitle">Set and track your monthly spending limits</p>
        </div>
        <button className="btn btn-primary" id="add-budget-btn" onClick={openAdd}>
          <RiAddLine /> Set Budget
        </button>
      </div>

      {/* Month/Year selector */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'2rem', alignItems:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:10, padding:'0.4rem 0.75rem' }}>
          <button onClick={() => { if(month===1){setMonth(12);setYear(y=>y-1)}else setMonth(m=>m-1) }}
            style={{ background:'none', border:'none', color:'#9090BB', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}>‹</button>
          <span style={{ fontWeight:600, fontSize:'0.9rem', minWidth:80, textAlign:'center' }}>{months[month-1]} {year}</span>
          <button onClick={() => { if(month===12){setMonth(1);setYear(y=>y+1)}else setMonth(m=>m+1) }}
            style={{ background:'none', border:'none', color:'#9090BB', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}>›</button>
        </div>
      </div>

      {/* Budget cards */}
      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', paddingTop:'3rem' }}>
          <div className="spinner" style={{ width:36,height:36 }} />
        </div>
      ) : budgets.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">💳</div>
          <div className="empty-state-text">No budgets set for {months[month-1]} {year}. Click "Set Budget" to add one.</div>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:'1.25rem' }}>
          {budgets.map(b => {
            const spent = parseFloat(b.spent) || 0
            const budget = parseFloat(b.amount)
            const pct = Math.min((spent / budget) * 100, 100)
            const color = getBarColor(spent, budget)
            const remaining = parseFloat(b.remaining)

            return (
              <div key={b.id} className="card" style={{ position:'relative' }}>
                <div style={{ position:'absolute', top:'0.8rem', right:'0.8rem', display:'flex', gap:'0.15rem' }}>
                  <button className="btn-icon" style={{ padding:'0.25rem' }} onClick={() => openEdit(b)}><RiEditLine size={13}/></button>
                  <button className="btn-icon" style={{ padding:'0.25rem', color:'#FF6584' }} onClick={() => onDelete(b.id)}><RiDeleteBinLine size={13}/></button>
                </div>

                <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1rem' }}>
                  <div style={{
                    width:44, height:44, borderRadius:12,
                    background: b.category ? `${b.category.color}22` : 'rgba(108,99,255,0.15)',
                    border: `2px solid ${b.category ? b.category.color+'44' : 'rgba(108,99,255,0.3)'}`,
                    display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem'
                  }}>{b.category?.icon || '💼'}</div>
                  <div>
                    <div style={{ fontWeight:700 }}>{b.category?.name || 'Overall Budget'}</div>
                    <div style={{ fontSize:'0.78rem', color:'#9090BB' }}>{months[month-1]} {year}</div>
                  </div>
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.5rem', fontSize:'0.85rem' }}>
                  <span style={{ color:'#9090BB' }}>Spent: <strong style={{ color:'#F0F0FF' }}>{fmt(spent, cur)}</strong></span>
                  <span style={{ color:'#9090BB' }}>Budget: <strong style={{ color:'#F0F0FF' }}>{fmt(budget, cur)}</strong></span>
                </div>

                <div className="progress-bar-track" style={{ marginBottom:'0.75rem' }}>
                  <div className="progress-bar-fill" style={{ width:`${pct}%`, background:color }} />
                </div>

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ fontSize:'0.78rem', color:'#9090BB' }}>
                    {pct.toFixed(1)}% used
                  </div>
                  <div style={{
                    fontSize:'0.85rem', fontWeight:700,
                    color: remaining >= 0 ? '#00D4AA' : '#FF6584'
                  }}>
                    {remaining >= 0 ? `${fmt(remaining, cur)} left` : `${fmt(Math.abs(remaining), cur)} over`}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Budget' : `Set Budget – ${months[month-1]} ${year}`}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={onSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {!editing && (
                <div className="form-group">
                  <label className="form-label">Category (optional – leave empty for overall)</label>
                  <select className="form-select" value={form.category_id}
                    onChange={e => setForm(f => ({...f, category_id:e.target.value}))}>
                    <option value="">Overall Budget</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Budget Amount ({cur})</label>
                <input className="form-input" type="number" step="0.01" min="1"
                  value={form.amount} onChange={e => setForm(f => ({...f, amount:e.target.value}))}
                  placeholder="0.00" required />
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{width:14,height:14}}/> Saving…</> : editing ? 'Update' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
