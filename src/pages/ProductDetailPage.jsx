import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getProduct } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { formatINR } from '../utils/format'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { addItem } = useCart()

  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    getProduct(id)
      .then((data) => {
        if (!active) return
        setProduct(data)
        setActiveImage(data.images?.[0]?.imageUrl || '')
      })
      .catch(() => {
        if (active) setError('Product not found.')
      })      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id])

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/products/${id}` } })
      return
    }
    setAdding(true)
    try {
      await addItem(product.id, quantity)
      setAdded(true)
      setTimeout(() => setAdded(false), 2000)
    } catch {
      setError('Could not add to cart. Please try again.')
    } finally {
      setAdding(false)
    }
  }

  if (loading) return <div className="container section">Loading product…</div>

  if (error || !product) {
    return (
      <div className="container section">
        <p className="alert alert--error">{error}</p>
        <Link to="/products" className="btn btn--ghost">
          Back to shop
        </Link>
      </div>
    )
  }

  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined

  return (
    <div className="container section">
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/products">Shop</Link> / <span>{product.name}</span>
      </nav>

      <div className="product-detail">
        <div className="product-detail__gallery">
          {activeImage ? (
            <img className="product-detail__main" src={activeImage} alt={product.name} />
          ) : (
            <div className="product-detail__placeholder">FurniHub</div>
          )}
          {product.images?.length > 1 && (
            <div className="product-detail__thumbs">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  className={`thumb${img.imageUrl === activeImage ? ' thumb--active' : ''}`}
                  onClick={() => setActiveImage(img.imageUrl)}
                >
                  <img src={img.imageUrl} alt={`${product.name} view`} />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <p className="product-detail__category">{product.categoryName}</p>
          <h1 className="product-detail__name">{product.name}</h1>
          <p className="product-detail__sku">SKU: {product.sku}</p>

          <div className="product-detail__price">
            {hasDiscount ? (
              <>
                <span className="product-card__price--now">{formatINR(product.discountPrice)}</span>
                <span className="product-card__price--was">{formatINR(product.price)}</span>
              </>
            ) : (
              <span className="product-card__price--now">{formatINR(product.price)}</span>
            )}
          </div>

          <p className="product-detail__stock">
            {product.stockQuantity > 0 ? `In stock (${product.stockQuantity} available)` : 'Out of stock'}
          </p>

          <p className="product-detail__desc">{product.description}</p>

          {error && <p className="alert alert--error">{error}</p>}
          {added && <p className="alert alert--success">Added to cart!</p>}

          <div className="product-detail__actions">
            <label htmlFor="qty" className="sr-only">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="qty-input"
            />
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleAddToCart}
              disabled={adding || product.stockQuantity === 0}
            >
              {adding ? 'Adding…' : 'Add to cart'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
