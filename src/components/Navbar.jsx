import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUser, FiShoppingCart, FiMenu, FiX, FiLogOut, FiKey, FiPackage } from 'react-icons/fi';
import { authAPI } from '../services/api';
import { getCartCount, clearCart } from '../utils/cart';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    } else {
      clearCart();
    }

    setCartCount(getCartCount());

    const handleStorageChange = () => setCartCount(getCartCount());
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('cart:updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('cart:updated', handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try { await authAPI.logout(); } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.searchQuery.value.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="brand-icon">
            <span className="brand-icon-text">FH</span>
          </div>
          <div className="brand-text">
            <span className="brand-name">FurniHub</span>
            <span className="brand-tagline">Comfortable Living Spaces</span>
          </div>
        </Link>

        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          <div className="navbar-links">
            <Link to="/" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
            <Link to="/categories" className="nav-link" onClick={() => setIsOpen(false)}>Categories</Link>
          </div>

          <form className="navbar-search" onSubmit={handleSearch}>
            <input
              type="text"
              name="searchQuery"
              placeholder="Search furniture..."
              className="navbar-search-input"
            />
            <button type="submit" className="navbar-search-btn">
              Search
            </button>
          </form>

          <div className="navbar-actions">
            <Link to="/cart" className="nav-icon cart-icon">
              <FiShoppingCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="user-menu">
                <div className="user-avatar">
                  <FiUser />
                </div>
                <span className="welcome-text">Welcome, {user.fullName}</span>
                <div className="user-dropdown">
                  <span className="user-name">{user.fullName}</span>
                  <Link to="/customer/orders" className="dropdown-item">
                    <FiPackage /> My Orders
                  </Link>
                  <Link to="/change-password" className="dropdown-item">
                    <FiKey /> Change Password
                  </Link>
                  <button onClick={handleLogout} className="dropdown-item logout-btn">
                    <FiLogOut /> Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="auth-links">
                <Link to="/login" className="nav-link btn-login">Login</Link>
                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
              </div>
            )}
          </div>
        </div>

        <button className="menu-toggle" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
