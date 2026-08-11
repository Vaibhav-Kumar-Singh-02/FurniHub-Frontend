import React, { useState, useEffect } from 'react';
import { FiShoppingCart, FiHeart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { wishlistAPI, catalogAPI } from '../services/api';
import { getCatalogData } from '../utils/catalog';
import { addToCartItem } from '../utils/cart';
import { isInWishlist as checkWishlist, toggleWishlistItem } from '../utils/wishlist';
import '../styles/Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [wishlistProductIds, setWishlistProductIds] = useState(new Set());

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          catalogAPI.getCategories().catch(() => []),
          catalogAPI.getProducts().catch(() => []),
        ]);
        const { categories: loadedCategories, products: loadedProducts } = getCatalogData(categoriesResponse, productsResponse);
        setCategories(loadedCategories);
        setProducts(loadedProducts);

        const ids = new Set();
        loadedProducts.forEach((p) => {
          if (checkWishlist(p.productId)) ids.add(p.productId);
        });
        setWishlistProductIds(ids);
      } catch (error) {
        setCategories([]);
        setProducts([]);
        console.error('Failed to load catalog', error);
      }
    };

    loadCatalog();

    const handleWishlistUpdate = () => {
      setWishlistProductIds((prev) => {
        const next = new Set(prev);
        products.forEach((p) => {
          if (checkWishlist(p.productId)) {
            next.add(p.productId);
          } else {
            next.delete(p.productId);
          }
        });
        return next;
      });
    };
    window.addEventListener('wishlist:updated', handleWishlistUpdate);
    return () => window.removeEventListener('wishlist:updated', handleWishlistUpdate);
  }, []);

  const filteredCategories = activeCategory === 'all'
    ? categories
    : categories.filter((cat) => cat.categorieId === activeCategory);

  const handleAddToCart = (product) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    addToCartItem(product);
    window.dispatchEvent(new Event('cart:updated'));
  };

  const handleToggleWishlist = async (e, product) => {
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
    } catch (err) {
      console.error('Wishlist toggle error:', err);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const getProductsForCategory = (catName) => {
    return products.filter((product) => product.categoryName === catName);
  };

  const categorizedNames = categories.map((c) => c.categoryName);
  const uncategorizedProducts = products.filter(
    (p) => !p.categoryName || !categorizedNames.includes(p.categoryName)
  );

  return (
    <div className="categories-page">
      <div className="categories-header">
        <h1>Shop by Category</h1>
        <p>Find everything you need for your home</p>
      </div>

      <div className="category-filter">
        <button
          className={`filter-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          All ({products.length})
        </button>
        {categories.map((cat) => {
          const count = products.filter((p) => p.categoryName === cat.categoryName).length;
          return (
            <button
              key={cat.categorieId}
              className={`filter-btn ${activeCategory === cat.categorieId ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.categorieId)}
            >
              {cat.categoryName} ({count})
            </button>
          );
        })}
      </div>

      {filteredCategories.map((cat) => {
        const catProducts = getProductsForCategory(cat.categoryName);
        if (catProducts.length === 0) return null;
        return (
          <section key={cat.categorieId} className="category-section">
            <div className="category-section-header">
              <h2>{cat.categoryName}</h2>
              <span className="category-count">{catProducts.length} product{catProducts.length === 1 ? '' : 's'}</span>
            </div>
            <div className="category-products-grid">
              {catProducts.map((product) => (
                <div key={product.productId} className="category-product-card" onClick={() => handleProductClick(product.productId)}>
                  <div className="category-product-image">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img src={product.imageUrls[0]} alt={product.name} />
                    ) : (
                      <div className="category-product-image-placeholder">
                        <span>No Image</span>
                      </div>
                    )}
                    <button
                      className={`category-wishlist-btn ${wishlistProductIds.has(product.productId) ? 'active' : ''}`}
                      onClick={(e) => handleToggleWishlist(e, product)}
                      title={wishlistProductIds.has(product.productId) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                    >
                      <FiHeart />
                    </button>
                  </div>
                  <div className="category-product-details">
                    <h4>{product.name}</h4>
                    <p className="category-product-desc">{product.description}</p>
                    <div className="category-product-footer">
                      <span className="category-product-price">
                        ₹{Number(product.price).toLocaleString('en-IN')}
                      </span>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                      >
                        <FiShoppingCart /> Add
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {uncategorizedProducts.length > 0 && (
        <section className="category-section">
          <div className="category-section-header">
            <h2>Other Products</h2>
            <span className="category-count">{uncategorizedProducts.length} product{uncategorizedProducts.length === 1 ? '' : 's'}</span>
          </div>
          <div className="category-products-grid">
            {uncategorizedProducts.map((product) => (
              <div key={product.productId} className="category-product-card" onClick={() => handleProductClick(product.productId)}>
                <div className="category-product-image">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <img src={product.imageUrls[0]} alt={product.name} />
                  ) : (
                    <div className="category-product-image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                  <button
                    className={`category-wishlist-btn ${wishlistProductIds.has(product.productId) ? 'active' : ''}`}
                    onClick={(e) => handleToggleWishlist(e, product)}
                    title={wishlistProductIds.has(product.productId) ? 'Remove from Wishlist' : 'Add to Wishlist'}
                  >
                    <FiHeart />
                  </button>
                </div>
                <div className="category-product-details">
                  <h4>{product.name}</h4>
                  <p className="category-product-desc">{product.description}</p>
                  <div className="category-product-footer">
                    <span className="category-product-price">
                      ₹{Number(product.price).toLocaleString('en-IN')}
                    </span>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    >
                      <FiShoppingCart /> Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Categories;
