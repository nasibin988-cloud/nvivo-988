/**
 * UpcomingCard Types
 * Type definitions for appointment card
 */

import type { Appointment } from '../../../hooks/dashboard';

export type DesignVariant = 1 | 2 | 3;

export interface UpcomingCardProps {
  appointment: Appointment | null | undefined;
  onViewMore?: () => void;
  onViewAppointment?: (id: string) => void;
  design?: DesignVariant;
}

export interface DesignProps {
  appointment: Appointment;
  onViewMore?: () => void;
  onViewAppointment?: (id: string) => void;
}

export type { Appointment };
