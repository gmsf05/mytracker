// ═══════════════════════════════════════════════════════════
// CheerStats.tsx — responsive version
// ═══════════════════════════════════════════════════════════
import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { subDays, startOfMonth, startOfYear } from 'date-fns';
import { Link, useLocation } from 'react-router-dom';

import StatCard from '../components/StatCard';
import ProgressChart from '../components/ProgressChart';

const MODAL_STYLES = `
  .log-overlay {
    position: fixed; inset: 0; z-index: 200;
    background: rgba(58,56,48,0.22);
    backdrop-filter: blur(6px);
    display: flex; align-items: flex-end; justify-content: center;
    padding: 0;
    overflow-y: auto;
    animation: fadeIn 0.18s ease;
  }
  @media (min-width: 481px) {
    .log-overlay {
      align-items: center;
      padding: 24px;
    }
  }
  @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
  .log-card {
    background: rgba(255,255,255,0.72);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 24px 24px 0 0;
    padding: 28px 20px 24px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(129,130,99,0.18);
    animation: slideUp 0.22s ease;
  }
  @media (min-width: 481px) {
    .log-card {
      border-radius: 28px;
      padding: 40px 36px 32px;
      max-width: 460px;
    }
  }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px) } to { opacity: 1; transform: translateY(0) } }
  .log-label {
    font-size: 0.74rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--text-muted);
    display: block;
    margin-bottom: 6px;
  }
  .log-input {
    width: 100%;
    background: rgba(255,255,255,0.60) !important;
    border: 1px solid rgba(255,255,255,0.80) !important;
    border-radius: 12px !important;
    padding: 11px 14px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.93rem;
    color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .log-input:focus {
    border-color: var(--frost) !important;
    box-shadow: 0 0 0 3px rgba(199,201,244,0.20) !important;
  }
`;

