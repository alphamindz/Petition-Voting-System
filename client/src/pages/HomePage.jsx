import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Link } from 'react-router-dom';
import { protestService } from '../services/protestService';
import { petitionService } from '../services/petitionService';
import LoadingSpinner from '../components/LoadingSpinner';
import PetitionPreview from '../components/PetitionPreview';
import useCanHandle3D from '../components/three/useCanHandle3D';
import HowItWorksSection from '../components/three/HowItWorksSection';
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Users,
  ShieldCheck,
  Megaphone,
  Building,
  Vote,
  ThumbsUp
} from 'lucide-react';

// Lazy load 3D Canvas bundle so initial paint is instant
const Scene3D = lazy(() => import('../components/three/Scene3D'));
const HeroScene = lazy(() => import('../components/three/HeroScene'));

const HomePage = () => {
  const canHandle3D = useCanHandle3D();

  const [protests, setProtests] = useState([]);
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
        const [protestsData, statsData] = await Promise.all([
          protestService.getPublishedProtests({ limit: 6, sort: 'most-voted' }),
          petitionService.getStats()
        ]);
        setProtests(protestsData.protests || []);
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
      <section
        className="hero"
        style={{
          padding: '4rem 0 3.5rem',
          background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)',
          textAlign: 'left'
        }}
      >
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '3rem',
              alignItems: 'center'
            }}
          >
            {/* Left Column: Semantic HTML Copy & CTAs */}
            <div>
              <div className="hero-pill" style={{ display: 'inline-flex', marginBottom: '1.25rem' }}>
                <Sparkles size={16} />
                <span>Civic Power in Action</span>
              </div>

              <h1 style={{ fontSize: '3rem', margin: '0 0 1.25rem', lineHeight: 1.2 }}>
                Empower Your Voice. <br />
                <span>Turn Belief into Momentum.</span>
              </h1>

              <p style={{ fontSize: '1.15rem', color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '520px' }}>
                Start a movement, rally your community, and collect verified votes to
                drive actionable civic, environmental, and educational policy changes.
              </p>

              {/* Proof line */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.88rem',
                  color: 'var(--secondary)',
                  fontWeight: 600,
                  marginBottom: '2rem'
                }}
              >
                <ShieldCheck size={18} color="var(--success)" />
                <span>100% Verified Voters &bull; 1-Citizen-1-Vote &bull; Simulated Aadhaar eKYC</span>
              </div>

              <div className="hero-actions" style={{ justifyContent: 'flex-start', margin: 0 }}>
                <Link to="/protests/create" className="btn btn-primary" style={{ padding: '0.85rem 1.8rem' }}>
                  <Megaphone size={18} />
                  Submit a Protest
                </Link>
                <Link to="/protests" className="btn btn-secondary" style={{ padding: '0.85rem 1.8rem' }}>
                  Browse Protests & Votes
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            {/* Right Column: 3D Hero Scene or Static PetitionPreview Fallback */}
            <div style={{ height: '440px', position: 'relative', width: '100%' }}>
              {canHandle3D ? (
                <Suspense fallback={<PetitionPreview />}>
                  <Scene3D camera={{ position: [0, 0, 5.8], fov: 42 }} animating={true}>
                    <HeroScene />
                  </Scene3D>
                </Suspense>
              ) : (
                <PetitionPreview />
              )}
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hero-stats" style={{ marginTop: '3.5rem' }}>
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

      {/* Featured Published Protests */}
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
                <span>Trending Civic Causes</span>
              </div>
              <h2 style={{ fontSize: '2rem' }}>Civic Protests Needing Your Voice</h2>
            </div>

            <Link
              to="/protests"
              className="btn btn-outline"
              style={{ padding: '0.55rem 1.1rem' }}
            >
              View All Protests
              <ArrowRight size={16} />
            </Link>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading published protests..." />
          ) : protests.length === 0 ? (
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
                No published protests yet. Be the first verified citizen to submit one!
              </p>
              <Link to="/protests/create" className="btn btn-primary">
                Submit Protest
              </Link>
            </div>
          ) : (
            <div className="petitions-grid">
              {protests.map((protest) => (
                <div key={protest._id} className="petition-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-successful" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} />
                      Published
                    </span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {new Date(protest.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    <Link to={`/protests/${protest._id}`} style={{ color: 'inherit' }}>
                      {protest.title}
                    </Link>
                  </h3>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                    <Building size={14} />
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {protest.concernedAuthority}
                    </span>
                  </div>

                  <p className="card-desc" style={{ flex: 1, marginBottom: '1.25rem' }}>
                    {protest.description}
                  </p>

                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '1rem',
                      borderTop: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary)' }}>
                        {protest.voteCount || 0}
                      </span>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                        Votes
                      </span>
                    </div>

                    <Link
                      to={`/protests/${protest._id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                    >
                      View & Vote
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3D Sticky "How It Works" Section with Static Fallback */}
      <HowItWorksSection />

      {/* Final Action Banner */}
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
              Verify your identity in seconds and submit your civic protest directly to concerned authorities.
            </p>
            <Link
              to="/register"
              className="btn"
              style={{
                backgroundColor: '#ffffff',
                color: 'var(--primary-dark)',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: 700
              }}
            >
              Join As a Verified Citizen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
