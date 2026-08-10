import React, { useState, useEffect } from 'react';
import { FiSearch, FiPlus, FiMinus, FiAlertTriangle, FiX } from 'react-icons/fi';
import { inventoryAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [stockChange, setStockChange] = useState(1);
  const [stockAction, setStockAction] = useState('increase');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadInventory();
  }, [page, search]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [lowRes, outRes] = await Promise.all([
        inventoryAPI.getLowStock().catch(() => ({ data: [] })),
        inventoryAPI.getOutOfStock().catch(() => ({ data: [] })),
      ]);
      setLowStock(lowRes.data?.products || lowRes.data || []);
      setOutOfStock(outRes.data?.products || outRes.data || []);
    } catch {}
    setLoading(false);
  };

  const loadInventory = async () => {
    setLoading(true);
    try {
      const res = await inventoryAPI.getAll({ page, limit: 10, search });
      setInventory(res.data?.products || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load inventory');
    }
    setLoading(false);
  };

  const openStockModal = (product) => {
    setSelectedProduct(product);
    setStockChange(1);
    setStockAction('increase');
    setShowModal(true);
  };

  const handleStockUpdate = async () => {
    if (!selectedProduct) return;
    try {
      const qty = stockAction === 'increase' ? stockChange : -stockChange;
      await inventoryAPI.updateStock(selectedProduct.productId, { quantity: qty });
      setSuccess(`Stock ${stockAction === 'increase' ? 'increased' : 'decreased'} by ${stockChange}`);
      setShowModal(false);
      setSelectedProduct(null);
      loadData();
      loadInventory();
    } catch {
      setError('Failed to update stock');
    }
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Inventory</h1>
          <p className="admin-card-subtitle">Monitor and manage stock levels</p>
        </div>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      {lowStock.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 24, borderLeft: '4px solid var(--admin-warning)' }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAlertTriangle style={{ color: 'var(--admin-warning)' }} /> Low Stock Alerts
              </h3>
              <p className="admin-card-subtitle">{lowStock.length} product{lowStock.length > 1 ? 's' : ''} with low stock</p>
            </div>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Stock</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {lowStock.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>{item.stock ?? item.inventory?.stock ?? 0}</td>
                    <td><span className="admin-badge-status low-stock">Low Stock</span></td>
                    <td>
                      <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => openStockModal(item)}>
                        <FiPlus /> Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outOfStock.length > 0 && (
        <div className="admin-card" style={{ marginBottom: 24, borderLeft: '4px solid var(--admin-danger)' }}>
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiAlertTriangle style={{ color: 'var(--admin-danger)' }} /> Out of Stock
              </h3>
              <p className="admin-card-subtitle">{outOfStock.length} product{outOfStock.length > 1 ? 's' : ''} out of stock</p>
            </div>
          </div>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr><th>Product</th><th>Stock</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {outOfStock.map((item) => (
                  <tr key={item.productId}>
                    <td>{item.name}</td>
                    <td>0</td>
                    <td><span className="admin-badge-status out-of-stock">Out of Stock</span></td>
                    <td>
                      <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => openStockModal(item)}>
                        <FiPlus /> Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="admin-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">All Inventory</h3>
            <p className="admin-card-subtitle">Complete stock overview</p>
          </div>
        </div>
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
        </div>

        {loading ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Loading inventory...</span></div>
        ) : (
          <>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr><th>Product</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {inventory.length === 0 ? (
                    <tr><td colSpan="4">
                      <div className="admin-empty">
                        <div className="admin-empty-icon">📦</div>
                        <div className="admin-empty-title">No inventory items</div>
                        <div className="admin-empty-desc">Inventory data will appear here.</div>
                      </div>
                    </td></tr>
                  ) : (
                    inventory.map((item) => {
                       const stock = item.stock ?? item.inventory?.stock ?? 0;
                       const status = stock === 0 ? 'out-of-stock' : stock < 10 ? 'low-stock' : 'in-stock';
                       return (
                         <tr key={item.productId}>
                           <td>{item.name}</td>
                           <td>{stock}</td>
                           <td>
                             <span className={`admin-badge-status ${status}`}>
                               {stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock'}
                             </span>
                           </td>
                           <td>
                             <div className="admin-actions">
                               <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => openStockModal(item)}>
                                 <FiPlus />
                               </button>
                               <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => openStockModal({ ...item, prefillDecrease: true })}>
                                 <FiMinus />
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
      </div>

      {showModal && (
        <div className="admin-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Update Stock - {selectedProduct?.name}</h2>
              <button className="admin-modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              <div className="admin-form-group">
                <label className="admin-form-label">Action</label>
                <select className="admin-form-select" value={stockAction} onChange={(e) => setStockAction(e.target.value)}>
                  <option value="increase">Increase Stock</option>
                  <option value="decrease">Decrease Stock</option>
                </select>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">Quantity</label>
                <input className="admin-form-input" type="number" min="1" value={stockChange} onChange={(e) => setStockChange(Number(e.target.value))} />
              </div>
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="admin-btn admin-btn-primary" onClick={handleStockUpdate}>Update Stock</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
