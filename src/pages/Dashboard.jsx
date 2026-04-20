import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { reportsApi } from '../api/client';
import { TrendingUp, Users, ShoppingCart, DollarSign, Loader2, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [range, setRange] = useState('today');

  useEffect(() => {
    fetchReport();
  }, [range, sessionToken, activeBusiness]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const data = await reportsApi.getSummary(activeBusiness.id, range, sessionToken);
      setReport(data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const stats = [
    { label: 'Revenue', value: `₹${report?.summary?.totalRevenue || 0}`, icon: <DollarSign size={20} />, color: '#4F46E5' },
    { label: 'Orders', value: report?.summary?.totalBills || 0, icon: <ShoppingCart size={20} />, color: '#10B981' },
    { label: 'Avg. Bill', value: `₹${Math.round(report?.summary?.averageBillValue || 0)}`, icon: <TrendingUp size={20} />, color: '#F59E0B' },
  ];

  return (
    <AppLayout title="Dashboard">
      <div className="animate-fade-in">
        {/* Range Selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
          {['today', 'lastWeek', 'lastMonth'].map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: '600',
                border: '1px solid',
                borderColor: range === r ? 'var(--primary)' : 'var(--border)',
                background: range === r ? 'var(--primary-light)' : 'white',
                color: range === r ? 'var(--primary)' : 'var(--text-muted)',
                whiteSpace: 'nowrap'
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1).replace('last', 'Last ')}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '16px' }}>
            {/* Quick Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="card" 
                  style={{ marginBottom: 0, padding: '16px' }}
                >
                  <div style={{ color: stat.color, marginBottom: '12px' }}>{stat.icon}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{stat.value}</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{stat.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Sales by Category */}
            <div className="card">
              <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-muted)' }}>Sales by Category</h3>
              {report?.summary?.salesByCategory && Object.entries(report.summary.salesByCategory).length > 0 ? (
                <div style={{ display: 'grid', gap: '12px' }}>
                  {Object.entries(report.summary.salesByCategory).map(([cat, amount], i) => (
                    <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                       <div style={{ flex: 1 }}>
                          <div className="flex-between" style={{ marginBottom: '4px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '500' }}>{cat}</span>
                            <span style={{ fontSize: '13px' }}>₹{amount}</span>
                          </div>
                          <div style={{ height: '6px', background: 'var(--background)', borderRadius: '3px', overflow: 'hidden' }}>
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(amount / report.summary.totalRevenue) * 100}%` }}
                              style={{ height: '100%', background: 'var(--primary)' }}
                            />
                          </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ textAlign: 'center', padding: '20px' }}>No sales data for this period.</p>
              )}
            </div>
            
            {/* Recent Activity */}
            <div className="card">
              <h3 style={{ fontSize: '14px', marginBottom: '16px', color: 'var(--text-muted)' }}>Recent Bills</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {report?.bills?.slice(0, 5).map((bill) => (
                  <div key={bill.id} className="flex-between" style={{ paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{bill.items.length} Items</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(bill.createdAt).toLocaleTimeString()}</div>
                    </div>
                    <div style={{ fontWeight: '600', color: 'var(--primary)' }}>₹{bill.total}</div>
                  </div>
                ))}
                {(!report?.bills || report.bills.length === 0) && <p style={{ fontSize: '13px' }}>No bills found.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Dashboard;
