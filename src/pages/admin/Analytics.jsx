import React, { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiShoppingBag, FiStar } from 'react-icons/fi';
import { dashboardAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const Analytics = () => {
  const [period, setPeriod] = useState('monthly');
  const [stats, setStats] = useState(null);
  const [bestProducts, setBestProducts] = useState([]);
  const [bestCategories, setBestCategories] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const [statsRes, productsRes, categoriesRes, customersRes] = await Promise.all([
        dashboardAPI.getRevenue({ period }),
        dashboardAPI.getBestSellingProducts({ period }),
        dashboardAPI.getBestSellingCategories({ period }),
        dashboardAPI.getTopCustomers({ period }),
      ]);
      setStats(statsRes.data?.stats || statsRes.data || {});
      setBestProducts(productsRes.data?.products || productsRes.data || []);
      setBestCategories(categoriesRes.data?.categories || categoriesRes.data || []);
      setTopCustomers(customersRes.data?.customers || customersRes.data || []);
    } catch {
      setError('Failed to load analytics');
    }
    setLoading(false);
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Analytics</h1>
          <p className="admin-card-subtitle">Sales performance and insights</p>
        </div>
      </div>

      {error && <div className="admin-message error">{error}</div>}

      <div className="admin-tabs" style={{ maxWidth: 500 }}>
        {['daily', 'monthly', 'yearly', 'overall'].map((p) => (
          <button
            key={p}
            className={`admin-tab ${period === p ? 'active' : ''}`}
            onClick={() => setPeriod(p)}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="admin-loading"><div className="admin-spinner" /><span>Loading analytics...</span></div>
      ) : (
        <div className="admin-grid-2">
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiTrendingUp style={{ color: 'var(--admin-primary)' }} /> Revenue
                </h3>
                <p className="admin-card-subtitle">{period.charAt(0).toUpperCase() + period.slice(1)} revenue</p>
              </div>
            </div>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--admin-primary)', fontFamily: 'var(--font-heading)' }}>
              {formatCurrency(stats.revenue || stats.totalRevenue || 0)}
            </div>
            <div style={{ marginTop: 8, color: 'var(--admin-text-light)', fontSize: '0.9rem' }}>
              {stats.totalOrders || 0} orders • {stats.averageOrderValue ? formatCurrency(stats.averageOrderValue) : 'N/A'} avg. order value
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiShoppingBag style={{ color: 'var(--admin-info)' }} /> Order Statistics
                </h3>
                <p className="admin-card-subtitle">Orders breakdown</p>
              </div>
            </div>
            <div className="admin-bar-list">
              {stats.orderStats && Object.keys(stats.orderStats).length > 0 ? (
                Object.entries(stats.orderStats).map(([status, count]) => (
                  <div key={status} className="admin-bar-list-item">
                    <span className="admin-bar-list-label" style={{ textTransform: 'capitalize' }}>{status}</span>
                    <div className="admin-bar-list-bar">
                      <div className="admin-bar-list-fill" style={{ width: `${Math.min((Number(count) / (stats.totalOrders || 1)) * 100, 100)}%` }} />
                    </div>
                    <span className="admin-bar-list-value">{count}</span>
                  </div>
                ))
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-title">No order data</div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiStar style={{ color: 'var(--admin-warning)' }} /> Best Selling Products
                </h3>
                <p className="admin-card-subtitle">Top products by sales</p>
              </div>
            </div>
            <div className="admin-bar-list">
              {bestProducts.length > 0 ? (
                bestProducts.slice(0, 5).map((product, idx) => (
                  <div key={product.id || idx} className="admin-bar-list-item">
                    <span className="admin-bar-list-label">{product.name || product.productName}</span>
                    <div className="admin-bar-list-bar">
                      <div className="admin-bar-list-fill" style={{ width: `${Math.max((product.unitsSold || product.sales || 0) / (bestProducts[0]?.unitsSold || bestProducts[0]?.sales || 1) * 100, 5)}%` }} />
                    </div>
                    <span className="admin-bar-list-value">{product.unitsSold || product.sales || 0}</span>
                  </div>
                ))
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-title">No data</div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiUsers style={{ color: 'var(--admin-success)' }} /> Top Customers
                </h3>
                <p className="admin-card-subtitle">Customers by order value</p>
              </div>
            </div>
            <div className="admin-bar-list">
              {topCustomers.length > 0 ? (
                topCustomers.slice(0, 5).map((customer, idx) => (
                  <div key={customer.id || idx} className="admin-bar-list-item">
                    <span className="admin-bar-list-label">{customer.fullName || customer.name || customer.email}</span>
                    <div className="admin-bar-list-bar">
                      <div className="admin-bar-list-fill" style={{ width: `${Math.max((customer.totalSpent || customer.orderValue || 0) / (topCustomers[0]?.totalSpent || topCustomers[0]?.orderValue || 1) * 100, 5)}%` }} />
                    </div>
                    <span className="admin-bar-list-value">{formatCurrency(customer.totalSpent || customer.orderValue || 0)}</span>
                  </div>
                ))
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-title">No data</div>
                </div>
              )}
            </div>
          </div>

          <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiShoppingBag style={{ color: 'var(--accent)' }} /> Best Selling Categories
                </h3>
                <p className="admin-card-subtitle">Categories ranked by sales volume</p>
              </div>
            </div>
            <div className="admin-bar-list">
              {bestCategories.length > 0 ? (
                bestCategories.slice(0, 8).map((cat, idx) => (
                  <div key={cat.id || cat.categoryId || idx} className="admin-bar-list-item">
                    <span className="admin-bar-list-label">{cat.name || cat.categoryName}</span>
                    <div className="admin-bar-list-bar">
                      <div className="admin-bar-list-fill" style={{ width: `${Math.max((cat.sales || cat.unitsSold || 0) / (bestCategories[0]?.sales || bestCategories[0]?.unitsSold || 1) * 100, 5)}%` }} />
                    </div>
                    <span className="admin-bar-list-value">{cat.sales || cat.unitsSold || 0}</span>
                  </div>
                ))
              ) : (
                <div className="admin-empty">
                  <div className="admin-empty-title">No data</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
