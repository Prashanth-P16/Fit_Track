import { Cell, PieChart, Pie, ResponsiveContainer } from 'recharts';

interface GoalProgressRingProps {
  currentWeight: number;
  startWeight: number;
  goalWeight: number;
}

export function GoalProgressRing({ currentWeight, startWeight, goalWeight }: GoalProgressRingProps) {
  const totalLoss = startWeight - goalWeight;
  const lost = startWeight - currentWeight;
  const pct = totalLoss > 0 ? Math.min((lost / totalLoss) * 100, 100) : 0;

  const data = [
    { name: 'done', value: pct },
    { name: 'remaining', value: 100 - pct },
  ];

  const weeksAtRate = 0.5;
  const remaining = totalLoss - lost;
  const estWeeks = weeksAtRate > 0 ? Math.ceil(remaining / weeksAtRate) : 0;

  return (
    <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
      <h3 className="text-xs text-slate-400 mb-2">Goal Progress</h3>
      <div className="flex items-center gap-4">
        <div className="w-24 h-24">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                innerRadius={30}
                outerRadius={40}
                paddingAngle={4}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill="#00e5a0" />
                <Cell fill="#1e1e2e" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{pct.toFixed(0)}%</p>
          <p className="text-xs text-slate-400">Lost {lost.toFixed(1)}kg of {totalLoss.toFixed(0)}kg</p>
          {estWeeks > 0 && (
            <p className="text-xs text-emerald-400 mt-1">~{estWeeks} weeks to goal</p>
          )}
        </div>
      </div>
    </div>
  );
}
