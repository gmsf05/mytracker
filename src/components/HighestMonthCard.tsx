interface HighestMonthCardProps {
  month: string;
  count: number;
}

const HighestMonthCard = ({ month, count }: HighestMonthCardProps) => {
  return (
    <div
      className="h-100 d-flex flex-column justify-content-center p-4 text-center"
      style={{
        background: 'linear-gradient(135deg, var(--sage) 0%, var(--avocado) 100%)',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-soft)',
      }}
    >
      <p
        style={{
          fontSize: '0.70rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'rgba(255,255,255,0.70)',
          marginBottom: '8px',
        }}
      >
        Peak Month
      </p>
      <h2
        style={{
          fontSize: '2.2rem',
          fontWeight: 700,
          color: '#fff',
          lineHeight: 1.1,
          marginBottom: '6px',
        }}
      >
        {count}
        <span
          style={{ fontSize: '0.9rem', fontWeight: 400, opacity: 0.75, marginLeft: '4px' }}
        >
          sessions
        </span>
      </h2>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.83rem', fontWeight: 600, marginBottom: 0 }}>
        {month}
      </p>
    </div>
  );
};

export default HighestMonthCard;