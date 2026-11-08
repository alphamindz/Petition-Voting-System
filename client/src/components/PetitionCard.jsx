import React from 'react';
import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';
import { Users, CheckCircle, Clock } from 'lucide-react';

const categoryImages = {
  Environment: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600',
  Education: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600',
  Community: 'https://images.unsplash.com/photo-1502744688674-c619d1586c9e?w=600',
  'Animal Welfare': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600',
  Healthcare: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=600',
  'Human Rights': 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=600',
  Technology: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600',
  Other: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600'
};

const PetitionCard = ({ petition }) => {
  const {
    _id,
    title,
    description,
    category,
    currentSignatures = 0,
    targetSignatures = 100,
    status = 'active',
    imageUrl,
    creator
  } = petition;

  const displayImage =
    imageUrl || categoryImages[category] || categoryImages.Community;

  return (
    <div className="petition-card">
      <div className="card-image-wrapper">
        <img
          src={displayImage}
          alt={title}
          className="card-image"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = categoryImages.Community;
          }}
        />
        <div className="card-badges">
          <span
            style={{
              backgroundColor: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(4px)',
              color: '#ffffff',
              padding: '0.2rem 0.6rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600
            }}
          >
            {category}
          </span>
          <span className={`badge badge-${status}`}>
            {status === 'successful' && <CheckCircle size={12} />}
            {status === 'active' && <Clock size={12} />}
            {status}
          </span>
        </div>
      </div>

      <div className="card-body">
        <h3 className="card-title">
          <Link to={`/petitions/${_id}`} style={{ color: 'inherit' }}>
            {title}
          </Link>
        </h3>
        <p className="card-desc">{description}</p>

        <ProgressBar current={currentSignatures} target={targetSignatures} />

        <div className="card-footer">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  background: 'var(--primary-light)',
                  color: 'var(--primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700
                }}
              >
                {creator?.name ? creator.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span
                style={{
                  fontSize: '0.85rem',
                  color: 'var(--text-muted)',
                  maxWidth: '120px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}
              >
                {creator?.name || 'Community Member'}
              </span>
            </div>

            <Link
              to={`/petitions/${_id}`}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.85rem', fontSize: '0.85rem' }}
            >
              View Petition
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetitionCard;
