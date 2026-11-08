import React, { useState } from 'react';
import { X, Send, HeartHandshake } from 'lucide-react';
import AlertMessage from './AlertMessage';

const SignModal = ({ isOpen, onClose, onSign, petitionTitle }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await onSign(comment);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record your signature. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
          aria-label="Close"
        >
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
          <div
            style={{
              background: 'var(--primary-light)',
              color: 'var(--primary)',
              padding: '10px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HeartHandshake size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem' }}>Sign This Petition</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Add your voice to make a real difference
            </p>
          </div>
        </div>

        <p
          style={{
            fontSize: '0.92rem',
            background: 'var(--bg-subtle)',
            padding: '0.75rem 1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            fontWeight: 500
          }}
        >
          "{petitionTitle}"
        </p>

        {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="signatureComment">
              Why are you signing? (Optional note)
            </label>
            <textarea
              id="signatureComment"
              className="form-textarea"
              placeholder="I'm signing because this issue directly impacts our neighborhood and future generations..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <small style={{ color: 'var(--text-subtle)', display: 'block', textAlign: 'right' }}>
              {comment.length}/500
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              <Send size={16} />
              {isSubmitting ? 'Signing...' : 'Sign Petition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignModal;
