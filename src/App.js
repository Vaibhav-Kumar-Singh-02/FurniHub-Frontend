import React from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ChangePassword from './pages/ChangePassword';
import Categories from './pages/Categories';
import ProductDetail from './pages/ProductDetail';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import Products from './pages/admin/Products';
import Users from './pages/admin/Users';
import Orders from './pages/admin/Orders';
import AdminCategories from './pages/admin/Categories';
import Inventory from './pages/admin/Inventory';
import Analytics from './pages/admin/Analytics';
import Coupons from './pages/admin/Coupons';
import Reviews from './pages/admin/Reviews';
import Settings from './pages/admin/Settings';
import AdminNotifications from './pages/admin/Notifications';
import CustomerOrders from './pages/CustomerOrders';
import Receipt from './pages/Receipt';
import SearchResults from './pages/SearchResults'; // eslint-disable-line no-unused-vars
import CheckoutPage from './pages/CheckoutPage';
import { authAPI, catalogAPI } from './services/api';
import { clearCart } from './utils/cart';
import WishlistPage from './pages/WishlistPage';
import './App.css';

const CartPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = React.useState([]);
  const [paymentMethod, setPaymentMethod] = React.useState('cod');
  const [checkoutMessage, setCheckoutMessage] = React.useState('');
  const [checkoutMessageType, setCheckoutMessageType] = React.useState('info');
  const [orderStatus, setOrderStatus] = React.useState(null);
  const [paymentError, setPaymentError] = React.useState('');
  const [upiId, setUpiId] = React.useState('');
  const [upiPassword, setUpiPassword] = React.useState('');
  const [bankName, setBankName] = React.useState('');
  const [cardHolderName, setCardHolderName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiryDate, setExpiryDate] = React.useState('');
  const [cardNickname, setCardNickname] = React.useState('Personal');
  const [addressFullName, setAddressFullName] = React.useState('');
  const [addressPhone, setAddressPhone] = React.useState('');
  const [addressLine1, setAddressLine1] = React.useState('');
  const [addressLine2, setAddressLine2] = React.useState('');
  const [city, setCity] = React.useState('');
  const [stateRegion, setStateRegion] = React.useState('');
  const [pincode, setPincode] = React.useState('');
  const [addressError, setAddressError] = React.useState('');
  const [addressConfirmed, setAddressConfirmed] = React.useState(false);
  const [showCardModal, setShowCardModal] = React.useState(false);
  const [showUpiModal, setShowUpiModal] = React.useState(false);
  const [couponCode, setCouponCode] = React.useState('');
  const [appliedCoupon, setAppliedCoupon] = React.useState(null);
  const [couponMessage, setCouponMessage] = React.useState('');
  const [couponMessageType, setCouponMessageType] = React.useState('info');

  React.useEffect(() => {
    const loadCart = () => {
      try {
        const stored = localStorage.getItem('furnihub_cart');
        setItems(stored ? JSON.parse(stored) : []);
      } catch {
        setItems([]);
      }
    };

    loadCart();
    window.addEventListener('cart:updated', loadCart);
    return () => window.removeEventListener('cart:updated', loadCart);
  }, []);

  const subtotal = Number(items.reduce((sum, item) => sum + (Number(item.price) || 0) * (item.quantity || 1), 0));
  const couponDiscount = appliedCoupon ? Number(appliedCoupon.discountAmount || 0) : 0;
  const discountedSubtotal = Number((subtotal - couponDiscount).toFixed(2));
  const gstAmount = Number((discountedSubtotal * 0.18).toFixed(2));
  const grandTotal = Number((discountedSubtotal + gstAmount).toFixed(2));

  const updateQuantity = (itemId, delta) => {
    const updatedItems = items
      .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
      .filter((item) => item.quantity > 0);

    setItems(updatedItems);
    localStorage.setItem('furnihub_cart', JSON.stringify(updatedItems));
    window.dispatchEvent(new Event('cart:updated'));
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponMessage('Please enter a coupon code');
      setCouponMessageType('error');
      return;
    }
    try {
      const productIds = items.map(item => Number(item.id || item.productId)).filter(Boolean);
      const res = await catalogAPI.validateCoupon(couponCode.trim(), subtotal, productIds);
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
    setCouponCode('');
    setCouponMessage('');
    setCouponMessageType('info');
  };

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const resetPaymentFields = () => {
    setUpiId('');
    setUpiPassword('');
    setBankName('');
    setCardHolderName('');
    setCardNumber('');
    setExpiryDate('');
    setCardNickname('Personal');
    setCheckoutMessage('');
    setPaymentError('');
    setAddressError('');
    setAddressConfirmed(false);
    setShowCardModal(false);
    setShowUpiModal(false);
  };

  const validateAddress = () => {
    if (!addressFullName.trim() || !addressPhone.trim() || !addressLine1.trim() || !city.trim() || !stateRegion.trim() || !pincode.trim()) {
      setAddressError('Please fill in all required address fields.');
      return false;
    }
    if (!/^\d{10}$/.test(addressPhone.replace(/^\+91/, '').trim())) {
      setAddressError('Please enter a valid 10-digit phone number.');
      return false;
    }
    if (!/^\d{6}$/.test(pincode.trim())) {
      setAddressError('Please enter a valid 6-digit pincode.');
      return false;
    }
    setAddressError('');
    return true;
  };

  const formattedAddress = () => {
    const parts = [addressLine1, addressLine2, city, stateRegion, pincode].filter(Boolean);
    return parts.join(', ');
  };

  const handleConfirmAddress = () => {
    if (validateAddress()) {
      setAddressConfirmed(true);
      setCheckoutMessage('Address confirmed. Please choose a payment method.');
      setCheckoutMessageType('success');
    }
  };

  const placeOrderOnServer = async (selectedPaymentMethod, paymentLabel) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const orderData = {
        items: items.map(item => ({
          productId: item.productId || item.id,
          quantity: item.quantity || 1,
        })),
        shippingAddress: `${addressFullName}, ${formattedAddress()}`,
        paymentMethod: paymentLabel,
        couponCode: appliedCoupon ? appliedCoupon.code : null,
      };

      const response = await authAPI.placeOrder(orderData);
      if (response.data) {
        localStorage.removeItem('furnihub_cart');
        setItems([]);
        window.dispatchEvent(new Event('cart:updated'));
        setOrderStatus({
          status: response.data.status || 'Confirmed',
          paymentMethod: paymentLabel,
          deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          deliveryAddress: orderData.shippingAddress,
          orderId: response.data.orderId,
        });
        setCheckoutMessage('Order placed successfully!');
        setCheckoutMessageType('success');
        setPaymentError('');
      }
    } catch (err) {
      setCheckoutMessage('Failed to place order. Please try again.');
      setCheckoutMessageType('error');
      setPaymentError(err.response?.data || 'Something went wrong');
    }
  };

  const handleCheckout = () => {
    if (items.length === 0) {
      setCheckoutMessage('Your cart is empty. Add a product before checkout.');
      setCheckoutMessageType('error');
      setPaymentError('');
      return;
    }

    if (!validateAddress()) {
      return;
    }

    const selectedPaymentMethod = document.querySelector('input[name="payment"]:checked')?.value || paymentMethod || 'cod';
    const paymentLabel = selectedPaymentMethod === 'card'
      ? 'Card'
      : selectedPaymentMethod === 'upi'
        ? 'UPI'
        : selectedPaymentMethod === 'razorpay'
          ? 'Razorpay'
          : 'Cash on Delivery';

    if (selectedPaymentMethod === 'upi') {
      if (!upiId.trim() || !upiPassword.trim()) {
        setCheckoutMessage('Please enter your UPI ID and password to continue.');
        setCheckoutMessageType('error');
        setPaymentError('');
        return;
      }
      placeOrderOnServer(selectedPaymentMethod, paymentLabel);
      return;
    }

    if (selectedPaymentMethod === 'razorpay') {
      const options = {
        key: 'rzp_test_TLJ4wDlknTTeqx',
        amount: subtotal * 100,
        currency: 'INR',
        name: 'FurniHub',
        description: 'Furniture purchase',
        handler: function () {
          placeOrderOnServer(selectedPaymentMethod, paymentLabel);
        },
        prefill: {
          name: addressFullName || 'Customer',
          email: 'customer@example.com',
          contact: addressPhone || '9999999999',
        },
        theme: {
          color: '#e67e22',
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      return;
    }

    if (selectedPaymentMethod === 'card') {
      if (!cardHolderName.trim() || !cardNumber.trim() || !expiryDate.trim() || !bankName.trim()) {
        setCheckoutMessage('Please fill in all card details to continue.');
        setCheckoutMessageType('error');
        setPaymentError('');
        return;
      }

      // Validate card number (16 digits)
      if (cardNumber.replace(/\D/g, '').length !== 16) {
        setCheckoutMessage('Please enter a valid 16-digit card number.');
        setCheckoutMessageType('error');
        setPaymentError('');
        return;
      }

      // Validate expiry date (MM/YY format)
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        setCheckoutMessage('Please enter expiry date in MM/YY format.');
        setCheckoutMessageType('error');
        setPaymentError('');
        return;
      }

      placeOrderOnServer(selectedPaymentMethod, paymentLabel);
      return;
    }

    placeOrderOnServer(selectedPaymentMethod, paymentLabel);
  };

  return (
    <div className="page-container cart-page">
      <div className="cart-card">
        <div className="cart-header">
          <h2>Your Cart</h2>
          <p>{items.length} item{items.length === 1 ? '' : 's'} selected</p>
        </div>

        {items.length === 0 ? (
          <p className="cart-empty">Your cart is empty.</p>
        ) : (
          <React.Fragment>
            <ul className="cart-items-list">
              {items.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    <img
                      src={item.imageUrls && item.imageUrls.length > 0 ? item.imageUrls[0] : (item.imageUrl || '')}
                      alt={item.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://via.placeholder.com/80x80/f1f5f9/94a3b8?text=No+Image';
                      }}
                    />
                  </div>
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">₹{Number(item.price).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="cart-item-right">
                    <div className="quantity-controls">
                      <button type="button" onClick={() => updateQuantity(item.id, -1)}>-</button>
                      <span>{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.id, 1)}>+</button>
                    </div>
                    <span className="cart-item-total">₹{(Number(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="cart-layout">
              <div className="cart-summary">
                <h3 className="cart-summary-title">Order Summary</h3>
                <div className="cart-summary-rows">
                  <div className="cart-summary-row">
                    <span className="row-label">Subtotal</span>
                    <span className="row-value">₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="cart-summary-row discount">
                      <span className="row-label">Coupon Discount ({appliedCoupon.code})</span>
                      <span className="row-value">-₹{couponDiscount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                  )}
                  <div className="cart-summary-row">
                    <span className="row-label">GST (18%)</span>
                    <span className="row-value">₹{gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="cart-summary-row">
                    <span className="row-label">Delivery</span>
                    <span className="row-value free">Free</span>
                  </div>
                  <div className="cart-summary-row total">
                    <span className="row-label">Total</span>
                    <span className="row-value">₹{grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <div className="cart-actions-card">
                <div className="coupon-section">
                  <h3>Apply Coupon</h3>
                  <div className="coupon-form">
                    <input
                      type="text"
                      className="coupon-input"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <button type="button" className="btn btn-secondary" onClick={removeCoupon}>Remove</button>
                    ) : (
                      <button type="button" className="btn btn-primary" onClick={applyCoupon}>Apply</button>
                    )}
                  </div>
                  {couponMessage && (
                    <div className={`coupon-message ${couponMessageType === 'success' ? 'coupon-success' : couponMessageType === 'error' ? 'coupon-error' : 'coupon-info'}`}>
                      {couponMessage}
                    </div>
                  )}
                </div>

                <div className="address-section">
                  <h3>Delivery Address</h3>
                  {addressError && <p className="address-error">{addressError}</p>}
                  <div className="address-form">
                    <div className="address-row">
                      <label className="address-field">
                        <span>Full Name <em>*</em></span>
                        <input
                          type="text"
                          value={addressFullName}
                          onChange={(e) => setAddressFullName(e.target.value)}
                          placeholder="Enter full name"
                        />
                      </label>
                      <label className="address-field">
                        <span>Phone Number <em>*</em></span>
                        <input
                          type="tel"
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                          placeholder="10-digit mobile number"
                          maxLength="10"
                        />
                      </label>
                    </div>
                     <label className="address-field full-width">
                       <span>Address Line 1 <em>*</em></span>
                       <input
                         type="text"
                         value={addressLine1}
                         onChange={(e) => setAddressLine1(e.target.value)}
                         placeholder="House no., Street, Area"
                       />
                     </label>
                     <label className="address-field full-width">
                       <span>Address Line 2</span>
                       <input
                         type="text"
                         value={addressLine2}
                         onChange={(e) => setAddressLine2(e.target.value)}
                         placeholder="Landmark (optional)"
                       />
                     </label>
                     <div className="address-row">
                       <label className="address-field">
                         <span>City <em>*</em></span>
                         <input
                           type="text"
                           value={city}
                           onChange={(e) => setCity(e.target.value)}
                           placeholder="City"
                         />
                       </label>
                       <label className="address-field">
                         <span>State <em>*</em></span>
                         <input
                           type="text"
                           value={stateRegion}
                           onChange={(e) => setStateRegion(e.target.value)}
                           placeholder="State"
                         />
                       </label>
                     </div>
                     <label className="address-field full-width">
                       <span>Pincode <em>*</em></span>
                       <input
                         type="text"
                         value={pincode}
                         onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                         placeholder="6-digit pincode"
                         maxLength="6"
                       />
                     </label>
                    </div>
                  </div>
                </div>
              </div>
             )}
             {addressConfirmed && (
              <p className="address-confirmed-msg">Address confirmed</p>
            )}

            <div className="payment-section">
              <h3>Choose Payment</h3>
              <div className="payment-options">
                <label className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => {
                      resetPaymentFields();
                      setPaymentMethod('cod');
                    }}
                  />
                  Cash on Delivery
                </label>
                <label className={`payment-option ${paymentMethod === 'card' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={() => {
                      resetPaymentFields();
                      setPaymentMethod('card');
                      setShowCardModal(true);
                    }}
                  />
                  Debit / Credit Card
                </label>
                <label className={`payment-option ${paymentMethod === 'upi' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="upi"
                    checked={paymentMethod === 'upi'}
                    onChange={() => {
                      resetPaymentFields();
                      setPaymentMethod('upi');
                      setShowUpiModal(true);
                    }}
                  />
                  UPI
                </label>
                <label className={`payment-option ${paymentMethod === 'razorpay' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={() => {
                      resetPaymentFields();
                      setPaymentMethod('razorpay');
                    }}
                  />
                  Razorpay (Card/UPI/Wallet)
                </label>
              </div>

              <button className="btn btn-primary checkout-btn" onClick={handleCheckout}>
                Proceed to Pay
              </button>
              {checkoutMessage && (
                <div className={`checkout-message ${checkoutMessageType === 'success' ? 'checkout-success' : checkoutMessageType === 'error' ? 'checkout-error' : 'checkout-info'}`}>
                  {checkoutMessage}
                </div>
              )}
              {paymentError && <p className="checkout-error">{paymentError}</p>}
              {orderStatus && (
                <div className="order-status-card">
                  <h4>Order Status</h4>
                  <p><strong>Status:</strong> {orderStatus.status}</p>
                  <p><strong>Payment:</strong> {orderStatus.paymentMethod}</p>
                  <p><strong>Deliver to:</strong> {orderStatus.deliveryAddress}</p>
                  <p><strong>Delivery by:</strong> {orderStatus.deliveryDate}</p>
                  <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={() => navigate(`/receipt/${orderStatus.orderId}`)}>
                    View Receipt
                  </button>
                </div>
              )}
             </div>
           </React.Fragment>
         )}
         {showCardModal && (
      <div className="modal-overlay" onClick={() => setShowCardModal(false)}>
        <div className="modal-content modal-image" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Card Payment</h3>
                <button className="modal-close" onClick={() => setShowCardModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="upi-form">
                  <label className="upi-field">
                    <span>Name on Card</span>
                    <input
                      type="text"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                      placeholder="Enter cardholder name"
                    />
                  </label>
                  <label className="upi-field">
                    <span>Card Number</span>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
                      placeholder="1234 5678 9012 3456"
                      maxLength="16"
                    />
                  </label>
                  <label className="upi-field">
                    <span>Expiry Date (MM/YY)</span>
                    <input
                      type="text"
                      value={expiryDate}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        }
                        setExpiryDate(val);
                      }}
                      placeholder="MM/YY"
                      maxLength="5"
                    />
                  </label>
                  <label className="upi-field">
                    <span>Bank Name</span>
                    <input
                      type="text"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="Enter bank name"
                    />
                  </label>
                  <div className="card-nickname-section">
                    <span className="nickname-label">Nickname for Card</span>
                    <div className="nickname-options">
                      <label className="nickname-option">
                        <input
                          type="radio"
                          name="nickname"
                          value="Personal"
                          checked={cardNickname === 'Personal'}
                          onChange={(e) => setCardNickname(e.target.value)}
                        />
                        Personal
                      </label>
                      <label className="nickname-option">
                        <input
                          type="radio"
                          name="nickname"
                          value="Business"
                          checked={cardNickname === 'Business'}
                          onChange={(e) => setCardNickname(e.target.value)}
                        />
                        Business
                      </label>
                      <label className="nickname-option">
                        <input
                          type="radio"
                          name="nickname"
                          value="Other"
                          checked={cardNickname === 'Other'}
                          onChange={(e) => setCardNickname(e.target.value)}
                        />
                        Other
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowCardModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { setShowCardModal(false); handleCheckout(); }}>Pay Now</button>
              </div>
            </div>
          </div>
        )}
        {showUpiModal && (
          <div className="modal-overlay" onClick={() => setShowUpiModal(false)}>
            <div className="modal-content modal-image" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>UPI Payment</h3>
                <button className="modal-close" onClick={() => setShowUpiModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="upi-form">
                  <label className="upi-field">
                    <span>UPI ID</span>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="your name@upi"
                    />
                  </label>
                  <label className="upi-field">
                    <span>UPI Password</span>
                    <input
                      type="password"
                      value={upiPassword}
                      onChange={(e) => setUpiPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUpiModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={() => { setShowUpiModal(false); handleCheckout(); }}>Pay Now</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

function App() {
  const [authLoading, setAuthLoading] = React.useState(true);
  const isAdminRoute = window.location.pathname.startsWith('/admin');

  const getIsAdmin = () => {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return false;
      const user = JSON.parse(userStr);
      return user.role === 'admin' || user.role === 'ADMIN';
    } catch {
      return false;
    }
  };

  React.useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        clearCart();
        setAuthLoading(false);
        return;
      }
      try {
        await authAPI.validateToken();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        clearCart();
      } finally {
        setAuthLoading(false);
      }
    };
    validateSession();
  }, []);

  const AdminRoute = ({ children }) => {
    const token = localStorage.getItem('token');
    if (!token || !getIsAdmin()) {
      return <Navigate to="/admin/login" replace />;
    }
    return children;
  };

  const isAuthenticated = !!localStorage.getItem('token');

  if (authLoading) {
    return (
      <div className="app">
        <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
          <div className="admin-spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </main>
      </div>
    );
  }

  return (
    <div className="app">
      {!isAdminRoute && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={isAuthenticated ? <CartPage /> : <Navigate to="/login" />} />
          <Route path="/checkout" element={isAuthenticated ? <CheckoutPage /> : <Navigate to="/login" />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route
            path="/change-password"
            element={isAuthenticated ? <ChangePassword /> : <Navigate to="/login" />}
          />

          <Route path="/customer/orders" element={isAuthenticated ? <CustomerOrders /> : <Navigate to="/login" />} />
          <Route path="/wishlist" element={isAuthenticated ? <WishlistPage /> : <Navigate to="/login" />} />
          <Route path="/receipt/:orderId" element={isAuthenticated ? <Receipt /> : <Navigate to="/login" />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="users" element={<Users />} />
            <Route path="orders" element={<Orders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="inventory" element={<Inventory />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="coupons" element={<Coupons />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="settings" element={<Settings />} />
            <Route path="notifications" element={<AdminNotifications />} />
          </Route>
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
