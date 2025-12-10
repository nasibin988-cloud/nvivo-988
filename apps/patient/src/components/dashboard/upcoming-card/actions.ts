/**
 * UpcomingCard Actions
 * External action handlers
 */

import type { Appointment } from '../../../hooks/dashboard';
import type { AppointmentLocation } from '../../../hooks/dashboard';
import { getGoogleMapsUrl, getGoogleCalendarUrl } from './utils';

export function handleOpenMaps(location: AppointmentLocation): void {
  window.open(getGoogleMapsUrl(location), '_blank', 'noopener,noreferrer');
}

export function handleAddToCalendar(appointment: Appointment): void {
  window.open(getGoogleCalendarUrl(appointment), '_blank', 'noopener,noreferrer');
}
