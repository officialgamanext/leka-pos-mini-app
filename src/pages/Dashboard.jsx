import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { dashboardApi } from '../api/client';
import { useNavigate } from 'react-router-dom';
import {
  IndianRupee, TrendingUp, TrendingDown, Receipt,
  ShoppingBag, ArrowRight, Loader2, BarChart2,
  PieChart as PieIcon, LineChart as LineIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart, Area,
  BarChart, Bar,
  LineChart, Line,
  PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip,
  Legend, CartesianGrid,
} from 'recharts';
import '../styles/Dashboard.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const RANGES = [
  { key: 'today',     label: 'Today'      },
  { key: 'yesterday', label: 'Yesterday'  },
  { key: 'thisWeek',  label: 'This Week'  },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'thisYear',  label: 'This Year'  },
];

const COLORS = ['#3379A7','#10B981','#6366F1','#F59E0B','#EF4444','#EC4899','#14B8A6','#8B5CF6','#F97316','#06B6D4'];

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 10, padding: '8px 12px', boxShadow: '0 4px 16px rgba(0,0,0,.1)', fontSize: 12 }}>
      <p style={{ fontWeight: 700, marginBottom: 4, color: 'var(--text)' }}>{label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 700 }}>
          {p.name}: ₹{Number(p.value).toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const { sessionToken }   = useSession();
  const { activeBusiness } = useBusiness();
  const navigate           = useNavigate();

  const [data,      setData]      = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range,     setRange]     = useState('today');

  const fetchDashboard = useCallback(async (r = range) => {
    setIsLoading(true);
    try {
      const res = await dashboardApi.get(activeBusiness.id, r, sessionToken);
      setData(res);
    } catch (e) {
      console.error('Dashboard error:', e);
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [activeBusiness, sessionToken]);

  useEffect(() => { fetchDashboard(); }, [sessionToken, activeBusiness]);

  const handleRange = (r) => { setRange(r); fetchDashboard(r); };

  const summary   = data?.summary   || {};
  const topItems  = data?.topItems  || [];
  const daily     = (data?.charts?.daily   || []).slice(-14);
  const weekly    = (data?.charts?.weekly  || []).slice(-12);
  const monthly   = (data?.charts?.monthly || []).slice(-12);

  // Format labels
  const dailyData  = daily.map(d => ({ ...d, label: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' }) }));
  const weeklyData = weekly.map(d => ({ ...d, label: `W${d.week?.split('W')[1] || ''}` }));
  const monthlyData = monthly.map(d => ({ ...d, label: d.month ? new Date(d.month + '-01').toLocaleDateString('en-IN', { month: 'short' }) : '' }));

  // Donut data from top items
  const donutData = topItems.slice(0, 5).map((t, i) => ({ name: t.name, value: t.revenue, color: COLORS[i] }));
  const totalDonut = donutData.reduce((s, d) => s + d.value, 0);

  // Choose chart data based on range
  const trendData  = range === 'today' || range === 'yesterday' ? dailyData
                   : range === 'thisWeek' || range === 'lastWeek' ? dailyData
                   : range === 'thisYear' || range === 'lastYear' ? monthlyData
                   : weeklyData;

  return (
    <AppLayout>
      <div className="db-page">

        {/* ── Range Chips ── */}
        <div className="db-range-chips">
          {RANGES.map(r => (
            <button key={r.key} className={`db-range-chip${range === r.key ? ' active' : ''}`} onClick={() => handleRange(r.key)}>
              {r.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Loader2 className="spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <>
            {/* ── Revenue Hero ── */}
            <motion.div initial={{ opacity:0, y:14 }} animate={{ opacity:1, y:0 }} className="db-revenue-card">
              <div className="db-rev-top">
                <div>
                  <p className="db-revenue-label">{RANGES.find(r => r.key === range)?.label} Revenue</p>
                  <div className="db-revenue-amount">
                    ₹{(summary.revenue || 0).toLocaleString('en-IN')}
                  </div>
                  <div className={`db-rev-badge ${summary.isProfit ? 'profit' : 'loss'}`}>
                    {summary.isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                    {summary.profitLossPct?.toFixed(1)}% {summary.isProfit ? 'profit' : 'loss'}
                  </div>
                </div>
                <div className="db-rev-icon-wrap"><IndianRupee size={24} /></div>
              </div>
              <div className="db-rev-bg"><IndianRupee size={120} /></div>
            </motion.div>

            {/* ── Stats Row ── */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.06 }} className="db-stats-row">
              <div className="card db-stat-card">
                <span className="db-stat-label">Expenses</span>
                <span className="db-stat-value" style={{ color:'#EF4444' }}>₹{(summary.expenses||0).toLocaleString('en-IN')}</span>
              </div>
              <div className="card db-stat-card">
                <span className="db-stat-label">Net {summary.isProfit ? 'Profit' : 'Loss'}</span>
                <span className="db-stat-value" style={{ color: summary.isProfit ? '#10B981' : '#EF4444' }}>
                  ₹{Math.abs(summary.net||0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="card db-stat-card">
                <span className="db-stat-label">Avg Order</span>
                <span className="db-stat-value" style={{ color:'var(--primary)' }}>₹{(summary.avgOrderValue||0).toLocaleString('en-IN')}</span>
              </div>
            </motion.div>

            {/* ── Bills count card ── */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.09 }}
              className="card" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px' }}>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:38, height:38, borderRadius:12, background:'var(--primary-light)', color:'var(--primary)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <Receipt size={18} />
                </div>
                <div>
                  <p style={{ fontSize:13, fontWeight:800, color:'var(--text)', marginBottom:1 }}>Total Bills</p>
                  <p style={{ fontSize:11 }}>Transactions this period</p>
                </div>
              </div>
              <span style={{ fontSize:22, fontWeight:900, color:'var(--primary)' }}>{summary.totalBills || 0}</span>
            </motion.div>

            {/* ── Area / Line Chart — Revenue vs Expenses ── */}
            {trendData.length > 0 && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.12 }} className="card db-chart-card">
                <div className="db-chart-title">
                  <div>
                    <h3>Revenue vs Expenses</h3>
                    <p className="db-chart-sub">Trend over selected period</p>
                  </div>
                  <LineIcon size={16} color="var(--primary)" />
                </div>
                <ResponsiveContainer width="100%" height={170}>
                  <AreaChart data={trendData} margin={{ top:4, right:4, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3379A7" stopOpacity={0.18} />
                        <stop offset="95%" stopColor="#3379A7" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#EF4444" stopOpacity={0.14} />
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="label" tick={{ fontSize:10, fill:'var(--text-sub)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize:10, fill:'var(--text-sub)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Area type="monotone" dataKey="revenue"  name="Revenue"  stroke="#3379A7" strokeWidth={2.5} fill="url(#revGrad)" dot={false} />
                    <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#EF4444" strokeWidth={2}   fill="url(#expGrad)" dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* ── Bar Chart — Revenue only ── */}
            {trendData.length > 0 && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.15 }} className="card db-chart-card">
                <div className="db-chart-title">
                  <div>
                    <h3>Revenue Breakdown</h3>
                    <p className="db-chart-sub">Bar view by period</p>
                  </div>
                  <BarChart2 size={16} color="var(--primary)" />
                </div>
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={trendData} margin={{ top:4, right:4, left:-20, bottom:0 }} barSize={14}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="label" tick={{ fontSize:10, fill:'var(--text-sub)' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize:10, fill:'var(--text-sub)' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v >= 1000 ? (v/1000).toFixed(0)+'k' : v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="revenue" name="Revenue" fill="#3379A7" radius={[5,5,0,0]}>
                      {trendData.map((_, i) => <Cell key={i} fill={i === trendData.length - 1 ? '#255a7e' : '#3379A7'} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* ── Donut Chart — Top Items ── */}
            {donutData.length > 0 && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.18 }} className="card db-chart-card">
                <div className="db-chart-title">
                  <div>
                    <h3>Sales by Item</h3>
                    <p className="db-chart-sub">Revenue distribution</p>
                  </div>
                  <PieIcon size={16} color="var(--primary)" />
                </div>
                <div className="db-donut-wrap">
                  <ResponsiveContainer width={130} height={130}>
                    <PieChart>
                      <Pie data={donutData} cx="50%" cy="50%" innerRadius={38} outerRadius={58}
                        dataKey="value" strokeWidth={0} paddingAngle={3}>
                        {donutData.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => `₹${Number(v).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="db-donut-legend">
                    {donutData.map((d, i) => (
                      <div key={d.name} className="db-legend-row">
                        <div className="db-legend-dot" style={{ background: d.color }} />
                        <span className="db-legend-name">{d.name}</span>
                        <span className="db-legend-pct">{totalDonut > 0 ? ((d.value / totalDonut) * 100).toFixed(0) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* ── Top Items List ── */}
            {topItems.length > 0 && (
              <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.21 }} className="card db-sales-card">
                <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                  <h3>Top Selling Items</h3>
                  <TrendingUp size={15} color="var(--green)" />
                </div>
                {topItems.slice(0,6).map((item, i) => (
                  <div key={item.name} className="db-sale-row">
                    <div className="db-sale-rank" style={{ background: `${COLORS[i]}18`, color: COLORS[i] }}>
                      #{i+1}
                    </div>
                    <div style={{ flex:1 }}>
                      <p className="db-sale-name">{item.name}</p>
                      <p className="db-sale-qty">Qty: {item.qty}</p>
                    </div>
                    <p className="db-sale-amount">₹{item.revenue.toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── Quick Links ── */}
            <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:.24 }} className="card db-sales-card">
              <h3 style={{ marginBottom:12 }}>Quick Access</h3>
              {[
                { label:'All Bills',  path:'/all-bills', icon:<Receipt size={15} />,      color:'#3379A7' },
                { label:'Expenses',   path:'/expenses',  icon:<TrendingDown size={15} />, color:'#EF4444' },
                { label:'Staff',      path:'/staff',     icon:<ShoppingBag size={15} />,  color:'#6366F1' },
              ].map(l => (
                <button key={l.label} onClick={() => navigate(l.path)} style={{
                  width:'100%', background:'none', border:'none', display:'flex', alignItems:'center',
                  justifyContent:'space-between', padding:'10px 0', borderBottom:'1px solid var(--border)', cursor:'pointer',
                }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:10, background:`${l.color}18`, color:l.color, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      {l.icon}
                    </div>
                    <span style={{ fontSize:13, fontWeight:700, color:'var(--text)' }}>{l.label}</span>
                  </div>
                  <ArrowRight size={14} color="var(--text-sub)" />
                </button>
              ))}
            </motion.div>

          </>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
