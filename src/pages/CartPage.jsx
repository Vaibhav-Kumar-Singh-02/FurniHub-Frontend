import { Link } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/format'

export default function CartPage() {
  const { cart, loading, updateItem, removeItem } = useCart()

  if (loading) {
    return <div className="container section">Loading cart…</div>
  }

  if (cart.items.length === 0) {
    return (
      <div className="container section">
        <h1 className="page-title">Your cart</h1>
        <p className="empty-state">Your cart is empty.</p>
        <Link to="/products" className="btn btn--primary">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container section">
      <h1 className="page-title">Your cart</h1>

      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div className="cart-item" key={item.id}>
              <div className="cart-item__image">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.productName} />
                ) : (
                  <span>FurniHub</span>
                )}
              </div>
              <div className="cart-item__info">
                <Link to={`/products/${item.productId}`} className="cart-item__name">
                  {item.productName}
                </Link>
                <p className="cart-item__sku">{item.productSku}</p>
                <p className="cart-item__unit">{formatINR(item.unitPrice)} each</p>

                <div className="cart-item__controls">
                  <label htmlFor={`qty-${item.id}`} className="sr-only">
                    Quantity for {item.productName}
                  </label>
                  <input
                    id={`qty-${item.id}`}
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => {
                      const qty = Number(e.target.value)
                      if (qty >= 1) updateItem(item.id, qty)
                    }}
                    className="qty-input"
                  />
                  <button
                    type="button"
                    className="btn btn--danger-ghost"
                    onClick={() => removeItem(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="cart-item__total">{formatINR(item.lineTotal)}</div>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <h2 className="cart-summary__title">Order summary</h2>
          <div className="cart-summary__row">
            <span>Items ({cart.totalItems})</span>
            <span>{formatINR(cart.totalAmount)}</span>
          </div>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>{formatINR(cart.totalAmount)}</span>
          </div>
          <Link to="/checkout" className="btn btn--primary btn--block">
            Proceed to checkout
          </Link>
        </aside>
      </div>
    </div>
  )
}
