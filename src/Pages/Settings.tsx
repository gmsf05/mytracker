import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Settings = () => {
  const { user } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      const savedName = user.user_metadata?.display_name;
      const emailPrefix = user.email?.split('@')[0];
      setDisplayName(savedName || emailPrefix || '');
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setMessage(null);
    const { error } = await supabase.auth.updateUser({
      data: { display_name: displayName },
    });
    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Profile updated! Head back to the dashboard to see it.' });
    }
    setIsUpdating(false);
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .settings-wrap {
          min-height: 100vh;
          padding: 48px 20px 80px;
        }
        .settings-card {
          max-width: 500px;
          margin: 0 auto;
          animation: fadeUp 0.6s ease both;
        }
        .settings-section {
          background: rgba(255,255,255,0.50);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.75);
          border-radius: 24px;
          padding: 36px 36px 32px;
          box-shadow: 0 8px 32px rgba(129,130,99,0.09);
        }
        .settings-field-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 7px;
          display: block;
        }
        .settings-input {
          width: 100%;
          background: rgba(255,255,255,0.58) !important;
          border: 1px solid rgba(255,255,255,0.80) !important;
          border-radius: 12px !important;
          padding: 13px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.95rem;
          color: var(--text-primary) !important;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }
        .settings-input:focus {
          border-color: var(--sage) !important;
          box-shadow: 0 0 0 3px rgba(129,130,99,0.14) !important;
          background: rgba(255,255,255,0.80) !important;
        }
        .settings-input:disabled {
          background: rgba(255,255,255,0.30) !important;
          color: var(--text-muted) !important;
          cursor: not-allowed;
        }
        .settings-divider {
          height: 1px;
          background: rgba(129,130,99,0.12);
          margin: 28px 0;
        }
        .settings-save-btn {
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
          box-shadow: 0 6px 20px rgba(129,130,99,0.22);
          transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s;
        }
        .settings-save-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(129,130,99,0.30);
        }
        .settings-save-btn:disabled { opacity: 0.60; cursor: not-allowed; }
        .settings-alert {
          border-radius: 12px;
          padding: 12px 16px;
          font-size: 0.84rem;
          font-weight: 500;
          margin-bottom: 20px;
        }
        .settings-alert.success {
          background: rgba(194,195,149,0.25);
          border: 1px solid rgba(129,130,99,0.25);
          color: #4a4d30;
        }
        .settings-alert.error {
          background: rgba(192,57,43,0.08);
          border: 1px solid rgba(192,57,43,0.20);
          color: #7a2416;
        }
      `}</style>

      <div className="settings-wrap">
        <div className="settings-card">
          <Link
            to="/dashboard"
            style={{ color: 'var(--sage)', fontSize: '0.88rem', fontWeight: 600, textDecoration: 'none', display: 'inline-block', marginBottom: '28px' }}
          >
            Back to Dashboard
          </Link>

          <h1 style={{ fontWeight: 700, fontSize: '1.8rem', marginBottom: '6px' }}>Settings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '32px' }}>
            Manage your profile and preferences.
          </p>

          <div className="settings-section">
            {/* Account info */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Account
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label className="settings-field-label">Email Address</label>
              <input
                type="email"
                className="settings-input"
                value={user?.email || ''}
                disabled
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px', marginBottom: 0 }}>
                Your email cannot be changed here.
              </p>
            </div>

            <div className="settings-divider" />

            {/* Display name */}
            <p style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Profile
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label className="settings-field-label">Display Name</label>
              <input
                type="text"
                className="settings-input"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder=" "
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '5px', marginBottom: 0 }}>
                This is how your name appears on the dashboard.
              </p>
            </div>

            {message && (
              <div className={`settings-alert ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              className="settings-save-btn"
              onClick={handleUpdateProfile}
              disabled={isUpdating || !displayName}
            >
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;