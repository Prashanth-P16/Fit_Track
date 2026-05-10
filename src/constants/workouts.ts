export interface Exercise {
  name: string;
  muscle: string;
  sets: number;
  repsRange: string;
}

export interface WorkoutDay {
  label: string;
  exercises: Exercise[];
  cardio: boolean;
}

export const WORKOUTS: Record<number, WorkoutDay> = {
  1: {
    label: 'Chest + Triceps',
    cardio: true,
    exercises: [
      { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', sets: 3, repsRange: '8-15' },
      { name: 'Chest Press Machine', muscle: 'Middle Chest', sets: 3, repsRange: '8-15' },
      { name: 'Cable Cross Top to Bottom', muscle: 'Lower Chest', sets: 3, repsRange: '8-15' },
      { name: 'Cable Pushdown', muscle: 'Triceps — Lateral & Medial', sets: 3, repsRange: '8-15' },
      { name: 'Overhead Cable Extension', muscle: 'Triceps — Long Head', sets: 3, repsRange: '8-15' },
    ],
  },
  2: {
    label: 'Back + Biceps',
    cardio: true,
    exercises: [
      { name: 'Cable Wide Grip Pulldown', muscle: 'Back — Upper Width', sets: 3, repsRange: '8-15' },
      { name: 'Cable Row Machine', muscle: 'Back — Middle Thickness', sets: 3, repsRange: '8-15' },
      { name: 'Hyperextension', muscle: 'Back — Lower', sets: 3, repsRange: '8-15' },
      { name: 'Machine One Arm Pulldown', muscle: 'Back — Isolation', sets: 3, repsRange: '8-15' },
      { name: 'EZ Bar Curls', muscle: 'Biceps — Long Head', sets: 3, repsRange: '8-15' },
      { name: 'Preacher Curl Machine', muscle: 'Biceps — Short Head', sets: 3, repsRange: '8-15' },
    ],
  },
  3: {
    label: 'Shoulders + Legs',
    cardio: true,
    exercises: [
      { name: 'Shoulder Press Machine', muscle: 'Shoulders — Front Delt', sets: 3, repsRange: '8-15' },
      { name: 'Lateral Raises Machine', muscle: 'Shoulders — Lateral Delt', sets: 3, repsRange: '8-15' },
      { name: 'Face Pull', muscle: 'Shoulders — Rear Delt', sets: 3, repsRange: '8-15' },
      { name: 'Leg Press Machine', muscle: 'Legs — Quads', sets: 3, repsRange: '8-15' },
      { name: 'Leg Curls', muscle: 'Legs — Hamstrings', sets: 3, repsRange: '8-15' },
      { name: 'Calf Raises', muscle: 'Legs — Calves', sets: 3, repsRange: '8-15' },
    ],
  },
  4: {
    label: 'Chest + Triceps (Var)',
    cardio: true,
    exercises: [
      { name: 'Incline Chest Machine Press', muscle: 'Upper Chest', sets: 3, repsRange: '8-15' },
      { name: 'Chest Fly Machine', muscle: 'Middle Chest', sets: 3, repsRange: '8-15' },
      { name: 'Cable Cross Top to Bottom', muscle: 'Lower Chest', sets: 3, repsRange: '8-15' },
      { name: 'Reverse Grip Cable Pushdown', muscle: 'Triceps — Medial Head', sets: 3, repsRange: '8-15' },
      { name: 'Overhead Cable Extension', muscle: 'Triceps — Long Head', sets: 3, repsRange: '8-15' },
    ],
  },
  5: {
    label: 'Back + Biceps (Var)',
    cardio: true,
    exercises: [
      { name: 'Cable Wide Grip Pulldown', muscle: 'Back — Upper Width', sets: 3, repsRange: '8-15' },
      { name: 'Cable Row Machine', muscle: 'Back — Middle Thickness', sets: 3, repsRange: '8-15' },
      { name: 'Hyperextension', muscle: 'Back — Lower', sets: 3, repsRange: '8-15' },
      { name: 'Machine One Arm Pulldown', muscle: 'Back — Isolation', sets: 3, repsRange: '8-15' },
      { name: 'Hammer Curls Dumbbell', muscle: 'Biceps — Long Head + Brachialis', sets: 3, repsRange: '8-15' },
      { name: 'Preacher Curl Machine', muscle: 'Biceps — Short Head', sets: 3, repsRange: '8-15' },
    ],
  },
  6: {
    label: 'Shoulders',
    cardio: true,
    exercises: [
      { name: 'Overhead Dumbbell Press Seated', muscle: 'Shoulders — Front Delt', sets: 3, repsRange: '8-15' },
      { name: 'Cable Lateral Raises', muscle: 'Shoulders — Lateral Delt', sets: 3, repsRange: '8-15' },
      { name: 'Reverse Chest Fly', muscle: 'Shoulders — Rear Delt', sets: 3, repsRange: '8-15' },
      { name: 'Face Pull', muscle: 'Shoulders — Rear Delt + Rotator Cuff', sets: 3, repsRange: '8-15' },
    ],
  },
  7: {
    label: 'Rest Day',
    cardio: false,
    exercises: [],
  },
};

export const CARDIO_CONFIG = {
  type: 'Incline Walk',
  duration: 30,
  speed: 3.5,
  incline: 7,
};

export const WORKOUT_DAY_LABELS = Object.fromEntries(
  Object.entries(WORKOUTS).map(([k, v]) => [k, v.label])
);
