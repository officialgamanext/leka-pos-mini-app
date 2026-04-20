import React, { useState, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import ModalPortal from '../components/ModalPortal';
import { useNavigate } from 'react-router-dom';
import { useDescope } from '@descope/react-sdk';
import { useBusiness } from '../App';
import {
  Tag, Package, Printer, HelpCircle, LogOut,
  ChevronRight, Building2, Receipt, X, Cpu,
  Bluetooth, BluetoothOff, Check, AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  connectPrinter,
  disconnectPrinter,
  isPrinterConnected,
  getPrinterName,
  printText
} from '../utils/bluetooth';
import '../styles/Profile.css';

const sections = (setPrinter, navigate) => [
  {
    title: 'Management',
    items: [
      { icon: Building2,  label: 'Business',         sub: 'Switch workspace',       color: '#4A5568', action: () => navigate('/onboarding') },
      { icon: Package,    label: 'Items',             sub: 'Products & pricing',     color: '#3379A7', action: () => navigate('/products?tab=items') },
      { icon: Tag,        label: 'Categories',        sub: 'Organize catalog',       color: '#10B981', action: () => navigate('/products?tab=categories') },
      { icon: Receipt,    label: 'Tax & GST',         sub: 'Invoice settings',       color: '#F59E0B', action: () => navigate('/tax-settings') },
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
  const { logout }                         = useDescope();
  const { activeBusiness, logoutBusiness } = useBusiness();
  const navigate                           = useNavigate();

  const [printerOpen, setPrinterOpen] = useState(false);
  const [btStatus,    setBtStatus]    = useState('idle'); // idle | connecting | connected | error
  const [printerName, setPrinterName] = useState('');
  const [btError,     setBtError]     = useState('');
  const [testStatus,  setTestStatus]  = useState('');

  const handleLogout = () => { logoutBusiness(); logout(); navigate('/login'); };
  const closePrinter = () => setPrinterOpen(false);

  const handleConnect = useCallback(async () => {
    setBtStatus('connecting');
    setBtError('');
    try {
      const { name } = await connectPrinter();
      setPrinterName(name);
      setBtStatus('connected');
    } catch (err) {
      setBtError(err.message || 'Could not connect. Make sure Bluetooth is on and the printer is nearby.');
      setBtStatus('error');
    }
  }, []);

  const handleDisconnect = useCallback(async () => {
    await disconnectPrinter();
    setPrinterName('');
    setBtStatus('idle');
    setTestStatus('');
  }, []);

  const handleTestPrint = useCallback(async () => {
    setTestStatus('printing');
    try {
      await printText(
        `\n  === LEKA POS ===\n\n  Test Print\n  ${new Date().toLocaleString()}\n\n  Printer OK!\n\n`
      );
      setTestStatus('done');
      setTimeout(() => setTestStatus(''), 3000);
    } catch (err) {
      setTestStatus('error');
      setTimeout(() => setTestStatus(''), 3000);
    }
  }, []);

  const isConnected = btStatus === 'connected';

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
                    <p className="pf-row-sub">
                      {label === 'Bluetooth Printer' && isConnected
                        ? `Connected: ${printerName}`
                        : sub}
                    </p>
                  </div>
                  {label === 'Bluetooth Printer' && isConnected
                    ? <div style={{ width: 8, height: 8, borderRadius: 4, background: '#10B981' }} />
                    : <ChevronRight size={15} className="pf-chevron" />}
                </button>
              ))}
            </div>
          </div>
        ))}

        <button className="pf-logout" onClick={handleLogout}>
          <LogOut size={16} /> Sign Out
        </button>

      </div>

      {/* Printer Modal */}
      <AnimatePresence>
        {printerOpen && (
          <ModalPortal>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={e => e.target === e.currentTarget && closePrinter()}
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
                    <div className="logo-box" style={{ background: isConnected ? '#ECFDF5' : '#EEF2FF', color: isConnected ? '#10B981' : '#6366F1' }}>
                      {isConnected ? <Bluetooth size={16} /> : <Printer size={16} />}
                    </div>
                    <div>
                      <h2>Bluetooth Printer</h2>
                      {isConnected && <p style={{ fontSize: 11, color: '#10B981', fontWeight: 700, marginTop: 2 }}>● Connected</p>}
                    </div>
                  </div>
                  <button className="modal-close" onClick={closePrinter}><X size={18} /></button>
                </div>

                <div className="modal-body">
                  {/* Status Card */}
                  <div className="pf-bt-status-card" style={{
                    background: isConnected ? '#F0FDF4' : btStatus === 'error' ? '#FFF5F5' : 'var(--surface-alt)',
                    border: `1px solid ${isConnected ? '#BBF7D0' : btStatus === 'error' ? '#FECACA' : 'var(--border)'}`,
                    borderRadius: 'var(--r-md)',
                    padding: '20px',
                    textAlign: 'center',
                    marginBottom: 16,
                  }}>
                    {btStatus === 'idle' && (
                      <>
                        <div style={{ width: 56, height: 56, borderRadius: 28, background: 'var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                          <Bluetooth size={28} color="var(--text-sub)" />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>No printer connected</p>
                        <p style={{ fontSize: 12, marginBottom: 18 }}>Tap the button below to find your printer</p>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '0 28px' }} onClick={handleConnect}>
                          <Bluetooth size={16} /> Connect Printer
                        </button>
                      </>
                    )}

                    {btStatus === 'connecting' && (
                      <>
                        <div className="pf-scan-ring" style={{ margin: '0 auto 14px' }} />
                        <p style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Searching for printer…</p>
                        <p style={{ fontSize: 12 }}>Select your printer from the browser popup</p>
                      </>
                    )}

                    {btStatus === 'connected' && (
                      <>
                        <div style={{ width: 56, height: 56, borderRadius: 28, background: '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                          <Check size={28} color="#10B981" />
                        </div>
                        <p style={{ fontWeight: 800, fontSize: 15, color: '#10B981', marginBottom: 4 }}>{printerName || 'Printer'}</p>
                        <p style={{ fontSize: 12, marginBottom: 18 }}>Printer is ready to print receipts</p>

                        <div style={{ display: 'flex', gap: 10 }}>
                          <button
                            className="btn btn-ghost"
                            style={{ flex: 1 }}
                            onClick={handleDisconnect}
                          >
                            <BluetoothOff size={15} /> Disconnect
                          </button>
                          <button
                            className="btn btn-primary"
                            style={{ flex: 1 }}
                            onClick={handleTestPrint}
                            disabled={testStatus === 'printing'}
                          >
                            {testStatus === 'printing' ? 'Printing…'
                             : testStatus === 'done'    ? '✓ Printed!'
                             : testStatus === 'error'   ? 'Print Failed'
                             : 'Test Print'}
                          </button>
                        </div>
                      </>
                    )}

                    {btStatus === 'error' && (
                      <>
                        <div style={{ width: 56, height: 56, borderRadius: 28, background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                          <AlertCircle size={28} color="#EF4444" />
                        </div>
                        <p style={{ fontWeight: 700, fontSize: 14, color: '#EF4444', marginBottom: 6 }}>Connection Failed</p>
                        <p style={{ fontSize: 11, marginBottom: 18, lineHeight: 1.5 }}>{btError}</p>
                        <button className="btn btn-primary" style={{ width: 'auto', padding: '0 28px' }} onClick={handleConnect}>
                          Retry
                        </button>
                      </>
                    )}
                  </div>

                  {/* Info */}
                  <div className="pf-info-box">
                    <Cpu size={16} className="pf-info-icon" />
                    <div>
                      <p className="pf-info-title">Compatibility</p>
                      <p style={{ fontSize: 11, lineHeight: 1.5 }}>
                        Works with ESC/POS BLE printers: Xprinter, GOOJPRT, Epoch, and most 58mm / 80mm Bluetooth thermal printers. Requires Chrome or Edge browser.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="modal-foot" style={{ gridTemplateColumns: '1fr' }}>
                  <button className="btn btn-ghost" onClick={closePrinter}>Close</button>
                </div>
              </motion.div>
            </motion.div>
          </ModalPortal>
        )}
      </AnimatePresence>

    </AppLayout>
  );
};

export default Profile;
