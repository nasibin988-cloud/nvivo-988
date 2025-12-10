/**
 * Common type definitions - Foundation types used across all domains
 * These are the single source of truth for base types
 */

// Branded types for type safety
declare const brand: unique symbol;
type Brand<T, B> = T & { readonly [brand]: B };

/**
 * ISO 8601 date string (YYYY-MM-DD)
 * Use this instead of raw strings for date-only values
 */
export type DateString = Brand<string, 'DateString'>;

/**
 * ISO 8601 timestamp string
 * Use this for full datetime values
 */
export type Timestamp = Brand<string, 'Timestamp'>;

/**
 * UUID string
 */
export type UUID = Brand<string, 'UUID'>;

/**
 * Helper to create a DateString from a Date object
 */
export function toDateString(date: Date = new Date()): DateString {
  return date.toISOString().split('T')[0] as DateString;
}

/**
 * Helper to create a Timestamp from a Date object
 */
export function toTimestamp(date: Date = new Date()): Timestamp {
  return date.toISOString() as Timestamp;
}

/**
 * Helper to parse a DateString to a Date object
 */
export function parseDateString(dateString: DateString): Date {
  return new Date(dateString);
}

/**
 * Check if a string is a valid DateString format
 */
export function isValidDateString(value: string): value is DateString {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(value)) return false;
  const date = new Date(value);
  return !isNaN(date.getTime());
}

/**
 * Get date range helper
 */
export function getDateRange(days: number): { start: DateString; end: DateString } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
  return {
    start: toDateString(start),
    end: toDateString(end),
  };
}

/**
 * Health status levels used for risk indicators
 */
export type HealthStatus = 'optimal' | 'on-target' | 'attention' | 'alert';

/**
 * Base entity interface - all Firestore documents should extend this
 */
export interface BaseEntity {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
