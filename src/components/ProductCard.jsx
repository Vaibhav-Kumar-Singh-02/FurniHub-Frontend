import { Link } from 'react-router-dom'
import { formatINR } from '../utils/format'

export default function ProductCard({ product }) {
  const hasDiscount = product.discountPrice !== null && product.discountPrice !== undefined
  return (
    <article className="product-card">
      <Link to={`/products/${product.id}`} className="product-card__link">
        <div className="product-card__image">
          {product.primaryImageUrl ? (
            <img src={product.primaryImageUrl} alt={product.name} loading="lazy" />
          ) : (
            <span className="product-card__placeholder">FurniHub</span>
          )}
        </div>
        <div className="product-card__body">
          <h3 className="product-card__name">{product.name}</h3>
          <p className="product-card__category">{product.categoryName}</p>
          <div className="product-card__price">
            {hasDiscount ? (
              <>
                <span className="product-card__price--now">{formatINR(product.discountPrice)}</span>
                <span className="product-card__price--was">{formatINR(product.price)}</span>
              </>
            ) : (
              <span className="product-card__price--now">{formatINR(product.price)}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
