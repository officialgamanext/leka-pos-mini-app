import React from 'react';
import AppLayout from '../components/AppLayout';
import { useBusiness } from '../App';
import { 
  Plus, 
  Receipt, 
  TrendingUp, 
  Users, 
  Settings, 
  Package, 
  History, 
  ArrowRight,
  ShoppingCart,
  LayoutGrid,
  CreditCard,
  IndianRupee
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();

  const stats = [
    { label: 'Today', value: '₹1,240', color: '#10B981' },
    { label: 'Weekly', value: '₹8,450', color: '#3379A7' },
    { label: 'Monthly', value: '₹42,120', color: '#6366F1' }
  ];

  const quickActions = [
    { icon: <Plus size={24} />, label: 'Bill', path: '/billing', color: 'var(--primary)' },
    { icon: <Package size={24} />, label: 'Items', path: '/products?tab=items', color: '#8B5CF6' },
    { icon: <LayoutGrid size={24} />, label: 'Menu', path: '/products?tab=categories', color: '#10B981' },
    { icon: <Users size={24} />, label: 'Staff', path: '/profile', color: '#F59E0B' },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="dashboard-container">
        
        {/* Main Revenue Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card revenue-card"
        >
          <div className="revenue-icon-box">
             <IndianRupee size={28} />
          </div>
          <div>
            <p className="revenue-label">TODAY'S TURNOVER</p>
            <h1 className="revenue-amount">₹ 14,235.00</h1>
          </div>
        </motion.div>

        {/* Weekly Summary Chart */}
        <div className="card summary-card">
          <div className="flex-between summary-header">
            <h3>Sales Summary</h3>
            <TrendingUp size={18} color="var(--secondary)" />
          </div>
          <div className="chart-container">
            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
              <div key={i} className="chart-bar-group">
                <motion.div 
                  initial={{ height: 0 }} animate={{ height: `${h}%` }}
                  className="chart-bar" 
                />
                <span className="chart-label">{['M','T','W','T','F','S','S'][i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="quick-actions-section">
          <h3 className="section-title">Quick Services</h3>
          <div className="actions-grid">
            {quickActions.map((action, i) => (
              <div key={i} className="action-item" onClick={() => navigate(action.path)}>
                <div className="action-icon-box" style={{ color: action.color }}>
                  {action.icon}
                </div>
                <span className="action-label">{action.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Transaction History Preview */}
        <div className="recent-sales-section">
           <div className="flex-between section-title" style={{ marginBottom: '12px' }}>
              <h3>Latest Transactions</h3>
              <button 
                onClick={() => navigate('/all-bills')}
                style={{ fontSize: '13px', color: 'var(--primary)', border: 'none', background: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                View all <ArrowRight size={14} />
              </button>
           </div>
           <div className="recent-sales-list">
              {[
                { id: '#4251', time: '12:45 PM', price: '450.00' },
                { id: '#4250', time: '11:20 AM', price: '120.00' }
              ].map(sale => (
                <div key={sale.id} className="card sale-item">
                   <div style={{ display: 'flex', gap: '14px' }}>
                      <div className="sale-icon-box">
                         <Receipt size={20} />
                      </div>
                      <div className="sale-info">
                        <h4>Order {sale.id}</h4>
                        <p>Paid via Cash • {sale.time}</p>
                      </div>
                   </div>
                   <div className="sale-amount">
                      <div className="amount-val">₹{sale.price}</div>
                      <div className="status-label">COMPLETED</div>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </AppLayout>
  );
};

export default Dashboard;
