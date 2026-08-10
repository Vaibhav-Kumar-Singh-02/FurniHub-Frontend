import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiPackage, FiEye, FiArrowRight, FiX, FiDownload, FiStar, FiTrash2 } from 'react-icons/fi';
import { customerOrdersAPI, customerReviewsAPI } from '../services/api';
import '../styles/Admin.css';

const CustomerOrders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showMyReviews, setShowMyReviews] = useState(false);
  const [myReviews, setMyReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await customerOrdersAPI.getAll({ page: 1, limit: 50 });
      setOrders(res.data || []);
    } catch {
      setError('Failed to load orders');
    }
    setLoading(false);
  };

  const loadMyReviews = async () => {
    setLoadingReviews(true);
    setError('');
    try {
      const res = await customerReviewsAPI.getMyReviews();
      setMyReviews(res.data || []);
    } catch {
      setError('Failed to load reviews');
    }
    setLoadingReviews(false);
  };

  const toggleMyReviews = async () => {
    const next = !showMyReviews;
    setShowMyReviews(next);
    if (next && myReviews.length === 0) {
      await loadMyReviews();
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'confirmed': return 'status-confirmed';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return '';
    }
  };

  const viewOrder = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
    setReviewProductId(null);
    setReviewMessage('');
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<FiStar key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db', fontSize: '0.9rem' }} />);
    }
    return <div style={{ display: 'flex', gap: 2 }}>{stars}</div>;
  };

  const handleReviewSubmit = async (e, productId) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      setReviewMessage('Please write a comment');
      return;
    }
    setSubmittingReview(true);
    try {
      await customerReviewsAPI.submit({
        productId: Number(productId),
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
      });
      setReviewMessage('Review submitted! It will be visible after approval.');
      setReviewForm({ rating: 5, comment: '' });
      setReviewProductId(null);
      if (showMyReviews) {
        loadMyReviews();
      }
    } catch {
      setReviewMessage('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await customerReviewsAPI.delete(reviewId);
      setSuccess('Review deleted successfully');
      if (showMyReviews) {
        loadMyReviews();
      }
    } catch {
      setError('Failed to delete review. Please try again.');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>
            {showMyReviews ? 'My Reviews' : 'My Orders'}
          </h1>
          <p className="admin-card-subtitle">
            {showMyReviews ? 'Reviews you have submitted' : 'Track and manage your orders'}
          </p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={toggleMyReviews}
          style={{ marginTop: 0 }}
        >
          {showMyReviews ? 'View Orders' : 'My Reviews'}
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      {showMyReviews ? (
        loadingReviews ? (
          <div className="admin-loading"><div className="admin-spinner" /><span>Loading reviews...</span></div>
        ) : myReviews.length === 0 ? (
          <div className="admin-empty">
            <div className="admin-empty-icon">⭐</div>
            <div className="admin-empty-title">No reviews yet</div>
            <div className="admin-empty-desc">You haven't submitted any reviews.</div>
          </div>
        ) : (
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {myReviews.map((review) => (
                  <tr key={review.reviewId}>
                    <td>{review.productName || `Product #${review.productId?.slice(0, 6)}`}</td>
                    <td>{renderStars(review.rating || 0)}</td>
                    <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {review.comment || ''}
                    </td>
                    <td>
                      <span className={`admin-badge-status ${(review.status || 'pending').toLowerCase()}`}>
                        {review.status || 'Pending'}
                      </span>
                    </td>
                    <td>{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn admin-btn-sm admin-btn-danger"
                        onClick={() => handleDeleteReview(review.reviewId)}
                        title="Delete review"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Loading orders...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <div className="admin-empty-icon">📦</div>
          <div className="admin-empty-title">No orders yet</div>
          <div className="admin-empty-desc">Your order history will appear here.</div>
          <Link to="/categories" className="btn btn-primary">Start Shopping</Link>
        </div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Order Date</th>
                  <th>Delivery Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.orderId || order.id}>
                    <td>
                      <span className="admin-order-id">#{String(order.orderId || order.id).slice(0, 8)}</span>
                    </td>
                    <td>{formatDate(order.createdAt || order.orderDate)}</td>
                    <td>{formatDate(order.deliveryDate)}</td>
                    <td>{order.items?.length || 0} items</td>
                    <td className="admin-price">{formatCurrency(order.totalAmount || order.total)}</td>
                    <td>
                      <span className={`admin-badge-status ${getStatusClass(order.status)}`}>
                        {order.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => viewOrder(order)}>
                          <FiEye /> View
                        </button>
                        <button className="admin-btn admin-btn-sm admin-btn-primary" onClick={() => navigate(`/receipt/${order.orderId}`)}>
                          <FiDownload /> Receipt
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
          </table>
        </div>
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
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.totalAmount)}</p>
                  <p><strong>Status:</strong> <span className={`admin-badge-status ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status || 'Pending'}</span></p>
                  <p><strong>Payment:</strong> {selectedOrder.paymentMethod || 'N/A'}</p>
                  <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  <p><strong>Delivery Date:</strong> {formatDate(selectedOrder.deliveryDate)}</p>
                  <p><strong>Address:</strong> {selectedOrder.shippingAddress || 'N/A'}</p>
                  {selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <strong>Items:</strong>
                      <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                        {selectedOrder.items.map((item, idx) => (
                          <li key={idx}>{item.productName || 'Product'} x{item.quantity} - {formatCurrency(item.totalPrice || item.pricePerUnit * item.quantity)}</li>
                        ))}
                      </ul>
                      
                      <div style={{ marginTop: 20 }}>
                        <strong>Write a Review</strong>
                        {reviewMessage && <div className="review-message">{reviewMessage}</div>}
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} style={{ marginTop: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                            <p style={{ margin: '0 0 8px', fontWeight: 600 }}>{item.productName || 'Product'}</p>
                            {reviewProductId === item.productId ? (
                              <form onSubmit={(e) => handleReviewSubmit(e, item.productId)}>
                                <div className="form-group">
                                  <label>Rating</label>
                                  <div className="star-rating-input">
                                    {[1,2,3,4,5].map((star) => (
                                      <button
                                        key={star}
                                        type="button"
                                        className="star-btn"
                                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                                      >
                                        <FiStar style={{ color: star <= reviewForm.rating ? 'var(--warning)' : '#d1d5db' }} />
                                      </button>
                                    ))}
                                  </div>
                                </div>
                                <div className="form-group">
                                  <label>Comment</label>
                                  <textarea
                                    rows="2"
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                    placeholder="Share your experience with this product..."
                                    required
                                  />
                                </div>
                                <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                  <button type="submit" className="btn btn-primary btn-sm" disabled={submittingReview}>
                                    {submittingReview ? 'Submitting...' : 'Submit Review'}
                                  </button>
                                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setReviewProductId(null); setReviewMessage(''); }}>
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            ) : (
                              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setReviewProductId(item.productId)}>
                                <FiStar /> Write Review
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p>Loading order details...</p>
              )}
            </div>
            <div className="admin-modal-footer">
              <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowDetailModal(false)}>Close</button>
              {selectedOrder && (
                <button type="button" className="admin-btn admin-btn-primary" onClick={() => { setShowDetailModal(false); navigate(`/receipt/${selectedOrder.orderId}`); }}>
                  <FiDownload /> Download Receipt
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerOrders;
