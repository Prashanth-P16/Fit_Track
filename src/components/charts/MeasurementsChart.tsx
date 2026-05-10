import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MeasurementsChartProps {
  data: { month: string; waist?: number; hips?: number; chest?: number; thighs?: number; biceps?: number; forearms?: number; calves?: number; shoulders?: number; neck?: number }[];
}

const COLORS = ['#00e5a0', '#4fc3f7', '#ff6b35', '#ffd166', '#ef4444', '#a78bfa', '#f472b6', '#34d399', '#fb923c'];
const KEYS = ['waist', 'hips', 'chest', 'thighs', 'biceps', 'forearms', 'calves', 'shoulders', 'neck'];

export function MeasurementsChart({ data }: MeasurementsChartProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">Body Measurements</h3>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 10 }} />
            {KEYS.map((key, i) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={COLORS[i]}
                strokeWidth={1.5}
                dot={{ r: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
