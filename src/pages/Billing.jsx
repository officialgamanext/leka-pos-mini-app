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
    <AppLayout title="POS Billing">
      <div className="animate-fade-in">
        {/* Search Bar */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            className="input-field" 
            placeholder="Search products..." 
            style={{ paddingLeft: '44px', background: 'white', border: '1px solid var(--border)',boxShadow: 'var(--shadow-sm)' }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}><Loader2 className="animate-spin" size={24} color="var(--primary)" /></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingBottom: '160px' }}>
            {filteredItems.map(item => (
              <motion.div 
                key={item.id} 
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item)}
                className="card" 
                style={{ padding: '14px', marginBottom: 0, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '8px' }}
              >
                <div style={{ width: '100%', aspectRatio: '1', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                   <Package size={32} opacity={0.5} />
                </div>
                <div>
                  <h3 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '2px' }}>{item.name}</h3>
                  <div style={{ color: 'var(--primary)', fontWeight: '800', fontSize: '14px' }}>₹{item.price}</div>
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
              style={{ position: 'fixed', bottom: '80px', left: '12px', right: '12px', zIndex: 90 }}
            >
              <button 
                onClick={() => setShowCheckout(true)}
                className="btn btn-primary"
                style={{ height: '60px', padding: '0 24px', justifyContent: 'space-between', borderRadius: '18px', boxShadow: '0 8px 30px rgba(51, 121, 167, 0.4)' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShoppingCart size={18} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: '11px', opacity: 0.8, fontWeight: '600' }}>{cart.length} ITEMS</div>
                    <div style={{ fontSize: '16px', fontWeight: '800' }}>₹{total}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '800' }}>
                  CHECKOUT <ChevronRight size={18} />
                </div>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showCheckout && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="modal-content"
                style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
              >
                <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
                
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Receipt size={20} />
                    </div>
                    <h2 style={{ fontSize: '20px' }}>Order Summary</h2>
                  </div>
                  <button onClick={() => setShowCheckout(false)} style={{ background: 'white', border: '1px solid var(--border)', padding: '6px', borderRadius: '10px', color: 'var(--text-muted)', display: 'flex' }}>
                    <X size={20} />
                  </button>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px', paddingRight: '4px' }}>
                  {cart.map(i => (
                    <div key={i.id} className="card" style={{ padding: '12px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '40px', height: '40px', background: 'var(--background)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                         <Package size={20} color="var(--text-muted)" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: '700' }}>{i.name}</div>
                        <div style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '700' }}>₹{i.price}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'var(--background)', padding: '4px 8px', borderRadius: '10px' }}>
                        <button onClick={() => updateQty(i.id, -1)} style={{ background: 'none', border: 'none', color: 'var(--primary)' }}><Minus size={16} /></button>
                        <span style={{ fontWeight: '800', fontSize: '14px', minWidth: '20px', textAlign: 'center' }}>{i.quantity}</span>
                        <button onClick={() => updateQty(i.id, 1)} style={{ background: 'none', border: 'none', color: 'var(--primary)' }}><Plus size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ background: 'var(--primary-light)', border: 'none', padding: '16px', marginBottom: '24px' }}>
                  <div className="flex-between" style={{ marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-muted)' }}>Items Total</span>
                    <span style={{ fontWeight: '700' }}>₹{total}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ fontSize: '15px', fontWeight: '800', color: 'var(--primary)' }}>Grand Total</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--primary)' }}>₹{total}</span>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <button onClick={() => setShowCheckout(false)} className="btn" style={{ background: '#F1F5F9', color: '#64748B' }}>Cancel</button>
                  <button onClick={handleCheckout} className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                         Confirm Payment <ChevronRight size={18} />
                      </div>
                    )}
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
