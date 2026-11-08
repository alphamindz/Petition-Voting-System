import React from 'react';

const ProgressBar = ({ current = 0, target = 100, showLabels = true }) => {
  const percentage = Math.min(100, Math.round((current / (target || 1)) * 100));
  const isGoalMet = current >= target;

  return (
    <div className="progress-container">
      {showLabels && (
        <div className="progress-header">
          <span>
            <strong>{current.toLocaleString()}</strong> signed of {target.toLocaleString()} goal
          </span>
          <span style={{ color: isGoalMet ? 'var(--success)' : 'var(--primary)' }}>
            {percentage}%
          </span>
        </div>
      )}
      <div className="progress-track">
        <div
          className={`progress-fill ${isGoalMet ? 'goal-met' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
