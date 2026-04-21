import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { useToast } from '../components/Toast';
import { billsApi, apiCall } from '../api/client';
import { Search, ShoppingCart, Plus, Minus, Loader2, ChevronRight, X, Receipt, Package, Banknote, CreditCard, QrCode, ReceiptText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isPrinterConnected, printText } from '../utils/bluetooth';
import { useSync } from '../context/SyncContext';
import { localDb } from '../utils/localDb';
import '../styles/Billing.css';

const Billing = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const { showToast } = useToast();

  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');
  const [paymentMode, setPaymentMode] = useState('Cash');

  const { isSyncing, syncNow, updatePendingCount } = useSync();

  useEffect(() => { fetchData(); }, [sessionToken, activeBusiness]);

  const fetchData = async () => {
    // 1. Try to load from LocalDB first (Fast!)
    try {
      const cachedItems = await localDb.getCatalog(`items_${activeBusiness.id}`);
      const cachedCats = await localDb.getCatalog(`cats_${activeBusiness.id}`);
      if (cachedItems) setItems(cachedItems);
      if (cachedCats) setCategories(cachedCats);
      if (cachedItems || cachedCats) setIsLoading(false);
    } catch (e) { console.warn("Local cache read failed", e); }

    // 2. Fetch fresh data from API
    try {
      const [its, cats] = await Promise.all([
        apiCall(`/items?businessId=${activeBusiness.id}`, {}, sessionToken),
        apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken)
      ]);
      const itsArr = Array.isArray(its) ? its : [];
      const catsArr = Array.isArray(cats) ? cats : [];

      setItems(itsArr);
      setCategories(catsArr);

      // Save to LocalDB for next time
      await localDb.saveCatalog(`items_${activeBusiness.id}`, itsArr);
      await localDb.saveCatalog(`cats_${activeBusiness.id}`, catsArr);
    } catch (e) {
      console.error("API fetch failed, using local data", e);
      if (isLoading) showToast("Working Offline (Last Cached Data)", "warning");
    }
    finally { setIsLoading(false); }
  };

  const addToCart = (item) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === item.id);
      return ex ? prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i)
        : [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i).filter(i => i.qty > 0));
  };

  const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const gstRate = activeBusiness?.gstEnabled ? Number(activeBusiness?.gstPercentage || 0) : 0;
  const gstAmount = subtotal * (gstRate / 100);
  const total = subtotal + gstAmount;

  const checkout = async () => {
    setIsSubmitting(true);
    try {
      const billData = {
        items: cart.map(i => ({
          itemId: i.id,
          name: i.name,
          categoryId: i.categoryId || null,
          quantity: i.qty,
          price: i.price
        })),
        subtotal,
        gstRate,
        gstAmount,
        total,
        paymentMode
      };

      // 1. SAVE LOCALLY (Instant!)
      await localDb.addPendingBill(activeBusiness.id, billData);

      // 2. TRIGGER PRINT (Optional but desired in POS)
      if (isPrinterConnected()) {
        const center = (text, len = 32) => {
          const t = String(text || '').substring(0, len);
          const pad = Math.floor((len - t.length) / 2);
          return ' '.repeat(Math.max(0, pad)) + t;
        };
        const alignLR = (l, r, len = 32) => {
          let left = String(l || '').substring(0, len - String(r || '').length - 1);
          let space = len - left.length - String(r || '').length;
          return left + ' '.repeat(Math.max(0, space)) + r;
        };

        let receipt = '';
        receipt += center(activeBusiness.name || 'Leka POS') + '\n';
        if (activeBusiness.address) {
          // Wrapped address support (basic)
          const addr = activeBusiness.address.match(/.{1,32}/g) || [activeBusiness.address];
          addr.forEach(line => receipt += center(line) + '\n');
        }
        receipt += '-'.repeat(32) + '\n';
        receipt += 'Item'.padEnd(18, ' ') + 'Qty'.padStart(6, ' ') + 'Amt'.padStart(8, ' ') + '\n';
        receipt += '-'.repeat(32) + '\n';
        cart.forEach(i => {
          let name = i.name.substring(0, 18).padEnd(18, ' ');
          let qty = String(i.qty).padStart(6, ' ');
          let priceStr = (i.qty * i.price).toLocaleString('en-IN').padStart(8, ' ');
          receipt += `${name}${qty}${priceStr}\n`;
        });
        receipt += '-'.repeat(32) + '\n';
        receipt += alignLR('Subtotal:', subtotal.toLocaleString('en-IN')) + '\n';
        if (gstRate > 0) {
          receipt += alignLR(`GST (${gstRate}%):`, gstAmount.toLocaleString('en-IN')) + '\n';
        }
        receipt += alignLR('GRAND TOTAL:', total.toLocaleString('en-IN')) + '\n';
        receipt += alignLR('Payment Mode:', paymentMode) + '\n';
        receipt += '-'.repeat(32) + '\n';
        receipt += center('Thank you, visit again!') + '\n';
        await printText(receipt).catch(err => console.error("Print error:", err));
      }

      // 3. UI RESET (Instantly)
      setCart([]);
      setShowCheckout(false);
      showToast('Bill Saved Locally!', 'success');

      // 4. TRIGGER SYNC ATTEMPT IN BACKGROUND
      updatePendingCount();
      syncNow(); // Start syncing in background without making user wait

    } catch (e) {
      showToast('Checkout failed. Please retry.', 'error');
      console.error(e);
    }
    finally { setIsSubmitting(false); }
  };

  const filtered = items.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCat === 'all' || i.categoryId === selectedCat;
    return matchSearch && matchCat;
  });
  const cartMap = Object.fromEntries(cart.map(i => [i.id, i.qty]));

  return (
    <AppLayout>
      <div className="bl-page">

        {/* Search */}
        <div className="bl-search-wrap">
          <Search size={16} className="bl-search-icon" />
          <input
            className="input-field bl-search-input"
            placeholder="Search items…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {/* Category Chips */}
        <div className="bl-cat-chips">
          <button
            className={`bl-cat-chip ${selectedCat === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedCat('all')}
          >
            All Items
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              className={`bl-cat-chip ${selectedCat === c.id ? 'active' : ''}`}
              onClick={() => setSelectedCat(c.id)}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {isLoading ? (
          <div className="text-center" style={{ padding: 40 }}>
            <Loader2 className="spin" size={26} color="var(--primary)" />
          </div>
        ) : (
          <div className="bl-grid">
            {filtered.map(item => (
              <motion.div
                key={item.id}
                className={`card bl-product-card ${cartMap[item.id] ? 'selected' : ''}`}
                whileTap={{ scale: 0.95 }}
                onClick={() => addToCart(item)}
              >
                {cartMap[item.id] && (
                  <span className="bl-cart-badge">{cartMap[item.id]}</span>
                )}
                <div className="bl-product-thumb">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <Package size={26} opacity={0.45} />
                  )}
                </div>
                <p className="bl-product-name">{item.name}</p>
                <p className="bl-product-price">₹{item.price}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* Floating cart bar - portaled to body to escape transform context */}
        {createPortal(
          <AnimatePresence>
            {cart.length > 0 && (
              <motion.div
                className="bl-cart-bar"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 80, opacity: 0 }}
                transition={{ type: 'spring', damping: 24, stiffness: 280 }}
              >
                <button className="bl-cart-btn" onClick={() => setShowCheckout(true)}>
                  <div className="bl-cart-left">
                    <div className="bl-cart-count-box">
                      <ShoppingCart size={16} />
                    </div>
                    <div>
                      <div className="bl-cart-count">{cart.length} ITEMS</div>
                      <div className="bl-cart-total">₹{total.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                  <div className="bl-cart-cta">Checkout <ChevronRight size={16} /></div>
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

        {/* Checkout Modal — rendered at body level via Portal */}
        <AnimatePresence>
          {showCheckout && (
            <ModalPortal>
              <motion.div
                key="bl-overlay"
                className="modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={e => e.target === e.currentTarget && setShowCheckout(false)}
              >
                <motion.div
                  key="bl-sheet"
                  className="modal-sheet"
                  initial={{ y: '100%' }}
                  animate={{ y: 0 }}
                  exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                >
                  <div className="modal-drag-bar" />

                  <div className="modal-head">
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="logo-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                        <ReceiptText size={16} />
                      </div>
                      <h2>Order Summary</h2>
                    </div>
                    <button className="modal-close" onClick={() => setShowCheckout(false)}><X size={18} /></button>
                  </div>

                  <div className="bl-order-list modal-body">
                    {cart.map(i => (
                      <div key={i.id} className="card bl-order-item">
                        <div className="bl-order-icon" style={{ overflow: 'hidden' }}>
                          {i.imageUrl ? (
                            <img src={i.imageUrl} alt={i.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <Package size={17} />
                          )}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p className="bl-order-name">{i.name}</p>
                          <p className="bl-order-price">₹{i.price}</p>
                        </div>
                        <div className="bl-qty-row">
                          <button className="bl-qty-btn" onClick={() => updateQty(i.id, -1)}><Minus size={12} /></button>
                          <span className="bl-qty-val">{i.qty}</span>
                          <button className="bl-qty-btn" onClick={() => updateQty(i.id, 1)}><Plus size={12} /></button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bl-total-box">
                    <div className="bl-total-row">
                      <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>Subtotal</span>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>₹{subtotal.toLocaleString('en-IN')}</span>
                    </div>
                    {gstRate > 0 && (
                      <div className="bl-total-row">
                        <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 600 }}>GST ({gstRate}%)</span>
                        <span style={{ fontSize: 13, fontWeight: 700 }}>+ ₹{gstAmount.toLocaleString('en-IN')}</span>
                      </div>
                    )}
                    <div className="bl-total-row" style={{ marginTop: 12, marginBottom: 12 }}>
                      <div style={{ display: 'flex', gap: 6, width: '100%' }}>
                        {['Cash', 'UPI', 'Card'].map(m => (
                          <button
                            key={m}
                            onClick={() => setPaymentMode(m)}
                            style={{
                              flex: 1, padding: '8px', borderRadius: '8px',
                              border: `1.5px solid ${paymentMode === m ? 'var(--primary)' : 'var(--border)'}`,
                              background: paymentMode === m ? 'var(--primary-light)' : 'transparent',
                              color: paymentMode === m ? 'var(--primary)' : 'var(--text-sub)',
                              fontWeight: 700, fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'
                            }}
                          >
                            {m === 'Cash' ? <Banknote size={14} /> : m === 'UPI' ? <QrCode size={14} /> : <CreditCard size={14} />} {m}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="bl-total-row">
                      <span className="bl-grand-label" style={{ fontSize: 13 }}>Grand Total</span>
                      <span className="bl-grand-val">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  <div className="modal-foot">
                    <button className="btn btn-ghost" onClick={() => setShowCheckout(false)}>Cancel</button>
                    <button className="btn btn-primary" onClick={checkout} disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="spin" size={17} /> : 'Settle Bill'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            </ModalPortal>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
};

export default Billing;
