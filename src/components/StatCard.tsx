// We add bgColor and textColor to the blueprint so the pages are allowed to use them
interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  bgColor?: string;
  textColor?: string;
}

const StatCard = ({
  title,
  value,
  subtitle,
  bgColor = 'glass-card',
  textColor = '',
}: Props) => (
  <div
    className={`${bgColor} p-4 text-center h-100 d-flex flex-column justify-content-center`}
    style={{ borderRadius: '20px' }}
  >
    <p
      style={{
        fontSize: '0.70rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: 'var(--text-muted)',
        marginBottom: '8px',
      }}
    >
      {title}
    </p>
    <h2
      style={{
        fontSize: '2.2rem',
        fontWeight: 700,
        color: textColor ? undefined : 'var(--text-primary)',
        marginBottom: subtitle ? '4px' : 0,
        lineHeight: 1.1,
      }}
      className={textColor}
    >
      {value}
    </h2>
    {subtitle && (
      <small style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>
        {subtitle}
      </small>
    )}
  </div>
);

export default StatCard;