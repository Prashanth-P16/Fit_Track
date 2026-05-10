import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface WaterBarChartProps {
  data: { day: string; water: number; target: number }[];
}

export function WaterBarChart({ data }: WaterBarChartProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">This Week — Water</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
              labelStyle={{ color: '#6b6b8a' }}
              itemStyle={{ color: '#4fc3f7' }}
              formatter={(v) => [`${v}ml`, 'Water']}
            />
            <ReferenceLine y={4000} stroke="#ff6b35" strokeDasharray="4 4" />
            <Bar dataKey="water" fill="#4fc3f7" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
