import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, User, Bell, Search, ChevronLeft } from 'lucide-react';
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
      {/* Premium Header inspired by Ref */}
      <header style={{
        padding: '20px 12px 36px',
        background: 'var(--primary)',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'relative',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {backPath && (
            <button
              onClick={() => navigate(backPath)}
              style={{ background: 'rgba(255,255,255,0.2)', border: 'none', padding: '6px', borderRadius: '10px', color: 'white', display: 'flex' }}
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', background: 'white', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <Receipt size={18} />
            </div>
            <h1 style={{ fontSize: '18px', fontWeight: '800', color: 'white', letterSpacing: '-0.5px' }}>
              {activeBusiness?.name || 'Leka POS'}
            </h1>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Bell size={18} />
            </div>
            <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '16px', height: '16px', background: '#F59E0B', borderRadius: '8px', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '700', color: 'white' }}>
              2
            </div>
          </div>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.15)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <Search size={18} />
          </div>
        </div>
      </header>

      {/* Content area with negative margin to pull cards up */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 12px 100px',
        marginTop: '-20px',
        position: 'relative',
        zIndex: 5
      }}>
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
        left: 0,
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
