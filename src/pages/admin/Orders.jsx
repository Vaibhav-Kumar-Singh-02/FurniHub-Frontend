import React, { useState, useEffect } from 'react';
import { FiSearch, FiEye, FiX, FiRefreshCw } from 'react-icons/fi';
import { ordersAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [page, statusFilter, search]);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await ordersAPI.getAll({ page: page - 1, size: 10, status: statusFilter, search });
      setOrders(res.data?.orders || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load orders');
    }
    setLoading(false);
  };

  const viewOrder = async (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateStatus(orderId, { status: newStatus });
      setSuccess('Order status updated');
      loadOrders();
      if (selectedOrder?.orderId === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
    } catch {
      setError('Failed to update order status');
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      await ordersAPI.cancel(orderId);
      setSuccess('Order cancelled successfully');
      loadOrders();
      if (selectedOrder?.orderId === orderId) {
        setShowDetailModal(false);
      }
    } catch {
      setError('Failed to cancel order');
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Orders</h1>
          <p className="admin-card-subtitle">Manage and track all orders</p>
        </div>
        <button className="admin-btn admin-btn-secondary" onClick={loadOrders}>
          <FiRefreshCw /> Refresh
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by order ID or customer..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading orders...</span></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Order Date</th>
                  <th>Delivery Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr><td colSpan="7">
                    <div className="admin-empty">
                      <div className="admin-empty-icon">📦</div>
                      <div className="admin-empty-title">No orders found</div>
                      <div className="admin-empty-desc">Try adjusting your filters.</div>
                    </div>
                  </td></tr>
                ) : (
                  orders.map((order) => (
                    <tr key={order.orderId}>
                      <td>#{order.orderId?.slice(0, 8)}</td>
                      <td>{order.userFullName || 'N/A'}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`admin-badge-status ${(order.status || 'pending').toLowerCase()}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{formatDate(order.deliveryDate)}</td>
                      <td>
                        <div className="admin-actions">
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => viewOrder(order)}>
                            <FiEye />
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

      {showDetailModal && (
        <div className="admin-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="admin-modal" style={{ maxWidth: 600 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Order Details</h2>
              <button className="admin-modal-close" onClick={() => setShowDetailModal(false)}><FiX /></button>
            </div>
            <div className="admin-modal-body">
              {selectedOrder ? (
                <div>
                  <p><strong>Order ID:</strong> #{selectedOrder.orderId?.slice(0, 8)}</p>
                  <p><strong>Customer:</strong> {selectedOrder.userFullName || 'N/A'}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p><strong>Status:</strong> <span className={`admin-badge-status ${(selectedOrder.status || 'pending').toLowerCase()}`}>{selectedOrder.status || 'Pending'}</span></p>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
                  {selectedOrder.items && (
                    <div style={{ marginTop: 16 }}>
                      <strong>Items:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        {selectedOrder.items.map((item, idx) => (
                          <li key={idx}>{item.productName || item.name} x{item.quantity} - {formatCurrency(item.totalPrice || item.price * item.quantity)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div style={{ marginTop: 20, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <strong>Update Status:</strong>
                    {['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED'].map((status) => (
                      <button
                        key={status}
                        className={`admin-btn admin-btn-sm ${selectedOrder.status === status ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        onClick={() => updateStatus(selectedOrder.orderId, status)}
                      >
                        {status.charAt(0) + status.slice(1).toLowerCase()}
                      </button>
                    ))}
                  </div>
                  {(selectedOrder.status || 'pending').toLowerCase() !== 'cancelled' && (
                    <div style={{ marginTop: 12 }}>
                      <button className="admin-btn admin-btn-danger" onClick={() => cancelOrder(selectedOrder.orderId)}>
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p>Loading order details...</p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button className="admin-btn admin-btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
