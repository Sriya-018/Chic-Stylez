import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Shop.css';

const Shop = () => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Sort State
  const queryParams = new URLSearchParams(window.location.search);
  const initialCategory = queryParams.get('category');
  
  const [selectedCategories, setSelectedCategories] = useState(initialCategory ? [initialCategory] : []);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortOption, setSortOption] = useState('newest');

  // Sync URL changes from Navbar to state
  useEffect(() => {
    const urlCat = new URLSearchParams(window.location.search).get('category');
    if (urlCat) {
      setSelectedCategories([urlCat]);
    } else {
      setSelectedCategories([]);
    }
  }, [window.location.search]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase.from('products').select('*');
        
        // Sorting
        if (sortOption === 'newest') {
          query = query.order('created_at', { ascending: false });
        } else if (sortOption === 'price-asc') {
          query = query.order('price', { ascending: true });
        } else if (sortOption === 'price-desc') {
          query = query.order('price', { ascending: false });
        }

        // Category & Sale Filter
        const activeCategories = selectedCategories.filter(c => c !== 'Sale');
        const isSaleFilter = selectedCategories.includes('Sale');

        if (activeCategories.length > 0) {
          query = query.in('category', activeCategories);
        }
        if (isSaleFilter) {
          query = query.eq('is_on_sale', true);
        }

        const { data, error } = await query;

        if (error && error.code !== 'PGRST116') {
          console.error("Error fetching products:", error.message);
        } else if (data) {
          // JS Filter for sizes to prevent 'S' matching 'XS'
          let filteredData = data;
          if (selectedSizes.length > 0) {
            filteredData = filteredData.filter(product => {
              if (!product.sizes) return false;
              const productSizes = product.sizes.split(',').map(s => s.trim());
              return selectedSizes.some(s => productSizes.includes(s));
            });
          }
          setProducts(filteredData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [selectedCategories, selectedSizes, sortOption]);

  const toggleCategory = (cat) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  const sortLabels = {
    'newest': 'Newest',
    'price-asc': 'Price: Low-High',
    'price-desc': 'Price: High-Low'
  };

  return (
    <div className="shop-page container animate-fade-in">
      <div className="shop-header">
        <h1 className="shop-title">All Clothing</h1>
        <div className="shop-controls">
          <button className="control-btn" onClick={() => setIsFilterOpen(!isFilterOpen)}>
            <Filter size={18} /> Filter
          </button>
          
          <div style={{ position: 'relative' }}>
            <button className="control-btn" onClick={() => setIsSortOpen(!isSortOpen)}>
              Sort by: {sortLabels[sortOption]} <ChevronDown size={18} />
            </button>
            {isSortOpen && (
              <div className="sort-dropdown glassmorphism">
                <div onClick={() => { setSortOption('newest'); setIsSortOpen(false); }}>Newest</div>
                <div onClick={() => { setSortOption('price-asc'); setIsSortOpen(false); }}>Price: Low to High</div>
                <div onClick={() => { setSortOption('price-desc'); setIsSortOpen(false); }}>Price: High to Low</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="shop-layout">
        {/* Sidebar Filters */}
        <aside className={`shop-sidebar ${isFilterOpen ? 'open' : ''}`}>
          <div className="filter-group">
            <h3>Category</h3>
            {['Dresses', 'Tops', 'Outerwear', 'Accessories', 'Sale'].map(cat => (
              <label key={cat} className="checkbox-label" style={cat === 'Sale' ? {color: 'var(--color-accent)', fontWeight: '500'} : {}}>
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)}
                /> 
                {cat}
              </label>
            ))}
          </div>
          <div className="filter-group">
            <h3>Size</h3>
            <div className="size-grid">
              {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
                <button 
                  key={size} 
                  className={`size-btn ${selectedSizes.includes(size) ? 'active' : ''}`}
                  onClick={() => toggleSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <div className="shop-grid">
          {loading ? (
            <p>Loading premium collection...</p>
          ) : products.length === 0 ? (
            <p>No products available matching your filters. Check back soon!</p>
          ) : (
            products.map((product) => (
              <Link to={`/product/${product.id}`} key={product.id} className="product-card">
                <div className="product-image-wrapper">
                  {product.is_sold_out && <div className="sold-out-badge">Sold Out</div>}
                  {product.is_on_sale && !product.is_sold_out && <div className="sale-badge">Sale</div>}
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
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Shop;
