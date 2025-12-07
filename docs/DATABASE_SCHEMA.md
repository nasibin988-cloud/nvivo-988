# NVIVO Patient App - Database Schema

**Firebase Project**: `nvivo-988`
**Last Updated**: December 6, 2025

---

## Core Collections

### users/{uid}

User authentication and role mapping.

```typescript
interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'patient' | 'clinician' | 'admin';
  patientId: string | null;  // same as uid for patients
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### patients/{patientId}

Patient profile and demographics.

```typescript
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;  // YYYY-MM-DD
  email: string;
  phone: string;
  avatarUrl: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## Patient Subcollections

### patients/{patientId}/profile/current

Extended health profile (single document).

```typescript
interface PatientProfile {
  height: { value: number; unit: 'cm' | 'in' };
  weight: { value: number; unit: 'kg' | 'lb' };
  bloodType: string | null;
  allergies: string[];
  conditions: string[];
  updatedAt: Timestamp;
}
```

### patients/{patientId}/careTeam/{memberId}

Care team members.

```typescript
interface CareTeamMember {
  id: string;
  name: string;
  title: string;
  specialty: 'cardiology' | 'primary_care' | 'nutrition' | 'care_coordination' | 'mental_health';
  role: string;
  email: string;
  phone: string;
  avatarUrl: string | null;
  isPrimary: boolean;
  createdAt: Timestamp;
}
```

### patients/{patientId}/medications/{medicationId}

Active medications.

