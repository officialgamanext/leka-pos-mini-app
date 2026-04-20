import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, Package, Settings, LogOut } from 'lucide-react';
import { useBusiness } from '../App';

const AppLayout = ({ children, title }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBusiness, logoutBusiness } = useBusiness();

  const navItems = [
    { icon: <LayoutDashboard size={22} />, label: 'Home', path: '/dashboard' },
    { icon: <Receipt size={22} />, label: 'Billing', path: '/billing' },
    { icon: <Package size={22} />, label: 'Products', path: '/products' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--background)' }}>
      {/* Header */}
      <header style={{ 
        padding: '16px 20px', 
        background: 'white', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div>
          <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--primary)', letterSpacing: '0.05em', display: 'block' }}>
            {activeBusiness?.name?.toUpperCase()}
          </span>
          <h1 style={{ fontSize: '18px' }}>{title}</h1>
        </div>
        <button 
          onClick={() => {
            logoutBusiness();
            navigate('/onboarding');
          }}
          style={{ background: 'var(--surface-hover)', border: 'none', padding: '8px', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }}
        >
          <LogOut size={18} />
        </button>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
        {children}
      </main>

      {/* Bottom Nav */}
      <nav style={{ 
        background: 'white', 
        borderTop: '1px solid var(--border)', 
        display: 'flex', 
        paddingBottom: 'var(--safe-area-bottom)',
        height: 'calc(64px + var(--safe-area-bottom))'
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
                gap: '4px',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                transition: 'color 0.2s ease'
              }}
            >
              <div style={{ padding: '4px 16px', borderRadius: '16px', background: isActive ? 'var(--primary-light)' : 'transparent', transition: 'background 0.2s ease', display: 'flex' }}>
                {item.icon}
              </div>
              <span style={{ fontSize: '10px', fontWeight: isActive ? '600' : '500' }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
