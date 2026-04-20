import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { dashboardApi } from '../api/client';
import {
  IndianRupee, TrendingUp, TrendingDown, Receipt,
  ShoppingBag, ArrowRight, Loader2, BarChart2
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const RANGES = [
  { key: 'today',     label: 'Today'      },
  { key: 'yesterday', label: 'Yesterday'  },
  { key: 'thisWeek',  label: 'This Week'  },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'thisYear',  label: 'This Year'  },
];

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
  const chartData = data?.charts?.daily || [];

  // Normalise bar chart heights
  const maxRev = Math.max(...chartData.map(d => d.revenue), 1);

  return (
    <AppLayout>
      <div className="db-page">

        {/* ── Range Chips ── */}
        <div className="db-range-chips">
          {RANGES.map(r => (
            <button
              key={r.key}
              className={`db-range-chip${range === r.key ? ' active' : ''}`}
              onClick={() => handleRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 className="spin" size={28} color="var(--primary)" />
          </div>
        ) : (
          <>
            {/* ── Revenue Hero ── */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="db-revenue-card"
            >
              <div>
                <p className="db-revenue-label">
                  {RANGES.find(r => r.key === range)?.label} Revenue
                </p>
                <div className="db-revenue-amount">
                  ₹{(summary.revenue || 0).toLocaleString('en-IN')}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                  {summary.isProfit ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>
                      <TrendingUp size={14} /> +{summary.profitLossPct?.toFixed(1)}% profit
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 700, color: '#fca5a5' }}>
                      <TrendingDown size={14} /> -{summary.profitLossPct?.toFixed(1)}% loss
                    </span>
                  )}
                </div>
              </div>
              <div className="db-revenue-icon-wrap">
                <IndianRupee size={26} />
              </div>
              <div className="db-revenue-bg-icon"><IndianRupee size={110} /></div>
            </motion.div>

            {/* ── Stats Row ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .06 }}
              className="db-stats-row"
            >
              <div className="card db-stat-card">
                <span className="db-stat-label">Expenses</span>
                <span className="db-stat-value" style={{ color: '#EF4444' }}>
                  ₹{(summary.expenses || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="card db-stat-card">
                <span className="db-stat-label">Net</span>
                <span className="db-stat-value" style={{ color: summary.isProfit ? '#10B981' : '#EF4444' }}>
                  ₹{Math.abs(summary.net || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="card db-stat-card">
                <span className="db-stat-label">Bills</span>
                <span className="db-stat-value" style={{ color: 'var(--primary)' }}>
                  {summary.totalBills || 0}
                </span>
              </div>
            </motion.div>

            {/* ── Avg Order Value ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .1 }}
              className="card"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 11, background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBag size={17} />
                </div>
                <div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)' }}>Avg Order Value</p>
                  <p style={{ fontSize: 11 }}>Per transaction</p>
                </div>
              </div>
              <span style={{ fontSize: 17, fontWeight: 900, color: 'var(--primary)' }}>
                ₹{(summary.avgOrderValue || 0).toLocaleString('en-IN')}
              </span>
            </motion.div>

            {/* ── Bar Chart ── */}
            {chartData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .13 }}
                className="card db-chart-card"
              >
                <div className="flex-between db-chart-top">
                  <h3>Revenue Trend</h3>
                  <BarChart2 size={16} color="var(--primary)" />
                </div>
                <div className="db-chart-bars">
                  {chartData.slice(-7).map((d, i) => {
                    const pct = maxRev > 0 ? (d.revenue / maxRev) * 100 : 0;
                    const label = new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 2);
                    return (
                      <div key={i} className="db-bar-group">
                        <div className="db-bar-track">
                          <motion.div
                            className="db-bar-fill"
                            initial={{ height: 0 }}
                            animate={{ height: `${pct}%` }}
                            transition={{ delay: .15 + i * .04, duration: .5, ease: 'easeOut' }}
                          />
                        </div>
                        <span className="db-bar-label">{label}</span>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* ── Top Items ── */}
            {topItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: .17 }}
                className="card db-sales-card"
              >
                <div className="flex-between" style={{ marginBottom: 14 }}>
                  <h3>Top Selling Items</h3>
                  <TrendingUp size={15} color="var(--green)" />
                </div>
                {topItems.slice(0, 5).map((item, i) => (
                  <div key={item.name} className="db-sale-row">
                    <div className="db-sale-left">
                      <div className="db-sale-icon" style={{ background: `hsl(${210 - i * 20}, 60%, 94%)`, color: `hsl(${210 - i * 20}, 60%, 40%)` }}>
                        <span style={{ fontSize: 12, fontWeight: 900 }}>#{i + 1}</span>
                      </div>
                      <div>
                        <p className="db-sale-id">{item.name}</p>
                        <p className="db-sale-time">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <div>
                      <div className="db-sale-amount">₹{item.revenue.toLocaleString('en-IN')}</div>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* ── Quick Links ── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: .2 }}
              className="card db-sales-card"
            >
              <h3 style={{ marginBottom: 12 }}>Quick Links</h3>
              {[
                { label: 'View All Bills',  path: '/all-bills',  icon: <Receipt size={16} />,      color: '#3379A7' },
                { label: 'Expenses',        path: '/expenses',   icon: <TrendingDown size={16} />, color: '#EF4444' },
                { label: 'Staff',           path: '/staff',      icon: <ShoppingBag size={16} />,  color: '#6366F1' },
              ].map(l => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.path)}
                  style={{
                    width: '100%', background: 'none', border: 'none', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 10, background: `${l.color}18`, color: l.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {l.icon}
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>{l.label}</span>
                  </div>
                  <ArrowRight size={15} color="var(--border)" />
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
