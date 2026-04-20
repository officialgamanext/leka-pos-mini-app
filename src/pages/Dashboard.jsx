import React from 'react';
import AppLayout from '../components/AppLayout';
import { Receipt, TrendingUp, IndianRupee, Plus, Package, LayoutGrid, Users, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import '../styles/Dashboard.css';

const chartData = [38, 65, 42, 88, 55, 28, 75];
const days        = ['M','T','W','T','F','S','S'];

const quickActions = [
  { icon: Plus,        label: 'Bill',   path: '/billing',              bg: 'var(--primary)',       color: '#fff' },
  { icon: Package,     label: 'Items',  path: '/products?tab=items',   bg: '#EEF2FF', color: '#6366F1' },
  { icon: LayoutGrid,  label: 'Menu',   path: '/products?tab=categories', bg: '#ECFDF5', color: '#10B981' },
  { icon: Users,       label: 'More',   path: '/profile',              bg: '#FFFBEB', color: '#F59E0B' },
];

const mockSales = [
  { id: '#4251', time: '12:45 PM', price: '450.00' },
  { id: '#4250', time: '11:20 AM', price: '120.00' },
  { id: '#4249', time: '09:05 AM', price: '275.50' },
];

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="db-page">

        {/* ── Revenue Hero ── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="db-revenue-card"
        >
          <div>
            <p className="db-revenue-label">Today's Revenue</p>
            <div className="db-revenue-amount">₹14,235</div>
          </div>
          <div className="db-revenue-icon-wrap">
            <IndianRupee size={26} />
          </div>
          <div className="db-revenue-bg-icon">
            <IndianRupee size={110} />
          </div>
        </motion.div>

        {/* ── Stats Row ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .07 }}
          className="db-stats-row"
        >
          {[
            { label: 'Weekly',  val: '₹8,450',  bg: '#E9F2F9', color: 'var(--primary)' },
            { label: 'Monthly', val: '₹42.1K',  bg: '#EEF2FF', color: '#6366F1' },
            { label: 'Orders',  val: '34',      bg: '#ECFDF5', color: '#10B981' },
          ].map(s => (
            <div key={s.label} className="card db-stat-card">
              <span className="db-stat-label">{s.label}</span>
              <span className="db-stat-value" style={{ color: s.color }}>{s.val}</span>
            </div>
          ))}
        </motion.div>

        {/* ── Bar Chart ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .12 }}
          className="card db-chart-card"
        >
          <div className="flex-between db-chart-top">
            <h3>Weekly Sales</h3>
            <TrendingUp size={16} color="var(--green)" />
          </div>
          <div className="db-chart-bars">
            {chartData.map((pct, i) => (
              <div key={i} className="db-bar-group">
                <div className="db-bar-track">
                  <motion.div
                    className="db-bar-fill"
                    initial={{ height: 0 }}
                    animate={{ height: `${pct}%` }}
                    transition={{ delay: .15 + i * .04, duration: .5, ease: 'easeOut' }}
                  />
                </div>
                <span className="db-bar-label">{days[i]}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Quick Actions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .17 }}
          className="card db-actions-card"
        >
          <p className="db-section-head">Quick Actions</p>
          <div className="db-actions-grid">
            {quickActions.map(({ icon: Icon, label, path, bg, color }) => (
              <button key={label} className="db-action" onClick={() => navigate(path)}>
                <div className="db-action-icon" style={{ background: bg, color }}>
                  <Icon size={22} />
                </div>
                <span className="db-action-label">{label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Latest Transactions ── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: .22 }}
          className="card db-sales-card"
        >
          <div className="flex-between" style={{ marginBottom: 14 }}>
            <h3>Latest Transactions</h3>
            <button
              onClick={() => navigate('/all-bills')}
              style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, fontWeight:700, color:'var(--primary)', background:'none', border:'none' }}
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          {mockSales.map(s => (
            <div key={s.id} className="db-sale-row">
              <div className="db-sale-left">
                <div className="db-sale-icon"><Receipt size={17} /></div>
                <div>
                  <p className="db-sale-id">{s.id}</p>
                  <p className="db-sale-time">Cash • {s.time}</p>
                </div>
              </div>
              <div>
                <div className="db-sale-amount">₹{s.price}</div>
                <div className="db-sale-status">PAID</div>
              </div>
            </div>
          ))}
        </motion.div>

      </div>
    </AppLayout>
  );
};

export default Dashboard;
