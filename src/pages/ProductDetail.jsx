import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiShoppingCart, FiStar, FiShield, FiTruck, FiHeart } from 'react-icons/fi';
import { catalogAPI, customerReviewsAPI, wishlistAPI } from '../services/api';
import { addToCartItem } from '../utils/cart';
import { isInWishlist as checkWishlist, toggleWishlistItem } from '../utils/wishlist';
import '../styles/ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState('');
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [reviewMessage, setReviewMessage] = useState('');
  const [deletingReviewId, setDeletingReviewId] = useState(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const isLoggedIn = !!localStorage.getItem('token');

  const averageRating = reviews.length > 0
    ? Number((reviews.reduce((sum, r) => sum + (Number(r.rating) || 0), 0) / reviews.length).toFixed(1))
    : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await catalogAPI.getProductById(id);
        setProduct(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load product details');
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    setIsInWishlist(checkWishlist(Number(id)));
  }, [id]);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      try {
        const res = await customerReviewsAPI.getProductReviews(id);
        setReviews(res.data || []);
      } catch {
        // reviews optional
      }
    };
    fetchReviews();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    const productWithQuantity = { ...product, quantity };
    addToCartItem(productWithQuantity);
    setAddedMessage(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
    setTimeout(() => setAddedMessage(''), 3000);
  };

  const handleToggleWishlist = async () => {
    if (!product || !isLoggedIn) return;
    setWishlistLoading(true);
    try {
      const productData = {
        productId: product.productId,
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls,
        categoryName: product.categoryName,
        stock: product.stock,
      };

      if (isInWishlist) {
        console.log('Removing from wishlist:', product.productId);
        await wishlistAPI.remove(product.productId);
        console.log('Removed from wishlist');
        toggleWishlistItem(productData);
        setIsInWishlist(false);
      } else {
        console.log('Adding to wishlist:', product.productId);
        await wishlistAPI.add(product.productId);
        console.log('Added to wishlist');
        toggleWishlistItem(productData);
        setIsInWishlist(true);
      }
      window.dispatchEvent(new Event('wishlist:updated'));
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) return;
    try {
      await customerReviewsAPI.submit({
        productId: Number(id),
        rating: reviewForm.rating,
        comment: reviewForm.comment,
      });
      setReviewMessage('Review submitted! It will be visible after approval.');
      setReviewForm({ rating: 5, comment: '' });
      const res = await customerReviewsAPI.getProductReviews(id);
      setReviews(res.data || []);
    } catch {
      setReviewMessage('Failed to submit review');
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    setDeletingReviewId(reviewId);
    try {
      await customerReviewsAPI.delete(reviewId);
      const res = await customerReviewsAPI.getProductReviews(id);
      setReviews(res.data || []);
    } catch {
      setReviewMessage('Failed to delete review');
    } finally {
      setDeletingReviewId(null);
    }
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <p className="loading-text">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <p className="error-text">{error}</p>
          <Link to="/categories" className="btn btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-detail-page">
        <div className="product-detail-container">
          <p className="error-text">Product not found</p>
          <Link to="/categories" className="btn btn-primary">Back to Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-page">
      <div className="product-detail-container">
        <Link to="/categories" className="back-link">
          <FiArrowLeft /> Back to Products
        </Link>

        <div className="product-detail-card">
          <div className="product-detail-image">
            {product.imageUrls && product.imageUrls.length > 0 ? (
              <img src={product.imageUrls[0]} alt={product.name} />
            ) : (
              <div className="product-detail-image-placeholder">
                <span>No Image Available</span>
              </div>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-detail-category">
              {product.categoryName}
            </div>
            <h1 className="product-detail-name">{product.name}</h1>
            <div className="product-detail-rating">
              {[1,2,3,4,5].map((star) => (
                <FiStar key={star} style={{ color: star <= averageRating ? 'var(--warning)' : '#d1d5db' }} />
              ))}
              <span>({reviews.length} reviews)</span>
            </div>

            <div className="product-detail-price">
              ₹{Number(product.price).toLocaleString('en-IN')}
            </div>

            <div className="product-detail-description">
              <p>{product.description}</p>
            </div>

            <div className="product-detail-stock">
              {product.stock > 0 ? (
                <span className="in-stock">In Stock ({product.stock} available)</span>
              ) : (
                <span className="out-of-stock">Out of Stock</span>
              )}
            </div>

            <div className="product-detail-actions">
              <div className="quantity-control">
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity((prev) => prev + 1)}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>

              <button
                className="btn btn-primary add-to-cart-btn"
                onClick={handleAddToCart}
                disabled={product.stock === 0}
              >
                <FiShoppingCart /> Add to Cart
              </button>
              <button
                className={`btn wishlist-btn ${isInWishlist ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                disabled={wishlistLoading}
                title={isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <FiHeart /> {isInWishlist ? 'Saved' : 'Save'}
              </button>
            </div>

            {addedMessage && (
              <div className="added-message">
                {addedMessage}
              </div>
            )}

            <div className="product-detail-features">
              <div className="feature-item">
                <FiTruck /> Free Delivery
              </div>
              <div className="feature-item">
                <FiShield /> Secure Payment
              </div>
              <div className="feature-item">
                <FiStar /> Premium Quality
              </div>
            </div>

            <div className="product-reviews-section">
              <h3>Customer Reviews</h3>
              {reviews.length === 0 ? (
                <p className="no-reviews">No reviews yet. Be the first to review this product!</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map((review) => (
                    <div key={review.reviewId} className="review-item">
                      <div className="review-header">
                        <strong>{review.userFullName || 'Customer'}</strong>
                        <span className="review-rating">
                         {[1,2,3,4,5].map((star) => (
                           <FiStar key={star} style={{ color: star <= Number(review.rating) ? 'var(--warning)' : '#d1d5db' }} />
                         ))}
                       </span>
                      </div>
                      <p className="review-comment">{review.comment}</p>
                      <span className={`review-status ${(review.status || 'pending').toLowerCase()}`}>
                        {review.status || 'Pending'}
                      </span>
                      {isLoggedIn && (
                        <button
                          type="button"
                          className="review-delete-btn"
                          onClick={() => handleDeleteReview(review.reviewId)}
                          disabled={deletingReviewId === review.reviewId}
                          title="Delete your review"
                        >
                          {deletingReviewId === review.reviewId ? 'Deleting...' : 'Delete'}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {isLoggedIn ? (
                <form className="review-form" onSubmit={handleReviewSubmit}>
                  <h4>Write a Review</h4>
                  {reviewMessage && <div className="review-message">{reviewMessage}</div>}
                  <div className="form-group">
                    <label>Rating</label>
                    <div className="star-rating-input">
                      {[1,2,3,4,5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="star-btn"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        >
                          <FiStar style={{ color: star <= reviewForm.rating ? 'var(--warning)' : '#d1d5db' }} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Comment</label>
                    <textarea
                      rows="3"
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this product..."
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">Submit Review</button>
                </form>
              ) : (
                <p className="review-login-prompt">
                  <Link to="/login">Login</Link> to write a review.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;