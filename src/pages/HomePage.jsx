import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCategories, getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'
import { formatINR } from '../utils/format'

export default function HomePage() {
  const [categories, setCategories] = useState([])
  const [featured, setFeatured] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getCategories(), getProducts({ page: 0, size: 4 })])
      .then(([cats, products]) => {
        if (!active) return
        setCategories(cats)
        setFeatured(products.content)
      })
      .catch(() => {
        if (active) setError('Unable to load the catalog right now.')
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <>
      <section className="hero">
        <div className="container hero__inner">
          <h1 className="hero__title">Beautiful furniture for every home</h1>
          <p className="hero__subtitle">
            Discover sofas, chairs, and tables crafted to bring comfort and style to your space.
          </p>
          <Link to="/products" className="btn btn--primary btn--lg">
            Shop the collection
          </Link>
        </div>
      </section>

      <section className="container section">
        <h2 className="section__title">Shop by category</h2>
        {loading ? (
          <p>Loading categories…</p>
        ) : error ? (
          <p className="alert alert--error">{error}</p>
        ) : (
          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card">
                <img src={cat.imageUrl} alt={cat.name} loading="lazy" />
                <span className="category-card__name">{cat.name}</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="container section">
        <div className="section__header">
          <h2 className="section__title">Featured pieces</h2>
          <Link to="/products" className="section__link">
            View all
          </Link>
        </div>
        {loading ? (
          <p>Loading products…</p>
        ) : error ? (
          <p className="alert alert--error">{error}</p>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      <section className="container section section--promo">
        <div className="promo-card">
          <h2 className="promo-card__title">Free delivery on orders over {formatINR(50000)}</h2>
          <p className="promo-card__text">Handcrafted quality, delivered to your doorstep.</p>
          <Link to="/products" className="btn btn--primary">
            Explore now
          </Link>
        </div>
      </section>
    </>
  )
}
