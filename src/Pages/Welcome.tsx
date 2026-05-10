import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

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

const DotIcon = ({ color = 'white' }: { color?: string }) => (
  <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
    <circle cx="4" cy="4" r="3" fill={color}/>
  </svg>
);

function Bloom() {
  return (
    <div className="lp-bloom">
      <div className="lp-bloom-rings">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className="lp-bloom-ring"
            style={{ width: `${60 + i * 50}px`, height: `${60 + i * 50}px`, animationDelay: `${i * 0.4}s` }}
          />
        ))}
      </div>
      <svg className="lp-bloom-glyph" width="88" height="88" viewBox="0 0 64 64" fill="none">
        <defs>
          <filter id="bloom-soft" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="1.2"/>
          </filter>
        </defs>
        <g filter="url(#bloom-soft)">
          <path d="M32 8c4 0 7 3.5 7 8 4-2 9 0 11 4s.5 9-3 11c2 4 0 9-4 11s-9 .5-11-3c-2 4-7 5-11 3s-5-7-3-11c-4-2-5-7-3-11s7-5 11-3c0-4.5 3-8 7-8z" fill="#fff"/>
          <circle cx="32" cy="32" r="6" fill="rgba(232,90,156,.2)"/>
        </g>
      </svg>
    </div>
  );
}

const Welcome = () => {
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemo = async () => {
    setDemoLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: 'demo@mytracker.app',
      password: 'Demo1234!',
    });
    if (error) alert('Demo account not set up yet. Check back soon!');
    else navigate('/dashboard');
    setDemoLoading(false);
  };

  return (
    <>
      <style>{`
        .lp-wrap {
          --bg: #f6f4f1;
          --bg-soft: #fbf9f6;
          --ink: #1a1a1c;
          --ink-2: #2c2c2f;
          --muted: #6b6770;
          --line: rgba(26,26,28,0.08);
          --line-2: rgba(26,26,28,0.14);
          --card: #ffffff;
          --accent: #e85a9c;
          --radius-lg: 28px;
          --radius-md: 16px;
          --font-sans: 'Poppins', 'Helvetica Neue', Helvetica, Arial, sans-serif;
          --font-serif: 'Instrument Serif', Georgia, 'Times New Roman', serif;
          --shadow-card: 0 1px 0 rgba(255,255,255,.6) inset,
                         0 30px 80px -30px rgba(180,130,170,0.35),
                         0 8px 24px -10px rgba(26,26,28,.08);
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

        /* ── Nav ─────────────────────────────────────────────── */
        .lp-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 22px 32px;
          max-width: 1320px;
          margin: 0 auto;
          width: 100%;
        }
        .lp-brand {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-brand-mark {
          width: 28px; height: 28px;
          border-radius: 999px;
          background: linear-gradient(140deg, #f5b3d4, #d9b8e8);
          display: grid; place-items: center;
          box-shadow: 0 1px 0 rgba(255,255,255,.7) inset, 0 6px 16px -6px rgba(232,90,156,.55);
        }
        .lp-brand-dot {
          width: 10px; height: 10px;
          border-radius: 999px;
          background: #fff;
        }
        .lp-brand-name {
          font-family: var(--font-serif);
          font-size: 22px;
          letter-spacing: 0.01em;
          color: var(--ink);
        }
        .lp-nav-signin {
          appearance: none;
          border: 0; background: transparent; cursor: pointer;
          font-family: var(--font-sans); font-size: 14px;
          color: var(--ink);
          text-decoration: underline;
          text-underline-offset: 3px;
          padding: 0;
          transition: color .15s;
        }
        .lp-nav-signin:hover { color: #000; }

        /* ── Frame (split on desktop) ────────────────────────── */
        .lp-frame {
          flex: 1;
          display: grid;
          gap: 28px;
          padding: 16px 32px 40px;
          max-width: 1320px;
          margin: 0 auto;
          width: 100%;
          grid-template-columns: 1fr;
        }
        @media (min-width: 920px) {
          .lp-frame {
            grid-template-columns: 1.1fr 0.9fr;
            align-items: stretch;
            gap: 36px;
            padding: 8px 32px 56px;
          }
        }

        /* ── Hero card ───────────────────────────────────────── */
        .lp-hero {
          position: relative;
          border-radius: var(--radius-lg);
          overflow: hidden;
          min-height: 560px;
          padding: 44px 36px 36px;
          color: #1a1a1c;
          box-shadow: var(--shadow-card);
          isolation: isolate;
          background:
            radial-gradient(120% 80% at 80% 100%, #f5b3d4 0%, transparent 55%),
            radial-gradient(110% 90% at 20% 100%, #d9b8e8 0%, transparent 60%),
            linear-gradient(180deg, #fce0ec 0%, #f5b3d4 60%, #d9b8e8 100%);
        }
        .lp-hero::before {
          content: "";
          position: absolute; inset: 0;
          background: radial-gradient(60% 50% at 50% 60%, rgba(255,255,255,.55), transparent 70%);
          pointer-events: none;
        }
        .lp-hero::after {
          content: "";
          position: absolute; inset: 1px;
          border-radius: inherit;
          border: 1px solid rgba(255,255,255,.55);
          pointer-events: none;
        }
        .lp-hero-inner {
          position: relative; z-index: 1;
          display: flex; flex-direction: column;
          height: 100%; min-height: inherit;
        }
        .lp-hero-head { text-align: center; }
        .lp-hero-h1 {
          margin: 0;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: clamp(34px, 4.4vw, 54px);
          line-height: 1.06;
          letter-spacing: -0.02em;
          color: #1a1a1c;
        }
        .lp-hero-h1 .lp-accent {
          font-family: var(--font-serif);
          font-style: italic;
          font-weight: 400;
          letter-spacing: -0.01em;
          color: var(--accent);
        }
        .lp-hero-eyebrow {
          margin: 18px 0 0;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: rgba(26,26,28,.55);
        }
        .lp-hero-mid {
          flex: 1;
          display: grid;
          place-items: center;
          position: relative;
          padding: 36px 0 24px;
        }
        .lp-hero-body {
          margin: 0 auto;
          max-width: 38ch;
          text-align: center;
          font-size: 14.5px;
          line-height: 1.55;
          color: rgba(26,26,28,.72);
        }

        /* ── Bloom ───────────────────────────────────────────── */
        .lp-bloom {
          position: relative;
          width: 220px; height: 220px;
          display: grid; place-items: center;
        }
        .lp-bloom-rings {
          position: absolute; inset: 0;
          display: grid; place-items: center;
        }
        .lp-bloom-ring {
          position: absolute;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.55);
          background: radial-gradient(circle, rgba(255,255,255,.18), transparent 70%);
          animation: lp-bloom-pulse 5s ease-in-out infinite;
        }
        @keyframes lp-bloom-pulse {
          0%, 100% { transform: scale(1); opacity: .55; }
          50% { transform: scale(1.05); opacity: .9; }
        }
        .lp-bloom-glyph {
          position: relative;
          filter: drop-shadow(0 6px 18px rgba(255,255,255,.6));
        }
        .lp-hero-pill {
          position: absolute;
          bottom: -8px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          font-size: 12.5px;
          color: #fff;
          background: rgba(26,26,28,.28);
          backdrop-filter: blur(10px);
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,.35);
        }

        /* ── CTA panel ───────────────────────────────────────── */
        .lp-cta {
          background: var(--card);
          border-radius: var(--radius-lg);
          padding: 36px 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 22px;
          box-shadow: 0 1px 0 rgba(255,255,255,.6) inset,
                      0 20px 60px -30px rgba(26,26,28,.18),
                      0 4px 14px -6px rgba(26,26,28,.06);
          border: 1px solid var(--line);
        }
        .lp-cta-copy { display: flex; flex-direction: column; gap: 10px; }
        .lp-cta-h2 {
          margin: 0;
          font-size: clamp(24px, 2.4vw, 30px);
          font-weight: 600;
          letter-spacing: -0.015em;
          color: var(--ink);
          line-height: 1.15;
        }
        .lp-cta-sub {
          margin: 0;
          font-size: 14.5px;
          color: var(--muted);
          max-width: 38ch;
        }
        .lp-cta-stack { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }

        /* Guest / demo button */
        .lp-btn-guest {
          position: relative;
          appearance: none; border: 0;
          cursor: pointer; width: 100%;
          padding: 18px 18px 14px;
          border-radius: var(--radius-md);
          font-family: var(--font-sans); font-size: inherit;
          text-align: left;
          transition: transform .15s ease, box-shadow .2s ease;
          background: linear-gradient(180deg, #fff 0%, #fff7fb 100%);
          border: 1px solid rgba(232,90,156,0.25);
          box-shadow: 0 0 0 0 rgba(232,90,156,.2),
                      0 12px 30px -14px rgba(232,90,156,.45),
                      0 1px 0 rgba(255,255,255,.7) inset;
          overflow: hidden;
        }
        .lp-btn-guest:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 0 0 4px rgba(232,90,156,.10),
                      0 14px 36px -14px rgba(232,90,156,.55),
                      0 1px 0 rgba(255,255,255,.7) inset;
        }
        .lp-btn-guest:disabled { opacity: 0.65; cursor: not-allowed; }
        .lp-btn-guest-glow {
          position: absolute;
          inset: -40% -10% auto -10%;
          height: 140%;
          background: radial-gradient(60% 60% at 50% 0%, rgba(245,179,212,.55), transparent 70%);
          pointer-events: none;
        }
        .lp-btn-guest-inner {
          display: flex; align-items: center; gap: 10px;
          font-weight: 600; font-size: 15.5px;
          color: var(--ink); position: relative;
        }
        .lp-btn-guest-inner > span { flex: 1; }
        .lp-btn-guest-meta {
          display: block; margin-top: 4px;
          font-size: 11.5px; letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--muted); position: relative;
        }

        /* Primary button — warm dark purple, NOT black */
        .lp-btn-primary {
          appearance: none; cursor: pointer;
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 10px;
          padding: 16px 18px;
          border-radius: var(--radius-md);
          background: #4a3f5c;
          color: #fff;
          font-family: var(--font-sans);
          font-size: 15px; font-weight: 500;
          border: 0;
          box-shadow: var(--shadow-btn);
          transition: transform .12s ease, background .15s ease;
        }
        .lp-btn-primary:hover { background: #3a3049; transform: translateY(-1px); }

        .lp-cta-signin {
          margin: 4px 0 0; text-align: center;
          font-size: 14px; color: var(--muted);
        }
        .lp-link {
          appearance: none; border: 0; background: transparent; cursor: pointer;
          font: inherit; font-size: inherit;
          color: var(--ink);
          text-decoration: underline; text-underline-offset: 3px; padding: 0;
        }
        .lp-link:hover { color: #000; }
        .lp-cta-fine {
          margin: auto 0 0; font-size: 11.5px;
          color: var(--muted); text-align: center;
        }

        /* ── Footer ──────────────────────────────────────────── */
        .lp-foot {
          display: flex; align-items: center; justify-content: center;
          gap: 14px; padding: 22px 24px 28px;
          font-size: 12.5px; color: var(--muted);
        }
        .lp-foot-dot { opacity: .5; }

        /* ── Responsive ──────────────────────────────────────── */
        @media (max-width: 720px) {
          .lp-nav { padding: 18px 20px; }
          .lp-frame { padding: 8px 16px 32px; gap: 20px; }
          .lp-hero { padding: 32px 24px 28px; min-height: 480px; }
          .lp-cta { padding: 26px 22px 22px; }
          .lp-bloom { width: 180px; height: 180px; }
          .lp-bloom-glyph { width: 72px; height: 72px; }
        }
        @media (min-width: 920px) {
          .lp-hero { min-height: 640px; }
          .lp-cta { padding: 44px 38px 32px; }
        }
      `}</style>

      <div className="lp-wrap">
        {/* ── Nav ─────────────────────────────────────────────── */}
        <nav className="lp-nav">
          <div className="lp-brand">
            <div className="lp-brand-mark"><span className="lp-brand-dot" /></div>
            <span className="lp-brand-name">mytracker</span>
          </div>
          <button className="lp-nav-signin" onClick={() => navigate('/login')}>Sign in</button>
        </nav>

        {/* ── Split frame ──────────────────────────────────────── */}
        <main className="lp-frame">

          {/* Hero gradient card */}
          <div className="lp-hero">
            <div className="lp-hero-inner">
              <div className="lp-hero-head">
                <h1 className="lp-hero-h1">
                  You showed up.<br />
                  <span className="lp-accent">Now let's keep going.</span>
                </h1>
                <p className="lp-hero-eyebrow">Let's make it easier to keep going</p>
              </div>

              <div className="lp-hero-mid">
                <Bloom />
                <div className="lp-hero-pill">
                  <DotIcon color="#fff" />
                  <span>Just 1 minute a day</span>
                </div>
              </div>

              <p className="lp-hero-body">
                A quiet fitness tracker that rewards consistency, not streaks.
              </p>
            </div>
          </div>

          {/* CTA panel */}
          <div className="lp-cta">
            <div className="lp-brand">
              <div className="lp-brand-mark"><span className="lp-brand-dot" /></div>
              <span className="lp-brand-name">mytracker</span>
            </div>

            <div className="lp-cta-copy">
              <h2 className="lp-cta-h2">Track the showing-up,<br />not the streak.</h2>
              <p className="lp-cta-sub">
                Log Cheer, Jump Rope, Gym, and custom activities. Nothing resets if you miss one.
              </p>
            </div>

            <div className="lp-cta-stack">
              {/* Demo / guest button */}
              <button className="lp-btn-guest" onClick={handleDemo} disabled={demoLoading}>
                <span className="lp-btn-guest-glow" aria-hidden="true" />
                <div className="lp-btn-guest-inner">
                  <SparkIcon />
                  <span>{demoLoading ? 'Loading demo...' : 'Try without an account'}</span>
                  <ArrowIcon />
                </div>
                <span className="lp-btn-guest-meta">No sign-up · Demo data</span>
              </button>

              {/* Create account */}
              <button className="lp-btn-primary" onClick={() => navigate('/login')}>
                <span>Create account</span>
                <ArrowIcon />
              </button>

              <p className="lp-cta-signin">
                Already with us?{' '}
                <button className="lp-link" onClick={() => navigate('/login')}>Sign in</button>
              </p>
            </div>

            <p className="lp-cta-fine">
              Track your progress, one session at a time.
            </p>
          </div>
        </main>

        {/* ── Footer ───────────────────────────────────────────── */}
        <footer className="lp-foot">
          <span>© 2026 mytracker</span>
          <span className="lp-foot-dot">·</span>
          <span>quiet progress, every day</span>
        </footer>
      </div>
    </>
  );
};

export default Welcome;
