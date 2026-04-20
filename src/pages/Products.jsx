import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { catalogApi, apiCall } from '../api/client';
import { Plus, Tag, Package, Loader2, Search, MoreVertical, X, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Products.css';

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
  const [modalType, setModalType] = useState('item'); 
  
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
      <div className="products-page">
        {/* Tab Navigation */}
        <div className="tabs-container">
          <button 
            onClick={() => setActiveTab('items')}
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
          >
            Items ({items.length})
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          >
            Categories ({categories.length})
          </button>
        </div>

        {isLoading ? (
          <div className="empty-state">
            <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div className="inventory-grid">
            {activeTab === 'items' ? (
              items.map((item) => (
                <div key={item.id} className="card inventory-item">
                  <div className="item-main">
                    <div className="item-icon-box">
                      <Package size={20} />
                    </div>
                    <div className="item-info">
                      <h3>{item.name}</h3>
                      <p>{categories.find(c => c.id === item.categoryId)?.name || 'General'}</p>
                    </div>
                  </div>
                  <div className="item-price">₹{item.price}</div>
                </div>
              ))
            ) : (
              categories.map((cat) => (
                <div key={cat.id} className="card inventory-item">
                  <div className="item-main">
                    <div className="cat-icon-box">
                      <Tag size={20} />
                    </div>
                    <div className="item-info">
                      <h3>{cat.name}</h3>
                    </div>
                  </div>
                  <MoreVertical size={16} color="var(--border)" />
                </div>
              ))
            )}
            
            {((activeTab === 'items' && items.length === 0) || (activeTab === 'categories' && categories.length === 0)) && (
              <div className="empty-state">
                <Package size={48} className="empty-icon" />
                <p>No {activeTab} added to this workspace yet.</p>
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
          className="fab-btn"
        >
          <Plus size={28} />
        </button>

        {/* Modal */}
        <AnimatePresence>
          {showAddModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="modal-content">
                <div className="modal-header">
                  <h2>Add {modalType === 'item' ? 'Item' : 'Category'}</h2>
                  <button className="close-btn" onClick={() => setShowAddModal(false)}>
                    <X size={20} />
                  </button>
                </div>
                
                <form onSubmit={modalType === 'item' ? handleCreateItem : handleCreateCategory}>
                  {modalType === 'item' ? (
                    <div className="modal-form-grid">
                      <div>
                        <label className="input-label">PRODUCT NAME</label>
                        <input autoFocus className="input-field" placeholder="e.g. Cold Coffee" value={newItem.name} onChange={(e) => setNewItem({...newItem, name: e.target.value})} required />
                      </div>
                      <div>
                        <label className="input-label">SALE PRICE</label>
                        <div className="price-input-wrapper">
                           <IndianRupee size={16} className="price-icon" />
                           <input className="input-field" type="number" placeholder="0.00" style={{ paddingLeft: '36px' }} value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} required />
                        </div>
                      </div>
                      <div>
                        <label className="input-label">CATEGORY</label>
                        <select className="input-field" value={newItem.categoryId} onChange={(e) => setNewItem({...newItem, categoryId: e.target.value})}>
                          <option value="">Select Category</option>
                          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="input-label">CATEGORY NAME</label>
                      <input autoFocus className="input-field" placeholder="e.g. Beverages" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} required />
                    </div>
                  )}
                  
                  <div className="modal-actions">
                    <button type="button" className="btn btn-ghost" onClick={() => setShowAddModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : `Save ${modalType === 'item' ? 'To Catalog' : 'Category'}`}
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
