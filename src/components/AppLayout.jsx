import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Receipt, History, User, Bell, Search, ChevronLeft } from 'lucide-react';
import { useBusiness } from '../App';
import '../styles/AppLayout.css';

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
    <div className="app-layout">
      {/* Fixed Header */}
      <header className="app-header">
        <div className="header-left">
          {backPath && (
            <button onClick={() => navigate(backPath)} className="back-btn">
              <ChevronLeft size={20} />
            </button>
          )}
          <div className="header-left">
            <div className="logo-box">
              <Receipt size={18} />
            </div>
            <h1 className="header-title">
              {activeBusiness?.name || 'Leka POS'}
            </h1>
          </div>
        </div>

        <div className="header-right">
          <button className="header-icon-btn">
            <Bell size={20} />
          </button>
          <button className="header-icon-btn">
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="main-content">
        <div className="content-container">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button 
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="nav-icon-wrapper">
                {item.icon}
              </div>
              <span className="nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default AppLayout;
