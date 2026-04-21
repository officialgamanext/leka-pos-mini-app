import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, User, RotateCw, ChevronLeft, BarChart3, CloudSync } from 'lucide-react';
import { useBusiness } from '../App';
import PWAInstall from './PWAInstall';
import { useSync } from '../context/SyncContext';
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
  const { pendingCount, isSyncing, syncNow } = useSync();

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
          {activeBusiness?.statusLabel && (
            <span className={`status-badge ${activeBusiness.statusLabel?.toLowerCase()}`}>
              {activeBusiness.statusLabel}
            </span>
          )}
        </div>

        <div className="header-right">
          {pendingCount > 0 && (
            <button 
              className="header-sync-box" 
              onClick={() => syncNow()}
              disabled={isSyncing}
              title={isSyncing ? "Syncing..." : `Click to sync ${pendingCount} bills`}
            >
               <CloudSync size={16} color="white" className={isSyncing ? 'spin' : ''} />
               <span className="sync-badge">{pendingCount}</span>
            </button>
          )}
          <button 
            className="header-icon-btn reload-btn" 
            onClick={() => window.location.reload()}
            title="Reload App"
          >
            <RotateCw size={17} />
          </button>
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
        {navItems
          .filter(item => {
            if (activeBusiness?.role === 'staff') {
              return item.path !== '/dashboard' && item.path !== '/reports';
            }
            return true;
          })
          .map(({ icon: Icon, label, path }) => {
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
