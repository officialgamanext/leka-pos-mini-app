import React from 'react';
import AppLayout from '../components/AppLayout';
import { Phone, MessageSquare, Globe, Mail, ChevronRight, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Help = () => {
  const contactMethods = [
    { icon: <Phone size={20} />, label: 'Call Support', val: '+91 98765 43210', color: '#10B981' },
    { icon: <MessageSquare size={20} />, label: 'WhatsApp Support', val: 'Chat with us', color: '#25D366' },
    { icon: <Mail size={20} />, label: 'Email Support', val: 'support@lekapos.com', color: '#EF4444' },
    { icon: <Globe size={20} />, label: 'Visit Website', val: 'www.lekapos.com', color: '#3379A7' },
  ];

  return (
    <AppLayout title="Customer Care" backPath="/profile">
      <div className="animate-fade-in">
        <div style={{ textAlign: 'center', padding: '32px 20px' }}>
          <div style={{ width: '64px', height: '64px', background: 'var(--primary-light)', borderRadius: 'var(--radius-xl)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', margin: '0 auto 20px' }}>
            <HelpCircle size={32} />
          </div>
          <h2 style={{ fontSize: '20px', marginBottom: '8px' }}>How can we help?</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Our team is available Mon-Sat (9am - 6pm)</p>
        </div>

        <div style={{ display: 'grid', gap: '12px' }}>
          {contactMethods.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="card"
              style={{ padding: '16px', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '16px' }}
            >
              <div style={{ color: m.color }}>{m.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: '700' }}>{m.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{m.val}</div>
              </div>
              <ChevronRight size={16} color="var(--border)" />
            </motion.div>
          ))}
        </div>

        <div className="card" style={{ marginTop: '32px', background: 'var(--primary-light)', border: 'none', padding: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '13px', color: 'var(--primary)', fontWeight: '600' }}>
            Version 1.0.0 (Mini POS)
          </p>
        </div>
      </div>
    </AppLayout>
  );
};

export default Help;
