import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Lock, Upload, Plus, Settings } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
  const { session, role, loading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [activeTab, setActiveTab] = useState('products');
  const [orders, setOrders] = useState([]);
  const [fetchingOrders, setFetchingOrders] = useState(false);
  const { settings, fetchSettings } = useSettings();
  
  // Settings Form State
  const [localSettings, setLocalSettings] = useState({
    brand_name: '',
    hero_title: '',
    hero_subtitle: '',
    footer_text: '',
    contact_email: '',
    contact_phone: ''
  });
  
  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Dresses',
    sizes: 'XS, S, M, L, XL',
    sale_price: '',
    is_on_sale: false
  });
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (session && role === 'admin') {
      fetchProducts();
      fetchAllOrders();
    }
  }, [session, role]);

  const fetchAllOrders = async () => {
    setFetchingOrders(true);
    try {
      const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
      if (data) setOrders(data);
    } catch (err) {
      console.log('Error fetching orders:', err.message);
    } finally {
      setFetchingOrders(false);
    }
  };

  useEffect(() => {
    if (settings) {
      setLocalSettings({
        brand_name: settings.brand_name || '',
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        footer_text: settings.footer_text || '',
        contact_email: settings.contact_email || '',
        contact_phone: settings.contact_phone || ''
      });
    }
  }, [settings]);

  const handleUpdateSettings = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.from('store_settings').upsert({ id: 1, ...localSettings });
      if (error) throw error;
      alert('Settings updated successfully!');
      fetchSettings(); // Refresh global context
    } catch (err) {
      alert('Error updating settings: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Mock fetching logic until DB is created
      const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
      if (error && error.code !== 'PGRST116') {
        console.error("Error fetching products:", error.message);
      } else if (data) {
        setProducts(data);
      }
    } catch (err) {
      console.log('Setup pending:', err.message);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let imageUrl = '';

      // 1. Upload Image
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `product-images/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(filePath, imageFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('products').getPublicUrl(filePath);
        imageUrl = data.publicUrl;
      }

      // 2. Insert Product into Database
      const { error: insertError } = await supabase
        .from('products')
        .insert([
          { 
            name: newProduct.name, 
            price: parseFloat(newProduct.price), 
            description: newProduct.description,
            category: newProduct.category,
            sizes: newProduct.sizes,
            image_url: imageUrl,
            is_on_sale: newProduct.is_on_sale,
            sale_price: newProduct.sale_price ? parseFloat(newProduct.sale_price) : null
          }
        ]);

      if (insertError) throw insertError;
      
      alert('Product Added Successfully!');
      setNewProduct({ name: '', price: '', description: '', category: 'Dresses', sizes: 'XS, S, M, L, XL', sale_price: '', is_on_sale: false });
      setImageFile(null);
      fetchProducts();
      
    } catch (error) {
      alert('Error adding product: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus, newTracking) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus, tracking_number: newTracking })
        .eq('id', orderId);
      
      if (error) throw error;
      alert('Order updated!');
      fetchAllOrders();
    } catch (err) {
      alert('Error updating order: ' + err.message);
    }
  };

  if (authLoading) return <div className="container" style={{padding: '5rem'}}>Loading dashboard...</div>;

  if (!session || role !== 'admin') {
    return (
      <div className="admin-login-container animate-fade-in">
        <div className="admin-login-box glassmorphism">
          <div className="admin-login-header">
            <Lock size={32} />
            <h2>Admin Login</h2>
            <p>Enter your credentials to access the dashboard</p>
          </div>
          {session && role !== 'admin' && (
            <div style={{color: 'red', marginBottom: '15px', textAlign: 'center'}}>
              Access Denied: Your account does not have admin privileges.
              <br/>
              <button 
                type="button"
                onClick={async () => {
                  setLoading(true);
                  await supabase.auth.updateUser({ data: { role: 'admin' } });
                  window.location.reload();
                }} 
                style={{marginTop: '10px', padding: '8px', cursor: 'pointer', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px'}}
              >
                Upgrade Account to Admin (Testing)
              </button>
            </div>
          )}
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Admin Email" 
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
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Logging in...' : 'Access Dashboard'}
            </button>
            <button 
              type="button" 
              className="btn" 
              style={{marginTop: '10px', width: '100%', backgroundColor: 'transparent', border: '1px solid var(--color-gray-300)'}}
              onClick={async () => {
                setLoading(true);
                const { error, data } = await supabase.auth.signUp({ 
                  email, 
                  password,
                  options: {
                    data: {
                      role: 'admin'
                    }
                  }
                });
                if (error) {
                  alert("Signup Error: " + error.message);
                } else {
                  alert("Account created successfully! Try logging in now.");
                }
                setLoading(false);
              }}
              disabled={loading}
            >
              Create Admin Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard container animate-fade-in">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button onClick={handleLogout} className="btn">Logout</button>
      </div>

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Manage Orders
        </button>
        <button 
          className={`tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Manage Products
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={18} /> Global Settings
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div className="dashboard-layout">
          <div className="dashboard-card list-section glassmorphism" style={{ width: '100%' }}>
            <h2>Manage Customer Orders</h2>
            {fetchingOrders ? (
              <p>Loading orders...</p>
            ) : orders.length === 0 ? (
              <div className="empty-state">
                <p>No orders yet.</p>
              </div>
            ) : (
              <div className="admin-product-list" style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
                {orders.map(order => (
                  <div key={order.id} className="admin-product-item" style={{display: 'flex', flexDirection: 'column', padding: '15px', borderBottom: '1px solid var(--color-gray-200)', gap: '10px', alignItems: 'flex-start'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
                      <div>
                        <strong>Order #{order.id}</strong>
                        <div style={{fontSize: '0.85rem', color: 'var(--color-gray-500)'}}>Date: {new Date(order.created_at).toLocaleDateString()}</div>
                        <div style={{fontSize: '0.85rem', color: 'var(--color-gray-500)'}}>Total: ${order.total.toFixed(2)}</div>
                      </div>
                      <div style={{display: 'flex', flexDirection: 'column', gap: '5px', alignItems: 'flex-end'}}>
                        <select 
                          className="form-input" 
                          style={{padding: '5px', fontSize: '0.9rem', width: '150px'}}
                          value={order.status || 'Paid - Processing'}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value, order.tracking_number)}
                        >
                          <option value="Paid - Processing">Processing</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                    
                    <div style={{width: '100%', display: 'flex', gap: '10px', alignItems: 'center'}}>
                      <input 
                        type="text" 
                        placeholder="Tracking Number (e.g. UPS...)" 
                        className="form-input"
                        style={{padding: '8px', flex: 1, fontSize: '0.9rem'}}
                        defaultValue={order.tracking_number || ''}
                        onBlur={(e) => {
                          if (e.target.value !== order.tracking_number) {
                            updateOrderStatus(order.id, order.status, e.target.value);
                          }
                        }}
                      />
                      <button className="btn btn-primary" style={{padding: '8px 15px', fontSize: '0.85rem'}} onClick={(e) => {
                        const input = e.target.previousSibling;
                        updateOrderStatus(order.id, order.status, input.value);
                      }}>Save Tracking</button>
                    </div>

                    <div style={{fontSize: '0.85rem', marginTop: '5px', background: 'var(--color-gray-50)', padding: '10px', borderRadius: '4px', width: '100%'}}>
                      <strong>Items: </strong>
                      {order.items?.map((item, i) => (
                        <span key={i}>{item.name} (Qty: {item.quantity}, Size: {item.selectedSize}){i < order.items.length - 1 ? ', ' : ''}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : activeTab === 'products' ? (
        <div className="dashboard-layout">
          {/* Add Product Form */}
          <div className="dashboard-card form-section glassmorphism">
            <h2><Plus size={20} /> Add New Product</h2>
            <form onSubmit={handleAddProduct} className="add-product-form">
              <div className="form-group">
                <label>Product Name</label>
                <input type="text" className="form-input" required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Price ($)</label>
                  <input type="number" step="0.01" className="form-input" required value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <input type="checkbox" checked={newProduct.is_on_sale} onChange={e => setNewProduct({...newProduct, is_on_sale: e.target.checked})} />
                    On Sale?
                  </label>
                  {newProduct.is_on_sale && (
                    <input type="number" step="0.01" placeholder="Sale Price" className="form-input" style={{marginTop: '5px'}} required={newProduct.is_on_sale} value={newProduct.sale_price} onChange={e => setNewProduct({...newProduct, sale_price: e.target.value})} />
                  )}
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                    <option>Dresses</option>
                    <option>Tops</option>
                    <option>Outerwear</option>
                    <option>Accessories</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Available Sizes</label>
                <div style={{display: 'flex', gap: '15px', marginTop: '5px', flexWrap: 'wrap'}}>
                  {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => {
                    const currentSizes = newProduct.sizes ? newProduct.sizes.split(',').map(s => s.trim()) : [];
                    const isChecked = currentSizes.includes(size);
                    return (
                      <label key={size} style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer'}}>
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={(e) => {
                            let newSizesArray = [...currentSizes];
                            if (e.target.checked) {
                              newSizesArray.push(size);
                            } else {
                              newSizesArray = newSizesArray.filter(s => s !== size);
                            }
                            // Keep them in standard order
                            const standardOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                            newSizesArray.sort((a, b) => standardOrder.indexOf(a) - standardOrder.indexOf(b));
                            setNewProduct({...newProduct, sizes: newSizesArray.join(', ')});
                          }} 
                        />
                        {size}
                      </label>
                    );
                  })}
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="form-input" rows="3" required value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})}></textarea>
              </div>
              <div className="form-group image-upload-group">
                <label className="upload-btn">
                  <Upload size={18} /> Choose Product Image
                  <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])} hidden />
                </label>
                <span className="file-name">{imageFile ? imageFile.name : 'No file chosen'}</span>
              </div>
              <button type="submit" className="btn btn-primary add-btn" disabled={loading}>
                {loading ? 'Adding...' : 'Add Product to Store'}
              </button>
            </form>
          </div>

          {/* Product List */}
          <div className="dashboard-card list-section glassmorphism">
            <h2>Manage Products</h2>
            {products.length === 0 ? (
              <div className="empty-state">
                <p>No products yet. Add one to see it here!</p>
              </div>
            ) : (
              <div className="admin-product-list">
                {products.map(p => (
                  <div key={p.id} className="admin-product-item" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '15px', borderBottom: '1px solid var(--color-gray-200)'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px'}}>
                      <div className="admin-thumb" style={{width: '50px', height: '50px', borderRadius: '4px', overflow: 'hidden'}}>
                        {p.image_url ? <img src={p.image_url} alt={p.name} style={{width: '100%', height: '100%', objectFit: 'cover'}} /> : 'Img'}
                      </div>
                      <div className="admin-item-info">
                        <strong style={{display: 'block'}}>{p.name}</strong>
                        <span style={{fontSize: '0.85rem', color: 'var(--color-gray-500)'}}>${p.price} - {p.category}</span>
                      </div>
                    </div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap', justifyContent: 'flex-end'}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                        <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem', color: p.is_on_sale ? 'var(--color-accent)' : 'inherit'}}>
                          <input 
                            type="checkbox" 
                            checked={p.is_on_sale || false} 
                            onChange={async (e) => {
                              const newStatus = e.target.checked;
                              const { error } = await supabase.from('products').update({ is_on_sale: newStatus }).eq('id', p.id);
                              if (!error) fetchProducts();
                            }}
                          /> 
                          On Sale
                        </label>
                        {p.is_on_sale && (
                          <input 
                            type="number" 
                            step="0.01" 
                            placeholder="Sale Price"
                            className="form-input" 
                            style={{padding: '4px 8px', fontSize: '0.85rem', width: '80px', marginLeft: '5px'}}
                            defaultValue={p.sale_price || ''}
                            onBlur={async (e) => {
                              const val = e.target.value;
                              if (val !== String(p.sale_price)) {
                                await supabase.from('products').update({ sale_price: val ? parseFloat(val) : null }).eq('id', p.id);
                                fetchProducts();
                              }
                            }}
                          />
                        )}
                      </div>
                      <label style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '0.9rem', color: p.is_sold_out ? 'var(--color-accent)' : 'inherit', marginLeft: '10px'}}>
                        <input 
                          type="checkbox" 
                          checked={p.is_sold_out || false} 
                          onChange={async (e) => {
                            const newStatus = e.target.checked;
                            const { error } = await supabase.from('products').update({ is_sold_out: newStatus }).eq('id', p.id);
                            if (error) {
                              alert('Error updating status: ' + error.message);
                            } else {
                              fetchProducts();
                            }
                          }}
                        /> 
                        Sold Out
                      </label>
                      <button className="delete-btn" style={{padding: '6px 12px', fontSize: '0.85rem'}}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="dashboard-layout settings-layout">
          <div className="dashboard-card form-section glassmorphism" style={{ maxWidth: '800px', margin: '0 auto', width: '100%' }}>
            <h2><Settings size={20} /> Store Settings</h2>
            <p style={{ color: 'var(--color-gray-600)', marginBottom: '20px' }}>
              These settings will instantly update across your entire website.
            </p>
            
            <form onSubmit={handleUpdateSettings} className="add-product-form">
              <div className="form-group">
                <label>Website / Brand Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={localSettings.brand_name} 
                  onChange={e => setLocalSettings({...localSettings, brand_name: e.target.value})} 
                  placeholder="e.g. AURA"
                />
              </div>

              <div className="form-group">
                <label>Hero Title (Homepage Main Text)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={localSettings.hero_title} 
                  onChange={e => setLocalSettings({...localSettings, hero_title: e.target.value})} 
                  placeholder="e.g. Elevate Your Style"
                />
              </div>

              <div className="form-group">
                <label>Hero Subtitle</label>
                <textarea 
                  className="form-input" 
                  rows="2" 
                  required 
                  value={localSettings.hero_subtitle} 
                  onChange={e => setLocalSettings({...localSettings, hero_subtitle: e.target.value})}
                  placeholder="Short description under the main title..."
                ></textarea>
              </div>

              <div className="form-group">
                <label>Footer Description</label>
                <textarea 
                  className="form-input" 
                  rows="2" 
                  required 
                  value={localSettings.footer_text} 
                  onChange={e => setLocalSettings({...localSettings, footer_text: e.target.value})}
                  placeholder="Text displayed at the very bottom of the site..."
                ></textarea>
              </div>

              <div className="form-group">
                <label>Contact Email</label>
                <input 
                  type="email" 
                  className="form-input" 
                  required 
                  value={localSettings.contact_email} 
                  onChange={e => setLocalSettings({...localSettings, contact_email: e.target.value})}
                  placeholder="support@example.com"
                />
              </div>

              <div className="form-group">
                <label>Contact Phone Number</label>
                <input 
                  type="text" 
                  className="form-input" 
                  required 
                  value={localSettings.contact_phone} 
                  onChange={e => setLocalSettings({...localSettings, contact_phone: e.target.value})}
                  placeholder="1-800-AURA"
                />
              </div>

              <button type="submit" className="btn btn-primary add-btn" disabled={loading}>
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
