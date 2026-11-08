import React from 'react';
import { ShieldCheck, Users, CheckCircle2, Building } from 'lucide-react';
import ProgressBar from './ProgressBar';

/**
 * Static fallback card rendered when 3D is unsupported,
 * screen is < 768px, or prefers-reduced-motion is active.
 */
export default function PetitionPreview() {
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-xl)',
        padding: '2rem',
        maxWidth: '460px',
        margin: '0 auto',
        textAlign: 'left'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <span
          style={{
            background: 'var(--primary-light)',
            color: 'var(--primary-dark)',
            padding: '0.2rem 0.65rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.75rem',
            fontWeight: 700
          }}
        >
          Environment & Urban Ecology
        </span>
        <span
          style={{
            background: '#ecfdf5',
            color: '#065f46',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <ShieldCheck size={13} /> Aadhaar Verified
        </span>
      </div>

      <h3 style={{ fontSize: '1.25rem', marginBottom: '0.6rem', lineHeight: 1.35 }}>
        Preserve Greenwood Heritage Forest from Commercial Encroachment
      </h3>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
        <Building size={14} />
        State Forestry Department & City Planning Commission
      </div>

      <ProgressBar current={412} target={500} />

      <div
        style={{
          marginTop: '1.5rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
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
              fontWeight: 700,
              fontSize: '0.82rem'
            }}
          >
            ER
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>Elena Rostova</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Citizen Organizer</div>
          </div>
        </div>

        <span
          style={{
            color: 'var(--primary)',
            fontWeight: 700,
            fontSize: '0.88rem'
          }}
        >
          82% Reached
        </span>
      </div>
    </div>
  );
}
