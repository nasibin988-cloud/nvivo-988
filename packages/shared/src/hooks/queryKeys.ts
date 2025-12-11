/**
 * Query Key Factory - Centralized, type-safe query keys for React Query
 *
 * This prevents typos and ensures consistent cache invalidation.
 * All query keys should be defined here and imported where needed.
 */

/**
 * Food/Nutrition query keys
 */
export const foodKeys = {
  all: ['food'] as const,
  logs: (uid: string, date: string) => [...foodKeys.all, 'logs', uid, date] as const,
  history: (uid: string, days: number) => [...foodKeys.all, 'history', uid, days] as const,
  water: (uid: string, date: string) => [...foodKeys.all, 'water', uid, date] as const,
  targets: (uid: string) => [...foodKeys.all, 'targets', uid] as const,
  status: (uid: string, date: string) => [...foodKeys.all, 'status', uid, date] as const,
};

/**
 * Wellness query keys
 */
export const wellnessKeys = {
  all: ['wellness'] as const,
  log: (uid: string, date: string) => [...wellnessKeys.all, 'log', uid, date] as const,
  history: (uid: string, days: number) => [...wellnessKeys.all, 'history', uid, days] as const,
  streak: (uid: string) => [...wellnessKeys.all, 'streak', uid] as const,
};

/**
 * Health metrics query keys
 */
export const healthKeys = {
  all: ['health'] as const,
  metrics: (uid: string, date: string) => [...healthKeys.all, 'metrics', uid, date] as const,
  trends: (uid: string, days: number) => [...healthKeys.all, 'trends', uid, days] as const,
  cardiac: (uid: string) => [...healthKeys.all, 'cardiac', uid] as const,
  cognitive: (uid: string) => [...healthKeys.all, 'cognitive', uid] as const,
};

/**
 * Medications query keys
 */
export const medicationKeys = {
  all: ['medications'] as const,
  list: (uid: string) => [...medicationKeys.all, 'list', uid] as const,
  schedule: (uid: string, date: string) => [...medicationKeys.all, 'schedule', uid, date] as const,
  adherence: (uid: string, days: number) => [...medicationKeys.all, 'adherence', uid, days] as const,
};

/**
 * Appointments query keys
 */
export const appointmentKeys = {
  all: ['appointments'] as const,
  list: (uid: string) => [...appointmentKeys.all, 'list', uid] as const,
  upcoming: (uid: string) => [...appointmentKeys.all, 'upcoming', uid] as const,
  detail: (uid: string, appointmentId: string) => [...appointmentKeys.all, 'detail', uid, appointmentId] as const,
};

/**
 * Patient profile query keys
 */
export const patientKeys = {
  all: ['patient'] as const,
  profile: (uid: string) => [...patientKeys.all, 'profile', uid] as const,
  settings: (uid: string) => [...patientKeys.all, 'settings', uid] as const,
};

/**
 * Articles/Learn query keys
 */
export const articleKeys = {
  all: ['articles'] as const,
  list: (category?: string) => [...articleKeys.all, 'list', category ?? 'all'] as const,
  detail: (articleId: string) => [...articleKeys.all, 'detail', articleId] as const,
  recommended: () => [...articleKeys.all, 'recommended'] as const,
  categories: () => [...articleKeys.all, 'categories'] as const,
};

/**
 * Care team query keys
 */
export const careTeamKeys = {
  all: ['careTeam'] as const,
  list: (uid: string) => [...careTeamKeys.all, 'list', uid] as const,
  member: (uid: string, memberId: string) => [...careTeamKeys.all, 'member', uid, memberId] as const,
};

/**
 * Family hub query keys
 */
export const familyKeys = {
  all: ['family'] as const,
  members: (uid: string) => [...familyKeys.all, 'members', uid] as const,
  invitations: (uid: string) => [...familyKeys.all, 'invitations', uid] as const,
};

/**
 * Nutrition evaluation query keys (DRI-based system)
 */
export const nutritionEvalKeys = {
  all: ['nutritionEval'] as const,
  targets: (uid: string) => [...nutritionEvalKeys.all, 'targets', uid] as const,
  dayEval: (uid: string, date: string) => [...nutritionEvalKeys.all, 'day', uid, date] as const,
  weekEval: (uid: string, startDate: string) => [...nutritionEvalKeys.all, 'week', uid, startDate] as const,
  nutrientInfo: (nutrientId: string) => [...nutritionEvalKeys.all, 'info', nutrientId] as const,
};

/**
 * Master query keys object - for invalidating entire domains
 */
export const queryKeys = {
  food: foodKeys,
  wellness: wellnessKeys,
  health: healthKeys,
  medications: medicationKeys,
  appointments: appointmentKeys,
  patient: patientKeys,
  articles: articleKeys,
  careTeam: careTeamKeys,
  family: familyKeys,
  nutritionEval: nutritionEvalKeys,
} as const;
