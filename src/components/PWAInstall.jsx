import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Update UI notify the user they can install the PWA
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsVisible(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the PWA install');
    } else {
      console.log('User dismissed the PWA install');
    }
    
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -50, opacity: 0 }}
        className="pwa-install-banner"
        style={{
          position: 'fixed',
          top: '70px',
          left: '16px',
          right: '16px',
          background: 'var(--surface)',
          padding: '12px 16px',
          borderRadius: 'var(--r-md)',
          boxShadow: 'var(--shadow-lg)',
          border: '1.5px solid var(--primary-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 9998,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 36, height: 36, borderRadius: 10, 
            background: 'var(--primary-light)', color: 'var(--primary)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Download size={20} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>Install Leka POS</p>
            <p style={{ fontSize: 11, color: 'var(--text-sub)' }}>Access it faster from your home screen</p>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => setIsVisible(false)}
            style={{ 
              background: 'transparent', border: 'none', color: 'var(--text-sub)',
              padding: 4
            }}
          >
            <X size={18} />
          </button>
          <button 
            onClick={handleInstallClick}
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              padding: '6px 14px',
              borderRadius: '8px',
              fontSize: 12,
              fontWeight: 700
            }}
          >
            Install
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default PWAInstall;
