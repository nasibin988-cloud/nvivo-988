/**
 * Scheduler Utilities
 * Calendar helpers and date formatting functions
 */

import type { AvailabilitySlot } from './types';

/**
 * Get days in a month with padding for calendar grid
 */
export function getDaysInMonth(date: Date): (Date | null)[] {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDay = firstDay.getDay();

  const days: (Date | null)[] = [];
  for (let i = 0; i < startingDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
  return days;
}

/**
 * Check if a date is selectable (today or future)
 */
export function isDateSelectable(date: Date | null): boolean {
  if (!date) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date >= today;
}

/**
 * Check if a date is selected in availability
 */
export function isDateSelected(date: Date | null, availability: AvailabilitySlot[]): boolean {
  if (!date) return false;
  return availability.some((a) => a.date.toDateString() === date.toDateString());
}

/**
 * Format date as "Mon, Dec 15"
 */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

/**
 * Format date as "12/15"
 */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
}

/**
 * Get month name with year
 */
export function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
