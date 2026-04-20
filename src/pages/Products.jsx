import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { catalogApi, apiCall } from '../api/client';
import { Plus, Tag, Package, Loader2, Search, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Products = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use query param for initial tab
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
      // Direct API calls for list since I didn't add them to catalogApi helper yet
      const cats = await apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken);
      const its = await apiCall(`/items?businessId=${activeBusiness.id}`, {}, sessionToken);
      setCategories(cats);
      setItems(its);
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
    } catch (error) { alert(error.message); }
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
    } catch (error) { alert(error.message); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="Inventory">
      <div className="animate-fade-in">
        {/* Tabs */}
        <div style={{ display: 'flex', background: 'white', borderRadius: 'var(--radius-md)', padding: '4px', marginBottom: '24px', border: '1px solid var(--border)' }}>
          <button 
            onClick={() => setActiveTab('items')}
            style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '600', border: 'none', borderRadius: 'var(--radius-sm)', background: activeTab === 'items' ? 'var(--primary)' : 'transparent', color: activeTab === 'items' ? 'white' : 'var(--text-muted)', transition: '0.2s' }}
          >
            Items ({items.length})
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            style={{ flex: 1, padding: '10px', fontSize: '13px', fontWeight: '600', border: 'none', borderRadius: 'var(--radius-sm)', background: activeTab === 'categories' ? 'var(--primary)' : 'transparent', color: activeTab === 'categories' ? 'white' : 'var(--text-muted)', transition: '0.2s' }}
          >
            Categories ({categories.length})
          </button>
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {activeTab === 'items' ? (
              items.map((item) => (
                <div key={item.id} className="card flex-between" style={{ marginBottom: 0, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Package size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '15px' }}>{item.name}</h3>
                      <p style={{ fontSize: '12px' }}>{categories.find(c => c.id === item.categoryId)?.name || 'General'}</p>
                    </div>
                  </div>
                  <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>₹{item.price}</div>
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="card flex-between" style={{ marginBottom: 0, padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Tag size={20} />
                    </div>
                    <h3 style={{ fontSize: '15px' }}>{cat.name}</h3>
                  </div>
                  <MoreVertical size={18} color="var(--border)" />
                </div>
              ))
            )}
            
            {((activeTab === 'items' && items.length === 0) || (activeTab === 'categories' && categories.length === 0)) && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <Package size={48} style={{ opacity: 0.2, marginBottom: '16px' }} />
                <p>No {activeTab} added yet.</p>
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
          style={{ position: 'fixed', right: '24px', bottom: '100px', width: '56px', height: '56px', borderRadius: '28px', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(79, 70, 229, 0.4)', border: 'none', zIndex: 5 }}
        >
          <Plus size={28} />
        </button>

        {/* Add Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ background: 'white', width: '100%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', padding: '32px 24px var(--safe-area-bottom)' }}>
                <h2 style={{ marginBottom: '24px' }}>Add {modalType === 'item' ? 'Item' : 'Category'}</h2>
                
                <form onSubmit={modalType === 'item' ? handleCreateItem : handleCreateCategory}>
                  {modalType === 'item' ? (
                    <>
                      <div className="input-group">
                        <label className="input-label">ITEM NAME</label>
                        <input className="input-field" placeholder="e.g. Cappuccino" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">PRICE (₹)</label>
                        <input className="input-field" type="number" placeholder="0.00" value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} required />
                      </div>
                      <div className="input-group">
                        <label className="input-label">CATEGORY</label>
                        <select className="input-field" value={newItem.categoryId} onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="input-group">
                      <label className="input-label">CATEGORY NAME</label>
                      <input className="input-field" placeholder="e.g. Beverages" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
                    </div>
                  )}
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', marginTop: '12px' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : `Save ${modalType}`}
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
