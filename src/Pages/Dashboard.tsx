import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { fetchDashboardMetrics, type DashboardMetrics } from '../services/analyticsService';
import { format } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, CartesianGrid, ReferenceLine,
} from 'recharts';

import StatCard from '../components/StatCard';
import HighestMonthCard from '../components/HighestMonthCard';

/* ─── Assets ─────────────────────────────────────────────────── */
const ICON = {
  settings: '/src/assets/settings.png',
  edit:     '/src/assets/pencil.png',
  delete:   '/src/assets/delete.png',
  back:     '/src/assets/home.png',
};

/* ─── Constants ──────────────────────────────────────────────── */
const PIE_COLORS = ['#818263', '#C2C395', '#DDBAAE', '#C7C9F4', '#DCD4C1', '#F5D6E7'];

const TOOLTIP_STYLE = {
  borderRadius: '12px',
  border: '1px solid rgba(255,255,255,0.72)',
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 4px 16px rgba(129,130,99,0.12)',
  fontFamily: 'DM Sans, sans-serif',
  fontSize: '13px',
};

const ICON_STYLES: Record<string, { bg: string; color: string }> = {
  'Cheer':     { bg: 'linear-gradient(135deg,#C7C9F4,#F5D6E7)', color: '#3d3a7a' },
  'Jump Rope': { bg: 'linear-gradient(135deg,#DDBAAE,#EFD7CF)', color: '#6b3a30' },
  'Gym':       { bg: 'linear-gradient(135deg,#DDE7F2,#AFC6E9)', color: '#2a4a6b' },
  'Projects':  { bg: 'linear-gradient(135deg,#d4f1f4,#c4b5fd)', color: '#1a3040' },
};
const DEFAULT_ICON_STYLE = { bg: 'linear-gradient(135deg,#DCD4C1,#F6EAD4)', color: '#6b5a40' };

const ACTIVITY_SUBTITLES: Record<string, string> = {
  'Cheer':     'Vipers',
  'Jump Rope': 'SRPF, DU, freestyle & more',
  'Gym':       'Push · Pull · Legs',
  'Projects':  'Coding, learning & builds',
};

/* ─── Custom tooltips ────────────────────────────────────────── */
const AreaTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px' }}>
      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{label}</p>
      <p style={{ margin: '3px 0 0', color: 'var(--sage)', fontWeight: 600, fontSize: '0.88rem' }}>
        {payload[0].value} sessions
      </p>
    </div>
  );
};

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px' }}>
      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{label}</p>
      <p style={{ margin: '3px 0 0', color: '#6b72c4', fontWeight: 600, fontSize: '0.88rem' }}>
        {payload[0].value} sessions
      </p>
    </div>
  );
};

const PieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ ...TOOLTIP_STYLE, padding: '10px 14px' }}>
      <p style={{ margin: 0, fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.82rem' }}>{payload[0].name}</p>
      <p style={{ margin: '3px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
        {payload[0].value} sessions
      </p>
    </div>
  );
};

const SectionLabel = ({ children, hint }: { children: React.ReactNode; hint?: string }) => (
  <div className="d-flex align-items-baseline gap-2 mb-3">
    <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', margin: 0 }}>
      {children}
    </p>
    {hint && <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', opacity: 0.6 }}>{hint}</span>}
  </div>
);

const Ico = ({ src, size = 13 }: { src: string; size?: number }) => (
  <img src={src} alt="" style={{ width: size, height: size, objectFit: 'contain', opacity: 0.72, flexShrink: 0 }} />
);

/* ═══════════════════════════════════════════════════════════════ */
const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [subActivity, setSubActivity] = useState<string>('General');
  const [value, setValue] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [logDate, setLogDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [isCustom, setIsCustom] = useState(false);
  const [customName, setCustomName] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [userActivities, setUserActivities] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [refreshData, setRefreshData] = useState(0);

  const defaultActivities = [
    { id: 'cheer', name: 'Cheer',     icon: 'Ch', color: 'grad-cheer' },
    { id: 'jump',  name: 'Jump Rope', icon: 'JR', color: 'grad-jump' },
    { id: 'gym',   name: 'Gym',       icon: 'Gy', color: 'grad-gym' },
    { id: 'proj',  name: 'Projects',  icon: 'Pr', color: 'grad-proj' },
  ];

  const SPECIALISED = ['Cheer', 'Jump Rope', 'Gym'];

  useEffect(() => {
    if (location.state) {
      if (location.state.action === 'edit') {
        const { log } = location.state;
        if (!SPECIALISED.includes(log.activity_type)) {
          setSelectedActivity(log.activity_type);
          setSubActivity(log.sub_activity || 'General');
          setValue(log.metric_value?.toString() || '');
          setDuration(log.duration?.toString() || '');
          setNotes(log.notes || '');
          setLogDate(new Date(log.created_at).toISOString().split('T')[0]);
          setEditingId(log.id);
          setIsCustom(false);
        }
      } else if (location.state.action === 'newLog') {
        const name = location.state.activityName;
        if (!SPECIALISED.includes(name)) { setSelectedActivity(name); setIsCustom(false); setEditingId(null); }
      }
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      const { data: logData } = await supabase.from('logs').select('activity_type').eq('user_id', user.id);
      if (logData) {
        const uniqueNames = [...new Set(logData.map(log => log.activity_type))];
        const defaultNames = defaultActivities.map(a => a.name);
        const customOnly = uniqueNames.filter(name => !defaultNames.includes(name as string));
        setUserActivities(customOnly.map((name, index) => ({
          id: `custom-${index}`, name: name, icon: (name as string).slice(0, 2), color: 'grad-custom',
        })));
      }
      const dashboardStats = await fetchDashboardMetrics(user.id);
      setMetrics(dashboardStats);
    };
    loadDashboardData();
  }, [user, refreshData]);

  const allActivities = [
    ...defaultActivities, ...userActivities,
    { id: 'add-new-btn', name: 'Add New', icon: '+', color: 'grad-add' },
  ];

  const handleRowClick = (act: any) => {
    if (act.id === 'add-new-btn') { setIsCustom(true); setSelectedActivity(null); setEditingId(null); return; }
    if (act.name === 'Jump Rope') navigate('/jump-rope-stats');
    else if (act.name === 'Cheer') navigate('/cheer-stats');
    else if (act.name === 'Gym') navigate('/gym-stats');
    else navigate(`/activity/${encodeURIComponent(act.name)}`);
  };

  const handleQuickLog = (e: React.MouseEvent, act: any) => {
    e.stopPropagation();
    if (act.name === 'Jump Rope') navigate('/jump-rope-stats', { state: { action: 'openLog' } });
    else if (act.name === 'Cheer') navigate('/cheer-stats', { state: { action: 'openLog' } });
    else if (act.name === 'Gym') navigate('/gym-stats', { state: { action: 'openLog' } });
    else { setSelectedActivity(act.name); setIsCustom(false); setEditingId(null); setSubActivity('General'); }
  };

  const handleSave = async () => {
    if (!value || isSaving || (!selectedActivity && !customName)) return;
    setIsSaving(true);
    const finalActivity = selectedActivity || customName;
    const logDataToSave = {
      activity_type: finalActivity, sub_activity: subActivity,
      metric_value: Number(value), duration: Number(duration),
      notes, user_id: user?.id, created_at: new Date(logDate).toISOString(),
    };
    let error;
    if (editingId) { const { error: u } = await supabase.from('logs').update(logDataToSave).eq('id', editingId); error = u; }
    else { const { error: i } = await supabase.from('logs').insert([logDataToSave]); error = i; }
    if (!error) {
      setSelectedActivity(null); setIsCustom(false); setCustomName('');
      setValue(''); setDuration(''); setNotes(''); setEditingId(null);
      setRefreshData(p => p + 1);
      navigate(`/activity/${encodeURIComponent(finalActivity)}`);
    } else alert('Error saving: ' + error.message);
    setIsSaving(false);
  };

  const handleLogout = async () => { await supabase.auth.signOut(); navigate('/login'); };

  const currentName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'Athlete';
  const today = new Date();
  const hour = today.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const avgPerWeek = metrics
    ? (metrics.weekdayTrends.reduce((s: number, d: any) => s + d.total, 0) / 7).toFixed(1)
    : null;

  return (
    <>
      <style>{`
        .quick-log-btn {
          background: rgba(255,255,255,0.55); border: 1px solid rgba(255,255,255,0.80);
          border-radius: 100px; padding: 5px 14px; font-size: 0.76rem; font-weight: 700;
          color: var(--text-secondary); cursor: pointer;
          transition: background 0.15s, transform 0.15s;
          white-space: nowrap; font-family: 'Poppins', sans-serif;
          backdrop-filter: blur(8px); flex-shrink: 0;
        }
        .quick-log-btn:hover { background: rgba(255,255,255,0.80); transform: translateY(-1px); color: var(--text-primary); }
        .logout-btn {
          background: rgba(192,57,43,0.08); border: 1px solid rgba(192,57,43,0.18);
          border-radius: 100px; padding: 7px 18px; font-size: 0.82rem; font-weight: 600;
          color: #c0392b; cursor: pointer; font-family: 'Poppins', sans-serif;
          transition: background 0.15s, transform 0.15s;
        }
        .logout-btn:hover { background: rgba(192,57,43,0.14); transform: translateY(-1px); }
        .chart-caption {
          font-size: 0.74rem; color: var(--text-muted); margin-top: 10px;
          padding: 8px 12px; background: rgba(129,130,99,0.06);
          border-radius: 8px; line-height: 1.5;
        }
        .chart-caption strong { color: var(--text-secondary); }
        .dist-legend-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 6px 0; border-bottom: 1px solid rgba(129,130,99,0.08);
        }
        .dist-legend-item:last-child { border-bottom: none; }
        .milestone-type-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
        }
        .icon-btn-img { width: 13px; height: 13px; object-fit: contain; opacity: 0.68; }

        /* ── Mobile quick-log btn ── */
        @media (max-width: 480px) {
          .quick-log-btn { padding: 4px 10px; font-size: 0.70rem; }
        }
      `}</style>

      <div className="container mt-4 pb-5">
        {!selectedActivity && !isCustom ? (
          <>
            {/* ══ WELCOME HERO ════════════════════════════════ */}
            <div className="welcome-hero">
              <span className="welcome-date-chip">
                {today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <div className="d-flex justify-content-between align-items-start flex-wrap gap-3">
                <div>
                  <h1>{greeting},<br />{currentName}</h1>
                  <p className="welcome-sub">Track your progress, one session at a time.</p>
                </div>
                <div className="d-flex gap-2 align-self-center flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
                  <button className="btn-glass btn px-3 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.82rem' }} onClick={() => navigate('/analytics')}>
                    Data Ledger
                  </button>
                  <button className="btn-glass btn px-3 d-inline-flex align-items-center gap-1" style={{ fontSize: '0.82rem' }} onClick={() => navigate('/settings')}>
                    <Ico src={ICON.settings} />
                    Settings
                  </button>
                  <button className="logout-btn" onClick={handleLogout}>Sign Out</button>
                </div>
              </div>
              {metrics && (
                <div className="d-flex gap-3 mt-4 flex-wrap" style={{ position: 'relative', zIndex: 1 }}>
                  {[
                    { label: 'Sessions this year', value: metrics.totalSessions },
                    { label: 'Hours logged',        value: metrics.totalHours },
                    { label: 'Activities',           value: metrics.activityBreakdown.length },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.50)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: '14px', padding: '12px 20px', backdropFilter: 'blur(10px)', minWidth: '120px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>{item.value}</div>
                      <div style={{ fontSize: '0.70rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ══ ACTIVITY ROWS ════════════════════════════════ */}
            <SectionLabel>Your Activities</SectionLabel>
            <div className="d-flex flex-column gap-2 mb-5">
              {allActivities.map(act => {
                const isAdd = act.id === 'add-new-btn';
                const iconStyle = isAdd ? { bg: 'rgba(129,130,99,0.10)', color: 'var(--text-muted)' } : (ICON_STYLES[act.name] || DEFAULT_ICON_STYLE);
                const subtitle = ACTIVITY_SUBTITLES[act.name] || (isAdd ? 'Create a new activity type' : 'Custom activity');
                return (
                  <button key={act.id} className={`activity-row${isAdd ? ' activity-row-add' : ''}`} onClick={() => handleRowClick(act)}>
                    <div className="activity-row-icon" style={{ background: iconStyle.bg, color: iconStyle.color }}>{act.icon}</div>
                    <div className="flex-grow-1 text-start">
                      <div className="activity-row-label">{act.name}</div>
                      <div className="activity-row-sub">{subtitle}</div>
                    </div>
                    {!isAdd && <button className="quick-log-btn" onClick={e => handleQuickLog(e, act)}>+ Log</button>}
                    <div className="activity-row-arrow" style={{ marginLeft: isAdd ? 0 : '8px' }}>›</div>
                  </button>
                );
              })}
            </div>

            {metrics && (
              <>
                {/* ══ STAT CARDS ════════════════════════════════ */}
                <SectionLabel hint="— Jan 1 to today">Yearly Overview</SectionLabel>
                {/* RESPONSIVE: col-6 on mobile, col-md-3 on desktop */}
                <div className="row g-3 mb-5">
                  <div className="col-6 col-md-3"><StatCard title="Sessions (YTD)" value={metrics.totalSessions} bgColor="glass-card" /></div>
                  <div className="col-6 col-md-3"><StatCard title="Total Time" value={metrics.totalHours} subtitle="Hours" bgColor="glass-card" /></div>
                  <div className="col-6 col-md-3"><StatCard title="Categories" value={metrics.activityBreakdown.length} bgColor="glass-card" /></div>
                  <div className="col-6 col-md-3"><HighestMonthCard month={metrics.highestMonth.month} count={metrics.highestMonth.count} /></div>
                </div>

                {/* ══ TRENDS + DISTRIBUTION ════════════════════ */}
                <SectionLabel hint="— monthly session count">Activity Trends</SectionLabel>
                {/* RESPONSIVE: col-12 on mobile, col-lg-7 on large */}
                <div className="row g-4 mb-5">
                  <div className="col-12 col-lg-7">
                    <div className="glass-card p-4 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>Sessions per Month</h6>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>this year</span>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Each bar = total sessions logged that month across all activities.
                      </p>
                      <ResponsiveContainer width="100%" height={220}>
                        <AreaChart data={metrics.monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#818263" stopOpacity={0.30} />
                              <stop offset="95%" stopColor="#818263" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(129,130,99,0.08)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: 'sessions', angle: -90, position: 'insideLeft', offset: 14, style: { fontSize: '0.65rem', fill: 'var(--text-muted)' } }} />
                          <Tooltip content={<AreaTooltip />} />
                          <Area type="monotone" dataKey="total" stroke="#818263" strokeWidth={2.5} fill="url(#colorTotal)" dot={{ r: 3, fill: '#818263', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                        </AreaChart>
                      </ResponsiveContainer>
                      {metrics.monthlyTrends.length > 0 && (() => {
                        const peak = metrics.monthlyTrends.reduce((a: any, b: any) => b.total > a.total ? b : a, metrics.monthlyTrends[0]);
                        const last = metrics.monthlyTrends[metrics.monthlyTrends.length - 1];
                        const prev = metrics.monthlyTrends[metrics.monthlyTrends.length - 2];
                        const diff = prev ? last.total - prev.total : 0;
                        return (
                          <p className="chart-caption">
                            Peak month: <strong>{peak.name} ({peak.total} sessions)</strong>
                            {diff !== 0 && <> · Last month was <strong style={{ color: diff > 0 ? '#4a7c4d' : '#c0392b' }}>{diff > 0 ? `+${diff}` : diff} vs prior month</strong></>}
                          </p>
                        );
                      })()}
                    </div>
                  </div>

                  {/* RESPONSIVE: col-12 on mobile, col-lg-5 on large */}
                  <div className="col-12 col-lg-5">
                    <div className="glass-card p-4 h-100">
                      <h6 style={{ fontWeight: 600, fontSize: '0.88rem', marginBottom: '4px' }}>Activity Split</h6>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        How your sessions are distributed across activities.
                      </p>
                      <ResponsiveContainer width="100%" height={170}>
                        <PieChart>
                          <Pie data={metrics.activityBreakdown} innerRadius={52} outerRadius={76} paddingAngle={4} dataKey="value" stroke="none">
                            {metrics.activityBreakdown.map((_: any, index: number) => <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />)}
                          </Pie>
                          <Tooltip content={<PieTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ marginTop: '8px' }}>
                        {metrics.activityBreakdown.map((item: any, i: number) => {
                          const total = metrics.activityBreakdown.reduce((s: number, x: any) => s + x.value, 0);
                          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                          return (
                            <div key={item.name} className="dist-legend-item">
                              <div className="d-flex align-items-center gap-2">
                                <div className="milestone-type-dot" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{item.name}</span>
                              </div>
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: '0.80rem', color: 'var(--text-primary)', fontWeight: 700 }}>{item.value}</span>
                                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', minWidth: '32px', textAlign: 'right' }}>{pct}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* ══ WEEKLY RHYTHM + MILESTONES ═══════════════ */}
                <SectionLabel hint="— which days you train most">Weekly Rhythm</SectionLabel>
                {/* RESPONSIVE: col-12 on mobile, col-lg-8 on large */}
                <div className="row g-4">
                  <div className="col-12 col-lg-8">
                    <div className="glass-card p-4 h-100">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <h6 style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>Sessions by Day of Week</h6>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>all time</span>
                      </div>
                      <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                        Taller bars = days you train more often.
                      </p>
                      <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={metrics.weekdayTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(129,130,99,0.08)" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} label={{ value: 'sessions', angle: -90, position: 'insideLeft', offset: 14, style: { fontSize: '0.65rem', fill: 'var(--text-muted)' } }} />
                          <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(129,130,99,0.06)' }} />
                          {avgPerWeek && <ReferenceLine y={parseFloat(avgPerWeek)} stroke="rgba(129,130,99,0.35)" strokeDasharray="4 4" label={{ value: `avg ${avgPerWeek}`, position: 'right', style: { fontSize: '0.60rem', fill: 'var(--text-muted)' } }} />}
                          <Bar dataKey="total" fill="#C7C9F4" radius={[8,8,8,8]} barSize={32} />
                        </BarChart>
                      </ResponsiveContainer>
                      {avgPerWeek && (
                        <p className="chart-caption">
                          Average <strong>{avgPerWeek} sessions/day</strong> across the week.
                          The dashed line marks the average — bars above it are your most active days.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* RESPONSIVE: col-12 on mobile, col-lg-4 on large */}
                  <div className="col-12 col-lg-4">
                    <div className="glass-card p-4 h-100 glass-list">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 style={{ fontWeight: 600, fontSize: '0.88rem', margin: 0 }}>Recent Milestones</h6>
                        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>last 5 logs</span>
                      </div>
                      <div className="list-group list-group-flush">
                        {metrics.recentLogs.map((log: any, i: number) => (
                          <div key={log.id} className="list-group-item px-0 py-2 border-0">
                            <div className="d-flex justify-content-between align-items-start gap-2">
                              <div className="d-flex align-items-start gap-2" style={{ minWidth: 0 }}>
                                <div className="milestone-type-dot mt-1 flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.84rem', lineHeight: 1.3 }}>{log.activity_type}</div>
                                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                                    {format(new Date(log.created_at), 'MMM d, yyyy')}
                                  </div>
                                  {log.notes && (
                                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                                      "{log.notes}"
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                <span style={{ display: 'block', fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: 1.2 }}>
                                  {log.metric_value}
                                </span>
                                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>value</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(129,130,99,0.10)', fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                        Showing your 5 most recent entries across all activities.
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        ) : (
          /* ══ LOGGING FORM ═══════════════════════════════════ */
          /* RESPONSIVE: mx-auto + max-width is fine; glass-card p-5 is overridden in CSS */
          <div className="glass-card p-5 mx-auto" style={{ maxWidth: '520px', marginTop: '40px' }}>
            <h2 style={{ fontWeight: 700, textAlign: 'center', marginBottom: '28px', fontSize: '1.4rem' }}>
              {editingId ? `Edit ${selectedActivity}` : isCustom ? 'New Activity' : `Log ${selectedActivity}`}
            </h2>
            {isCustom && !selectedActivity && (
              <div className="mb-3">
                <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Activity Name</label>
                <input type="text" className="form-control form-control-lg glass-input" value={customName} onChange={e => setCustomName(e.target.value)} placeholder="e.g. Running, Yoga, Coding" />
              </div>
            )}
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Date</label>
              <input type="date" className="form-control form-control-lg glass-input" value={logDate} onChange={e => setLogDate(e.target.value)} />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Value</label>
              <input type="number" className="form-control form-control-lg glass-input" value={value} onChange={e => setValue(e.target.value)} placeholder="0" />
            </div>
            <div className="mb-3">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Duration (mins)</label>
              <input type="number" className="form-control form-control-lg glass-input" value={duration} onChange={e => setDuration(e.target.value)} placeholder="0" />
            </div>
            <div className="mb-4">
              <label className="form-label fw-semibold" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes</label>
              <textarea className="form-control glass-input" rows={3} value={notes} onChange={e => setNotes(e.target.value)} placeholder="How did it go?" />
            </div>
            <button className="btn btn-sage w-100 mb-2" style={{ padding: '12px', fontSize: '0.95rem' }} onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
            </button>
            <button className="btn w-100" style={{ color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.88rem' }} onClick={() => { setSelectedActivity(null); setIsCustom(false); setEditingId(null); setCustomName(''); }}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default Dashboard;