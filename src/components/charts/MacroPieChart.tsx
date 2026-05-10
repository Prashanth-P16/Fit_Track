import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface MacroPieChartProps {
  protein: number;
  carbs: number;
  fats: number;
}

const COLORS = ['#4fc3f7', '#00e5a0', '#ff6b35'];

export function MacroPieChart({ protein, carbs, fats }: MacroPieChartProps) {
  const total = protein + carbs + fats;
  const data = [
    { name: 'Protein', value: protein, pct: total > 0 ? ((protein / total) * 100).toFixed(0) : '0' },
    { name: 'Carbs', value: carbs, pct: total > 0 ? ((carbs / total) * 100).toFixed(0) : '0' },
    { name: 'Fats', value: fats, pct: total > 0 ? ((fats / total) * 100).toFixed(0) : '0' },
  ];

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">Macro Split</h3>
      <div className="flex items-center gap-4">
        <div className="w-28 h-28">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={25} outerRadius={45} paddingAngle={3} dataKey="value">
                {data.map((_, i) => (
                  <Cell key={i} fill={COLORS[i]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="space-y-1.5">
          {data.map((d, i) => (
            <div key={d.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-xs text-slate-300">{d.name}</span>
              <span className="text-xs text-slate-500">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
