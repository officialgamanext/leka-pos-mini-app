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
        <div className="card" style={{ background: 'var(--primary)', color: 'white', padding: '24px', border: 'none', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 12px 30px rgba(51, 121, 167, 0.4)' }}>
           <div style={{ position: 'relative', zIndex: 1 }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ width: '56px', height: '56px', background: 'rgba(255,255,255,0.2)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(5px)' }}>
                  <Building2 size={28} />
                </div>
                <div>
                  <h2 style={{ fontSize: '18px', color: 'white', fontWeight: '800' }}>{activeBusiness?.name}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', fontWeight: '600' }}>Premium Plan • Active Workspace</p>
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
            <h3 style={{ fontSize: '11px', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '12px', paddingLeft: '4px' }}>
              {section.title}
            </h3>
            <div style={{ background: 'white', borderRadius: '20px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
              {section.items.map((item, i) => (
                <button
                  key={i}
                  onClick={() => item.path ? navigate(item.path) : item.action()}
                  style={{ 
                    width: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '16px', 
                    padding: '16px', 
                    background: 'none', 
                    border: 'none',
                    borderBottom: i === section.items.length - 1 ? 'none' : '1px solid var(--border)',
                    textAlign: 'left'
                  }}
                >
                  <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {item.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-main)' }}>{item.label}</div>
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
          style={{ height: '56px', color: '#EF4444', borderColor: 'rgba(239, 68, 68, 0.2)', background: 'white', marginBottom: '40px', borderRadius: '18px' }}
        >
          <LogOut size={18} />
          Sign Out of Application
        </button>

        {/* Enhanced Printer Modal */}
        <AnimatePresence>
          {showPrinterModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end', zIndex: 1000 }}>
              <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} style={{ background: 'var(--background)', width: '100%', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px 20px calc(24px + var(--safe-area-bottom))', maxHeight: '80vh' }}>
                <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '2px', margin: '0 auto 20px' }} />
                
                <div className="flex-between" style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                     <div style={{ width: '40px', height: '40px', background: 'var(--primary-light)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                        <Printer size={20} />
                     </div>
                     <h2 style={{ fontSize: '20px' }}>Printer Setup</h2>
                  </div>
                  <button onClick={() => setShowPrinterModal(false)} style={{ background: 'white', border: '1px solid var(--border)', padding: '6px', borderRadius: '10px', color: 'var(--text-muted)', display: 'flex' }}>
                    <X size={20} />
                  </button>
                </div>

                <div className="card" style={{ padding: '32px 20px', textAlign: 'center', border: '2px dashed var(--border)', background: 'white', marginBottom: '24px' }}>
                  {isScanning ? (
                    <div style={{ padding: '20px' }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} style={{ width: '56px', height: '56px', borderRadius: '28px', border: '4px solid var(--primary-light)', borderTopColor: 'var(--primary)', margin: '0 auto 20px' }} />
                      <p style={{ fontSize: '15px', fontWeight: '700' }}>Scanning for Devices</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Make sure your Bluetooth is ON</p>
                    </div>
                  ) : (
                    <div style={{ padding: '10px' }}>
                      <div style={{ width: '64px', height: '64px', background: 'var(--background)', borderRadius: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', margin: '0 auto 20px' }}>
                        <RefreshCw size={32} opacity={0.3} />
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>No Bluetooth thermal printer detected</p>
                      <button onClick={startScan} className="btn btn-primary" style={{ width: 'auto', padding: '12px 32px', margin: '0 auto' }}>
                        Scan Hardware
                      </button>
                    </div>
                  )}
                </div>

                <div style={{ background: 'white', padding: '16px', borderRadius: '16px', border: '1px solid var(--border)', display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                   <div style={{ color: 'var(--primary)', marginTop: '2px' }}><Cpu size={18} /></div>
                   <div>
                     <h4 style={{ fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>Auto-Configuration</h4>
                     <p style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                       The application will automatically detect print parameters for 58mm and 80mm thermal receipt printers.
                     </p>
                   </div>
                </div>

                <div style={{ marginTop: '32px' }}>
                   <button onClick={() => setShowPrinterModal(false)} className="btn btn-outline" style={{ background: 'white', height: '56px' }}>Close Setup</button>
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
