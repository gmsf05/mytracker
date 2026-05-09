// src/components/ui/GlassCard.tsx
interface Props {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className = "" }: Props) => (
  <div className={`glass-card p-4 h-100 ${className}`}>
    {children}
  </div>
);

export default GlassCard;