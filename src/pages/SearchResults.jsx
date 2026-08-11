import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiHeart } from 'react-icons/fi';
import { catalogAPI, wishlistAPI } from '../services/api';
import { addToCartItem } from '../utils/cart';
import { isInWishlist as checkWishlist, toggleWishlistItem } from '../utils/wishlist';
import '../styles/Search.css';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedProductId, setAddedProductId] = useState(null);
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await catalogAPI.searchProducts(query);
        const data = res.data || [];
        setResults(data);
        const ids = new Set();
        data.forEach((product) => {
          if (checkWishlist(product.productId)) ids.add(product.productId);
        });
        setWishlistProductIds(ids);
      } catch {
        setError('Failed to search products');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleWishlistToggle = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    const productData = {
      productId: product.productId,
      name: product.name,
      price: product.price,
      imageUrls: product.imageUrls,
      categoryName: product.categoryName,
      stock: product.stock,
    };

    try {
      if (checkWishlist(product.productId)) {
        await wishlistAPI.remove(product.productId);
        toggleWishlistItem(productData);
      } else {
        await wishlistAPI.add(product.productId);
        toggleWishlistItem(productData);
      }
      window.dispatchEvent(new Event('wishlist:updated'));
    } catch {
      // ignore API error, keep local state as-is
    }
  };

  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  const handleAddToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCartItem(product);
    setAddedProductId(product.productId || product.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <div className="search-page">
      <div className="search-header">
        <div className="search-header-top">
          <Link to="/" className="search-back">
            <FiArrowLeft /> Back
          </Link>
          <h1 className="search-title">
            {query ? (
              <>Search results for "<span className="search-query">{query}</span>"</>
            ) : (
              'Search Products'
            )}
          </h1>
        </div>
        {query && (
          <p className="search-subtitle">
            {results.length} {results.length === 1 ? 'product' : 'products'} found
          </p>
        )}
      </div>

      {error && <div className="search-error">{error}</div>}

      {loading ? (
        <div className="search-loading">
          <div className="admin-spinner" />
          <p>Searching products...</p>
        </div>
      ) : !query ? (
        <div className="search-empty">
          <div className="search-empty-icon">🔍</div>
          <h2>Start searching</h2>
          <p>Enter a product name in the search bar to find what you're looking for.</p>
        </div>
      ) : results.length === 0 ? (
        <div className="search-empty">
          <div className="search-empty-icon">📦</div>
          <h2>No products found</h2>
          <p>Try a different search term or browse our <Link to="/categories">categories</Link>.</p>
        </div>
      ) : (
        <div className="search-grid">
          {results.map((product) => (
            <div key={product.productId} className="search-card">
              <Link to={`/product/${product.productId}`} className="search-card-link">
                <div className="search-card-image">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img src={product.imageUrls[0]} alt={product.name} loading="lazy" />
                  ) : (
                    <div className="search-card-placeholder">No Image</div>
                  )}
                </div>
                <div className="search-card-body">
                  <h3 className="search-card-title">{product.name}</h3>
                  {product.categoryName && (
                    <span className="search-card-category">{product.categoryName}</span>
                  )}
                  <div className="search-card-footer">
                    <span className="search-card-price">{formatCurrency(product.price)}</span>
                  </div>
                </div>
              </Link>
              <div className="search-card-actions">
                <button
                  className="search-card-add-btn"
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={product.stock === 0}
                >
                  <FiShoppingCart /> {addedProductId === product.productId ? 'Added!' : 'Add to Cart'}
                </button>
                <button
                  className={`search-card-wishlist-btn ${wishlistProductIds.has(product.productId) ? 'active' : ''}`}
                  onClick={(e) => handleWishlistToggle(e, product)}
                  title={wishlistProductIds.has(product.productId) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                >
                  <FiHeart />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SearchResults;
