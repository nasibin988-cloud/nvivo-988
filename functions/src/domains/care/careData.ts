/**
 * Care Data Cloud Functions
 *
 * Provides all care-related data for the patient app:
 * - Care team members
 * - Medications and schedules
 * - Tasks and care plan goals
 * - Appointments
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// ============================================================================
// TYPES
// ============================================================================

export interface CareTeamMember {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  specialty: string;
  isPrimary: boolean;
  photoUrl?: string;
  email: string;
  phone: string;
  bio?: string;
  availableForMessaging: boolean;
  availableForVideo: boolean;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  instructions: string;
  prescribedBy: string;
  startDate: Date;
  status: 'active' | 'paused' | 'discontinued';
  refillDate?: Date;
  category: 'prescription' | 'supplement' | 'otc';
}

export interface MedicationDose {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: Date;
  status: 'pending' | 'taken' | 'missed' | 'skipped';
  takenAt?: Date;
}

export interface CareTask {
  id: string;
  title: string;
  description: string;
  category: 'exercise' | 'nutrition' | 'sleep' | 'mindset' | 'medication' | 'appointment' | 'other';
  priority: 'high' | 'medium' | 'low';
  dueDate: Date;
  status: 'pending' | 'completed' | 'overdue';
  completedAt?: Date;
  assignedBy?: string;
  relatedGoalId?: string;
}

export interface CarePlanGoal {
  id: string;
  title: string;
  description: string;
  targetDate: Date;
  progress: number; // 0-100
  status: 'active' | 'achieved' | 'paused';
  milestones: Milestone[];
  createdAt: Date;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  completedAt?: Date;
}

export interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  providerTitle: string;
  type: 'in-person' | 'telehealth' | 'phone';
  reason: string;
  dateTime: Date;
  duration: number; // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location?: string;
  videoUrl?: string;
  notes?: string;
}

export interface CareData {
  careTeam: CareTeamMember[];
  medications: Medication[];
  todaysDoses: MedicationDose[];
  tasks: CareTask[];
  goals: CarePlanGoal[];
  appointments: Appointment[];
  summary: {
    tasksCompleted: number;
    tasksTotal: number;
    dosesCompleted: number;
    dosesTotal: number;
    goalsActive: number;
    goalsAchieved: number;
    upcomingAppointments: number;
  };
}

// ============================================================================
// FUNCTIONS
// ============================================================================

function getTodayStart(): Date {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function getTodayEnd(): Date {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return today;
}

/**
 * Get all care data for a patient
 */
export async function getCareData(patientId: string): Promise<CareData> {
  const db = getFirestore();
  const patientRef = db.collection('patients').doc(patientId);
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  // Fetch all data in parallel
  const [
    careTeamSnapshot,
    medicationsSnapshot,
    dosesSnapshot,
    tasksSnapshot,
    goalsSnapshot,
    appointmentsSnapshot,
  ] = await Promise.all([
    patientRef.collection('careTeam').get(),
    patientRef.collection('medications').where('status', '==', 'active').get(),
    patientRef.collection('medicationDoses')
      .where('scheduledTime', '>=', todayStart)
      .where('scheduledTime', '<=', todayEnd)
      .orderBy('scheduledTime', 'asc')
      .get(),
    patientRef.collection('tasks')
      .where('dueDate', '>=', todayStart)
      .where('dueDate', '<=', todayEnd)
      .orderBy('dueDate', 'asc')
      .get(),
    patientRef.collection('carePlanGoals').where('status', '==', 'active').get(),
    patientRef.collection('appointments')
      .where('dateTime', '>=', new Date())
      .where('status', 'in', ['scheduled', 'confirmed'])
      .orderBy('dateTime', 'asc')
      .limit(5)
      .get(),
  ]);

  const careTeam = careTeamSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as CareTeamMember[];

  const medications = medicationsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate() || new Date(),
    refillDate: doc.data().refillDate?.toDate(),
  })) as Medication[];

  const todaysDoses = dosesSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledTime: doc.data().scheduledTime?.toDate() || new Date(),
    takenAt: doc.data().takenAt?.toDate(),
  })) as MedicationDose[];

  const tasks = tasksSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate() || new Date(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as CareTask[];

  const goals = goalsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    targetDate: doc.data().targetDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    milestones: doc.data().milestones || [],
  })) as CarePlanGoal[];

  const appointments = appointmentsSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dateTime: doc.data().dateTime?.toDate() || new Date(),
  })) as Appointment[];

  // Calculate summary
  const tasksCompleted = tasks.filter(t => t.status === 'completed').length;
  const dosesCompleted = todaysDoses.filter(d => d.status === 'taken').length;
  const goalsAchieved = goals.filter(g => g.status === 'achieved').length;

  return {
    careTeam,
    medications,
    todaysDoses,
    tasks,
    goals,
    appointments,
    summary: {
      tasksCompleted,
      tasksTotal: tasks.length,
      dosesCompleted,
      dosesTotal: todaysDoses.length,
      goalsActive: goals.filter(g => g.status === 'active').length,
      goalsAchieved,
      upcomingAppointments: appointments.length,
    },
  };
}

