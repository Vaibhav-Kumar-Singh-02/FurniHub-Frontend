import React, { useState, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiSend, FiFilter, FiSearch, FiX } from 'react-icons/fi';
import { notificationsAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generateForm, setGenerateForm] = useState({ title: '', message: '', type: 'info', target: 'all' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadNotifications();
  }, [page, statusFilter]);

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await notificationsAPI.getAll({ page, limit: 10, status: statusFilter });
      setNotifications(res.data?.notifications || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load notifications');
    }
    setLoading(false);
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setSuccess('Notification marked as read');
      loadNotifications();
    } catch {
      setError('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setSuccess('All notifications marked as read');
      loadNotifications();
    } catch {
      setError('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setSuccess('Notification deleted');
      loadNotifications();
    } catch {
      setError('Failed to delete notification');
    }
  };

  const validateGenerateForm = () => {
    const errors = {};
    if (!generateForm.title.trim()) errors.title = 'Title is required';
    if (!generateForm.message.trim()) errors.message = 'Message is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!validateGenerateForm()) return;
    try {
      await notificationsAPI.generate(generateForm);
      setSuccess('Notification sent successfully');
      setShowGenerateModal(false);
      setGenerateForm({ title: '', message: '', type: 'info', target: 'all' });
      loadNotifications();
    } catch {
      setError('Failed to send notification');
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
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'info';
    }
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Notifications</h1>
          <p className="admin-card-subtitle">Manage and send notifications</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn admin-btn-secondary" onClick={markAllAsRead}>
            <FiCheck /> Mark All Read
          </button>
          <button className="admin-btn admin-btn-primary" onClick={() => setShowGenerateModal(true)}>
            <FiSend /> Generate
          </button>
        </div>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search notifications..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading notifications...</span></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.length === 0 ? (
                  <tr><td colSpan="6">
                    <div className="admin-empty">
                      <div className="admin-empty-icon">🔔</div>
                      <div className="admin-empty-title">No notifications found</div>
                      <div className="admin-empty-desc">Generate a notification to get started.</div>
                    </div>
                  </td></tr>
                ) : (
                  notifications.map((notif) => (
                    <tr key={notif.id} className={!notif.isRead ? 'unread' : ''}>
                      <td><strong>{notif.title || notif.heading || 'Notification'}</strong></td>
                      <td style={{ maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {notif.message || notif.description || notif.body || ''}
                      </td>
                      <td>
                        <span className={`admin-badge-status ${getTypeColor(notif.type)}`}>
                          {notif.type || 'info'}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge-status ${notif.isRead ? 'active' : 'pending'}`}>
                          {notif.isRead ? 'Read' : 'Unread'}
                        </span>
                      </td>
                      <td>{formatTime(notif.createdAt || notif.timestamp)}</td>
                      <td>
                        <div className="admin-actions">
                          {!notif.isRead && (
                            <button className="admin-btn admin-btn-sm admin-btn-success" onClick={() => markAsRead(notif.id)}>
                              <FiCheck />
                            </button>
                          )}
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteNotification(notif.id)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <div className="admin-pagination-info">Page {page} of {totalPages}</div>
            <div className="admin-pagination-buttons">
              <button className="admin-pagination-btn" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} className={`admin-pagination-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="admin-pagination-btn" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>
        </>
      )}

      {showGenerateModal && (
        <div className="admin-modal-overlay" onClick={() => setShowGenerateModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Generate Notification</h2>
              <button className="admin-modal-close" onClick={() => setShowGenerateModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleGenerate}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Title *</label>
                  <input className={`admin-form-input ${formErrors.title ? 'error' : ''}`} value={generateForm.title} onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })} placeholder="Notification title" />
                  {formErrors.title && <div className="admin-form-error">{formErrors.title}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Message *</label>
                  <textarea
                    className={`admin-form-input ${formErrors.message ? 'error' : ''}`}
                    rows="4"
                    value={generateForm.message}
                    onChange={(e) => setGenerateForm({ ...generateForm, message: e.target.value })}
                    placeholder="Notification message"
                    style={{ resize: 'vertical' }}
                  />
                  {formErrors.message && <div className="admin-form-error">{formErrors.message}</div>}
                </div>
                <div className="admin-grid-2">
                  <div className="admin-form-group">
                    <label className="admin-form-label">Type</label>
                    <select className="admin-form-select" value={generateForm.type} onChange={(e) => setGenerateForm({ ...generateForm, type: e.target.value })}>
                      <option value="info">Info</option>
                      <option value="success">Success</option>
                      <option value="warning">Warning</option>
                      <option value="error">Error</option>
                    </select>
                  </div>
                  <div className="admin-form-group">
                    <label className="admin-form-label">Target</label>
                    <select className="admin-form-select" value={generateForm.target} onChange={(e) => setGenerateForm({ ...generateForm, target: e.target.value })}>
                      <option value="all">All Users</option>
                      <option value="customers">Customers Only</option>
                      <option value="admins">Admins Only</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowGenerateModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary"><FiSend /> Send Notification</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;
