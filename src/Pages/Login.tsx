import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SparkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l4 4M15 15l4 4M5 19l4-4M15 9l4-4" stroke="#e85a9c" strokeWidth="1.6" strokeLinecap="round"/>
  </svg>
);

const Login = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(
    location.pathname === '/register' ||
    (location.state as { mode?: string } | null)?.mode === 'signup'
  );
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  const handleDemoLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@mytracker.app',
      password: 'Demo1234!',
    });
    if (error) alert('Demo account not set up yet. Please check back soon!');
    else navigate('/dashboard');
    setLoading(false);
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (isSignUp) {
      if (!displayName.trim()) {
        alert('Please enter a display name so we know what to call you!');
        setLoading(false);
        return;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { display_name: displayName } },
      });
      if (error) alert(error.message);
      else alert('Check your email for the confirmation link!');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
      else navigate('/dashboard');
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        .login-wrap {
          --bg: #f6f4f1;
          --ink: #1a1a1c;
          --ink-2: #2c2c2f;
          --muted: #6b6770;
          --line: rgba(26,26,28,0.08);
          --card: #ffffff;
          --accent: #e85a9c;
          --radius-lg: 28px;
          --radius-md: 16px;
          --font-sans: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          --font-serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
          --shadow-btn: 0 1px 0 rgba(255,255,255,.18) inset,
                        0 8px 20px -8px rgba(74,63,92,.4);

          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background:
            radial-gradient(900px 600px at 110% -10%, rgba(245,179,212,0.18), transparent 60%),
            radial-gradient(800px 500px at -10% 110%, rgba(217,184,232,0.18), transparent 60%),
            var(--bg);
          color: var(--ink-2);
          font-family: var(--font-sans);
          font-size: 16px;
          line-height: 1.5;
          -webkit-font-smoothing: antialiased;
        }

        /* Nav */
        .login-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 32px;
          max-width: 680px;
          margin: 0 auto;
          width: 100%;
        }
        .login-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
        }
        .login-brand-mark {
          width: 28px; height: 28px;
          border-radius: 999px;
          background: linear-gradient(140deg, #f5b3d4, #d9b8e8);
          display: grid; place-items: center;
          box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 6px 16px -6px rgba(232,90,156,.55);
        }
        .login-brand-dot {
          width: 10px; height: 10px;
          border-radius: 999px;
          background: #fff;
        }
        .login-brand-name {
          font-family: var(--font-serif);
          font-size: 22px;
          letter-spacing: 0.01em;
          color: var(--ink);
        }

        /* Card */
        .login-body {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 20px 48px;
        }
        .login-card {
          width: 100%;
          max-width: 440px;
          background: var(--card);
          border-radius: var(--radius-lg);
          border: 1px solid var(--line);
          padding: 44px 40px 36px;
          box-shadow: 0 1px 0 rgba(255,255,255,.6) inset,
                      0 20px 60px -30px rgba(26,26,28,.18),
                      0 4px 14px -6px rgba(26,26,28,.06);
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* Card header */
        .login-card-header { display: flex; flex-direction: column; gap: 6px; }
        .login-card-title {
          margin: 0;
          font-family: var(--font-serif);
          font-size: 30px;
          font-weight: 400;
          color: var(--ink);
          line-height: 1.15;
        }
        .login-card-title .login-accent {
          font-style: italic;
          color: var(--accent);
        }
        .login-card-sub {
          margin: 0;
          font-size: 14px;
          color: var(--muted);
        }

        /* Form */
        .login-form { display: flex; flex-direction: column; gap: 16px; }
        .login-field { display: flex; flex-direction: column; gap: 6px; }
        .login-label {
          font-size: 11.5px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--muted);
        }
        .login-input {
          width: 100%;
          background: #fafafa;
          border: 1px solid rgba(26,26,28,0.12);
          border-radius: 12px;
          padding: 12px 16px;
          font-family: var(--font-sans);
          font-size: 15px;
          color: var(--ink);
          outline: none;
          transition: border-color .2s, box-shadow .2s;
          box-sizing: border-box;
        }
        .login-input:focus {
          border-color: rgba(232,90,156,0.45);
          box-shadow: 0 0 0 3px rgba(232,90,156,0.10);
          background: #fff;
        }
        .login-input::placeholder { color: rgba(107,103,112,0.55); }

        /* Primary button */
        .login-btn-primary {
          appearance: none; cursor: pointer;
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 15px 18px;
          border-radius: var(--radius-md);
          background: linear-gradient(135deg, #e85a9c 0%, #9b7fd4 55%, #7bafd4 100%);
          color: #fff;
          font-family: var(--font-sans);
          font-size: 15px; font-weight: 500;
          border: 0;
          box-shadow: 0 1px 0 rgba(255,255,255,.18) inset,
                      0 8px 24px -8px rgba(155,127,212,.55);
          transition: transform .12s ease, opacity .15s ease;
        }
        .login-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .login-btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

        /* Toggle */
        .login-toggle-row {
          text-align: center;
          font-size: 14px;
          color: var(--muted);
        }
        .login-toggle {
          appearance: none; border: 0; background: transparent; cursor: pointer;
          font: inherit; font-size: inherit;
          color: var(--ink);
          text-decoration: underline; text-underline-offset: 3px; padding: 0;
          transition: color .15s;
        }
        .login-toggle:hover { color: #000; }

        /* Divider */
        .login-divider {
          display: flex; align-items: center; gap: 14px;
        }
        .login-divider::before, .login-divider::after {
          content: ''; flex: 1; height: 1px;
          background: var(--line);
        }
        .login-divider span {
          font-size: 12px; color: var(--muted); white-space: nowrap;
        }

        /* Guest / demo button */
        .login-btn-guest {
          position: relative;
          appearance: none; border: 0;
          cursor: pointer; width: 100%;
          padding: 16px 18px 12px;
          border-radius: var(--radius-md);
          font-family: var(--font-sans); font-size: inherit;
          text-align: left;
          transition: transform .15s ease, box-shadow .2s ease;
          background: linear-gradient(180deg, #fff 0%, #fff7fb 100%);
          border: 1px solid rgba(232,90,156,0.25);
          box-shadow: 0 0 0 0 rgba(232,90,156,.2),
                      0 10px 28px -12px rgba(232,90,156,.40),
                      0 1px 0 rgba(255,255,255,.7) inset;
          overflow: hidden;
        }
        .login-btn-guest:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 0 4px rgba(232,90,156,.10),
                      0 14px 36px -14px rgba(232,90,156,.55),
                      0 1px 0 rgba(255,255,255,.7) inset;
        }
        .login-btn-guest:disabled { opacity: 0.65; cursor: not-allowed; }
        .login-btn-guest-glow {
          position: absolute;
          inset: -40% -10% auto -10%;
          height: 140%;
          background: radial-gradient(60% 60% at 50% 0%, rgba(245,179,212,.50), transparent 70%);
          pointer-events: none;
        }
        .login-btn-guest-inner {
          display: flex; align-items: center; gap: 10px;
          font-weight: 600; font-size: 15px;
          color: var(--ink); position: relative;
        }
        .login-btn-guest-inner > span { flex: 1; }
        .login-btn-guest-meta {
          display: block; margin-top: 4px;
          font-size: 11px; letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted); position: relative;
        }

        /* Footer */
        .login-foot {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; padding: 18px 24px 28px;
          font-size: 12px; color: var(--muted);
        }
        .login-foot-dot { opacity: .5; }

        @media (max-width: 520px) {
          .login-nav { padding: 18px 20px; }
          .login-card { padding: 32px 24px 28px; }
        }
      `}</style>

      <div className="login-wrap">
        <nav className="login-nav">
          <div className="login-brand" onClick={() => navigate('/')}>
            <div className="login-brand-mark"><span className="login-brand-dot" /></div>
            <span className="login-brand-name">mytracker</span>
          </div>
        </nav>

        <div className="login-body">
          <div className="login-card">
            {/* Header */}
            <div className="login-card-header">
              <h1 className="login-card-title">
                {isSignUp ? (
                  <>Let's get you <span className="login-accent">started.</span></>
                ) : (
                  <>Welcome <span className="login-accent">back.</span></>
                )}
              </h1>
              <p className="login-card-sub">
                {isSignUp ? 'Create an account to track your progress.' : 'Log in to see your progress.'}
              </p>
            </div>

            {/* Form */}
            <form className="login-form" onSubmit={handleAuth}>
              {isSignUp && (
                <div className="login-field">
                  <label className="login-label">Your Name</label>
                  <input
                    type="text"
                    className="login-input"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder="e.g. Gloria"
                    required={isSignUp}
                  />
                </div>
              )}
              <div className="login-field">
                <label className="login-label">Email</label>
                <input
                  type="email"
                  className="login-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="login-field">
                <label className="login-label">Password</label>
                <input
                  type="password"
                  className="login-input"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <button className="login-btn-primary" type="submit" disabled={loading} style={{ marginTop: '4px' }}>
                <span>{loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}</span>
                {!loading && <ArrowIcon />}
              </button>
            </form>

            {/* Toggle */}
            <p className="login-toggle-row">
              {isSignUp ? 'Already have an account? ' : 'New here? '}
              <button
                type="button"
                className="login-toggle"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  navigate(isSignUp ? '/login' : '/register', { replace: true });
                }}
              >
                {isSignUp ? 'Sign in instead' : 'Create an account'}
              </button>
            </p>

            {/* Divider + Demo */}
            <div>
              <div className="login-divider" style={{ marginBottom: '16px' }}>
                <span>or explore without an account</span>
              </div>
              <button
                type="button"
                className="login-btn-guest"
                onClick={handleDemoLogin}
                disabled={loading}
              >
                <span className="login-btn-guest-glow" aria-hidden="true" />
                <div className="login-btn-guest-inner">
                  <SparkIcon />
                  <span>{loading ? 'Loading demo...' : 'Try without an account'}</span>
                  <ArrowIcon />
                </div>
                <span className="login-btn-guest-meta">No sign-up · Demo data</span>
              </button>
            </div>
          </div>
        </div>

        <footer className="login-foot">
          <span>© 2026 mytracker</span>
          <span className="login-foot-dot">·</span>
          <span>quiet progress, every day</span>
        </footer>
      </div>
    </>
  );
};

export default Login;
