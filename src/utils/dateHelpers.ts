import { APP_START } from '../constants/targets';

export function getDayNumber(date: Date = new Date()): number {
  const start = new Date(APP_START);
  start.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const diff = d.getTime() - start.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
}

export function getWorkoutDayNum(dayNumber: number): number {
  return ((dayNumber - 1) % 7) + 1;
}

export function getWeekNumber(dayNumber: number): number {
  return Math.ceil(dayNumber / 7);
}

export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function formatDateDisplay(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function isSunday(date: Date = new Date()): boolean {
  return date.getDay() === 0;
}

export function isFirstOfMonth(date: Date = new Date()): boolean {
  return date.getDate() === 1;
}

export function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return formatDate(d);
}

export function getToday(): string {
  return formatDate(new Date());
}

export function getWeekStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return formatDate(d);
}

export function getMonthStart(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(1);
  return formatDate(d);
}

export function getMonthEnd(date: Date = new Date()): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setMonth(d.getMonth() + 1, 0);
  return formatDate(d);
}

export function getDayLabel(dayNumber: number): string {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const idx = ((dayNumber - 1) % 7);
  return days[idx];
}

export function getDateForWorkoutDay(targetWorkoutDay: number, referenceDate: Date = new Date()): string {
  const today = new Date(referenceDate);
  today.setHours(0, 0, 0, 0);
  const currentWorkoutDay = getWorkoutDayNum(getDayNumber(today));
  const diff = targetWorkoutDay - currentWorkoutDay;
  const target = new Date(today);
  target.setDate(target.getDate() + diff);
  return formatDate(target);
}
