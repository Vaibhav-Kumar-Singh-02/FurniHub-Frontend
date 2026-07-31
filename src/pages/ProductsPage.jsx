import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getProducts } from '../services/api'
import ProductCard from '../components/ProductCard'

const PAGE_SIZE = 12

export default function ProductsPage() {
  const [searchParams] = useSearchParams()
  const categoryId = searchParams.get('category') || ''

  const [products, setProducts] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadProducts = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getProducts({
        categoryId: categoryId || undefined,
        page,
        size: PAGE_SIZE,
      })
      setProducts(data.content)
      setTotalPages(data.totalPages)
    } catch {
      setError('Unable to load products. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [categoryId, page])

  useEffect(() => {
    setPage(0)
  }, [categoryId])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  return (
    <div className="container section">
      <h1 className="page-title">Shop</h1>

      {error && <p className="alert alert--error">{error}</p>}

      {loading ? (
        <p>Loading products…</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products found in this category.</p>
      ) : (
        <>
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <div className="pagination">
            <button
              type="button"
              className="btn btn--ghost"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <span className="pagination__info">
              Page {page + 1} of {Math.max(totalPages, 1)}
            </span>
            <button
              type="button"
              className="btn btn--ghost"
              disabled={page + 1 >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
