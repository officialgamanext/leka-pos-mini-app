import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { investmentsApi } from '../api/client';
import { TrendingDown, Plus, X, Trash2, Loader2, PieChart as PieIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import '../styles/Expenses.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const fmt = (d) => d.toISOString().split('T')[0];

const FILTERS = [
  { key: 'today',     label: 'Today'      },
  { key: 'thisWeek',  label: 'This Week'  },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisYear',  label: 'This Year'  },
  { key: 'custom',    label: 'Custom'     },
];

const CATEGORIES = ['Inventory','Rent','Utilities','Salary','Equipment','Marketing','Transport','Other'];

const CAT_CONFIG = {
  Inventory:  { color: '#3379A7', emoji: '📦' },
  Rent:       { color: '#6366F1', emoji: '🏠' },
  Utilities:  { color: '#F59E0B', emoji: '⚡' },
  Salary:     { color: '#10B981', emoji: '👥' },
  Equipment:  { color: '#8B5CF6', emoji: '🔧' },
  Marketing:  { color: '#EC4899', emoji: '📣' },
  Transport:  { color: '#14B8A6', emoji: '🚗' },
  Other:      { color: '#94A3B8', emoji: '🏷️' },
};

const ChartTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:'#fff', border:'1px solid var(--border)', borderRadius:10, padding:'8px 12px', fontSize:12, boxShadow:'0 4px 16px rgba(0,0,0,.1)' }}>
      <p style={{ fontWeight:700, color:'var(--text)' }}>{payload[0]?.name}</p>
      <p style={{ color:'#EF4444', fontWeight:700 }}>₹{Number(payload[0]?.value).toLocaleString('en-IN')}</p>
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────
const Expenses = () => {
  const { sessionToken }   = useSession();
  const { activeBusiness } = useBusiness();

  const [data,        setData]        = useState({ summary: {}, investments: [] });
  const [isLoading,   setIsLoading]   = useState(true);
  const [range,       setRange]       = useState('thisMonth');
  const [customStart, setCustomStart] = useState(fmt(new Date(Date.now() - 7 * 864e5)));
  const [customEnd,   setCustomEnd]   = useState(fmt(new Date()));
  const [modalOpen,   setModalOpen]   = useState(false);
  const [form,        setForm]        = useState({ title:'', amount:'', category:'Inventory', note:'', date: fmt(new Date()) });
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState('');

  const fetchExpenses = useCallback(async (r = range, cs = customStart, ce = customEnd) => {
    setIsLoading(true);
    try {
      const res = r === 'custom'
        ? await investmentsApi.getCustom(activeBusiness.id, cs, ce, sessionToken)
        : await investmentsApi.get(activeBusiness.id, r, sessionToken);
      setData(res || { summary:{}, investments:[] });
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
        title: form.title, amount: parseFloat(form.amount),
        category: form.category, note: form.note, date: form.date,
      }, sessionToken);
      setModalOpen(false);
      setForm({ title:'', amount:'', category:'Inventory', note:'', date: fmt(new Date()) });
      fetchExpenses();
    } catch (err) { setError(err.message || 'Failed to add'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, amount) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await investmentsApi.delete(id, activeBusiness.id, sessionToken);
      setData(prev => ({
        summary: { ...prev.summary, totalAmount: (prev.summary.totalAmount||0) - amount, count: (prev.summary.count||1) - 1 },
        investments: prev.investments.filter(i => i.id !== id),
      }));
    } catch (err) { alert(err.message || 'Failed to delete'); }
  };

  const { summary, investments } = data;
  const list = investments || [];

  // Category breakdown for donut
  const catMap = {};
  list.forEach(inv => {
    const cat = inv.category || 'Other';
    catMap[cat] = (catMap[cat] || 0) + (inv.amount || 0);
  });
  const donutData = Object.entries(catMap).map(([name, value]) => ({ name, value, color: CAT_CONFIG[name]?.color || '#94A3B8' })).sort((a,b) => b.value - a.value);
  const barData   = donutData.map(d => ({ ...d }));
  const avgAmount = list.length > 0 ? (summary.totalAmount || 0) / list.length : 0;

  return (
    <AppLayout title="Expenses">
      <div className="ex-page">

        {/* ── Hero ── */}
        <div className="ex-hero">
          <div className="ex-hero-top">
            <div>
              <p className="ex-hero-label">{FILTERS.find(f => f.key === range)?.label} Expenses</p>
              <div className="ex-hero-amount">₹{(summary.totalAmount || 0).toLocaleString('en-IN')}</div>
            </div>
            <div className="ex-hero-icon"><TrendingDown size={24} /></div>
          </div>
          <p className="ex-hero-sub">{summary.count || 0} transaction{summary.count !== 1 ? 's' : ''}</p>
          <div className="ex-hero-bg"><TrendingDown size={120} /></div>
        </div>

        {/* ── Mini Stats ── */}
        <div className="ex-stats-row">
          <div className="card ex-stat-card">
            <span className="ex-stat-label">Avg per Entry</span>
            <span className="ex-stat-value" style={{ color:'#EF4444' }}>₹{Math.round(avgAmount).toLocaleString('en-IN')}</span>
          </div>
          <div className="card ex-stat-card">
            <span className="ex-stat-label">Categories</span>
            <span className="ex-stat-value" style={{ color:'var(--primary)' }}>{donutData.length}</span>
          </div>
        </div>

        {/* ── Range Chips ── */}
        <div className="ex-filters">
          {FILTERS.map(f => (
            <button key={f.key} className={`ex-chip${range === f.key ? ' active' : ''}`} onClick={() => handleRangeSelect(f.key)}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Custom Date */}
        {range === 'custom' && (
          <motion.div initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} className="ex-custom-row">
            <input type="date" className="ex-date-input" value={customStart} max={customEnd} onChange={e => setCustomStart(e.target.value)} />
            <span style={{ fontSize:12, color:'var(--text-sub)', fontWeight:700 }}>to</span>
            <input type="date" className="ex-date-input" value={customEnd} min={customStart} max={fmt(new Date())} onChange={e => setCustomEnd(e.target.value)} />
            <button className="ex-apply-btn" onClick={handleCustomApply}>Go</button>
          </motion.div>
        )}

        {isLoading ? (
          <div style={{ textAlign:'center', padding:'60px 0' }}>
            <Loader2 className="spin" size={28} color="#EF4444" />
          </div>
        ) : (
          <>
            {/* ── Donut Chart ── */}
            {donutData.length > 0 && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="card ex-chart-card">
                <div className="ex-chart-title">
                  <h3>By Category</h3>
                  <PieIcon size={15} color="#EF4444" />
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                  <ResponsiveContainer width={120} height={120}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={35} outerRadius={55}
                        dataKey="value" strokeWidth={0} paddingAngle={3}>
                        {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ flex:1 }}>
                    {donutData.map(d => (
                      <div key={d.name} className="ex-legend-row">
                        <div className="ex-legend-dot" style={{ background: d.color }} />
                        <span className="ex-legend-name">{d.name}</span>
                        <span className="ex-legend-amt">₹{Number(d.value).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Bar Chart — Category breakdown ── */}
            {barData.length > 1 && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.05 }} className="card ex-chart-card">
                <div className="ex-chart-title">
                  <h3>Category Spend</h3>
                </div>
                <ResponsiveContainer width="100%" height={140}>
                  <BarChart data={barData} layout="vertical" margin={{ top:0, right:4, left:0, bottom:0 }} barSize={12}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize:10, fill:'var(--text-sub)' }} tickLine={false} axisLine={false}
                      tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize:10, fill:'var(--text-sub)' }} tickLine={false} axisLine={false} width={60} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="value" name="Amount" radius={[0,5,5,0]}>
                      {barData.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* ── Expense List ── */}
            {list.length === 0 ? (
              <div className="ex-empty">
                <div className="ex-empty-icon"><TrendingDown size={48} /></div>
                <p>No expenses in this period</p>
              </div>
            ) : (
              <div className="ex-list">
                {list.map((inv, i) => {
                  const cat = CAT_CONFIG[inv.category] || CAT_CONFIG.Other;
                  return (
                    <motion.div key={inv.id} className="card ex-row"
                      initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay: i * 0.03 }}>
                      <div className="ex-icon-wrap" style={{ background: `${cat.color}15` }}>
                        {cat.emoji}
                      </div>
                      <div style={{ flex:1 }}>
                        <p className="ex-title">{inv.title}</p>
                        <p className="ex-cat-date">
                          <span style={{ color: cat.color, fontWeight:700 }}>{inv.category}</span>
                          {' · '}
                          {new Date(inv.date).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
                        </p>
                        {inv.note && <p className="ex-note">{inv.note}</p>}
                      </div>
                      <div style={{ textAlign:'right', marginRight:6 }}>
                        <p className="ex-amount">₹{Number(inv.amount).toLocaleString('en-IN')}</p>
                      </div>
                      <button className="ex-del-btn" onClick={() => handleDelete(inv.id, inv.amount)}>
                        <Trash2 size={13} />
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* ── FAB ── */}
      <button className="ex-fab" onClick={() => setModalOpen(true)}>
        <Plus size={22} />
      </button>

      {/* ── Add Expense Modal ── */}
      <AnimatePresence>
        {modalOpen && (
          <ModalPortal>
            <motion.div className="modal-overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
              <motion.div className="modal-sheet" initial={{ y:'100%' }} animate={{ y:0 }} exit={{ y:'100%' }}
                transition={{ type:'spring', damping:28, stiffness:300 }}>
                <div className="modal-drag-bar" />
                <div className="modal-head">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="logo-box" style={{ background:'#FEF2F2', color:'#EF4444' }}><TrendingDown size={16} /></div>
                    <h2>Add Expense</h2>
                  </div>
                  <button className="modal-close" onClick={() => setModalOpen(false)}><X size={18} /></button>
                </div>

                <form className="modal-body" onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="input-field" placeholder="e.g. Rice purchase"
                      value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    <div className="form-group">
                      <label className="form-label">Amount (₹) *</label>
                      <input className="input-field" type="number" min="0" step="0.01" placeholder="0.00"
                        value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} required />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date</label>
                      <input className="input-field" type="date"
                        value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                    </div>
                  </div>

                  {/* Category picker — icon grid */}
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:8 }}>
                      {CATEGORIES.map(c => {
                        const cfg = CAT_CONFIG[c];
                        const active = form.category === c;
                        return (
                          <button key={c} type="button"
                            onClick={() => setForm(p => ({ ...p, category: c }))}
                            style={{
                              display:'flex', flexDirection:'column', alignItems:'center', gap:4,
                              padding:'8px 4px', borderRadius:12,
                              border: `1.5px solid ${active ? cfg.color : 'var(--border)'}`,
                              background: active ? `${cfg.color}15` : 'var(--surface)',
                              cursor:'pointer', transition:'all .15s',
                            }}>
                            <span style={{ fontSize:18 }}>{cfg.emoji}</span>
                            <span style={{ fontSize:9, fontWeight:700, color: active ? cfg.color : 'var(--text-sub)', lineHeight:1.2, textAlign:'center' }}>{c}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Note (optional)</label>
                    <input className="input-field" placeholder="Additional details..."
                      value={form.note} onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
                  </div>

                  {error && (
                    <div style={{ padding:'10px 14px', borderRadius:10, background:'#FEF2F2', border:'1px solid #FECACA', color:'#EF4444', fontSize:12, fontWeight:600 }}>
                      {error}
                    </div>
                  )}

                  <div className="modal-foot" style={{ gridTemplateColumns:'1fr 2fr' }}>
                    <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" style={{ background:'#EF4444', boxShadow:'0 4px 14px rgba(239,68,68,.3)' }} disabled={submitting}>
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
