import React, { useState, useEffect } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getCatalogData } from '../utils/catalog';
import { addToCartItem } from '../utils/cart';
import '../styles/Categories.css';

const Categories = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const [categoriesResponse, productsResponse] = await Promise.all([
          api.get('/categories').catch(() => []),
          api.get('/products').catch(() => []),
        ]);
        const { categories: loadedCategories, products: loadedProducts } = getCatalogData(categoriesResponse, productsResponse);
        setCategories(loadedCategories);
        setProducts(loadedProducts);
      } catch (error) {
        setCategories([]);
        setProducts([]);
        console.error('Failed to load catalog', error);
      }
    };

    loadCatalog();
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
