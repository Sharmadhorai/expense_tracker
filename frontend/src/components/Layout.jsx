import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  RiDashboardFill, RiExchangeDollarFill, RiPieChartFill,
  RiWalletFill, RiBarChartFill, RiUserFill, RiLogoutBoxFill,
  RiMenuFoldLine, RiMenuUnfoldLine
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

  const handleLogout = () => { logout(); navigate('/login') }
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: collapsed ? 72 : 260,
        minHeight: '100vh',
        background: 'linear-gradient(180deg, #12122A 0%, #0D0D1A 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
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
            background: 'linear-gradient(135deg, #6C63FF, #03DAC6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.1rem', fontWeight: 800, color: 'white'
          }}>💰</div>
          {!collapsed && (
            <span style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em', whiteSpace: 'nowrap' }}>
              Expense<span style={{ color: '#6C63FF' }}>Track</span>
            </span>
          )}
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0.5rem 0.75rem', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.65rem 0.85rem',
                borderRadius: 10,
                textDecoration: 'none',
                color: isActive ? 'white' : '#9090BB',
                background: isActive ? 'linear-gradient(135deg, rgba(108,99,255,0.3), rgba(3,218,198,0.1))' : 'transparent',
                border: isActive ? '1px solid rgba(108,99,255,0.3)' : '1px solid transparent',
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
        <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {/* User info */}
          {!collapsed && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.65rem',
              padding: '0.65rem', borderRadius: 10, marginBottom: '0.5rem',
              background: 'rgba(255,255,255,0.04)'
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #6C63FF, #FF6584)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 700, color: 'white'
              }}>{initials}</div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name}</div>
                <div style={{ fontSize: '0.68rem', color: '#9090BB', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setCollapsed(c => !c)}
              className="btn-icon"
              style={{ flex: 1, justifyContent: 'center' }}
              title={collapsed ? 'Expand' : 'Collapse'}
            >
              {collapsed ? <RiMenuUnfoldLine size={18} /> : <RiMenuFoldLine size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="btn-icon"
              style={{ flex: 1, justifyContent: 'center', color: '#FF6584' }}
              title="Logout"
            >
              <RiLogoutBoxFill size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{
        marginLeft: collapsed ? 72 : 260,
        flex: 1,
        transition: 'margin-left 0.3s cubic-bezier(0.4,0,0.2,1)',
        minHeight: '100vh',
        padding: '2rem 2.5rem',
        maxWidth: '100%',
      }}>
        {children}
      </main>
    </div>
  )
}
