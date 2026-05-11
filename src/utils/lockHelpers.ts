/**
 * Lock Helpers - Determine if fields are locked, active, or not yet available
 */

type LockState = 'upcoming' | 'active' | 'done' | 'skipped' | 'missed' | 'locked' | 'not_yet' | 'not_available' | 'swap_closed' | 'non_sunday' | 'analysis_done';

/**
 * Check if a meal is locked/available based on time and status
 */
export function isMealLocked(
  mealId: string,
  mealTime: string, // HH:MM format
  mealStatus: 'pending' | 'done' | 'skipped'
): LockState {
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  if (mealStatus === 'done') {
    return 'done';
  }
  
  if (mealStatus === 'skipped') {
    return 'skipped';
  }
  
  // Compare times
  if (currentTime < mealTime) {
    return 'upcoming';
  }
  
  // Check if more than 2 hours past meal time
  const [mealHour, mealMin] = mealTime.split(':').map(Number);
  const [currentHour, currentMin] = currentTime.split(':').map(Number);
  
  const mealTimeMinutes = mealHour * 60 + mealMin;
  const currentTimeMinutes = currentHour * 60 + currentMin;
  const diffMinutes = currentTimeMinutes - mealTimeMinutes;
  
  if (diffMinutes > 120) {
    return 'missed';
  }
  
  return 'active';
}

/**
 * Check if water logging is available
 * Available: 9AM - 10PM, locked after 10PM
 */
export function isWaterLocked(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Available from 9 (09:00) to 22 (10PM)
  return hour < 9 || hour >= 22;
}

/**
 * Check if workout is locked
 */
export function isWorkoutLocked(workoutLog: {
  workout_complete?: boolean;
  no_gym?: boolean;
}): boolean {
  if (workoutLog.no_gym) {
    return true;
  }
  
  if (workoutLog.workout_complete) {
    return true;
  }
  
  return false;
}

/**
 * Check if sleep fields are available based on time
 */
export function isSleepLocked(bedtime: string | null, wakeTime: string | null): {
  bedtimeAvailable: boolean;
  wakeAvailable: boolean;
  isLocked: boolean;
} {
  const now = new Date();
  const hour = now.getHours();
  
  // Bedtime available after 10PM (22:00)
  const bedtimeAvailable = hour >= 22;
  
  // Wake time available after 5AM
  const wakeAvailable = hour >= 5;
  
  // Locked if both are saved
  const isLocked = bedtime !== null && wakeTime !== null;
  
  return { bedtimeAvailable, wakeAvailable, isLocked };
}

/**
 * Check if weight logging is locked
 * Only available on Sunday, once per day
 */
export function isWeightLocked(
  log: { weight?: number | null },
  today: Date
): boolean {
  const dayOfWeek = today.getDay();
  const isSunday = dayOfWeek === 0;
  
  // Only available on Sunday
  if (!isSunday) {
    return true;
  }
  
  // On Sunday, locked if weight already entered
  if (log.weight !== null && log.weight !== undefined) {
    return true;
  }
  
  return false;
}

/**
 * Check if dinner selection is locked
 * Available after 9PM, before 10PM
 */
export function isDinnerLocked(
  dinnerType: string | null,
  log: { dinner_type?: string | null }
): LockState {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const currentMinutes = hour * 60 + minute;
  
  // 9 PM = 21:00 = 1260 minutes
  const ninepmMinutes = 21 * 60;
  
  // 10 PM = 22:00 = 1320 minutes
  const tenpmMinutes = 22 * 60;
  
  // If dinner already selected
  if (log.dinner_type) {
    return 'locked';
  }
  
  // Before 9PM
  if (currentMinutes < ninepmMinutes) {
    return 'not_yet';
  }
  
  // After 10PM
  if (currentMinutes >= tenpmMinutes) {
    return 'locked';
  }
  
  // Between 9PM and 10PM
  return 'active';
}

/**
 * Check if workout swap is still available
 * Available before 8AM, locked at and after 8AM
 */
export function isWorkoutSwapLocked(): boolean {
  const now = new Date();
  const hour = now.getHours();
  
  // Available before 8AM only
  return hour >= 8;
}

/**
 * Check if weekly analysis is available and locked
 * Available on Sunday after weight is logged
 */
export function isWeeklyAnalysisLocked(
  logs: Array<{
    date: string;
    weight?: number | null;
    weekly_analysis_done?: boolean;
  }>,
  today: Date
): LockState {
  const dayOfWeek = today.getDay();
  const isSunday = dayOfWeek === 0;
  
  if (!isSunday) {
    return 'not_available';
  }
  
  // Find today's log
  const todayStr = today.toISOString().split('T')[0];
  const todayLog = logs.find(log => log.date === todayStr);
  
  if (!todayLog) {
    return 'not_available';
  }
  
  // Check if weight is logged
  if (!todayLog.weight) {
    return 'not_available';
  }
  
  // Check if analysis already done
  if (todayLog.weekly_analysis_done) {
    return 'analysis_done';
  }
  
  return 'active';
}

