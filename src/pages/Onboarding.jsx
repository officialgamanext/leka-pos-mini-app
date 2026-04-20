import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSession, useDescope } from '@descope/react-sdk';
import { businessApi } from '../api/client';
import { useBusiness } from '../App';
import { Plus, Building2, ChevronRight, LogOut, Loader2, X, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <div className="flex-column animate-fade-in" style={{ padding: '16px 12px', minHeight: '100vh', background: 'var(--background)' }}>
      <div className="flex-between" style={{ marginBottom: '32px', padding: '16px 8px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800' }}>My Businesses</h1>
          <p style={{ color: 'var(--text-muted)' }}>Select or create a workspace</p>
        </div>
        <button onClick={() => logout()} style={{ background: 'var(--primary-light)', border: 'none', padding: '10px', borderRadius: '12px', color: 'var(--primary)', display: 'flex' }}>
          <LogOut size={20} />
        </button>
      </div>

      {isLoading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 className="animate-spin" size={32} color="var(--primary)" />
        </div>
      ) : (
        <div style={{ flex: 1, padding: '0 8px' }}>
          <div style={{ display: 'grid', gap: '12px' }}>
            {businesses.map((biz) => (
              <motion.div 
                key={biz.id}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelect(biz)}
                className="card flex-between"
                style={{ cursor: 'pointer', margin: 0, padding: '16px' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ width: '44px', height: '44px', background: 'var(--primary-light)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: '700' }}>{biz.name}</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Retail Outlet</p>
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <ChevronRight size={18} color="var(--border)" />
                </div>
              </motion.div>
            ))}

            <button 
              className="btn btn-outline" 
              onClick={() => setIsCreating(true)}
              style={{ borderStyle: 'dashed', height: '70px', background: 'white', borderColor: 'var(--primary)', color: 'var(--primary)', borderWidth: '2px' }}
            >
              <Plus size={22} />
              Add New Business
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Create Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} style={{ background: 'var(--background)', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px calc(24px + var(--safe-area-bottom))' }}>
              <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
              
              <div className="flex-between" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                      <Store size={20} />
                   </div>
                   <h2 style={{ fontSize: '20px' }}>Create Workspace</h2>
                </div>
                <button onClick={() => setIsCreating(false)} style={{ background: 'white', border: '1px solid var(--border)', padding: '6px', borderRadius: '10px', color: 'var(--text-muted)', display: 'flex' }}>
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleCreate}>
                <div className="input-group" style={{ marginBottom: '32px' }}>
                   <label className="input-label">BUSINESS NAME</label>
                   <input autoFocus className="input-field" placeholder="e.g. My Smart POS" value={newBusinessName} onChange={(e) => setNewBusinessName(e.target.value)} required />
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
                  <button type="button" className="btn" style={{ background: '#F1F5F9', color: '#64748B' }} onClick={() => setIsCreating(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={isSubmitting || !newBusinessName.trim()}>
                    {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : 'Establish Space'}
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
