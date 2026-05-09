import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Cell,
} from 'recharts';
import { Link, useLocation } from 'react-router-dom';

const ICON = {
  back:   '/src/assets/home.png',
  edit:   '/src/assets/pencil.png',
  delete: '/src/assets/delete.png',
};

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
  /* On larger screens, center vertically */
  @media (min-width: 481px) {
    .log-overlay {
      align-items: flex-start;
      padding: 24px;
    }
  }
  @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
  .log-card {
    background: rgba(255,255,255,0.74);
    backdrop-filter: blur(28px);
    -webkit-backdrop-filter: blur(28px);
    border: 1px solid rgba(255,255,255,0.85);
    border-radius: 28px 28px 0 0;
    padding: 28px 20px 24px;
    width: 100%;
    box-shadow: 0 20px 60px rgba(129,130,99,0.18);
    animation: slideUp 0.22s ease;
  }
  @media (min-width: 481px) {
    .log-card {
      border-radius: 28px;
      padding: 36px 32px 28px;
      max-width: 560px;
      margin: auto;
    }
  }
  @keyframes slideUp { from { opacity:0;transform:translateY(20px) } to { opacity:1;transform:translateY(0) } }
  .log-label {
    font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.07em; color: var(--text-muted);
    display: block; margin-bottom: 6px;
  }
  .log-input {
    width: 100%;
    background: rgba(255,255,255,0.60) !important;
    border: 1px solid rgba(255,255,255,0.80) !important;
    border-radius: 12px !important;
    padding: 10px 13px;
    font-family: 'Poppins', sans-serif;
    font-size: 0.92rem; color: var(--text-primary);
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }
  .log-input:focus {
    border-color: var(--winter-sky) !important;
    box-shadow: 0 0 0 3px rgba(175,198,233,0.18) !important;
  }
  .cat-pill {
    padding: 6px 12px; border-radius: 10px;
    border: 1.5px solid transparent;
    font-size: 0.78rem; font-weight: 600; cursor: pointer;
    transition: all 0.15s; font-family: 'Poppins', sans-serif;
    white-space: nowrap;
  }
  .entry-card {
    background: rgba(255,255,255,0.50);
    border: 1px solid rgba(255,255,255,0.80);
    border-radius: 16px;
    padding: 16px;
    position: relative;
    transition: box-shadow 0.15s;
  }
  .entry-card:hover { box-shadow: 0 4px 16px rgba(129,130,99,0.10); }
  .entry-remove-btn {
    position: absolute; top: 10px; right: 10px;
    background: rgba(192,57,43,0.08); border: none;
    border-radius: 8px; padding: 3px 8px;
    font-size: 0.70rem; font-weight: 700; color: #c0392b;
    cursor: pointer; transition: background 0.15s;
    font-family: 'Poppins', sans-serif;
  }
  .entry-remove-btn:hover { background: rgba(192,57,43,0.16); }
  .add-entry-btn {
    width: 100%;
    background: rgba(129,130,99,0.06);
    border: 1.5px dashed rgba(129,130,99,0.30);
    border-radius: 12px;
    padding: 10px;
    font-size: 0.84rem; font-weight: 600;
    color: var(--text-secondary);
    cursor: pointer; transition: background 0.15s;
    font-family: 'Poppins', sans-serif;
  }
  .add-entry-btn:hover { background: rgba(129,130,99,0.11); }
  .icon-btn-img { width: 30px; height: 30px; object-fit: contain; opacity: 1.0; }

  /* Mobile: entry fields stack */
  @media (max-width: 480px) {
    .entry-card .row.g-2 > .col-4 {
      flex: 0 0 100% !important;
      max-width: 100% !important;
    }
    .cat-pill { font-size: 0.70rem !important; padding: 5px 9px !important; }
  }
