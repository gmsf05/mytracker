import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';

interface ChartData {
  name: string;
  total: number;
}

interface ProgressChartProps {
  data: ChartData[];
  barColor?: string;
  colorMap?: { [key: string]: string };
  height?: string;
}

const ProgressChart = ({
  data,
  barColor = '#818263',
  colorMap,
  height = '300px',
}: ProgressChartProps) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height, color: 'var(--text-muted)', fontSize: '0.9rem' }}
      >
        Not enough data to display chart.
      </div>
    );
  }

  return (
    <div style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(129,130,99,0.12)" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'DM Sans' }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'var(--text-muted)', fontSize: 12, fontFamily: 'DM Sans' }}
          />
          <Tooltip
            cursor={{ fill: 'rgba(129,130,99,0.06)' }}
            contentStyle={{
              borderRadius: '12px',
              border: '1px solid rgba(255,255,255,0.72)',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(16px)',
              boxShadow: '0 4px 16px rgba(129,130,99,0.12)',
              fontFamily: 'DM Sans',
              fontSize: '13px',
            }}
          />
          <Bar dataKey="total" radius={[8, 8, 0, 0]} barSize={44}>
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colorMap && colorMap[entry.name] ? colorMap[entry.name] : barColor}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressChart;