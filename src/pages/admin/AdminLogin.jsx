import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight, FiActivity } from 'react-icons/fi';
import { authAPI, adminAPI } from '../../services/api';
import '../../styles/AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    emailOrMobile: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.emailOrMobile.trim()) {
      newErrors.emailOrMobile = 'Email or Mobile number is required';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await adminAPI.login({
        emailOrMobile: formData.emailOrMobile,
        password: formData.password,
      });

      if (response.data.success) {
        const role = response.data.role;
        if (role !== 'ADMIN' && role !== 'admin') {
          setMessage({ type: 'error', text: 'Access denied. Admin privileges required.' });
          setLoading(false);
          return;
        }

        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          fullName: response.data.fullName,
          userId: response.data.userId,
          role: response.data.role,
          email: formData.emailOrMobile,
        }));

        setMessage({ type: 'success', text: 'Authentication successful. Redirecting...' });
        setTimeout(() => navigate('/admin'), 800);
      } else {
        setMessage({ type: 'error', text: response.data.message });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid credentials or access denied';
      setMessage({ type: 'error', text: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-bg">
        <div className="admin-login-particles">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`
            }} />
          ))}
        </div>
        <div className="admin-login-grid-overlay" />
      </div>

      <div className="admin-login-container">
        <div className="admin-login-left">
          <div className="admin-login-brand">
            <div className="admin-login-logo">
              <FiShield className="logo-icon" />
              <span className="logo-text">FurniHub</span>
              <span className="logo-badge">ADMIN</span>
            </div>
            <div className="admin-login-tagline">
              <h1>Command Center</h1>
              <p>Secure administrative access to the FurniHub platform</p>
            </div>
          </div>

          <div className="admin-login-stats">
            <div className="stat-card">
              <FiActivity className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>
            <div className="stat-card">
              <FiShield className="stat-icon" />
              <div className="stat-info">
                <span className="stat-value">256-bit</span>
                <span className="stat-label">Encryption</span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-login-right">
          <div className="admin-login-card">
            <div className="admin-login-card-header">
              <div className="admin-login-icon-wrapper">
                <FiShield className="admin-login-icon" />
              </div>
              <h2>Admin Portal</h2>
              <p>Enter your credentials to access the admin dashboard</p>
            </div>

            {message.text && (
              <div className={`admin-message admin-message-${message.type}`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="admin-login-form">
              <div className="admin-form-group">
                <label htmlFor="emailOrMobile">Email Address or Mobile Number</label>
                <div className={`admin-input-wrapper ${errors.emailOrMobile ? 'error' : ''}`}>
                  <FiMail className="admin-input-icon" />
                  <input
                    type="text"
                    id="emailOrMobile"
                    name="emailOrMobile"
                    placeholder="admin@furnihub.com"
                    value={formData.emailOrMobile}
                    onChange={handleChange}
                    autoComplete="email"
                  />
                </div>
                {errors.emailOrMobile && <span className="admin-error-text">{errors.emailOrMobile}</span>}
              </div>

              <div className="admin-form-group">
                <label htmlFor="password">Password</label>
                <div className={`admin-input-wrapper ${errors.password ? 'error' : ''}`}>
                  <FiLock className="admin-input-icon" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Enter your secure password"
                    value={formData.password}
                    onChange={handleChange}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="admin-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {errors.password && <span className="admin-error-text">{errors.password}</span>}
              </div>

              <div className="admin-form-options">
                <label className="admin-remember-me">
                  <input type="checkbox" />
                  <span className="checkmark"></span>
                  Remember this device
                </label>
                <Link to="/forgot-password" className="admin-forgot-link">Forgot password?</Link>
              </div>

              <button type="submit" className="admin-btn-submit" disabled={loading}>
                {loading ? (
                  <span className="admin-spinner"></span>
                ) : (
                  <>
                    <span>Access Dashboard</span>
                    <FiArrowRight className="btn-icon" />
                  </>
                )}
              </button>
            </form>

            <div className="admin-login-footer">
              <div className="admin-security-badges">
                <span className="badge"><FiShield /> SSL Secured</span>
                <span className="badge"><FiLock /> Encrypted</span>
              </div>
              <p className="admin-copyright">FurniHub Admin Panel v2.0</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
