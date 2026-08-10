import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiFolder } from 'react-icons/fi';
import { categoriesAPI, productsAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [catRes, prodRes] = await Promise.all([
        categoriesAPI.getAll(),
        productsAPI.getAll({ page: 0, size: 1000 }),
      ]);
      setCategories(catRes.data?.categories || catRes.data || []);
      setProducts(prodRes.data?.products || prodRes.data || []);
    } catch {
      setError('Failed to load categories');
    }
    setLoading(false);
  };

  const getProductCount = (catId) => {
    const category = categories.find(c => c.categorieId === catId);
    if (!category) return 0;
    return products.filter(p => p.categoryName === category.categoryName).length;
  };

  const resetForm = () => {
    setForm({ name: '', description: '' });
    setFormErrors({});
    setEditingCategory(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setForm({ name: category.categoryName || '', description: category.description || '' });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Category name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const data = { categoryName: form.name.trim(), description: form.description.trim() };
      if (editingCategory) {
        await categoriesAPI.update(editingCategory.categorieId, data);
        setSuccess('Category updated successfully');
      } else {
        await categoriesAPI.create(data);
        setSuccess('Category created successfully');
      }
      setShowModal(false);
      resetForm();
      loadData();
    } catch {
      setError('Failed to save category');
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(deleteId);
      setSuccess('Category deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadData();
    } catch {
      setError('Failed to delete category');
    }
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Categories</h1>
          <p className="admin-card-subtitle">Manage product categories</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Category
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading categories...</span></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td colSpan="3">
                  <div className="admin-empty">
                    <div className="admin-empty-icon">📁</div>
                    <div className="admin-empty-title">No categories found</div>
                    <div className="admin-empty-desc">Create your first category to organize products.</div>
                  </div>
                </td></tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.categorieId}>
                    <td>
                      <div className="product-cell">
                        <div className="product-image-placeholder" style={{ width: 36, height: 36, borderRadius: 8 }}>
                          <FiFolder size={16} />
                        </div>
                        <div className="product-name">{category.categoryName}</div>
                      </div>
                    </td>
                    <td>{getProductCount(category.categorieId)}</td>
                    <td>
                      <div className="admin-actions">
                        <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => openEditModal(category)}>
                          <FiEdit />
                        </button>
                        <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => confirmDelete(category.categorieId)}>
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
      )}

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
               <div className="admin-modal-body">
                 <div className="admin-form-group">
                   <label className="admin-form-label">Category Name *</label>
                   <input className={`admin-form-input ${formErrors.name ? 'error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Living Room, Bedroom, Office Furniture" />
                   {formErrors.name && <div className="admin-form-error">{formErrors.name}</div>}
                 </div>
                 <div className="admin-form-group">
                   <label className="admin-form-label">Description</label>
                   <textarea className="admin-form-input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe what products belong in this category (e.g., Sofas, tables, chairs for living room)" style={{ resize: 'vertical' }} />
                 </div>
               </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingCategory ? 'Update' : 'Create'} Category</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Category</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this category? Products in this category may become uncategorized.</p>
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

export default AdminCategories;
