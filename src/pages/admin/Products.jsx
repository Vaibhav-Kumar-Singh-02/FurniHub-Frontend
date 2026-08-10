import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiX, FiImage } from 'react-icons/fi';
import { productsAPI, categoriesAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', categoryId: '', stock: '', imageUrl: '' });
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, categoryFilter, statusFilter, search]);

  const loadProducts = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await productsAPI.getAll({ page, limit: 10, search, categoryId: categoryFilter, status: statusFilter });
      const allProducts = res.data?.products || res.data || [];
      setProducts(allProducts.filter(p => (p.stock ?? 0) > 0));
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load products');
    }
    setLoading(false);
  };

  const loadCategories = async () => {
    try {
      const res = await categoriesAPI.getAll();
      setCategories(res.data?.categories || res.data || []);
    } catch {}
  };

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', categoryId: '', stock: '', imageUrl: '' });
    setFormErrors({});
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || '',
      description: product.description || '',
      price: product.price || '',
      categoryId: product.categoryId || product.category?.id || '',
      stock: product.stock || product.inventory?.stock || '',
      imageUrl: product.imageUrls?.[0] || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.price || Number(form.price) <= 0) errors.price = 'Valid price is required';
    if (!form.categoryId) errors.categoryId = 'Category is required';
    if (!form.stock || Number(form.stock) < 0) errors.stock = 'Valid stock is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const data = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        categoryId: Number(form.categoryId),
        stock: Number(form.stock),
      };
      if (editingProduct) {
        data.status = 'ACTIVE';
        await productsAPI.update(editingProduct.productId, data);
        setSuccess('Product updated successfully');
      } else {
        data.brand = 'FurniHub';
        data.status = 'ACTIVE';
        data.imageUrls = form.imageUrl.trim() ? [form.imageUrl.trim()] : [];
        await productsAPI.create(data);
        setSuccess('Product created successfully');
      }
      setShowModal(false);
      resetForm();
      loadProducts();
    } catch {
      setError('Failed to save product');
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    try {
      await productsAPI.delete(deleteId);
      setSuccess('Product deleted successfully');
      setShowDeleteModal(false);
      setDeleteId(null);
      loadProducts();
    } catch {
      setError('Failed to delete product');
    }
  };

  const getCategoryName = (catId) => {
    const cat = categories.find(c => c.categorieId === catId || c.categorieId === Number(catId));
    return cat?.categoryName || 'N/A';
  };

  const getStockLevel = (product) => {
    return product.stock ?? product.inventory?.stock ?? 0;
  };

  const getStockClass = (stock) => {
    if (stock === 0) return 'stock-out';
    if (stock < 10) return 'stock-low';
    return 'stock-ok';
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Products</h1>
          <p className="admin-card-subtitle">Manage your product catalog</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={openAddModal}>
          <FiPlus /> Add Product
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.categorieId} value={cat.categorieId}>{cat.categoryName}</option>
          ))}
        </select>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="out-of-stock">Out of Stock</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading products...</span></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.length === 0 ? (
                  <tr><td colSpan="6">
                    <div className="admin-empty">
                      <div className="admin-empty-icon">📦</div>
                      <div className="admin-empty-title">No products found</div>
                      <div className="admin-empty-desc">Try adjusting your filters or add a new product.</div>
                    </div>
                  </td></tr>
                ) : (
                  products.map((product) => {
                    const stock = getStockLevel(product);
                    return (
                    <tr key={product.productId}>
                      <td>
                        <div className="product-cell">
                          {product.imageUrls && product.imageUrls.length > 0 ? (
                            <img src={product.imageUrls[0]} alt={product.name} className="product-image" />
                          ) : (
                            <div className="product-image-placeholder"><FiImage /></div>
                          )}
                          <div>
                            <div className="product-name">{product.name}</div>
                            <div className="product-category">{product.description?.slice(0, 50)}</div>
                          </div>
                        </div>
                      </td>
                      <td>{product.categoryName || getCategoryName(product.categorieId || product.category?.id)}</td>
                      <td>₹{Number(product.price).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`stock-badge ${getStockClass(stock)}`}>
                          {stock === 0 ? 'Out of Stock' : stock < 10 ? `${stock} (Low)` : stock}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge-status ${(product.status || (product.stock > 0 ? 'active' : 'out-of-stock')).toLowerCase()}`}>
                          {product.status || (product.stock > 0 ? 'Active' : 'Out of Stock')}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => openEditModal(product)}>
                            <FiEdit />
                          </button>
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => confirmDelete(product.productId)}>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <div className="admin-pagination-info">
              Page {page} of {totalPages}
            </div>
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
              <h2 className="admin-modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
             <form onSubmit={handleSubmit}>
               <div className="admin-modal-body">
                 <div className="admin-form-group">
                   <label className="admin-form-label">Product Name *</label>
                   <input className={`admin-form-input ${formErrors.name ? 'error' : ''}`} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g., Modern Sofa Set, Office Desk, Dining Table" />
                   {formErrors.name && <div className="admin-form-error">{formErrors.name}</div>}
                 </div>
                 <div className="admin-form-group">
                   <label className="admin-form-label">Description</label>
                   <textarea className="admin-form-input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Brief product description for customers (e.g., material, style, features)" style={{ resize: 'vertical' }} />
                 </div>
                 <div className="admin-grid-2">
                   <div className="admin-form-group">
                     <label className="admin-form-label">Price (₹) *</label>
                     <input className={`admin-form-input ${formErrors.price ? 'error' : ''}`} type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
                     {formErrors.price && <div className="admin-form-error">{formErrors.price}</div>}
                   </div>
                   <div className="admin-form-group">
                     <label className="admin-form-label">Stock *</label>
                     <input className={`admin-form-input ${formErrors.stock ? 'error' : ''}`} type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} placeholder="0" />
                     {formErrors.stock && <div className="admin-form-error">{formErrors.stock}</div>}
                   </div>
                 </div>
                 <div className="admin-form-group">
                   <label className="admin-form-label">Category *</label>
                   <select className={`admin-form-select ${formErrors.categoryId ? 'error' : ''}`} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                     <option value="">Select category</option>
                     {categories.map((cat) => (
                       <option key={cat.categorieId} value={cat.categorieId}>{cat.categoryName}</option>
                     ))}
                   </select>
                   {formErrors.categoryId && <div className="admin-form-error">{formErrors.categoryId}</div>}
                   <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: 4 }}>
                     Don't see your category? Add it from the Categories page first.
                   </div>
                 </div>
                 <div className="admin-form-group">
                   <label className="admin-form-label">Product Images</label>
                   <input className="admin-form-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="Paste image URL here (e.g., https://example.com/product.jpg)" />
                   <div style={{ fontSize: '0.8rem', color: 'var(--admin-text-light)', marginTop: 4 }}>
                     For multiple images, separate URLs with commas. Images will be saved automatically.
                   </div>
                 </div>
               </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">{editingProduct ? 'Update' : 'Create'} Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Delete Product</h2>
              <button className="admin-modal-close" onClick={() => setShowDeleteModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <p>Are you sure you want to delete this product? This action cannot be undone.</p>
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

export default Products;
