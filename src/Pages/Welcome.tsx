import { useNavigate } from 'react-router-dom';
import GradientText from '../components/GradientText';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`
        @keyframes bgDrift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .welcome-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          background: linear-gradient(
            135deg,
            #F5F8FF 0%,
            #EFD7CF 18%,
            #C7C9F4 36%,
            #F5D6E7 52%,
            #DDE7F2 68%,
            #d8d7ffff 84%,
            #F6EAD4 100%
          );
          background-size: 400% 400%;
          animation: bgDrift 14s ease infinite;
        }
        .welcome-pill {
          display: inline-block;
          background: rgba(255,255,255,0.50);
          border: 1px solid rgba(255,255,255,0.80);
          backdrop-filter: blur(10px);
          border-radius: 100px;
          padding: 5px 18px;
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-secondary);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 24px;
          animation: fadeUp 0.7s ease both;
        }
        .welcome-headline {
          font-size: clamp(2.6rem, 8vw, 5rem);
          font-weight: 700;
          line-height: 1.08;
          margin-bottom: 20px;
          animation: fadeUp 0.8s 0.1s ease both;
          font-family: 'Playfair Display', serif;
        }
        .welcome-sub {
          font-size: 1.05rem;
          color: var(--text-secondary);
          max-width: 420px;
          margin: 0 auto 40px;
          line-height: 1.65;
          animation: fadeUp 0.8s 0.2s ease both;
        }
        .welcome-cta {
          animation: fadeUp 0.8s 0.3s ease both;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .welcome-btn-primary {
          background: linear-gradient(135deg, #f2e6d8, #f6c7cf);
          color: #303257ff;
          border: none;
          border-radius: 100px;
          padding: 14px 38px;
          font-size: 0.95rem;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          box-shadow: 0 6px 24px rgba(180, 242, 252, 0.28);
          transition: transform 0.18s ease, box-shadow 0.18s ease;
          letter-spacing: 0.01em;
        }
        .welcome-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 32px rgba(220, 210, 255, 0.35);
        }
        .welcome-btn-ghost {
          background: rgba(255,255,255,0.50);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.80);
          border-radius: 100px;
          padding: 14px 38px;
          font-size: 0.95rem;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: var(--text-primary);
          cursor: pointer;
          transition: background 0.18s ease, transform 0.18s ease;
        }
        .welcome-btn-ghost:hover {
          background: rgba(255,255,255,0.70);
          transform: translateY(-2px);
        }
        .welcome-features {
          display: flex;
          gap: 10px;
          margin-top: 60px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeUp 0.8s 0.45s ease both;
        }
        .welcome-feature-chip {
          background: rgba(255,255,255,0.45);
          border: 1px solid rgba(255,255,255,0.75);
          backdrop-filter: blur(10px);
          border-radius: 12px;
          padding: 10px 18px;
          font-size: 0.82rem;
          font-weight: 500;
          color: var(--text-secondary);
        }
      `}</style>

      <div className="welcome-page">
        <span className="welcome-pill">Your personal training log</span>

        <h1 className="welcome-headline">
          <GradientText
            colors={[ '#C7C9F4', '#F8AFCF', '#AFC6E9']}
            animationSpeed={8}
            showBorder={false}
          >
            Track Your Progress.
          </GradientText>
        </h1>

        <p className="welcome-sub">
          Log Cheer, Jump Rope, Gym, and custom activities — all in one beautiful place.
        </p>

        <div className="welcome-cta">
          <button className="welcome-btn-primary" onClick={() => navigate('/login')}>
            Get Started
          </button>
          <button className="welcome-btn-ghost" onClick={() => navigate('/login')}>
            Sign In
          </button>
        </div>

        <div className="welcome-features">
          {['Cheer', 'Jump Rope', 'PPL Gym', 'Custom Activities', 'Analytics'].map(f => (
            <span key={f} className="welcome-feature-chip">{f}</span>
          ))}
        </div>
      </div>
    </>
  );
};

export default Welcome;