import React, { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import { useSession } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { reportsApi } from '../api/client';
import { Receipt, Loader2, IndianRupee, ReceiptText } from 'lucide-react';
import { motion } from 'framer-motion';
import '../styles/AllBills.css';

// ── Date range helpers ────────────────────────────────────────────────────────
const fmt = (d) => d.toISOString().split('T')[0]; // YYYY-MM-DD

function getRangeDates(range) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const ranges = {
    today: [today, today],
    yesterday: [new Date(today - 864e5), new Date(today - 864e5)],
    thisWeek: [new Date(today - today.getDay() * 864e5), today],
    lastWeek: (() => {
      const s = new Date(today - today.getDay() * 864e5 - 7 * 864e5);
      const e = new Date(s.getTime() + 6 * 864e5);
      return [s, e];
    })(),
    thisMonth: [new Date(now.getFullYear(), now.getMonth(), 1), today],
    lastMonth: [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 0)],
    thisYear: [new Date(now.getFullYear(), 0, 1), today],
    lastYear: [new Date(now.getFullYear() - 1, 0, 1), new Date(now.getFullYear() - 1, 11, 31)],
    all: [new Date(2020, 0, 1), today],
  };
  return ranges[range] || ranges.all;
}

const FILTERS = [
  { key: 'today', label: 'Today' },
  { key: 'yesterday', label: 'Yesterday' },
  { key: 'thisWeek', label: 'This Week' },
  { key: 'lastWeek', label: 'Last Week' },
  { key: 'thisMonth', label: 'This Month' },
  { key: 'lastMonth', label: 'Last Month' },
  { key: 'thisYear', label: 'This Year' },
  { key: 'lastYear', label: 'Last Year' },
  { key: 'custom', label: 'Custom' },
];

// Map UI keys → API range param values
const API_RANGE_MAP = {
  today: 'today',
  yesterday: 'yesterday',
  thisWeek: 'thisWeek',
  lastWeek: 'lastWeek',
  thisMonth: 'thisMonth',
  lastMonth: 'lastMonth',
  thisYear: 'thisYear',
  lastYear: 'lastYear',
};

// ── Component ─────────────────────────────────────────────────────────────────
const AllBills = () => {
  const { sessionToken } = useSession();
  const { activeBusiness } = useBusiness();

  const [bills, setBills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeRange, setActiveRange] = useState('today');
  const [customStart, setCustomStart] = useState(fmt(new Date(Date.now() - 7 * 864e5)));
  const [customEnd, setCustomEnd] = useState(fmt(new Date()));

  const fetchBills = useCallback(async (range = activeRange, cStart = customStart, cEnd = customEnd) => {
    setIsLoading(true);
    setBills([]);
    try {
      let data;
      if (range === 'custom') {
        data = await reportsApi.getCustom(activeBusiness.id, cStart, cEnd, sessionToken);
      } else {
        // Use client-side date filtering on top of the widest API range
        // to support ranges the backend might not natively support
        const apiRange = API_RANGE_MAP[range] || 'thisYear';
        data = await reportsApi.getSummary(activeBusiness.id, apiRange, sessionToken);
      }

      let allBills = data?.bills || [];

      // Client-side filter for 'yesterday' that backend may not support
      if (range === 'yesterday') {
        const [start, end] = getRangeDates(range);
        const endOfDay = new Date(end.getTime() + 24 * 3600 * 1000 - 1);
        allBills = allBills.filter(b => {
          const d = new Date(b.createdAt);
          return d >= start && d <= endOfDay;
        });
      }

      // Sort newest first
      allBills.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setBills(allBills);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [activeBusiness, sessionToken]);

  useEffect(() => { fetchBills(); }, [sessionToken, activeBusiness]);

  const handleRangeSelect = (key) => {
    setActiveRange(key);
    if (key !== 'custom') fetchBills(key);
  };

  const handleCustomApply = () => fetchBills('custom', customStart, customEnd);

  // Summary totals
  const totalAmount = bills.reduce((s, b) => s + Number(b.total || 0), 0);

  return (
    <AppLayout title="All Bills">
      <div className="ab-page">

        {/* ── Revenue Hero ── */}
        <div className="ab-hero">
          <div>
            <p className="ab-hero-label">
              {FILTERS.find(f => f.key === activeRange)?.label} Revenue
            </p>
            <div className="ab-hero-amount">
              ₹{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </div>
            <p className="ab-hero-count">
              {bills.length} transaction{bills.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="ab-hero-icon-wrap">
            <IndianRupee size={26} />
          </div>
          <div className="ab-hero-bg"><IndianRupee size={110} /></div>
        </div>

        {/* ── Date Filter Chips ── */}
        <div className="ab-filters">
          {FILTERS.map(f => (
            <button
              key={f.key}
              className={`ab-filter-chip${activeRange === f.key ? ' active' : ''}`}
              onClick={() => handleRangeSelect(f.key)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* ── Custom Date Picker ── */}
        {activeRange === 'custom' && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="ab-custom-row"
          >
            <input
              type="date"
              className="ab-date-input"
              value={customStart}
              max={customEnd}
              onChange={e => setCustomStart(e.target.value)}
            />
            <span style={{ fontSize: 12, color: 'var(--text-sub)', fontWeight: 700 }}>to</span>
            <input
              type="date"
              className="ab-date-input"
              value={customEnd}
              min={customStart}
              max={fmt(new Date())}
              onChange={e => setCustomEnd(e.target.value)}
            />
            <button className="ab-apply-btn" onClick={handleCustomApply}>
              Go
            </button>
          </motion.div>
        )}

        {/* ── Bill List ── */}
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <Loader2 className="spin" size={28} color="var(--primary)" />
          </div>
        ) : bills.length === 0 ? (
          <div className="ab-empty">
            <div className="ab-empty-icon"><ReceiptText size={48} /></div>
            <p>No transactions in this period</p>
          </div>
        ) : (
          <div className="ab-list">
            {bills.map((bill, i) => (
              <motion.div
                key={bill.id}
                className="card ab-row"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <div className="ab-icon"><ReceiptText size={19} /></div>

                <div style={{ flex: 1 }}>
                  <p className="ab-bill-id">
                    Bill #{bill.id?.slice(-5)?.toUpperCase() || String(i + 1).padStart(4, '0')}
                  </p>
                  <p className="ab-bill-meta">
                    {new Date(bill.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' · '}
                    {new Date(bill.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <p className="ab-bill-amt">₹{Number(bill.total).toLocaleString('en-IN')}</p>
                  {bill.gstAmount > 0 && (
                    <p style={{ fontSize: 10, color: '#F59E0B', fontWeight: 700 }}>
                      + ₹{Number(bill.gstAmount).toLocaleString('en-IN')} GST
                    </p>
                  )}
                  <p className="ab-bill-items">{bill.items?.length || 0} item{bill.items?.length !== 1 ? 's' : ''}</p>
                </div>

                <span className="ab-paid-badge">PAID</span>
              </motion.div>
            ))}
          </div>
        )}

      </div>
    </AppLayout>
  );
};

export default AllBills;
