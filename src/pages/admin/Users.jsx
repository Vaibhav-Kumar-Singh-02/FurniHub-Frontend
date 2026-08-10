import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit, FiTrash2, FiX, FiUserCheck, FiUserX, FiUserPlus } from 'react-icons/fi';
import { usersAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', mobile: '', role: 'user' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadUsers();
  }, [page, statusFilter]);

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await usersAPI.getAll({ page: page - 1, size: 10, search, status: statusFilter });
      setUsers(res.data?.users || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load users');
    }
    setLoading(false);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName || user.name || '',
      email: user.email || '',
      mobile: user.mobile || '',
      role: user.role || 'user',
    });
    setFormErrors({});
    setShowEditModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.fullName.trim()) errors.fullName = 'Name is required';
    if (!form.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = 'Valid email is required';
    if (!form.mobile.trim()) errors.mobile = 'Mobile is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await usersAPI.update(editingUser.userId, form);
      setSuccess('User updated successfully');
      setShowEditModal(false);
      loadUsers();
    } catch {
      setError('Failed to update user');
    }
  };

  const handleBlock = async (userId) => {
    try {
      await usersAPI.block(userId);
      setSuccess('User blocked successfully');
      loadUsers();
    } catch {
      setError('Failed to block user');
    }
  };

  const handleUnblock = async (userId) => {
    try {
      await usersAPI.unblock(userId);
      setSuccess('User unblocked successfully');
      loadUsers();
    } catch {
      setError('Failed to unblock user');
    }
  };

  const confirmDelete = (userId) => {
    setDeleteId(userId);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await usersAPI.delete(deleteId);
      setSuccess('User deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadUsers();
    } catch {
      setError('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Users</h1>
          <p className="admin-card-subtitle">Manage registered users</p>
        </div>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="blocked">Blocked</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading users...</span></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Mobile</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan="6">
                    <div className="admin-empty">
                      <div className="admin-empty-icon">👥</div>
                      <div className="admin-empty-title">No users found</div>
                      <div className="admin-empty-desc">Try adjusting your search filters.</div>
                    </div>
                  </td></tr>
                ) : (
                  users.map((user) => (
                    <tr key={user.userId}>
                      <td>{user.fullName || user.name}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile || 'N/A'}</td>
                      <td style={{ textTransform: 'capitalize' }}>{user.role || 'user'}</td>
                      <td>
                        <span className={`admin-badge-status ${(user.isActive == null ? 'active' : (user.isActive ? 'active' : 'inactive')).toLowerCase()}`}>
                          {user.isActive == null ? 'Active' : (user.isActive ? 'Active' : 'Inactive')}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => openEditModal(user)}>
                            <FiEdit />
                          </button>
                          {(user.isActive == null || user.isActive) ? (
                            <button className="admin-btn admin-btn-sm admin-btn-warning" onClick={() => handleBlock(user.userId)}>
                              <FiUserX />
                            </button>
                          ) : (
                            <button className="admin-btn admin-btn-sm admin-btn-success" onClick={() => handleUnblock(user.userId)}>
                              <FiUserCheck />
                            </button>
                          )}
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => confirmDelete(user.userId)}>
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

      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete User</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="admin-modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Edit User</h2>
              <button className="admin-modal-close" onClick={() => setShowEditModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="admin-modal-body">
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name *</label>
                  <input className={`admin-form-input ${formErrors.fullName ? 'error' : ''}`} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                  {formErrors.fullName && <div className="admin-form-error">{formErrors.fullName}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email *</label>
                  <input className={`admin-form-input ${formErrors.email ? 'error' : ''}`} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  {formErrors.email && <div className="admin-form-error">{formErrors.email}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Mobile</label>
                  <input className="admin-form-input" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} />
                  {formErrors.mobile && <div className="admin-form-error">{formErrors.mobile}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Role</label>
                  <select className="admin-form-select" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Update User</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
