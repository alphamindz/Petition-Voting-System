import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { protestService } from '../services/protestService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Vote,
  Building,
  Calendar,
  ShieldCheck,
  CheckCircle,
  ThumbsUp,
  XCircle,
  Share2,
  FileText,
  User,
  ArrowLeft
} from 'lucide-react';

const ProtestDetailPage = () => {
  const { id } = useParams();
  const { user, isAuthenticated, isVerified } = useAuth();

  const [protest, setProtest] = useState(null);
  const [voteCount, setVoteCount] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submittingVote, setSubmittingVote] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchProtest = async () => {
    try {
      const data = await protestService.getProtestById(id);
      setProtest(data.protest);
      setVoteCount(data.voteCount);
      setHasVoted(data.hasVoted);
    } catch (err) {
      setError(err.response?.data?.message || 'Protest not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtest();
  }, [id, isAuthenticated]);

  const handleVoteToggle = async () => {
    if (!isAuthenticated) {
      setError('Please sign in to cast your civic vote.');
      return;
    }
    if (!isVerified) {
      setError('Aadhaar and Email verification required to cast votes.');
      return;
    }

    setSubmittingVote(true);
    setError(null);
    setMessage(null);

    try {
      if (hasVoted) {
        const res = await protestService.withdrawVote(id);
        setHasVoted(false);
        setVoteCount(res.voteCount);
        setMessage('Your vote has been withdrawn.');
      } else {
        const res = await protestService.castVote(id);
        setHasVoted(true);
        setVoteCount(res.voteCount);
        setMessage('Your vote in support has been officially recorded!');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Voting action failed.');
    } finally {
      setSubmittingVote(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading protest details..." />;
  }

  if (error && !protest) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <h2>Protest Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>{error}</p>
        <Link to="/protests" className="btn btn-primary">
          Back to Protests
        </Link>
      </div>
    );
  }

  const isAuthor = user && protest.user && (user.id === protest.user._id || user._id === protest.user._id);

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <Link
        to="/protests"
        className="btn btn-secondary"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
      >
        <ArrowLeft size={16} />
        Back to Protests
      </Link>

      {message && <AlertMessage type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      <div className="detail-layout">
        {/* Main Content */}
        <div className="detail-main">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
            <span className={`badge badge-${protest.status}`}>
              {protest.status === 'published' && <CheckCircle size={12} />}
              {protest.status}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Created on {new Date(protest.createdAt).toLocaleDateString()}
            </span>
          </div>

          <h1 style={{ fontSize: '2.25rem', marginBottom: '1rem', lineHeight: 1.3 }}>
            {protest.title}
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'var(--bg-subtle)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              color: 'var(--secondary)'
            }}
          >
            <Building size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, display: 'block' }}>
                Concerned Public Authority
              </span>
              <strong>{protest.concernedAuthority}</strong>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem' }}>Protest Demands & Narrative</h3>
            <div style={{ fontSize: '1.05rem', lineHeight: 1.8, color: '#334155', whiteSpace: 'pre-line' }}>
              {protest.description}
            </div>
          </div>

          {protest.supportingInfo && (
            <div style={{ marginTop: '2.5rem', borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem', color: 'var(--secondary)' }}>
                <FileText size={18} />
                <h3 style={{ fontSize: '1.15rem', margin: 0 }}>Supporting Documentation & Evidence</h3>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6 }}>
                {typeof protest.supportingInfo === 'string'
                  ? protest.supportingInfo
                  : JSON.stringify(protest.supportingInfo, null, 2)}
              </p>
            </div>
          )}

          {/* Citizen Creator Info */}
          <div
            style={{
              marginTop: '3rem',
              borderTop: '1px solid var(--border)',
              paddingTop: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem'
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700
              }}
            >
              {protest.user?.name ? protest.user.name.charAt(0).toUpperCase() : 'C'}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <strong>{protest.user?.name || 'Verified Citizen'}</strong>
                {protest.user?.isAadhaarVerified && (
                  <span
                    style={{
                      background: '#ecfdf5',
                      color: '#065f46',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.72rem',
                      fontWeight: 700,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px'
                    }}
                  >
                    <ShieldCheck size={12} /> Aadhaar Verified
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Citizen Organizer
              </span>
            </div>
          </div>
        </div>

        {/* Voting Action Box */}
        <div>
          <div className="detail-sidebar-box">
            <div style={{ textAlign: 'center', paddingBottom: '1.25rem', borderBottom: '1px solid var(--border)' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
                Civic Support Tally
              </span>
              <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1.1, margin: '0.4rem 0' }}>
                {voteCount}
              </div>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                verified citizen vote(s) recorded
              </span>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              {isAuthor ? (
                <div
                  style={{
                    background: 'var(--bg-subtle)',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontSize: '0.88rem',
                    color: 'var(--text-muted)'
                  }}
                >
                  <User size={18} style={{ display: 'block', margin: '0 auto 6px' }} />
                  You are the creator of this protest. (Authors cannot vote on their own submission).
                </div>
              ) : protest.status !== 'published' ? (
                <div
                  style={{
                    background: '#fffbeb',
                    padding: '0.85rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center',
                    fontSize: '0.88rem',
                    color: '#92400e'
                  }}
                >
                  Voting is inactive because this protest is currently "{protest.status}".
                </div>
              ) : isAuthenticated && isVerified ? (
                <div>
                  <button
                    onClick={handleVoteToggle}
                    disabled={submittingVote}
                    className={`btn ${hasVoted ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                  >
                    {hasVoted ? (
                      <>
                        <CheckCircle size={18} color="var(--success)" />
                        Voted (Click to Withdraw)
                      </>
                    ) : (
                      <>
                        <ThumbsUp size={18} />
                        Cast Vote in Support
                      </>
                    )}
                  </button>
                  {hasVoted && (
                    <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--success)', marginTop: '0.5rem', fontWeight: 600 }}>
                      ✓ Your 1-citizen vote has been sealed.
                    </p>
                  )}
                </div>
              ) : isAuthenticated && !isVerified ? (
                <div
                  style={{
                    background: '#fffbeb',
                    border: '1px solid #fef3c7',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    textAlign: 'center'
                  }}
                >
                  <ShieldCheck size={24} style={{ color: '#92400e', marginBottom: '0.4rem' }} />
                  <p style={{ fontSize: '0.85rem', color: '#92400e', margin: '0 0 0.75rem' }}>
                    Identity verification required to cast civic votes.
                  </p>
                  <Link to="/register" className="btn btn-secondary" style={{ fontSize: '0.82rem', width: '100%' }}>
                    Complete Aadhaar eKYC
                  </Link>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <Link to="/login" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }}>
                    Sign In to Vote
                  </Link>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.6rem' }}>
                    New to Petition Pulse? <Link to="/register" style={{ fontWeight: 600 }}>Join free</Link>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtestDetailPage;

