import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Receipt, ArrowRight, Zap, ShieldCheck, Wifi, Download } from 'lucide-react';
import '../styles/Welcome.css';

const features = [
  { icon: <Zap size={17} />,        title: 'Lightning Fast Billing',  sub: 'Create bills in seconds'        },
  { icon: <ShieldCheck size={17} />, title: 'Secure & Reliable',       sub: 'Your data, always safe'          },
  { icon: <Wifi size={17} />,        title: 'Works Offline',            sub: 'No internet? No problem'         },
];

const Welcome = () => {
  const navigate = useNavigate();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall,    setShowInstall]    = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstall(false);
    setDeferredPrompt(null);
  };

  return (
    <div className="wl-page">

      {/* Blue gradient strip */}
      <div className="wl-top-strip">
        <div className="wl-circle-1" />
        <div className="wl-circle-2" />
      </div>

      {/* Centred hero — sits on top of split bg */}
      <div className="wl-hero">

        {/* Logo box */}
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 14, delay: 0.05 }}
          className="wl-logo-box"
        >
          <Receipt size={44} className="wl-logo-icon" />
        </motion.div>

        {/* Title & subtitle — on the blue strip */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="wl-headline"
        >
          Leka POS Mini
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="wl-sub"
        >
          Professional billing & inventory for your business
        </motion.p>

        {/* Feature cards — on the light bg */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.32 }}
          className="wl-features"
        >
          {features.map(f => (
            <div key={f.title} className="wl-feature-card">
              <div className="wl-feature-icon">{f.icon}</div>
              <div>
                <p className="wl-feature-title">{f.title}</p>
                <p className="wl-feature-sub">{f.sub}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom CTA */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.45 }}
        className="wl-footer"
      >
        <button className="wl-cta-btn" onClick={() => navigate('/login')}>
          Get Started <ArrowRight size={19} />
        </button>

        {showInstall && (
          <button className="wl-install-btn" onClick={handleInstall}>
            <Download size={16} /> Install App on This Device
          </button>
        )}

        <p className="wl-terms">
          By continuing you agree to our{' '}
          <span className="wl-link">Terms</span> &amp; <span className="wl-link">Privacy Policy</span>
        </p>
      </motion.div>

    </div>
  );
};

export default Welcome;
