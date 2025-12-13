/**
 * Seed Care Data
 *
 * Creates realistic care data for the test patient:
 * - Care team members
 * - Medications with schedules
 * - Tasks
 * - Care plan goals
 * - Appointments
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';

interface SeedCareDataOptions {
  patientId: string;
}

/**
 * Seed care team members
 */
export async function seedCareTeam(patientId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const careTeamRef = db.collection('patients').doc(patientId).collection('careTeam');

  const careTeamMembers = [
    {
      firstName: 'Dr. Emily',
      lastName: 'Chen',
      title: 'Primary Care Physician',
      specialty: 'Internal Medicine',
      isPrimary: true,
      photoUrl: '',
      email: 'emily.chen@nvivo.health',
      phone: '+1 (555) 100-0001',
      bio: 'Dr. Chen has over 15 years of experience in internal medicine with a focus on preventive care and chronic disease management.',
      availableForMessaging: true,
      availableForVideo: true,
    },
    {
      firstName: 'Dr. Michael',
      lastName: 'Roberts',
      title: 'Cardiologist',
      specialty: 'Cardiology',
      isPrimary: false,
      photoUrl: '',
      email: 'michael.roberts@nvivo.health',
      phone: '+1 (555) 100-0002',
      bio: 'Board-certified cardiologist specializing in heart health and cardiovascular disease prevention.',
      availableForMessaging: true,
      availableForVideo: true,
    },
    {
      firstName: 'Sarah',
      lastName: 'Thompson',
      title: 'Care Coordinator',
      specialty: 'Care Management',
      isPrimary: false,
      photoUrl: '',
      email: 'sarah.thompson@nvivo.health',
      phone: '+1 (555) 100-0003',
      bio: 'Dedicated to ensuring seamless coordination of your care across all providers.',
      availableForMessaging: true,
      availableForVideo: false,
    },
    {
      firstName: 'Dr. Lisa',
      lastName: 'Park',
      title: 'Nutritionist',
      specialty: 'Clinical Nutrition',
      isPrimary: false,
      photoUrl: '',
      email: 'lisa.park@nvivo.health',
      phone: '+1 (555) 100-0004',
      bio: 'Registered dietitian helping patients achieve optimal health through personalized nutrition plans.',
      availableForMessaging: true,
      availableForVideo: true,
    },
  ];

  careTeamMembers.forEach((member) => {
    const docRef = careTeamRef.doc();
    batch.set(docRef, {
      ...member,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Care team created: ${careTeamMembers.length} members`);
}

/**
 * Seed medications and today's doses
 */
export async function seedMedications(patientId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const patientRef = db.collection('patients').doc(patientId);
  const medicationsRef = patientRef.collection('medications');
  const dosesRef = patientRef.collection('medicationDoses');

  const today = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 2);

  const medications = [
    {
      name: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily',
      instructions: 'Take in the morning with water',
      prescribedBy: 'Dr. Emily Chen',
      startDate,
      status: 'active',
      refillDate: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
      category: 'prescription',
      times: ['08:00'],
    },
    {
      name: 'Metformin',
      dosage: '500mg',
      frequency: 'Twice daily',
      instructions: 'Take with meals',
      prescribedBy: 'Dr. Emily Chen',
      startDate,
      status: 'active',
      category: 'prescription',
      times: ['08:00', '18:00'],
    },
    {
      name: 'Vitamin D3',
      dosage: '2000 IU',
      frequency: 'Once daily',
      instructions: 'Take with food for better absorption',
      prescribedBy: 'Dr. Lisa Park',
      startDate,
      status: 'active',
      category: 'supplement',
      times: ['12:00'],
    },
    {
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg',
      frequency: 'Once daily',
      instructions: 'Take with a meal',
      prescribedBy: 'Dr. Michael Roberts',
      startDate,
      status: 'active',
      category: 'supplement',
      times: ['12:00'],
    },
  ];

  // Create medications and their doses
  for (const med of medications) {
    const medRef = medicationsRef.doc();
    const { times, ...medData } = med;
    batch.set(medRef, {
      ...medData,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    // Create today's doses for each medication
    for (const time of times) {
      const [hours, minutes] = time.split(':').map(Number);
      const scheduledTime = new Date(today);
      scheduledTime.setHours(hours, minutes, 0, 0);

      const isPast = scheduledTime < new Date();
      const doseRef = dosesRef.doc();
      batch.set(doseRef, {
        medicationId: medRef.id,
        medicationName: med.name,
        dosage: med.dosage,
        scheduledTime,
        status: isPast ? (Math.random() > 0.2 ? 'taken' : 'pending') : 'pending',
        ...(isPast && Math.random() > 0.2 ? { takenAt: scheduledTime } : {}),
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }

  await batch.commit();
  console.log(`Medications created: ${medications.length}`);
}

/**
 * Seed tasks
 */
export async function seedTasks(patientId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const tasksRef = db.collection('patients').doc(patientId).collection('tasks');

  const today = new Date();
  const tasks = [
    {
      title: 'Morning walk - 20 minutes',
      description: 'Take a brisk walk around the neighborhood to start your day with movement.',
      category: 'exercise',
      priority: 'high',
      dueDate: new Date(today.setHours(9, 0, 0, 0)),
      status: 'completed',
      completedAt: new Date(today.setHours(8, 45, 0, 0)),
      assignedBy: 'Dr. Emily Chen',
    },
    {
      title: 'Log breakfast in food journal',
      description: 'Record what you ate for breakfast including portion sizes.',
      category: 'nutrition',
      priority: 'medium',
      dueDate: new Date(new Date().setHours(10, 0, 0, 0)),
      status: 'completed',
      completedAt: new Date(new Date().setHours(9, 30, 0, 0)),
      assignedBy: 'Dr. Lisa Park',
    },
    {
      title: 'Blood pressure check',
      description: 'Measure and log your blood pressure. Target: below 130/80.',
      category: 'other',
      priority: 'high',
      dueDate: new Date(new Date().setHours(12, 0, 0, 0)),
      status: 'pending',
      assignedBy: 'Dr. Michael Roberts',
    },
    {
      title: '5-minute breathing exercise',
      description: 'Practice deep breathing to reduce stress and support heart health.',
      category: 'mindset',
      priority: 'medium',
      dueDate: new Date(new Date().setHours(14, 0, 0, 0)),
      status: 'pending',
      assignedBy: 'Sarah Thompson',
    },
    {
      title: 'Drink 8 glasses of water',
      description: 'Stay hydrated throughout the day. Track your water intake.',
      category: 'nutrition',
      priority: 'medium',
      dueDate: new Date(new Date().setHours(20, 0, 0, 0)),
      status: 'pending',
      assignedBy: 'Dr. Lisa Park',
    },
    {
      title: 'Evening stretching routine',
      description: '10 minutes of gentle stretching before bed to improve flexibility.',
      category: 'exercise',
      priority: 'low',
      dueDate: new Date(new Date().setHours(21, 0, 0, 0)),
      status: 'pending',
      assignedBy: 'Dr. Emily Chen',
    },
  ];

  tasks.forEach((task) => {
    const docRef = tasksRef.doc();
    batch.set(docRef, {
      ...task,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Tasks created: ${tasks.length}`);
}

/**
 * Seed care plan goals
 */
export async function seedCarePlanGoals(patientId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const goalsRef = db.collection('patients').doc(patientId).collection('carePlanGoals');

  const today = new Date();
  const goals = [
    {
      title: 'Lower Blood Pressure',
      description: 'Achieve and maintain blood pressure below 130/80 through lifestyle changes and medication adherence.',
      targetDate: new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000), // 90 days
      progress: 65,
      status: 'active',
      milestones: [
        { id: 'm1', title: 'Start daily blood pressure monitoring', completed: true, completedAt: new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000) },
        { id: 'm2', title: 'Reduce sodium intake to <2300mg/day', completed: true, completedAt: new Date(today.getTime() - 20 * 24 * 60 * 60 * 1000) },
        { id: 'm3', title: 'Achieve 7 consecutive days of target BP', completed: false },
        { id: 'm4', title: 'Maintain target BP for 30 days', completed: false },
      ],
    },
    {
      title: 'Improve Cardiovascular Fitness',
      description: 'Build endurance and strengthen heart health through regular exercise.',
      targetDate: new Date(today.getTime() + 120 * 24 * 60 * 60 * 1000), // 120 days
      progress: 40,
      status: 'active',
      milestones: [
        { id: 'm1', title: 'Walk 5,000 steps daily for a week', completed: true, completedAt: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000) },
        { id: 'm2', title: 'Increase to 7,500 steps daily', completed: false },
        { id: 'm3', title: 'Add 20 min cardio 3x/week', completed: false },
        { id: 'm4', title: 'Complete 5K walk without stopping', completed: false },
      ],
    },
    {
      title: 'Optimize Nutrition',
      description: 'Develop sustainable healthy eating habits that support your overall health goals.',
      targetDate: new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000), // 60 days
      progress: 75,
      status: 'active',
      milestones: [
        { id: 'm1', title: 'Log meals for 14 consecutive days', completed: true, completedAt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000) },
        { id: 'm2', title: 'Eat 5 servings of vegetables daily', completed: true, completedAt: new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000) },
        { id: 'm3', title: 'Reduce processed food intake by 50%', completed: true, completedAt: new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000) },
        { id: 'm4', title: 'Maintain healthy eating for 30 days', completed: false },
      ],
    },
  ];

  goals.forEach((goal) => {
    const docRef = goalsRef.doc();
    batch.set(docRef, {
      ...goal,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Care plan goals created: ${goals.length}`);
}

/**
 * Seed appointments
 * Format expected by app: date (YYYY-MM-DD string), time (HH:MM string)
 */
export async function seedAppointments(patientId: string): Promise<void> {
  const db = getFirestore();
  const batch = db.batch();
  const appointmentsRef = db.collection('patients').doc(patientId).collection('appointments');

  const today = new Date();

  // Helper to format date as YYYY-MM-DD
  const formatDate = (d: Date) => d.toISOString().split('T')[0];
  // Helper to format time as HH:MM
  const formatTime = (hours: number, minutes: number = 0) =>
    `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  // Create future dates
  const in3Days = new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000);
  const in7Days = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in10Days = new Date(today.getTime() + 10 * 24 * 60 * 60 * 1000);

  const appointments = [
    {
      providerId: 'dr-emily-chen',
      providerName: 'Dr. Emily Chen',
      providerPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop',
      specialty: 'Primary Care',
      type: 'telehealth',
      reason: 'Quarterly check-up and medication review',
      date: formatDate(in3Days),
      time: formatTime(10, 0),
      duration: 30,
      status: 'confirmed',
      location: null,
      videoCallUrl: 'https://nvivo.health/video/abc123',
      notes: 'Please have your recent blood pressure readings ready.',
      prepInstructions: 'Have your blood pressure readings from the past week ready to discuss.',
    },
    {
      providerId: 'dr-michael-roberts',
      providerName: 'Dr. Michael Roberts',
      providerPhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop',
      specialty: 'Cardiology',
      type: 'in-person',
      reason: 'Cardiac follow-up and stress test review',
      date: formatDate(in10Days),
      time: formatTime(14, 0),
      duration: 45,
      status: 'scheduled',
      location: {
        name: 'Nvivo Heart Center',
        address: '456 Medical Plaza, Suite 301',
        city: 'San Francisco',
        state: 'CA',
        zip: '94102',
        coordinates: { lat: 37.7749, lng: -122.4194 },
      },
      videoCallUrl: null,
      notes: 'Bring insurance card and list of current medications.',
      prepInstructions: 'Wear comfortable clothing. Avoid caffeine 24 hours before.',
    },
    {
      providerId: 'dr-lisa-park',
      providerName: 'Dr. Lisa Park',
      providerPhoto: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop',
      specialty: 'Nutrition',
      type: 'telehealth',
      reason: 'Nutrition plan review and adjustment',
      date: formatDate(in7Days),
      time: formatTime(11, 0),
      duration: 30,
      status: 'confirmed',
      location: null,
      videoCallUrl: 'https://nvivo.health/video/def456',
      notes: 'Please complete your food journal entries before the appointment.',
      prepInstructions: 'Log all meals for the past 3 days in the app.',
    },
  ];

  appointments.forEach((apt) => {
    const docRef = appointmentsRef.doc();
    batch.set(docRef, {
      ...apt,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  });

  await batch.commit();
  console.log(`Appointments created: ${appointments.length}`);
}

/**
 * Seed all care data
 */
export async function seedCareData(options: SeedCareDataOptions): Promise<void> {
  const { patientId } = options;

  console.log('Seeding care data...');
  await seedCareTeam(patientId);
  await seedMedications(patientId);
  await seedTasks(patientId);
  await seedCarePlanGoals(patientId);
  await seedAppointments(patientId);
  console.log('Care data seeding complete!');
}

/**
 * Clear all care data
 */
export async function clearCareData(patientId: string): Promise<void> {
  const db = getFirestore();
  const patientRef = db.collection('patients').doc(patientId);

  const collections = ['careTeam', 'medications', 'medicationDoses', 'tasks', 'carePlanGoals', 'appointments'];

  for (const collName of collections) {
    const snapshot = await patientRef.collection(collName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log('Care data cleared');
}
