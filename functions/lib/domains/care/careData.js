"use strict";
/**
 * Care Data Cloud Functions
 *
 * Provides all care-related data for the patient app:
 * - Care team members
 * - Medications and schedules
 * - Tasks and care plan goals
 * - Appointments
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCareData = getCareData;
exports.getCareTeam = getCareTeam;
exports.getMedications = getMedications;
exports.getMedicationSchedule = getMedicationSchedule;
exports.logMedicationDose = logMedicationDose;
exports.getTasks = getTasks;
exports.completeTask = completeTask;
exports.getCarePlanGoals = getCarePlanGoals;
exports.getAppointments = getAppointments;
const firestore_1 = require("firebase-admin/firestore");
// ============================================================================
// FUNCTIONS
// ============================================================================
function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
}
function getTodayEnd() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
}
/**
 * Get all care data for a patient
 */
async function getCareData(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const patientRef = db.collection('patients').doc(patientId);
    const todayStart = getTodayStart();
    const todayEnd = getTodayEnd();
    // Fetch all data in parallel
    const [careTeamSnapshot, medicationsSnapshot, dosesSnapshot, tasksSnapshot, goalsSnapshot, appointmentsSnapshot,] = await Promise.all([
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
    }));
    const medications = medicationsSnapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            startDate: ((_a = doc.data().startDate) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            refillDate: (_b = doc.data().refillDate) === null || _b === void 0 ? void 0 : _b.toDate(),
        });
    });
    const todaysDoses = dosesSnapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            scheduledTime: ((_a = doc.data().scheduledTime) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            takenAt: (_b = doc.data().takenAt) === null || _b === void 0 ? void 0 : _b.toDate(),
        });
    });
    const tasks = tasksSnapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            dueDate: ((_a = doc.data().dueDate) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            completedAt: (_b = doc.data().completedAt) === null || _b === void 0 ? void 0 : _b.toDate(),
        });
    });
    const goals = goalsSnapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            targetDate: ((_a = doc.data().targetDate) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            createdAt: ((_b = doc.data().createdAt) === null || _b === void 0 ? void 0 : _b.toDate()) || new Date(),
            milestones: doc.data().milestones || [],
        });
    });
    const appointments = appointmentsSnapshot.docs.map(doc => {
        var _a;
        return ({
            id: doc.id,
            ...doc.data(),
            dateTime: ((_a = doc.data().dateTime) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
        });
    });
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
async function getCareTeam(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const snapshot = await db
        .collection('patients')
        .doc(patientId)
        .collection('careTeam')
        .orderBy('isPrimary', 'desc')
        .get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
    }));
}
/**
 * Get medications
 */
async function getMedications(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const snapshot = await db
        .collection('patients')
        .doc(patientId)
        .collection('medications')
        .where('status', '==', 'active')
        .get();
    return snapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            startDate: ((_a = doc.data().startDate) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            refillDate: (_b = doc.data().refillDate) === null || _b === void 0 ? void 0 : _b.toDate(),
        });
    });
}
/**
 * Get today's medication schedule
 */
async function getMedicationSchedule(patientId) {
    const db = (0, firestore_1.getFirestore)();
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
    return snapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            scheduledTime: ((_a = doc.data().scheduledTime) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            takenAt: (_b = doc.data().takenAt) === null || _b === void 0 ? void 0 : _b.toDate(),
        });
    });
}
/**
 * Log medication dose
 */
async function logMedicationDose(patientId, doseId, action) {
    var _a, _b, _c, _d;
    const db = (0, firestore_1.getFirestore)();
    const doseRef = db
        .collection('patients')
        .doc(patientId)
        .collection('medicationDoses')
        .doc(doseId);
    const updateData = {
        status: action,
        ...(action === 'taken' ? { takenAt: firestore_1.FieldValue.serverTimestamp() } : {}),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    };
    await doseRef.update(updateData);
    const snapshot = await doseRef.get();
    return {
        id: snapshot.id,
        ...snapshot.data(),
        scheduledTime: ((_b = (_a = snapshot.data()) === null || _a === void 0 ? void 0 : _a.scheduledTime) === null || _b === void 0 ? void 0 : _b.toDate()) || new Date(),
        takenAt: (_d = (_c = snapshot.data()) === null || _c === void 0 ? void 0 : _c.takenAt) === null || _d === void 0 ? void 0 : _d.toDate(),
    };
}
/**
 * Get tasks
 */
async function getTasks(patientId) {
    const db = (0, firestore_1.getFirestore)();
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
    return snapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            dueDate: ((_a = doc.data().dueDate) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            completedAt: (_b = doc.data().completedAt) === null || _b === void 0 ? void 0 : _b.toDate(),
        });
    });
}
/**
 * Complete a task
 */
async function completeTask(patientId, taskId) {
    var _a, _b, _c, _d;
    const db = (0, firestore_1.getFirestore)();
    const taskRef = db
        .collection('patients')
        .doc(patientId)
        .collection('tasks')
        .doc(taskId);
    await taskRef.update({
        status: 'completed',
        completedAt: firestore_1.FieldValue.serverTimestamp(),
        updatedAt: firestore_1.FieldValue.serverTimestamp(),
    });
    const snapshot = await taskRef.get();
    return {
        id: snapshot.id,
        ...snapshot.data(),
        dueDate: ((_b = (_a = snapshot.data()) === null || _a === void 0 ? void 0 : _a.dueDate) === null || _b === void 0 ? void 0 : _b.toDate()) || new Date(),
        completedAt: (_d = (_c = snapshot.data()) === null || _c === void 0 ? void 0 : _c.completedAt) === null || _d === void 0 ? void 0 : _d.toDate(),
    };
}
/**
 * Get care plan goals
 */
async function getCarePlanGoals(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const snapshot = await db
        .collection('patients')
        .doc(patientId)
        .collection('carePlanGoals')
        .orderBy('status', 'asc')
        .get();
    return snapshot.docs.map(doc => {
        var _a, _b;
        return ({
            id: doc.id,
            ...doc.data(),
            targetDate: ((_a = doc.data().targetDate) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
            createdAt: ((_b = doc.data().createdAt) === null || _b === void 0 ? void 0 : _b.toDate()) || new Date(),
            milestones: doc.data().milestones || [],
        });
    });
}
/**
 * Get appointments
 */
async function getAppointments(patientId) {
    const db = (0, firestore_1.getFirestore)();
    const snapshot = await db
        .collection('patients')
        .doc(patientId)
        .collection('appointments')
        .where('status', 'in', ['scheduled', 'confirmed'])
        .orderBy('dateTime', 'asc')
        .get();
    return snapshot.docs.map(doc => {
        var _a;
        return ({
            id: doc.id,
            ...doc.data(),
            dateTime: ((_a = doc.data().dateTime) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
        });
    });
}
//# sourceMappingURL=careData.js.map