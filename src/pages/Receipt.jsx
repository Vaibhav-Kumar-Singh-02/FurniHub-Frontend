import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiDownload, FiPrinter, FiArrowLeft, FiMail, FiPhone, FiMapPin, FiCreditCard, FiStar } from 'react-icons/fi';
import { customerOrdersAPI, customerReviewsAPI } from '../services/api';
import '../styles/Receipt.css';

const Receipt = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewProductId, setReviewProductId] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const res = await customerOrdersAPI.getReceipt(orderId);
        setReceipt(res.data);
      } catch (err) {
        setError('Failed to load receipt');
      } finally {
        setLoading(false);
      }
    };
    fetchReceipt();
  }, [orderId]);

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const receiptData = receipt;
    if (!receiptData) return;

    let content = '========================================\n';
    content += '           FURNIHUB RECEIPT           \n';
    content += '========================================\n\n';
    content += `Order ID: ${receiptData.orderId}\n`;
    content += `Order Date: ${formatDate(receiptData.orderDate)}\n`;
    content += `Delivery Date: ${receiptData.deliveryDate}\n`;
    content += `Status: ${receiptData.status}\n\n`;
    content += '----------------------------------------\n';
    content += 'CUSTOMER DETAILS\n';
    content += '----------------------------------------\n';
    content += `Name: ${receiptData.customerName}\n`;
    content += `Email: ${receiptData.customerEmail}\n`;
    content += `Phone: ${receiptData.customerMobile}\n`;
    content += `Address: ${receiptData.shippingAddress}\n\n`;
    content += '----------------------------------------\n';
    content += 'PAYMENT DETAILS\n';
    content += '----------------------------------------\n';
    content += `Method: ${receiptData.paymentMethod}\n`;
    content += `Total Amount: ${formatCurrency(receiptData.totalAmount)}\n\n`;
    content += '----------------------------------------\n';
    content += 'ITEMS\n';
    content += '----------------------------------------\n';
    receiptData.items.forEach((item, idx) => {
      content += `${idx + 1}. ${item.productName}\n`;
      content += `   Brand: ${item.brand}\n`;
      content += `   Qty: ${item.quantity} x ${formatCurrency(item.pricePerUnit)} = ${formatCurrency(item.totalPrice)}\n\n`;
    });
    content += '----------------------------------------\n';
    content += `SUBTOTAL: ${formatCurrency(receiptData.subtotal)}\n`;
    content += `CGST (9%): ${formatCurrency(receiptData.cgst)}\n`;
    content += `SGST (9%): ${formatCurrency(receiptData.sgst)}\n`;
    if ((receiptData.igst || 0) > 0) {
      content += `IGST (18%): ${formatCurrency(receiptData.igst)}\n`;
    }
    content += `GST TOTAL: ${formatCurrency(receiptData.gstTotal)}\n`;
    content += `GRAND TOTAL: ${formatCurrency(receiptData.totalAmount)}\n`;
    content += '========================================\n';
    content += '   Thank you for shopping with us!    \n';
    content += '========================================\n';

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FurniHub_Receipt_${receiptData.orderId}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
    } catch {
      setReviewMessage('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="receipt-page">
        <div className="receipt-loading">
          <div className="admin-spinner" />
          <p>Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="receipt-page">
        <div className="receipt-error">
          <p>{error || 'Receipt not found'}</p>
          <Link to="/customer/orders" className="btn btn-primary">Back to Orders</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="receipt-page">
      <div className="receipt-actions">
        <button className="btn btn-secondary" onClick={() => navigate('/customer/orders')}>
          <FiArrowLeft /> Back to Orders
        </button>
        <div className="receipt-action-btns">
          <button className="btn btn-secondary" onClick={handlePrint}>
            <FiPrinter /> Print
          </button>
          <button className="btn btn-primary" onClick={handleDownload}>
            <FiDownload /> Download
          </button>
        </div>
      </div>

      <div className="receipt-container" id="receipt-content">
        <div className="receipt-header">
          <div className="receipt-brand">
            <h1>FurniHub</h1>
            <p>Premium Furniture Store</p>
          </div>
          <div className="receipt-title">
            <h2>OFFICIAL RECEIPT</h2>
            <span className="receipt-id">#{receipt.orderId?.slice(0, 8)}</span>
          </div>
        </div>

        <div className="receipt-body">
          <div className="receipt-section">
            <h3><FiMail /> Customer Information</h3>
            <div className="receipt-info-grid">
              <div className="receipt-info-item">
                <span className="receipt-label">Full Name</span>
                <span className="receipt-value">{receipt.customerName}</span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-label">Email</span>
                <span className="receipt-value">{receipt.customerEmail}</span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-label"><FiPhone /> Phone</span>
                <span className="receipt-value">{receipt.customerMobile}</span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-label"><FiMapPin /> Address</span>
                <span className="receipt-value">{receipt.shippingAddress}</span>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h3><FiCreditCard /> Payment Information</h3>
            <div className="receipt-info-grid">
              <div className="receipt-info-item">
                <span className="receipt-label">Payment Method</span>
                <span className="receipt-value">
                  <span className={`payment-badge payment-${receipt.paymentMethod?.toLowerCase().replace(' ', '-')}`}>
                    {receipt.paymentMethod}
                  </span>
                </span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-label">Order Status</span>
                <span className="receipt-value">
                  <span className={`admin-badge-status status-${receipt.status?.toLowerCase()}`}>
                    {receipt.status}
                  </span>
                </span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-label">Order Date</span>
                <span className="receipt-value">{formatDate(receipt.orderDate)}</span>
              </div>
              <div className="receipt-info-item">
                <span className="receipt-label">Estimated Delivery</span>
                <span className="receipt-value">{receipt.deliveryDate}</span>
              </div>
            </div>
          </div>

          <div className="receipt-section">
            <h3>Order Items</h3>
            <div className="receipt-table-wrapper">
                <table className="receipt-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product</th>
                      <th>Brand</th>
                      <th>Qty</th>
                      <th>Price</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipt.items?.map((item, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {item.imageUrl ? (
                              <img src={item.imageUrl} alt={item.productName} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                            ) : (
                              <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.65rem' }}>No Image</div>
                            )}
                            <span>{item.productName}</span>
                          </div>
                        </td>
                        <td>{item.brand}</td>
                        <td>{item.quantity}</td>
                        <td>{formatCurrency(item.pricePerUnit)}</td>
                        <td>{formatCurrency(item.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            </div>
          </div>

          <div className="receipt-section">
            <h3><FiStar /> Rate Your Purchase</h3>
            {reviewMessage && <div className="review-message">{reviewMessage}</div>}
            {receipt.items?.map((item, idx) => (
              <div key={idx} style={{ marginTop: 12, padding: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.productName} style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 40, height: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.65rem' }}>No Image</div>
                  )}
                  <p style={{ margin: 0, fontWeight: 600 }}>{item.productName}</p>
                </div>
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

          <div className="receipt-section receipt-summary">
            <div className="receipt-summary-row">
              <span>Subtotal</span>
              <span>{formatCurrency(receipt.subtotal)}</span>
            </div>
            <div className="receipt-summary-row">
              <span>CGST (9%)</span>
              <span>{formatCurrency(receipt.cgst)}</span>
            </div>
            <div className="receipt-summary-row">
              <span>SGST (9%)</span>
              <span>{formatCurrency(receipt.sgst)}</span>
            </div>
            {receipt.igst > 0 && (
              <div className="receipt-summary-row">
                <span>IGST (18%)</span>
                <span>{formatCurrency(receipt.igst)}</span>
              </div>
            )}
            <div className="receipt-summary-row">
              <span>GST Total</span>
              <span>{formatCurrency(receipt.gstTotal)}</span>
            </div>
            <div className="receipt-summary-row receipt-total">
              <span>Grand Total</span>
              <span>{formatCurrency(receipt.totalAmount)}</span>
            </div>
          </div>
        </div>

        <div className="receipt-footer">
          <p>Thank you for shopping with FurniHub!</p>
          <p className="receipt-footer-small">For queries, contact us at support@furnihub.com</p>
        </div>
      </div>
    </div>
  );
};

export default Receipt;
