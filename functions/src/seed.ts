import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

const TEST_PATIENT_ID = 'sarah-mitchell-test';
const TEST_EMAIL = 'sarah.mitchell@test.nvivo.health';
const TEST_PASSWORD = 'TestPatient2024!';

/**
 * Seed test patient with all data
 */
export async function seedTestPatient(): Promise<{
  success: boolean;
  patientId: string;
  email: string;
  password: string;
  message: string;
}> {
  const auth = admin.auth();
  const db = admin.firestore();

  console.log('Starting test patient seed...');

  try {
    // 1. Create auth user with specific UID
    let uid: string;
    try {
      const existingUser = await auth.getUserByEmail(TEST_EMAIL);
      uid = existingUser.uid;
      console.log('Auth user already exists:', uid);
    } catch {
      const userRecord = await auth.createUser({
        uid: TEST_PATIENT_ID,
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        displayName: 'Sarah Mitchell',
        emailVerified: true,
      });
      uid = userRecord.uid;
      console.log('Auth user created:', uid);
    }

    // 2. Create user document
    await db.collection('users').doc(uid).set({
      uid,
      email: TEST_EMAIL,
      displayName: 'Sarah Mitchell',
      role: 'patient',
      patientId: uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('User document created');

    // 3. Create patient document
    await db.collection('patients').doc(uid).set({
      id: uid,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      dateOfBirth: '1985-06-15',
      email: TEST_EMAIL,
      phone: '+1 (415) 555-0100',
      avatarUrl: null,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    console.log('Patient document created');

    // 4. Create care team
    const careTeamMembers = [
      {
        id: 'care-team-1',
        name: 'Dr. James Chen',
        title: 'MD, FACC',
        specialty: 'cardiologist',
        role: 'Primary Cardiologist',
        email: 'james.chen@nvivo.health',
        phone: '+1 (415) 555-0200',
        avatarUrl: null,
        isPrimary: true,
      },
      {
        id: 'care-team-2',
        name: 'Dr. Emily Rodriguez',
        title: 'MD',
        specialty: 'primary_care',
        role: 'Primary Care Physician',
        email: 'emily.rodriguez@nvivo.health',
        phone: '+1 (415) 555-0201',
        avatarUrl: null,
        isPrimary: false,
      },
      {
        id: 'care-team-3',
        name: 'Sarah Thompson',
        title: 'RN, BSN',
        specialty: 'care_coordinator',
        role: 'Care Coordinator',
        email: 'sarah.thompson@nvivo.health',
        phone: '+1 (415) 555-0202',
        avatarUrl: null,
        isPrimary: false,
      },
      {
        id: 'care-team-4',
        name: 'Michael Park',
        title: 'RD, CDE',
        specialty: 'dietitian',
        role: 'Dietitian',
        email: 'michael.park@nvivo.health',
        phone: '+1 (415) 555-0203',
        avatarUrl: null,
        isPrimary: false,
      },
    ];

    for (const member of careTeamMembers) {
      await db.collection('patients').doc(uid).collection('careTeam').doc(member.id).set({
        ...member,
        createdAt: Timestamp.now(),
      });
    }
    console.log('Care team created:', careTeamMembers.length, 'members');

    // 5. Create medications
    const medications = [
      {
        id: 'med-1',
        name: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        scheduledTimes: ['08:00'],
        instructions: 'Take in the morning for blood pressure',
        prescribedBy: 'Dr. James Chen',
        status: 'active',
      },
      {
        id: 'med-2',
        name: 'Atorvastatin',
        dosage: '40mg',
        frequency: 'Once daily at bedtime',
        scheduledTimes: ['21:00'],
        instructions: 'Take at bedtime for cholesterol',
        prescribedBy: 'Dr. James Chen',
        status: 'active',
      },
      {
        id: 'med-3',
        name: 'Aspirin',
        dosage: '81mg',
        frequency: 'Once daily',
        scheduledTimes: ['08:00'],
        instructions: 'Take with food',
        prescribedBy: 'Dr. James Chen',
        status: 'active',
      },
      {
        id: 'med-4',
        name: 'Metformin',
        dosage: '500mg',
        frequency: 'Twice daily',
        scheduledTimes: ['08:00', '18:00'],
        instructions: 'Take with meals',
        prescribedBy: 'Dr. Emily Rodriguez',
        status: 'active',
      },
    ];

    for (const med of medications) {
      await db.collection('patients').doc(uid).collection('medications').doc(med.id).set({
        ...med,
        startDate: Timestamp.now(),
        createdAt: Timestamp.now(),
      });
    }
    console.log('Medications created:', medications.length);

    // 6. Create lifestyle tasks
    const tasks = [
      {
        id: 'task-1',
        category: 'exercise',
        title: 'Morning walk (30 minutes)',
        description: 'Maintain 150 min/week moderate exercise',
        frequency: 'daily',
        priority: 'high',
        status: 'active',
        assignedBy: 'Dr. James Chen',
      },
      {
        id: 'task-2',
        category: 'nutrition',
        title: 'Mediterranean diet lunch',
        description: 'Heart-healthy eating pattern',
        frequency: 'daily',
        priority: 'medium',
        status: 'active',
        assignedBy: 'Michael Park, RD',
      },
      {
        id: 'task-3',
        category: 'mindset',
        title: '10-minute meditation',
        description: 'Stress reduction',
        frequency: 'daily',
        priority: 'medium',
        status: 'active',
        assignedBy: 'Sarah Thompson, RN',
      },
      {
        id: 'task-4',
        category: 'sleep',
        title: 'Sleep by 10:30 PM',
        description: '7-8 hours quality sleep',
        frequency: 'daily',
        priority: 'high',
        status: 'active',
        assignedBy: 'Dr. Emily Rodriguez',
      },
      {
        id: 'task-5',
        category: 'nutrition',
        title: 'Limit sodium intake',
        description: '< 2000mg sodium daily',
        frequency: 'daily',
        priority: 'medium',
        status: 'active',
        assignedBy: 'Michael Park, RD',
      },
    ];

    for (const task of tasks) {
      await db.collection('patients').doc(uid).collection('lifestyleTasks').doc(task.id).set({
        ...task,
        createdAt: Timestamp.now(),
      });
    }
    console.log('Lifestyle tasks created:', tasks.length);

    // 7. Create streak
    await db.collection('patients').doc(uid).collection('streaks').doc('current').set({
      currentStreak: 7,
      longestStreak: 23,
      lastActivityDate: new Date().toISOString().split('T')[0],
      streakStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: Timestamp.now(),
    });
    console.log('Streak created');

    // 8. Create upcoming appointments
    const today = new Date();
    const appointments = [
      {
        id: 'apt-1',
        providerId: 'care-team-1',
        providerName: 'Dr. James Chen',
        providerPhoto: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
        type: 'in-person',
        specialty: 'Cardiology',
        reason: 'Follow-up visit',
        date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '10:00',
        duration: 30,
        status: 'confirmed',
        location: {
          name: 'NVIVO Heart Center',
          address: '456 Medical Plaza, Suite 200',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          coordinates: {
            lat: 37.7849,
            lng: -122.4094,
          },
        },
        videoCallUrl: null,
        notes: 'Review lipid panel results and discuss medication adjustments',
        prepInstructions: 'Please fast for 8 hours before your appointment. Bring a list of all current medications.',
      },
      {
        id: 'apt-2',
        providerId: 'care-team-2',
        providerName: 'Dr. Emily Rodriguez',
        providerPhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
        type: 'telehealth',
        specialty: 'Primary Care',
        reason: 'Lab review',
        date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '14:30',
        duration: 20,
        status: 'confirmed',
        location: null,
        videoCallUrl: 'https://meet.nvivo.health/apt-2',
        notes: 'Review HbA1c results and metabolic panel',
        prepInstructions: 'Have your recent lab results ready. Find a quiet space with good lighting.',
      },
      {
        id: 'apt-3',
        providerId: 'care-team-4',
        providerName: 'Michael Park, RD',
        providerPhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face',
        type: 'in-person',
        specialty: 'Nutrition',
        reason: 'Diet coaching',
        date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '11:00',
        duration: 45,
        status: 'scheduled',
        location: {
          name: 'NVIVO Wellness Center',
          address: '456 Medical Plaza, Suite 150',
          city: 'San Francisco',
          state: 'CA',
          zip: '94102',
          coordinates: {
            lat: 37.7849,
            lng: -122.4094,
          },
        },
        videoCallUrl: null,
        notes: 'Diet optimization session focusing on heart-healthy eating',
        prepInstructions: 'Keep a 3-day food journal before your visit. Bring any dietary supplements you take.',
      },
    ];

    for (const apt of appointments) {
      await db.collection('patients').doc(uid).collection('appointments').doc(apt.id).set({
        ...apt,
        createdAt: Timestamp.now(),
      });
    }
    console.log('Appointments created:', appointments.length);

    // 9. Create cardiac health data
    // Generate blood pressure trend (30 days)
    const generateBloodPressureTrend = (): Array<{ date: string; systolic: number; diastolic: number }> => {
      const trend: Array<{ date: string; systolic: number; diastolic: number }> = [];
      let systolic = 138;
      let diastolic = 88;
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const sysVar = Math.random() * 8 - 4;
        const diaVar = Math.random() * 6 - 3;
        systolic = Math.max(110, Math.min(145, systolic + sysVar - 0.15));
        diastolic = Math.max(68, Math.min(92, diastolic + diaVar - 0.1));
        trend.push({
          date: date.toISOString().split('T')[0],
          systolic: Math.round(systolic),
          diastolic: Math.round(diastolic),
        });
      }
      return trend;
    };

    // Generate LDL trend (12 months)
    const generateLDLTrend = (): Array<{ date: string; value: number }> => {
      const trend: Array<{ date: string; value: number }> = [];
      let ldl = 142;
      for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        const variation = Math.random() * 10 - 5;
        ldl = Math.max(55, Math.min(160, ldl + variation - 6));
        trend.push({
          date: date.toISOString().split('T')[0],
          value: Math.round(ldl),
        });
      }
      return trend;
    };

    const bloodPressureTrend = generateBloodPressureTrend();
    const ldlTrend = generateLDLTrend();
    const latestBP = bloodPressureTrend[bloodPressureTrend.length - 1];
    const latestLDL = ldlTrend[ldlTrend.length - 1].value;

    // Calculate trend directions
    const bpFirst7Avg = bloodPressureTrend.slice(0, 7).reduce((sum, bp) => sum + bp.systolic, 0) / 7;
    const bpLast7Avg = bloodPressureTrend.slice(-7).reduce((sum, bp) => sum + bp.systolic, 0) / 7;
    const bpTrendDirection = bpLast7Avg < bpFirst7Avg - 3 ? 'decreasing' : bpLast7Avg > bpFirst7Avg + 3 ? 'increasing' : 'stable';

    const ldlFirst3Avg = ldlTrend.slice(0, 3).reduce((sum, l) => sum + l.value, 0) / 3;
    const ldlLast3Avg = ldlTrend.slice(-3).reduce((sum, l) => sum + l.value, 0) / 3;
    const ldlTrendDirection = ldlLast3Avg < ldlFirst3Avg - 5 ? 'decreasing' : ldlLast3Avg > ldlFirst3Avg + 5 ? 'increasing' : 'stable';

    await db.collection('patients').doc(uid).collection('cardiacHealth').doc('latest').set({
      plaqueData: {
        tpv: 245, // Total Plaque Volume mm³
        cadRads: 2,
        cadRadsDescription: 'Mild stenosis (25-49%) with non-obstructive CAD. Low-attenuation plaque present.',
        ffr: 0.88, // Fractional Flow Reserve
        pav: 18.5, // Percent Atheroma Volume %
        lrnc: 3.2, // Low Radiodensity NonCalcified plaque mm³
        scanDate: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      lipidPanel: {
        ldl: latestLDL,
        hdl: 58,
        triglycerides: 128,
        totalCholesterol: latestLDL + 58 + Math.round(128 / 5),
        testDate: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      metabolic: {
        hba1c: 5.4,
        fastingGlucose: 98,
        testDate: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      biomarkers: {
        apoB: 82,
        hsCRP: 0.8,
        lpA: 24,
        testDate: new Date(today.getTime() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      bloodPressureTrend,
      bloodPressureTrendDirection: bpTrendDirection,
      latestBloodPressure: `${latestBP.systolic}/${latestBP.diastolic}`,
      ldlTrend,
      ldlTrendDirection,
      updatedAt: Timestamp.now(),
    });
    console.log('Cardiac health data created with BP trend:', bloodPressureTrend.length, 'LDL trend:', ldlTrend.length);

    // 10. Create cognitive health data
    const generateMoodTrend = (): number[] => {
      const trend = [];
      for (let i = 0; i < 30; i++) {
        trend.push(Math.round((6 + Math.random() * 3 + (i / 30) * 1.5) * 10) / 10);
      }
      return trend;
    };

    const generateSleepData = (): { quality: number[]; hours: number[] } => {
      const quality = [];
      const hours = [];
      for (let i = 0; i < 30; i++) {
        quality.push(Math.round((6.5 + Math.random() * 3) * 10) / 10);
        hours.push(Math.round((6.5 + Math.random() * 2.5) * 10) / 10);
      }
      return { quality, hours };
    };

    const sleepData = generateSleepData();

    await db.collection('patients').doc(uid).collection('cognitiveHealth').doc('latest').set({
      brainMRI: {
        status: 'Normal',
        date: new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        findings: 'No evidence of infarct, mass, or hemorrhage. Normal brain parenchyma with age-appropriate volume.',
      },
      cognitiveAssessment: {
        moca: 28, // Montreal Cognitive Assessment (out of 30)
        date: new Date(today.getTime() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      },
      strokeRisk: {
        bloodPressure: {
          value: '118/76',
          status: 'on-target',
        },
        carotidPlaque: {
          value: 'None',
          status: 'on-target',
        },
        hba1c: {
          value: 5.8,
          status: 'attention',
        },
      },
      mentalHealth: {
        dass21: {
          depression: 4,
          anxiety: 6,
          stress: 10,
          date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        qols: {
          score: 82,
          date: new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        },
        moodTrend: generateMoodTrend(),
        sleepQuality: sleepData.quality,
        sleepHours: sleepData.hours,
      },
      updatedAt: Timestamp.now(),
    });
    console.log('Cognitive health data created');

    // 11. Create wellness logs (365 days of deterministic data)
    // Using seeded random for consistency across runs
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const POSITIVE_TAGS = ['Gym', 'Sauna', 'Nature', 'Social', 'Nutrition', 'Reading', 'Creative', 'Hydrated', 'Meditation', 'Good sleep', 'Outdoors', 'Stretching', 'Journaling', 'Music', 'Friends', 'Gratitude'];
    const NEGATIVE_TAGS = ['Conflict', 'Illness', 'Sedentary', 'Tired', 'Poor sleep', 'No exercise', 'Stress', 'Skipped meal', 'Alcohol', 'Anxious', 'Screens', 'Junk food', 'Lonely', 'Rushed', 'Caffeine', 'Late night'];
    const SYMPTOM_OPTIONS = ['Headache', 'Fatigue', 'Anxiety', 'Nausea', 'Insomnia', 'Dizziness', 'Back pain', 'Joint pain', 'Brain fog', 'Bloating', 'Cramps', 'Congestion', 'Shortness', 'Palpitations', 'Weakness', 'Chills'];

    const wellnessLogs = [];
    for (let i = 0; i < 365; i++) {
      const logDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = logDate.toISOString().split('T')[0];
      const seed = i + 12345; // Fixed seed for determinism

      // Create realistic variations with weekly patterns
      const dayOfWeek = logDate.getDay();
      const weekendBoost = (dayOfWeek === 0 || dayOfWeek === 6) ? 0.5 : 0;
      const seasonalFactor = Math.sin(i / 30 * Math.PI) * 0.3; // Monthly cycle

      // Base values with deterministic variation
      const baseMood = 6.5 + seasonalFactor + weekendBoost;
      const baseEnergy = 6.0 + seasonalFactor + weekendBoost;
      const baseStress = 4.5 - seasonalFactor - weekendBoost * 0.5;
      const baseSleepQuality = 6.5 + seasonalFactor + weekendBoost * 0.3;

      const mood = Math.round(Math.max(1, Math.min(10, baseMood + (seededRandom(seed) * 3 - 1.5))));
      const energy = Math.round(Math.max(1, Math.min(10, baseEnergy + (seededRandom(seed + 1) * 3 - 1.5))));
      const stress = Math.round(Math.max(1, Math.min(10, baseStress + (seededRandom(seed + 2) * 3 - 1.5))));
      const sleepQuality = Math.round(Math.max(1, Math.min(10, baseSleepQuality + (seededRandom(seed + 3) * 3 - 1.5))));
      const sleepHours = Math.round((6.5 + seededRandom(seed + 4) * 2.5) * 4) / 4; // 15-min increments

      // Deterministic tag selection
      const tags: string[] = [];
      const numPositive = Math.floor(seededRandom(seed + 5) * 3);
      const numNegative = Math.floor(seededRandom(seed + 6) * 2);
      for (let t = 0; t < numPositive; t++) {
        const tagIndex = Math.floor(seededRandom(seed + 10 + t) * POSITIVE_TAGS.length);
        if (!tags.includes(POSITIVE_TAGS[tagIndex])) tags.push(POSITIVE_TAGS[tagIndex]);
      }
      for (let t = 0; t < numNegative; t++) {
        const tagIndex = Math.floor(seededRandom(seed + 20 + t) * NEGATIVE_TAGS.length);
        if (!tags.includes(NEGATIVE_TAGS[tagIndex])) tags.push(NEGATIVE_TAGS[tagIndex]);
      }

      // Deterministic symptom selection
      const symptoms: string[] = [];
      const numSymptoms = Math.floor(seededRandom(seed + 7) * 2);
      for (let s = 0; s < numSymptoms; s++) {
        const symIndex = Math.floor(seededRandom(seed + 30 + s) * SYMPTOM_OPTIONS.length);
        if (!symptoms.includes(SYMPTOM_OPTIONS[symIndex])) symptoms.push(SYMPTOM_OPTIONS[symIndex]);
      }

      wellnessLogs.push({
        id: `wellness-${dateStr}`,
        date: dateStr,
        mood,
        energy,
        stress,
        sleepQuality,
        sleepHours,
        tags,
        symptoms,
        notes: i === 0 ? 'Feeling great today!' : null,
      });
    }

    // Batch write for efficiency
    const batchSize = 500;
    for (let i = 0; i < wellnessLogs.length; i += batchSize) {
      const batch = db.batch();
      const chunk = wellnessLogs.slice(i, i + batchSize);
      for (const log of chunk) {
        const ref = db.collection('patients').doc(uid).collection('wellnessLogs').doc(log.id);
        batch.set(ref, { ...log, createdAt: Timestamp.now() });
      }
      await batch.commit();
    }
    console.log('Wellness logs created:', wellnessLogs.length);

    // 12. Create food logs (for food logging status)
    const foodLogs = [];

    // Today's meals (partially logged)
    const todayStr = today.toISOString().split('T')[0];
    foodLogs.push(
      {
        id: `food-${todayStr}-breakfast`,
        date: todayStr,
        mealType: 'breakfast',
        description: 'Oatmeal with berries and walnuts',
        calories: 420,
        loggedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 30).toISOString(),
      },
      {
        id: `food-${todayStr}-lunch`,
        date: todayStr,
        mealType: 'lunch',
        description: 'Mediterranean salad with grilled chicken',
        calories: 580,
        loggedAt: new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 45).toISOString(),
      }
    );

    // Yesterday's meals (fully logged)
    const yesterdayDate = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
    foodLogs.push(
      {
        id: `food-${yesterdayStr}-breakfast`,
        date: yesterdayStr,
        mealType: 'breakfast',
        description: 'Greek yogurt parfait with granola',
        calories: 380,
        loggedAt: new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 7, 45).toISOString(),
      },
      {
        id: `food-${yesterdayStr}-lunch`,
        date: yesterdayStr,
        mealType: 'lunch',
        description: 'Quinoa bowl with roasted vegetables',
        calories: 520,
        loggedAt: new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 12, 30).toISOString(),
      },
      {
        id: `food-${yesterdayStr}-dinner`,
        date: yesterdayStr,
        mealType: 'dinner',
        description: 'Baked salmon with asparagus',
        calories: 640,
        loggedAt: new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 19, 15).toISOString(),
      },
      {
        id: `food-${yesterdayStr}-snack`,
        date: yesterdayStr,
        mealType: 'snack',
        description: 'Apple with almond butter',
        calories: 180,
        loggedAt: new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 15, 30).toISOString(),
      }
    );

    for (const log of foodLogs) {
      await db.collection('patients').doc(uid).collection('foodLogs').doc(log.id).set({
        ...log,
        createdAt: Timestamp.now(),
      });
    }
    console.log('Food logs created:', foodLogs.length);

    // 13. Create medication logs (for medication status)
    const medicationLogs = [];

    // Today's medication logs (morning meds taken, evening pending)
    const todayMorningTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 8, 15);
    medicationLogs.push(
      {
        id: `medlog-${todayStr}-med1`,
        date: todayStr,
        medicationId: 'med-1',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        scheduledTime: '08:00',
        takenAt: todayMorningTime.toISOString(),
        status: 'taken',
      },
      {
        id: `medlog-${todayStr}-med3`,
        date: todayStr,
        medicationId: 'med-3',
        medicationName: 'Aspirin',
        dosage: '81mg',
        scheduledTime: '08:00',
        takenAt: todayMorningTime.toISOString(),
        status: 'taken',
      },
      {
        id: `medlog-${todayStr}-med4-morning`,
        date: todayStr,
        medicationId: 'med-4',
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '08:00',
        takenAt: todayMorningTime.toISOString(),
        status: 'taken',
      }
    );

    // Yesterday's medication logs (all taken)
    const yesterdayMorning = new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 8, 10);
    const yesterdayEvening = new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 18, 5);
    const yesterdayBedtime = new Date(yesterdayDate.getFullYear(), yesterdayDate.getMonth(), yesterdayDate.getDate(), 21, 15);

    medicationLogs.push(
      {
        id: `medlog-${yesterdayStr}-med1`,
        date: yesterdayStr,
        medicationId: 'med-1',
        medicationName: 'Lisinopril',
        dosage: '10mg',
        scheduledTime: '08:00',
        takenAt: yesterdayMorning.toISOString(),
        status: 'taken',
      },
      {
        id: `medlog-${yesterdayStr}-med2`,
        date: yesterdayStr,
        medicationId: 'med-2',
        medicationName: 'Atorvastatin',
        dosage: '40mg',
        scheduledTime: '21:00',
        takenAt: yesterdayBedtime.toISOString(),
        status: 'taken',
      },
      {
        id: `medlog-${yesterdayStr}-med3`,
        date: yesterdayStr,
        medicationId: 'med-3',
        medicationName: 'Aspirin',
        dosage: '81mg',
        scheduledTime: '08:00',
        takenAt: yesterdayMorning.toISOString(),
        status: 'taken',
      },
      {
        id: `medlog-${yesterdayStr}-med4-morning`,
        date: yesterdayStr,
        medicationId: 'med-4',
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '08:00',
        takenAt: yesterdayMorning.toISOString(),
        status: 'taken',
      },
      {
        id: `medlog-${yesterdayStr}-med4-evening`,
        date: yesterdayStr,
        medicationId: 'med-4',
        medicationName: 'Metformin',
        dosage: '500mg',
        scheduledTime: '18:00',
        takenAt: yesterdayEvening.toISOString(),
        status: 'taken',
      }
    );

    for (const log of medicationLogs) {
      await db.collection('patients').doc(uid).collection('medicationLogs').doc(log.id).set({
        ...log,
        createdAt: Timestamp.now(),
      });
    }
    console.log('Medication logs created:', medicationLogs.length);

    console.log('Test patient seed completed successfully');

    return {
      success: true,
      patientId: uid,
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      message: 'Test patient Sarah Mitchell created successfully',
    };
  } catch (error) {
    console.error('Seed failed:', error);
    throw error;
  }
}

