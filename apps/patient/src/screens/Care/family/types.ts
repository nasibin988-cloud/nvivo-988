/**
 * Family Hub Types & Configuration
 * Defines types, access levels, and utility functions for family management
 */

import { Heart, Users, User, Shield, LucideIcon } from 'lucide-react';

// Access level configuration
export interface AccessLevelConfig {
  label: string;
  description: string;
  color: string;
  permissions: string[];
}

export const accessLevels: Record<string, AccessLevelConfig> = {
  full: {
    label: 'Full Access',
    description: 'Can view all health data and manage appointments',
    color: 'emerald',
    permissions: ['vitals', 'medications', 'appointments', 'documents', 'activity'],
  },
  limited: {
    label: 'Limited Access',
    description: 'Can view vitals and upcoming appointments only',
    color: 'blue',
    permissions: ['vitals', 'appointments'],
  },
  emergency: {
    label: 'Emergency Only',
    description: 'Can only access emergency health info',
    color: 'amber',
    permissions: ['emergency'],
  },
};

export type AccessLevel = keyof typeof accessLevels;

// Family member type
export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  avatarUrl: string;
  accessLevel: AccessLevel;
  lastActive: string;
  isEmergencyContact: boolean;
  status: 'active' | 'pending' | 'inactive';
}

// Caregiving target type (people I care for)
export interface CaregivingTarget {
  id: string;
  name: string;
  relationship: string;
  avatarUrl: string;
  healthScore: number;
  nextMedication: string;
  nextAppointment: string;
  alertCount: number;
}

// Schedule item types
export type ScheduleItemType = 'medication' | 'appointment' | 'task';
export type ScheduleItemStatus = 'completed' | 'upcoming' | 'missed';

export interface UnifiedScheduleItem {
  id: string;
  time: string;
  type: ScheduleItemType;
  title: string;
  member: string;
  memberColor: string;
  status: ScheduleItemStatus;
}

// Shared summary type
export interface SharedSummary {
  id: string;
  recipientEmail: string;
  createdAt: string;
  expiresAt: string;
  accessCode: string;
  viewCount: number;
  includesMetrics: boolean;
  includesMedications: boolean;
  includesAppointments: boolean;
}

// Language option for Family Explainer
export interface LanguageOption {
  code: string;
  label: string;
}

// Audience type for Family Explainer
export interface AudienceType {
  id: string;
  label: string;
  icon: LucideIcon;
}

// Language options for Family Explainer
export const languageOptions: LanguageOption[] = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Spanish' },
  { code: 'zh', label: 'Chinese' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'vi', label: 'Vietnamese' },
  { code: 'tl', label: 'Tagalog' },
];

// Audience types for Family Explainer
export const audienceTypes: AudienceType[] = [
  { id: 'spouse', label: 'Spouse/Partner', icon: Heart },
  { id: 'parent', label: 'Parent', icon: Users },
  { id: 'child', label: 'Child', icon: User },
  { id: 'sibling', label: 'Sibling', icon: Users },
  { id: 'friend', label: 'Friend', icon: User },
  { id: 'caregiver', label: 'Caregiver', icon: Shield },
];

// Access color configuration
export interface AccessColorSet {
  bg: string;
  border: string;
  text: string;
}

export function getAccessColor(level: AccessLevel): AccessColorSet {
  const colors: Record<AccessLevel, AccessColorSet> = {
    full: { bg: 'bg-emerald-500/15', border: 'border-emerald-500/20', text: 'text-emerald-400' },
    limited: { bg: 'bg-blue-500/15', border: 'border-blue-500/20', text: 'text-blue-400' },
    emergency: { bg: 'bg-amber-500/15', border: 'border-amber-500/20', text: 'text-amber-400' },
  };
  return colors[level];
}

// Member color mapping for schedule indicators
export function getMemberColor(color: string): string {
  const colors: Record<string, string> = {
    rose: 'bg-rose-500',
    blue: 'bg-blue-500',
    emerald: 'bg-emerald-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
  };
  return colors[color] || 'bg-gray-500';
}

// Permission list for access management
export const permissionsList = [
  { id: 'vitals', label: 'View Vitals & Metrics' },
  { id: 'medications', label: 'View Medications' },
  { id: 'appointments', label: 'View Appointments' },
  { id: 'documents', label: 'View Documents' },
  { id: 'activity', label: 'View Activity History' },
] as const;
