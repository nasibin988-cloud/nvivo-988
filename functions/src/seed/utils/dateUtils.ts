/**
 * Date utility functions for seeding
 */

/**
 * Format a date as YYYY-MM-DD string
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get a date N days ago from today
 */
export function getDateDaysAgo(daysAgo: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get a date N days from today
 */
export function getDateDaysFromNow(daysFromNow: number): Date {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get today's date at midnight
 */
export function getToday(): Date {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

/**
 * Get a random time during the day
 */
export function getRandomTimeOnDate(date: Date): Date {
  const result = new Date(date);
  result.setHours(
    8 + Math.floor(Math.random() * 12), // 8am - 8pm
    Math.floor(Math.random() * 60),
    Math.floor(Math.random() * 60)
  );
  return result;
}
