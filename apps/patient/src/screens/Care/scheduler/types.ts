/**
 * Scheduler Types
 * Type definitions for appointment scheduling
 */

import type { LucideIcon } from 'lucide-react';

export type RequestStep = 'list' | 'provider' | 'type' | 'availability' | 'questions' | 'review' | 'success';
export type RequestStatus = 'pending' | 'offered' | 'confirmed';
export type VisitTypeId = 'video' | 'inperson' | 'phone';
export type TimePreferenceId = 'morning' | 'afternoon' | 'evening' | 'anytime';

export interface Provider {
  id: string;
  name: string;
  title: string;
  avatarUrl: string;
}

export interface AppointmentType {
  id: string;
  label: string;
  duration: string;
}

export interface VisitType {
  id: VisitTypeId;
  label: string;
  icon: LucideIcon;
}

export interface TimePreference {
  id: TimePreferenceId;
  label: string;
  description: string;
  icon: LucideIcon;
}

export interface OfferedSlot {
  id: string;
  date: string;
  time: string;
}

export interface AppointmentRequest {
  id: string;
  provider: string;
  title: string;
  avatarUrl: string;
  type: string;
  visitType: VisitTypeId;
  status: RequestStatus;
  confirmedDate?: string;
  confirmedTime?: string;
  offeredSlots?: OfferedSlot[];
  submittedDate?: string;
}

export interface AvailabilitySlot {
  date: Date;
  timePreference: string;
}

export interface RequestData {
  providerId: string | null;
  appointmentType: string | null;
  visitType: VisitTypeId;
  availability: AvailabilitySlot[];
  reason: string;
  currentConcerns: string;
  medicationChanges: string;
  additionalNotes: string;
}

export const initialRequestData: RequestData = {
  providerId: null,
  appointmentType: null,
  visitType: 'video',
  availability: [],
  reason: '',
  currentConcerns: '',
  medicationChanges: '',
  additionalNotes: '',
};
