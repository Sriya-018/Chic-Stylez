import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ArrowLeft, Star, Heart } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching product:", error.message);
        } else if (data) {
          setProduct(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="container animate-fade-in" style={{padding: '5rem'}}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="container animate-fade-in" style={{padding: '5rem'}}>
        <h2>Product not found.</h2>
        <Link to="/shop" className="btn btn-primary">Return to Shop</Link>
      </div>
    );
  }

  return (
    <div className="product-detail-page container animate-fade-in">
      <Link to="/shop" className="back-link">
        <ArrowLeft size={18} /> Back to Shop
      </Link>

      <div className="product-detail-layout">
        <div className="product-gallery">
          <div className="product-image-wrapper" style={{position: 'relative'}}>
            {product.is_sold_out && <div className="sold-out-badge">Sold Out</div>}
            {product.is_on_sale && !product.is_sold_out && <div className="sale-badge">Sale</div>}
            {product.image_url ? (
               <img src={product.image_url} alt={product.name} style={{width: '100%', height: '600px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--spacing-md)'}} />
            ) : (
               <div className="main-image-placeholder">Main Image for {product.name}</div>
            )}
          </div>
          <div className="thumbnail-grid">
            {[1, 2, 3, 4].map(thumb => (
              <div key={thumb} className="thumbnail-placeholder">Thumb {thumb}</div>
            ))}
          </div>
        </div>

        <div className="product-info-panel">
          <div className="product-meta">
            <span className="product-category">{product.category || 'Clothing'}</span>
            <h1 className="product-title">{product.name}</h1>
            <div className="product-reviews">
              <div className="stars">
                {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="var(--color-primary)" color="var(--color-primary)" />)}
              </div>
              <span className="review-count">(128 Reviews)</span>
            </div>
            <p className="product-price-large">
              {product.is_on_sale ? (
                <>
                  <span style={{textDecoration: 'line-through', color: 'var(--color-gray-400)', marginRight: '15px', fontSize: '1.2rem'}}>${product.price.toFixed(2)}</span>
                  <span style={{color: 'var(--color-accent)', fontWeight: '600'}}>${product.sale_price?.toFixed(2) || (product.price * 0.8).toFixed(2)}</span>
                </>
              ) : (
                <span>${product.price.toFixed(2)}</span>
              )}
            </p>
          </div>

          <div className="product-options">
            <div className="option-group">
              <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h3>Select Size</h3>
                <button 
                  className="size-guide-btn" 
                  onClick={() => setShowSizeGuide(true)}
                  style={{background: 'none', border: 'none', color: 'var(--color-gray-600)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.85rem'}}
                >
                  Size Guide
                </button>
              </div>
              <div className="size-selector">
                {(product.sizes ? product.sizes.split(',').map(s => s.trim()) : ['XS', 'S', 'M', 'L', 'XL']).map(size => (
                  <button 
                    key={size} 
                    className={`size-btn-large ${selectedSize === size ? 'selected' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="option-group">
              <h3>Quantity</h3>
              <div className="quantity-selector">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                <span>{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="product-actions">
            <button 
              className="btn btn-primary add-to-cart-btn" 
              disabled={product.is_sold_out}
              style={product.is_sold_out ? {backgroundColor: 'var(--color-gray-400)', cursor: 'not-allowed'} : {}}
              onClick={() => {
                const cartProduct = product.is_on_sale ? { ...product, price: product.sale_price || product.price * 0.8 } : product;
                addToCart(cartProduct, quantity, selectedSize);
                navigate('/checkout');
              }}
            >
              {product.is_sold_out ? 'Sold Out' : 'Add to Cart & Checkout'}
            </button>
            <button className="btn wishlist-btn">
              <Heart size={20} />
            </button>
          </div>

          <div className="product-description">
            <h3>Description</h3>
            <p>{product.description || 'Experience the perfect blend of comfort and style with our premium collection piece. Crafted from high-quality materials to ensure longevity and a perfect fit.'}</p>
            <ul>
              <li>100% Premium Material</li>
              <li>Ethically sourced and produced</li>
              <li>Machine washable</li>
            </ul>
          </div>
        </div>
      </div>

      {showSizeGuide && (
        <div className="size-guide-modal-overlay" onClick={() => setShowSizeGuide(false)}>
          <div className="size-guide-modal-content glassmorphism" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setShowSizeGuide(false)}>×</button>
            <h2 style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2rem', marginBottom: '20px', textAlign: 'center'}}>Size Guide</h2>
            <p style={{textAlign: 'center', color: 'var(--color-gray-600)', marginBottom: '20px'}}>Measurements are in inches.</p>
            <table className="size-guide-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>US Size</th>
                  <th>Bust</th>
                  <th>Waist</th>
                  <th>Hips</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>XS</td><td>0-2</td><td>32-33</td><td>24-25</td><td>34.5-35.5</td></tr>
                <tr><td>S</td><td>4-6</td><td>34-35</td><td>26-27</td><td>36.5-37.5</td></tr>
                <tr><td>M</td><td>8-10</td><td>36-37</td><td>28-29</td><td>38.5-39.5</td></tr>
                <tr><td>L</td><td>12-14</td><td>38.5-40</td><td>30.5-32</td><td>41-42.5</td></tr>
                <tr><td>XL</td><td>16-18</td><td>41.5-43</td><td>33.5-35</td><td>44-45.5</td></tr>
                <tr><td>XXL</td><td>20-22</td><td>45-47</td><td>37-39</td><td>47.5-49.5</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
