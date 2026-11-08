import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { petitionService } from '../services/petitionService';
import PetitionCard from '../components/PetitionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  Megaphone,
  Trophy
} from 'lucide-react';

const HomePage = () => {
  const [featuredPetitions, setFeaturedPetitions] = useState([]);
  const [stats, setStats] = useState({
    totalPetitions: 0,
    activePetitions: 0,
    successfulPetitions: 0,
    totalSignatures: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [petitionsData, statsData] = await Promise.all([
          petitionService.getPetitions({ limit: 6, sort: 'popular' }),
          petitionService.getStats()
        ]);
        setFeaturedPetitions(petitionsData.petitions || []);
        if (statsData.stats) {
          setStats(statsData.stats);
        }
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-pill">
            <Sparkles size={16} />
            <span>Civic Power in Action</span>
          </div>

          <h1>
            Empower Your Voice. <br />
            <span>Turn Belief into Momentum.</span>
          </h1>

          <p>
            Start a movement, rally your community, and collect verified signatures to
            drive actionable civic, environmental, and educational policy changes.
          </p>

          <div className="hero-actions">
            <Link to="/create-petition" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
              <Megaphone size={18} />
              Start a Petition
            </Link>
            <Link to="/petitions" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem' }}>
              Browse Petitions
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats">
            <div className="stat-item">
              <h3>{stats.totalPetitions || '4+'}</h3>
              <p>Active Campaigns</p>
            </div>
            <div className="stat-item">
              <h3>{stats.totalSignatures || '20+'}</h3>
              <p>Signatures Delivered</p>
            </div>
            <div className="stat-item">
              <h3 style={{ color: 'var(--success)' }}>
                {stats.successfulPetitions || '1+'}
              </h3>
              <p>Goals Accomplished</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Petitions */}
      <section style={{ padding: '4rem 0' }}>
        <div className="container">
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: '2.5rem'
            }}
          >
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--primary)',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  marginBottom: '0.25rem'
                }}
              >
                <TrendingUp size={18} />
                <span>Trending Movements</span>
              </div>
              <h2 style={{ fontSize: '2rem' }}>Petitions Needing Your Voice</h2>
            </div>

            <Link
              to="/petitions"
              className="btn btn-outline"
              style={{ padding: '0.55rem 1.1rem' }}
            >
              View All Petitions
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading trending petitions..." />
          ) : featuredPetitions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '3rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                No active petitions yet. Be the first to start one!
              </p>
              <Link to="/create-petition" className="btn btn-primary">
                Launch Petition
              </Link>
            </div>
          ) : (
            <div className="petitions-grid">
              {featuredPetitions.map((petition) => (
                <PetitionCard key={petition._id} petition={petition} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="how-it-works"
        style={{
          backgroundColor: '#ffffff',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '5rem 0'
        }}
      >
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '650px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                color: 'var(--primary)',
                fontWeight: 700,
                fontSize: '0.85rem',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}
            >
              Simple Process
            </span>
            <h2 style={{ fontSize: '2.25rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
              How PetitionPulse Works
            </h2>
            <p style={{ color: 'var(--text-muted)' }}>
              From a single idea to city hall decisions, here is how you can mobilize community support in three easy steps.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem'
            }}
          >
            <div
              style={{
                padding: '2rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  marginBottom: '1.25rem'
                }}
              >
                1
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Create Your Petition</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                State your goal clearly, tell your story, choose an issue category, and set a signature milestone.
              </p>
            </div>

            <div
              style={{
                padding: '2rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  marginBottom: '1.25rem'
                }}
              >
                2
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Mobilize Supporters</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Share your petition link across social media, local groups, and email. Supporters sign and share in seconds.
              </p>
            </div>

            <div
              style={{
                padding: '2rem',
                background: 'var(--bg-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  background: 'var(--success)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  marginBottom: '1.25rem'
                }}
              >
                3
              </div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem' }}>Deliver & Enact Change</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                Reach your target goal, present the verified petition to decision-makers, and celebrate campaign victory!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div
            style={{
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 100%)',
              color: '#ffffff',
              borderRadius: 'var(--radius-lg)',
              padding: '3.5rem 2rem',
              textAlign: 'center',
              boxShadow: 'var(--shadow-xl)'
            }}
          >
            <h2 style={{ color: '#ffffff', fontSize: '2.4rem', marginBottom: '1rem' }}>
              Have an issue you care about?
            </h2>
            <p
              style={{
                color: '#bfdbfe',
                fontSize: '1.15rem',
                maxWidth: '600px',
                margin: '0 auto 2rem'
              }}
            >
              It takes less than 2 minutes to launch your petition and start gathering signatures.
            </p>
            <Link
              to="/create-petition"
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--primary-dark)',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Start Free Petition Now
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
