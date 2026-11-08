import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { petitionService } from '../services/petitionService';
import authService from '../services/authService';
import ProgressBar from '../components/ProgressBar';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  FileText,
  Heart,
  PlusCircle,
  Edit,
  ExternalLink,
  User,
  CheckCircle,
  Clock,
  Save
} from 'lucide-react';

const DashboardPage = () => {
  const { user, updateUser } = useAuth();

  const [activeTab, setActiveTab] = useState('my-petitions');
  const [createdPetitions, setCreatedPetitions] = useState([]);
  const [signedPetitions, setSignedPetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Profile edit form
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const [myRes, signedRes] = await Promise.all([
          petitionService.getMyPetitions(),
          petitionService.getMySignedPetitions()
        ]);
        setCreatedPetitions(myRes.petitions || []);
        setSignedPetitions(signedRes.petitions || []);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setMessage(null);
    setError(null);

    try {
      const res = await authService.updateProfile({ name, bio });
      updateUser(res.user);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSavingProfile(false);
    }
  };

  const totalSignaturesReceived = createdPetitions.reduce(
    (acc, curr) => acc + (curr.currentSignatures || 0),
    0
  );

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 4rem' }}>
      {/* Header Profile Summary */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border)',
          padding: '2rem',
          marginBottom: '2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--primary) 0%, #1e40af 100%)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.6rem',
              fontWeight: 800
            }}
          >
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h1 style={{ fontSize: '1.6rem', margin: 0 }}>{user?.name}</h1>
              {user?.role === 'admin' && (
                <span
                  style={{
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    fontWeight: 700
                  }}
                >
                  Admin
                </span>
              )}
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.2rem 0 0' }}>
              {user?.email}
            </p>
          </div>
        </div>

        <Link to="/create-petition" className="btn btn-primary">
          <PlusCircle size={18} />
          Start New Petition
        </Link>
      </div>

      {/* Metrics Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2.5rem'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            Petitions Created
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem' }}>
            {createdPetitions.length}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            Signatures Gathered
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>
            {totalSignaturesReceived}
          </div>
        </div>

        <div
          style={{
            background: '#ffffff',
            border: '1px solid var(--border)',
            padding: '1.25rem 1.5rem',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
            Petitions Signed
          </div>
          <div style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
            {signedPetitions.length}
          </div>
        </div>
      </div>

      {message && <AlertMessage type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* Tab Controls */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '2px solid var(--border)',
          marginBottom: '2rem'
        }}
      >
        <button
          onClick={() => setActiveTab('my-petitions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'my-petitions' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'my-petitions' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <FileText size={18} />
          My Petitions ({createdPetitions.length})
        </button>

        <button
          onClick={() => setActiveTab('signed-petitions')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'signed-petitions' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'signed-petitions' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <Heart size={18} />
          Petitions Signed ({signedPetitions.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
            marginBottom: '-2px',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <User size={18} />
          Edit Profile
        </button>
      </div>

      {/* Tab Contents */}
      {loading ? (
        <LoadingSpinner text="Loading dashboard petitions..." />
      ) : activeTab === 'my-petitions' ? (
        <div>
          {createdPetitions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <FileText size={44} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
              <h3>You haven't launched any petitions yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Start a movement today for a cause you care about.
              </p>
              <Link to="/create-petition" className="btn btn-primary">
                Create First Petition
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {createdPetitions.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span
                        style={{
                          backgroundColor: 'var(--bg-subtle)',
                          padding: '0.2rem 0.6rem',
                          borderRadius: 'var(--radius-full)',
                          fontSize: '0.75rem',
                          fontWeight: 600
                        }}
                      >
                        {p.category}
                      </span>
                      <span className={`badge badge-${p.status}`}>
                        {p.status === 'successful' && <CheckCircle size={12} />}
                        {p.status === 'active' && <Clock size={12} />}
                        {p.status}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      <Link to={`/petitions/${p._id}`} style={{ color: 'inherit' }}>
                        {p.title}
                      </Link>
                    </h3>

                    <ProgressBar
                      current={p.currentSignatures}
                      target={p.targetSignatures}
                      showLabels={true}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '0.6rem' }}>
                    <Link
                      to={`/petitions/${p._id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                    >
                      <ExternalLink size={15} />
                      View
                    </Link>
                    <Link
                      to={`/edit-petition/${p._id}`}
                      className="btn btn-primary"
                      style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                    >
                      <Edit size={15} />
                      Edit
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'signed-petitions' ? (
        <div>
          {signedPetitions.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                background: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)'
              }}
            >
              <Heart size={44} style={{ color: 'var(--text-subtle)', marginBottom: '1rem' }} />
              <h3>You haven't signed any petitions yet</h3>
              <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 1.5rem' }}>
                Browse existing campaigns to find issues you support.
              </p>
              <Link to="/petitions" className="btn btn-primary">
                Explore Petitions
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {signedPetitions.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem'
                  }}
                >
                  <div style={{ flex: 1, minWidth: '280px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
                      <span className={`badge badge-${p.status}`}>{p.status}</span>
                      <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Started by {p.creator?.name || 'Community Member'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                      <Link to={`/petitions/${p._id}`} style={{ color: 'inherit' }}>
                        {p.title}
                      </Link>
                    </h3>

                    <ProgressBar
                      current={p.currentSignatures}
                      target={p.targetSignatures}
                      showLabels={true}
                    />
                  </div>

                  <Link
                    to={`/petitions/${p._id}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.5rem 0.85rem' }}
                  >
                    <ExternalLink size={15} />
                    View Campaign
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Profile Edit Tab */
        <div
          style={{
            maxWidth: '600px',
            background: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '2rem'
          }}
        >
          <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Account Profile</h2>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Display Name</label>
              <input
                type="text"
                id="name"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                className="form-input"
                value={user?.email || ''}
                disabled
                style={{ backgroundColor: 'var(--bg-subtle)', cursor: 'not-allowed' }}
              />
              <small style={{ color: 'var(--text-subtle)' }}>Email cannot be changed.</small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="bio">Bio / Statement</label>
              <textarea
                id="bio"
                className="form-textarea"
                rows={3}
                placeholder="Tell others what causes you stand for..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                maxLength={300}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={savingProfile}
              style={{ marginTop: '0.5rem' }}
            >
              <Save size={16} />
              {savingProfile ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
