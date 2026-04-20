import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, User, LogOut, ChevronLeft } from 'lucide-react';
import { useBusiness } from '../App';

const AppLayout = ({ children, title, backPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBusiness } = useBusiness();

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Home', path: '/dashboard' },
    { icon: <Receipt size={20} />, label: 'Billing', path: '/billing' },
    { icon: <History size={20} />, label: 'All Bills', path: '/all-bills' },
    { icon: <User size={20} />, label: 'Profile', path: '/profile' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--background)' }}>
      {/* Header */}
      <header style={{ 
        padding: '12px 16px', 
        background: 'white', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        height: '56px'
      }}>
        {backPath ? (
          <button 
            onClick={() => navigate(backPath)}
            style={{ background: 'var(--primary-light)', border: 'none', padding: '6px', borderRadius: 'var(--radius-sm)', color: 'var(--primary)', display: 'flex' }}
          >
            <ChevronLeft size={20} />
          </button>
        ) : null}
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.02em', display: 'block', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
            {activeBusiness?.name?.toUpperCase()}
          </span>
          <h1 style={{ fontSize: '16px', fontWeight: '700' }}>{title}</h1>
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 100px' }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav style={{ 
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid var(--border)', 
        display: 'flex', 
        paddingBottom: 'var(--safe-area-bottom)',
        height: 'calc(60px + var(--safe-area-bottom))',
        position: 'fixed',
        bottom: 0,
        width: '100%',
        maxWidth: '480px', // Match app container limit
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10
      }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                gap: '2px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
            >
              <div style={{ 
                padding: '4px 12px', 
                borderRadius: '20px', 
                background: isActive ? 'var(--primary-light)' : 'transparent', 
                display: 'flex',
                marginBottom: '2px'
              }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '700' : '500' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
