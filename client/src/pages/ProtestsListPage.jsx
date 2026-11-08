import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { protestService } from '../services/protestService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Vote,
  Search,
  Building,
  CheckCircle2,
  ThumbsUp,
  PlusCircle,
  Filter,
  ShieldCheck
} from 'lucide-react';

const ProtestsListPage = () => {
  const { isVerified, isAuthenticated } = useAuth();

  const [protests, setProtests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [authority, setAuthority] = useState('');
  const [sort, setSort] = useState('most-voted');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const fetchProtests = async () => {
    setLoading(true);
    try {
      const data = await protestService.getPublishedProtests({
        q: search || undefined,
        authority: authority || undefined,
        sort
      });
      setProtests(data.protests || []);
      setTotal(data.total || 0);
    } catch (err) {
      setError('Failed to load published protests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProtests();
  }, [sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProtests();
  };

  const handleQuickVote = async (protestId) => {
    if (!isAuthenticated) {
      setError('Please sign in to cast your civic vote.');
      return;
    }
    if (!isVerified) {
      setError('You must complete email and Aadhaar verification before voting.');
      return;
    }

    try {
      const res = await protestService.castVote(protestId);
      setMessage(res.message);
      fetchProtests();
    } catch (err) {
      setError(err.response?.data?.message || 'Vote failed');
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 4rem' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem'
        }}
      >
        <div>
          <span
            style={{
              color: 'var(--primary)',
              fontWeight: 700,
              fontSize: '0.82rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Decentralized Citizen Voices
          </span>
          <h1 style={{ fontSize: '2.25rem', marginTop: '0.2rem' }}>Civic Protests & Petitions</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Published citizen demands demanding institutional accountability.
          </p>
        </div>

        <Link to="/protests/create" className="btn btn-primary">
          <PlusCircle size={18} />
          Submit a Protest
        </Link>
      </div>

      {message && <AlertMessage type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* Filter and Search Bar */}
      <div className="filter-bar" style={{ marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} className="filter-search-row">
          <div className="search-input-wrapper">
            <Search size={18} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by protest issue, keywords, demands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <input
            type="text"
            className="form-input"
            style={{ maxWidth: '240px' }}
            placeholder="Authority filter..."
            value={authority}
            onChange={(e) => setAuthority(e.target.value)}
          />

          <button type="submit" className="btn btn-primary" style={{ padding: '0.65rem 1.2rem' }}>
            Filter
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Showing <strong>{protests.length}</strong> published protest(s)
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
            <label htmlFor="sortProtestSelect" style={{ fontWeight: 600 }}>Sort:</label>
            <select
              id="sortProtestSelect"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                padding: '0.35rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff'
              }}
            >
              <option value="most-voted">Most Voted First</option>
              <option value="latest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Protests Grid */}
      {loading ? (
        <LoadingSpinner fullScreen text="Loading published protests..." />
      ) : protests.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)'
          }}
        >
          <Vote size={48} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
          <h3>No published protests found</h3>
          <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
            Be the first verified citizen to submit a protest for administrative review.
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

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
                <Link to={`/protests/${protest._id}`} style={{ color: 'inherit' }}>
                  {protest.title}
                </Link>
              </h3>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.85rem' }}>
                <Building size={15} style={{ flexShrink: 0 }} />
                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {protest.concernedAuthority}
                </span>
              </div>

              <p className="card-desc" style={{ flex: 1, marginBottom: '1.25rem' }}>
                {protest.description}
              </p>

              {/* Vote Count & Action */}
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
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)' }}>
                    {protest.voteCount || 0}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginLeft: '4px' }}>
                    Votes
                  </span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => handleQuickVote(protest._id)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                  >
                    <ThumbsUp size={14} />
                    Support
                  </button>
                  <Link
                    to={`/protests/${protest._id}`}
                    className="btn btn-primary"
                    style={{ fontSize: '0.85rem', padding: '0.45rem 0.85rem' }}
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProtestsListPage;

