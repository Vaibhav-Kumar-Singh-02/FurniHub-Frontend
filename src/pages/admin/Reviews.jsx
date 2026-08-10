import React, { useState, useEffect } from 'react';
import { FiSearch, FiCheck, FiX, FiTrash2, FiMessageSquare, FiStar } from 'react-icons/fi';
import { reviewsAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Reviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    loadReviews();
  }, [page, statusFilter]);

  const loadReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await reviewsAPI.getAll({ page, limit: 10, status: statusFilter, search });
      setReviews(res.data?.reviews || res.data || []);
      setTotalPages(res.data?.totalPages || 1);
    } catch {
      setError('Failed to load reviews');
    }
    setLoading(false);
  };

  const approveReview = async (id) => {
    try {
      await reviewsAPI.approve(id);
      setSuccess('Review approved');
      loadReviews();
    } catch {
      setError('Failed to approve review');
    }
  };

  const rejectReview = async (id) => {
    try {
      await reviewsAPI.reject(id);
      setSuccess('Review rejected');
      loadReviews();
    } catch {
      setError('Failed to reject review');
    }
  };

  const deleteReview = async (id) => {
    try {
      await reviewsAPI.delete(id);
      setSuccess('Review deleted');
      loadReviews();
    } catch {
      setError('Failed to delete review');
    }
  };

  const openReplyModal = (review) => {
    setSelectedReview(review);
    setReplyText(review.adminReply || '');
    setShowReplyModal(true);
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await reviewsAPI.reply(selectedReview.reviewId, { message: replyText.trim() });
      setSuccess('Reply posted');
      setShowReplyModal(false);
      setReplyText('');
      loadReviews();
    } catch {
      setError('Failed to post reply');
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(<FiStar key={i} style={{ color: i <= rating ? '#f59e0b' : '#d1d5db', fontSize: '0.9rem' }} />);
    }
    return <div style={{ display: 'flex', gap: 2 }}>{stars}</div>;
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Reviews</h1>
          <p className="admin-card-subtitle">Manage product reviews</p>
        </div>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-toolbar">
        <div className="admin-search">
          <FiSearch />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
        <select className="admin-filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading reviews...</span></div>
      ) : (
        <>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>User</th>
                  <th>Rating</th>
                  <th>Comment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length === 0 ? (
                  <tr><td colSpan="6">
                    <div className="admin-empty">
                      <div className="admin-empty-icon">⭐</div>
                      <div className="admin-empty-title">No reviews found</div>
                      <div className="admin-empty-desc">Try adjusting your filters.</div>
                    </div>
                  </td></tr>
                ) : (
                  reviews.map((review) => (
                    <tr key={review.reviewId}>
                      <td>{review.productName || `Product #${review.productId?.slice(0, 6)}`}</td>
                      <td>{review.userFullName || 'N/A'}</td>
                      <td>{renderStars(review.rating || 0)}</td>
                      <td style={{ maxWidth: 250, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {review.comment || ''}
                      </td>
                      <td>
                        <span className={`admin-badge-status ${(review.status || 'pending').toLowerCase()}`}>
                          {review.status || 'Pending'}
                        </span>
                      </td>
                      <td>
                        <div className="admin-actions">
                          {review.status !== 'approved' && (
                            <button className="admin-btn admin-btn-sm admin-btn-success" onClick={() => approveReview(review.reviewId)}>
                              <FiCheck />
                            </button>
                          )}
                          {review.status !== 'rejected' && (
                            <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => rejectReview(review.reviewId)}>
                              <FiX />
                            </button>
                          )}
                          <button className="admin-btn admin-btn-sm admin-btn-secondary" onClick={() => openReplyModal(review)}>
                            <FiMessageSquare />
                          </button>
                          <button className="admin-btn admin-btn-sm admin-btn-danger" onClick={() => deleteReview(review.reviewId)}>
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

      {showReplyModal && (
        <div className="admin-modal-overlay" onClick={() => setShowReplyModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h2 className="admin-modal-title">Reply to Review</h2>
              <button className="admin-modal-close" onClick={() => setShowReplyModal(false)}><FiX /></button>
            </div>
            <form onSubmit={submitReply}>
              <div className="admin-modal-body">
                 <p style={{ marginBottom: 12, color: 'var(--admin-text-light)', fontSize: '0.9rem' }}>
                   Replying to review by {selectedReview?.userFullName || 'User'}
                 </p>
                <div className="admin-form-group">
                  <label className="admin-form-label">Reply</label>
                  <textarea
                    className="admin-form-input"
                    rows="4"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder="Write your reply..."
                    style={{ resize: 'vertical' }}
                  />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button type="button" className="admin-btn admin-btn-secondary" onClick={() => setShowReplyModal(false)}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn-primary">Post Reply</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;
