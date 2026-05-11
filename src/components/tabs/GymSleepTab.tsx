import { useState, useCallback, useEffect } from 'react';
import { Moon, Dumbbell, ArrowRightLeft, Ruler, X, Check } from 'lucide-react';
import { useDay } from '../../hooks/useDay';
import { WORKOUTS, CARDIO_CONFIG } from '../../constants/workouts';
import type { Exercise, WorkoutDay } from '../../constants/workouts';
import { ExerciseCard } from '../ui/ExerciseCard';
import { getSleepColor, calculateSleepHours } from '../../utils/calculations';
import { supabase } from '../../lib/supabase';
import { isFirstOfMonth, getDateForWorkoutDay, getDayLabel, getDaysAgo } from '../../utils/dateHelpers';

const MEASUREMENT_FIELDS = [
  { key: 'waist', label: 'Waist', hint: 'At navel level' },
  { key: 'hips', label: 'Hips', hint: 'Widest part' },
  { key: 'chest', label: 'Chest', hint: 'At nipple line' },
  { key: 'thighs', label: 'Thighs', hint: 'Mid thigh widest' },
  { key: 'biceps', label: 'Biceps', hint: 'Flexed widest' },
  { key: 'forearms', label: 'Forearms', hint: 'Widest below elbow' },
  { key: 'calves', label: 'Calves', hint: 'Widest lower leg' },
  { key: 'shoulders', label: 'Shoulders', hint: 'Widest across' },
  { key: 'neck', label: 'Neck', hint: 'Mid neck' },
] as const;

type MeasurementKey = (typeof MEASUREMENT_FIELDS)[number]['key'];

interface HistorySet {
  weight: number;
  reps: number;
  set_number: number;
  is_personal_best: boolean;
}

