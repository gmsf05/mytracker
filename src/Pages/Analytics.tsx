// ═══════════════════════════════════════════════════════════
// Analytics.tsx — responsive version
// ═══════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Analytics = () => {
  const { user } = useAuth();
  const [allLogs, setAllLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const fetchAllData = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setAllLogs(data);
      setLoading(false);
    };
    fetchAllData();
  }, [user]);

  const handleDelete = async (id: number, activityName: string) => {
    const confirmDelete = window.confirm(`Delete this ${activityName} entry? This cannot be undone.`);
    if (!confirmDelete) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (!error) setAllLogs(prev => prev.filter(log => log.id !== id));
    else alert('Error deleting entry: ' + error.message);
  };

  const uniqueActivities = ['All', ...new Set(allLogs.map(log => log.activity_type))];
  const displayedLogs = filter === 'All' ? allLogs : allLogs.filter(log => log.activity_type === filter);

  const BADGE_COLORS: Record<string, string> = {
    'Cheer':     '#4facfe',
    'Jump Rope': '#818263',
  };

  if (loading) return (
    <div className="container mt-5 text-center" style={{ color: 'var(--text-muted)' }}>
      Loading Data Ledger...
    </div>
  );

  return (
    <div className="container mt-5 pb-5">
      <Link
        to="/dashboard"
        className="text-decoration-none fw-bold mb-4 d-inline-block"
        style={{ color: 'var(--sage)', fontSize: '0.88rem' }}
      >
        Back to Dashboard
      </Link>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '1.9rem', marginBottom: '2px' }}>Data Ledger</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.9rem' }}>
            Review and manage all your logged history
          </p>
        </div>

        {/* Filter Select */}
        <div>
          <select
            className="form-select glass-input"
            style={{ minWidth: '160px', fontWeight: 500, fontSize: '0.88rem' }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {uniqueActivities.map(act => (
              <option key={act as string} value={act as string}>{act}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── TABLE — horizontally scrollable on mobile ────────── */}
      <div className="glass-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="table mb-0" style={{ minWidth: '560px' }}>
          <thead>
            <tr>
              <th className="ps-4">Date</th>
              <th>Activity</th>
              <th>Details</th>
              <th>Notes</th>
              <th className="pe-4 text-end">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedLogs.length > 0 ? (
              displayedLogs.map(log => (
                <tr key={log.id}>
                  <td className="ps-4" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span
                      className="badge rounded-pill"
                      style={{
                        background: BADGE_COLORS[log.activity_type] || '#3a3830',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        padding: '4px 10px',
                      }}
                    >
                      {log.activity_type}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{log.metric_value}</strong>{' '}
                    {log.sub_activity !== 'General' && (
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        ({log.sub_activity})
                      </span>
                    )}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {log.notes
                      ? `"${log.notes}"`
                      : <span style={{ opacity: 0.45 }}>—</span>}
                  </td>
                  <td className="pe-4 text-end">
                    <button
                      className="btn btn-sm"
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: 'none' }}
                      onClick={() => handleDelete(log.id, log.activity_type)}
                      title="Delete"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                  No logs found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export { Analytics as default };


// ═══════════════════════════════════════════════════════════
// ActivityStats.tsx — responsive version
// ═══════════════════════════════════════════════════════════
// (save this as ActivityStats.tsx separately)