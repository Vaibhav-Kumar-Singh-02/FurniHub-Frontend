import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { createOrder } from '../services/api'
import { formatINR } from '../utils/format'

const EMPTY_FORM = {
  shippingAddress: '',
  shippingCity: '',
  shippingState: '',
  shippingZip: '',
  shippingCountry: '',
}

export default function CheckoutPage() {
  const { token } = useAuth()
  const { cart, loadCart } = useCart()
  const navigate = useNavigate()

  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [placing, setPlacing] = useState(false)

  const validate = () => {
    const next = {}
    if (!form.shippingAddress.trim()) next.shippingAddress = 'Address is required'
    if (!form.shippingCity.trim()) next.shippingCity = 'City is required'
    if (!form.shippingCountry.trim()) next.shippingCountry = 'Country is required'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setPlacing(true)
    setFormError('')
    try {
      const order = await createOrder(form, token)
      await loadCart()
      navigate(`/orders/${order.id}`, { replace: true })
    } catch (err) {
      if (err.status === 400) setFormError(err.body?.message || 'Could not place the order.')
      else setFormError('Could not place the order. Please try again.')
    } finally {
      setPlacing(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="container section">
        <h1 className="page-title">Checkout</h1>
        <p className="empty-state">Your cart is empty — nothing to check out.</p>
        <Link to="/products" className="btn btn--primary">
          Go shopping
        </Link>
      </div>
    )
  }

  return (
    <div className="container section">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit} noValidate>
          {formError && <div className="alert alert--error">{formError}</div>}

          <div className="form-field">
            <label htmlFor="shippingAddress">Address</label>
            <textarea
              id="shippingAddress"
              name="shippingAddress"
              rows="3"
              value={form.shippingAddress}
              onChange={handleChange}
              aria-invalid={Boolean(errors.shippingAddress)}
            />
            {errors.shippingAddress && (
              <span className="form-field__error" role="alert">
                {errors.shippingAddress}
              </span>
            )}
          </div>

          <div className="form-grid">
            <div className="form-field">
              <label htmlFor="shippingCity">City</label>
              <input
                id="shippingCity"
                name="shippingCity"
                type="text"
                value={form.shippingCity}
                onChange={handleChange}
                aria-invalid={Boolean(errors.shippingCity)}
              />
              {errors.shippingCity && (
                <span className="form-field__error" role="alert">
                  {errors.shippingCity}
                </span>
              )}
            </div>

            <div className="form-field">
              <label htmlFor="shippingState">State</label>
              <input
                id="shippingState"
                name="shippingState"
                type="text"
                value={form.shippingState}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="shippingZip">ZIP / PIN code</label>
              <input
                id="shippingZip"
                name="shippingZip"
                type="text"
                value={form.shippingZip}
                onChange={handleChange}
              />
            </div>

            <div className="form-field">
              <label htmlFor="shippingCountry">Country</label>
              <input
                id="shippingCountry"
                name="shippingCountry"
                type="text"
                value={form.shippingCountry}
                onChange={handleChange}
                aria-invalid={Boolean(errors.shippingCountry)}
              />
              {errors.shippingCountry && (
                <span className="form-field__error" role="alert">
                  {errors.shippingCountry}
                </span>
              )}
            </div>
          </div>

          <button type="submit" className="btn btn--primary btn--block" disabled={placing}>
            {placing ? 'Placing order…' : `Place order · ${formatINR(cart.totalAmount)}`}
          </button>
        </form>

        <aside className="cart-summary">
          <h2 className="cart-summary__title">Items</h2>
          <ul className="cart-summary__list">
            {cart.items.map((item) => (
              <li key={item.id} className="cart-summary__line">
                <span>
                  {item.productName} × {item.quantity}
                </span>
                <span>{formatINR(item.lineTotal)}</span>
              </li>
            ))}
          </ul>
          <div className="cart-summary__row cart-summary__row--total">
            <span>Total</span>
            <span>{formatINR(cart.totalAmount)}</span>
          </div>
        </aside>
      </div>
    </div>
  )
}
