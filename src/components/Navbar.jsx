import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useEffect, useState } from 'react'
import { getCategories } from '../services/api'

function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [categories, setCategories] = useState([])

  const activeCategory = new URLSearchParams(location.search).get('category')

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const navLinkClass = ({ isActive }) =>
    `navbar__link${isActive ? ' navbar__link--active' : ''}`

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link to="/" className="navbar__brand">
          Furni<span>Hub</span>
        </Link>
        <nav className="navbar__nav" aria-label="Main navigation">
          <NavLink to="/products" className={navLinkClass}>
            Shop
          </NavLink>
          <NavLink to="/cart" className={`navbar__link navbar__cart`} aria-label="Cart">
            <svg
              className="navbar__cart-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {cart.totalItems > 0 && <span className="navbar__badge">{cart.totalItems}</span>}
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
              <div className="navbar__user">
                <Link to="/change-password" className="navbar__avatar" title={user?.fullName}>
                  {initials(user?.fullName)}
                </Link>
                <Link to="/change-password" className="navbar__username">
                  Hi, {user?.fullName?.split(' ')[0]}
                </Link>
              </div>
              <button type="button" className="btn btn--ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn--ghost">
                Login
              </Link>
              <Link to="/register" className="btn btn--primary">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
      {categories.length > 0 && (
        <div className="navbar__categories">
          <div className="container navbar__categories-inner">
            <Link
              to="/products"
              className={`navbar__category${!activeCategory ? ' navbar__category--active' : ''}`}
            >
              All
            </Link>
            {categories.map((category) => (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className={`navbar__category${String(category.id) === activeCategory ? ' navbar__category--active' : ''}`}
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
