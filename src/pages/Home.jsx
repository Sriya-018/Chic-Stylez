import { Link } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';
import './Home.css';
import { ArrowRight, Star, Truck, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const { settings } = useSettings();

  useEffect(() => {
    fetchFeaturedProducts();
  }, []);

  const fetchFeaturedProducts = async () => {
    const { data } = await supabase.from('products').select('*').limit(3).order('created_at', { ascending: false });
    if (data) setFeaturedProducts(data);
  };

  return (
    <div className="home-page animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <div className="welcome-text animate-slide-up" style={{fontFamily: "'Great Vibes', cursive", fontSize: '2.5rem', color: 'var(--color-gray-500)', marginBottom: '-10px'}}>
            Welcome to <span style={{color: 'var(--color-accent)', fontSize: '1.5rem'}}>♥</span>
          </div>
          <h1 className="hero-title animate-slide-up" style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '5rem', letterSpacing: '8px', lineHeight: '0.8', marginBottom: '20px'}}>
            AURA<br/>
            <span style={{fontFamily: "'Great Vibes', cursive", color: 'var(--color-accent)', fontSize: '7rem', fontWeight: 'normal', display: 'inline-block', marginTop: '10px', letterSpacing: 'normal'}}>Boutique</span>
          </h1>
          <p className="hero-subtitle animate-slide-up" style={{animationDelay: '0.1s', fontSize: '1.5rem', fontWeight: '500', color: 'var(--color-gray-800)', marginBottom: '30px', lineHeight: '1.4'}}>
            Chic styles. Cozy vibes.<br/>Confident you.
          </p>
          <Link to="/shop" className="btn btn-primary animate-slide-up" style={{animationDelay: '0.2s', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.9rem', padding: '15px 30px'}}>
            Shop New Arrivals
          </Link>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="categories-section container">
        <h2 className="section-title">Shop by Category</h2>
        <div className="category-grid">
          <Link to="/shop?category=dresses" className="category-card">
            <div className="category-image-placeholder">Dresses Image</div>
            <div className="category-info glassmorphism">
              <h3>Dresses</h3>
            </div>
          </Link>
          <Link to="/shop?category=tops" className="category-card">
            <div className="category-image-placeholder">Tops Image</div>
            <div className="category-info glassmorphism">
              <h3>Tops</h3>
            </div>
          </Link>
          <Link to="/shop?category=accessories" className="category-card">
            <div className="category-image-placeholder">Accessories Image</div>
            <div className="category-info glassmorphism">
              <h3>Accessories</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* New Arrivals (Horizontal Scroll) */}
      <section className="new-arrivals-section">
        <div className="container">
          <h2 className="section-title">New Arrivals</h2>
        </div>
        <div className="scrolling-wrapper">
          {featuredProducts.length > 0 ? featuredProducts.map((product) => (
            <Link to={`/product/${product.id}`} key={product.id} className="product-card">
              <div className="product-image-wrapper">
                {product.is_sold_out && <div className="sold-out-badge">Sold Out</div>}
                {product.is_on_sale && !product.is_sold_out && <div className="sale-badge">Sale</div>}
                {!product.is_sold_out && !product.is_on_sale && <div className="product-badge">New</div>}
                {product.image_url ? (
                  <img src={product.image_url} alt={product.name} style={{width: '100%', height: '100%', objectFit: 'cover', opacity: product.is_sold_out ? '0.7' : '1'}} />
                ) : (
                  <div className="product-image-placeholder">Image</div>
                )}
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <div className="product-price">
                  {product.is_on_sale ? (
                    <>
                      <span style={{textDecoration: 'line-through', color: 'var(--color-gray-400)', marginRight: '8px', fontSize: '0.9rem'}}>${product.price.toFixed(2)}</span>
                      <span style={{color: 'var(--color-accent)', fontWeight: '600'}}>${product.sale_price?.toFixed(2) || (product.price * 0.8).toFixed(2)}</span>
                    </>
                  ) : (
                    <span>${product.price.toFixed(2)}</span>
                  )}
                </div>
              </div>
            </Link>
          )) : (
            <p style={{padding: '20px'}}>No new arrivals yet. Check back soon!</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
