import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useNavigate } from 'react-router-dom';
import { useSession, useDescope } from '@descope/react-sdk';
import { useBusiness } from '../App';
import { 
  Tag, 
  Package, 
  Printer, 
  HelpCircle, 
  LogOut, 
  ChevronRight, 
  User, 
  Building2,
  Phone,
  MessageSquare,
  Globe,
  Settings,
  Receipt,
  X,
  Loader2,
  RefreshCw,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/Profile.css';

const Profile = () => {
  const { logout } = useDescope();
  const { activeBusiness, logoutBusiness } = useBusiness();
  const navigate = useNavigate();
  const [showPrinterModal, setShowPrinterModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const menuSections = [
    {
      title: 'Management',
      items: [
        { icon: <Building2 size={18} />, label: 'Business', sub: 'Switch or manage outlets', action: () => navigate('/onboarding'), color: '#4A5568' },
        { icon: <Package size={18} />, label: 'Items', sub: 'Manage products & prices', path: '/products?tab=items', color: '#3379A7' },
        { icon: <Tag size={18} />, label: 'Categories', sub: 'Organize your catalog', path: '/products?tab=categories', color: '#10B981' },
        { icon: <Receipt size={18} />, label: 'Tax', sub: 'GST & Invoice settings', path: '/tax-settings', color: '#F59E0B' },
      ]
    },
    {
      title: 'Hardware',
      items: [
        { icon: <Printer size={18} />, label: 'Printer Setup', sub: 'Bluetooth thermal printer', action: () => setShowPrinterModal(true), color: '#6366F1' },
      ]
    },
    {
      title: 'Support',
      items: [
        { icon: <HelpCircle size={18} />, label: 'Help Center', sub: 'Customer care / FAQ', path: '/help', color: '#F59E0B' },
      ]
    }
  ];

  const handleLogout = () => {
    logoutBusiness();
    logout();
    navigate('/login');
  };

  const startScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <AppLayout title="Profile">
      <div className="profile-page">
        {/* Business Hero Card */}
        <div className="card profile-card">
           <div className="profile-biz-info">
             <div className="profile-biz-header">
                <div className="profile-logo-box">
                  <Building2 size={28} />
                </div>
                <div className="profile-biz-details">
                  <h2>{activeBusiness?.name}</h2>
                  <p>Premium Partner • Online</p>
                </div>
             </div>
           </div>
           <div className="profile-card-bg-icon">
             <Settings size={120} />
           </div>
        </div>

        {/* Dynamic Menu Groups */}
        {menuSections.map((section, idx) => (
          <div key={idx} className="menu-section">
            <h3 className="section-label">{section.title}</h3>
            <div className="menu-group">
              {section.items.map((item, i) => (
                <button
                  key={i}
                  className="menu-row"
                  onClick={() => item.path ? navigate(item.path) : item.action()}
                >
                  <div className="menu-icon-box" style={{ background: `${item.color}15`, color: item.color }}>
                    {item.icon}
                  </div>
                  <div className="menu-info">
                    <div className="menu-label">{item.label}</div>
                    <div className="menu-sub">{item.sub}</div>
                  </div>
                  <ChevronRight size={16} color="var(--border)" />
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="logout-container">
          <button onClick={handleLogout} className="btn logout-btn">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>

        {/* Modal */}
        <AnimatePresence>
          {showPrinterModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="modal-overlay">
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} className="modal-content">
                <div className="modal-header">
                  <div className="item-main">
                     <div className="logo-box" style={{ background: 'var(--primary-light)' }}>
                        <Printer size={18} color="var(--primary)" />
                     </div>
                     <h2 style={{ fontSize: '18px' }}>Hardware Setup</h2>
                  </div>
                  <button className="close-btn" onClick={() => setShowPrinterModal(false)}>
                    <X size={20} />
                  </button>
                </div>

                <div className="card scanner-card">
                  {isScanning ? (
                    <div>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="scan-indicator" />
                      <p style={{ fontWeight: '800' }}>Looking for printers...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="item-icon-box" style={{ margin: '0 auto 20px', width: '64px', height: '64px' }}>
                        <RefreshCw size={32} opacity={0.3} />
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>No Bluetooth devices found.</p>
                      <button onClick={startScan} className="btn btn-primary" style={{ width: 'auto', padding: '0 32px', margin: '0 auto' }}>
                        Start Hardware Scan
                      </button>
                    </div>
                  )}
                </div>

                <div className="hardware-info-card">
                   <div style={{ color: 'var(--primary)', marginTop: '2px' }}><Cpu size={18} /></div>
                   <div>
                     <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Compatibility Note</h4>
                     <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                       Supports all ESC/POS standard 58mm and 80mm thermal receipt printers via Bluetooth connectivity.
                     </p>
                   </div>
                </div>

                <div className="modal-actions">
                   <button onClick={() => setShowPrinterModal(false)} className="btn btn-ghost">Dismiss</button>
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
