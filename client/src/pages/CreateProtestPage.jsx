import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { protestService } from '../services/protestService';
import { useAuth } from '../context/AuthContext';
import AlertMessage from '../components/AlertMessage';
import { Megaphone, Building, FileText, CheckCircle2 } from 'lucide-react';

const CreateProtestPage = () => {
  const navigate = useNavigate();
  const { isVerified } = useAuth();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    concernedAuthority: '',
    supportingInfo: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isVerified) {
      setError('You must complete both email and Aadhaar verification before publishing protests.');
      return;
    }

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }

    if (formData.description.trim().length < 20) {
      setError('Description must be at least 20 characters long.');
      return;
    }

    setLoading(true);

    try {
      const res = await protestService.createProtest(formData);
      navigate('/dashboard', {
        state: {
          welcomeMessage: 'Your protest has been created and submitted for administrative review! You will be notified upon publication.'
        }
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit protest.');
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
            Submit a Civic Protest / Petition
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>
            Present your civic grievance directly to public authorities and rally citizen votes.
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
              <label className="form-label" htmlFor="title">
                Protest Headline / Demand *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                placeholder="e.g. Mandate Physical Footpath Barriers on Central Avenue"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
              />
              <small style={{ color: 'var(--text-subtle)' }}>
                Keep it concise, clear, and actionable. ({formData.title.length}/200)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="concernedAuthority">
                Concerned Public Authority / Department *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Building size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-subtle)' }} />
                <input
                  type="text"
                  id="concernedAuthority"
                  name="concernedAuthority"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="e.g. Municipal Corporation, Ministry of Road Transport, State Board"
                  value={formData.concernedAuthority}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">
                Narrative & Ground Evidence *
              </label>
              <textarea
                id="description"
                name="description"
                className="form-textarea"
                rows={6}
                placeholder="State the core issue, who is affected, why current measures have failed, and what precise decision the authority must make..."
                value={formData.description}
                onChange={handleChange}
                required
              />
              <small style={{ color: 'var(--text-subtle)' }}>
                Minimum 20 characters. ({formData.description.length} characters)
              </small>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="supportingInfo">
                Supporting Documentation & Citations (Optional)
              </label>
              <textarea
                id="supportingInfo"
                name="supportingInfo"
                className="form-textarea"
                rows={3}
                placeholder="Paste URLs to reports, RTI findings, news articles, or survey summaries..."
                value={formData.supportingInfo}
                onChange={handleChange}
              />
            </div>

            <div
              style={{
                background: '#eff6ff',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
                fontSize: '0.85rem',
                color: '#1e40af'
              }}
            >
              ℹ️ <strong>Workflow Notice:</strong> Submissions are created with status <strong>"pending"</strong>.
              Administrators review for authenticity before publishing for public voting.
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem' }}
            >
              {loading ? 'Submitting Protest...' : 'Submit for Administrative Review'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProtestPage;

