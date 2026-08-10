import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiLock, FiCreditCard } from 'react-icons/fi';
import { getCartItems, clearCart } from '../utils/cart';
import { authAPI, catalogAPI } from '../services/api';
import '../styles/Checkout.css';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    shippingAddress: '',
    paymentMethod: 'cash_on_delivery',
    fullName: '',
    mobile: '',
  });
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState('info');
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [couponInputText, setCouponInputText] = useState('');
  const [couponSearchQuery, setCouponSearchQuery] = useState('');

  useEffect(() => {
    const items = getCartItems();
    if (items.length === 0) {
      navigate('/cart');
    } else {
      setCartItems(items);
    }
    loadActiveCoupons();
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.coupon-combobox')) {
        setShowCouponDropdown(false);
        setCouponSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadActiveCoupons = async () => {
    try {
      const res = await catalogAPI.getActiveCoupons();
      setActiveCoupons(res.data || []);
    } catch (err) {
      console.error('Failed to load active coupons:', err);
    }
  };

  const getGST = () => {
    const subtotal = cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
    const couponDiscount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
    const discountedSubtotal = Number((subtotal - couponDiscount).toFixed(2));
    const gstRate = 0.18;
    const gstAmount = Number((subtotal * gstRate).toFixed(2));
    return { subtotal, couponDiscount, discountedSubtotal, gstAmount, grandTotal: discountedSubtotal + gstAmount };
  };

  const applyCoupon = async () => {
    const codeToApply = selectedCouponId
      ? (activeCoupons.find(c => c.couponId === Number(selectedCouponId))?.code || '').trim()
      : couponInputText.trim();

    if (!codeToApply) {
      setCouponMessage('Please select or enter a coupon code');
      setCouponMessageType('error');
      return;
    }
    try {
      const productIds = cartItems.map(item => Number(item.id || item.productId)).filter(Boolean);
      const res = await catalogAPI.validateCoupon(codeToApply, getGST().subtotal, productIds);
      if (res.data.valid) {
        setAppliedCoupon(res.data);
        setCouponMessage(`Coupon applied! You saved ₹${res.data.discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`);
        setCouponMessageType('success');
      } else {
        setAppliedCoupon(null);
        setCouponMessage(res.data.message || 'Invalid coupon');
        setCouponMessageType('error');
      }
    } catch {
      setAppliedCoupon(null);
      setCouponMessage('Failed to apply coupon');
      setCouponMessageType('error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setSelectedCouponId('');
    setCouponInputText('');
    setCouponMessage('');
    setCouponMessageType('info');
    setShowCouponDropdown(false);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const items = cartItems.map(item => ({
        productId: item.productId || item.id,
        quantity: item.quantity || 1,
      }));

      const response = await authAPI.placeOrder({
        items,
        shippingAddress: form.shippingAddress,
        paymentMethod: form.paymentMethod,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      });

      if (response.data) {
        clearCart();
        navigate('/customer/orders', { state: { orderPlaced: true, orderId: response.data.orderId } });
      }
    } catch (err) {
      setError(err.response?.data || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button className="back-btn" onClick={() => navigate('/cart')}>
          <FiArrowLeft /> Back to Cart
        </button>
        <h1>Checkout</h1>
      </div>

      {error && <div className="checkout-message error">{error}</div>}

      <form onSubmit={handleSubmit} className="checkout-layout">
        <div className="checkout-section">
          <h3>Shipping Information</h3>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
            />
          </div>
          <div className="form-group">
            <label>Mobile Number *</label>
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={handleChange}
              required
              placeholder="Enter your mobile number"
            />
          </div>
          <div className="form-group">
            <label>Shipping Address *</label>
            <textarea
              name="shippingAddress"
              value={form.shippingAddress}
              onChange={handleChange}
              required
              placeholder="Enter your full address"
              rows="3"
            />
          </div>
        </div>

        <div className="checkout-section">
          <h3>Payment Method</h3>
          <div className="payment-options">
            <label className={`payment-option ${form.paymentMethod === 'cash_on_delivery' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash_on_delivery"
                checked={form.paymentMethod === 'cash_on_delivery'}
                onChange={handleChange}
              />
              <FiCreditCard />
              <span>Cash on Delivery</span>
            </label>
          </div>
        </div>

        <div className="checkout-section">
          <h3>Order Summary</h3>
          <div className="checkout-items">
            {cartItems.map((item) => (
              <div key={item.productId || item.id} className="checkout-item">
                <div className="checkout-item-info">
                  <span className="checkout-item-name">{item.name}</span>
                  <span className="checkout-item-qty">Qty: {item.quantity || 1}</span>
                </div>
                <span className="checkout-item-price">₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
          {(() => {
            const { subtotal, couponDiscount, gstAmount, grandTotal } = getGST();
            return (
              <div className="checkout-total">
                <div className="checkout-total-row"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
                {appliedCoupon && (
                  <div className="checkout-total-row" style={{ color: 'var(--success)' }}>
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="checkout-total-row"><span>GST (18%)</span><span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></div>
                <div className="checkout-total-row"><span>Delivery</span><span style={{ color: 'var(--success)' }}>Free</span></div>
                <div className="checkout-total-row checkout-total-grand"><span>Total</span><span>₹{grandTotal.toLocaleString('en-IN')}</span></div>
              </div>
            );
          })()}
          <div className="coupon-section" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Apply Coupon</h3>
            <div className="coupon-combobox">
              <div className="coupon-input-wrapper">
                <input
                  type="text"
                  className="coupon-input"
                  placeholder="Enter coupon code or click to browse"
                  value={selectedCouponId ? (activeCoupons.find(c => c.couponId === Number(selectedCouponId))?.code || '') : couponInputText}
                  onChange={(e) => {
                    setSelectedCouponId('');
                    setCouponInputText(e.target.value.toUpperCase());
                  }}
                  onFocus={() => setShowCouponDropdown(true)}
                  disabled={!!appliedCoupon}
                />
                {appliedCoupon ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={removeCoupon}>Remove</button>
                ) : (
                  <button type="button" className="btn btn-primary btn-sm" onClick={applyCoupon}>Apply</button>
                )}
              </div>
              {showCouponDropdown && !appliedCoupon && activeCoupons.length > 0 && (
                <div className="coupon-dropdown">
                  <div className="coupon-dropdown-search-wrapper">
                    <input
                      type="text"
                      className="coupon-dropdown-search"
                      placeholder="Search coupons..."
                      value={couponSearchQuery}
                      onChange={(e) => setCouponSearchQuery(e.target.value.toUpperCase())}
                      autoFocus
                    />
                  </div>
                  <div className="coupon-dropdown-list">
                    {activeCoupons
                      .filter(coupon => coupon.code.includes(couponSearchQuery))
                      .map(coupon => {
                        const isSelected = selectedCouponId === String(coupon.couponId);
                        return (
                          <div
                            key={coupon.couponId}
                            className={`coupon-dropdown-item ${isSelected ? 'coupon-dropdown-item-selected' : ''}`}
                            onClick={() => {
                              setSelectedCouponId(String(coupon.couponId));
                              setShowCouponDropdown(false);
                              setCouponSearchQuery('');
                            }}
                          >
                            <div className="coupon-dropdown-code">{coupon.code}</div>
                            <div className="coupon-dropdown-discount">
                              {coupon.discountType === 'PERCENTAGE' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                            </div>
                            <div className="coupon-dropdown-validity">
                              Valid until {coupon.validUntil ? new Date(coupon.validUntil).toLocaleDateString('en-IN') : 'N/A'}
                            </div>
                          </div>
                        );
                      })}
                    {activeCoupons.filter(coupon => coupon.code.includes(couponSearchQuery)).length === 0 && (
                      <div className="coupon-dropdown-empty">No coupons found</div>
                    )}
                  </div>
                </div>
              )}
            </div>
            {couponMessage && (
              <div className={`coupon-message ${couponMessageType === 'success' ? 'coupon-success' : couponMessageType === 'error' ? 'coupon-error' : 'coupon-info'}`}>
                {couponMessage}
              </div>
            )}
          </div>
        </div>

        <button type="submit" className="btn btn-primary btn-checkout" disabled={loading}>
          {loading ? (
            <span className="spinner"></span>
          ) : (
            <>
              <FiLock /> Place Order
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default CheckoutPage;
