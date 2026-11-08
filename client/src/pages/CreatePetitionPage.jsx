import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { petitionService } from '../services/petitionService';
import AlertMessage from '../components/AlertMessage';
import { Megaphone, Info, CheckCircle } from 'lucide-react';

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

const CreatePetitionPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Community',
    targetSignatures: 100,
    imageUrl: '',
    description: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long to explain your campaign.');
      return;
    }
    if (formData.targetSignatures < 5) {
      setError('Target signature goal must be at least 5 signatures.');
      return;
    }

    setLoading(true);
    try {
      const res = await petitionService.createPetition(formData);
      navigate(`/petitions/${res.petition._id}`);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to publish petition. Please check all fields.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.25rem 4rem' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem'
            }}
          >
            <Megaphone size={28} />
          </div>
          <h1 style={{ fontSize: '2.25rem', marginBottom: '0.5rem' }}>
            Launch Your Petition
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Tell your story, rally supporters, and gather verified signatures for change.
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
            {/* Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">
                Petition Headline / Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="What specific change do you want to see happen?"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={180}
              />
              <small style={{ color: 'var(--text-subtle)', display: 'block', marginTop: '0.3rem' }}>
                Keep it clear, urgent, and solution-focused. ({formData.title.length}/180)
              </small>
            </div>

            {/* Category & Target in two columns */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.25rem'
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  className="form-select"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" htmlFor="targetSignatures">
                  Signature Goal *
                </label>
                <input
                  type="number"
                  id="targetSignatures"
                  name="targetSignatures"
                  className="form-input"
                  min="5"
                  max="1000000"
                  step="5"
                  value={formData.targetSignatures}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Image URL */}
            <div className="form-group">
              <label className="form-label" htmlFor="imageUrl">
                Cover Photo URL (Optional)
              </label>
              <input
                type="url"
                id="imageUrl"
                name="imageUrl"
                className="form-input"
                placeholder="https://images.unsplash.com/photo-..."
                value={formData.imageUrl}
                onChange={handleChange}
              />
              <small style={{ color: 'var(--text-subtle)', display: 'block', marginTop: '0.3rem' }}>
                Paste a public image link. If left blank, a high-quality category photo will be used automatically.
              </small>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label" htmlFor="description">
                The Story & Background *
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows={7}
                placeholder="Explain the background problem: Who is affected? What needs to be done? Who has the power to solve it?"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <small style={{ color: 'var(--text-subtle)', display: 'block', marginTop: '0.3rem' }}>
                Minimum 20 characters. Express personal experiences or evidence. ({formData.description.length} chars)
              </small>
            </div>

            {/* Launch CTA */}
            <div style={{ marginTop: '2rem' }}>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
                style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem' }}
              >
                {loading ? 'Publishing Petition...' : 'Publish Petition & Start Collecting Signatures'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreatePetitionPage;