/**
 * Check if monthly analysis is available and locked
 * Available on 1st of month after measurements saved
 */
export function isMonthlyAnalysisLocked(
  measurements: Array<{
    date: string;
    monthly_analysis_done?: boolean;
  }>,
  today: Date
): LockState {
  const dayOfMonth = today.getDate();
  const isFirstDay = dayOfMonth === 1;
  
  if (!isFirstDay) {
    return 'not_available';
  }
  
  // Find today's measurement
  const todayStr = today.toISOString().split('T')[0];
  const todayMeasurement = measurements.find(m => m.date === todayStr);
  
  if (!todayMeasurement) {
    return 'not_available';
  }
  
  // Check if analysis already done
  if (todayMeasurement.monthly_analysis_done) {
    return 'analysis_done';
  }
  
  return 'active';
}

/**
 * Check if measurements can be entered
 * Available on 1st of every month, or very first entry ever
 */
export function isMeasurementsLocked(
  today: Date,
  hasEverEntered: boolean
): boolean {
  const dayOfMonth = today.getDate();
  const isFirstDay = dayOfMonth === 1;
  
  // Available on 1st of month
  if (isFirstDay) {
    return false;
  }
  
  // Available for very first entry ever
  if (!hasEverEntered) {
    return false;
  }
  
  // Locked on all other days
  return true;
}

/**
 * Get display message for locked state
 */
export function getLockedMessage(
  field: string,
  state: LockState,
  data?: Record<string, any>
): string {
  switch (state) {
    case 'upcoming':
      return data?.mealTime ? `Available at ${data.mealTime}` : 'Available soon';
    
    case 'active':
      return 'Active — log now';
    
    case 'done':
      return data?.value ? `✅ ${data.value} — logged` : '✅ Logged';
    
    case 'skipped':
      return '⊘ Skipped';
    
    case 'missed':
      return '⚠ Missed logging window';
    
    case 'locked':
      return data?.value ? `✅ ${data.value} — logged` : '✅ Locked';
    
    case 'not_yet':
      return data?.availableTime ? `Available after ${data.availableTime}` : 'Not yet available';
    
    case 'not_available':
      return 'Not available today';
    
    case 'swap_closed':
      return 'Swap window closed — gym started';
    
    case 'non_sunday':
      return 'Next weigh-in: Sunday';
    
    case 'analysis_done':
      return data?.weekNumber && data?.score
        ? `✅ Week ${data.weekNumber} analyzed • Score ${data.score}/10`
        : '✅ Analysis complete';
    
    default:
      return 'Unavailable';
  }
}

/**
 * Helper to get current time in HH:MM format
 */
export function getCurrentTimeString(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

/**
 * Helper to get next meal time for display
 */
export function getNextMealTime(mealtimes: Record<string, string>): string {
  const now = new Date();
  const currentTime = getCurrentTimeString();
  
  const mealOrder = ['breakfast', 'lunch', 'snack', 'dinner'];
  
  for (const meal of mealOrder) {
    if (mealtimes[meal] && mealtimes[meal] > currentTime) {
      return mealtimes[meal];
    }
  }
  
  // If no meals left today, return breakfast tomorrow
  return mealtimes['breakfast'] || '08:00';
}

/**
 * Helper to format time for display
 */
export function formatTime(time: string): string {
  if (!time) return '';
  
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  
  return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Helper to check if current time is within a window
 */
export function isTimeInWindow(
  startTime: string,
  endTime: string,
  now?: Date
): boolean {
  const currentDate = now || new Date();
  const currentTime = getCurrentTimeString();
  
  return currentTime >= startTime && currentTime < endTime;
}

/**
 * Helper to get minutes until a specific time
 */
export function getMinutesUntilTime(targetTime: string): number {
  const [targetHour, targetMin] = targetTime.split(':').map(Number);
  const now = new Date();
  
  const targetMinutes = targetHour * 60 + targetMin;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  let diff = targetMinutes - currentMinutes;
  
  // If negative, it's tomorrow
  if (diff < 0) {
    diff += 24 * 60;
  }
  
  return diff;
}

/**
 * Helper to check if within last N hours of a time
 */
export function isWithinHours(mealTime: string, hours: number): boolean {
  const minutesUntil = getMinutesUntilTime(mealTime);
  return minutesUntil < 0 && Math.abs(minutesUntil) < hours * 60;
}
