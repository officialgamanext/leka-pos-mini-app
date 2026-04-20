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
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    <AppLayout title="Profile & Settings">
      <div className="animate-fade-in">
        {/* Business Card */}
        <div className="card" style={{ background: 'var(--primary)', color: 'white', padding: '24px', border: 'none', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
           <div style={{ position: 'relative', zIndex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', color: 'white' }}>{activeBusiness?.name}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px' }}>Business Workspace</p>
                </div>
             </div>
           </div>
           <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
             <Settings size={120} />
           </div>
        </div>

        {/* Menu Sections */}
        {menuSections.map((section, idx) => (
          <div key={idx} style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px', paddingLeft: '4px' }}>
              {section.title}
            </h3>
            <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.path ? navigate(item.path) : item.action()}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '14px 16px', 
                    background: 'none', 
                    border: 'none',
                    borderBottom: i === section.items.length - 1 ? 'none' : '1px solid var(--border)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ color: item.color, display: 'flex' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-main)' }}>{item.label}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{item.sub}</div>
                  </div>
                  <ChevronRight size={16} color="var(--border)" />
                </button>
              ))}
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="btn btn-outline"
          style={{ height: '52px', color: 'var(--danger)', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'rgba(239, 68, 68, 0.05)', marginBottom: '40px' }}
        >
          <LogOut size={18} />
          Sign Out
        </button>

        {/* Printer Modal */}
        <AnimatePresence>
          {showPrinterModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ background: 'var(--background)', width: '100%', borderTopLeftRadius: 'var(--radius-xl)', borderTopRightRadius: 'var(--radius-xl)', padding: '24px 20px calc(24px + var(--safe-area-bottom))', maxHeight: '80vh' }}>
                <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '20px' }}>Thermal Printer</h2>
                  <button onClick={() => setShowPrinterModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)' }}>Close</button>
                </div>

                <div className="card" style={{ padding: '20px', textAlign: 'center', border: '2px dashed var(--border)', background: 'transparent' }}>
                  {isScanning ? (
                    <div style={{ padding: '20px' }}>
                      <Loader2 className="animate-spin" size={32} color="var(--primary)" style={{ margin: '0 auto 16px' }} />
                      <p style={{ fontSize: '14px', fontWeight: '600' }}>Scanning for devices...</p>
                    </div>
                  ) : (
                    <div style={{ padding: '20px' }}>
                      <Printer size={40} color="var(--border)" style={{ marginBottom: '16px' }} />
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>No printer connected</p>
                      <button onClick={startScan} className="btn btn-primary" style={{ width: 'auto', padding: '10px 24px' }}>Scan for Printer</button>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '24px' }}>
                  <h4 style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>SUPPORTED HARDWARE</h4>
                  <p style={{ fontSize: '12px', background: 'white', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                    Standard USB/Bluetooth 58mm & 80mm thermal printers.
                  </p>
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
