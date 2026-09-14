import { useState, useEffect } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  RiDashboardFill, RiExchangeDollarFill, RiPieChartFill,
  RiWalletFill, RiBarChartFill, RiUserFill, RiLogoutBoxFill,
  RiMenuFoldLine, RiMenuUnfoldLine, RiMenuLine, RiSunLine, RiMoonLine
} from 'react-icons/ri'

const navItems = [
  { to: '/dashboard',    icon: RiDashboardFill,       label: 'Dashboard'    },
  { to: '/transactions', icon: RiExchangeDollarFill,   label: 'Transactions' },
  { to: '/categories',   icon: RiPieChartFill,         label: 'Categories'   },
  { to: '/budget',       icon: RiWalletFill,           label: 'Budget'       },
  { to: '/reports',      icon: RiBarChartFill,         label: 'Reports'      },
  { to: '/profile',      icon: RiUserFill,             label: 'Profile'      },
]

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('et_theme') || 'dark'
  })

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('et_theme', theme)
  }, [theme])

  useEffect(() => {
    const mobileQuery = window.matchMedia('(max-width: 720px)')
    const syncMobileLayout = () => {
      if (mobileQuery.matches) {
        setCollapsed(false)
        setMobileMenuOpen(false)
      }
    }
    syncMobileLayout()
    mobileQuery.addEventListener('change', syncMobileLayout)
    return () => mobileQuery.removeEventListener('change', syncMobileLayout)
  }, [])

  const toggleTheme = () => {
    setTheme(t => t === 'dark' ? 'light' : 'dark')
  }

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div className="app-shell" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)', color: 'var(--text-primary)', position: 'relative' }}>
      {/* Ambient drifting backdrop animation */}
      <div className="ambient-glow-wrapper">
        <div className="ambient-glow glow-1" />
        <div className="ambient-glow glow-2" />
        <div className="ambient-glow glow-3" />
      </div>

      {/* Sidebar */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'is-mobile-open' : ''}`} style={{
        width: collapsed ? 72 : 260,
        minHeight: '100vh',
        background: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-sidebar)',
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1)',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 100,
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.2rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'var(--brand-gradient)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: 'white'
          }}>💰</div>
          {!collapsed && (
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap', color: 'var(--text-primary)' }}>
              Expense<span style={{ color: 'var(--primary)' }}>Track</span>
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                textDecoration: 'none',
                color: isActive ? 'white' : 'var(--text-secondary)',
                background: isActive ? 'var(--nav-active-bg)' : 'transparent',
                border: isActive ? '1px solid var(--border-focus)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--shadow-primary)' : 'none',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
              })}
            >
              <Icon style={{ fontSize: '1.15rem', flexShrink: 0 }} />
              {!collapsed && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border-sidebar)' }}>
          {/* User info */}
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.65rem', borderRadius: 10, marginBottom: '0.5rem',
              background: 'var(--bg-card)'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'var(--brand-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'white'
              }}>{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-primary)' }}>{user?.name}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="btn-icon sidebar-collapse-control"
              style={{ flex: 1, justifyContent: 'center' }}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
            </button>
            <button
              onClick={toggleTheme}
              className="btn-icon"
              style={{ flex: 1, justifyContent: 'center' }}
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <RiSunLine size={18} /> : <RiMoonLine size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{ flex: 1, justifyContent: 'center', color: 'var(--accent)' }}
              title="Logout"
            >
              <RiLogoutBoxFill size={18} />
            </button>
          </div>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          className="mobile-menu-overlay"
          aria-label="Close navigation menu"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main content */}
      <main className="app-main" style={{
        marginLeft: collapsed ? 72 : 260,
        flex: 1,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh',
        padding: '2rem 2.5rem',
        maxWidth: '100%',
        position: 'relative',
        zIndex: 1,
      }}>
        <button
          className="mobile-menu-trigger btn-icon"
          aria-label="Open navigation menu"
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen(true)}
        >
          <RiMenuLine size={22} />
        </button>
        {children}
      </main>
    </div>
  )
}
