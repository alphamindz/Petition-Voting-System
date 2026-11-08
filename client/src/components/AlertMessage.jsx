import React from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';

const AlertMessage = ({ type = 'error', message, onClose }) => {
  if (!message) return null;

  const isError = type === 'error';

  return (
    <div className={`alert ${isError ? 'alert-error' : 'alert-success'}`}>
      {isError ? (
        <AlertCircle size={18} style={{ flexShrink: 0 }} />
      ) : (
        <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
      )}
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            color: 'inherit'
          }}
          aria-label="Close"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

export default AlertMessage;
