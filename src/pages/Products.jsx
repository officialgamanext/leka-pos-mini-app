import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { useToast } from '../components/Toast';
import { catalogApi, apiCall } from '../api/client';
import { Plus, Tag, Package, Loader2, MoreVertical, X, IndianRupee, ImagePlus, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { compressImage } from '../utils/image';
import CustomSelect from '../components/CustomSelect';
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
  const [newItem,      setNewItem]      = useState({ 
    name: '', 
    price: '', 
    categoryId: '', 
    imageUrl: '',
    unitType: 'FIXED', // FIXED or VARIABLE
    unitName: 'pcs'    // pcs, kg, g, ltr, etc.
  });
  const [newCatName,   setNewCatName]   = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobile,     setIsMobile]     = useState(window.innerWidth < 768);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => { fetchData(); }, [sessionToken, activeBusiness]);

  const fetchData = async (isBackground = false) => {
    if (!activeBusiness?.id) return;
    if (!isBackground) setIsLoading(true);
    try {
      const [cats, its] = await Promise.all([
        apiCall(`/categories?businessId=${activeBusiness.id}`, {}, sessionToken),
        apiCall(`/items?businessId=${activeBusiness.id}`,      {}, sessionToken),
      ]);
      setCategories(Array.isArray(cats) ? cats : []);
      setItems(Array.isArray(its)  ? its  : []);
    } catch (e) { 
      console.error(e);
      showToast(e.message || 'Failed to load products', 'error');
    }
    finally { if (!isBackground) setIsLoading(false); }
  };

  const openModal = (type) => { setModalType(type); setShowModal(true); };
  const closeModal = () => { 
    setShowModal(false); 
    setNewItem({ 
      name: '', 
      price: '', 
      categoryId: '', 
      imageUrl: '', 
      unitType: 'FIXED', 
      unitName: 'pcs' 
    }); 
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
    if (!activeBusiness?.id) return;
    setIsSubmitting(true);
    try {
      if (modalType === 'item') {
        const payload = { 
          name: newItem.name, 
          price: Number(newItem.price), 
          categoryId: newItem.categoryId || null,
          imageUrl: newItem.imageUrl || null,
          unitType: newItem.unitType,
          unitName: newItem.unitName
        };
        await catalogApi.createItem(activeBusiness.id, payload, sessionToken);
        showToast('Item added successfully');
      } else {
        await catalogApi.createCategory(activeBusiness.id, newCatName, sessionToken);
        showToast('Category added successfully');
      }
      closeModal();
      // Small delay to ensure DB consistency before refresh
      setTimeout(() => fetchData(true), 500);
    } catch (e) { 
      console.error(e);
      showToast(e.message || 'Failed to save', 'error');
    }
    finally { setIsSubmitting(false); }
  };

  return (
    <AppLayout title="Products">
      <div className="pr-page">

        {/* Tabs and Actions Row */}
        <div className="pr-header-row">
          <div className="pr-tabs">
            <button className={`pr-tab${activeTab === 'items' ? ' active' : ''}`} onClick={() => setActiveTab('items')}>
              Items ({items.length})
            </button>
            <button className={`pr-tab${activeTab === 'categories' ? ' active' : ''}`} onClick={() => setActiveTab('categories')}>
              Categories ({categories.length})
            </button>
          </div>
          {!isMobile && (
            <button className="btn btn-primary pr-add-btn-desktop" onClick={() => openModal(activeTab === 'items' ? 'item' : 'category')}>
              <Plus size={16} /> Add {activeTab === 'items' ? 'Product' : 'Category'}
            </button>
          )}
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
                      <p className="pr-product-price">₹{item.price}<span style={{ fontSize:10, opacity:0.6, fontWeight:600 }}>/{item.unitName || (item.unitType === 'VARIABLE' ? 'kg' : 'pcs')}</span></p>
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

        {/* FAB (Mobile Only) */}
        {isMobile && createPortal(
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div className="logo-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)', width: 44, height: 44, borderRadius: 14 }}>
                        {modalType === 'item' ? <Package size={20} /> : <Tag size={20} />}
                      </div>
                      <div>
                        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Add {modalType === 'item' ? 'Product' : 'Category'}</h2>
                        <p style={{ fontSize: 12, color: 'var(--text-sub)' }}>{modalType === 'item' ? 'Create a new item for your catalog' : 'Organize your products with categories'}</p>
                      </div>
                    </div>
                    <button className="modal-close" onClick={closeModal} style={{ width: 36, height: 36, borderRadius: 12 }}><X size={20} /></button>
                  </div>

                  <form onSubmit={handleSave}>
                    <div className="modal-body" style={{ paddingTop: 10 }}>
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

                            <div className="form-group">
                              <label className="form-label">Product Name</label>
                              <div className="input-group-premium">
                                <Package size={18} className="input-icon-left" />
                                <input 
                                  className="input-field-premium has-icon" 
                                  placeholder="e.g. Tomato Rice"
                                  value={newItem.name}
                                  onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                                  required
                                />
                              </div>
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              <div className="form-group">
                                <label className="form-label">Price (₹)</label>
                                <div className="input-group-premium">
                                  <IndianRupee size={16} className="input-icon-left" />
                                  <input 
                                    className="input-field-premium has-icon" 
                                    type="number"
                                    placeholder="0.00"
                                    value={newItem.price}
                                    onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                                    required
                                  />
                                </div>
                              </div>
                              <div className="form-group">
                                <label className="form-label">Category</label>
                                <CustomSelect 
                                  value={newItem.categoryId}
                                  onChange={val => setNewItem({ ...newItem, categoryId: val })}
                                  options={[
                                    { value: '', label: 'General' },
                                    ...categories.map(c => ({ value: c.id, label: c.name }))
                                  ]}
                                />
                              </div>
                            </div>

                            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                              <div className="form-group">
                                <label className="form-label">Unit Type</label>
                                <CustomSelect 
                                  value={newItem.unitType}
                                  onChange={val => setNewItem({ ...newItem, unitType: val, unitName: val === 'FIXED' ? 'pcs' : 'kg' })}
                                  options={[
                                    { value: 'FIXED', label: 'Piece (Fixed)' },
                                    { value: 'VARIABLE', label: 'Weight/Volume (Variable)' }
                                  ]}
                                />
                              </div>
                              <div className="form-group">
                                <label className="form-label">Unit Name</label>
                                <input required className="input-field-premium" placeholder="e.g. kg, pcs, ltr"
                                  value={newItem.unitName} onChange={e => setNewItem({ ...newItem, unitName: e.target.value })} />
                              </div>
                            </div>
                          </>
                        ) : (
                          <div className="form-group">
                            <label className="form-label">Category Name</label>
                            <div className="input-group-premium">
                              <Tag size={18} className="input-icon-left" />
                              <input autoFocus required className="input-field-premium has-icon" placeholder="e.g. Beverages"
                                value={newCatName} onChange={e => setNewCatName(e.target.value)} />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="modal-foot-premium">
                      <button type="button" className="btn btn-ghost btn-premium" onClick={closeModal}>Cancel</button>
                      <button type="submit" className="btn btn-primary btn-premium" disabled={isSubmitting}>
                        {isSubmitting ? <Loader2 className="spin" size={20} /> : <><Save size={18} /> Save {modalType === 'item' ? 'Product' : 'Category'}</>}
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
