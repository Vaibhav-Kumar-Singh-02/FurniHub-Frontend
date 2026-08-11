import React, { useState, useEffect } from 'react';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { wishlistAPI } from '../services/api';
import { addToCartItem } from '../utils/cart';
import '../styles/Wishlist.css';

const WishlistPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);

  const loadWishlist = async () => {
    setLoading(true);
    try {
      const res = await wishlistAPI.getAll();
      setItems(res.data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
  }, []);

  const handleRemove = async (productId, wishlistId) => {
    setRemovingId(wishlistId);
    try {
      await wishlistAPI.remove(productId);
      setItems((prev) => prev.filter((item) => item.id !== wishlistId));
      window.dispatchEvent(new Event('wishlist:updated'));
    } catch {
      // ignore
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = (product) => {
    addToCartItem(product);
    window.dispatchEvent(new Event('cart:updated'));
  };

  return (
    <div className="wishlist-page">
      <div className="wishlist-container">
        <div className="wishlist-header">
          <h1>My Wishlist</h1>
          <p>{items.length} item{items.length === 1 ? '' : 's'} saved</p>
        </div>

        {loading ? (
          <div className="wishlist-loading">
            <div className="admin-spinner" />
            <p>Loading your wishlist...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="wishlist-empty">
            <div className="wishlist-empty-icon">
              <FiHeart />
            </div>
            <h2>Your wishlist is empty</h2>
            <p>Save items you love by clicking the heart icon on any product.</p>
            <Link to="/categories" className="btn btn-primary">Browse Products</Link>
          </div>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => (
              <div key={item.id} className="wishlist-card">
                <div className="wishlist-card-image">
                  {item.imageUrls && item.imageUrls.length > 0 ? (
                    <img src={item.imageUrls[0]} alt={item.productName} />
                  ) : (
                    <div className="wishlist-card-placeholder">No Image</div>
                  )}
                  <button
                    className="wishlist-remove-btn"
                    onClick={() => handleRemove(item.productId, item.id)}
                    disabled={removingId === item.id}
                    title="Remove from wishlist"
                  >
                    <FiTrash2 />
                  </button>
                </div>
                <div className="wishlist-card-details">
                  <h3>{item.productName}</h3>
                  {item.categoryName && (
                    <span className="wishlist-card-category">{item.categoryName}</span>
                  )}
                  <div className="wishlist-card-footer">
                    <span className="wishlist-card-price">
                      ₹{Number(item.price).toLocaleString('en-IN')}
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAddToCart(item)}
                      disabled={item.stock === 0}
                    >
                      <FiShoppingCart /> {item.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistPage;
