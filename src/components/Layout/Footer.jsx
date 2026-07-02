import { Link } from 'react-router-dom';
import { useSettings } from '../../context/SettingsContext';
import './Footer.css';

const Footer = () => {
  const { settings } = useSettings();
  
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <h2 className="footer-logo">{settings.brand_name}</h2>
          <p className="footer-tagline">{settings.footer_text}</p>
        </div>
        
        <div className="footer-links-group">
          <div className="footer-col">
            <h3>Shop</h3>
            <Link to="/shop">New Arrivals</Link>
            <Link to="/shop?category=Tops">Best Sellers</Link>
            <Link to="/shop">Clothing</Link>
            <Link to="/shop?category=Accessories">Accessories</Link>
          </div>
          
          <div className="footer-col">
            <h3>Help</h3>
            <Link to="/info?page=faq">FAQ</Link>
            <Link to="/info?page=shipping">Shipping & Returns</Link>
            <Link to="/info?page=contact">Contact Us</Link>
            <Link to="/info?page=size">Size Guide</Link>
          </div>
          
          <div className="footer-col">
            <h3>About</h3>
            <Link to="/info?page=story">Our Story</Link>
            <Link to="/info?page=sustainability">Sustainability</Link>
            <Link to="/info?page=careers">Careers</Link>
            <Link to="/info?page=terms">Terms of Service</Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} {settings.brand_name}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
