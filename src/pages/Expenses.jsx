import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { investmentsApi } from '../api/client';
import { TrendingDown, Plus, X, Trash2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/StaffExpenses.css';

const fmt = (d) => d.toISOString().split('T')[0];

const FILTERS = [
  { key: 'today',     label: 'Today'      },
  { key: 'thisWeek',  label: 'This Week'  },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisYear',  label: 'This Year'  },
  { key: 'custom',    label: 'Custom'     },
];

const CATEGORIES = ['Inventory', 'Rent', 'Utilities', 'Salary', 'Equipment', 'Marketing', 'Transport', 'Other'];

const Expenses = () => {
  const { sessionToken }   = useSession();
  const { activeBusiness } = useBusiness();

  const [data,        setData]        = useState({ summary: {}, investments: [] });
  const [isLoading,   setIsLoading]   = useState(true);
  const [range,       setRange]       = useState('thisMonth');
  const [customStart, setCustomStart] = useState(fmt(new Date(Date.now() - 7 * 864e5)));
  const [customEnd,   setCustomEnd]   = useState(fmt(new Date()));
  const [modalOpen,   setModalOpen]   = useState(false);
  const [form,        setForm]        = useState({ title: '', amount: '', category: 'Inventory', note: '', date: fmt(new Date()) });
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  const fetchExpenses = useCallback(async (r = range, cs = customStart, ce = customEnd) => {
    setIsLoading(true);
    try {
      let res;
      if (r === 'custom') {
        res = await investmentsApi.getCustom(activeBusiness.id, cs, ce, sessionToken);
      } else {
        res = await investmentsApi.get(activeBusiness.id, r, sessionToken);
      }
      setData(res || { summary: {}, investments: [] });
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  }, [activeBusiness, sessionToken]);

  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  const handleRangeSelect = (r) => { setRange(r); if (r !== 'custom') fetchExpenses(r); };
  const handleCustomApply = ()  => fetchExpenses('custom', customStart, customEnd);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.amount) return;
    setSubmitting(true); setError('');
    try {
      await investmentsApi.create(activeBusiness.id, {
        title:    form.title,
        amount:   parseFloat(form.amount),
        category: form.category,
        note:     form.note,
        date:     form.date,
      }, sessionToken);
      setModalOpen(false);
      setForm({ title: '', amount: '', category: 'Inventory', note: '', date: fmt(new Date()) });
      fetchExpenses();
    } catch (err) { setError(err.message || 'Failed to add expense'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await investmentsApi.delete(id, activeBusiness.id, sessionToken);
      setData(prev => ({
        ...prev,
        summary: { ...prev.summary, totalAmount: (prev.summary.totalAmount || 0) - (prev.investments.find(i => i.id === id)?.amount || 0), count: (prev.summary.count || 1) - 1 },
        investments: prev.investments.filter(i => i.id !== id),
      }));
    } catch (err) { alert(err.message || 'Failed to delete'); }
  };

  const { summary, investments } = data;

  return (
    <AppLayout title="Expenses">
      <div className="ex-page">

        {/* Hero */}
        <div className="ex-hero">
          <div>
            <p className="ex-hero-label">{FILTERS.find(f => f.key === range)?.label} Expenses</p>
            <div className="ex-hero-amount">₹{(summary.totalAmount || 0).toLocaleString('en-IN')}</div>
            <p className="ex-hero-sub">{summary.count || 0} transaction{summary.count !== 1 ? 's' : ''}</p>
          </div>
          <div className="ex-hero-icon"><TrendingDown size={24} /></div>
          <div className="ex-hero-bg"><TrendingDown size={110} /></div>
        </div>

        {/* Filters */}
        <div className="ex-filters">
          {FILTERS.map(f => (
            <button key={f.key} className={`ex-chip${range === f.key ? ' active' : ''}`} onClick={() => handleRangeSelect(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom Dates */}
        {range === 'custom' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="ex-custom-row">
            <input type="date" className="ex-date-input" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)} />
            <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700 }}>to</span>
            <input type="date" className="ex-date-input" value={customEnd} min={customStart} max={fmt(new Date())} onChange={e => setCustomEnd(e.target.value)} />
            <button className="ex-apply-btn" onClick={handleCustomApply}>Go</button>
          </motion.div>
        )}

        {/* Add Button */}
        <button className="ex-add-btn" onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Add Expense
        </button>

        {/* List */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 className="spin" size={26} color="#EF4444" />
          </div>
        ) : !investments?.length ? (
          <div className="ex-empty">
            <div className="ex-empty-icon"><TrendingDown size={44} /></div>
            <p>No expenses in this period</p>
          </div>
        ) : (
          <div className="ex-list">
            {investments.map((inv, i) => (
              <motion.div key={inv.id} className="card ex-row"
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                <div className="ex-icon"><TrendingDown size={19} /></div>
                <div style={{ flex: 1 }}>
                  <p className="ex-title">{inv.title}</p>
                  <p className="ex-cat-date">
                    {inv.category} · {new Date(inv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                  {inv.note && <p style={{ fontSize: 10, color: 'var(--text-sub)', marginTop: 2 }}>{inv.note}</p>}
                </div>
                <div style={{ textAlign: 'right', marginRight: 8 }}>
                  <p className="ex-amount">₹{Number(inv.amount).toLocaleString('en-IN')}</p>
                </div>
                <button className="ex-del-btn" onClick={() => handleDelete(inv.id)}>
                  <Trash2 size={13} />
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
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
                    <div className="logo-box" style={{ background: '#FEF2F2', color: '#EF4444' }}><TrendingDown size={16} /></div>
                    <h2>Add Expense</h2>
                  </div>
                  <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="input-field" placeholder="e.g. Rice purchase" value={form.title}
                      onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Amount (₹) *</label>
                      <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00"
                        value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input className="input-field" type="date" value={form.date}
                        onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="input-field" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Note (optional)</label>
                    <input className="input-field" placeholder="Additional details..." value={form.note}
                      onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
                  </div>

                  {error && (
                    <div style={{ padding: '10px 14px', borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', color: '#EF4444', fontSize: 12, fontWeight: 600 }}>
                      {error}
                    </div>
                  )}

                  <div className="modal-foot" style={{ gridTemplateColumns: '1fr 2fr' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ background: '#EF4444', boxShadow: '0 4px 14px rgba(239,68,68,.3)' }} disabled={submitting}>
                      {submitting ? <Loader2 size={18} className="spin" /> : <><Plus size={15} /> Add Expense</>}
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

export default Expenses;
