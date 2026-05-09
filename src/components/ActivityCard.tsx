import React from 'react';

interface Props {
  id?: string;
  name: string;
  icon: any;
  color?: string;
  onClick?: () => void;
  onDelete?: (e: React.MouseEvent, name: string) => void;
}

const ActivityCard = ({ name, icon, color = 'glass-card', onClick, onDelete }: Props) => {
  return (
    <button
      onClick={onClick}
      className={`w-100 ${color} d-flex flex-column align-items-center justify-content-center`}
      style={{
        minHeight: '130px',
        border: 'none',
        position: 'relative',
        borderRadius: '20px',
        cursor: 'pointer',
        transition: 'transform 0.18s ease, box-shadow 0.18s ease',
        padding: '24px 16px',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(-3px)';
        (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(129,130,99,0.18)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
        (e.currentTarget as HTMLElement).style.boxShadow = '';
      }}
    >
      {/* Icon — image file or text/emoji */}
      <div style={{ fontSize: '1.8rem', marginBottom: '10px', lineHeight: 1 }}>
        {typeof icon === 'string' && (icon.includes('/') || icon.includes('.')) ? (
          <img
            src={icon}
            alt={`${name} icon`}
            style={{ width: '40px', height: '40px', objectFit: 'contain', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.10))' }}
          />
        ) : (
          <span>{icon}</span>
        )}
      </div>

      {/* Label */}
      <div style={{
        fontWeight: 600,
        fontSize: '0.88rem',
        letterSpacing: '0.01em',
        color: 'inherit',
      }}>
        {name}
      </div>

      {/* Delete badge */}
      {onDelete && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            if (onDelete) onDelete(e, name);
          }}
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: '#c0392b',
            color: '#fff',
            fontSize: '0.65rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(0,0,0,0.20)',
            lineHeight: 1,
          }}
        >
          ×
        </span>
      )}
    </button>
  );
};

export default ActivityCard;