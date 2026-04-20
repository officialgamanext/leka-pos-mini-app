import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useDescope } from '@descope/react-sdk';
import { businessApi } from '../api/client';
import { useBusiness } from '../App';
import ModalPortal from '../components/ModalPortal';
import { Plus, Building2, ChevronRight, LogOut, Loader2, X, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Onboarding.css';

const Onboarding = () => {
  const { sessionToken }        = useSession();
  const { logout }              = useDescope();
  const { selectBusiness }      = useBusiness();
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
    } catch (e) { console.error(e); }
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
    } catch (e) { alert(e.message); }
    finally { setIsSubmitting(false); }
  };

  const handleSelect = (biz) => { selectBusiness(biz); navigate('/dashboard'); };
  const closeCreate  = ()    => { setShowCreate(false); setBizName(''); };

  return (
    <div className="ob-page">

      <div className="ob-top">
        <div>
          <h1 className="ob-title">My Workspaces</h1>
          <p className="ob-sub">Select a business to start</p>
        </div>
        <button className="ob-logout-btn" onClick={() => logout()}>
          <LogOut size={17} />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center" style={{ marginTop: 80 }}>
          <Loader2 className="spin" size={28} color="var(--primary)" />
        </div>
      ) : (
        <div>
          <div className="ob-list">
            {businesses.map(biz => (
              <motion.div
                key={biz.id}
                className="card ob-biz-card"
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSelect(biz)}
              >
                <div className="ob-biz-left">
                  <div className="ob-biz-avatar"><Building2 size={22} /></div>
                  <div>
                    <p className="ob-biz-name">{biz.name}</p>
                    <p className="ob-biz-sub">Standard Outlet</p>
                  </div>
                </div>
                <div className="ob-biz-chevron"><ChevronRight size={16} /></div>
              </motion.div>
            ))}
          </div>
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
