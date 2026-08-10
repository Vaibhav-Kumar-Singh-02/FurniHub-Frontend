import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiHome, FiBox, FiUsers, FiShoppingBag, FiFolder, FiArchive,
  FiBarChart2, FiTag, FiStar, FiSettings, FiBell, FiGrid
} from 'react-icons/fi';
import '../styles/Admin.css';

const AdminSidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { section: 'Main', items: [
      { to: '/admin', icon: FiHome, label: 'Dashboard', end: true },
      { to: '/admin/products', icon: FiBox, label: 'Products' },
      { to: '/admin/categories', icon: FiFolder, label: 'Categories' },
      { to: '/admin/orders', icon: FiShoppingBag, label: 'Orders' },
    ]},
    { section: 'Management', items: [
      { to: '/admin/users', icon: FiUsers, label: 'Users' },
      { to: '/admin/inventory', icon: FiArchive, label: 'Inventory' },
      { to: '/admin/coupons', icon: FiTag, label: 'Coupons' },
      { to: '/admin/reviews', icon: FiStar, label: 'Reviews' },
    ]},
    { section: 'Insights', items: [
      { to: '/admin/analytics', icon: FiBarChart2, label: 'Analytics' },
      { to: '/admin/notifications', icon: FiBell, label: 'Notifications' },
    ]},
    { section: 'System', items: [
      { to: '/admin/settings', icon: FiSettings, label: 'Settings' },
    ]},
  ];

  return (
    <>
      <div className={`admin-sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />
      <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="admin-sidebar-header">
          <NavLink to="/admin" className="admin-sidebar-brand" onClick={onClose}>
            <div className="brand-icon">FH</div>
            <span className="brand-name">FurniHub</span>
          </NavLink>
        </div>
        <nav className="admin-sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="admin-nav-section">
              <div className="admin-nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default AdminSidebar;
