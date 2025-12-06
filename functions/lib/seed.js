"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedTestPatient = seedTestPatient;
exports.deleteTestPatient = deleteTestPatient;
const admin = __importStar(require("firebase-admin"));
const firestore_1 = require("firebase-admin/firestore");
const TEST_PATIENT_ID = 'sarah-mitchell-test';
const TEST_EMAIL = 'sarah.mitchell@test.nvivo.health';
const TEST_PASSWORD = 'TestPatient2024!';
/**
 * Seed test patient with all data
 */
async function seedTestPatient() {
    const auth = admin.auth();
    const db = admin.firestore();
    console.log('Starting test patient seed...');
    try {
        // 1. Create auth user with specific UID
        let uid;
        try {
            const existingUser = await auth.getUserByEmail(TEST_EMAIL);
            uid = existingUser.uid;
            console.log('Auth user already exists:', uid);
        }
        catch (_a) {
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
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
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
            createdAt: firestore_1.Timestamp.now(),
            updatedAt: firestore_1.Timestamp.now(),
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
                createdAt: firestore_1.Timestamp.now(),
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
                startDate: firestore_1.Timestamp.now(),
                createdAt: firestore_1.Timestamp.now(),
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
                createdAt: firestore_1.Timestamp.now(),
            });
        }
        console.log('Lifestyle tasks created:', tasks.length);
        // 7. Create streak
        await db.collection('patients').doc(uid).collection('streaks').doc('current').set({
            currentStreak: 7,
            longestStreak: 23,
            lastActivityDate: new Date().toISOString().split('T')[0],
            streakStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            updatedAt: firestore_1.Timestamp.now(),
        });
        console.log('Streak created');
        // 8. Create upcoming appointments
        const today = new Date();
        const appointments = [
            {
                id: 'apt-1',
                providerId: 'care-team-1',
                providerName: 'Dr. James Chen',
                type: 'in-person',
                specialty: 'Cardiology',
                reason: 'Follow-up visit',
                date: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '10:00',
                duration: 30,
                status: 'confirmed',
                location: '456 Medical Plaza, Suite 200, San Francisco, CA',
                videoCallUrl: null,
                notes: 'Review lipid panel results',
            },
            {
                id: 'apt-2',
                providerId: 'care-team-2',
                providerName: 'Dr. Emily Rodriguez',
                type: 'telehealth',
                specialty: 'Primary Care',
                reason: 'Lab review',
                date: new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '14:30',
                duration: 20,
                status: 'confirmed',
                location: null,
                videoCallUrl: 'https://meet.nvivo.health/apt-2',
                notes: 'Review HbA1c results',
            },
            {
                id: 'apt-3',
                providerId: 'care-team-4',
                providerName: 'Michael Park, RD',
                type: 'in-person',
                specialty: 'Nutrition',
                reason: 'Diet coaching',
                date: new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                time: '11:00',
                duration: 45,
                status: 'scheduled',
                location: '456 Medical Plaza, Suite 150, San Francisco, CA',
                videoCallUrl: null,
                notes: 'Diet optimization session',
            },
        ];
        for (const apt of appointments) {
            await db.collection('patients').doc(uid).collection('appointments').doc(apt.id).set({
                ...apt,
                createdAt: firestore_1.Timestamp.now(),
            });
        }
        console.log('Appointments created:', appointments.length);
        console.log('Test patient seed completed successfully');
        return {
            success: true,
            patientId: uid,
            email: TEST_EMAIL,
            password: TEST_PASSWORD,
            message: 'Test patient Sarah Mitchell created successfully',
        };
    }
    catch (error) {
        console.error('Seed failed:', error);
        throw error;
    }
}
/**
 * Delete test patient and all data
 */
async function deleteTestPatient() {
    const auth = admin.auth();
    const db = admin.firestore();
    console.log('Deleting test patient...');
    try {
        // Delete auth user
        try {
            await auth.deleteUser(TEST_PATIENT_ID);
            console.log('Auth user deleted');
        }
        catch (_a) {
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
    }
    catch (error) {
        console.error('Delete failed:', error);
        throw error;
    }
}
//# sourceMappingURL=seed.js.map