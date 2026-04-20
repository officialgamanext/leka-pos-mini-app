import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession } from '@descope/react-sdk';
import { businessApi } from '../api/client';
import { useBusiness } from '../App';
import { Plus, Building2, ChevronRight, LogOut, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Onboarding = () => {
  const { sessionToken, logout } = useSession();
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
    <div className="flex-column animate-fade-in" style={{ padding: '24px', minHeight: '100vh' }}>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '22px' }}>My Businesses</h1>
          <p>Select or create a business space</p>
        </div>
        <button onClick={() => logout()} style={{ background: 'none', border: 'none', color: 'var(--danger)' }}>
          <LogOut size={20} />
        </button>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ flex: 1 }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            {businesses.map((biz) => (
              <motion.div 
                key={biz.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(biz)}
                className="card flex-between"
                style={{ cursor: 'pointer', margin: 0 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px' }}>{biz.name}</h3>
                    <p style={{ fontSize: '12px' }}>Owner Space</p>
                  </div>
                </div>
                <ChevronRight size={20} color="var(--border)" />
              </motion.div>
            ))}

            <button 
              className="btn btn-outline" 
              onClick={() => setIsCreating(true)}
              style={{ borderStyle: 'dashed', height: '64px', background: 'var(--background)' }}
            >
              <Plus size={20} />
              Add New Business
            </button>
          </div>
        </div>
      )}

      {/* Create Modal Shell */}
      <AnimatePresence>
        {isCreating && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}
          >
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              style={{ background: 'white', width: '100%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', padding: '32px 24px var(--safe-area-bottom)' }}
            >
              <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 24px' }} />
              <h2 style={{ marginBottom: '8px' }}>Create Business</h2>
              <p style={{ marginBottom: '24px' }}>Give your workspace a name to get started.</p>
              
              <form onSubmit={handleCreate}>
                <div className="input-group">
                  <label className="input-label">BUSINESS NAME</label>
                  <input 
                    autoFocus
                    className="input-field" 
                    placeholder="e.g. My Awesome Cafe" 
                    value={newBusinessName}
                    onChange={(e) => setNewBusinessName(e.target.value)}
                  />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <button type="button" className="btn btn-ghost" onClick={() => setIsCreating(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newBusinessName.trim()}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Create Space'}
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
