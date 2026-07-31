import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth()
  const { cart } = useCart()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
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
          <NavLink to="/cart" className={navLinkClass}>
            Cart
            {cart.totalItems > 0 && <span className="navbar__badge">{cart.totalItems}</span>}
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/orders" className={navLinkClass}>
                Orders
              </NavLink>
              <span className="navbar__user">Hi, {user?.fullName?.split(' ')[0]}</span>
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
    </header>
  )
}
