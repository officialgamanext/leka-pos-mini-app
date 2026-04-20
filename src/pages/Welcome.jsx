import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-column animate-fade-in" style={{ height: '100vh', padding: '32px', background: 'linear-gradient(180deg, #FFFFFF 0%, #F1F5F9 100%)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          style={{ 
            width: '80px', 
            height: '80px', 
            background: 'var(--primary)', 
            borderRadius: 'var(--radius-xl)', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(79, 70, 229, 0.2)'
          }}
        >
          <ShoppingBag size={40} color="white" />
        </motion.div>

        <motion.h1 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          style={{ fontSize: '32px', marginBottom: '12px' }}
        >
          Leka <span style={{ color: 'var(--primary)' }}>POS</span> Mini
        </motion.h1>
        
        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: '16px', maxWidth: '280px', margin: '0 auto 40px' }}
        >
          Professional billing and inventory management, right in your pocket.
        </motion.p>

        <div style={{ width: '100%', gap: '16px', display: 'flex', flexDirection: 'column' }}>
          <Feature icon={<Zap size={18} />} title="Lightning Fast Billing" />
          <Feature icon={<ShieldCheck size={18} />} title="Secure & Reliable" />
        </div>
      </div>

      <motion.div 
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{ paddingBottom: 'var(--safe-area-bottom)' }}
      >
        <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ height: '56px', fontSize: '16px' }}>
          Get Started
          <ArrowRight size={20} />
        </button>
      </motion.div>
    </div>
  );
};

const Feature = ({ icon, title }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
    <div style={{ color: 'var(--primary)', display: 'flex' }}>{icon}</div>
    <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-main)' }}>{title}</span>
  </div>
);

export default Welcome;
