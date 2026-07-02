import { useState, useEffect } from 'react';
import { CreditCard, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Checkout.css';

// Stripe uses a publishable key for the frontend
const stripePromise = loadStripe('pk_test_51MockPublishableKey0000000000000');

const CheckoutForm = ({ amount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { cartItems } = useCart();
  const { user } = useAuth();
  const [profile, setProfile] = useState({
    email: user?.email || '',
    first_name: '',
    last_name: '',
    address: '',
    city: '',
    postal_code: ''
  });

  useEffect(() => {
    if (user) {
      setProfile(prev => ({ ...prev, email: user.email }));
      const fetchProfile = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        if (data) {
          setProfile(prev => ({
            ...prev,
            first_name: data.first_name || '',
            last_name: data.last_name || '',
            address: data.address || '',
            city: data.city || '',
            postal_code: data.postal_code || ''
          }));
        }
      };
      fetchProfile();
    }
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required'
    });

    if (error) {
      setErrorMessage(error.message);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      
      // Save order to database if user is logged in
      if (user) {
        try {
          const { error: dbError } = await supabase.from('orders').insert([{
            user_id: user.id,
            total: amount,
            items: cartItems,
            status: 'Paid - Processing'
          }]);
          if (dbError) console.error("Error saving order:", dbError.message);
        } catch(err) {
          console.error("Order save err:", err);
        }
      }

      window.location.href = `${window.location.origin}/checkout?success=true`;
    }
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Contact Info */}
      <div className="form-section">
        <h2>Contact Information</h2>
        <div className="form-group">
          <input type="email" placeholder="Email Address" required className="form-input" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} />
        </div>
      </div>

      {/* Shipping Info */}
      <div className="form-section">
        <h2>Shipping Address</h2>
        <div className="form-row">
          <div className="form-group"><input type="text" placeholder="First Name" required className="form-input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} /></div>
          <div className="form-group"><input type="text" placeholder="Last Name" required className="form-input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} /></div>
        </div>
        <div className="form-group"><input type="text" placeholder="Address" required className="form-input" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} /></div>
        <div className="form-row">
          <div className="form-group"><input type="text" placeholder="City" required className="form-input" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} /></div>
          <div className="form-group"><input type="text" placeholder="Postal Code" required className="form-input" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} /></div>
        </div>
      </div>

      {/* Payment Info */}
      <div className="form-section payment-section">
        <h2><CreditCard size={20} /> Payment Details</h2>
        <p className="payment-secure"><Lock size={14} /> Payments are secure and encrypted by Stripe.</p>
        
        <div style={{ marginTop: '20px', background: 'white', padding: '15px', borderRadius: '8px' }}>
          <PaymentElement />
        </div>
      </div>

      {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}

      <button 
        type="submit" 
        className="btn btn-primary submit-payment-btn"
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
      </button>
    </form>
  );
};

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState('');
  
  const isSuccess = new URLSearchParams(window.location.search).get('success');

  useEffect(() => {
    if (isSuccess) {
      clearCart();
    }
  }, [isSuccess]);

  useEffect(() => {
    // Only create PaymentIntent if we have items
    if (cartItems.length > 0 && cartTotal > 0 && !isSuccess) {
      // Calculate amount in cents for Stripe
      const amountInCents = Math.round(cartTotal * 100);
      
      fetch('http://localhost:4000/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amountInCents }),
      })
        .then((res) => res.json())
        .then((data) => setClientSecret(data.clientSecret))
        .catch((err) => console.error("Error connecting to backend:", err));
    }
  }, [cartTotal, isSuccess]);

  if (isSuccess) {
    return (
      <div className="checkout-page container animate-fade-in success-state">
        <div className="success-icon">✓</div>
        <h1>Payment Successful!</h1>
        <p>Thank you for your order. Your mock Stripe payment went through perfectly.</p>
        <button className="btn btn-primary" onClick={() => window.location.href = '/'}>
          Return to Home
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page container animate-fade-in" style={{ textAlign: 'center', padding: '100px 0' }}>
        <h2>Your cart is empty</h2>
        <button className="btn btn-primary" onClick={() => window.location.href = '/shop'} style={{ marginTop: '20px' }}>
          Continue Shopping
        </button>
      </div>
    );
  }

  const appearance = {
    theme: 'night',
    variables: {
      colorPrimary: '#f8fafc',
      colorBackground: '#1e293b',
      colorText: '#f8fafc',
    },
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <div className="checkout-page container animate-fade-in">
      <h1 className="checkout-title">Checkout</h1>
      
      <div className="checkout-layout">
        <div className="checkout-form-section">
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm amount={cartTotal} />
            </Elements>
          ) : (
            <p>Loading secure payment gateway...</p>
          )}
        </div>

        <div className="order-summary-section">
          <div className="summary-card glassmorphism">
            <h2>Order Summary</h2>
            <div className="summary-items">
              {cartItems.map((item, idx) => (
                <div className="summary-item" key={`${item.id}-${item.selectedSize}-${idx}`}>
                  <div className="summary-item-image">
                    {item.image_url ? <img src={item.image_url} alt={item.name} style={{width:'100%', height:'100%', objectFit:'cover'}} /> : 'Img'}
                  </div>
                  <div className="summary-item-info">
                    <h4>{item.name}</h4>
                    <p>Size: {item.selectedSize}, Qty: {item.quantity}</p>
                  </div>
                  <div className="summary-item-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="summary-totals">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>Free</span>
              </div>
              <div className="summary-row total-row">
                <span>Total</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
