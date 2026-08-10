import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiX, FiPercent } from 'react-icons/fi';
import { couponsAPI } from '../../services/adminAPI';
import { catalogAPI } from '../../services/api';
import '../../styles/Admin.css';

const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `₹${num.toLocaleString('en-IN')}`;
};

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ code: '', discount: '', discountType: 'PERCENTAGE', usageLimit: '', validFrom: '', validUntil: '', appliesTo: 'ALL', productIds: '' });
  const [formErrors, setFormErrors] = useState({});
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    loadCoupons();
  }, [page, search]);

  useEffect(() => {
    if (showModal) {
      catalogAPI.getProducts().then(res => setAllProducts(res.data || []));
    }
  }, [showModal]);

  const loadCoupons = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await couponsAPI.getAll({ page, limit: 10, search });
      setCoupons(res.data?.coupons || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load coupons');
    }
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ code: '', discount: '', discountType: 'PERCENTAGE', usageLimit: '', validFrom: '', validUntil: '', appliesTo: 'ALL', productIds: '' });
    setFormErrors({});
    setEditingCoupon(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setForm({
      code: coupon.code || '',
      discount: coupon.discountValue || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      usageLimit: coupon.usageLimit || '',
      validFrom: coupon.validFrom ? coupon.validFrom.slice(0, 16) : '',
      validUntil: coupon.validUntil ? coupon.validUntil.slice(0, 16) : '',
      appliesTo: coupon.appliesTo || 'ALL',
      productIds: coupon.productIds || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.code.trim()) errors.code = 'Coupon code is required';
    if (!form.discount || Number(form.discount) <= 0) errors.discount = 'Valid discount is required';
    if (form.discountType === 'PERCENTAGE' && Number(form.discount) > 100) errors.discount = 'Percentage cannot exceed 100';
    if (!form.validFrom) errors.validFrom = 'Start date is required';
    if (!form.validUntil) errors.validUntil = 'End date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const data = {
        code: form.code.trim().toUpperCase(),
        discountValue: Number(form.discount),
        discountType: form.discountType,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        validFrom: new Date(form.validFrom).toISOString(),
        validUntil: new Date(form.validUntil).toISOString(),
        appliesTo: form.appliesTo,
        productIds: form.productIds,
      };
      if (editingCoupon) {
        await couponsAPI.update(editingCoupon.couponId, data);
        setSuccess('Coupon updated successfully');
      } else {
        await couponsAPI.create(data);
        setSuccess('Coupon created successfully');
      }
      setShowModal(false);
      resetForm();
      loadCoupons();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save coupon');
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await couponsAPI.delete(deleteId);
      setSuccess('Coupon deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadCoupons();
    } catch {
      setError('Failed to delete coupon');
    }
  };

  const toggleStatus = async (coupon) => {
    try {
      if (coupon.isActive === true) {
        await couponsAPI.disable(coupon.couponId);
        setSuccess('Coupon disabled');
      } else {
        await couponsAPI.enable(coupon.couponId);
        setSuccess('Coupon enabled');
      }
      loadCoupons();
    } catch {
      setError('Failed to update coupon status');
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Coupons</h1>
          <p className="admin-card-subtitle">Manage discount coupons</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus /> Create Coupon
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search coupons..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading coupons...</span></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Discount</th>
                  <th>Usage</th>
                  <th>Validity</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length === 0 ? (
                  <tr><td colSpan="6">
                    <div className="admin-empty">
                      <div className="admin-empty-icon">🎫</div>
                      <div className="admin-empty-title">No coupons found</div>
                      <div className="admin-empty-desc">Create your first coupon to offer discounts.</div>
                    </div>
                  </td></tr>
                ) : (
                  coupons.map((coupon) => (
                     <tr key={coupon.couponId}>
                      <td><strong>{coupon.code}</strong></td>
                      <td>{coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : '₹'}</td>
                      <td>{coupon.usedCount || 0} / {coupon.usageLimit || '∞'}</td>
                      <td>{formatDate(coupon.validFrom)} - {formatDate(coupon.validUntil)}</td>
                      <td>
                        <span className={`admin-badge-status ${coupon.isActive ? 'active' : 'inactive'}`}>
                          {coupon.isActive ? 'active' : 'inactive'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => openEditModal(coupon)}>
                            <FiEdit />
                          </button>
                          <button className="admin-btn admin-btn-sm" onClick={() => toggleStatus(coupon)}>
                            {coupon.isActive ? 'Disable' : 'Enable'}
                          </button>
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => confirmDelete(coupon.couponId)}>
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

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editingCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
             <form onSubmit={handleSubmit}>
               <div className="admin-modal-body">
                 <div className="admin-form-group">
                   <label className="admin-form-label">Coupon Code *</label>
                   <input className={`admin-form-input ${formErrors.code ? 'error' : ''}`} value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="e.g., SUMMER25, FURNITURE10" />
                   {formErrors.code && <div className="admin-form-error">{formErrors.code}</div>}
                 </div>
                 <div className="admin-grid-2">
                   <div className="admin-form-group">
                     <label className="admin-form-label">Discount Value *</label>
                     <input className={`admin-form-input ${formErrors.discount ? 'error' : ''}`} type="number" min="1" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="e.g., 10 for 10% or ₹10 off" />
                     {formErrors.discount && <div className="admin-form-error">{formErrors.discount}</div>}
                   </div>
                   <div className="admin-form-group">
                     <label className="admin-form-label">Discount Type *</label>
                      <select className="admin-form-select" value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
                        <option value="PERCENTAGE">Percentage (%) - e.g., 10% off</option>
                        <option value="FIXED">Fixed Amount (₹) - e.g., ₹500 off</option>
                      </select>
                   </div>
                 </div>
                 <div className="admin-grid-2">
                   <div className="admin-form-group">
                     <label className="admin-form-label">Usage Limit</label>
                     <input className="admin-form-input" type="number" min="0" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} placeholder="Leave empty for unlimited uses" />
                     <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: 4 }}>
                       Max number of times this coupon can be used. Leave empty for unlimited.
                     </div>
                   </div>
                 </div>
                 <div className="admin-grid-2">
                   <div className="admin-form-group">
                     <label className="admin-form-label">Valid From *</label>
                     <input className={`admin-form-input ${formErrors.validFrom ? 'error' : ''}`} type="datetime-local" value={form.validFrom} onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
                     {formErrors.validFrom && <div className="admin-form-error">{formErrors.validFrom}</div>}
                   </div>
                   <div className="admin-form-group">
                     <label className="admin-form-label">Valid Until *</label>
                     <input className={`admin-form-input ${formErrors.validUntil ? 'error' : ''}`} type="datetime-local" value={form.validUntil} onChange={(e) => setForm({ ...form, validUntil: e.target.value })} />
                     {formErrors.validUntil && <div className="admin-form-error">{formErrors.validUntil}</div>}
                   </div>
                 </div>
                 <div className="admin-form-group">
                   <label className="admin-form-label">Applies To</label>
                   <select className="admin-form-select" value={form.appliesTo} onChange={(e) => setForm({ ...form, appliesTo: e.target.value, productIds: '' })}>
                     <option value="ALL">All Products - coupon works on entire store</option>
                     <option value="SPECIFIC">Specific Products - only selected products</option>
                   </select>
                 </div>
                {form.appliesTo === 'SPECIFIC' && (
                  <div className="admin-form-group">
                    <label className="admin-form-label">Select Products</label>
                    <select multiple className="admin-form-select" value={form.productIds.split(',').filter(Boolean)} onChange={(e) => {
                      const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
                      setForm({ ...form, productIds: selected.join(',') });
                    }} style={{ minHeight: '120px' }}>
                      {allProducts.map(product => (
                        <option key={product.productId} value={product.productId}>{product.name}</option>
                      ))}
                    </select>
                    <div className="admin-form-hint">Hold Ctrl to select multiple products</div>
                  </div>
                )}
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingCoupon ? 'Update' : 'Create'} Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Coupon</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this coupon? This action cannot be undone.</p>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-danger" onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
