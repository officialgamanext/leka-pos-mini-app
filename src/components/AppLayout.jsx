import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Receipt, History, User, RotateCw, 
  ChevronLeft, BarChart3, CloudSync, ReceiptText, 
  ShoppingBag, Users, TrendingDown 
} from 'lucide-react';
import { useBusiness } from '../App';
import PWAInstall from './PWAInstall';
import { useSync } from '../context/SyncContext';
import '../styles/AppLayout.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: ReceiptText, label: 'Billing', path: '/billing' },
  { icon: History, label: 'All Bills', path: '/all-bills' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const sidebarNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', hideForStaff: true },
  { icon: ReceiptText, label: 'POS Billing', path: '/billing' },
  { icon: History, label: 'All Bills', path: '/all-bills' },
  { icon: BarChart3, label: 'Reports', path: '/reports', hideForStaff: true },
  { icon: ShoppingBag, label: 'Products & Inventory', path: '/products' },
  { icon: TrendingDown, label: 'Expenses', path: '/expenses' },
  { icon: Users, label: 'Staff Management', path: '/staff', hideForStaff: true },
  { icon: User, label: 'Store & Profile', path: '/profile' },
];

const getPageTitle = (pathname) => {
  if (pathname.startsWith('/products')) return 'Catalog & Inventory';
  switch (pathname) {
    case '/dashboard': return 'Dashboard Overview';
    case '/billing': return 'Point of Sale (POS)';
    case '/all-bills': return 'Sales History & Bills';
    case '/reports': return 'Analytics & Reports';
    case '/profile': return 'Store Settings & Profile';
    case '/staff': return 'Staff Management';
    case '/expenses': return 'Expense Tracker';
    case '/tax-settings': return 'Tax & GST Settings';
    case '/help': return 'Help Center';
    default: return 'Leka POS';
  }
};

const AppLayout = ({ children, backPath }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeBusiness } = useBusiness();
  const { pendingCount, isSyncing, syncNow } = useSync();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className={`app-layout-container ${isMobile ? 'layout-mobile' : 'layout-desktop'}`}>
      <PWAInstall />

      {/* ── Desktop/Tablet Left Sidebar ── */}
      {!isMobile && (
        <aside className="app-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-logo">
              <ReceiptText size={20} />
            </div>
            <span className="sidebar-title">Leka POS</span>
          </div>

          <div className="sidebar-business-card">
            <div className="biz-avatar">
              {activeBusiness?.name?.substring(0, 2).toUpperCase() || 'LP'}
            </div>
            <div className="biz-info">
              <p className="biz-name">{activeBusiness?.name || 'My Business'}</p>
              {activeBusiness?.statusLabel && (
                <span className={`status-badge ${activeBusiness.statusLabel?.toLowerCase()}`}>
                  {activeBusiness.statusLabel}
                </span>
              )}
            </div>
          </div>

          <nav className="sidebar-nav-list">
            {sidebarNavItems
              .filter(item => {
                if (activeBusiness?.role === 'staff' && item.hideForStaff) {
                  return false;
                }
                return true;
              })
              .map(({ icon: Icon, label, path }) => {
                const active = location.pathname === path || (path === '/products' && location.pathname.startsWith('/products'));
                return (
                  <button
                    key={path}
                    className={`sidebar-nav-item${active ? ' active' : ''}`}
                    onClick={() => navigate(path)}
                  >
                    <Icon size={18} />
                    <span>{label}</span>
                  </button>
                );
              })}
          </nav>

          <div className="sidebar-footer">
            {pendingCount > 0 && (
              <button
                className="sidebar-sync-btn"
                onClick={() => syncNow()}
                disabled={isSyncing}
                title={isSyncing ? "Syncing..." : `Click to sync ${pendingCount} bills`}
              >
                <CloudSync size={16} className={isSyncing ? 'spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : `Sync Pending (${pendingCount})`}</span>
              </button>
            )}
            
            <button
              className="sidebar-footer-btn"
              onClick={() => window.location.reload()}
            >
              <RotateCw size={14} />
              <span>Reload App</span>
            </button>
          </div>
        </aside>
      )}

      {/* ── Main Viewport (Header + Scrollable Main Content) ── */}
      <div className="app-main-viewport">
        
        {/* Header (Serves both mobile and desktop headers) */}
        <header className="app-header">
          <div className="header-left">
            {backPath && (
              <button className="back-btn" onClick={() => navigate(backPath)}>
                <ChevronLeft size={18} />
              </button>
            )}
            {isMobile && (
              <>
                <div className="logo-box">
                  <ReceiptText size={16} />
                </div>
                <span className="header-biz-name">
                  {activeBusiness?.name || 'Leka POS'}
                </span>
                {activeBusiness?.statusLabel && (
                  <span className={`status-badge ${activeBusiness.statusLabel?.toLowerCase()}`}>
                    {activeBusiness.statusLabel}
                  </span>
                )}
              </>
            )}
            {!isMobile && (
              <span className="header-page-title">
                {getPageTitle(location.pathname)}
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

        {/* Scrollable Content Area */}
        <main className="main-content">
          <div className="content-wrap">
            {children}
          </div>
        </main>

        {/* ── Mobile Bottom Nav ── */}
        {isMobile && (
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
        )}
      </div>
    </div>
  );
};

export default AppLayout;

