import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { reportsApi } from '../api/client';
import { 
  TrendingUp, 
  ShoppingBag, 
  Users, 
  ArrowUpRight, 
  Loader2, 
  Plus, 
  FileText, 
  CreditCard, 
  Wallet,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('today');

  useEffect(() => {
    fetchData();
  }, [range, sessionToken, activeBusiness]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const summary = await reportsApi.getSummary(activeBusiness.id, range, sessionToken);
      setData(summary);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'New Bill', icon: <Plus size={24} />, path: '/billing', color: '#3379A7' },
    { label: 'Inventory', icon: <ShoppingBag size={24} />, path: '/products', color: '#10B981' },
    { label: 'Reports', icon: <FileText size={24} />, path: '/all-bills', color: '#6366F1' },
    { label: 'Profile', icon: <Users size={24} />, path: '/profile', color: '#F59E0B' },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="animate-fade-in">
        {/* Main Stats Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="card" 
          style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px' }}
        >
          <div style={{ width: '64px', height: '64px', borderRadius: '32px', background: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#92400E', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)' }}>
            <span style={{ fontSize: '24px', fontWeight: '800' }}>₹</span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex-between">
              <span style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: '600' }}>Total Revenue</span>
              <button onClick={() => navigate('/all-bills')} style={{ color: 'var(--primary)', border: 'none', background: 'none', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2' }}>
                View All <ChevronRight size={14} />
              </button>
            </div>
            <h2 style={{ fontSize: '32px', marginTop: '4px' }}>₹{data?.summary?.totalRevenue?.toLocaleString() || '0'}</h2>
          </div>
        </motion.div>

        {/* Payment Summary / Chart inspired by Ref */}
        <div className="card" style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '15px', marginBottom: '20px' }}>Payment Summary</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '120px', padding: '0 10px', gap: '8px' }}>
            {[30, 45, 100, 65, 85, 120, 90].map((val, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <motion.div 
                  initial={{ height: 0 }}
                  animate={{ height: `${(val / 120) * 100}%` }}
                  style={{ width: '100%', background: 'linear-gradient(180deg, #3379A7 0%, #60A5FA 100%)', borderRadius: '4px', opacity: i === 5 ? 1 : 0.6 }}
                />
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  {['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions Grid */}
        <h3 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '16px', marginTop: '24px' }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '24px' }}>
          {quickActions.map((action, i) => (
            <motion.div 
              key={i}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(action.path)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}
            >
              <div style={{ width: '100%', aspectRatio: '1', background: 'white', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: action.color, boxShadow: 'var(--shadow-sm)', border: '1px solid rgba(255,255,255,0.1)' }}>
                {action.icon}
              </div>
              <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-muted)', textAlign: 'center' }}>{action.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Recent Transactions List */}
        <h3 style={{ fontSize: '15px', color: 'var(--text-main)', marginBottom: '16px' }}>Recent Sales</h3>
        <div style={{ display: 'grid', gap: '12px' }}>
          {data?.bills?.slice(0, 5).map((bill, i) => (
            <motion.div 
              key={bill.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="card flex-between" 
              style={{ padding: '14px 16px', marginBottom: 0 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Wallet size={18} />
                </div>
                <div>
                  <h4 style={{ fontSize: '14px' }}>Bill #{bill.id.slice(-4)}</h4>
                  <p style={{ fontSize: '11px' }}>{new Date(bill.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '15px' }}>₹{bill.total}</div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Completed</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
