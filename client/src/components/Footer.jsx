import React from 'react';
import { Link } from 'react-router-dom';
import { Vote, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-about">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                style={{
                  background: 'var(--primary)',
                  color: '#ffffff',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex'
                }}
              >
                <Vote size={18} />
              </div>
              <strong style={{ fontSize: '1.2rem', fontFamily: 'var(--font-heading)' }}>
                PetitionPulse
              </strong>
            </div>
            <p>
              A modern, decentralized petition and civic voting platform empowering
              individuals and communities to champion critical causes, gather signatures,
              and enact positive real-world change.
            </p>
          </div>

          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link to="/petitions">Explore Petitions</Link>
              </li>
              <li>
                <Link to="/create-petition">Start a Campaign</Link>
              </li>
              <li>
                <Link to="/petitions?category=Environment">Environment</Link>
              </li>
              <li>
                <Link to="/petitions?category=Education">Education</Link>
              </li>
              <li>
                <Link to="/petitions?category=Community">Community Welfare</Link>
              </li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
              <li>
                <a href="/api/health" target="_blank" rel="noopener noreferrer">
                  API Status
                </a>
              </li>
              <li>
                <Link to="/login">Sign In</Link>
              </li>
              <li>
                <Link to="/register">Create Account</Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} PetitionPulse. Built with MERN Stack (MongoDB, Express, React, Node.js).
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
