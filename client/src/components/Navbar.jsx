import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Vote,
  PlusCircle,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  Shield,
  ShieldCheck,
  Megaphone,
  CheckCircle,
  Menu,
  X
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, isVerified, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand">
          <div className="nav-brand-icon">
            <Vote size={22} />
          </div>
          <span>PetitionPulse</span>
        </Link>

        {/* Navigation links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <ul className="nav-links">
            <li>
              <NavLink to="/protests" className="nav-link">
                <Megaphone size={17} />
                Protests & Votes
              </NavLink>
            </li>
            <li>
              <NavLink to="/protests/create" className="nav-link">
                <PlusCircle size={17} />
                Submit Protest
              </NavLink>
            </li>

            {/* Admin only link */}
            {isAdmin && (
              <li>
                <NavLink
                  to="/admin"
                  className="nav-link"
                  style={{ color: '#b45309', fontWeight: 700 }}
                >
                  <Shield size={17} />
                  Admin Center
                </NavLink>
              </li>
            )}

            {isAuthenticated && (
              <li>
                <NavLink to="/dashboard" className="nav-link">
                  <LayoutDashboard size={17} />
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* User Auth controls */}
          <div className="nav-auth">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Link to="/dashboard" className="nav-user">
                  <div className="nav-avatar">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span
                    style={{
                      fontSize: '0.88rem',
                      fontWeight: 600,
                      maxWidth: '120px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                  >
                    {user?.name}
                  </span>

                  {isVerified && (
                    <span title="Aadhaar & Email Verified" style={{ color: 'var(--success)' }}>
                      <ShieldCheck size={16} />
                    </span>
                  )}

                  {isAdmin && (
                    <span
                      style={{
                        backgroundColor: '#fef3c7',
                        color: '#92400e',
                        padding: '1px 6px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}
                    >
                      Admin
                    </span>
                  )}
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Link
                  to="/login"
                  className="btn btn-secondary"
                  style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
                >
                  <LogIn size={15} />
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                >
                  <UserPlus size={15} />
                  Citizen Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
