import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useDescope } from '@descope/react-sdk';
import { useBusiness } from '../App';
import {
  Tag, Package, Printer, HelpCircle, LogOut,
  ChevronRight, Building2, Receipt, X, Cpu, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Profile.css';

const sections = (setPrinter, navigate) => [
  {
    title: 'Management',
    items: [
      { icon: Building2, label: 'Business',    sub: 'Switch workspace',       color: '#4A5568', action: () => navigate('/onboarding') },
      { icon: Package,   label: 'Items',        sub: 'Products & pricing',     color: '#3379A7', action: () => navigate('/products?tab=items') },
      { icon: Tag,       label: 'Categories',   sub: 'Organize catalog',       color: '#10B981', action: () => navigate('/products?tab=categories') },
      { icon: Receipt,   label: 'Tax & GST',    sub: 'Invoice settings',       color: '#F59E0B', action: () => navigate('/tax-settings') },
    ],
  },
  {
    title: 'Hardware',
    items: [
      { icon: Printer, label: 'Bluetooth Printer', sub: 'Thermal receipt setup', color: '#6366F1', action: () => setPrinter(true) },
    ],
  },
  {
    title: 'Support',
    items: [
      { icon: HelpCircle, label: 'Help Center', sub: 'FAQs & customer care', color: '#F59E0B', action: () => navigate('/help') },
    ],
  },
];

const Profile = () => {
  const { logout }                    = useDescope();
  const { activeBusiness, logoutBusiness } = useBusiness();
  const navigate                      = useNavigate();
  const [printerOpen, setPrinterOpen] = useState(false);
  const [scanning,    setScanning]    = useState(false);

  const handleLogout = () => { logoutBusiness(); logout(); navigate('/login'); };

  const scan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <AppLayout>
      <div className="pf-page">

        {/* Hero */}
        <div className="pf-hero">
          <div className="pf-hero-icon"><Building2 size={26} /></div>
          <div>
            <p className="pf-hero-name">{activeBusiness?.name || 'My Business'}</p>
            <p className="pf-hero-sub">Active workspace</p>
          </div>
          <div className="pf-hero-bg"><Building2 size={110} /></div>
        </div>

        {/* Menu Sections */}
        {sections(setPrinterOpen, navigate).map((sec) => (
          <div key={sec.title} className="pf-section">
            <p className="pf-section-label">{sec.title}</p>
            <div className="pf-group">
              {sec.items.map(({ icon: Icon, label, sub, color, action }) => (
                <button key={label} className="pf-row" onClick={action}>
                  <div className="pf-row-icon" style={{ background: `${color}18`, color }}>
                    <Icon size={17} />
                  </div>
                  <div className="pf-row-text">
                    <p className="pf-row-label">{label}</p>
                    <p className="pf-row-sub">{sub}</p>
                  </div>
                  <ChevronRight size={15} className="pf-chevron" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="pf-logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>

        {/* Printer Modal */}
        <AnimatePresence>
          {printerOpen && (
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={e => e.target === e.currentTarget && setPrinterOpen(false)}
            >
              <motion.div
                className="modal-sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              >
                <div className="modal-drag-bar" />

                <div className="modal-head">
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="logo-box" style={{ background:'#EEF2FF', color:'#6366F1' }}>
                      <Printer size={16} />
                    </div>
                    <h2>Printer Setup</h2>
                  </div>
                  <button className="modal-close" onClick={() => setPrinterOpen(false)}><X size={18} /></button>
                </div>

                <div className="modal-body">
                  <div className="pf-printer-placeholder">
                    {scanning ? (
                      <>
                        <div className="pf-scan-ring" />
                        <p style={{ fontWeight:700, fontSize:13 }}>Scanning for devices…</p>
                        <p style={{ fontSize:11, marginTop:4 }}>Keep Bluetooth enabled</p>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={36} color="var(--border)" style={{ marginBottom:14 }} />
                        <p style={{ fontWeight:700, fontSize:13, marginBottom:6 }}>No printer detected</p>
                        <p style={{ fontSize:11, marginBottom:18 }}>Make sure your printer is powered on</p>
                        <button className="btn btn-primary" style={{ width:'auto', padding:'0 28px' }} onClick={scan}>
                          Scan for Printers
                        </button>
                      </>
                    )}
                  </div>

                  <div className="pf-info-box">
                    <Cpu size={16} className="pf-info-icon" />
                    <div>
                      <p className="pf-info-title">Auto-Configuration</p>
                      <p style={{ fontSize:11, lineHeight:1.5 }}>
                        Compatible with ESC/POS 58mm and 80mm Bluetooth thermal printers.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="modal-foot" style={{ gridTemplateColumns:'1fr' }}>
                  <button className="btn btn-ghost" onClick={() => setPrinterOpen(false)}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </AppLayout>
  );
};

export default Profile;
