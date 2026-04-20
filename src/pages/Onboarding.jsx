import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useDescope } from '@descope/react-sdk';
import { businessApi } from '../api/client';
import { useBusiness } from '../App';
import { Plus, Building2, ChevronRight, LogOut, Loader2, X, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Onboarding.css';

const Onboarding = () => {
  const { sessionToken } = useSession();
  const { logout } = useDescope();
  const { selectBusiness } = useBusiness();
  const navigate = useNavigate();
  
  const [businesses, setBusinesses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newBusinessName, setNewBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBusinesses();
  }, [sessionToken]);

  const fetchBusinesses = async () => {
    try {
      const data = await businessApi.list(sessionToken);
      setBusinesses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBusinessName.trim()) return;
    
    setIsSubmitting(true);
    try {
      const newBusiness = await businessApi.create(newBusinessName, sessionToken);
      setBusinesses([...businesses, newBusiness]);
      setIsCreating(false);
      setNewBusinessName('');
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelect = (business) => {
    selectBusiness(business);
    navigate('/dashboard');
  };

  return (
    <div className="onboarding-page">
      <div className="flex-between onboarding-header">
        <div>
          <h1 className="onboarding-title">My Workspaces</h1>
          <p className="onboarding-sub">Select a business to start billing</p>
        </div>
        <button onClick={() => logout()} className="close-btn" style={{ borderRadius: '14px' }}>
          <LogOut size={20} color="var(--danger)" />
        </button>
      </div>

      {isLoading ? (
        <div className="text-center" style={{ marginTop: '100px' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
      ) : (
        <div className="business-list">
          {businesses.map((biz) => (
            <motion.div 
              key={biz.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(biz)}
              className="card business-card flex-between"
            >
              <div className="business-info">
                <div className="business-icon-box">
                  <Building2 size={24} />
                </div>
                <div className="business-details">
                  <h3>{biz.name}</h3>
                  <p>Standard Outlet • Online</p>
                </div>
              </div>
              <ChevronRight size={20} color="var(--border)" />
            </motion.div>
          ))}

          <button className="btn add-business-btn" onClick={() => setIsCreating(true)}>
            <Plus size={24} />
            Create New Workspace
          </button>
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="modal-content">
              <div className="modal-header">
                <div className="item-main">
                  <div className="logo-box" style={{ background: 'var(--primary-light)' }}>
                    <Store size={20} color="var(--primary)" />
                  </div>
                  <h2 style={{ fontSize: '18px' }}>Setup Workspace</h2>
                </div>
                <button className="close-btn" onClick={() => setIsCreating(false)}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreate}>
                <div style={{ marginBottom: '32px' }}>
                   <label className="input-label">BUSINESS NAME</label>
                   <input autoFocus className="input-field" placeholder="e.g. Leka Coffee Shop" value={newBusinessName} onChange={(e) => setNewBusinessName(e.target.value)} required />
                </div>
                
                <div className="modal-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Establish Workspace'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Onboarding;
