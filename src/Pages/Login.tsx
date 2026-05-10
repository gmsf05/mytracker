import { useState } from 'react';
import { supabase } from '../services/supabase';
import { useNavigate } from 'react-router-dom';
import GradientText from '../components/GradientText';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleAuth = async (e: React.FormEvent) => {
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
        @keyframes bgDrift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          background: linear-gradient(
            135deg,
            #F5F8FF 0%,
            #EFD7CF 20%,
            #C7C9F4 40%,
            #F5D6E7 58%,
            #DDE7F2 76%,
            #F6EAD4 100%
          );
          background-size: 400% 400%;
          animation: bgDrift 14s ease infinite;
        }
        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.52);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255,255,255,0.78);
          border-radius: 28px;
          padding: 48px 44px 40px;
          box-shadow: 0 16px 56px rgba(129,130,99,0.12);
          animation: fadeUp 0.7s ease both;
        }
        .login-title {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 6px;
          text-align: center;
        }
        .login-sub {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-align: center;
          margin-bottom: 36px;
        }
        .login-label {
          font-size: 0.78rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--text-secondary);
          margin-bottom: 6px;
          display: block;
        }
        .login-input {
          width: 100%;
          background: rgba(255,255,255,0.60) !important;
          border: 1px solid rgba(255,255,255,0.80) !important;
          border-radius: 12px !important;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: var(--text-primary) !important;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .login-input:focus {
          border-color: var(--sage) !important;
          box-shadow: 0 0 0 3px rgba(129,130,99,0.14) !important;
          background: rgba(255,255,255,0.80) !important;
        }
        .login-input::placeholder { color: var(--text-muted); }
        .login-btn {
          width: 100%;
          background: linear-gradient(135deg, var(--sage) 0%, var(--avocado) 100%);
          color: #fff;
          border: none;
          border-radius: 100px;
          padding: 14px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 6px 20px rgba(129,130,99,0.25);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s;
          letter-spacing: 0.01em;
          margin-top: 8px;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(129,130,99,0.32);
        }
        .login-btn:disabled { opacity: 0.65; cursor: not-allowed; }
        .login-toggle {
          background: none;
          border: none;
          color: var(--sage);
          font-size: 0.84rem;
          font-weight: 600;
          cursor: pointer;
          text-decoration: underline;
          text-underline-offset: 2px;
          font-family: 'DM Sans', sans-serif;
          padding: 0;
          transition: color 0.15s;
        }
        .login-toggle:hover { color: #6e6f52; }
        .login-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0 20px;
        }
        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(129,130,99,0.15);
        }
        .login-divider span {
          font-size: 0.75rem;
          color: var(--text-muted);
          font-weight: 500;
          white-space: nowrap;
        }
        .demo-btn {
          width: 100%;
          background: rgba(175,198,233,0.18);
          color: var(--text-secondary);
          border: 1.5px dashed rgba(175,198,233,0.60);
          border-radius: 100px;
          padding: 13px;
          font-size: 0.90rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.18s, border-color 0.18s;
          letter-spacing: 0.01em;
        }
        .demo-btn:hover:not(:disabled) {
          background: rgba(175,198,233,0.30);
          border-color: rgba(175,198,233,0.90);
        }
        .demo-btn:disabled { opacity: 0.65; cursor: not-allowed; }
      `}</style>

      <div className="login-page">
        <div className="login-card">
          <div className="login-title">
            {isSignUp ? (
              <GradientText
                colors={['#818263', '#C7C9F4', '#F8AFCF', '#818263']}
                animationSpeed={8}
              >
                Create Account
              </GradientText>
            ) : (
              <GradientText
                colors={['#818263', '#AFC6E9', '#C7C9F4', '#818263']}
                animationSpeed={8}
              >
                Welcome Back
              </GradientText>
            )}
          </div>
          <p className="login-sub">
            {isSignUp
              ? 'Start tracking your activities today.'
              : 'Log in to see your progress.'}
          </p>

          <form onSubmit={handleAuth}>
            {isSignUp && (
              <div style={{ marginBottom: '18px' }}>
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

            <div style={{ marginBottom: '18px' }}>
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

            <div style={{ marginBottom: '8px' }}>
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

            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="login-divider">
            <span>{isSignUp ? 'Already have an account?' : 'New here?'}</span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              className="login-toggle"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? 'Sign in instead' : 'Create an account'}
            </button>
          </div>

          <div className="login-divider" style={{ marginTop: '28px' }}>
            <span>or explore without an account</span>
          </div>

          <button
            type="button"
            className="demo-btn"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Try Demo
          </button>
        </div>
      </div>
    </>
  );
};

export default Login;