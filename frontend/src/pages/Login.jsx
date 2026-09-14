import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const [form, setForm]         = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  const onChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const onSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Ambient drifting backdrop animation */}
      <div className="ambient-glow-wrapper">
        <div className="ambient-glow glow-1" />
        <div className="ambient-glow glow-2" />
        <div className="ambient-glow glow-3" />
      </div>

      {/* Left – Branding */}
      <div className="auth-brand-panel" style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--bg-base) 0%, var(--bg-surface) 100%)',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden',
        borderRight: '1px solid var(--border)',
        zIndex: 1
      }}>
        {/* Decorative circles */}
        {[
          { size: 400, x: '-15%', y: '-20%', color: 'var(--primary-light)' },
          { size: 300, x: '60%',  y: '60%',  color: 'rgba(16,185,129,0.08)' },
          { size: 200, x: '30%',  y: '40%',  color: 'rgba(244,63,94,0.06)' },
        ].map((c, i) => (
          <div key={i} style={{
            position: 'absolute', width: c.size, height: c.size,
            borderRadius: '50%', background: c.color,
            left: c.x, top: c.y,
            filter: 'blur(60px)',
          }} />
        ))}

        <div style={{ position: 'relative', textAlign: 'center', maxWidth: 400 }}>
          <div style={{
            width: 80, height: 80, borderRadius: 24, margin: '0 auto 1.5rem',
            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2.5rem', boxShadow: '0 20px 60px var(--primary-light)'
          }}>💰</div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, letterSpacing: '-0.03em', marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Expense<span style={{ color: 'var(--primary)' }}>Track</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', lineHeight: 1.7 }}>
            Take control of your finances.<br />
            Track income, expenses, and budgets<br />all in one beautiful place.
          </p>

          {/* Feature pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
            {['📊 Smart Reports', '💳 Budget Tracking', '📈 Income Analytics', '🔒 Secure'].map(f => (
              <span key={f} style={{
                padding: '0.4rem 0.9rem', borderRadius: 99,
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                fontSize: '0.78rem', color: 'var(--text-secondary)'
              }}>{f}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Right – Form */}
      <div className="auth-form-panel" style={{
        width: '45%', minWidth: 360, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '2rem', background: 'var(--bg-surface)',
        position: 'relative', zIndex: 1
      }}>
        <div style={{ width: '100%', maxWidth: 400 }} className="animate-fadeIn">
          <div className="mobile-auth-brand"><span>💰</span> ExpenseTrack</div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>Welcome back</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
          </p>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" name="email" value={form.email}
                onChange={onChange} placeholder="you@example.com" required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-input"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  required
                  style={{ paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.25rem',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '0.8rem', fontSize: '0.95rem', marginTop: '0.5rem' }}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Signing in…</> : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
