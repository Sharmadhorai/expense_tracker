import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm]     = useState({ name: '', email: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirm) { setError('Passwords do not match'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left – Branding (same as Login) */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0D0D1A 0%, #1A1040 50%, #0D1A1A 100%)',
        padding: '2rem', position: 'relative', overflow: 'hidden',
      }}>
        {[
          { size: 400, x: '-15%', y: '-20%', color: 'rgba(108,99,255,0.12)' },
          { size: 300, x: '60%',  y: '60%',  color: 'rgba(3,218,198,0.08)' },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.size, height: c.size, borderRadius: '50%',
            background: c.color, left: c.x, top: c.y, filter: 'blur(60px)',
          }} />
        ))}
        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, #6C63FF, #03DAC6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', boxShadow: '0 20px 60px rgba(108,99,255,0.4)'
          }}>💰</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
            Start your<br /><span style={{ color: '#6C63FF' }}>financial journey</span>
          </h1>
          <p style={{ color: '#9090BB', fontSize: '1rem', lineHeight: 1.7 }}>
            Join thousands of users who trust<br />ExpenseTrack to manage their finances.
          </p>
        </div>
      </div>

      {/* Right – Form */}
      <div style={{
        width: '45%', minWidth: 360, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', background: '#0F0F22',
      }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-fadeIn">
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem' }}>Create account</h2>
          <p style={{ color: '#9090BB', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" style={{ color: '#6C63FF', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" type="text" name="name" value={form.name}
                onChange={onChange} placeholder="John Doe" required />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" value={form.email}
                onChange={onChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" name="password" value={form.password}
                onChange={onChange} placeholder="Min. 6 characters" required />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-input" type="password" name="confirm" value={form.confirm}
                onChange={onChange} placeholder="Repeat password" required />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