export function GymSleepTab() {
  const { log, loading, dayNum, workoutDayNum, effectiveWorkoutDay, todayWorkout, updateLog } = useDay();
  const [exerciseSets, setExerciseSets] = useState<Record<string, { weight: string; reps: string }[]>>({});
  const [showSwap, setShowSwap] = useState(false);
  const [noGym, setNoGym] = useState(false);
  const [noGymReason, setNoGymReason] = useState('');
  const [bedtime, setBedtime] = useState('');
  const [wakeTime, setWakeTime] = useState('');
  const [workoutDone, setWorkoutDone] = useState(false);
  const [cardioDone, setCardioDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [sleepSaved, setSleepSaved] = useState(false);
  const [swapConfirmMsg, setSwapConfirmMsg] = useState('');

  const [showMeasurements, setShowMeasurements] = useState(false);
  const [measurements, setMeasurements] = useState<Record<MeasurementKey, string>>({
    waist: '', hips: '', chest: '', thighs: '', biceps: '', forearms: '', calves: '', shoulders: '', neck: '',
  });
  const [measurementsSaved, setMeasurementsSaved] = useState(false);

  // Last week's exercise history grouped by exercise name
  const [lastWeekHistory, setLastWeekHistory] = useState<Record<string, HistorySet[]>>({});
  // All-time max weight per exercise (for personal best detection)
  const [allTimeMaxWeight, setAllTimeMaxWeight] = useState<Record<string, number>>({});
  // Personal best flags per exercise per set index
  const [personalBests, setPersonalBests] = useState<Record<string, boolean[]>>({});

  const sleepHours = bedtime && wakeTime ? calculateSleepHours(bedtime, wakeTime) : 0;

  const [pendingSwapDay, setPendingSwapDay] = useState<number | null>(null);
  const activeWorkoutDay = pendingSwapDay || effectiveWorkoutDay;
  const activeWorkout: WorkoutDay = WORKOUTS[activeWorkoutDay] || WORKOUTS[7];
  const activeIsRestDay = activeWorkoutDay === 7;

  // Fetch last week's exercise history
  useEffect(() => {
    const fetchHistory = async () => {
      const sevenDaysAgo = getDaysAgo(7);
      const { data, error } = await supabase
        .from('exercise_history')
        .select('exercise_name, set_number, weight, reps, is_personal_best')
        .gte('date', sevenDaysAgo)
        .order('set_number', { ascending: true });

      if (error) {
        console.error('Error fetching exercise history:', error);
        return;
      }

      if (data) {
        const grouped: Record<string, HistorySet[]> = {};
        for (const row of data) {
          if (!grouped[row.exercise_name]) grouped[row.exercise_name] = [];
          grouped[row.exercise_name].push({
            weight: Number(row.weight),
            reps: Number(row.reps),
            set_number: row.set_number,
            is_personal_best: row.is_personal_best,
          });
        }
        setLastWeekHistory(grouped);
      }
    };

    const fetchAllTimeMax = async () => {
      const { data, error } = await supabase
        .from('exercise_history')
        .select('exercise_name, weight');

      if (error) {
        console.error('Error fetching all-time max:', error);
        return;
      }

      if (data) {
        const maxMap: Record<string, number> = {};
        for (const row of data) {
          const w = Number(row.weight);
          if (!maxMap[row.exercise_name] || w > maxMap[row.exercise_name]) {
            maxMap[row.exercise_name] = w;
          }
        }
        setAllTimeMaxWeight(maxMap);
      }
    };

    fetchHistory();
    fetchAllTimeMax();
  }, [log]);

  // Detect personal bests as user types weights
  useEffect(() => {
    const pbs: Record<string, boolean[]> = {};
    for (const [name, sets] of Object.entries(exerciseSets)) {
      pbs[name] = sets.map((s) => {
        const w = Number(s.weight);
        if (!w || w <= 0) return false;
        const maxW = allTimeMaxWeight[name];
        return maxW != null && w > maxW;
      });
    }
    setPersonalBests(pbs);
  }, [exerciseSets, allTimeMaxWeight]);

  useEffect(() => {
    if (!log) return;
    if (log.sleep?.bedtime) setBedtime(log.sleep.bedtime as string);
    if (log.sleep?.wake_time) setWakeTime(log.sleep.wake_time as string);
    if (log.workout?.no_gym) setNoGym(true);
    if (log.workout?.no_gym_reason) setNoGymReason(log.workout.no_gym_reason as string);
    if (log.workout?.done) setWorkoutDone(true);
    if (log.workout?.cardio_done) setCardioDone(true);
  }, [log]);

  useEffect(() => {
    if (showMeasurements) fetchLatestMeasurements();
  }, [showMeasurements]);

  const fetchLatestMeasurements = async () => {
    const { data } = await supabase
      .from('body_measurements')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      const prev: Record<string, string> = {};
      MEASUREMENT_FIELDS.forEach(({ key }) => {
        const val = data[key as keyof typeof data];
        if (val != null) prev[key] = String(val);
      });
      setMeasurements(prev => ({ ...prev, ...prev as Record<MeasurementKey, string> }));
    }
  };

  const handleSetChange = useCallback(
    (exerciseName: string, setIndex: number, field: 'weight' | 'reps', value: string) => {
      setExerciseSets((prev) => {
        const current = prev[exerciseName] || Array.from({ length: 3 }, () => ({ weight: '', reps: '' }));
        const updated = [...current];
        updated[setIndex] = { ...updated[setIndex], [field]: value };
        return { ...prev, [exerciseName]: updated };
      });
    },
    []
  );

  const handleSaveWorkout = useCallback(async () => {
    if (!log) return;
    setSaving(true);

    try {
      const exercises: Record<string, { sets: { weight: number; reps: number }[] }> = {};
      for (const [name, sets] of Object.entries(exerciseSets)) {
        exercises[name] = {
          sets: sets.map((s) => ({ weight: Number(s.weight) || 0, reps: Number(s.reps) || 0 })),
        };
      }

      await updateLog({
        workout: {
          done: true,
          no_gym: noGym,
          no_gym_reason: noGymReason,
          cardio_done: cardioDone,
          exercises,
        },
      });

      const today = new Date().toISOString().split('T')[0];
      for (const [name, sets] of Object.entries(exerciseSets)) {
        for (let i = 0; i < sets.length; i++) {
          const weight = Number(sets[i].weight);
          const reps = Number(sets[i].reps);
          if (weight > 0 && reps > 0) {
            const isPB = personalBests[name]?.[i] || false;
            await supabase.from('exercise_history').insert({
              date: today,
              day_num: dayNum,
              exercise_name: name,
              set_number: i + 1,
              weight,
              reps,
              is_personal_best: isPB,
            });
          }
        }
      }

      // Refresh all-time max after saving
      const { data: newData } = await supabase
        .from('exercise_history')
        .select('exercise_name, weight');
      if (newData) {
        const maxMap: Record<string, number> = {};
        for (const row of newData) {
          const w = Number(row.weight);
          if (!maxMap[row.exercise_name] || w > maxMap[row.exercise_name]) {
            maxMap[row.exercise_name] = w;
          }
        }
        setAllTimeMaxWeight(maxMap);
      }

      setWorkoutDone(true);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error('Save workout failed:', err);
    } finally {
      setSaving(false);
    }
  }, [exerciseSets, noGym, noGymReason, cardioDone, log, updateLog, dayNum, personalBests]);

  const handleSleepSave = useCallback(async () => {
    if (!log) return;
    await updateLog({
      sleep: {
        bedtime,
        wake_time: wakeTime,
        hours: sleepHours,
      },
    });
    setSleepSaved(true);
    setTimeout(() => setSleepSaved(false), 2000);
  }, [bedtime, wakeTime, sleepHours, updateLog, log]);

  const handleSwapWorkout = useCallback(
    async (targetDay: number) => {
      if (!log) return;

      const targetDate = getDateForWorkoutDay(targetDay);
      const todayLabel = WORKOUTS[workoutDayNum]?.label || `Day ${workoutDayNum}`;
      const targetLabel = WORKOUTS[targetDay]?.label || `Day ${targetDay}`;

      setPendingSwapDay(targetDay);

      await updateLog({
        workout_swapped: true,
        swap_reason: `Swapped Day ${workoutDayNum} with Day ${targetDay}`,
      });

      const { data: targetLog } = await supabase
        .from('daily_logs')
        .select('id')
        .eq('date', targetDate)
        .maybeSingle();

      if (targetLog) {
        await supabase
          .from('daily_logs')
          .update({
            workout_swapped: true,
            swap_reason: `Swapped Day ${targetDay} with Day ${workoutDayNum}`,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetLog.id);
      } else {
        const targetDayNum = dayNum + (targetDay - workoutDayNum);
        await supabase.from('daily_logs').insert({
          date: targetDate,
          day_num: targetDayNum,
          meals: {},
          water: 0,
          workout: {},
          workout_swapped: true,
          swap_reason: `Swapped Day ${targetDay} with Day ${workoutDayNum}`,
          sleep: {},
        });
      }

      setShowSwap(false);
      setSwapConfirmMsg(`${todayLabel} swapped with ${targetLabel}`);
      setTimeout(() => setSwapConfirmMsg(''), 3000);
    },
    [workoutDayNum, updateLog, log, dayNum]
  );

  const handleSaveMeasurements = useCallback(async () => {
    const today = new Date().toISOString().split('T')[0];
    const values: Record<string, number> = {};
    MEASUREMENT_FIELDS.forEach(({ key }) => {
      const val = parseFloat(measurements[key]);
      if (!isNaN(val) && val > 0) values[key] = val;
    });

    await supabase.from('body_measurements').insert({
      date: today,
      ...values,
    });

    setMeasurementsSaved(true);
    setTimeout(() => {
      setMeasurementsSaved(false);
      setShowMeasurements(false);
    }, 1500);
  }, [measurements]);

  const handleMarkNoGym = useCallback(async () => {
    if (!log) return;
    const newNoGym = !noGym;
    setNoGym(newNoGym);
    if (newNoGym) {
      await updateLog({
        workout: {
          done: false,
          no_gym: true,
          no_gym_reason: noGymReason,
          cardio_done: false,
          exercises: {},
        },
      });
    }
  }, [noGym, noGymReason, log, updateLog]);

  const handleCardioToggle = useCallback(async () => {
    if (!log) return;
    const newCardio = !cardioDone;
    setCardioDone(newCardio);
    await updateLog({
      workout: {
        ...log.workout,
        done: workoutDone,
        no_gym: noGym,
        no_gym_reason: noGymReason,
        cardio_done: newCardio,
      },
    });
  }, [cardioDone, workoutDone, noGym, noGymReason, log, updateLog]);

  if (loading || !todayWorkout) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-28 space-y-4">
      {swapConfirmMsg && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-emerald-400 text-[#0a0a0f] text-sm font-medium rounded-xl shadow-lg shadow-emerald-400/20 animate-[fadeInUp_0.3s_ease-out]">
          {swapConfirmMsg}
        </div>
      )}

      {/* Gym Section */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-medium text-white">{activeWorkout.label}</h3>
          </div>
          <button
            onClick={() => setShowSwap(!showSwap)}
            className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] bg-[#1e1e2e] text-slate-400 rounded-lg hover:text-white transition-colors"
          >
            <ArrowRightLeft className="w-3 h-3" /> Swap
          </button>
        </div>

        {showSwap && (
          <div className="mb-3 p-3 bg-[#0a0a0f] rounded-lg space-y-1.5">
            <p className="text-xs text-slate-400 mb-2">Swap today's workout with:</p>
            {Object.entries(WORKOUTS)
              .filter(([k]) => Number(k) !== activeWorkoutDay && Number(k) !== 7)
              .map(([key, workout]) => (
                <button
                  key={key}
                  onClick={() => handleSwapWorkout(Number(key))}
                  className="w-full text-left px-3 py-2 text-xs text-white bg-[#1e1e2e] rounded-lg hover:bg-emerald-400/10 hover:text-emerald-400 transition-colors"
                >
                  {getDayLabel(Number(key))}: {workout.label}
                </button>
              ))}
            <button
              onClick={() => setShowSwap(false)}
              className="w-full text-center px-3 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-3">
          <button
            onClick={handleMarkNoGym}
            className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
              noGym
                ? 'bg-red-400/20 text-red-400 border border-red-400/30'
                : 'bg-[#1e1e2e] text-slate-400 border border-transparent hover:text-white'
            }`}
          >
            {noGym ? <X className="w-3.5 h-3.5" /> : <Dumbbell className="w-3.5 h-3.5" />}
            {noGym ? 'No Gym Today' : 'No Gym'}
          </button>

          {!activeIsRestDay && (
            <button
              onClick={handleCardioToggle}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${
                cardioDone
                  ? 'bg-emerald-400/20 text-emerald-400 border border-emerald-400/30'
                  : 'bg-[#1e1e2e] text-slate-400 border border-transparent hover:text-white'
              }`}
            >
              {cardioDone ? <Check className="w-3.5 h-3.5" /> : <Dumbbell className="w-3.5 h-3.5" />}
              {cardioDone ? 'Cardio Done' : 'Cardio'}
            </button>
          )}
        </div>

        {noGym && (
          <input
            type="text"
            placeholder="Reason (optional)"
            value={noGymReason}
            onChange={(e) => setNoGymReason(e.target.value)}
            className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:border-red-400/50 focus:outline-none mb-3"
          />
        )}

        {!activeIsRestDay && !noGym && (
          <div className="p-2.5 bg-[#0a0a0f] rounded-lg">
            <p className="text-xs text-white">
              {CARDIO_CONFIG.type} — {CARDIO_CONFIG.duration}min
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Speed {CARDIO_CONFIG.speed} km/h | Incline {CARDIO_CONFIG.incline}%
            </p>
          </div>
        )}

        {workoutDone && (
          <div className="mt-3 flex items-center gap-2 p-2.5 bg-emerald-400/10 rounded-lg">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-emerald-400 font-medium">Workout completed today</span>
          </div>
        )}
      </div>

      {!noGym && !activeIsRestDay && (
        <div className="space-y-2">
          {activeWorkout.exercises.map((exercise: Exercise) => (
            <ExerciseCard
              key={exercise.name}
              exercise={exercise}
              lastWeekWeights={(lastWeekHistory[exercise.name] || []).map(s => ({ weight: s.weight, reps: s.reps }))}
              thisWeekSets={exerciseSets[exercise.name] || Array.from({ length: exercise.sets }, () => ({ weight: '', reps: '' }))}
              personalBests={personalBests[exercise.name] || Array.from({ length: exercise.sets }, () => false)}
              onSetChange={(i, field, value) => handleSetChange(exercise.name, i, field, value)}
            />
          ))}
          <button
            onClick={handleSaveWorkout}
            disabled={saving}
            className="w-full py-3 bg-emerald-400 text-[#0a0a0f] text-sm font-semibold rounded-xl hover:bg-emerald-300 transition-colors disabled:opacity-50 active:scale-[0.98]"
          >
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-[#0a0a0f] border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : saveSuccess ? (
              <span className="flex items-center justify-center gap-2">
                <Check className="w-4 h-4" /> Saved!
              </span>
            ) : (
              'Save Workout'
            )}
          </button>
        </div>
      )}

      {activeIsRestDay && !noGym && (
        <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
          <p className="text-sm text-white font-medium">Rest Day</p>
          <p className="text-xs text-slate-400 mt-1">Light walk optional. Rice reduced to 150g. All protein sources stay the same.</p>
        </div>
      )}

      {/* Sleep Section */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-3">
          <Moon className="w-4 h-4 text-blue-400" />
          <h3 className="text-sm font-medium text-white">Sleep</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Bedtime</label>
            <input
              type="time"
              value={bedtime}
              onChange={(e) => setBedtime(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 block mb-1">Wake time</label>
            <input
              type="time"
              value={wakeTime}
              onChange={(e) => setWakeTime(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2.5 text-sm text-white focus:border-blue-400/50 focus:outline-none"
            />
          </div>
        </div>

        {sleepHours > 0 && (
          <div className="flex items-center justify-between p-2.5 bg-[#0a0a0f] rounded-lg mb-3">
            <span className="text-xs text-slate-400">Total sleep</span>
            <span className={`text-sm font-bold ${getSleepColor(sleepHours)}`}>
              {sleepHours.toFixed(1)}h
            </span>
          </div>
        )}

        <button
          onClick={handleSleepSave}
          className="w-full py-2.5 bg-blue-400/10 text-blue-400 text-xs font-medium rounded-lg hover:bg-blue-400/20 transition-colors active:scale-[0.98]"
        >
          {sleepSaved ? 'Sleep Saved!' : 'Save Sleep'}
        </button>

        <div className="mt-3 p-2.5 bg-[#0a0a0f] rounded-lg">
          <p className="text-[10px] text-slate-500">Sleep Rules</p>
          <p className="text-[10px] text-slate-400 mt-1">Bed by 12:30 AM | Wake 7:30 AM | Phone down 12:00 AM | 7h target</p>
        </div>
      </div>

      {/* Body Measurements */}
      <div className="bg-[#12121a] border border-[#1e1e2e] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Ruler className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-medium text-white">Body Measurements</h3>
          </div>
          <button
            onClick={() => setShowMeasurements(!showMeasurements)}
            className="px-3 py-1.5 text-[10px] bg-amber-400/10 text-amber-400 rounded-lg hover:bg-amber-400/20 transition-colors"
          >
            {showMeasurements ? 'Close' : 'Log Measurements'}
          </button>
        </div>

        {isFirstOfMonth() && !showMeasurements && (
          <p className="text-xs text-amber-400 mb-2">1st of the month — time to take measurements!</p>
        )}

        {!isFirstOfMonth() && !showMeasurements && (
          <p className="text-xs text-slate-500">Monthly measurements on the 1st. Tap to log anytime.</p>
        )}

        {showMeasurements && (
          <div className="space-y-2.5">
            {MEASUREMENT_FIELDS.map(({ key, label, hint }) => (
              <div key={key} className="flex items-center gap-3">
                <div className="w-20 shrink-0">
                  <p className="text-xs text-white">{label}</p>
                  <p className="text-[10px] text-slate-500">{hint}</p>
                </div>
                <input
                  type="number"
                  step="0.1"
                  placeholder="cm"
                  value={measurements[key]}
                  onChange={(e) => setMeasurements({ ...measurements, [key]: e.target.value })}
                  className="flex-1 bg-[#0a0a0f] border border-[#1e1e2e] rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-amber-400/50 focus:outline-none"
                />
              </div>
            ))}

            <button
              onClick={handleSaveMeasurements}
              disabled={measurementsSaved}
              className="w-full mt-2 py-2.5 bg-amber-400 text-[#0a0a0f] text-sm font-semibold rounded-xl hover:bg-amber-300 transition-colors disabled:opacity-50 active:scale-[0.98]"
            >
              {measurementsSaved ? 'Saved!' : 'Save Measurements'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
