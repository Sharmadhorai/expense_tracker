import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

const fmt = (n, currency = 'USD') =>
  new Intl.NumberFormat('en-US', { style:'currency', currency, maximumFractionDigits:2 }).format(n || 0)

const EMPTY_FORM = { type:'expense', category_id:'', amount:'', description:'', date: new Date().toISOString().split('T')[0] }

export default function Transactions() {
  const { user } = useAuth()
  const cur = user?.currency || 'USD'

  const [transactions, setTransactions] = useState([])
  const [categories, setCategories]     = useState([])
  const [tab, setTab]                   = useState('all')
  const [loading, setLoading]           = useState(true)
  const [showModal, setShowModal]       = useState(false)
  const [editing, setEditing]           = useState(null)
  const [form, setForm]                 = useState(EMPTY_FORM)
  const [saving, setSaving]             = useState(false)
  const [error, setError]               = useState('')
  const [filterCat, setFilterCat]       = useState('')

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (tab !== 'all') params.type = tab
      if (filterCat) params.category_id = filterCat
      const res = await API.get('/transactions', { params })
      setTransactions(res.data)
    } finally {
      setLoading(false)
    }
  }, [tab, filterCat])

  useEffect(() => {
    API.get('/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => { fetchTransactions() }, [fetchTransactions])

  const openAdd = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true) }
  const openEdit = t => {
    setEditing(t)
    setForm({ type: t.type, category_id: t.category_id || '', amount: t.amount, description: t.description || '', date: t.date })
    setError('')
    setShowModal(true)
  }

  const onSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const payload = { ...form, amount: parseFloat(form.amount), category_id: form.category_id ? parseInt(form.category_id) : null }
      if (editing) await API.put(`/transactions/${editing.id}`, payload)
      else await API.post('/transactions', payload)
      setShowModal(false)
      fetchTransactions()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async id => {
    if (!window.confirm('Delete this transaction?')) return
    await API.delete(`/transactions/${id}`)
    fetchTransactions()
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">Track all your income and expenses</p>
        </div>
        <button className="btn btn-primary" id="add-transaction-btn" onClick={openAdd}>
          <RiAddLine /> Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="transaction-toolbar">
        <div className="tab-bar transaction-tabs">
          {['all','income','expense'].map(t => (
            <button key={t} className={`tab-btn ${tab===t?'active':''}`} onClick={() => setTab(t)}>
              {t === 'all' ? 'All' : t === 'income' ? '📈 Income' : '📉 Expense'}
            </button>
          ))}
        </div>
        <select className="form-select category-filter" aria-label="Filter by category" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', justifyContent:'center', padding:'3rem' }}>
            <div className="spinner" style={{ width:36,height:36 }} />
          </div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">💸</div>
            <div className="empty-state-text">No transactions found. Add one to get started!</div>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th style={{ textAlign:'right' }}>Amount</th>
                <th style={{ textAlign:'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id}>
                  <td style={{ color:'var(--text-secondary)', whiteSpace:'nowrap' }}>
                    {new Date(t.date).toLocaleDateString('en-US', { year:'numeric', month:'short', day:'numeric' })}
                  </td>
                  <td><span className={`badge badge-${t.type}`}>{t.type}</span></td>
                  <td>
                    <span style={{ marginRight:'0.4rem' }}>{t.category?.icon || '📦'}</span>
                    {t.category?.name || 'Uncategorized'}
                  </td>
                  <td style={{ color:'var(--text-secondary)', maxWidth:200 }}>
                    <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {t.description || '—'}
                    </div>
                  </td>
                  <td style={{ textAlign:'right', fontWeight:700, whiteSpace:'nowrap',
                    color: t.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' }}>
                    {t.type === 'income' ? '+' : '-'}{fmt(t.amount, cur)}
                  </td>
                  <td style={{ textAlign:'right' }}>
                    <div style={{ display:'flex', gap:'0.25rem', justifyContent:'flex-end' }}>
                      <button className="btn-icon" title="Edit" onClick={() => openEdit(t)}><RiEditLine /></button>
                      <button className="btn-icon" title="Delete" onClick={() => onDelete(t.id)}
                        style={{ color:'var(--expense-color)' }}><RiDeleteBinLine /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Transaction' : 'Add Transaction'}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={onSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
              {/* Type toggle */}
              <div className="form-group">
                <label className="form-label">Type</label>
                <div className="tab-bar" style={{ marginBottom:0 }}>
                  <button type="button" className={`tab-btn ${form.type==='expense'?'active':''}`}
                    onClick={() => setForm(f => ({...f, type:'expense'}))}>📉 Expense</button>
                  <button type="button" className={`tab-btn ${form.type==='income'?'active':''}`}
                    onClick={() => setForm(f => ({...f, type:'income'}))}>📈 Income</button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Amount ({cur})</label>
                <input className="form-input" type="number" step="0.01" min="0.01"
                  value={form.amount} onChange={e => setForm(f=>({...f, amount:e.target.value}))}
                  placeholder="0.00" required />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category_id}
                  onChange={e => setForm(f=>({...f, category_id:e.target.value}))}>
                  <option value="">None</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input className="form-input" type="date" value={form.date}
                  onChange={e => setForm(f=>({...f, date:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description (optional)</label>
                <textarea className="form-textarea" value={form.description}
                  onChange={e => setForm(f=>({...f, description:e.target.value}))}
                  placeholder="What was this for?" rows={2} />
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end', marginTop:'0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{width:14,height:14}}/> Saving…</> : editing ? 'Update' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
