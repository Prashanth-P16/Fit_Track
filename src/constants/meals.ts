export interface Meal {
  id: string;
  time: string;
  label: string;
  cal: number;
  protein: number;
}

export interface DinnerOption {
  id: string;
  label: string;
  cal: number;
  protein: number;
}

export const GYM_DAY_MEALS: Meal[] = [
  { id: 'banana', time: '07:45', label: 'Red Banana 1 medium', cal: 120, protein: 1 },
  { id: 'shake1', time: '10:30', label: 'Protein Shake 1 scoop', cal: 144, protein: 24 },
  { id: 'lunch', time: '13:30', label: 'Rice 250g + Veg 200g + 4EW + 2WE', cal: 650, protein: 44 },
  { id: 'oats', time: '17:00', label: 'Protein Oats 50g + 200ml Milk', cal: 316, protein: 20 },
  { id: 'shake2', time: '20:00', label: 'Protein Shake 1 scoop', cal: 144, protein: 24 },
  { id: 'dinner', time: '22:00', label: 'Dinner', cal: 480, protein: 58 },
];

export const REST_DAY_MEALS: Meal[] = [
  { id: 'shake1', time: '10:30', label: 'Protein Shake 1 scoop', cal: 144, protein: 24 },
  { id: 'lunch', time: '13:30', label: 'Rice 150g + Veg 200g + 4EW + 2WE', cal: 500, protein: 44 },
  { id: 'oats', time: '17:00', label: 'Protein Oats 50g + 200ml Milk', cal: 316, protein: 20 },
  { id: 'shake2', time: '20:00', label: 'Protein Shake 1 scoop', cal: 144, protein: 24 },
  { id: 'dinner', time: '22:00', label: 'Dinner', cal: 480, protein: 58 },
];

export const DINNER_OPTIONS: DinnerOption[] = [
  { id: 'chicken', label: 'Chicken Breast 250g + 2 Chapati', cal: 480, protein: 58 },
  { id: 'paneer', label: 'Heritage Paneer 240g + 2 Chapati', cal: 486, protein: 60 },
  { id: 'beef', label: 'Chilli Beef 300g', cal: 650, protein: 43 },
  { id: 'pansoya', label: 'Paneer 150g + Soya 50g + 2 Chapati', cal: 533, protein: 53 },
  { id: 'other', label: 'Other (manual entry)', cal: 0, protein: 0 },
];
