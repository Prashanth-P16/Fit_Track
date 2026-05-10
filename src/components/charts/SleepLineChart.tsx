import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface SleepLineChartProps {
  data: { date: string; hours: number }[];
}

export function SleepLineChart({ data }: SleepLineChartProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">Sleep Quality — Last 14 Days</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis domain={[4, 10]} tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
              formatter={(v) => [`${v}h`, 'Sleep']}
            />
            <ReferenceLine y={7} stroke="#00e5a0" strokeDasharray="4 4" label={{ value: '7h', fill: '#00e5a0', fontSize: 10 }} />
            <Line
              type="monotone"
              dataKey="hours"
              stroke="#4fc3f7"
              strokeWidth={2}
              dot={{ r: 4, fill: '#4fc3f7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
