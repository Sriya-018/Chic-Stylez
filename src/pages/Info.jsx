import { useLocation } from 'react-router-dom';
import { useSettings } from '../context/SettingsContext';

const Info = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const page = queryParams.get('page') || 'Information';
  const { settings } = useSettings();

  const getPageContent = () => {
    switch(page) {
      case 'faq':
        return { title: 'Frequently Asked Questions', content: 'Here you will find answers to common questions about our products, shipping, and returns.' };
      case 'shipping':
        return { title: 'Shipping & Returns', content: 'We offer worldwide shipping and a 30-day return policy on all unworn items.' };
      case 'contact':
        return { title: 'Contact Us', content: `Need help? Reach out to our support team at ${settings.contact_email} or call us at ${settings.contact_phone}.` };
      case 'size':
        return { title: 'Size Guide', content: 'Our clothing fits true to size. Please refer to individual product pages for specific measurements.' };
      case 'story':
        return { title: 'Our Story', content: 'Founded in 2026, AURA brings premium, sustainable fashion to the modern individual.' };
      case 'sustainability':
        return { title: 'Sustainability', content: 'We are committed to using eco-friendly materials and ethical manufacturing processes.' };
      case 'careers':
        return { title: 'Careers', content: 'Join our growing team! Check back later for open positions.' };
      case 'terms':
        return { title: 'Terms of Service', content: 'Please read our terms of service carefully before using our platform.' };
      default:
        return { title: 'Information', content: 'Welcome to our information page.' };
    }
  };

  const { title, content } = getPageContent();

  return (
    <div className="container animate-fade-in" style={{ padding: '6rem 2rem', minHeight: '60vh' }}>
      <div className="glassmorphism" style={{ padding: '3rem', borderRadius: 'var(--radius-lg)' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>{title}</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--color-gray-600)', lineHeight: '1.8', marginBottom: page === 'size' ? '2rem' : '0' }}>
          {content}
        </p>

        {page === 'size' && (
          <div>
            <p style={{marginBottom: '20px', color: 'var(--color-gray-600)'}}>Measurements are in inches.</p>
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
        )}
      </div>
    </div>
  );
};

export default Info;
