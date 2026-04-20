import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { catalogApi, apiCall } from '../api/client';
import { Plus, Tag, Package, Loader2, Search, MoreVertical, X, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') || 'items';
  });
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [modalType, setModalType] = useState('item'); // 'item' or 'category'
  
  const [newItem, setNewItem] = useState({ name: '', price: '', categoryId: '' });
  const [newCategory, setNewCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [sessionToken, activeBusiness]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const cats = await apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken);
      const its = await apiCall(`/items?businessId=${activeBusiness.id}`, {}, sessionToken);
      setCategories(Array.isArray(cats) ? cats : []);
      setItems(Array.isArray(its) ? its : []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    setIsSubmitting(true);
    try {
      await catalogApi.createCategory(activeBusiness.id, newCategory, sessionToken);
      setShowAddModal(false);
      setNewCategory('');
      fetchData();
    } catch (error) { console.error(error); }
    finally { setIsSubmitting(false); }
  };

  const handleCreateItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) return;
    setIsSubmitting(true);
    try {
      await catalogApi.createItem(activeBusiness.id, {
        name: newItem.name,
        price: Number(newItem.price),
        categoryId: newItem.categoryId || null
      }, sessionToken);
      setShowAddModal(false);
      setNewItem({ name: '', price: '', categoryId: '' });
      fetchData();
    } catch (error) { console.error(error); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="Inventory" backPath="/profile">
      <div className="animate-fade-in">
        {/* Modern Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: '12px', padding: '4px', marginBottom: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
          <button 
            onClick={() => setActiveTab('items')}
            style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '8px', background: activeTab === 'items' ? 'var(--primary)' : 'transparent', color: activeTab === 'items' ? 'white' : 'var(--text-muted)', transition: '0.2s' }}
          >
            Items ({items.length})
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '700', border: 'none', borderRadius: '8px', background: activeTab === 'categories' ? 'var(--primary)' : 'transparent', color: activeTab === 'categories' ? 'white' : 'var(--text-muted)', transition: '0.2s' }}
          >
            Categories ({categories.length})
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {activeTab === 'items' ? (
              items.map((item) => (
                <div key={item.id} className="card flex-between" style={{ padding: '12px 14px', marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: '700' }}>{item.name}</h3>
                      <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{categories.find(c => c.id === item.categoryId)?.name || 'General'}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>₹{item.price}</div>
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="card flex-between" style={{ padding: '12px 14px', marginBottom: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '42px', height: '42px', background: 'var(--secondary)', color: 'white', opacity: 0.8, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Tag size={20} />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: '700' }}>{cat.name}</h3>
                  </div>
                  <MoreVertical size={16} color="var(--border)" />
                </div>
              ))
            )}
            
            {((activeTab === 'items' && items.length === 0) || (activeTab === 'categories' && categories.length === 0)) && (
              <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
                <Package size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p style={{ fontSize: '14px' }}>No {activeTab} defined yet.</p>
              </div>
            )}
          </div>
        )}

        {/* Floating Add Button */}
        <button 
          onClick={() => {
            setModalType(activeTab === 'items' ? 'item' : 'category');
            setShowAddModal(true);
          }}
          style={{ position: 'fixed', right: '20px', bottom: '90px', width: '56px', height: '56px', borderRadius: '28px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 30px rgba(51, 121, 167, 0.4)', border: 'none', zIndex: 50 }}
        >
          <Plus size={28} />
        </button>

        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="modal-content">
                <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
                
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px' }}>Add {modalType === 'item' ? 'Inventory Item' : 'New Category'}</h2>
                  <button onClick={() => setShowAddModal(false)} style={{ background: 'var(--primary-light)', border: 'none', padding: '6px', borderRadius: '8px', color: 'var(--primary)', display: 'flex' }}>
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={modalType === 'item' ? handleCreateItem : handleCreateCategory}>
                  {modalType === 'item' ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">PRODUCT NAME</label>
                        <input autoFocus className="input-field" placeholder="e.g. Cold Coffee" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} required />
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">SALE PRICE</label>
                        <div style={{ position: 'relative' }}>
                           <IndianRupee size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                           <input className="input-field" type="number" placeholder="0.00" style={{ paddingLeft: '36px' }} value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} required />
                        </div>
                      </div>
                      <div className="input-group" style={{ marginBottom: 0 }}>
                        <label className="input-label">CATEGORY</label>
                        <select className="input-field" style={{ appearance: 'none' }} value={newItem.categoryId} onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}>
                          <option value="">Select Category (Optional)</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="input-group" style={{ marginBottom: 24 }}>
                      <label className="input-label">CATEGORY NAME</label>
                      <input autoFocus className="input-field" placeholder="e.g. Beverages" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '32px' }}>
                    <button type="button" className="btn" style={{ background: '#F1F5F9', color: '#64748B' }} onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : `Save ${modalType === 'item' ? 'Item' : 'Category'}`}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
};

export default Products;
