import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FiHome, FiBox, FiUsers, FiShoppingBag, FiFolder, FiArchive,
  FiBarChart2, FiTag, FiStar, FiSettings, FiBell, FiMenu, FiX,
  FiLogOut, FiChevronDown, FiSearch, FiUser
} from 'react-icons/fi';
import { notificationsAPI } from '../services/adminAPI';
import '../styles/Admin.css';

const AdminNavbar = ({ onToggleSidebar, sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { setAdmin(JSON.parse(stored)); } catch { setAdmin(null); }
    }
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const res = await notificationsAPI.getUnread();
      setNotifications(res.data?.notifications || res.data || []);
      setUnreadCount(res.data?.unreadCount || res.data?.length || 0);
    } catch {}
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${process.env.REACT_APP_API_URL || ''}/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => {});
      }
    } catch {}
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const getInitials = (name) => {
    if (!name) return 'A';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✓';
      case 'warning': return '!';
      case 'error': return '✕';
      default: return 'i';
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = (now - date) / 1000;
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-brand">
        <button className="admin-hamburger" onClick={onToggleSidebar}>
          {sidebarOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="brand-icon">FH</div>
        <span className="brand-name">FurniHub</span>
        <span className="admin-badge">Admin</span>
      </div>

      <div className="admin-navbar-actions">
        <div style={{ position: 'relative' }} ref={notifRef}>
          <button className="admin-nav-icon" onClick={() => setShowNotifications(!showNotifications)}>
            <FiBell />
            {unreadCount > 0 && <span className="badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
          </button>
          {showNotifications && (
            <div className="admin-notification-dropdown">
              <div className="admin-notification-header">
                <span className="admin-notification-title">Notifications</span>
                <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={loadNotifications}>
                  Refresh
                </button>
              </div>
              <div className="admin-notification-list">
                {notifications.length === 0 ? (
                  <div className="admin-notification-empty">No notifications</div>
                ) : (
                  notifications.slice(0, 10).map((notif, idx) => (
                    <div key={notif.id || idx} className={`admin-notification-item ${!notif.isRead ? 'unread' : ''}`}>
                      <div className={`admin-notification-icon ${notif.type || 'info'}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="admin-notification-content">
                        <div className="admin-notification-text">{notif.message || notif.title || 'New notification'}</div>
                        <div className="admin-notification-time">{formatTime(notif.createdAt || notif.timestamp)}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div style={{ position: 'relative' }} ref={profileRef}>
          <div className="admin-profile" onClick={() => setShowProfile(!showProfile)}>
            <div className="admin-profile-avatar">{getInitials(admin?.fullName)}</div>
            <div className="admin-profile-info">
              <span className="admin-profile-name">{admin?.fullName || 'Admin'}</span>
              <span className="admin-profile-role">Administrator</span>
            </div>
            <FiChevronDown size={14} />
          </div>
          {showProfile && (
            <div className="admin-profile-dropdown show">
              <Link to="/admin/settings" className="admin-dropdown-item" onClick={() => setShowProfile(false)}>
                <FiSettings /> Settings
              </Link>
              <Link to="/admin/notifications" className="admin-dropdown-item" onClick={() => setShowProfile(false)}>
                <FiBell /> Notifications
              </Link>
              <div className="admin-dropdown-divider" />
              <button className="admin-dropdown-item" onClick={handleLogout}>
                <FiLogOut /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
