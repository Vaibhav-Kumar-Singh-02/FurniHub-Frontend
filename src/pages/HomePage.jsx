import { Link } from 'react-router-dom'

const CATEGORIES = [
  { id: 1, name: 'Sofas' },
  { id: 2, name: 'Chairs' },
  { id: 3, name: 'Tables' },
]

export default function HomePage() {
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
        <div className="category-grid">
          {CATEGORIES.map((cat) => (
            <Link key={cat.id} to={`/products?category=${cat.id}`} className="category-card">
              <span className="category-card__name">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
