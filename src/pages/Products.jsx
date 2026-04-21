import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { useToast } from '../components/Toast';
import { catalogApi, apiCall } from '../api/client';
import { Plus, Tag, Package, Loader2, MoreVertical, X, IndianRupee, ImagePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../utils/image';
import '../styles/Products.css';

const Products = () => {
  const { sessionToken }   = useSession();
  const { activeBusiness } = useBusiness();
  const { showToast }      = useToast();

  const [categories, setCategories] = useState([]);
  const [items,      setItems]      = useState([]);
  const [isLoading,  setIsLoading]  = useState(true);

  const [activeTab, setActiveTab] = useState(() => {
    return new URLSearchParams(window.location.search).get('tab') || 'items';
  });

  const [showModal,    setShowModal]    = useState(false);
  const [modalType,    setModalType]    = useState('item');
  const [newItem,      setNewItem]      = useState({ name: '', price: '', categoryId: '', imageUrl: '' });
  const [newCatName,   setNewCatName]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fileInputRef = useRef(null);

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
  const closeModal = () => { 
    setShowModal(false); 
    setNewItem({ name:'', price:'', categoryId:'', imageUrl:'' }); 
    setNewCatName(''); 
  };

  const handleImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      // Compress to max 300px width/height and get base64
      const compressedBase64 = await compressImage(file, 300);
      setNewItem(prev => ({ ...prev, imageUrl: compressedBase64 }));
    } catch (error) {
      console.error('Image compression failed:', error);
      showToast('Failed to process image. Try another one.', 'error');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (modalType === 'item') {
        const payload = { 
          name: newItem.name, 
          price: Number(newItem.price), 
          categoryId: newItem.categoryId || null,
          imageUrl: newItem.imageUrl || null
        };
        await catalogApi.createItem(activeBusiness.id, payload, sessionToken);
      } else {
        await catalogApi.createCategory(activeBusiness.id, newCatName, sessionToken);
      }
      closeModal();
      fetchData();
    } catch (e) { console.error(e); }
    finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="Products">
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

        {/* List / Grid */}
        {isLoading ? (
          <div className="pr-empty">
            <Loader2 className="spin" size={28} color="var(--primary)" />
          </div>
        ) : (
          <div>
            {activeTab === 'categories' ? (
              <div className="pr-list">
                {categories.map(cat => (
                  <div key={cat.id} className="card pr-row">
                    <div className="pr-row-left">
                      <div className="pr-icon-box pr-cat-icon"><Tag size={18} /></div>
                      <p className="pr-name">{cat.name}</p>
                    </div>
                    <MoreVertical size={16} color="var(--border)" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="pr-grid">
                {items.map(item => {
                  const catName = categories.find(c => c.id === item.categoryId)?.name || 'General';
                  return (
                    <motion.div key={item.id} className="card pr-product-card" whileTap={{ scale: 0.96 }}>
                      <div className="pr-product-thumb">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} />
                        ) : (
                          <Package size={26} opacity={0.45} />
                        )}
                      </div>
                      <p className="pr-product-name">{item.name}</p>
                      <p className="pr-product-price">₹{item.price}</p>
                      <p className="pr-product-sub">{catName}</p>
                    </motion.div>
                  )
                })}
              </div>
            )}

            {((activeTab === 'items' && items.length === 0) || (activeTab === 'categories' && categories.length === 0)) && (
              <div className="pr-empty">
                <Package size={44} className="pr-empty-icon" />
                <p>No {activeTab} yet. Tap + to add one.</p>
              </div>
            )}
          </div>
        )}

        {/* FAB */}
        {createPortal(
          <button className="pr-fab" onClick={() => openModal(activeTab === 'items' ? 'item' : 'category')}>
            <Plus size={24} />
          </button>,
          document.body
        )}

        {/* Modal */}
        <AnimatePresence>
          {showModal && (
            <ModalPortal>
              <motion.div key="overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                <motion.div key="sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                  transition={{ type: 'spring', damping: 28, stiffness: 300 }} className="modal-sheet">
                  <div className="modal-drag-bar" />
                  <div className="modal-head">
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div className="logo-box" style={{ background:'var(--primary-light)', color:'var(--primary)' }}>
                        {modalType === 'item' ? <Package size={16} /> : <Tag size={16} />}
                      </div>
                      <h2>Add {modalType === 'item' ? 'Item' : 'Category'}</h2>
                    </div>
                    <button className="modal-close" onClick={closeModal}><X size={18} /></button>
                  </div>

                  <form onSubmit={handleSave}>
                    <div className="pr-form">
                      {modalType === 'item' ? (
                        <>
                          <div 
                            className="pr-img-upload-box" 
                            onClick={() => fileInputRef.current?.click()}
                          >
                            {newItem.imageUrl ? (
                              <img src={newItem.imageUrl} alt="Preview" />
                            ) : (
                              <>
                                <ImagePlus size={24} />
                                <span style={{ fontSize:11, fontWeight:700 }}>Choose Image (Optional)</span>
                              </>
                            )}
                            <input 
                              type="file" 
                              accept="image/*" 
                              style={{ display: 'none' }} 
                              ref={fileInputRef}
                              onChange={handleImageSelect}
                            />
                          </div>

                          <div>
                            <label className="input-label">Product Name *</label>
                            <input autoFocus required className="input-field" placeholder="e.g. Cold Coffee"
                              value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} />
                          </div>

                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                            <div>
                              <label className="input-label">Price *</label>
                              <div className="input-icon-wrap">
                                <IndianRupee size={14} className="input-pfx-icon" />
                                <input required type="number" min="0" step="0.01" className="input-field has-pfx" placeholder="0.00"
                                  value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} />
                              </div>
                            </div>
                            <div>
                              <label className="input-label">Category</label>
                              <select className="input-field" value={newItem.categoryId}
                                onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })}>
                                <option value="">General</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div>
                          <label className="input-label">Category Name *</label>
                          <input autoFocus required className="input-field" placeholder="e.g. Beverages"
                            value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                        </div>
                      )}
                    </div>

                    <div className="modal-foot" style={{ gridTemplateColumns:'1fr 2fr' }}>
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
