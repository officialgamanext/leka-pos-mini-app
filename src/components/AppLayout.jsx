import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, User, Bell, Search, ChevronLeft, BarChart3 } from 'lucide-react';
import { useBusiness } from '../App';
import PWAInstall from './PWAInstall';
import '../styles/AppLayout.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Home',     path: '/dashboard' },
  { icon: Receipt,         label: 'Billing',  path: '/billing'   },
  { icon: History,         label: 'All Bills',path: '/all-bills'  },
  { icon: BarChart3,       label: 'Reports',  path: '/reports'   },
  { icon: User,            label: 'Profile',  path: '/profile'   },
];

const AppLayout = ({ children, backPath }) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { activeBusiness } = useBusiness();

  return (
    <div className="app-layout">
      <PWAInstall />

      {/* ── Header ── */}
      <header className="app-header">
        <div className="header-left">
          {backPath && (
            <button className="back-btn" onClick={() => navigate(backPath)}>
              <ChevronLeft size={18} />
            </button>
          )}
          <div className="logo-box">
            <Receipt size={16} />
          </div>
          <span className="header-biz-name">
            {activeBusiness?.name || 'Leka POS'}
          </span>
        </div>

        <div className="header-right">
          <button className="header-icon-btn"><Bell size={17} /></button>
          <button className="header-icon-btn"><Search size={17} /></button>
        </div>
      </header>

      {/* ── Scrollable Content ── */}
      <main className="main-content">
        <div className="content-wrap">
          {children}
        </div>
      </main>

      {/* ── Bottom Nav ── */}
      <nav className="bottom-nav">
        {navItems.map(({ icon: Icon, label, path }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              className={`nav-item${active ? ' active' : ''}`}
              onClick={() => navigate(path)}
            >
              <span className="nav-icon-pill">
                <Icon size={19} />
              </span>
              <span className="nav-label">{label}</span>
            </button>
          );
        })}
      </nav>

    </div>
  );
};

export default AppLayout;
