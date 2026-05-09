import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

import StatCard from '../components/StatCard';

const ActivityStats = () => {
  const { user } = useAuth();
  const { activityName } = useParams();
  const decodedName = decodeURIComponent(activityName || '');
  const navigate = useNavigate();

  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivityData = async () => {
      if (!user || !decodedName) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('logs')
        .select('*')
        .eq('activity_type', decodedName)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setLogs(data);
      setLoading(false);
    };
    fetchActivityData();
  }, [user, decodedName]);

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm('Delete this session? This cannot be undone.');
    if (!confirmDelete) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (!error) setLogs(prev => prev.filter(log => log.id !== id));
  };

  const totalSessions = logs.length;
  const totalDuration = logs.reduce((acc, log) => acc + (log.duration || 0), 0);

  if (loading) return (
    <div className="container mt-5 text-center" style={{ color: 'var(--text-muted)' }}>
      Loading {decodedName} Stats...
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
      <div className="d-flex justify-content-between align-items-center mb-5 flex-wrap gap-3">
        <div>
          <h1 style={{ fontWeight: 700, fontSize: '1.9rem', marginBottom: '2px' }}>{decodedName} Stats</h1>
          <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.9rem' }}>
            Tracking your custom sessions
          </p>
        </div>
        <button
          className="btn btn-sage px-4"
          style={{ fontSize: '0.88rem' }}
          onClick={() => navigate('/dashboard', { state: { action: 'newLog', activityName: decodedName } })}
        >
          Log {decodedName}
        </button>
      </div>

      {/* ── STAT CARDS — responsive: col-12 col-md-6 ─────────── */}
      <div className="row g-4 mb-5">
        <div className="col-12 col-md-6">
          <StatCard title="Total Sessions" value={totalSessions} bgColor="glass-card" />
        </div>
        <div className="col-12 col-md-6">
          <StatCard title="Total Time" value={totalDuration} subtitle="Minutes" bgColor="glass-card" />
        </div>
      </div>

      {/* ── HISTORY TABLE — scrollable on mobile ─────────────── */}
      <h5 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Session History</h5>
      <div className="glass-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table className="table mb-0" style={{ minWidth: '520px' }}>
          <thead>
            <tr>
              <th className="ps-4" style={{ width: '18%' }}>Date</th>
              <th style={{ width: '15%' }}>Value</th>
              <th style={{ width: '15%' }}>Duration</th>
              <th style={{ width: '37%' }}>Notes</th>
              <th className="pe-4 text-end" style={{ width: '15%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {logs.length > 0 ? (
              logs.map(log => (
                <tr key={log.id}>
                  <td className="ps-4" style={{ fontWeight: 500, color: 'var(--text-muted)' }}>
                    {format(new Date(log.created_at), 'MMM dd, yyyy')}
                  </td>
                  <td>
                    <span
                      className="badge rounded-pill"
                      style={{ background: 'var(--oat)', color: 'var(--text-primary)', fontSize: '0.82rem', fontWeight: 600, padding: '4px 10px' }}
                    >
                      {log.metric_value}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    {log.duration ? `${log.duration} min` : '—'}
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {log.notes ? log.notes : <span style={{ opacity: 0.45, fontStyle: 'italic' }}>—</span>}
                  </td>
                  <td className="pe-4 text-end text-nowrap">
                    <button
                      className="btn btn-sm btn-glass me-1"
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => navigate('/dashboard', { state: { action: 'edit', log: log } })}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: 'none' }}
                      onClick={() => handleDelete(log.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>
                  No {decodedName} sessions logged yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActivityStats;