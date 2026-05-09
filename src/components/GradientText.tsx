import React from 'react';
import type { CSSProperties } from 'react';

interface GradientTextProps {
  children: React.ReactNode;
  colors?: string[];
  animationSpeed?: number;
  showBorder?: boolean;
  className?: string;
}

const GradientText = ({
  children,
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  animationSpeed = 8,
  showBorder = false,
  className = '',
}: GradientTextProps) => {
  const gradientStyle: CSSProperties = {
    backgroundImage: `linear-gradient(135deg, ${[...colors, colors[0]].join(', ')})`,
    backgroundSize: '300% 300%',
    animation: `gradientShift ${animationSpeed}s ease infinite`,
    WebkitBackgroundClip: 'text',
    backgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: 'transparent',
    display: 'inline-block',
    position: 'relative',
    zIndex: 2,
  };

  return (
    <>
      <style>{`
        @keyframes gradientShift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      <span
        className={`animated-gradient-text ${showBorder ? 'with-border' : ''} ${className}`}
        style={{ display: 'inline-block', position: 'relative', cursor: 'default' }}
      >
        {showBorder && (
          <span
            className="gradient-overlay"
            style={{
              position: 'absolute', inset: 0,
              borderRadius: 'inherit',
              background: `linear-gradient(135deg, ${[...colors, colors[0]].join(', ')})`,
              backgroundSize: '300% 300%',
              animation: `gradientShift ${animationSpeed}s ease infinite`,
              zIndex: 0,
              pointerEvents: 'none',
            }}
          />
        )}
        <span className="text-content" style={gradientStyle}>{children}</span>
      </span>
    </>
  );
};

export default GradientText;