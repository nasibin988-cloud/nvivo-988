/**
 * Shared date and time formatting utilities
 */

/**
 * Format a date string to mm/dd/yy format
 */
export function formatDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  return `${month}/${day}/${year}`;
}

/**
 * Format a date string to h:mm AM/PM format
 */
export function formatTime(dateString: string | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  const hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes} ${ampm}`;
}

/**
 * Format a date to "Mon DD" format (e.g., "Dec 15")
 */
export function formatShortDate(dateString: string | undefined): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

/**
 * Get individual date parts for custom formatting
 */
export function getDateParts(dateString: string | undefined): {
  month: string;
  day: string;
  year: string;
  weekday: string;
  hours: number;
  minutes: string;
  ampm: string;
} | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hours = date.getHours();

  return {
    month: months[date.getMonth()],
    day: String(date.getDate()),
    year: String(date.getFullYear()),
    weekday: weekdays[date.getDay()],
    hours: hours % 12 || 12,
    minutes: String(date.getMinutes()).padStart(2, '0'),
    ampm: hours >= 12 ? 'PM' : 'AM',
  };
}

/**
 * Calculate days until a future date
 */
export function getDaysUntil(dateString: string | undefined): number | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if a date is today
 */
export function isToday(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if a date is tomorrow
 */
export function isTomorrow(dateString: string | undefined): boolean {
  if (!dateString) return false;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}
