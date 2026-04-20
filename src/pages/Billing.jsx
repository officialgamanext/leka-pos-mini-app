import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { catalogApi, billsApi, apiCall } from '../api/client';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Loader2, 
  ChevronRight, 
  IndianRupee,
  X,
  CreditCard,
  Wallet,
  Receipt,
  Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Billing.css';

const Billing = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, [sessionToken, activeBusiness]);

  const fetchData = async () => {
    try {
      const its = await apiCall(`/items?businessId=${activeBusiness.id}`, {}, sessionToken);
      const cats = await apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken);
      setItems(its);
      setCategories(cats);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = (item) => {
    const existing = cart.find(i => i.id === item.id);
    if (existing) {
      setCart(cart.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map(i => {
      if (i.id === id) {
        const newQty = Math.max(0, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }).filter(i => i.quantity > 0));
  };

  const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      await billsApi.create(activeBusiness.id, {
        items: cart.map(i => ({ itemId: i.id, quantity: i.quantity, price: i.price })),
        total: total
      }, sessionToken);
      setCart([]);
      setShowCheckout(false);
      alert('Bill generated successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredItems = items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <AppLayout title="Billing">
      <div className="billing-page">
        {/* Search Header */}
        <div className="search-section">
          <Search size={18} className="search-icon" />
          <input 
            className="input-field search-input" 
            placeholder="Search items to add..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="text-center" style={{ padding: '40px' }}>
            <Loader2 className="animate-spin" size={24} color="var(--primary)" />
          </div>
        ) : (
          <div className="products-grid">
            {filteredItems.map(item => (
              <motion.div 
                key={item.id} 
                whileTap={{ scale: 0.96 }}
                onClick={() => addToCart(item)}
                className="card product-card"
              >
                <div className="product-image-placeholder">
                   <Package size={28} opacity={0.4} />
                </div>
                <div>
                  <h3 className="product-name">{item.name}</h3>
                  <div className="product-price">₹{item.price}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Floating Cart Bar */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div 
              initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }}
              className="floating-cart-bar"
            >
              <button 
                onClick={() => setShowCheckout(true)}
                className="btn btn-primary cart-btn"
              >
                <div className="cart-info">
                  <div className="cart-icon-box">
                    <ShoppingCart size={18} />
                  </div>
                  <div className="cart-summary">
                    <div className="cart-count">{cart.length} ITEMS ADDED</div>
                    <div className="cart-total">₹{total}</div>
                  </div>
                </div>
                <div className="cart-action">
                  CHECKOUT <ChevronRight size={18} />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="modal-content" style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div className="modal-header">
                  <div className="item-main">
                    <div className="logo-box" style={{ background: 'var(--primary-light)' }}>
                      <Receipt size={18} color="var(--primary)" />
                    </div>
                    <h2 style={{ fontSize: '18px' }}>Order Summary</h2>
                  </div>
                  <button className="close-btn" onClick={() => setShowCheckout(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="order-summary-list">
                  {cart.map(i => (
                    <div key={i.id} className="card order-item-card">
                      <div className="order-item-icon">
                        <Package size={20} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{i.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>₹{i.price}</div>
                      </div>
                      <div className="qty-controls">
                        <button className="qty-btn" onClick={() => updateQty(i.id, -1)}><Minus size={14} /></button>
                        <span className="qty-val">{i.quantity}</span>
                        <button className="qty-btn" onClick={() => updateQty(i.id, 1)}><Plus size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card grand-total-section">
                  <div className="total-row">
                    <span className="total-label">Subtotal ({cart.length} items)</span>
                    <span className="total-val">₹{total}</span>
                  </div>
                  <div className="grand-total-row">
                    <span className="grand-label">Grand Total</span>
                    <span className="grand-val">₹{total}</span>
                  </div>
                </div>

                <div className="modal-actions">
                  <button onClick={() => setShowCheckout(false)} className="btn btn-ghost">Cancel</button>
                  <button onClick={handleCheckout} className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Complete Payment'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Billing;
