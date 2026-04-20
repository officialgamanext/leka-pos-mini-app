import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import { useBusiness } from '../App';
import { useSession } from '@descope/react-sdk';
import { reportsApi } from '../api/client';
import { BarChart3, Loader2, Package, IndianRupee } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Reports.css';

const RANGES = [
  { key: 'today',     label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'thisWeek',  label: 'This Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'thisYear',  label: 'This Year' },
];

export default function Reports() {
  const { sessionToken }   = useSession();
  const { activeBusiness } = useBusiness();
  const [range, setRange]  = useState('today');
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      if (!activeBusiness || !sessionToken) return;
      setIsLoading(true);
      try {
        const res = await reportsApi.getSummary(activeBusiness.id, range, sessionToken);
        setReport(res);
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchReport();
  }, [range, activeBusiness, sessionToken]);

  const summary = report?.summary || {};
  const itemsSold = summary.itemSales || [];

  return (
    <AppLayout title="Reports">
      <div className="rp-page">
        {/* Filter Chips */}
        <div className="rp-range-chips">
          {RANGES.map(r => (
            <button 
              key={r.key} 
              className={`rp-range-chip ${range === r.key ? 'active' : ''}`}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <Loader2 className="spin" size={32} color="var(--primary)" />
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            
            {/* Overview Stats */}
            <div className="rp-overview">
              <div className="rp-stat-card">
                <span className="rp-stat-label">Total Revenue</span>
                <span className="rp-stat-val" style={{ color: 'var(--primary)' }}>
                  ₹{(summary.totalRevenue || 0).toLocaleString('en-IN')}
                </span>
              </div>
              <div className="rp-stat-card">
                <span className="rp-stat-label">Total Bills</span>
                <span className="rp-stat-val">{summary.totalBills || 0}</span>
              </div>
            </div>

            {/* Top Selling Items Table */}
            <h3 className="rp-section-title">
              <BarChart3 size={18} color="var(--primary)" /> Top Selling Items
            </h3>
            
            <div className="rp-table-card">
              <div className="rp-list-header">
                <div>Item Name</div>
                <div style={{ textAlign: 'right' }}>Sold</div>
                <div style={{ textAlign: 'right' }}>Revenue</div>
              </div>

              {itemsSold.length === 0 ? (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--text-sub)' }}>
                  <Package size={32} opacity={0.3} style={{ margin: '0 auto 10px' }} />
                  <p>No items sold in this period.</p>
                </div>
              ) : (
                itemsSold.map((item, idx) => (
                  <div key={item.name} className="rp-list-row">
                    <div className="rp-cell-name">
                      <span className={`rp-rank-badge ${idx < 3 ? `rp-rank-${idx + 1}` : ''}`}>
                        {idx + 1}
                      </span>
                      {item.name}
                    </div>
                    <div className="rp-cell-qty">{item.qty}</div>
                    <div className="rp-cell-rev">₹{item.revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                  </div>
                ))
              )}
            </div>

          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
