import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Star } from 'lucide-react';

interface OverloadChartProps {
  exerciseName: string;
  data: { week: string; set1: number; set2: number; set3: number; pbSet?: number }[];
}

export function OverloadChart({ exerciseName, data }: OverloadChartProps) {
  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs text-slate-400">Progressive Overload</h3>
        <span className="text-xs text-emerald-400">{exerciseName}</span>
      </div>
      <div className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis dataKey="week" tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <YAxis tick={{ fontSize: 10, fill: '#6b6b8a' }} />
            <Tooltip
              contentStyle={{ background: '#12121a', border: '1px solid #1e1e2e', borderRadius: 8 }}
            />
            <Line type="monotone" dataKey="set1" stroke="#00e5a0" strokeWidth={2} name="Set 1" />
            <Line type="monotone" dataKey="set2" stroke="#4fc3f7" strokeWidth={2} name="Set 2" />
            <Line type="monotone" dataKey="set3" stroke="#ff6b35" strokeWidth={2} name="Set 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {data.some((d) => d.pbSet !== undefined) && (
        <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
          <Star className="w-3 h-3" /> Personal best marked
        </div>
      )}
    </div>
  );
}