/**
 * Delete test patient and all data
 */
export async function deleteTestPatient(): Promise<{
  success: boolean;
  message: string;
}> {
  const auth = admin.auth();
  const db = admin.firestore();

  console.log('Deleting test patient...');

  try {
    // Delete auth user
    try {
      await auth.deleteUser(TEST_PATIENT_ID);
      console.log('Auth user deleted');
    } catch {
      console.log('Auth user not found');
    }

    // Delete user document
    await db.collection('users').doc(TEST_PATIENT_ID).delete();

    // Delete patient subcollections
    const subcollections = [
      'careTeam',
      'medications',
      'lifestyleTasks',
      'appointments',
      'streaks',
      'healthMetrics',
      'conversations',
      'cardiacHealth',
      'cognitiveHealth',
      'wellnessLogs',
      'foodLogs',
      'medicationLogs',
    ];

    for (const subcoll of subcollections) {
      const docs = await db.collection('patients').doc(TEST_PATIENT_ID).collection(subcoll).listDocuments();
      for (const doc of docs) {
        await doc.delete();
      }
    }

    // Delete patient document
    await db.collection('patients').doc(TEST_PATIENT_ID).delete();

    console.log('Test patient deleted successfully');

    return {
      success: true,
      message: 'Test patient deleted successfully',
    };
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
}
