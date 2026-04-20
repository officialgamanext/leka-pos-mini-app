import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { catalogApi, apiCall } from '../api/client';
import { Plus, Tag, Package, Loader2, MoreVertical, X, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Products.css';

const Products = () => {
  const { sessionToken }  = useSession();
  const { activeBusiness } = useBusiness();

  const [categories, setCategories] = useState([]);
  const [items,      setItems]      = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    return new URLSearchParams(window.location.search).get('tab') || 'items';
  });

  const [showModal,    setShowModal]    = useState(false);
  const [modalType,    setModalType]    = useState('item');
  const [newItem,      setNewItem]      = useState({ name: '', price: '', categoryId: '' });
  const [newCatName,   setNewCatName]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchData(); }, [sessionToken, activeBusiness]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [cats, its] = await Promise.all([
        apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken),
        apiCall(`/items?businessId=${activeBusiness.id}`,      {}, sessionToken),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setItems(Array.isArray(its)  ? its  : []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  const openModal = (type) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { setShowModal(false); setNewItem({ name:'', price:'', categoryId:'' }); setNewCatName(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalType === 'item') {
        await catalogApi.createItem(activeBusiness.id, { name: newItem.name, price: Number(newItem.price), categoryId: newItem.categoryId || null }, sessionToken);
      } else {
        await catalogApi.createCategory(activeBusiness.id, newCatName, sessionToken);
      }
      closeModal();
      fetchData();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout backPath="/profile">
      <div className="pr-page">

        {/* Tabs */}
        <div className="pr-tabs">
          <button className={`pr-tab${activeTab === 'items' ? ' active' : ''}`} onClick={() => setActiveTab('items')}>
            Items ({items.length})
          </button>
          <button className={`pr-tab${activeTab === 'categories' ? ' active' : ''}`} onClick={() => setActiveTab('categories')}>
            Categories ({categories.length})
          </button>
        </div>

        {/* List */}
        {isLoading ? (
          <div className="pr-empty">
            <Loader2 className="spin" size={28} color="var(--primary)" />
          </div>
        ) : (
          <div className="pr-list">
            {activeTab === 'items'
              ? items.map(item => (
                  <div key={item.id} className="card pr-row">
                    <div className="pr-row-left">
                      <div className="pr-icon-box pr-item-icon"><Package size={18} /></div>
                      <div>
                        <p className="pr-name">{item.name}</p>
                        <p className="pr-sub">{categories.find(c => c.id === item.categoryId)?.name || 'General'}</p>
                      </div>
                    </div>
                    <span className="pr-price">₹{item.price}</span>
                  </div>
                ))
              : categories.map(cat => (
                  <div key={cat.id} className="card pr-row">
                    <div className="pr-row-left">
                      <div className="pr-icon-box pr-cat-icon"><Tag size={18} /></div>
                      <p className="pr-name">{cat.name}</p>
                    </div>
                    <MoreVertical size={16} color="var(--border)" />
                  </div>
                ))
            }

            {((activeTab === 'items' && items.length === 0) || (activeTab === 'categories' && categories.length === 0)) && (
              <div className="pr-empty">
                <Package size={44} className="pr-empty-icon" />
                <p>No {activeTab} yet. Tap + to add one.</p>
              </div>
            )}
          </div>
        )}

        {/* FAB — rendered at body level to bypass overflow clipping */}
        {createPortal(
          <button
            className="pr-fab"
            onClick={() => openModal(activeTab === 'items' ? 'item' : 'category')}
          >
            <Plus size={24} />
          </button>,
          document.body
        )}

        {/* Modal — rendered at body level via Portal */}
        <AnimatePresence>
          {showModal && (
            <ModalPortal>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="modal-overlay"
              onClick={(e) => e.target === e.currentTarget && closeModal()}
            >
              <motion.div
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                className="modal-sheet"
              >
                <div className="modal-drag-bar" />

                <div className="modal-head">
                  <h2>Add {modalType === 'item' ? 'Item' : 'Category'}</h2>
                  <button className="modal-close" onClick={closeModal}><X size={18} /></button>
                </div>

                <form onSubmit={handleSave}>
                  <div className="pr-form">
                    {modalType === 'item' ? (
                      <>
                        <div>
                          <label className="input-label">Product Name</label>
                          <input autoFocus required className="input-field" placeholder="e.g. Cold Coffee"
                            value={newItem.name}
                            onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="input-label">Price</label>
                          <div className="input-icon-wrap">
                            <IndianRupee size={14} className="input-pfx-icon" />
                            <input required type="number" className="input-field has-pfx" placeholder="0.00"
                              value={newItem.price}
                              onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="input-label">Category (optional)</label>
                          <select className="input-field"
                            value={newItem.categoryId}
                            onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}>
                            <option value="">None</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="input-label">Category Name</label>
                        <input autoFocus required className="input-field" placeholder="e.g. Beverages"
                          value={newCatName}
                          onChange={e => setNewCatName(e.target.value)} />
                      </div>
                    )}
                  </div>

                  <div className="modal-foot">
                    <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="spin" size={18} /> : 'Save'}
                    </button>
                  </div>
                </form>
              </motion.div>
              </motion.div>
            </ModalPortal>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
};

export default Products;
