import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Package, User, Save } from 'lucide-react';
import './CustomerPortal.css';

const CustomerPortal = () => {
  const { session, user, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  
  // Profile State
  const [profile, setProfile] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    city: '',
    postal_code: ''
  });
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (session) {
      fetchOrders();
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (data) {
        setProfile({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || '',
          postal_code: data.postal_code || ''
        });
      }
    } catch (err) {
      console.log('No profile found or error fetching:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ 
          id: user.id, 
          ...profile,
          updated_at: new Date().toISOString()
        });
        
      if (error) throw error;
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Error updating profile: ' + err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchOrders = async () => {
    setFetchingOrders(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
        console.error("Error fetching orders:", error.message);
      } else if (data) {
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setFetchingOrders(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          role: 'customer'
        }
      }
    });
    if (error) {
      alert("Signup Error: " + error.message);
    } else {
      alert("Account created successfully! Try logging in now if you aren't automatically.");
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) return <div className="container" style={{padding: '5rem'}}>Loading...</div>;

  if (!session) {
    return (
      <div className="admin-login-container animate-fade-in" style={{minHeight: '70vh'}}>
        <div className="admin-login-box glassmorphism">
          <div className="admin-login-header">
            <User size={32} />
            <h2>Customer Login</h2>
            <p>Access your account to view past orders.</p>
          </div>
          <form>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Email Address" 
                className="form-input" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
              />
            </div>
            <div className="form-group">
              <input 
                type="password" 
                placeholder="Password" 
                className="form-input" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
              />
            </div>
            <button onClick={handleLogin} type="button" className="btn btn-primary" disabled={loading} style={{marginBottom: '10px'}}>
              {loading ? 'Processing...' : 'Log In'}
            </button>
            <button 
              onClick={handleSignup}
              type="button" 
              className="btn" 
              style={{width: '100%', backgroundColor: 'transparent', border: '1px solid var(--color-gray-300)'}}
              disabled={loading}
            >
              Create New Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{paddingTop: '120px', minHeight: '70vh'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px'}}>
        <div>
          <h1>My Account</h1>
          <p style={{color: 'var(--color-gray-600)'}}>Welcome back, {user?.email}</p>
        </div>
        <button className="btn" onClick={handleLogout}>Log Out</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start'}} className="portal-grid">
        
        {/* Account Details Form */}
        <div className="dashboard-card glassmorphism" style={{padding: '30px'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <User size={24} /> Account Details
          </h2>
          <p style={{marginBottom: '20px', color: 'var(--color-gray-600)', fontSize: '0.9rem'}}>
            Save your shipping information here for a faster checkout experience.
          </p>
          
          <form onSubmit={handleUpdateProfile}>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px'}}>
              <div className="form-group" style={{marginBottom: 0}}>
                <label>First Name</label>
                <input type="text" className="form-input" value={profile.first_name} onChange={e => setProfile({...profile, first_name: e.target.value})} />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label>Last Name</label>
                <input type="text" className="form-input" value={profile.last_name} onChange={e => setProfile({...profile, last_name: e.target.value})} />
              </div>
            </div>
            
            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Phone Number</label>
              <input type="tel" className="form-input" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
            </div>

            <div className="form-group" style={{marginBottom: '15px'}}>
              <label>Default Shipping Address</label>
              <input type="text" className="form-input" value={profile.address} onChange={e => setProfile({...profile, address: e.target.value})} />
            </div>

            <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '15px', marginBottom: '25px'}}>
              <div className="form-group" style={{marginBottom: 0}}>
                <label>City</label>
                <input type="text" className="form-input" value={profile.city} onChange={e => setProfile({...profile, city: e.target.value})} />
              </div>
              <div className="form-group" style={{marginBottom: 0}}>
                <label>Postal Code</label>
                <input type="text" className="form-input" value={profile.postal_code} onChange={e => setProfile({...profile, postal_code: e.target.value})} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{width: '100%'}} disabled={savingProfile}>
              {savingProfile ? 'Saving...' : <><Save size={18} style={{marginRight: '8px', verticalAlign: 'text-bottom'}} /> Save Details</>}
            </button>
          </form>
        </div>

        {/* Order History */}
        <div className="dashboard-card glassmorphism" style={{padding: '30px'}}>
          <h2 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px'}}>
            <Package size={24} /> Order History
          </h2>
          
          {fetchingOrders ? (
            <p>Loading orders...</p>
          ) : orders.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px 0', color: 'var(--color-gray-500)'}}>
              <p>You haven't placed any orders yet.</p>
            </div>
          ) : (
            <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
              {orders.map(order => (
                <div key={order.id} className="order-history-item" style={{display: 'flex', flexDirection: 'column', padding: '15px', border: '1px solid var(--color-gray-200)', borderRadius: 'var(--radius-md)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '10px'}}>
                    <div>
                      <h4 style={{marginBottom: '5px'}}>Order #{order.id}</h4>
                      <span style={{fontSize: '0.85rem', color: 'var(--color-gray-500)'}}>
                        {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px'}}>
                      <div className="order-price" style={{fontWeight: '600'}}>
                        ${Number(order.total).toFixed(2)}
                      </div>
                      <span className={`order-status ${order.status?.toLowerCase().includes('shipped') ? 'shipped' : 'processing'}`}>
                        {order.status || 'Processing'}
                      </span>
                    </div>
                  </div>
                  
                  {order.tracking_number && (
                    <div style={{marginTop: '10px', paddingTop: '10px', borderTop: '1px dashed var(--color-gray-300)', fontSize: '0.9rem'}}>
                      <strong>Tracking Number: </strong> 
                      <span style={{color: 'var(--color-primary)'}}>{order.tracking_number}</span>
                      <a href={`https://parcelsapp.com/en/tracking/${order.tracking_number}`} target="_blank" rel="noopener noreferrer" style={{marginLeft: '15px', color: 'var(--color-accent)', textDecoration: 'underline'}}>
                        Track Package
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerPortal;
