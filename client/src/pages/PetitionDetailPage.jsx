import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { petitionService } from '../services/petitionService';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import SignModal from '../components/SignModal';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Calendar,
  User,
  Share2,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Send,
  MessageSquare,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';

const categoryImages = {
  Environment: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
  Education: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800',
  Community: 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=800',
  'Animal Welfare': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800',
  Healthcare: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800',
  'Human Rights': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800',
  Technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800',
  Other: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
};

const PetitionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [petition, setPetition] = useState(null);
  const [hasSigned, setHasSigned] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Modals & Forms
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [submittingUpdate, setSubmittingUpdate] = useState(false);

  const fetchPetition = async () => {
    try {
      const data = await petitionService.getPetitionById(id);
      setPetition(data.petition);
      setHasSigned(data.hasSigned);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load petition.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPetition();
  }, [id, isAuthenticated]);

  const handleSign = async (comment) => {
    const res = await petitionService.signPetition(id, comment);
    setSuccessMsg('🎉 Your signature has been recorded! Thank you for speaking up.');
    setHasSigned(true);
    fetchPetition();
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this petition? This cannot be undone.')) {
      try {
        await petitionService.deletePetition(id);
        navigate('/petitions');
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete petition.');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await petitionService.updateStatus(id, newStatus);
      setSuccessMsg(`Petition status updated to: ${newStatus}`);
      fetchPetition();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handlePostUpdate = async (e) => {
    e.preventDefault();
    if (!updateTitle || !updateContent) return;
    setSubmittingUpdate(true);
    try {
      await petitionService.addPetitionUpdate(id, {
        title: updateTitle,
        content: updateContent
      });
      setSuccessMsg('Announcement update posted successfully!');
      setUpdateTitle('');
      setUpdateContent('');
      setShowUpdateForm(false);
      fetchPetition();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post update.');
    } finally {
      setSubmittingUpdate(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading petition details..." />;
  }

  if (error || !petition) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <AlertTriangle size={48} style={{ color: 'var(--danger)', marginBottom: '1rem' }} />
        <h2>Petition Not Found</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>
          {error || 'The petition you are looking for does not exist or has been removed.'}
        </p>
        <Link to="/petitions" className="btn btn-primary">
          Back to Petitions
        </Link>
      </div>
    );
  }

  const isCreator = user && petition.creator && user.id === petition.creator._id;
  const isAdmin = user && user.role === 'admin';
  const canManage = isCreator || isAdmin;
  const isGoalMet = petition.currentSignatures >= petition.targetSignatures;

  const displayImage =
    petition.imageUrl ||
    categoryImages[petition.category] ||
    categoryImages.Community;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      {/* Alert Messages */}
      {successMsg && (
        <div style={{ marginTop: '1.5rem' }}>
          <AlertMessage
            type="success"
            message={successMsg}
            onClose={() => setSuccessMsg(null)}
          />
        </div>
      )}
      {error && (
        <div style={{ marginTop: '1.5rem' }}>
          <AlertMessage
            type="error"
            message={error}
            onClose={() => setError(null)}
          />
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="detail-layout">
        {/* Left Column: Full Content */}
        <div className="detail-main">
          <div className="detail-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem' }}>
              <span
                style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary-dark)',
                  padding: '0.25rem 0.75rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.8rem',
                  fontWeight: 700
                }}
              >
                {petition.category}
              </span>
              <span className={`badge badge-${petition.status}`}>
                {petition.status === 'successful' && <CheckCircle size={14} />}
                {petition.status === 'active' && <Clock size={14} />}
                {petition.status}
              </span>
            </div>

            <h1>{petition.title}</h1>

            <div className="detail-meta">
              <div className="detail-meta-user">
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    background: 'var(--primary-light)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700
                  }}
                >
                  {petition.creator?.name ? petition.creator.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>
                  Started by <strong>{petition.creator?.name || 'Community Member'}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={16} />
                <span>{new Date(petition.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
              </div>
            </div>
          </div>

          {/* Petition Image */}
          <div className="detail-image-box">
            <img
              src={displayImage}
              alt={petition.title}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = categoryImages.Community;
              }}
            />
          </div>

          {/* Petition Story */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '0.75rem' }}>The Story & Demands</h2>
            <div className="detail-story">{petition.description}</div>
          </div>

          {/* Campaign Updates Section */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.35rem' }}>
                Updates ({petition.updates ? petition.updates.length : 0})
              </h2>
              {canManage && !showUpdateForm && (
                <button
                  onClick={() => setShowUpdateForm(true)}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.85rem', padding: '0.4rem 0.85rem' }}
                >
                  + Post Update
                </button>
              )}
            </div>

            {/* Form to Post Update */}
            {showUpdateForm && (
              <form
                onSubmit={handlePostUpdate}
                style={{
                  background: 'var(--bg-subtle)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  border: '1px solid var(--border)'
                }}
              >
                <h4 style={{ marginBottom: '0.75rem' }}>Post Campaign Update</h4>
                <div className="form-group">
                  <label className="form-label">Update Headline</label>
                  <input
                    type="text"
                    className="form-input"
                    value={updateTitle}
                    onChange={(e) => setUpdateTitle(e.target.value)}
                    placeholder="e.g. Hearing scheduled with municipal board!"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Update Details</label>
                  <textarea
                    className="form-textarea"
                    value={updateContent}
                    onChange={(e) => setUpdateContent(e.target.value)}
                    placeholder="Describe what occurred, next actions, and thank supporters..."
                    rows={3}
                    required
                  />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setShowUpdateForm(false)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingUpdate}
                    style={{ fontSize: '0.85rem' }}
                  >
                    {submittingUpdate ? 'Publishing...' : 'Publish Update'}
                  </button>
                </div>
              </form>
            )}

            {petition.updates && petition.updates.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {petition.updates.map((update, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '1.25rem',
                      background: 'var(--bg-subtle)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: '4px solid var(--primary)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--secondary)' }}>
                        {update.title}
                      </strong>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {new Date(update.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: 1.6 }}>
                      {update.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem' }}>
                No updates posted yet.
              </p>
            )}
          </div>

          {/* Recent Signatures & Reasons */}
          <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border)', paddingTop: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
              Why People Are Signing ({petition.signatures?.length || 0})
            </h2>

            {petition.signatures && petition.signatures.length > 0 ? (
              <div className="signers-list">
                {petition.signatures.slice(0, 20).map((sig, idx) => (
                  <div key={sig._id || idx} className="signer-item">
                    <div className="signer-item-header">
                      <span>{sig.name}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', fontWeight: 400 }}>
                        {new Date(sig.signedAt).toLocaleDateString()}
                      </span>
                    </div>
                    {sig.comment ? (
                      <p className="signer-comment">"{sig.comment}"</p>
                    ) : (
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-subtle)', fontStyle: 'italic' }}>
                        Signed this petition.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Be the first to sign!</p>
            )}
          </div>
        </div>

        {/* Right Column: Signature Box & Action Tools */}
        <div>
          <div className="detail-sidebar-box">
            <div className="sidebar-sign-card">
              <h3>
                <strong>{petition.currentSignatures.toLocaleString()}</strong> signatures
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                next goal is {petition.targetSignatures.toLocaleString()} supporters
              </p>

              <ProgressBar
                current={petition.currentSignatures}
                target={petition.targetSignatures}
                showLabels={false}
              />

              {/* Status Notice */}
              {petition.status === 'successful' && (
                <div
                  style={{
                    margin: '1.25rem 0',
                    padding: '0.85rem',
                    background: 'var(--success-light)',
                    color: '#065f46',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <CheckCircle size={18} />
                  <span><strong>Victory!</strong> This petition reached its target goal.</span>
                </div>
              )}

              {petition.status === 'closed' && (
                <div
                  style={{
                    margin: '1.25rem 0',
                    padding: '0.85rem',
                    background: 'var(--bg-subtle)',
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.9rem'
                  }}
                >
                  This petition has concluded and is closed to new signatures.
                </div>
              )}

              {/* Sign Action Button */}
              <div style={{ marginTop: '1.5rem' }}>
                {hasSigned ? (
                  <div
                    style={{
                      background: 'var(--primary-light)',
                      border: '1px solid #bfdbfe',
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ color: 'var(--primary)', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                      <CheckCircle size={18} />
                      You Signed This Petition!
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--secondary-light)' }}>
                      Share this movement with your network to help reach the finish line.
                    </p>
                  </div>
                ) : petition.status === 'closed' ? null : isAuthenticated ? (
                  <button
                    onClick={() => setIsSignModalOpen(true)}
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '0.85rem', fontSize: '1.05rem' }}
                  >
                    <Send size={18} />
                    Sign This Petition
                  </button>
                ) : (
                  <div>
                    <Link
                      to="/login"
                      state={{ from: `/petitions/${id}` }}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '0.85rem', fontSize: '1rem' }}
                    >
                      Sign In to Sign Petition
                    </Link>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.5rem' }}>
                      Don't have an account?{' '}
                      <Link to="/register" style={{ fontWeight: 600 }}>
                        Register free
                      </Link>
                    </p>
                  </div>
                )}
              </div>

              {/* Share Tools */}
              <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--border)', paddingTop: '1.25rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--secondary)' }}>
                  Spread the Word
                </span>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem' }}>
                  <button
                    onClick={handleCopyLink}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.85rem', padding: '0.55rem' }}
                  >
                    {copied ? <Check size={16} color="green" /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I just supported: "${petition.title}". Add your voice here:`)}&url=${encodeURIComponent(window.location.href)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
                    title="Share on X / Twitter"
                  >
                    X
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Please sign this petition: "${petition.title}" ${window.location.href}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem', padding: '0.55rem 0.85rem' }}
                    title="Share on WhatsApp"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>

              {/* Creator / Admin Controls */}
              {canManage && (
                <div
                  style={{
                    marginTop: '2rem',
                    borderTop: '1px solid var(--border)',
                    paddingTop: '1.25rem',
                    background: '#fffbeb',
                    margin: '1.5rem -1.75rem -1.75rem',
                    padding: '1.25rem 1.75rem',
                    borderBottomLeftRadius: 'var(--radius-lg)',
                    borderBottomRightRadius: 'var(--radius-lg)'
                  }}
                >
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#92400e',
                      letterSpacing: '0.05em'
                    }}
                  >
                    Organizer Controls ({isCreator ? 'Creator' : 'Admin'})
                  </span>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                    <Link
                      to={`/edit-petition/${id}`}
                      className="btn btn-secondary"
                      style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
                    >
                      <Edit size={14} />
                      Edit Petition
                    </Link>

                    {petition.status === 'active' ? (
                      <button
                        onClick={() => handleStatusChange('closed')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
                      >
                        Close Petition
                      </button>
                    ) : (
                      <button
                        onClick={() => handleStatusChange('active')}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
                      >
                        Reopen Petition
                      </button>
                    )}

                    <button
                      onClick={handleDelete}
                      className="btn btn-danger"
                      style={{ fontSize: '0.82rem', padding: '0.4rem 0.75rem' }}
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      <SignModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        onSign={handleSign}
        petitionTitle={petition.title}
      />
    </div>
  );
};

export default PetitionDetailPage;
