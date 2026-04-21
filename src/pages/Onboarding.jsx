import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useDescope } from '@descope/react-sdk';
import { businessApi } from '../api/client';
import { useBusiness } from '../App';
import { useToast } from '../components/Toast';
import ModalPortal from '../components/ModalPortal';
import { Plus, Building2, ChevronRight, LogOut, Loader2, X, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Onboarding.css';

const Onboarding = () => {
  const { sessionToken }        = useSession();
  const { logout }              = useDescope();
  const { selectBusiness }      = useBusiness();
  const { showToast }           = useToast();
  const navigate                = useNavigate();

  const [businesses,   setBusinesses]   = useState([]);
  const [isLoading,    setIsLoading]    = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [bizName,      setBizName]      = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { fetchBusinesses(); }, [sessionToken]);

  const fetchBusinesses = async () => {
    try {
      const data = await businessApi.list(sessionToken);
      setBusinesses(Array.isArray(data) ? data : []);
    } catch (e) { 
      console.error(e);
      showToast(e.message || 'Failed to fetch businesses', 'error');
    }
    finally { setIsLoading(false); }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!bizName.trim()) return;
    setIsSubmitting(true);
    try {
      const nb = await businessApi.create(bizName.trim(), sessionToken);
      setBusinesses(prev => [...prev, nb]);
      setShowCreate(false);
      setBizName('');
      showToast('Business created successfully');
    } catch (e) { showToast(e.message, 'error'); }
    finally { setIsSubmitting(false); }
  };

  const handleSelect = (biz) => { 
    selectBusiness(biz); 
    if (biz.role === 'staff') {
      navigate('/billing');
    } else {
      navigate('/dashboard'); 
    }
  };
  const closeCreate  = ()    => { setShowCreate(false); setBizName(''); };

  return (
    <div className="ob-page">

      <div className="ob-hero">
        <div className="ob-hero-content">
          <div className="ob-logo-badge">
            <Building2 size={24} />
          </div>
          <h1 className="ob-title">Welcome back,</h1>
          <p className="ob-sub">Select a workspace to manage your business operations</p>
        </div>
        
        <button className="ob-logout-btn" onClick={() => logout()} title="Logout account">
          <LogOut size={18} />
          <span>Exit</span>
        </button>
      </div>

      <div className="ob-section-header">
        <h3>Available Workspaces</h3>
        <span className="ob-count-badge">{businesses.length}</span>
      </div>

      {isLoading ? (
        <div className="text-center" style={{ marginTop: 80 }}>
          <Loader2 className="spin" size={28} color="var(--primary)" />
        </div>
      ) : (
        <div>
          <motion.div 
            className="ob-list"
            initial="hidden"
            animate="show"
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.08 }
              }
            }}
          >
            {businesses.map(biz => {
              const isActive = biz.statusLabel === 'Active';
              return (
                <motion.div
                  key={biz.id}
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 }
                  }}
                  className={`card ob-biz-card ${!isActive ? 'ob-card-disabled' : ''}`}
                  onClick={() => {
                    if (isActive) {
                      handleSelect(biz);
                    } else {
                      showToast(`Selection locked: Business is ${biz.statusLabel}`, 'error');
                    }
                  }}
                >
                  <div className="ob-biz-left">
                    <div className="ob-biz-avatar"><Building2 size={24} /></div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <p className="ob-biz-name">{biz.name}</p>
                        {biz.statusLabel && (
                          <span className={`status-badge ${biz.statusLabel.toLowerCase()}`}>
                            {biz.statusLabel}
                          </span>
                        )}
                      </div>
                      <p className="ob-biz-sub">{biz.role || 'Partner'}</p>
                    </div>
                  </div>
                  <div className="ob-biz-chevron">
                    {isActive ? <ChevronRight size={18} /> : <X size={16} color="#ef4444" />}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
          <button className="ob-add-btn" onClick={() => setShowCreate(true)}>
            <Plus size={20} /> New Workspace
          </button>
        </div>
      )}

      {/* Create Modal — rendered directly at document.body via Portal */}
      <AnimatePresence>
        {showCreate && (
          <ModalPortal>
            <motion.div
              key="ob-overlay"
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={e => e.target === e.currentTarget && closeCreate()}
            >
              <motion.div
                key="ob-sheet"
                className="modal-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="modal-drag-bar" />

                <div className="modal-head">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="logo-box" style={{ background:'var(--primary-light)', color:'var(--primary)' }}>
                      <Store size={16} />
                    </div>
                    <h2>New Workspace</h2>
                  </div>
                  <button className="modal-close" onClick={closeCreate}><X size={18} /></button>
                </div>

                <form onSubmit={handleCreate}>
                  <div className="modal-body" style={{ marginBottom: 0 }}>
                    <label className="input-label">Business Name</label>
                    <input
                      autoFocus required
                      className="input-field"
                      placeholder="e.g. Leka Coffee Shop"
                      value={bizName}
                      onChange={e => setBizName(e.target.value)}
                    />
                  </div>

                  <div className="modal-foot">
                    <button type="button"   className="btn btn-ghost" onClick={closeCreate}>Cancel</button>
                    <button type="submit"   className="btn btn-primary" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="spin" size={17} /> : 'Create'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Onboarding;
