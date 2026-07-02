import { Link } from 'react-router-dom';
import { ShoppingCart, Menu, Search, User } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { useCart } from '../../context/CartContext';
import './Navbar.css';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const { settings } = useSettings();
  const { cartCount } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`navbar ${isScrolled ? 'scrolled glassmorphism' : ''}`}>
      <div className="navbar-container container">
        <div className="navbar-left">
          <Link to="/" className="brand-logo" style={{fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', letterSpacing: '4px', fontWeight: '500', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            AURA
            <span style={{fontFamily: "'Great Vibes', cursive", color: 'var(--color-accent)', fontSize: '1.5rem', letterSpacing: '1px', marginTop: '-10px'}}>Boutique</span>
          </Link>
        </div>
        
        <div className="navbar-center">
          <nav className="desktop-nav">
            <Link to="/shop" className="nav-link">NEW ARRIVALS</Link>
            <Link to="/shop" className="nav-link">CLOTHING</Link>
            <Link to="/shop?category=Dresses" className="nav-link">DRESSES</Link>
            <Link to="/shop?category=Tops" className="nav-link">TOPS</Link>
            <Link to="/shop?category=Bottoms" className="nav-link">BOTTOMS</Link>
            <Link to="/shop?category=Accessories" className="nav-link">ACCESSORIES</Link>
            <Link to="/shop?category=Sale" className="nav-link" style={{color: 'var(--color-accent)'}}>SALE</Link>
          </nav>
        </div>
        
        <div className="navbar-right">
          <div className="navbar-actions">
            <button className="icon-btn search-btn"><Search size={22} /></button>
            <Link to="/profile" className="icon-btn">
              <User size={22} />
            </Link>
            <Link to="/checkout" className="icon-btn cart-btn">
              <ShoppingCart size={22} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
