import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrders } from '../services/api'
import { formatINR, formatDate } from '../utils/format'

export default function OrdersPage() {
  const { token } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getOrders(token)
      .then((data) => {
        if (active) setOrders(data)
      })
      .catch(() => {
        if (active) setError('Unable to load your orders.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [token])

  if (loading) return <div className="container section">Loading orders…</div>

  return (
    <div className="container section">
      <h1 className="page-title">Your orders</h1>

      {error && <p className="alert alert--error">{error}</p>}

      {orders.length === 0 ? (
        <div>
          <p className="empty-state">You have not placed any orders yet.</p>
          <Link to="/products" className="btn btn--primary">
            Browse products
          </Link>
        </div>
      ) : (
        <div className="order-list">
          {orders.map((order) => (
            <Link to={`/orders/${order.id}`} key={order.id} className="order-card">
              <div className="order-card__head">
                <span className="order-card__number">{order.orderNumber}</span>
                <span className={`status status--${order.status.toLowerCase()}`}>{order.status}</span>
              </div>
              <div className="order-card__body">
                <span>{formatDate(order.orderDate)}</span>
                <span>
                  {order.items.length} item{order.items.length === 1 ? '' : 's'}
                </span>
                <span className="order-card__total">{formatINR(order.totalAmount)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
