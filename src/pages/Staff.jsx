import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { staffApi } from '../api/client';
import { Users, UserPlus, X, Trash2, Loader2, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/StaffExpenses.css';

const ROLE_COLORS = {
  manager: { bg: '#EEF2FF', color: '#6366F1' },
  staff:   { bg: '#F0FDF4', color: '#10B981' },
};

const AVATAR_COLORS = ['#5F259F','#6366F1','#10B981','#F59E0B','#EF4444','#EC4899'];

const Staff = () => {
  const { sessionToken }   = useSession();
  const { activeBusiness } = useBusiness();

  const [staffList, setStaffList]   = useState([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [form,      setForm]        = useState({ staffUserId: '', role: 'staff' });
  const [submitting, setSubmitting] = useState(false);
  const [error,     setError]       = useState('');

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await staffApi.list(activeBusiness.id, sessionToken);
      setStaffList(data || []);
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [activeBusiness, sessionToken]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.staffUserId.trim()) return;
    setSubmitting(true); setError('');
    try {
      await staffApi.add(activeBusiness.id, form.staffUserId.trim(), form.role, sessionToken);
      setModalOpen(false);
      setForm({ staffUserId: '', role: 'staff' });
      fetchStaff();
    } catch (err) { setError(err.message || 'Failed to add staff'); }
    finally { setSubmitting(false); }
  };

  const handleRemove = async (staffId) => {
    if (!window.confirm('Remove this staff member?')) return;
    try {
      await staffApi.remove(staffId, activeBusiness.id, sessionToken);
      setStaffList(p => p.filter(s => s.id !== staffId));
    } catch (err) { alert(err.message || 'Failed to remove'); }
  };

  return (
    <AppLayout title="Staff">
      <div className="st-page">

        {/* Hero */}
        <div className="st-hero">
          <div>
            <p className="st-hero-label">Team Members</p>
            <div className="st-hero-count">{staffList.length}</div>
            <p className="st-hero-sub">Active staff in your business</p>
          </div>
          <div className="st-hero-icon"><Users size={24} /></div>
          <div className="st-hero-bg"><Users size={110} /></div>
        </div>

        {/* Add Button */}
        <button className="st-add-btn" onClick={() => setModalOpen(true)}>
          <UserPlus size={18} /> Add Staff Member
        </button>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 className="spin" size={26} color="#6366F1" />
          </div>
        ) : staffList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-sub)' }}>
            <Users size={44} style={{ opacity: .12, marginBottom: 12 }} />
            <p>No staff members yet</p>
          </div>
        ) : (
          <div className="st-list">
            {staffList.map((s, i) => {
              const initials = (s.name || s.userId || '?').slice(0, 2).toUpperCase();
              const bgColor  = AVATAR_COLORS[i % AVATAR_COLORS.length];
              const roleStyle = ROLE_COLORS[s.role] || ROLE_COLORS.staff;
              return (
                <motion.div
                  key={s.id}
                  className="card st-row"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <div className="st-avatar" style={{ background: bgColor }}>{initials}</div>
                  <div style={{ flex: 1 }}>
                    <p className="st-name">{s.name || 'Staff Member'}</p>
                    <p className="st-uid">{s.userId}</p>
                  </div>
                  <span className="st-role-badge" style={{ background: roleStyle.bg, color: roleStyle.color }}>
                    {s.role || 'staff'}
                  </span>
                  <button className="st-remove-btn" onClick={() => handleRemove(s.id)}>
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {modalOpen && (
          <ModalPortal>
            <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
              <motion.div className="modal-sheet" initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}>
                <div className="modal-drag-bar" />
                <div className="modal-head">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div className="logo-box" style={{ background: '#EEF2FF', color: '#6366F1' }}><UserPlus size={16} /></div>
                    <h2>Add Staff Member</h2>
                  </div>
                  <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
                </div>

                <form className="modal-body" onSubmit={handleAdd}>
                  <div className="form-group">
                    <label className="form-label">Descope User ID</label>
                    <input
                      className="input-field"
                      placeholder="e.g. U2a3b4c5d6..."
                      value={form.staffUserId}
                      onChange={e => setForm(p => ({ ...p, staffUserId: e.target.value }))}
                      required
                    />
                    <p style={{ fontSize: 11, marginTop: 4 }}>Enter the Descope user ID of the staff member</p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Role</label>
                    <select
                      className="input-field"
                      value={form.role}
                      onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                    >
                      <option value="staff">Staff</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>

                  {error && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                      {error}
                    </div>
                  )}

                  <div className="modal-foot" style={{ gridTemplateColumns: '1fr 2fr' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ background: '#6366F1', boxShadow: '0 4px 14px rgba(99,102,241,.3)' }} disabled={submitting}>
                      {submitting ? <Loader2 size={18} className="spin" /> : <><UserPlus size={15} /> Add Staff</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Staff;
