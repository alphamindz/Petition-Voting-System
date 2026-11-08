import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import {
  Shield,
  FileCheck,
  Users,
  BarChart3,
  History,
  CheckCircle,
  XCircle,
  Globe,
  Lock,
  Unlock,
  AlertTriangle,
  Building,
  Clock
} from 'lucide-react';

const AdminDashboardPage = () => {
  const [activeTab, setActiveTab] = useState('protests');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Stats State
  const [stats, setStats] = useState(null);

  // Protests State
  const [protests, setProtests] = useState([]);
  const [protestStatusFilter, setProtestStatusFilter] = useState('pending');
  const [selectedProtest, setSelectedProtest] = useState(null);
  const [statusNotes, setStatusNotes] = useState('');
  const [modalAction, setModalAction] = useState(null); // 'approved', 'rejected', 'published', 'closed'

  // Users State
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');

  // Activity Log State
  const [activities, setActivities] = useState([]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'protests') {
        const data = await adminService.getProtests({ status: protestStatusFilter });
        setProtests(data.protests || []);
      } else if (activeTab === 'users') {
        const data = await adminService.getUsers({ search: userSearch || undefined });
        setUsers(data.users || []);
      } else if (activeTab === 'stats') {
        const data = await adminService.getStats();
        setStats(data.stats);
      } else if (activeTab === 'activity') {
        const data = await adminService.getActivity();
        setActivities(data.activities || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch admin data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab, protestStatusFilter]);

  const handleStatusTransition = async () => {
    if (!selectedProtest || !modalAction) return;

    try {
      const res = await adminService.updateStatus(selectedProtest._id, modalAction, statusNotes);
      setMessage(res.message);
      setSelectedProtest(null);
      setModalAction(null);
      setStatusNotes('');
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Status transition failed');
    }
  };

  const handleToggleUserBlock = async (userId, currentActive) => {
    try {
      const res = await adminService.toggleUserStatus(userId, !currentActive);
      setMessage(res.message);
      loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '2rem' }}>
        <div
          style={{
            background: '#fef3c7',
            color: '#92400e',
            padding: '12px',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Shield size={28} />
        </div>
        <div>
          <h1 style={{ fontSize: '2rem', margin: 0 }}>Administrative Control Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', margin: '0.2rem 0 0' }}>
            Review protests, enforce status transitions, manage citizens, and review audit trails.
          </p>
        </div>
      </div>

      {message && <AlertMessage type="success" message={message} onClose={() => setMessage(null)} />}
      {error && <AlertMessage type="error" message={error} onClose={() => setError(null)} />}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid var(--border)', marginBottom: '2rem' }}>
        {[
          { id: 'protests', label: 'Protests Moderation', icon: FileCheck },
          { id: 'users', label: 'Citizens Directory', icon: Users },
          { id: 'stats', label: 'Platform Metrics', icon: BarChart3 },
          { id: 'activity', label: 'Audit Trail', icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                background: 'none',
                border: 'none',
                borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                marginBottom: '-2px',
                fontWeight: 700,
                fontSize: '0.95rem',
                color: isActive ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: PROTESTS MODERATION */}
      {activeTab === 'protests' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter status:</span>
            {['pending', 'approved', 'published', 'rejected', 'closed', 'all'].map((st) => (
              <button
                key={st}
                className={`filter-pill ${protestStatusFilter === st ? 'active' : ''}`}
                onClick={() => setProtestStatusFilter(st)}
              >
                {st.toUpperCase()}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner text="Loading protests for moderation..." />
          ) : protests.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3.5rem', background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <CheckCircle size={40} style={{ color: 'var(--success)', marginBottom: '0.75rem' }} />
              <h3>No {protestStatusFilter} protests in queue</h3>
              <p style={{ color: 'var(--text-muted)' }}>All submissions in this category have been processed.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {protests.map((p) => (
                <div
                  key={p._id}
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: '1.5rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                        <span className={`badge badge-${p.status}`}>{p.status}</span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                          Submitted: {new Date(p.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.25rem', margin: '0.2rem 0' }}>{p.title}</h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <Building size={14} />
                        Authority: <strong>{p.concernedAuthority}</strong> | Submitted by: <strong>{p.user?.name}</strong> ({p.user?.email})
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {/* Transition: pending -> approved / rejected */}
                      {p.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedProtest(p);
                              setModalAction('approved');
                            }}
                            className="btn btn-primary"
                            style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                          >
                            <CheckCircle size={14} />
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProtest(p);
                              setModalAction('rejected');
                            }}
                            className="btn btn-danger"
                            style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                          >
                            <XCircle size={14} />
                            Reject
                          </button>
                        </>
                      )}

                      {/* Transition: approved -> published */}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => {
                            setSelectedProtest(p);
                            setModalAction('published');
                          }}
                          className="btn btn-primary"
                          style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                        >
                          <Globe size={14} />
                          Publish for Voting
                        </button>
                      )}

                      {/* Transition: published -> closed */}
                      {p.status === 'published' && (
                        <button
                          onClick={() => {
                            setSelectedProtest(p);
                            setModalAction('closed');
                          }}
                          className="btn btn-secondary"
                          style={{ fontSize: '0.82rem', padding: '0.4rem 0.8rem' }}
                        >
                          Close Campaign
                        </button>
                      )}
                    </div>
                  </div>

                  <p style={{ marginTop: '0.75rem', fontSize: '0.92rem', color: '#334155', lineHeight: 1.6 }}>
                    {p.description}
                  </p>

                  {p.supportingInfo && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      <strong>Evidence:</strong> {typeof p.supportingInfo === 'string' ? p.supportingInfo : JSON.stringify(p.supportingInfo)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CITIZENS DIRECTORY */}
      {activeTab === 'users' && (
        <div>
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <input
              type="text"
              className="form-input"
              style={{ maxWidth: '360px' }}
              placeholder="Search by citizen name, email, or mobile..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <button onClick={loadData} className="btn btn-primary" style={{ padding: '0.65rem 1.2rem' }}>
              Search
            </button>
          </div>

          {loading ? (
            <LoadingSpinner text="Loading citizen directory..." />
          ) : (
            <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>Citizen</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Contact</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Verifications</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{u.name}</td>
                      <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                        <div>{u.email}</div>
                        <div style={{ fontSize: '0.8rem' }}>{u.mobile}</div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: u.isEmailVerified ? '#ecfdf5' : '#fef2f2', color: u.isEmailVerified ? '#065f46' : '#991b1b' }}>
                            Email: {u.isEmailVerified ? '✓' : '✗'}
                          </span>
                          <span style={{ fontSize: '0.72rem', padding: '2px 6px', borderRadius: '4px', background: u.isAadhaarVerified ? '#ecfdf5' : '#fef2f2', color: u.isAadhaarVerified ? '#065f46' : '#991b1b' }}>
                            Aadhaar: {u.isAadhaarVerified ? '✓' : '✗'}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700 }}>{u.role}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span className={`badge ${u.isActive ? 'badge-successful' : 'badge-closed'}`}>
                          {u.isActive ? 'Active' : 'Blocked'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => handleToggleUserBlock(u._id, u.isActive)}
                            className={`btn ${u.isActive ? 'btn-danger' : 'btn-secondary'}`}
                            style={{ fontSize: '0.78rem', padding: '0.35rem 0.65rem' }}
                          >
                            {u.isActive ? <Lock size={13} /> : <Unlock size={13} />}
                            {u.isActive ? 'Block' : 'Unblock'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PLATFORM STATS */}
      {activeTab === 'stats' && stats && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Registered Citizens</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem' }}>{stats.totalUsers}</div>
            </div>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Fully Verified (Aadhaar + Email)</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--success)' }}>
                {stats.fullyVerifiedUsers}
              </div>
            </div>
            <div style={{ background: '#ffffff', padding: '1.5rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>Total Verified Votes Cast</span>
              <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--primary)' }}>
                {stats.totalVotes}
              </div>
            </div>
          </div>

          <div style={{ background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Protests Breakdown by Lifecycle Stage</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
              {Object.entries(stats.protestsByStatus || {}).map(([st, cnt]) => (
                <div key={st} style={{ background: 'var(--bg-subtle)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <div style={{ textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{st}</div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '0.2rem' }}>{cnt}</div>
                </div>
              ))}
            </div>
          </div>

          {stats.top5Protests && stats.top5Protests.length > 0 && (
            <div style={{ background: '#ffffff', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Top 5 Most Supported Protests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {stats.top5Protests.map((tp, idx) => (
                  <div key={tp._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <strong>#{idx + 1} {tp.title}</strong>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Authority: {tp.concernedAuthority}</div>
                    </div>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
                      {tp.voteCount} Votes
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: AUDIT ACTIVITY LOG */}
      {activeTab === 'activity' && (
        <div style={{ background: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Chronological Administrative Decisions</h3>
          {loading ? (
            <LoadingSpinner text="Loading audit log..." />
          ) : activities.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No audit events logged yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {activities.map((act) => (
                <div key={act._id} style={{ padding: '1rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', borderLeft: '4px solid var(--primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                    <strong>Action: {act.action.toUpperCase()}</strong>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(act.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.88rem', color: 'var(--secondary)' }}>
                    Protest: <strong>{act.protest?.title || 'Unknown'}</strong> (Target authority: {act.protest?.concernedAuthority})
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Moderated by Administrator: <strong>{act.admin?.name}</strong> ({act.admin?.email})
                  </div>
                  {act.notes && (
                    <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '0.4rem', fontStyle: 'italic' }}>
                      Notes: "{act.notes}"
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Status Transition Modal */}
      {selectedProtest && modalAction && (
        <div className="modal-backdrop" onClick={() => setSelectedProtest(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
              Confirm Decision: {modalAction.toUpperCase()}
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Protest: "{selectedProtest.title}"
            </p>

            <div className="form-group">
              <label className="form-label" htmlFor="statusNotes">
                Administrative Notes / Reason (Optional)
              </label>
              <textarea
                id="statusNotes"
                className="form-textarea"
                rows={3}
                placeholder="Add audit justification or feedback for the organizer..."
                value={statusNotes}
                onChange={(e) => setStatusNotes(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setSelectedProtest(null)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleStatusTransition}
              >
                Confirm {modalAction}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;

