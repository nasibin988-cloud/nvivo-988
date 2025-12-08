/**
 * Seed Cardiac Health Data
 *
 * Creates cardiac health data for the test patient:
 * - Plaque assessment (CCTA results)
 * - Lipid panel with historical trends
 * - Metabolic data
 * - Biomarkers
 * - Blood pressure trend (30 days)
 * - LDL trend (12 months)
 */

import { getFirestore, FieldValue } from 'firebase-admin/firestore';

interface SeedCardiacHealthOptions {
  patientId: string;
}

/**
 * Generate blood pressure trend data (last 30 days)
 * Simulates a patient working to lower their blood pressure
 */
function generateBloodPressureTrend(): Array<{ date: string; systolic: number; diastolic: number }> {
  const trend: Array<{ date: string; systolic: number; diastolic: number }> = [];
  const today = new Date();

  // Starting values (slightly elevated)
  let systolic = 138;
  let diastolic = 88;

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    // Gradual improvement with some natural variation
    const systolicVariation = Math.random() * 8 - 4; // -4 to +4
    const diastolicVariation = Math.random() * 6 - 3; // -3 to +3

    // Trending downward (improving)
    systolic = Math.max(110, Math.min(145, systolic + systolicVariation - 0.15));
    diastolic = Math.max(68, Math.min(92, diastolic + diastolicVariation - 0.1));

    trend.push({
      date: date.toISOString().split('T')[0],
      systolic: Math.round(systolic),
      diastolic: Math.round(diastolic),
    });
  }

  return trend;
}

/**
 * Generate LDL trend data (last 12 months)
 * Simulates a patient on statin therapy with improving LDL
 */
function generateLDLTrend(): Array<{ date: string; value: number }> {
  const trend: Array<{ date: string; value: number }> = [];
  const today = new Date();

  // Starting LDL (elevated)
  let ldl = 142;

  for (let i = 11; i >= 0; i--) {
    const date = new Date(today);
    date.setMonth(date.getMonth() - i);

    // Monthly variation with downward trend (medication effect)
    const variation = Math.random() * 10 - 5; // -5 to +5
    ldl = Math.max(55, Math.min(160, ldl + variation - 6)); // Trending down ~6 per month

    trend.push({
      date: date.toISOString().split('T')[0],
      value: Math.round(ldl),
    });
  }

  return trend;
}

/**
 * Seed cardiac health data
 */
export async function seedCardiacHealth(options: SeedCardiacHealthOptions): Promise<void> {
  const { patientId } = options;
  const db = getFirestore();

  const cardiacHealthRef = db.collection('patients').doc(patientId).collection('cardiacHealth');

  // Blood pressure trend data
  const bloodPressureTrend = generateBloodPressureTrend();
  const latestBP = bloodPressureTrend[bloodPressureTrend.length - 1];

  // LDL trend data
  const ldlTrend = generateLDLTrend();
  const latestLDL = ldlTrend[ldlTrend.length - 1].value;

  // Calculate trend direction for BP
  const bpFirst7Avg = bloodPressureTrend.slice(0, 7).reduce((sum, bp) => sum + bp.systolic, 0) / 7;
  const bpLast7Avg = bloodPressureTrend.slice(-7).reduce((sum, bp) => sum + bp.systolic, 0) / 7;
  const bpTrendDirection = bpLast7Avg < bpFirst7Avg - 3 ? 'decreasing' : bpLast7Avg > bpFirst7Avg + 3 ? 'increasing' : 'stable';

  // Calculate trend direction for LDL
  const ldlFirst3Avg = ldlTrend.slice(0, 3).reduce((sum, l) => sum + l.value, 0) / 3;
  const ldlLast3Avg = ldlTrend.slice(-3).reduce((sum, l) => sum + l.value, 0) / 3;
  const ldlTrendDirection = ldlLast3Avg < ldlFirst3Avg - 5 ? 'decreasing' : ldlLast3Avg > ldlFirst3Avg + 5 ? 'increasing' : 'stable';

  const cardiacData = {
    // Plaque Assessment (CCTA Results)
    plaqueData: {
      tpv: 245, // Total Plaque Volume mm³
      cadRads: 2,
      cadRadsDescription: 'Mild stenosis (25-49%) with non-obstructive CAD. Low-attenuation plaque present.',
      ffr: 0.88, // Fractional Flow Reserve
      pav: 18.5, // Percent Atheroma Volume %
      lrnc: 3.2, // Low Radiodensity NonCalcified plaque mm³
      scanDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 45 days ago
    },

    // Lipid Panel
    lipidPanel: {
      ldl: latestLDL,
      hdl: 58,
      triglycerides: 128,
      totalCholesterol: latestLDL + 58 + Math.round(128 / 5),
      testDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
    },

    // Metabolic
    metabolic: {
      hba1c: 5.4,
      fastingGlucose: 98,
      testDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 14 days ago
    },

    // Biomarkers
    biomarkers: {
      apoB: 82, // mg/dL - target < 90
      hsCRP: 0.8, // mg/L - target < 1
      lpA: 24, // nmol/L - target < 30
      testDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 21 days ago
    },

    // Blood Pressure Trend (30 days)
    bloodPressureTrend,
    bloodPressureTrendDirection: bpTrendDirection,
    latestBloodPressure: `${latestBP.systolic}/${latestBP.diastolic}`,

    // LDL Trend (12 months)
    ldlTrend,
    ldlTrendDirection,

    updatedAt: FieldValue.serverTimestamp(),
  };

  await cardiacHealthRef.doc('latest').set(cardiacData);
  console.log('Cardiac health data seeded successfully');
  console.log(`  BP Trend: ${bpTrendDirection} (${Math.round(bpFirst7Avg)} -> ${Math.round(bpLast7Avg)})`);
  console.log(`  LDL Trend: ${ldlTrendDirection} (${Math.round(ldlFirst3Avg)} -> ${Math.round(ldlLast3Avg)})`);
}

/**
 * Clear cardiac health data
 */
export async function clearCardiacHealth(patientId: string): Promise<void> {
  const db = getFirestore();
  const cardiacHealthRef = db.collection('patients').doc(patientId).collection('cardiacHealth');
  const snapshot = await cardiacHealthRef.get();
  const batch = db.batch();
  snapshot.docs.forEach((doc) => batch.delete(doc.ref));
  await batch.commit();
  console.log('Cardiac health data cleared');
}
