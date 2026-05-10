import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';

interface ProteinBarChartProps {
  data: { day: string; protein: number; target: number }[];
}

export function ProteinBarChart({ data }: ProteinBarChartProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">This Week — Protein</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
              labelStyle={{ color: '#6b6b8a' }}
              itemStyle={{ color: '#4fc3f7' }}
            />
            <ReferenceLine y={169} stroke="#ff6b35" strokeDasharray="4 4" />
            <Bar dataKey="protein" radius={[4, 4, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={
                    entry.protein >= entry.target
                      ? '#4fc3f7'
                      : entry.protein >= entry.target * 0.8
                        ? '#ffd166'
                        : '#ef4444'
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
