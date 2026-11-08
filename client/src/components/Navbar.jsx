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
  Menu,
  X,
  Compass
} from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <Link to="/" className="nav-brand" onClick={closeMenu}>
          <div className="nav-brand-icon">
            <Vote size={22} />
          </div>
          <span>PetitionPulse</span>
        </Link>

        {/* Desktop Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <ul className="nav-links" style={{ display: 'flex' }}>
            <li>
              <NavLink to="/petitions" className="nav-link" onClick={closeMenu}>
                <Compass size={17} />
                Explore
              </NavLink>
            </li>
            <li>
              <NavLink to="/create-petition" className="nav-link" onClick={closeMenu}>
                <PlusCircle size={17} />
                Start a Petition
              </NavLink>
            </li>
            {isAuthenticated && (
              <li>
                <NavLink to="/dashboard" className="nav-link" onClick={closeMenu}>
                  <LayoutDashboard size={17} />
                  Dashboard
                </NavLink>
              </li>
            )}
          </ul>

          {/* Auth Controls */}
          <div className="nav-auth">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                <Link
                  to="/dashboard"
                  className="nav-user"
                  title="Go to Dashboard"
                  onClick={closeMenu}
                >
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
                  {user?.role === 'admin' && (
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
                  Join Free
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