`;

interface Entry {
  id: string;
  event: string;
  reps: string;
  duration: string;
  notes: string;
}

const EVENTS = ['SRPF','WPF','SRIF','Double Unders','Triple Unders','DDF','Freestyle Runs','General'];

const COLORS: Record<string, string> = {
  'SRPF': '#AFC6E9', 'WPF': '#DDBAAE', 'SRIF': '#C7C9F4',
  'Speed': '#DDE7F2', 'Single Unders': '#EFD7CF',
  'Double Unders': '#C7C9F4', 'Triple Unders': '#F5D6E7',
  'DDF': '#F8AFCF', 'Freestyle Runs': '#B8D4F0', 'General': '#c8c4bc',
};

const makeEntry = (event = 'SRPF'): Entry => ({
  id: Math.random().toString(36).slice(2),
  event, reps: '', duration: '', notes: '',
});

const JumpRopeStats = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [jrLogs, setJrLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [currentMonthView, setCurrentMonthView] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'multi' | 'edit'>('multi');

  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [entries, setEntries] = useState<Entry[]>([makeEntry()]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEvent, setEditEvent] = useState('SRPF');
  const [editReps, setEditReps] = useState('');
  const [editDuration, setEditDuration] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editDate, setEditDate] = useState(new Date().toISOString().split('T')[0]);

  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state?.action === 'openLog') {
      openNewSession();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const fetchJumpData = async () => {
      if (!user) return;
      setLoading(true);
      const { data, error } = await supabase
        .from('logs').select('*')
        .eq('activity_type', 'Jump Rope').eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data) setJrLogs(data);
      setLoading(false);
    };
    fetchJumpData();
  }, [user, refreshTrigger]);

  const openNewSession = () => {
    setModalMode('multi');
    setSessionDate(new Date().toISOString().split('T')[0]);
    setEntries([makeEntry()]);
    setShowModal(true);
  };

  const openEditForm = (log: any) => {
    setModalMode('edit');
    setEditingId(log.id);
    setEditEvent(log.sub_activity || 'SRPF');
    setEditReps(log.metric_value?.toString() || '');
    setEditDuration(log.duration?.toString() || '');
    setEditNotes(log.notes || '');
    setEditDate(new Date(log.created_at).toISOString().split('T')[0]);
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setEditingId(null); };

  const updateEntry = (id: string, field: keyof Entry, value: string) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };
  const addEntry = () => setEntries(prev => [...prev, makeEntry()]);
  const removeEntry = (id: string) => setEntries(prev => prev.filter(e => e.id !== id));

  const handleSaveSession = async () => {
    const valid = entries.filter(e => e.reps.trim() !== '');
    if (valid.length === 0 || isSaving) return;
    setIsSaving(true);
    const rows = valid.map(e => ({
      activity_type: 'Jump Rope',
      sub_activity: e.event,
      metric_value: Number(e.reps),
      duration: Number(e.duration) || 0,
      notes: e.notes,
      user_id: user?.id,
      created_at: new Date(sessionDate).toISOString(),
    }));
    const { error } = await supabase.from('logs').insert(rows);
    if (!error) { closeModal(); setRefreshTrigger(p => p + 1); }
    else alert('Error saving: ' + error.message);
    setIsSaving(false);
  };

  const handleSaveEdit = async () => {
    if (!editReps || isSaving) return;
    setIsSaving(true);
    const { error } = await supabase.from('logs').update({
      sub_activity: editEvent,
      metric_value: Number(editReps),
      duration: Number(editDuration) || 0,
      notes: editNotes,
      created_at: new Date(editDate).toISOString(),
    }).eq('id', editingId);
    if (!error) { closeModal(); setRefreshTrigger(p => p + 1); }
    else alert('Error saving: ' + error.message);
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this session? This cannot be undone.')) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (error) alert('Error deleting: ' + error.message);
    else setRefreshTrigger(p => p + 1);
  };

  const filteredLogs = jrLogs.filter(log => {
    if (timeFilter === 'All Time') return true;
    const d = new Date(log.created_at), now = new Date();
    if (timeFilter === 'Week') { const w = new Date(); w.setDate(now.getDate()-7); return d >= w; }
    if (timeFilter === 'Month') return d.getMonth() === currentMonthView.getMonth() && d.getFullYear() === currentMonthView.getFullYear();
    if (timeFilter === 'Year') { const y = new Date(); y.setFullYear(now.getFullYear()-1); return d >= y; }
    return true;
  });

  const totalReps = filteredLogs.reduce((s, l) => s + (l.metric_value || 0), 0);
  const pbSession = filteredLogs.length > 0 ? Math.max(...filteredLogs.map(l => l.metric_value)) : 0;
  const groupedChart = filteredLogs.reduce((acc: any, log: any) => {
    const t = log.sub_activity?.trim() || 'SRPF';
    acc[t] = (acc[t] || 0) + log.metric_value;
    return acc;
  }, {});
  const chartData = Object.keys(groupedChart).map(k => ({ name: k, total: groupedChart[k] }));

  const isCurrentMonth = currentMonthView.getMonth() === new Date().getMonth() && currentMonthView.getFullYear() === new Date().getFullYear();
  const viewTitle = timeFilter === 'Month' ? currentMonthView.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : timeFilter;

  const TOOLTIP_STYLE = {
    borderRadius: '12px', border: '1px solid rgba(255,255,255,0.72)',
    background: 'rgba(255,255,255,0.88)', backdropFilter: 'blur(16px)',
    boxShadow: '0 4px 16px rgba(129,130,99,0.12)', fontFamily: 'Poppins, sans-serif', fontSize: '13px',
  };

  if (loading) return <div className="container mt-5 text-center" style={{ color: 'var(--text-muted)' }}>Loading Stats...</div>;

  return (
    <>
      <style>{MODAL_STYLES}</style>

      <div className="container mt-5 pb-5">

        <Link to="/dashboard" className="text-decoration-none fw-bold mb-4 d-inline-flex align-items-center gap-2" style={{ color: 'var(--winter-sky)', fontSize: '0.88rem', filter: 'brightness(0.78)' }}>
          <img src={ICON.back} alt="" className="icon-btn-img" style={{ opacity: 1 }} />
          Back to Dashboard
        </Link>

        {/* ── HEADER ──────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.9rem', marginBottom: '2px' }}>Jump Rope Stats</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: 0, fontSize: '0.9rem' }}>Detailed breakdown of your jumping progress</p>
          </div>
          <div className="d-flex gap-2 align-items-center flex-wrap">
            {timeFilter === 'Month' && (
              <div className="month-nav">
                <button onClick={() => setCurrentMonthView(p => { const d=new Date(p); d.setMonth(p.getMonth()-1); return d; })}>&#8592;</button>
                <span>{currentMonthView.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonthView(p => { const d=new Date(p); d.setMonth(p.getMonth()+1); return d; })} disabled={isCurrentMonth}>&#8594;</button>
              </div>
            )}
            <div className="btn-group filter-group">
              {['Week','Month','Year','All Time'].map(tf => (
                <button key={tf} className={`btn ${timeFilter===tf?'btn-active':''}`} onClick={() => setTimeFilter(tf)}>{tf}</button>
              ))}
            </div>
            <button className="btn btn-icegym px-4" style={{ fontSize: '0.88rem' }} onClick={openNewSession}>Log Session</button>
          </div>
        </div>

        {/* ── STAT CARDS — responsive: col-12 col-md-4 ──────── */}
        <div className="row g-3 mb-4">
          {[
            { label: `Sessions (${viewTitle})`, val: filteredLogs.length, gradient: true },
            { label: `Total Reps (${viewTitle})`, val: totalReps.toLocaleString(), gradient: false },
            { label: `Personal Best (${viewTitle})`, val: pbSession, sage: true },
          ].map((s, i) => (
            <div key={i} className="col-12 col-md-4">
              <div className="glass-card p-4 text-center" style={s.gradient ? { background: 'linear-gradient(135deg,var(--winter-sky),#7ab3d8) !important' } : {}}>
                <p style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: s.gradient ? 'rgba(255,255,255,0.70)' : 'var(--text-muted)', marginBottom: '8px' }}>{s.label}</p>
                <h1 style={{ fontWeight: 700, fontSize: '2.8rem', color: s.gradient ? '#fff' : s.sage ? 'var(--winter-sky)' : 'var(--text-primary)', margin: 0 }}>{s.val}</h1>
              </div>
            </div>
          ))}
        </div>

        {/* ── CHART ─────────────────────────────────────────── */}
        <div className="glass-card p-4 mb-5">
          <h6 style={{ fontWeight: 600, marginBottom: '20px', fontSize: '0.88rem' }}>Performance by Jump Type</h6>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(129,130,99,0.10)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip cursor={{ fill: 'rgba(129,130,99,0.05)' }} contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="total" radius={[8,8,0,0]} barSize={44}>
                  {chartData.map((entry, i) => <Cell key={i} fill={COLORS[entry.name] || '#818263'} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="d-flex align-items-center justify-content-center h-75" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No jumps logged in {viewTitle}</div>
          )}
        </div>

        {/* ── HISTORY TABLE — horizontally scrollable on mobile ── */}
        <h5 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Jump History</h5>
        <div className="glass-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table mb-0" style={{ minWidth: '560px' }}>
            <thead>
              <tr>
                <th className="ps-4">Date</th><th>Type</th><th>Reps</th><th>Notes</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length > 0 ? filteredLogs.map(log => {
                const displayType = log.sub_activity?.trim() || 'SRPF';
                const badgeColor = COLORS[displayType] || '#818263';
                return (
                  <tr key={log.id}>
                    <td className="ps-4" style={{ color: 'var(--text-muted)', fontWeight: 500 }}>
                      {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td>
                      <span className="badge rounded-pill" style={{ background: badgeColor, color: '#fff', fontSize: '0.75rem', fontWeight: 600, padding: '4px 10px' }}>{displayType}</span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{log.metric_value}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      {log.notes ? `"${log.notes}"` : <span style={{ opacity: 0.5 }}>—</span>}
                    </td>
                    <td className="pe-4 text-end text-nowrap">
                      <button
                        className="btn btn-sm btn-glass me-1 d-inline-flex align-items-center gap-1"
                        style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem' }}
                        onClick={() => openEditForm(log)}
                      >
                        <img src={ICON.edit} alt="" className="icon-btn-img" />
                        Edit
                      </button>
                      <button
                        className="btn btn-sm d-inline-flex align-items-center gap-1"
                        style={{ borderRadius: '8px', padding: '4px 10px', fontSize: '0.78rem', background: 'rgba(192,57,43,0.08)', color: '#c0392b', border: 'none' }}
                        onClick={() => handleDelete(log.id)}
                      >
                        <img src={ICON.delete} alt="" className="icon-btn-img" style={{ opacity: 0.75 }} />
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={5} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No jumps logged in {viewTitle}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ MODAL ═══════════════════════════════════════════════ */}
      {showModal && (
        <div className="log-overlay" onClick={e => { if (e.target === e.currentTarget) closeModal(); }}>
          <div className="log-card">

            {modalMode === 'edit' ? (
              <>
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '6px', textAlign: 'center' }}>Edit Entry</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '22px' }}>Jump Rope</p>

                <div style={{ marginBottom: '14px' }}>
                  <label className="log-label">Event</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {EVENTS.map(ev => (
                      <button key={ev} type="button" className="cat-pill"
                        style={{ background: editEvent===ev?(COLORS[ev]||'#818263'):'rgba(255,255,255,0.45)', borderColor: editEvent===ev?(COLORS[ev]||'#818263'):'rgba(129,130,99,0.20)', color: editEvent===ev?'#fff':'var(--text-secondary)' }}
                        onClick={() => setEditEvent(ev)}>{ev}</button>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label className="log-label">Date</label>
                  <input type="date" className="log-input" value={editDate} onChange={e => setEditDate(e.target.value)} />
                </div>
                <div className="row g-2 mb-3">
                  <div className="col-6">
                    <label className="log-label">Reps</label>
                    <input type="number" className="log-input" value={editReps} onChange={e => setEditReps(e.target.value)} placeholder="0" />
                  </div>
                  <div className="col-6">
                    <label className="log-label">Duration (mins)</label>
                    <input type="number" className="log-input" value={editDuration} onChange={e => setEditDuration(e.target.value)} placeholder="0" />
                  </div>
                </div>
                <div style={{ marginBottom: '22px' }}>
                  <label className="log-label">Notes</label>
                  <input className="log-input" value={editNotes} onChange={e => setEditNotes(e.target.value)} placeholder="How did it feel?" />
                </div>
                <button className="btn btn-icegym w-100 mb-2" style={{ padding: '12px', borderRadius: '100px', fontWeight: 700 }} onClick={handleSaveEdit} disabled={isSaving || !editReps}>
                  {isSaving ? 'Saving...' : 'Update Entry'}
                </button>
                <button className="btn w-100" style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }} onClick={closeModal}>Cancel</button>
              </>
            ) : (
              <>
                <h2 style={{ fontWeight: 700, fontSize: '1.25rem', marginBottom: '4px', textAlign: 'center' }}>Log Jump Session</h2>
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem', marginBottom: '20px' }}>
                  Add all your events from this session in one go.
                </p>

                <div style={{ marginBottom: '18px' }}>
                  <label className="log-label">Session Date</label>
                  <input type="date" className="log-input" value={sessionDate} onChange={e => setSessionDate(e.target.value)} />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '12px' }}>
                  {entries.map((entry, idx) => (
                    <div key={entry.id} className="entry-card">
                      {entries.length > 1 && (
                        <button className="entry-remove-btn" onClick={() => removeEntry(entry.id)} type="button">✕ Remove</button>
                      )}
                      <p style={{ fontSize: '0.70rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                        Event {idx + 1}
                      </p>
                      <div style={{ marginBottom: '12px' }}>
                        <label className="log-label">Type</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                          {EVENTS.map(ev => (
                            <button key={ev} type="button" className="cat-pill"
                              style={{ background: entry.event===ev?(COLORS[ev]||'#818263'):'rgba(255,255,255,0.50)', borderColor: entry.event===ev?(COLORS[ev]||'#818263'):'rgba(129,130,99,0.18)', color: entry.event===ev?'#fff':'var(--text-secondary)', fontSize: '0.74rem', padding: '5px 10px' }}
                              onClick={() => updateEntry(entry.id, 'event', ev)}>{ev}</button>
                          ))}
                        </div>
                      </div>
                      {/* RESPONSIVE: col-12 on mobile, col-4 on larger */}
                      <div className="row g-2">
                        <div className="col-12 col-sm-4">
                          <label className="log-label">Reps *</label>
                          <input type="number" className="log-input" value={entry.reps} onChange={e => updateEntry(entry.id,'reps',e.target.value)} placeholder="0" />
                        </div>
                        <div className="col-12 col-sm-4">
                          <label className="log-label">Duration (m)</label>
                          <input type="number" className="log-input" value={entry.duration} onChange={e => updateEntry(entry.id,'duration',e.target.value)} placeholder="0" />
                        </div>
                        <div className="col-12 col-sm-4">
                          <label className="log-label">Notes</label>
                          <input className="log-input" value={entry.notes} onChange={e => updateEntry(entry.id,'notes',e.target.value)} placeholder="Optional" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button className="add-entry-btn mb-4" type="button" onClick={addEntry}>
                  + Add another event to this session
                </button>

                {entries.filter(e => e.reps).length > 0 && (
                  <div style={{ background: 'rgba(129,130,99,0.06)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                    Logging <strong style={{ color: 'var(--text-primary)' }}>{entries.filter(e=>e.reps).length}</strong> event{entries.filter(e=>e.reps).length > 1 ? 's' : ''} — total <strong style={{ color: 'var(--text-primary)' }}>{entries.filter(e=>e.reps).reduce((s,e)=>s+(Number(e.reps)||0),0).toLocaleString()}</strong> reps
                  </div>
                )}

                <button
                  className="btn btn-icegym w-100 mb-2"
                  style={{ padding: '13px', borderRadius: '100px', fontWeight: 700, fontSize: '0.95rem' }}
                  onClick={handleSaveSession}
                  disabled={isSaving || entries.every(e => !e.reps)}
                >
                  {isSaving ? 'Saving...' : `Save Session (${entries.filter(e=>e.reps).length} event${entries.filter(e=>e.reps).length!==1?'s':''})`}
                </button>
                <button className="btn w-100" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }} onClick={closeModal}>Cancel</button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default JumpRopeStats;