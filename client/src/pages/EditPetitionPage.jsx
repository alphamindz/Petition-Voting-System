import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { petitionService } from '../services/petitionService';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { Edit3, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Community',
  'Environment',
  'Human Rights',
  'Education',
  'Healthcare',
  'Animal Welfare',
  'Technology',
  'Other'
];

const EditPetitionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Community',
    targetSignatures: 100,
    imageUrl: '',
    description: '',
    status: 'active'
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPetition = async () => {
      try {
        const res = await petitionService.getPetitionById(id);
        const p = res.petition;

        // Security check: only creator or admin can edit
        const isOwner = user && p.creator && (user.id === p.creator._id || user._id === p.creator._id);
        const isAdmin = user && user.role === 'admin';

        if (!isOwner && !isAdmin) {
          navigate(`/petitions/${id}`);
          return;
        }

        setFormData({
          title: p.title || '',
          category: p.category || 'Community',
          targetSignatures: p.targetSignatures || 100,
          imageUrl: p.imageUrl || '',
          description: p.description || '',
          status: p.status || 'active'
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch petition for editing.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchPetition();
  }, [id, user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'targetSignatures' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await petitionService.updatePetition(id, formData);
      navigate(`/petitions/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update petition.');
    } finally {
      setSubmitting(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner fullScreen text="Loading petition..." />;
  }

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <button
          onClick={() => navigate(`/petitions/${id}`)}
          className="btn btn-secondary"
          style={{ marginBottom: '1.5rem', padding: '0.45rem 0.85rem', fontSize: '0.85rem' }}
        >
          <ArrowLeft size={16} />
          Back to Petition
        </button>

        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}
          >
            <Edit3 size={26} />
          </div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.35rem' }}>Edit Petition</h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Update your campaign statement, goal, or status.
          </p>
        </div>

        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

        <div
          style={{
            background: '#ffffff',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Petition Headline</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="category">Category</label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="targetSignatures">Signature Goal</label>
                <input
                  type="number"
                  id="targetSignatures"
                  name="targetSignatures"
                  className="form-input"
                  min="5"
                  value={formData.targetSignatures}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  className="form-select"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="active">Active</option>
                  <option value="successful">Successful / Won</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="imageUrl">Cover Photo URL</label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                className="form-input"
                value={formData.imageUrl}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Story & Details</label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows={7}
                value={formData.description}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={() => navigate(`/petitions/${id}`)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ flex: 1 }}
                disabled={submitting}
              >
                {submitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditPetitionPage;
