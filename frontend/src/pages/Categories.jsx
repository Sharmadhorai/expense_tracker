import { useEffect, useState, useCallback } from 'react'
import API from '../api/client'
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri'

const COLORS = ['#FF6B6B','#4ECDC4','#45B7D1','#96CEB4','#FFEAA7','#DDA0DD','#98D8C8','#B0B0B0','#0ea5e9','#10b981','#FF9F43']
const EMOJI_OPTIONS = ['🍕','🚗','🛍️','📄','🎬','💊','📚','📦','💼','💻','📈','🏠','🎓','✈️','🏋️','🎮','🎵','☕','🍔','🌴']

const EMPTY_FORM = { name:'', icon:'📦', color:'#0ea5e9' }

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal]   = useState(false)
  const [editing, setEditing]       = useState(null)
  const [form, setForm]             = useState(EMPTY_FORM)
  const [saving, setSaving]         = useState(false)
  const [error, setError]           = useState('')

  const fetchCategories = useCallback(() => {
    API.get('/categories').then(r => setCategories(r.data))
  }, [])

  useEffect(() => { fetchCategories() }, [fetchCategories])

  const openAdd  = () => { setEditing(null); setForm(EMPTY_FORM); setError(''); setShowModal(true) }
  const openEdit = c => { setEditing(c); setForm({ name:c.name, icon:c.icon, color:c.color }); setError(''); setShowModal(true) }

  const onSave = async e => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) await API.put(`/categories/${editing.id}`, form)
      else await API.post('/categories', form)
      setShowModal(false)
      fetchCategories()
    } catch (err) {
      setError(err.response?.data?.detail || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const onDelete = async id => {
    if (!window.confirm('Delete this category?')) return
    try {
      await API.delete(`/categories/${id}`)
      fetchCategories()
    } catch (err) {
      alert(err.response?.data?.detail || 'Cannot delete')
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Organize your transactions with categories</p>
        </div>
        <button className="btn btn-primary" id="add-category-btn" onClick={openAdd}>
          <RiAddLine /> Add Category
        </button>
      </div>

      {categories.length > 0 && (
        <div>
          <div className="categories-grid" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:'1rem' }}>
            {categories.map(c => (
              <div key={c.id} className="card" style={{ padding:'1.1rem', textAlign:'center', position:'relative' }}>
                <div style={{ position:'absolute', top:'0.6rem', right:'0.6rem', display:'flex', gap:'0.15rem' }}>
                  <button className="btn-icon" style={{ padding:'0.25rem' }} onClick={() => openEdit(c)}><RiEditLine size={13}/></button>
                  <button className="btn-icon" style={{ padding:'0.25rem', color:'#FF6584' }} onClick={() => onDelete(c.id)}><RiDeleteBinLine size={13}/></button>
                </div>
                <div style={{
                  width:52, height:52, borderRadius:14, margin:'0 auto 0.75rem',
                  background:`${c.color}22`, border:`2px solid ${c.color}44`,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.6rem'
                }}>{c.icon}</div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{c.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target===e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <div className="modal-title">{editing ? 'Edit Category' : 'New Category'}</div>
              <button className="btn-icon" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={onSave} style={{ display:'flex', flexDirection:'column', gap:'1.1rem' }}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input className="form-input" value={form.name}
                  onChange={e => setForm(f => ({...f, name:e.target.value}))}
                  placeholder="Category name" required />
              </div>
              <div className="form-group">
                <label className="form-label">Icon</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                  {EMOJI_OPTIONS.map(em => (
                    <button key={em} type="button" onClick={() => setForm(f => ({...f, icon:em}))}
                      style={{
                        width:38, height:38, borderRadius:8, fontSize:'1.3rem',
                        background: form.icon===em ? 'var(--primary-light)' : 'var(--bg-card)',
                        border: form.icon===em ? '2px solid var(--primary)' : '1px solid var(--border)',
                        cursor:'pointer', transition:'all 0.15s'
                      }}>{em}</button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Color</label>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.5rem' }}>
                  {COLORS.map(col => (
                    <button key={col} type="button" onClick={() => setForm(f => ({...f, color:col}))}
                      style={{
                        width:28, height:28, borderRadius:'50%', background:col,
                        border: form.color===col ? '3px solid white' : '3px solid transparent',
                        cursor:'pointer', transition:'all 0.15s', outline:'none',
                        boxShadow: form.color===col ? `0 0 0 2px ${col}` : 'none'
                      }} />
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.75rem', background:'var(--bg-card)', borderRadius:10 }}>
                <div style={{
                  width:44, height:44, borderRadius:12, background:`${form.color}22`,
                  border:`2px solid ${form.color}44`,
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem'
                }}>{form.icon}</div>
                <div style={{ fontWeight:600 }}>{form.name || 'Preview'}</div>
              </div>
              <div style={{ display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? <><span className="spinner" style={{width:14,height:14}}/> Saving…</> : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
