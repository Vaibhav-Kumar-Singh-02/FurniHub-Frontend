import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiTrash2, FiPlus, FiMinus, FiArrowRight, FiTag } from 'react-icons/fi';
import { getCartItems, saveCartItems, getCartCount } from '../utils/cart';
import { catalogAPI } from '../services/api';
// test rebuild
import '../styles/Cart.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [selectedCouponId, setSelectedCouponId] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponMessage, setCouponMessage] = useState('');
  const [couponMessageType, setCouponMessageType] = useState('info');
  const [showCouponDropdown, setShowCouponDropdown] = useState(false);
  const [couponInputText, setCouponInputText] = useState('');
  const [couponSearchQuery, setCouponSearchQuery] = useState('');

  useEffect(() => {
    loadCart();
    loadActiveCoupons();
  }, []);

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

  const loadCart = () => {
    setCartItems(getCartItems());
  };

  const updateQuantity = (productId, delta) => {
    const items = getCartItems();
    const item = items.find(i => i.productId === productId || i.id === productId);
    if (item) {
      item.quantity = Math.max(1, (item.quantity || 1) + delta);
      saveCartItems(items);
      loadCart();
    }
  };

  const removeItem = (productId) => {
    const items = getCartItems().filter(i => i.productId !== productId && i.id !== productId);
    saveCartItems(items);
    loadCart();
  };

  const getSubtotal = () => {
    return cartItems.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const qty = Number(item.quantity) || 0;
      return sum + (price * qty);
    }, 0);
  };

  const getGST = () => {
    const subtotal = getSubtotal();
    const couponDiscount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
    const discountedSubtotal = Number((subtotal - couponDiscount).toFixed(2));
    const gstRate = 0.18;
    const gstAmount = Number((subtotal * gstRate).toFixed(2));
    const grandTotal = Number((discountedSubtotal + gstAmount).toFixed(2));
    return { subtotal, couponDiscount, discountedSubtotal, gstAmount, grandTotal };
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

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-empty">
          <FiShoppingCart size={64} />
          <h2>Your cart is empty</h2>
          <p>Looks like you haven't added any furniture yet.</p>
          <Link to="/categories" className="btn btn-primary">Browse Categories</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-header">
        <h1>Shopping Cart</h1>
        <span className="cart-count">{cartItems.length} items</span>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {cartItems.map((item) => (
            <div key={item.productId || item.id} className="cart-item">
              <div className="cart-item-image">
                {item.imageUrl || (item.imageUrls && item.imageUrls[0]) ? (
                  <img src={item.imageUrl || item.imageUrls[0]} alt={item.name} />
                ) : (
                  <div className="cart-item-placeholder">No Image</div>
                )}
              </div>
              <div className="cart-item-details">
                <h3>{item.name}</h3>
                <p className="cart-item-price">₹{Number(item.price).toLocaleString('en-IN')}</p>
              </div>
              <div className="cart-item-quantity">
                <button onClick={() => updateQuantity(item.productId || item.id, -1)}><FiMinus /></button>
                <span>{item.quantity || 1}</span>
                <button onClick={() => updateQuantity(item.productId || item.id, 1)}><FiPlus /></button>
              </div>
              <div className="cart-item-total">
                ₹{(Number(item.price) * (item.quantity || 1)).toLocaleString('en-IN')}
              </div>
              <button className="cart-item-remove" onClick={() => removeItem(item.productId || item.id)}>
                <FiTrash2 />
              </button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          {(() => {
            const { subtotal, couponDiscount, discountedSubtotal, gstAmount, grandTotal } = getGST();
            return (
              <>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                {appliedCoupon && (
                  <div className="cart-summary-row" style={{ color: 'var(--success)' }}>
                    <span>Coupon Discount ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="cart-summary-row">
                  <span>GST (18%)</span>
                  <span>₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="cart-summary-row">
                  <span>Delivery</span>
                  <span style={{ color: 'var(--success)' }}>Free</span>
                </div>
                <div className="cart-summary-row total">
                  <span>Total</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </>
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
          <button className="btn btn-primary btn-block" onClick={handleCheckout} disabled={loading} style={{ marginTop: '1rem' }}>
            <FiArrowRight /> Proceed to Checkout
          </button>
          <Link to="/categories" className="cart-continue">Continue Shopping</Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