```typescript
interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  scheduledTimes: string[];  // ['08:00', '20:00']
  instructions: string;
  prescribedBy: string;
  startDate: Timestamp;
  status: 'active' | 'paused' | 'discontinued';
  refillDate: Timestamp | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/medicationLogs/{logId}

Medication dose logs.

```typescript
interface MedicationLog {
  id: string;
  medicationId: string;
  scheduledTime: Timestamp;
  status: 'taken' | 'missed' | 'skipped';
  takenAt: Timestamp | null;
  notes: string | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/lifestyleTasks/{taskId}

Care plan lifestyle tasks.

```typescript
interface LifestyleTask {
  id: string;
  category: 'exercise' | 'nutrition' | 'sleep' | 'mindset' | 'other';
  title: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'custom';
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'paused';
  assignedBy: string;
  createdAt: Timestamp;
}
```

### patients/{patientId}/taskLogs/{logId}

Task completion logs.

```typescript
interface TaskLog {
  id: string;
  taskId: string;
  date: string;  // YYYY-MM-DD
  completed: boolean;
  completedAt: Timestamp | null;
  notes: string | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/appointments/{appointmentId}

Appointments.

```typescript
interface Appointment {
  id: string;
  providerId: string;
  providerName: string;
  type: 'in-person' | 'telehealth';
  specialty: string;
  reason: string;
  date: string;  // YYYY-MM-DD
  time: string;  // HH:MM
  duration: number;  // minutes
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  location: string | null;
  videoCallUrl: string | null;
  visitPrepCompleted: boolean;
  notes: string | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/healthMetrics/{date}

Daily health metrics (date = YYYY-MM-DD).

```typescript
interface HealthMetrics {
  date: string;
  steps: number | null;
  activeMinutes: number | null;
  caloriesBurned: number | null;
  heartRate: {
    avg: number;
    min: number;
    max: number;
    resting: number;
  } | null;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  } | null;
  bloodGlucose: number | null;
  weight: number | null;
  sleep: {
    duration: number;  // hours
    quality: number;   // 1-5
    deep: number;      // hours
    rem: number;       // hours
    light: number;     // hours
  } | null;
  hrv: number | null;
  source: 'manual' | 'wearable' | 'device';
  updatedAt: Timestamp;
}
```

### patients/{patientId}/wellnessLogs/{logId}

Daily wellness/mood logs.

```typescript
interface WellnessLog {
  id: string;
  date: string;  // YYYY-MM-DD
  mood: number;  // 1-5
  energy: number;  // 1-5
  stress: number;  // 1-5
  sleepQuality: number;  // 1-5
  symptoms: string[];
  notes: string | null;
  voiceNoteUrl: string | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/foodLogs/{logId}

Food/meal logs.

```typescript
interface FoodLog {
  id: string;
  date: string;  // YYYY-MM-DD
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  description: string;
  calories: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  photoUrl: string | null;
  notes: string | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/exerciseLogs/{logId}

Exercise/activity logs.

```typescript
interface ExerciseLog {
  id: string;
  date: string;  // YYYY-MM-DD
  type: string;
  duration: number;  // minutes
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned: number | null;
  heartRateAvg: number | null;
  notes: string | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/conversations/{conversationId}

Messaging conversations.

```typescript
interface Conversation {
  id: string;
  participantIds: string[];
  participantNames: { [id: string]: string };
  lastMessage: string;
  lastMessageAt: Timestamp;
  unreadCount: number;
  createdAt: Timestamp;
}
```

### patients/{patientId}/conversations/{conversationId}/messages/{messageId}

Messages within a conversation.

```typescript
interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  type: 'text' | 'image' | 'file';
  attachmentUrl: string | null;
  read: boolean;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/familyMembers/{memberId}

Family hub members.

```typescript
interface FamilyMember {
  id: string;
  name: string;
  email: string;
  relationship: 'spouse' | 'parent' | 'child' | 'sibling' | 'caregiver' | 'other';
  accessLevel: 'view' | 'full';
  permissions: string[];
  status: 'active' | 'pending' | 'revoked';
  invitedAt: Timestamp;
  acceptedAt: Timestamp | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/notifications/{notificationId}

Notifications.

```typescript
interface Notification {
  id: string;
  type: 'appointment' | 'medication' | 'message' | 'task' | 'insight' | 'achievement';
  title: string;
  body: string;
  data: Record<string, unknown> | null;
  read: boolean;
  readAt: Timestamp | null;
  createdAt: Timestamp;
}
```

### patients/{patientId}/streaks/current

Streak tracking (single document).

```typescript
interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;  // YYYY-MM-DD
  streakStartDate: string;   // YYYY-MM-DD
  updatedAt: Timestamp;
}
```

### patients/{patientId}/microWins/{date}

Daily micro-wins (date = YYYY-MM-DD).

```typescript
interface MicroWins {
  date: string;
  challenges: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
    skipped: boolean;
    completedAt: Timestamp | null;
  }>;
  createdAt: Timestamp;
}
```

### patients/{patientId}/achievements/{achievementId}

Earned achievements.

```typescript
interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  earnedAt: Timestamp;
}
```

### patients/{patientId}/labResults/{labId}

Lab results.

```typescript
interface LabResult {
  id: string;
  date: string;  // YYYY-MM-DD
  orderedBy: string;
  type: string;
  results: Array<{
    name: string;
    value: number;
    unit: string;
    range: { min: number; max: number };
    status: 'normal' | 'low' | 'high';
  }>;
  createdAt: Timestamp;
}
```

### patients/{patientId}/wearableConnections/{connectionId}

Connected wearable devices.

```typescript
interface WearableConnection {
  id: string;
  provider: 'apple_health' | 'fitbit' | 'garmin' | 'oura' | 'whoop' | 'dexcom';
  status: 'connected' | 'disconnected' | 'error';
  lastSyncAt: Timestamp | null;
  connectedAt: Timestamp;
  metadata: Record<string, unknown>;
}
```

---

## Global Collections

### articles/{articleId}

Educational articles.

```typescript
interface Article {
  id: string;
  title: string;
  summary: string;
  content: string;
  category: 'heart_health' | 'nutrition' | 'exercise' | 'mental_health' | 'medications' | 'sleep';
  readTime: number;  // minutes
  imageUrl: string | null;
  authorName: string;
  publishedAt: Timestamp;
  tags: string[];
}
```

### videos/{videoId}

Educational videos.

```typescript
interface Video {
  id: string;
  title: string;
  description: string;
  category: string;
  duration: number;  // seconds
  thumbnailUrl: string;
  videoUrl: string;
  publishedAt: Timestamp;
}
```

### quizzes/{quizId}

Knowledge quizzes.

```typescript
interface Quiz {
  id: string;
  title: string;
  description: string;
  category: string;
  questions: Array<{
    id: string;
    question: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
  }>;
  createdAt: Timestamp;
}
```

---

## Firestore Security Rules

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Patients can only access their own patient data
    match /patients/{patientId} {
      allow read, write: if request.auth != null && request.auth.uid == patientId;

      // All subcollections follow the same rule
      match /{subcollection}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == patientId;
      }
    }

    // Global collections (articles, videos, quizzes) are read-only for authenticated users
    match /articles/{articleId} {
      allow read: if request.auth != null;
      allow write: if false;  // Admin only via Functions
    }

    match /videos/{videoId} {
      allow read: if request.auth != null;
      allow write: if false;
    }

    match /quizzes/{quizId} {
      allow read: if request.auth != null;
      allow write: if false;
    }
  }
}
```

---

## Index Requirements

Create these indexes in `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "appointments",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "date", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "medicationLogs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "medicationId", "order": "ASCENDING" },
        { "fieldPath": "scheduledTime", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "healthMetrics",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "date", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "notifications",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "read", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```
