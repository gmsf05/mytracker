// src/components/charts/TrendChart.tsx
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import GlassCard from './ui/GlassCard';

const TrendChart = ({ data }: { data: any[] }) => (
  <GlassCard>
    <h6 className="fw-bold mb-4">Activity Trends</h6>
    <ResponsiveContainer width="100%" height={250}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#a18cd1" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#a18cd1" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#999', fontSize: 12}} />
        <Tooltip contentStyle={{ borderRadius: '15px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
        <Area type="monotone" dataKey="total" stroke="#a18cd1" strokeWidth={3} fill="url(#colorTotal)" />
      </AreaChart>
    </ResponsiveContainer>
  </GlassCard>
);

export default TrendChart;