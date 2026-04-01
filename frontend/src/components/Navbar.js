import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../hooks/useNotifications';

const Navbar = () => {
  const { isAuthenticated, user, logout, clearTokensAndLogout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleClearTokens = () => {
    if (window.confirm('This will clear all tokens and force you to login again. Continue?')) {
      clearTokensAndLogout();
      navigate('/login');
    }
  };

  const navLinkStyle = {
    color: '#374151',
    textDecoration: 'none',
    fontWeight: '500',
    fontSize: '15px',
    transition: 'color 0.2s'
  };

  const handleMouseOver = (e) => {
    e.target.style.color = '#F97316';
  };

  const handleMouseOut = (e) => {
    e.target.style.color = '#374151';
  };

  const mobileLinkStyle = {
    ...navLinkStyle,
    display: 'block',
    padding: '12px 16px',
    borderBottom: '1px solid #f3f4f6'
  };

  return (
    <nav style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '12px 40px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
    }}>
      {/* LEFT — Logo */}
      <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/foodsaver-logo.png"
          alt="FoodSaver Logo"
          style={{ height: '40px', width: 'auto' }}
        />
      </Link>

      {/* CENTER — Navigation Links (Desktop) */}
      <div className="desktop-nav" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '32px'
      }}>
        <Link
          to="/"
          style={navLinkStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Home
        </Link>
        <a
          href="#about"
          style={navLinkStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          About
        </a>
        <a
          href="#services"
          style={navLinkStyle}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
        >
          Services
        </a>
      </div>

      {/* RIGHT — Auth & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {!isAuthenticated ? (
          <>
            <Link to="/login">
              <button style={{
                border: '1px solid #F97316',
                backgroundColor: 'white',
                color: '#F97316',
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Login
              </button>
            </Link>
            <Link to="/register" className="register-btn-desktop">
              <button style={{
                backgroundColor: '#F97316',
                color: 'white',
                border: 'none',
                padding: '8px 20px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                Register
              </button>
            </Link>
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', position: 'relative' }}
                onClick={() => setShowNotificationDropdown(!showNotificationDropdown)}
              >
                🔔
                {unreadCount > 0 && (
                  <span style={{ position: 'absolute', top: '-5px', right: '-5px', backgroundColor: 'red', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotificationDropdown && (
                <div style={{ position: 'absolute', top: '100%', right: '0', backgroundColor: 'white', border: '1px solid #ddd', borderRadius: '5px', width: '300px', maxHeight: '400px', overflowY: 'auto', zIndex: 1000, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                  <div style={{ padding: '10px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold', color: '#333' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: '12px', background: 'none', border: 'none', color: '#007bff', cursor: 'pointer' }}>Mark all read</button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '15px', textAlign: 'center', color: '#777' }}>No notifications</div>
                  ) : (
                    notifications.map(notif => (
                      <div
                        key={notif._id}
                        style={{ padding: '15px', borderBottom: '1px solid #eee', borderLeft: notif.isRead ? '4px solid transparent' : '4px solid orange', backgroundColor: notif.isRead ? 'transparent' : '#fffaf0', cursor: 'pointer' }}
                        onClick={() => {
                          if (!notif.isRead) markRead(notif._id);
                          setShowNotificationDropdown(false);
                          if (user?.role === 'Provider') navigate('/provider');
                          else navigate('/recipient');
                        }}
                      >
                        <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>{notif.message}</p>
                        <small style={{ color: '#999', fontSize: '11px' }}>{new Date(notif.createdAt).toLocaleString()}</small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* User Profile Info (Desktop Only) */}
            <div className="desktop-user-info" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {user?.profilePhoto && (
                <img
                  src={user.profilePhoto}
                  alt="Profile"
                  style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #ff6b35' }}
                />
              )}
              <span style={{ color: '#666', fontSize: '14px' }}>
                {user?.name || 'User'}
              </span>
            </div>

            {/* Dashboard Link */}
            <button
              style={{
                backgroundColor: '#F97316',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={() => {
                const role = localStorage.getItem('foodsaver_role')
                  || user?.role;

                console.log('Dashboard click - role:', role);

                if (role === 'admin' || role === 'Admin') {
                  window.location.href = '/admin';
                } else if (role === 'provider' || role === 'Provider') {
                  window.location.href = '/provider';
                } else if (role === 'recipient' || role === 'Recipient') {
                  window.location.href = '/recipient';
                } else {
                  window.location.href = '/';
                }
              }}
            >
              Dashboard
            </button>

            {/* Logout (Desktop Only) */}
            <button
              className="desktop-logout"
              style={{
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                padding: '8px 16px',
                borderRadius: '8px',
                fontWeight: '500',
                cursor: 'pointer'
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        )}

        {/* Mobile Hamburger Menu */}
        <button
          className="mobile-menu-btn"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '4px'
          }}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      {isMobileMenuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 998
        }}>
          <Link to="/" style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
          <a href="#about" style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>About</a>
          <a href="#services" style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>Services</a>

          {isAuthenticated && (
            <>
              <Link to="/leaderboard" style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>Leaderboard</Link>
              <Link to="/profile" style={mobileLinkStyle} onClick={() => setIsMobileMenuOpen(false)}>Profile</Link>
              <button
                style={{ ...mobileLinkStyle, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      )}

      {/* Style overrides for responsiveness */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav, .desktop-user-info, .desktop-logout, .register-btn-desktop {
            display: none !important;
          }
          .mobile-menu-btn {
            display: block !important;
          }
          nav {
            padding: 12px 20px !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
