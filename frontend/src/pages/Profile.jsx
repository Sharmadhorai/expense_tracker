import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import API from '../api/client'
import { RiUserLine, RiMailLine, RiLockLine, RiGlobalLine, RiLogoutBoxFill, RiEyeLine, RiEyeOffLine } from 'react-icons/ri'

const CURRENCIES = [
  { code:'USD', label:'US Dollar ($)' },
  { code:'EUR', label:'Euro (€)' },
  { code:'GBP', label:'British Pound (£)' },
  { code:'INR', label:'Indian Rupee (₹)' },
  { code:'JPY', label:'Japanese Yen (¥)' },
  { code:'CAD', label:'Canadian Dollar (C$)' },
  { code:'AUD', label:'Australian Dollar (A$)' },
  { code:'SGD', label:'Singapore Dollar (S$)' },
]

export default function Profile() {
  const { user, logout, refreshUser } = useAuth()
  const navigate = useNavigate()

  const [profileForm, setProfileForm] = useState({ name: user?.name||'', email: user?.email||'', currency: user?.currency||'USD' })
  const [passForm, setPassForm]       = useState({ current_password:'', new_password:'', confirm:'' })
  const [showCurrentPass, setShowCurrentPass] = useState(false)
  const [showNewPass, setShowNewPass]         = useState(false)
  const [showConfirmPass, setShowConfirmPass] = useState(false)
  const [profileMsg, setProfileMsg]   = useState('')
  const [passMsg, setPassMsg]         = useState('')
  const [profileErr, setProfileErr]   = useState('')
  const [passErr, setPassErr]         = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPass, setSavingPass]   = useState(false)

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2) || 'U'

  const onProfileSave = async e => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileErr('')
    setProfileMsg('')
    try {
      await API.put('/auth/me', { name: profileForm.name, email: profileForm.email, currency: profileForm.currency })
      await refreshUser()
      setProfileMsg('Profile updated successfully!')
    } catch (err) {
      setProfileErr(err.response?.data?.detail || 'Update failed')
    } finally {
      setSavingProfile(false)
    }
  }

  const onPassSave = async e => {
    e.preventDefault()
    setPassErr('')
    setPassMsg('')
    if (passForm.new_password !== passForm.confirm) { setPassErr('Passwords do not match'); return }
    if (passForm.new_password.length < 6) { setPassErr('Password must be at least 6 characters'); return }
    setSavingPass(true)
    try {
      await API.put('/auth/me', { current_password: passForm.current_password, new_password: passForm.new_password })
      setPassForm({ current_password:'', new_password:'', confirm:'' })
      setPassMsg('Password changed successfully!')
    } catch (err) {
      setPassErr(err.response?.data?.detail || 'Password change failed')
    } finally {
      setSavingPass(false)
    }
  }

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile & Settings</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
      </div>

      <div className="profile-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Avatar card */}
        <div className="card" style={{ gridColumn:'1 / -1', display:'flex', alignItems:'center', gap:'1.5rem' }}>
          <div style={{
            width:80, height:80, borderRadius:'50%', flexShrink:0,
            background:'linear-gradient(135deg, var(--primary), var(--secondary))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:'1.8rem', fontWeight:800, color:'white',
            boxShadow:'0 8px 24px var(--primary-light)'
          }}>{initials}</div>
          <div>
            <div style={{ fontSize:'1.3rem', fontWeight:800 }}>{user?.name}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.9rem' }}>{user?.email}</div>
            <div style={{ color:'var(--text-secondary)', fontSize:'0.8rem', marginTop:'0.25rem' }}>
              Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month:'long', year:'numeric' }) : '—'}
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="card">
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <RiUserLine /> Personal Information
          </div>
          {profileErr && <div className="alert alert-error">{profileErr}</div>}
          {profileMsg && <div className="alert alert-success">{profileMsg}</div>}
          <form onSubmit={onProfileSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={profileForm.name}
                onChange={e => setProfileForm(f => ({...f, name:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input className="form-input" type="email" value={profileForm.email}
                onChange={e => setProfileForm(f => ({...f, email:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label className="form-label"><RiGlobalLine style={{ verticalAlign:'middle' }} /> Currency</label>
              <select className="form-select" value={profileForm.currency}
                onChange={e => setProfileForm(f => ({...f, currency:e.target.value}))}>
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.label}</option>)}
              </select>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingProfile}>
              {savingProfile ? <><span className="spinner" style={{width:14,height:14}} /> Saving…</> : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* Password form */}
        <div className="card">
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'1.25rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
            <RiLockLine /> Change Password
          </div>
          {passErr && <div className="alert alert-error">{passErr}</div>}
          {passMsg && <div className="alert alert-success">{passMsg}</div>}
          <form onSubmit={onPassSave} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-input"
                  type={showCurrentPass ? 'text' : 'password'}
                  value={passForm.current_password}
                  onChange={e => setPassForm(f => ({...f, current_password:e.target.value}))}
                  required
                  style={{ paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPass(!showCurrentPass)}
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
                  aria-label={showCurrentPass ? 'Hide password' : 'Show password'}
                  title={showCurrentPass ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-input"
                  type={showNewPass ? 'text' : 'password'}
                  value={passForm.new_password}
                  onChange={e => setPassForm(f => ({...f, new_password:e.target.value}))}
                  required
                  style={{ paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
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
                  aria-label={showNewPass ? 'Hide password' : 'Show password'}
                  title={showNewPass ? 'Hide password' : 'Show password'}
                >
                  {showNewPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  className="form-input"
                  type={showConfirmPass ? 'text' : 'password'}
                  value={passForm.confirm}
                  onChange={e => setPassForm(f => ({...f, confirm:e.target.value}))}
                  required
                  style={{ paddingRight: '2.6rem' }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPass(!showConfirmPass)}
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
                  aria-label={showConfirmPass ? 'Hide password' : 'Show password'}
                  title={showConfirmPass ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPass ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={savingPass}>
              {savingPass ? <><span className="spinner" style={{width:14,height:14}} /> Updating…</> : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Danger zone */}
        <div className="card" style={{ gridColumn:'1 / -1', border:'1px solid rgba(255,101,132,0.2)', background:'rgba(255,101,132,0.04)' }}>
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:'0.75rem', color:'#FF6584' }}>
            ⚠️ Account Actions
          </div>
          <p style={{ color:'#9090BB', fontSize:'0.88rem', marginBottom:'1rem' }}>
            Logging out will clear your session. Your data remains safe and you can log back in anytime.
          </p>
          <button className="btn btn-danger" id="logout-btn" onClick={handleLogout}>
            <RiLogoutBoxFill /> Logout
          </button>
        </div>
      </div>
    </div>
  )
}
