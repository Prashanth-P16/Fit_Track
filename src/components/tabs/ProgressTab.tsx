import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useSettings } from '../../hooks/useSettings';
import { useAuth } from '../../hooks/useAuth';
import { GoalProgressRing } from '../charts/GoalProgressRing';
import { StreakCounter } from '../charts/StreakCounter';
import { WeightTrendChart } from '../charts/WeightTrendChart';
import { CalorieBarChart } from '../charts/CalorieBarChart';
import { ProteinBarChart } from '../charts/ProteinBarChart';
import { WaterBarChart } from '../charts/WaterBarChart';
import { MacroPieChart } from '../charts/MacroPieChart';
import { SleepLineChart } from '../charts/SleepLineChart';
import { GymHeatmap } from '../charts/GymHeatmap';
import { OverloadChart } from '../charts/OverloadChart';
import { MeasurementsChart } from '../charts/MeasurementsChart';
import { ScoreTrendChart } from '../charts/ScoreTrendChart';
import { STARTING_WEIGHT } from '../../constants/targets';
import { getDaysAgo, formatDateDisplay } from '../../utils/dateHelpers';

export function ProgressTab() {
  const { user } = useAuth();
  const { targets } = useSettings();
  const [weightData, setWeightData] = useState<{ date: string; weight: number }[]>([]);
  const [calData, setCalData] = useState<{ day: string; calories: number; target: number }[]>([]);
  const [proteinData, setProteinData] = useState<{ day: string; protein: number; target: number }[]>([]);
  const [waterData, setWaterData] = useState<{ day: string; water: number; target: number }[]>([]);
  const [sleepData, setSleepData] = useState<{ date: string; hours: number }[]>([]);
  const [gymData, setGymData] = useState<{ date: string; status: 'gym' | 'cardio' | 'rest' | 'skipped' }[]>([]);
  const [scoreData, setScoreData] = useState<{ week: string; score: number }[]>([]);
  const [measurementData, setMeasurementData] = useState<Record<string, unknown>[]>([]);
  const [currentWeight, setCurrentWeight] = useState(STARTING_WEIGHT);
  const [streak] = useState({ current: 0, best: 0, month: 0 });
  const [historyLogs, setHistoryLogs] = useState<{ date: string; day_num: number; weight: number | null; ai_score: number | null }[]>([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [overloadData] = useState<{ week: string; set1: number; set2: number; set3: number }[]>([]);

  const fetchProgressData = useCallback(async () => {
    if (!user) return;
    const sevenDaysAgo = getDaysAgo(7);
    const fourteenDaysAgo = getDaysAgo(14);

    const { data: weightLogs } = await supabase
      .from('daily_logs')
      .select('date, weight')
      .eq('user_id', user.id)
      .not('weight', 'is', null)
      .order('date', { ascending: true });
    if (weightLogs) {
      setWeightData(weightLogs.map((d: { date: string; weight: number }) => ({ date: d.date, weight: d.weight })));
      const lastWeight = weightLogs[weightLogs.length - 1]?.weight;
      if (lastWeight) setCurrentWeight(lastWeight);
    }

    const { data: weekLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', sevenDaysAgo)
      .order('date', { ascending: true });

    if (weekLogs) {
      const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      setCalData(
        weekLogs.map((d: Record<string, unknown>) => ({
          day: dayNames[new Date(d.date as string).getDay()],
          calories: 0,
          target: targets.calories,
        }))
      );
      setProteinData(
        weekLogs.map((d: Record<string, unknown>) => ({
          day: dayNames[new Date(d.date as string).getDay()],
          protein: 0,
          target: targets.protein,
        }))
      );
      setWaterData(
        weekLogs.map((d: Record<string, unknown>) => ({
          day: dayNames[new Date(d.date as string).getDay()],
          water: (d.water as number) || 0,
          target: targets.water,
        }))
      );
    }

    const { data: sleepLogs } = await supabase
      .from('daily_logs')
      .select('date, sleep')
      .eq('user_id', user.id)
      .gte('date', fourteenDaysAgo)
      .order('date', { ascending: true });
    if (sleepLogs) {
      setSleepData(
        sleepLogs
          .filter((d: Record<string, unknown>) => (d.sleep as Record<string, unknown>)?.hours)
          .map((d: Record<string, unknown>) => ({
            date: d.date as string,
            hours: (d.sleep as Record<string, number>).hours,
          }))
      );
    }

    const { data: gymLogs } = await supabase
      .from('daily_logs')
      .select('date, workout, day_num')
      .eq('user_id', user.id)
      .gte('date', getDaysAgo(30))
      .order('date', { ascending: true });
    if (gymLogs) {
      setGymData(
        gymLogs.map((d: Record<string, unknown>) => {
          const workout = d.workout as Record<string, unknown>;
          const dayNum = d.day_num as number;
          const isRest = ((dayNum - 1) % 7) + 1 === 7;
          if (isRest) return { date: d.date as string, status: 'rest' as const };
          if (workout?.done) return { date: d.date as string, status: 'gym' as const };
          if (workout?.cardio_done) return { date: d.date as string, status: 'cardio' as const };
          return { date: d.date as string, status: 'skipped' as const };
        })
      );
    }

    const { data: scoreLogs } = await supabase
      .from('daily_logs')
      .select('date, ai_score')
      .eq('user_id', user.id)
      .not('ai_score', 'is', null)
      .order('date', { ascending: true });
    if (scoreLogs) {
      setScoreData(
        scoreLogs.map((d: Record<string, unknown>, i: number) => ({
          week: `W${i + 1}`,
          score: d.ai_score as number,
        }))
      );
    }

    const { data: measurements } = await supabase
      .from('body_measurements')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });
    if (measurements) setMeasurementData(measurements);

    const { data: allLogs } = await supabase
      .from('daily_logs')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30);
    if (allLogs) setHistoryLogs(allLogs as { date: string; day_num: number; weight: number | null; ai_score: number | null }[]);
  }, [targets, user]);

  useEffect(() => {
    fetchProgressData();
  }, [fetchProgressData]);

  return (
    <div className="px-4 pb-28 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <GoalProgressRing currentWeight={currentWeight} startWeight={STARTING_WEIGHT} goalWeight={72} />
        <StreakCounter currentStreak={streak.current} bestStreak={streak.best} monthOnTarget={streak.month} />
      </div>

      <WeightTrendChart data={weightData} />
      <CalorieBarChart data={calData} />
      <ProteinBarChart data={proteinData} />
      <WaterBarChart data={waterData} />
      <MacroPieChart protein={37} carbs={43} fats={20} />
      <SleepLineChart data={sleepData} />
      <GymHeatmap data={gymData} />

      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs text-slate-400">Progressive Overload</h3>
          <select
            value={selectedExercise}
            onChange={(e) => setSelectedExercise(e.target.value)}
            className="bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-2 py-1 text-xs text-white focus:outline-none"
          >
            <option value="">Select exercise</option>
            <option value="Incline Dumbbell Press">Incline Dumbbell Press</option>
            <option value="Chest Press Machine">Chest Press Machine</option>
            <option value="Cable Wide Grip Pulldown">Cable Wide Grip Pulldown</option>
            <option value="Leg Press Machine">Leg Press Machine</option>
          </select>
        </div>
        {selectedExercise && overloadData.length > 0 ? (
          <OverloadChart exerciseName={selectedExercise} data={overloadData} />
        ) : (
          <p className="text-xs text-slate-500 text-center py-8">Select an exercise to view progress</p>
        )}
      </div>

      <MeasurementsChart data={measurementData as { month: string; waist?: number; hips?: number; chest?: number; thighs?: number; biceps?: number; forearms?: number; calves?: number; shoulders?: number; neck?: number }[]} />
      <ScoreTrendChart data={scoreData} />

      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <h3 className="text-xs text-slate-400 mb-3">History</h3>
        <div className="space-y-2">
          {historyLogs.map((log, i) => (
            <div key={i} className="flex items-center justify-between p-2 bg-[#0a0a0f] rounded-lg">
              <div>
                <p className="text-xs text-white">{formatDateDisplay(log.date)}</p>
                <p className="text-[10px] text-slate-500">Day {log.day_num}</p>
              </div>
              <div className="text-right">
                {log.weight != null && <p className="text-xs text-emerald-400">{log.weight}kg</p>}
                {log.ai_score != null && <p className="text-[10px] text-orange-400">{log.ai_score}/10</p>}
              </div>
            </div>
          ))}
          {historyLogs.length === 0 && (
            <p className="text-xs text-slate-500 text-center py-4">No history yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
