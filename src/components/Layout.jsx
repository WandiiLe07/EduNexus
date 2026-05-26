import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import styles from './Layout.module.css'

const NAV = [
  { to: '/', label: 'Feed', icon: '⊞' },
  { to: '/resources', label: 'Resources', icon: '📄' },
  { to: '/problems', label: 'Problems', icon: '💡' },
  { to: '/jobs', label: 'Jobs', icon: '💼' },
  { to: '/discussions', label: 'Discussions', icon: '💬' },
]

function Avatar({ user, size = 36 }) {
  const initials = (user?.displayName || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (user?.photoURL) return <img src={user.photoURL} alt="" style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
  return (
    <div className="avatar" style={{ width: size, height: size, background: 'var(--green-light)', color: 'var(--green-dark)', fontSize: size * 0.35 }}>
      {initials}
    </div>
  )
}

export { Avatar }

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>Edu</span>Nexus
        </div>

        <nav className={styles.nav}>
          {NAV.map(n => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.to === '/'}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.userRow} onClick={() => navigate('/profile')}>
          <Avatar user={user} />
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.displayName?.split(' ')[0]}</div>
            <div className={styles.userSub}>ICT · IoT</div>
          </div>
        </div>
        <button className={`${styles.logoutBtn}`} onClick={logout}>Sign out</button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
