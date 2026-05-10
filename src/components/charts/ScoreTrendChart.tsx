import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface ScoreTrendChartProps {
  data: { week: string; score: number }[];
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">Weekly AI Score</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
              formatter={(v) => [`${v}/10`, 'Score']}
            />
            <ReferenceLine y={8} stroke="#00e5a0" strokeDasharray="4 4" label={{ value: '8/10', fill: '#00e5a0', fontSize: 10 }} />
            <Line type="monotone" dataKey="score" stroke="#ff6b35" strokeWidth={2} dot={{ r: 3, fill: '#ff6b35' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
