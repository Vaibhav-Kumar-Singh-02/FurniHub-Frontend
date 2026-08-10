import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiSave, FiX } from 'react-icons/fi';
import { settingsAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState({ fullName: '', email: '', mobile: '' });
  const [profileErrors, setProfileErrors] = useState({});

  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordErrors, setPasswordErrors] = useState({});

  const [appSettings, setAppSettings] = useState({ siteName: '', siteDescription: '', supportEmail: '', currency: 'INR' });
  const [appSettingsErrors, setAppSettingsErrors] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        setProfile({
          fullName: user.fullName || '',
          email: user.email || '',
          mobile: user.mobile || '',
        });
      }
      const appRes = await settingsAPI.getAppSettings().catch(() => ({ data: {} }));
      if (appRes.data) {
        setAppSettings({
          siteName: appRes.data.siteName || 'FurniHub',
          siteDescription: appRes.data.siteDescription || '',
          supportEmail: appRes.data.supportEmail || '',
          currency: appRes.data.currency || 'INR',
        });
      }
    } catch {}
    setLoading(false);
  };

  const validateProfile = () => {
    const errors = {};
    if (!profile.fullName.trim()) errors.fullName = 'Name is required';
    if (!profile.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errors.email = 'Valid email is required';
    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    try {
      await settingsAPI.updateProfile(profile);
      setSuccess('Profile updated successfully');
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        user.fullName = profile.fullName;
        user.email = profile.email;
        user.mobile = profile.mobile;
        localStorage.setItem('user', JSON.stringify(user));
      }
    } catch {
      setError('Failed to update profile');
    }
  };

  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) errors.currentPassword = 'Current password is required';
    if (!passwordForm.newPassword) errors.newPassword = 'New password is required';
    else if (passwordForm.newPassword.length < 6) errors.newPassword = 'Password must be at least 6 characters';
    if (passwordForm.newPassword !== passwordForm.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    try {
      await settingsAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setSuccess('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      setError('Failed to change password');
    }
  };

  const validateAppSettings = () => {
    const errors = {};
    if (!appSettings.siteName.trim()) errors.siteName = 'Site name is required';
    if (!appSettings.supportEmail.trim()) errors.supportEmail = 'Support email is required';
    setAppSettingsErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAppSettingsUpdate = async (e) => {
    e.preventDefault();
    if (!validateAppSettings()) return;
    try {
      await settingsAPI.updateAppSettings(appSettings);
      setSuccess('Application settings updated');
    } catch {
      setError('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Settings</h1>
          <p className="admin-card-subtitle">Manage admin profile and application settings</p>
        </div>
      </div>

      {error && <div className="admin-message error">{error}</div>}
      {success && <div className="admin-message success">{success}</div>}

      <div className="admin-tabs" style={{ maxWidth: 500 }}>
        {[
          { key: 'profile', label: 'Profile', icon: FiUser },
          { key: 'password', label: 'Password', icon: FiLock },
          { key: 'app', label: 'Application', icon: FiSave },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`admin-tab ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
          >
            <tab.icon style={{ marginRight: 6 }} /> {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <div className="admin-tab-content">
          <div className="admin-card" style={{ maxWidth: 600 }}>
            <form onSubmit={handleProfileUpdate}>
              <div className="admin-modal-body">
                <h3 className="admin-card-title" style={{ marginBottom: 16 }}>Admin Profile</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Full Name *</label>
                  <input className={`admin-form-input ${profileErrors.fullName ? 'error' : ''}`} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
                  {profileErrors.fullName && <div className="admin-form-error">{profileErrors.fullName}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Email *</label>
                  <input className={`admin-form-input ${profileErrors.email ? 'error' : ''}`} type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
                  {profileErrors.email && <div className="admin-form-error">{profileErrors.email}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Mobile</label>
                  <input className="admin-form-input" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} />
                </div>
              </div>
              <div className="admin-modal-footer" style={{ borderTop: '1px solid var(--admin-border)', padding: '16px 24px' }}>
                <button type="submit" className="admin-btn admin-btn-primary"><FiSave /> Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'password' && (
        <div className="admin-tab-content">
          <div className="admin-card" style={{ maxWidth: 600 }}>
            <form onSubmit={handlePasswordChange}>
              <div className="admin-modal-body">
                <h3 className="admin-card-title" style={{ marginBottom: 16 }}>Change Password</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Current Password *</label>
                  <input className={`admin-form-input ${passwordErrors.currentPassword ? 'error' : ''}`} type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
                  {passwordErrors.currentPassword && <div className="admin-form-error">{passwordErrors.currentPassword}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">New Password *</label>
                  <input className={`admin-form-input ${passwordErrors.newPassword ? 'error' : ''}`} type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
                  {passwordErrors.newPassword && <div className="admin-form-error">{passwordErrors.newPassword}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Confirm New Password *</label>
                  <input className={`admin-form-input ${passwordErrors.confirmPassword ? 'error' : ''}`} type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} />
                  {passwordErrors.confirmPassword && <div className="admin-form-error">{passwordErrors.confirmPassword}</div>}
                </div>
              </div>
              <div className="admin-modal-footer" style={{ borderTop: '1px solid var(--admin-border)', padding: '16px 24px' }}>
                <button type="submit" className="admin-btn admin-btn-primary"><FiLock /> Change Password</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === 'app' && (
        <div className="admin-tab-content">
          <div className="admin-card" style={{ maxWidth: 600 }}>
            <form onSubmit={handleAppSettingsUpdate}>
              <div className="admin-modal-body">
                <h3 className="admin-card-title" style={{ marginBottom: 16 }}>Application Settings</h3>
                <div className="admin-form-group">
                  <label className="admin-form-label">Site Name *</label>
                  <input className={`admin-form-input ${appSettingsErrors.siteName ? 'error' : ''}`} value={appSettings.siteName} onChange={(e) => setAppSettings({ ...appSettings, siteName: e.target.value })} />
                  {appSettingsErrors.siteName && <div className="admin-form-error">{appSettingsErrors.siteName}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Site Description</label>
                  <input className="admin-form-input" value={appSettings.siteDescription} onChange={(e) => setAppSettings({ ...appSettings, siteDescription: e.target.value })} />
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Support Email *</label>
                  <input className={`admin-form-input ${appSettingsErrors.supportEmail ? 'error' : ''}`} type="email" value={appSettings.supportEmail} onChange={(e) => setAppSettings({ ...appSettings, supportEmail: e.target.value })} />
                  {appSettingsErrors.supportEmail && <div className="admin-form-error">{appSettingsErrors.supportEmail}</div>}
                </div>
                <div className="admin-form-group">
                  <label className="admin-form-label">Currency</label>
                  <select className="admin-form-select" value={appSettings.currency} onChange={(e) => setAppSettings({ ...appSettings, currency: e.target.value })}>
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer" style={{ borderTop: '1px solid var(--admin-border)', padding: '16px 24px' }}>
                <button type="submit" className="admin-btn admin-btn-primary"><FiSave /> Save Settings</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
