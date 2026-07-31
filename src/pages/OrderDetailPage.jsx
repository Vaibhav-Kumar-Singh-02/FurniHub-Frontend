import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getOrder } from '../services/api'
import { formatINR, formatDate } from '../utils/format'

export default function OrderDetailPage() {
  const { id } = useParams()
  const { token } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    getOrder(id, token)
      .then((data) => {
        if (active) setOrder(data)
      })
      .catch(() => {
        if (active) setError('Order not found.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, token])

  if (loading) return <div className="container section">Loading order…</div>

  if (error || !order) {
    return (
      <div className="container section">
        <p className="alert alert--error">{error}</p>
        <Link to="/orders" className="btn btn--ghost">
          Back to orders
        </Link>
      </div>
    )
  }

  return (
    <div className="container section">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/orders">Orders</Link> / <span>{order.orderNumber}</span>
      </nav>

      <div className="order-detail">
        <div className="order-detail__header">
          <h1 className="page-title">{order.orderNumber}</h1>
          <span className={`status status--${order.status.toLowerCase()}`}>{order.status}</span>
          <p className="order-detail__date">Placed on {formatDate(order.orderDate)}</p>
        </div>

        <div className="order-detail__grid">
          <div className="order-detail__shipping">
            <h2 className="order-detail__title">Shipping to</h2>
            <p>{order.shippingAddress}</p>
            <p>
              {order.shippingCity}
              {order.shippingState ? `, ${order.shippingState}` : ''} {order.shippingZip}
            </p>
            <p>{order.shippingCountry}</p>
          </div>

          <div className="order-detail__items">
            <h2 className="order-detail__title">Items</h2>
            {order.items.map((item) => (
              <div className="order-line" key={item.id}>
                <div>
                  <Link to={`/products/${item.productId}`} className="order-line__name">
                    {item.productName}
                  </Link>
                  <p className="order-line__meta">
                    {formatINR(item.unitPrice)} × {item.quantity}
                  </p>
                </div>
                <span>{formatINR(item.totalPrice)}</span>
              </div>
            ))}
            <div className="order-detail__total">
              <span>Total</span>
              <span>{formatINR(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
