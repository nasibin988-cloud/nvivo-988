/**
 * Scheduler Data
 * Mock data for providers, appointment types, and requests
 */

import { Video, MapPin, Phone, Sun, Sunset, Moon, Clock } from 'lucide-react';
import type { Provider, AppointmentType, VisitType, TimePreference, AppointmentRequest } from './types';

export const providers: Provider[] = [
  {
    id: '1',
    name: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '2',
    name: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '3',
    name: 'Dr. Robert Campbell',
    title: 'Psychologist',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&h=200&fit=crop&crop=face&q=80',
  },
  {
    id: '4',
    name: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
  },
];

export const appointmentTypes: AppointmentType[] = [
  { id: 'checkup', label: 'Regular Check-up', duration: '30 min' },
  { id: 'followup', label: 'Follow-up Visit', duration: '20 min' },
  { id: 'consultation', label: 'Consultation', duration: '45 min' },
  { id: 'urgent', label: 'Urgent Care', duration: '30 min' },
];

export const visitTypes: VisitType[] = [
  { id: 'video', label: 'Video Call', icon: Video },
  { id: 'inperson', label: 'In-Person', icon: MapPin },
  { id: 'phone', label: 'Phone Call', icon: Phone },
];

export const timePreferences: TimePreference[] = [
  { id: 'morning', label: 'Morning', description: '8am - 12pm', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', description: '12pm - 5pm', icon: Sunset },
  { id: 'evening', label: 'Evening', description: '5pm - 8pm', icon: Moon },
  { id: 'anytime', label: 'Any Time', description: 'Flexible', icon: Clock },
];

export const mockRequests: AppointmentRequest[] = [
  {
    id: '1',
    provider: 'Dr. Elizabeth Warren',
    title: 'Primary Care Physician',
    avatarUrl: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=200&h=200&fit=crop&crop=face&q=80',
    type: 'Regular Check-up',
    visitType: 'inperson',
    status: 'confirmed',
    confirmedDate: '12/15/24',
    confirmedTime: '10:00 AM',
  },
  {
    id: '2',
    provider: 'Dr. Michael Anderson',
    title: 'Cardiologist',
    avatarUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face&q=80',
    type: 'Follow-up Visit',
    visitType: 'video',
    status: 'offered',
    offeredSlots: [
      { id: 's1', date: '12/10/24', time: '2:00 PM' },
      { id: 's2', date: '12/11/24', time: '10:30 AM' },
      { id: 's3', date: '12/12/24', time: '3:30 PM' },
    ],
  },
  {
    id: '3',
    provider: 'Dr. Jennifer Collins',
    title: 'Nutritionist',
    avatarUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&h=200&fit=crop&crop=face&q=80',
    type: 'Consultation',
    visitType: 'video',
    status: 'pending',
    submittedDate: '12/06/24',
  },
];
