import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { billApi, apiCall } from '../api/client';
import { Search, ShoppingCart, Plus, Minus, X, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Billing = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const its = await apiCall(`/items?businessId=${activeBusiness.id}`, {}, sessionToken);
      const cats = await apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken);
      setItems(its);
      setCategories(cats);
    } catch (e) { console.error(e); }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId) => {
    setCart(prev => prev.map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - 1) } : i).filter(i => i.quantity > 0));
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    try {
      // API expects items as { name, price, quantity, categoryId }
      const billItems = cart.map(i => ({
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        categoryId: i.categoryId
      }));
      await billApi.create(activeBusiness.id, billItems, total, sessionToken);
      setOrderSuccess(true);
      setCart([]);
      setTimeout(() => {
        setOrderSuccess(false);
        setShowCheckout(false);
      }, 2000);
    } catch (e) { alert(e.message); }
    finally { setIsSubmitting(false); }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategoryId === 'all' || item.categoryId === activeCategoryId;
    return matchesSearch && matchesCategory;
  });

  return (
    <AppLayout title="New Bill">
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        
        {/* Search & Categories */}
        <div style={{ position: 'sticky', top: 0, background: 'var(--background)', zIndex: 1, paddingBottom: '16px' }}>
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              className="input-field" 
              placeholder="Search items..." 
              style={{ paddingLeft: '40px' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button 
              onClick={() => setActiveCategoryId('all')}
              style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', border: 'none', background: activeCategoryId === 'all' ? 'var(--primary)' : 'white', color: activeCategoryId === 'all' ? 'white' : 'var(--text-muted)', boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap' }}
            >
              All
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{ padding: '6px 14px', borderRadius: '100px', fontSize: '12px', border: 'none', background: activeCategoryId === cat.id ? 'var(--primary)' : 'white', color: activeCategoryId === cat.id ? 'white' : 'var(--text-muted)', boxShadow: 'var(--shadow-sm)', whiteSpace: 'nowrap' }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
          {filteredItems.map(item => {
            const cartItem = cart.find(i => i.id === item.id);
            return (
              <motion.div 
                key={item.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item)}
                className="card"
                style={{ padding: '12px', marginBottom: 0, position: 'relative', overflow: 'hidden' }}
              >
                <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>{item.name}</div>
                <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>₹{item.price}</div>
                
                {cartItem && (
                   <div style={{ position: 'absolute', top: 0, right: 0, background: 'var(--primary)', color: 'white', fontSize: '10px', padding: '2px 8px', borderBottomLeftRadius: 'var(--radius-md)' }}>
                     {cartItem.quantity}
                   </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Checkout Bar */}
        <AnimatePresence>
          {cart.length > 0 && (
            <motion.div 
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              style={{ position: 'fixed', bottom: '80px', left: '20px', right: '20px', zIndex: 10 }}
            >
              <button 
                className="btn btn-primary" 
                onClick={() => setShowCheckout(true)}
                style={{ height: '56px', borderRadius: 'var(--radius-xl)', boxShadow: '0 12px 24px rgba(79, 70, 229, 0.4)', padding: '0 20px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingCart size={20} />
                  <span>{cart.reduce((s, i) => s + i.quantity, 0)} Items</span>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                  <span style={{ opacity: 0.8, fontSize: '12px', marginRight: '8px' }}>Total:</span>
                  <span style={{ fontSize: '18px' }}>₹{total}</span>
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                style={{ background: 'white', width: '100%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', padding: '32px 24px var(--safe-area-bottom)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              >
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                  <h2>Review Order</h2>
                  <button onClick={() => setShowCheckout(false)} style={{ background: 'var(--background)', border: 'none', padding: '8px', borderRadius: '100px' }}><X size={20}/></button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
                  {cart.map(item => (
                    <div key={item.id} className="flex-between" style={{ padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600' }}>{item.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>₹{item.price} each</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <button onClick={() => removeFromCart(item.id)} style={{ width: '28px', height: '28px', border: '1px solid var(--border)', borderRadius: '14px', background: 'none' }}><Minus size={14}/></button>
                        <span style={{ fontWeight: '700', width: '20px', textAlign: 'center' }}>{item.quantity}</span>
                        <button onClick={() => addToCart(item)} style={{ width: '28px', height: '28px', background: 'var(--primary-light)', color: 'var(--primary)', border: 'none', borderRadius: '14px' }}><Plus size={14}/></button>
                      </div>
                      <div style={{ fontWeight: '700', marginLeft: '16px', minWidth: '60px', textAlign: 'right' }}>₹{item.price * item.quantity}</div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ background: 'var(--primary-light)', border: 'none', padding: '16px' }}>
                  <div className="flex-between" style={{ color: 'var(--primary)', fontWeight: '700', fontSize: '20px' }}>
                    <span>Grand Total</span>
                    <span>₹{total}</span>
                  </div>
                </div>

                <button 
                  className="btn btn-primary" 
                  onClick={handleCheckout}
                  disabled={isSubmitting || orderSuccess}
                  style={{ height: '56px', fontSize: '18px', marginTop: '16px' }}
                >
                  {isSubmitting ? <Loader2 className="animate-spin" /> : orderSuccess ? <Check /> : 'Print & Confirm Bill'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Billing;
