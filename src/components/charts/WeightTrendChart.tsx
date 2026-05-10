import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface WeightTrendChartProps {
  data: { date: string; weight: number }[];
  goalWeight?: number;
}

export function WeightTrendChart({ data, goalWeight = 72 }: WeightTrendChartProps) {
  const first = data[0]?.weight;
  const last = data[data.length - 1]?.weight;
  const lost = first && last ? (first - last).toFixed(1) : '0';
  const weeks = data.length > 1 ? Math.ceil(data.length / 7) : 0;

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-slate-400">Weight Trend</h3>
        {lost !== '0' && (
          <span className="text-xs text-emerald-400">Lost {lost}kg in {weeks}w</span>
        )}
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
              labelStyle={{ color: '#6b6b8a' }}
              itemStyle={{ color: '#00e5a0' }}
            />
            <ReferenceLine y={goalWeight} stroke="#ff6b35" strokeDasharray="4 4" label={{ value: 'Goal', fill: '#ff6b35', fontSize: 10 }} />
            <Line type="monotone" dataKey="weight" stroke="#00e5a0" strokeWidth={2} dot={{ r: 3, fill: '#00e5a0' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
