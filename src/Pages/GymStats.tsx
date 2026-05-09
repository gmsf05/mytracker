import { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const PPL = {
  Push: { color: '#C7C9F4', dark: '#3d3a7a', label: 'Push' },
  Pull: { color: '#F5D6E7', dark: '#6b3060', label: 'Pull' },
  Legs: { color: '#DDE7F2', dark: '#2a4a6b', label: 'Legs' },
};

const TOOLTIP_STYLE = {
  borderRadius: '12px', border: '1px solid rgba(255,255,255,0.72)',
  background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(16px)',
  boxShadow: '0 4px 16px rgba(129,130,99,0.12)', fontFamily: 'Poppins, sans-serif', fontSize: '13px',
};

const getVolume = (log: any) => (log.weights || 0) * (log.reps || 0) * (log.sets || 0);

const buildMonthlyVolume = (logs: any[]) => {
  const map: Record<string, { name: string; Push: number; Pull: number; Legs: number }> = {};
  logs.forEach(log => {
    const mo = new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!map[mo]) map[mo] = { name: mo, Push: 0, Pull: 0, Legs: 0 };
    const cat = log.sub_activity as 'Push' | 'Pull' | 'Legs';
    if (cat in PPL) map[mo][cat] += getVolume(log);
  });
  return Object.values(map).reverse().slice(0, 6).reverse();
};

const GymStats = () => {
  const { user } = useAuth();
  const location = useLocation();

  const [gymLogs, setGymLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formCategory, setFormCategory] = useState<'Push' | 'Pull' | 'Legs'>('Push');
  const [formExercise, setFormExercise] = useState('');
  const [formWeight, setFormWeight] = useState('');
  const [formReps, setFormReps] = useState('');
  const [formSets, setFormSets] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (location.state?.action === 'openLog') {
      openNewForm();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => { fetchGymData(); }, [user]);

  const fetchGymData = async () => {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase.from('logs').select('*')
      .eq('activity_type', 'Gym').eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (!error && data) setGymLogs(data);
    setLoading(false);
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormCategory('Push'); setFormExercise(''); setFormWeight('');
    setFormReps(''); setFormSets(''); setFormNotes('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const openEditForm = (log: any) => {
    setEditingId(log.id);
    setFormCategory((log.sub_activity as 'Push' | 'Pull' | 'Legs') || 'Push');
    const noteParts = (log.notes || '').split(' — ');
    setFormExercise(noteParts[0] || '');
    setFormNotes(noteParts.slice(1).join(' — ') || '');
    setFormWeight(log.weights?.toString() || log.metric_value?.toString() || '');
    setFormReps(log.reps?.toString() || '');
    setFormSets(log.sets?.toString() || '');
    setFormDate(new Date(log.created_at).toISOString().split('T')[0]);
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditingId(null); };

  const handleSave = async () => {
    if (!formExercise.trim() || isSaving) return;
    setIsSaving(true);
    const payload = {
      activity_type: 'Gym',
      sub_activity: formCategory,
      metric_value: Number(formWeight) || 0,
      weights: Number(formWeight) || 0,
      reps: Number(formReps) || 0,
      sets: Number(formSets) || 0,
      notes: formExercise + (formNotes ? ` — ${formNotes}` : ''),
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
    if (!error) { closeForm(); await fetchGymData(); }
    else alert('Error saving: ' + error.message);
    setIsSaving(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this session?')) return;
    const { error } = await supabase.from('logs').delete().eq('id', id);
    if (!error) setGymLogs(prev => prev.filter(l => l.id !== id));
  };

  const totalVolume = { Push: 0, Pull: 0, Legs: 0 };
  const sessionCount = { Push: 0, Pull: 0, Legs: 0 };
  gymLogs.forEach(log => {
    const cat = log.sub_activity as 'Push' | 'Pull' | 'Legs';
    if (cat in PPL) { totalVolume[cat] += getVolume(log); sessionCount[cat] += 1; }
  });
  const grandTotal = totalVolume.Push + totalVolume.Pull + totalVolume.Legs;
  const pieData = Object.entries(PPL).map(([cat, meta]) => ({
    name: meta.label, value: totalVolume[cat as keyof typeof totalVolume], color: meta.color,
  })).filter(d => d.value > 0);
  const monthlyData = buildMonthlyVolume(gymLogs);

  if (loading) return <div className="container mt-5 text-center" style={{ color: 'var(--text-muted)' }}>Loading Gym Stats...</div>;

  return (
    <>
      <style>{`
        .ppl-badge { display:inline-block; padding:3px 10px; border-radius:100px; font-size:0.74rem; font-weight:700; letter-spacing:0.04em; }
        .ppl-stat { padding:20px 24px; border-radius:18px; display:flex; flex-direction:column; gap:4px; }
        /* ── RESPONSIVE MODAL: slides up from bottom on mobile ── */
        .gym-form-overlay {
          position:fixed; inset:0; z-index:200;
          background:rgba(58,56,48,0.22);
          backdrop-filter:blur(6px);
          display:flex; align-items:flex-end; justify-content:center;
          padding:0;
          animation:fadeIn 0.18s ease;
          overflow-y: auto;
        }
        @media (min-width: 481px) {
          .gym-form-overlay {
            align-items: center;
            padding: 24px;
          }
        }
        @keyframes fadeIn { from{opacity:0} to{opacity:1} }
        .gym-form-card {
          background:rgba(255,255,255,0.72);
          backdrop-filter:blur(28px);
          -webkit-backdrop-filter:blur(28px);
          border:1px solid rgba(255,255,255,0.85);
          border-radius:24px 24px 0 0;
          padding:28px 20px 24px;
          width:100%;
          box-shadow:0 20px 60px rgba(129,130,99,0.18);
          animation:slideUp 0.22s ease;
        }
        @media (min-width: 481px) {
          .gym-form-card {
            border-radius: 28px;
            padding: 40px 36px 32px;
            max-width: 480px;
          }
        }
        @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .gym-input {
          width:100%;
          background:rgba(255,255,255,0.60) !important;
          border:1px solid rgba(255,255,255,0.80) !important;
          border-radius:12px !important;
          padding:11px 14px;
          font-family:'Poppins',sans-serif;
          font-size:0.93rem;
          color:var(--text-primary);
          outline:none;
          transition:border-color 0.2s,box-shadow 0.2s;
        }
        .gym-input:focus { border-color:var(--winter-sky) !important; box-shadow:0 0 0 3px rgba(175,198,233,0.18) !important; }
        .cat-btn { flex:1; padding:9px 0; border-radius:10px; border:1.5px solid transparent; font-size:0.84rem; font-weight:600; cursor:pointer; transition:all 0.18s; font-family:'Poppins',sans-serif; }
        .gym-log-label { font-size:0.74rem; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; color:var(--text-muted); display:block; margin-bottom:6px; }

        /* Mobile: stack W/R/S fields */
        @media (max-width: 480px) {
          .gym-form-card .row.g-2 > .col-4 {
            flex: 0 0 100% !important;
            max-width: 100% !important;
          }
          .ppl-stat { padding: 14px 16px !important; }
        }
      `}</style>

      <div className="container mt-5 pb-5">
        <Link to="/dashboard" style={{ color: 'var(--winter-sky)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: '20px', filter: 'brightness(0.78)' }}>
          Back to Dashboard
        </Link>

        {/* ── HEADER ──────────────────────────────────────────── */}
        <div className="d-flex justify-content-between align-items-end mb-5 flex-wrap gap-3">
          <div>
            <h1 style={{ fontWeight: 700, fontSize: '1.9rem', marginBottom: '2px' }}>Gym — PPL Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: 0 }}>Push · Pull · Legs volume tracking & balance</p>
          </div>
          <button className="btn btn-icegym px-4" style={{ fontSize: '0.88rem' }} onClick={openNewForm}>
            Log Session
          </button>
        </div>

        {/* ── PPL BALANCE — responsive: col-12 col-md-4 ──────── */}
        <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '12px' }}>PPL Balance</p>
        <div className="row g-3 mb-4">
          {Object.entries(PPL).map(([cat, meta]) => {
            const vol = totalVolume[cat as keyof typeof totalVolume];
            const pct = grandTotal > 0 ? Math.round((vol / grandTotal) * 100) : 0;
            return (
              <div key={cat} className="col-12 col-md-4">
                <div className="ppl-stat glass-card" style={{ borderLeft: `4px solid ${meta.color}` }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="ppl-badge" style={{ background: meta.color, color: meta.dark }}>{meta.label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{sessionCount[cat as keyof typeof sessionCount]} sessions</span>
                  </div>
                  <div style={{ fontSize: '1.6rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1, marginTop: '8px' }}>
                    {vol.toLocaleString()}<span style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>kg·vol</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '100px', background: 'rgba(129,130,99,0.10)', marginTop: '10px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: meta.color, borderRadius: '100px', transition: 'width 0.6s ease' }} />
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>{pct}% of total volume</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── CHARTS — responsive: col-12 col-lg-8 / col-lg-4 ── */}
        <div className="row g-4 mb-5">
          <div className="col-12 col-lg-8">
            <div className="glass-card p-4 h-100">
              <h6 style={{ fontWeight: 600, marginBottom: '20px', fontSize: '0.88rem' }}>Volume Progression (Monthly)</h6>
              {monthlyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(129,130,99,0.08)" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(1)}k` : v} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Legend wrapperStyle={{ fontSize: '0.80rem', paddingTop: '12px' }} />
                    <Bar dataKey="Push" stackId="a" fill={PPL.Push.color} />
                    <Bar dataKey="Pull" stackId="a" fill={PPL.Pull.color} />
                    <Bar dataKey="Legs" stackId="a" fill={PPL.Legs.color} radius={[6,6,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log some sessions to see your progression.</div>
              )}
            </div>
          </div>
          <div className="col-12 col-lg-4">
            <div className="glass-card p-4 h-100">
              <h6 style={{ fontWeight: 600, marginBottom: '4px', textAlign: 'center', fontSize: '0.88rem' }}>Volume Split</h6>
              {pieData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={86} paddingAngle={4} dataKey="value" stroke="none">
                        {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [v.toLocaleString() + ' kg·vol', '']} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="d-flex flex-column gap-2 mt-1">
                    {pieData.map(d => (
                      <div key={d.name} className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
                          <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{d.name}</span>
                        </div>
                        <span style={{ fontSize: '0.80rem', color: 'var(--text-muted)' }}>{grandTotal > 0 ? Math.round((d.value / grandTotal) * 100) : 0}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No volume data yet.</div>
              )}
            </div>
          </div>
        </div>

        {/* ── LOGBOOK — horizontally scrollable on mobile ──────── */}
        <h5 style={{ fontWeight: 600, marginBottom: '16px', fontSize: '1rem' }}>Session Logbook</h5>
        <div className="glass-table" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <table className="table mb-0" style={{ minWidth: '600px' }}>
            <thead>
              <tr>
                <th className="ps-4">Date</th><th>Category</th><th>Exercise</th>
                <th>W × R × S</th><th>Volume</th>
                <th className="pe-4 text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {gymLogs.length > 0 ? gymLogs.map(log => {
                const cat = log.sub_activity as 'Push' | 'Pull' | 'Legs';
                const meta = PPL[cat];
                const vol = getVolume(log);
                const exerciseName = log.notes?.split(' — ')[0] || log.notes || '—';
                return (
                  <tr key={log.id}>
                    <td className="ps-4" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.88rem' }}>
                      {new Date(log.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </td>
                    <td>
                      {meta
                        ? <span className="ppl-badge" style={{ background: meta.color, color: meta.dark }}>{meta.label}</span>
                        : <span className="ppl-badge" style={{ background: 'var(--oat)', color: 'var(--text-secondary)' }}>{log.sub_activity || '—'}</span>}
                    </td>
                    <td style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{exerciseName}</td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                      {log.weights || log.reps || log.sets
                        ? `${log.weights ?? '?'}kg × ${log.reps ?? '?'} × ${log.sets ?? '?'}`
                        : <span style={{ opacity: 0.4 }}>—</span>}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                      {vol > 0 ? vol.toLocaleString() : <span style={{ opacity: 0.4, fontWeight: 400 }}>—</span>}
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
                );
              }) : (
                <tr><td colSpan={6} className="text-center py-5" style={{ color: 'var(--text-muted)' }}>No gym sessions logged yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ══ LOG / EDIT MODAL ════════════════════════════════════ */}
      {showForm && (
        <div className="gym-form-overlay" onClick={e => { if (e.target === e.currentTarget) closeForm(); }}>
          <div className="gym-form-card">
            <h2 style={{ fontWeight: 700, fontSize: '1.3rem', marginBottom: '8px', textAlign: 'center' }}>
              {editingId ? 'Edit Gym Session' : 'Log a Gym Session'}
            </h2>
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.84rem', marginBottom: '24px' }}>
              Push · Pull · Legs
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label className="gym-log-label">Category</label>
              <div className="d-flex gap-2">
                {(['Push', 'Pull', 'Legs'] as const).map(cat => (
                  <button key={cat} type="button" className="cat-btn"
                    style={{
                      background: formCategory === cat ? PPL[cat].color : 'rgba(255,255,255,0.40)',
                      borderColor: formCategory === cat ? PPL[cat].color : 'rgba(129,130,99,0.20)',
                      color: formCategory === cat ? PPL[cat].dark : 'var(--text-secondary)',
                    }}
                    onClick={() => setFormCategory(cat)}
                  >{cat}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="gym-log-label">Exercise Name</label>
              <input className="gym-input" value={formExercise} onChange={e => setFormExercise(e.target.value)} placeholder="e.g. Bench Press, Leg Press" />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label className="gym-log-label">Date</label>
              <input type="date" className="gym-input" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>

            {/* RESPONSIVE: col-12 on mobile, col-4 on larger screens */}
            <div className="row g-2 mb-3">
              <div className="col-12 col-sm-4">
                <label className="gym-log-label">Weight (kg)</label>
                <input type="number" className="gym-input" value={formWeight} onChange={e => setFormWeight(e.target.value)} placeholder="0" />
              </div>
              <div className="col-12 col-sm-4">
                <label className="gym-log-label">Reps</label>
                <input type="number" className="gym-input" value={formReps} onChange={e => setFormReps(e.target.value)} placeholder="0" />
              </div>
              <div className="col-12 col-sm-4">
                <label className="gym-log-label">Sets</label>
                <input type="number" className="gym-input" value={formSets} onChange={e => setFormSets(e.target.value)} placeholder="0" />
              </div>
            </div>

            {(formWeight || formReps || formSets) && (
              <div style={{ background: 'rgba(199,201,244,0.20)', borderRadius: '12px', padding: '10px 14px', marginBottom: '16px', fontSize: '0.84rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                Volume: <strong style={{ color: 'var(--text-primary)' }}>
                  {((Number(formWeight)||0) * (Number(formReps)||0) * (Number(formSets)||0)).toLocaleString()}
                </strong> kg·vol
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label className="gym-log-label">Notes (optional)</label>
              <input className="gym-input" value={formNotes} onChange={e => setFormNotes(e.target.value)} placeholder="e.g. felt strong today" />
            </div>

            <button
              className="btn btn-icegym w-100 mb-2"
              style={{ padding: '13px', fontSize: '0.95rem', borderRadius: '100px', fontWeight: 700 }}
              onClick={handleSave}
              disabled={isSaving || !formExercise.trim()}
            >{isSaving ? 'Saving...' : editingId ? 'Update Session' : 'Save Session'}</button>
            <button className="btn w-100" style={{ color: 'var(--text-muted)', fontSize: '0.88rem', fontWeight: 500 }} onClick={closeForm}>Cancel</button>
          </div>
        </div>
      )}
    </>
  );
};

export default GymStats;