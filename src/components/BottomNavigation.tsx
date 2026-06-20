import { NavLink } from 'react-router-dom'

const navigationItems = [
  { to: '/capture', label: 'Capture' },
  { to: '/timeline', label: 'Timeline' },
]

export function BottomNavigation() {
  return (
    <nav className="bottom-nav" aria-label="Primary navigation">
      {navigationItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => (isActive ? 'is-active' : undefined)}
        >
          <span className="tab-icon" aria-hidden="true">
            {item.label === 'Capture' ? '+' : '•'}
          </span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
