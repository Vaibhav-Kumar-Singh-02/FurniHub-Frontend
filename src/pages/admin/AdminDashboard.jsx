import React, { useState, useEffect } from 'react';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiAlertTriangle, FiTrendingUp } from 'react-icons/fi';
import { dashboardAPI } from '../../services/adminAPI';
import '../../styles/Admin.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        date: d.toISOString().split('T')[0],
        label: d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }),
      });
    }
    return days;
  };

  const last7Days = getLast7Days();
  const revenueMap = {};
  (revenueData || []).forEach(item => {
    revenueMap[item.date] = Number(item.revenue || 0);
  });
  const chartData = last7Days.map(day => ({
    ...day,
    revenue: revenueMap[day.date] || 0,
  }));
  const maxRevenue = Math.max(...chartData.map(d => d.revenue), 1);
  // eslint-disable-next-line no-unused-vars

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const statsRes = await dashboardAPI.getStats();
      const statsData = statsRes.data?.stats || statsRes.data || {};
      setStats(statsData);
      setRecentOrders(statsData.recentOrders || []);
      setRecentCustomers(statsData.recentCustomers || []);
      setRevenueData(statsData.revenueByDay || []);
    } catch (err) {
      setError('Failed to load dashboard data');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: FiDollarSign, color: 'revenue', trend: '+12%' },
    { label: 'Total Orders', value: stats.totalOrders || 0, icon: FiShoppingBag, color: 'orders', trend: '+8%' },
    { label: 'Total Customers', value: stats.totalCustomers || 0, icon: FiUsers, color: 'customers', trend: '+5%' },
    { label: 'Total Products', value: stats.totalProducts || 0, icon: FiBox, color: 'products', trend: '+3%' },
    { label: 'Low Stock', value: stats.lowStockProducts || 0, icon: FiAlertTriangle, color: 'lowstock', trend: 'Needs attention' },
  ];

  return (
    <div>
      <div className="admin-card-header">
        <div>
          <h1 className="admin-card-title" style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem' }}>Dashboard</h1>
          <p className="admin-card-subtitle">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="admin-btn admin-btn-secondary" onClick={loadDashboard}>
          <FiTrendingUp /> Refresh
        </button>
      </div>

      {error && <div className="admin-message error">{error}</div>}

      <div className="admin-kpi-grid">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="admin-kpi-card">
            <div className={`admin-kpi-icon ${kpi.color}`}>
              <kpi.icon />
            </div>
            <div className="admin-kpi-info">
              <div className="admin-kpi-label">{kpi.label}</div>
              <div className="admin-kpi-value">{kpi.value}</div>
              <div className={`admin-kpi-trend ${kpi.trend?.startsWith('+') ? 'up' : ''}`}>
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-grid-2" style={{ marginBottom: 24 }}>
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Revenue Overview</h3>
              <p className="admin-card-subtitle">Last 7 days performance</p>
            </div>
          </div>
          {chartData.length > 0 && chartData.some(d => d.revenue > 0) ? (
            <div className="admin-bar-chart">
              {chartData.map((item, idx) => {
                const heightPercent = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="admin-bar-chart-item">
                    <div className="admin-bar-value">{formatCurrency(item.revenue).replace('₹', '')}</div>
                    <div className="admin-bar" style={{ height: `${Math.max(heightPercent, 2)}%` }} />
                    <div className="admin-bar-label">{item.label}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📊</div>
              <div className="admin-empty-title">No revenue data</div>
              <div className="admin-empty-desc">Revenue data will appear here once orders are placed.</div>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Orders</h3>
              <p className="admin-card-subtitle">Latest 5 orders</p>
            </div>
          </div>
          {recentOrders.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.orderId}>
                      <td>#{order.orderId?.slice(0, 8)}</td>
                      <td>{order.userFullName || 'N/A'}</td>
                      <td>{formatCurrency(order.totalAmount)}</td>
                      <td>
                        <span className={`admin-badge-status ${(order.status || '').toLowerCase()}`}>
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">📦</div>
              <div className="admin-empty-title">No orders yet</div>
              <div className="admin-empty-desc">Orders will appear here once customers place them.</div>
            </div>
          )}
        </div>
      </div>

      <div className="admin-grid-2">
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Recent Customers</h3>
              <p className="admin-card-subtitle">Latest registrations</p>
            </div>
          </div>
          {recentCustomers.length > 0 ? (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {recentCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>{customer.fullName || customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-IN') : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="admin-empty">
              <div className="admin-empty-icon">👥</div>
              <div className="admin-empty-title">No customers yet</div>
              <div className="admin-empty-desc">New customers will appear here.</div>
            </div>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">Order Statistics</h3>
              <p className="admin-card-subtitle">Orders by status</p>
            </div>
          </div>
          <div className="admin-bar-list">
            {stats.orderStats ? (
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
                <div className="admin-empty-icon">📈</div>
                <div className="admin-empty-title">No statistics</div>
                <div className="admin-empty-desc">Order statistics will appear here.</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