const CheerStats = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [cheerLogs, setCheerLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'week' | 'month' | 'year' | 'all'>('month');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formSessions, setFormSessions] = useState('1');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  const FILTER_LABELS: Record<string, string> = { week: 'Week', month: 'Month', year: 'Year', all: 'All Time' };

  useEffect(() => {
    if (location.state?.action === 'openLog') {
      openNewForm();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchCheerData = async () => {
      if (!user) return;
      setLoading(true);
      let query = supabase.from('logs').select('*').eq('activity_type', 'Cheer').eq('user_id', user.id).order('created_at', { ascending: false });
      if (filter === 'week')  query = query.gte('created_at', subDays(new Date(), 7).toISOString());
      else if (filter === 'month') query = query.gte('created_at', startOfMonth(new Date()).toISOString());
      else if (filter === 'year')  query = query.gte('created_at', startOfYear(new Date()).toISOString());
      const { data, error } = await query;
      if (!error && data) {
        setCheerLogs(data);
        const grouped = data.reduce((acc: any, log: any) => {
          const d = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
          acc[d] = (acc[d] || 0) + (log.metric_value || 1);
          return acc;
        }, {});
        setChartData(Object.keys(grouped).map(date => ({ name: date, total: grouped[date] })).reverse());
      }
      setLoading(false);
    };
    fetchCheerData();
  }, [user, filter, refreshTrigger]);

  const openNewForm = () => {
    setEditingId(null);
    setFormSessions('1'); setFormNotes('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowModal(true);
  };

  const openEditForm = (log: any) => {
    setEditingId(log.id);
    setFormSessions(log.metric_value?.toString() || '1');
    setFormNotes(log.notes || '');
    setFormDate(new Date(log.created_at).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const handleSave = async () => {
    if (!formSessions || isSaving) return;
    setIsSaving(true);
    const payload = {
      activity_type: 'Cheer',
      sub_activity: 'General',
      metric_value: Number(formSessions),
      notes: formNotes,
      user_id: user?.id,
      created_at: new Date(formDate).toISOString(),
    };
    let error;
    if (editingId) {
      const { error: u } = await supabase.from('logs').update(payload).eq('id', editingId);
      error = u;
    } else {
      const { error: i } = await supabase.from('logs').insert([payload]);
      error = i;
    }
    if (!error) { closeModal(); setRefreshTrigger(p => p + 1); }
    else alert('Error saving: ' + error.message);
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this practice session?')) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (!error) setRefreshTrigger(p => p + 1);
  };

  const totalSessions = cheerLogs.reduce((sum, log) => sum + (log.metric_value || 1), 0);

  if (loading) return <div className="container mt-5 text-center" style={{ color: 'var(--text-muted)' }}>Loading Cheer Stats...</div>;

  return (
    <>
      <style>{MODAL_STYLES}</style>

      <div className="container mt-5 pb-5">
        <Link to="/dashboard" className="text-decoration-none fw-bold mb-4 d-inline-block" style={{ color: 'var(--frost)', fontSize: '0.88rem', filter: 'brightness(0.75)' }}>
          Back to Dashboard
        </Link>

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.9rem', marginBottom: '2px' }}>Cheerleading Stats</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.9rem' }}>Tracking your hall and varsity practice sessions</p>
          </div>
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="btn-group filter-group-winter">
              {(['week', 'month', 'year', 'all'] as const).map(f => (
                <button key={f} className={`btn ${filter === f ? 'btn-active' : ''}`} onClick={() => setFilter(f)}>
                  {FILTER_LABELS[f]}
                </button>
              ))}
            </div>
            <button className="btn btn-winter px-4" style={{ fontSize: '0.88rem' }} onClick={openNewForm}>
              Log Session
            </button>
          </div>
        </div>

        {/* ── STATS ROW — responsive: col-12 col-md-4 / col-md-8 */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-md-4">
            <StatCard title="Sessions in Period" value={totalSessions} bgColor="glass-card" />
          </div>
          <div className="col-12 col-md-8">
            <div className="glass-card p-4 h-100" style={{ borderRadius: '20px', minHeight: '200px' }}>
              <h6 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '0.88rem' }}>Practice Frequency</h6>
              <ProgressChart data={chartData} barColor="#C7C9F4" height="180px" />
            </div>
          </div>
        </div>

        {/* ── HISTORY TABLE — scrollable on mobile ─────────────── */}
        <h5 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Practice Notes & History</h5>
        <div className="glass-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table mb-0" style={{ minWidth: '480px' }}>
            <thead>
              <tr>
                <th className="ps-4">Date</th><th>Sessions</th><th>Notes</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {cheerLogs.length > 0 ? cheerLogs.map(log => (
                <tr key={log.id}>
                  <td className="ps-4" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                    {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span className="badge rounded-pill badge-winter" style={{ fontSize: '0.80rem', padding: '5px 12px' }}>
                      {log.metric_value} {log.metric_value === 1 ? 'Session' : 'Sessions'}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    {log.notes ? `"${log.notes}"` : <span style={{ opacity: 0.45 }}>—</span>}
                  </td>
                  <td className="pe-4 text-end text-nowrap">
                    <button
                      className="btn btn-sm btn-glass me-1"
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem' }}
                      onClick={() => openEditForm(log)}
                    >Edit</button>
                    <button
                      className="btn btn-sm"
                      style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: 'none' }}
                      onClick={() => handleDelete(log.id)}
                    >Delete</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={4} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No practices logged for this time period.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MODAL ════════════════════════════════════════════════ */}
      {showModal && (
        <div className="log-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="log-card">
            <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px', textAlign: 'center' }}>
              {editingId ? 'Edit Practice Session' : 'Log Practice Session'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '28px' }}>
              Cheerleading
            </p>

            <div style={{ marginBottom: '16px' }}>
              <label className="log-label">Date</label>
              <input type="date" className="log-input" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="log-label">Number of Sessions</label>
              <input type="number" className="log-input" min="1" value={formSessions} onChange={e => setFormSessions(e.target.value)} placeholder="1" />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px', marginBottom: 0 }}>
                Log 2 if you had both a morning and evening practice.
              </p>
            </div>

            <div style={{ marginBottom: '28px' }}>
              <label className="log-label">Notes (optional)</label>
              <textarea
                className="log-input"
                style={{ resize: 'vertical', minHeight: '80px' }}
                value={formNotes}
                onChange={e => setFormNotes(e.target.value)}
                placeholder="What did you work on today?"
              />
            </div>

            <button
              className="btn btn-winter w-100 mb-2"
              style={{ padding: '13px', fontSize: '0.95rem', borderRadius: '100px', fontWeight: 700 }}
              onClick={handleSave}
              disabled={isSaving || !formSessions}
            >{isSaving ? 'Saving...' : editingId ? 'Update Session' : 'Save Session'}</button>
            <button className="btn w-100" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }} onClick={closeModal}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default CheerStats;