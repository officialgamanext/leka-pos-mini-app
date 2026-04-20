import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { reportsApi } from '../api/client';
import { Receipt, Calendar, ChevronRight, Loader2, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const AllBills = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();
  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchBills();
  }, [sessionToken, activeBusiness]);

  const fetchBills = async () => {
    try {
      // reportsApi.getSummary for lastWeek usually returns a good list of recent bills
      const data = await reportsApi.getSummary(activeBusiness.id, 'lastWeek', sessionToken);
      setBills(data.bills || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AppLayout title="Transaction History">
      <div className="animate-fade-in">
        {isLoading ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {bills.map((bill, i) => (
              <motion.div 
                key={bill.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card"
                style={{ padding: '14px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '12px' }}
              >
                <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Receipt size={18} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex-between" style={{ marginBottom: '2px' }}>
                    <span style={{ fontWeight: '700', fontSize: '15px' }}>₹{bill.total}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={10} />
                      {new Date(bill.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex-between">
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{bill.items.length} items</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{new Date(bill.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
                <ArrowUpRight size={16} color="var(--border)" />
              </motion.div>
            ))}

            {bills.length === 0 && (
              <div style={{ textAlign: 'center', padding: '100px 20px', color: 'var(--text-muted)' }}>
                <Receipt size={48} style={{ opacity: 0.1, marginBottom: '16px' }} />
                <p>No transactions found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AllBills;