/**
 * Get care team members
 */
export async function getCareTeam(patientId: string): Promise<CareTeamMember[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('careTeam')
    .orderBy('isPrimary', 'desc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as CareTeamMember[];
}

/**
 * Get medications
 */
export async function getMedications(patientId: string): Promise<Medication[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('medications')
    .where('status', '==', 'active')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    startDate: doc.data().startDate?.toDate() || new Date(),
    refillDate: doc.data().refillDate?.toDate(),
  })) as Medication[];
}

/**
 * Get today's medication schedule
 */
export async function getMedicationSchedule(patientId: string): Promise<MedicationDose[]> {
  const db = getFirestore();
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('medicationDoses')
    .where('scheduledTime', '>=', todayStart)
    .where('scheduledTime', '<=', todayEnd)
    .orderBy('scheduledTime', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    scheduledTime: doc.data().scheduledTime?.toDate() || new Date(),
    takenAt: doc.data().takenAt?.toDate(),
  })) as MedicationDose[];
}

/**
 * Log medication dose
 */
export async function logMedicationDose(
  patientId: string,
  doseId: string,
  action: 'taken' | 'skipped'
): Promise<MedicationDose> {
  const db = getFirestore();
  const doseRef = db
    .collection('patients')
    .doc(patientId)
    .collection('medicationDoses')
    .doc(doseId);

  const updateData = {
    status: action,
    ...(action === 'taken' ? { takenAt: FieldValue.serverTimestamp() } : {}),
    updatedAt: FieldValue.serverTimestamp(),
  };

  await doseRef.update(updateData);

  const snapshot = await doseRef.get();
  return {
    id: snapshot.id,
    ...snapshot.data(),
    scheduledTime: snapshot.data()?.scheduledTime?.toDate() || new Date(),
    takenAt: snapshot.data()?.takenAt?.toDate(),
  } as MedicationDose;
}

/**
 * Get tasks
 */
export async function getTasks(patientId: string): Promise<CareTask[]> {
  const db = getFirestore();
  const todayStart = getTodayStart();
  const todayEnd = getTodayEnd();

  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('tasks')
    .where('dueDate', '>=', todayStart)
    .where('dueDate', '<=', todayEnd)
    .orderBy('dueDate', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dueDate: doc.data().dueDate?.toDate() || new Date(),
    completedAt: doc.data().completedAt?.toDate(),
  })) as CareTask[];
}

/**
 * Complete a task
 */
export async function completeTask(
  patientId: string,
  taskId: string
): Promise<CareTask> {
  const db = getFirestore();
  const taskRef = db
    .collection('patients')
    .doc(patientId)
    .collection('tasks')
    .doc(taskId);

  await taskRef.update({
    status: 'completed',
    completedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  const snapshot = await taskRef.get();
  return {
    id: snapshot.id,
    ...snapshot.data(),
    dueDate: snapshot.data()?.dueDate?.toDate() || new Date(),
    completedAt: snapshot.data()?.completedAt?.toDate(),
  } as CareTask;
}

/**
 * Get care plan goals
 */
export async function getCarePlanGoals(patientId: string): Promise<CarePlanGoal[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('carePlanGoals')
    .orderBy('status', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    targetDate: doc.data().targetDate?.toDate() || new Date(),
    createdAt: doc.data().createdAt?.toDate() || new Date(),
    milestones: doc.data().milestones || [],
  })) as CarePlanGoal[];
}

/**
 * Get appointments
 */
export async function getAppointments(patientId: string): Promise<Appointment[]> {
  const db = getFirestore();
  const snapshot = await db
    .collection('patients')
    .doc(patientId)
    .collection('appointments')
    .where('status', 'in', ['scheduled', 'confirmed'])
    .orderBy('dateTime', 'asc')
    .get();

  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    dateTime: doc.data().dateTime?.toDate() || new Date(),
  })) as Appointment[];
}
