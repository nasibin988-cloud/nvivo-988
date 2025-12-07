# NVIVO Patient App - Complete Architecture

**Last Updated**: December 6, 2025
**Philosophy**: Zero fake data. Every value comes from the database. No buttons that don't work. No hardcoded insights.

---

## CRITICAL RULES - READ FIRST

1. **NO SHORTCUTS WHATSOEVER** - Every problem must be fixed properly. No workarounds, no hacks.
2. **Firebase Project ID is ALWAYS `nvivo-988`** - Never use any other project ID.
3. **Every value comes from the database** - No hardcoded data, no fake data.
4. **Every button must work** - If a feature isn't implemented, don't show the button.
5. **Verify before moving on** - Each feature must be tested and confirmed working.
6. **Log everything** - Update BUILD_LOG.md with timestamps for every significant action.
7. **Commit after each milestone** - Keep GitHub in sync with progress.

---

## App Layout Overview

```
+------------------------------------------+
|  [Logo]      NVIVO       [Bell] [Avatar] |  <- Header (Profile via Avatar)
+------------------------------------------+
|                                          |
|                                          |
|            SCREEN CONTENT                |
|                                          |
|                                          |
+------------------------------------------+
|  Home  |  Health  |  Care  |  Journal  |  Learn  |  <- Bottom Tab Bar
+------------------------------------------+
```

### Key Design Decisions

1. **Profile Icon (Top Right)** → Opens Profile/Settings menu
   - Profile is NOT a tab (rarely visited, shouldn't waste tab space)
   - Contains: Profile, Settings, Wearables, Help, Logout

2. **Notification Bell (Top Right)** → Opens Notifications
   - Shows unread count badge
   - Quick access without using tab

3. **5 Main Tabs** → Primary navigation
   - HOME: Daily dashboard, at-a-glance health
   - HEALTH: Deep dive into metrics, digital twin, trends
   - CARE: Care team, meds, tasks, appointments, family hub
   - JOURNAL: Daily logging (mood, food, exercise, meds)
   - LEARN: Educational content, articles, videos

---

## TAB 1: HOME (Dashboard)

**Purpose**: At-a-glance daily health status and quick actions

### Screen Layout (Top to Bottom)

```
+------------------------------------------+
| Good afternoon, Sarah              [Bell][Avatar]
+------------------------------------------+
| [ Daily Progress Ring ]     [ Streak: 7 days ]
+------------------------------------------+
| QUICK ACTIONS                            |
| [Log Mood] [Log Food] [Message] [Appt]   |
+------------------------------------------+
| CARDIAC HEALTH                    [→]    |
| +---------+ +---------+ +---------+      |
| | HR: 72  | | BP:     | | HRV: 45 |      |
| |   bpm   | | 118/76  | |   ms    |      |
| +---------+ +---------+ +---------+      |
| "Heart rate trending stable this week"   |
+------------------------------------------+
| COGNITIVE HEALTH                  [→]    |
| +---------+ +---------+ +---------+      |
| | Sleep   | | Focus   | | Stress  |      |
| | 7.2 hrs | | Good    | | Low     |      |
| +---------+ +---------+ +---------+      |
| "Sleep quality improved 12% this month"  |
+------------------------------------------+
| MICRO-WINS                               |
| [ ] Walk 10 min after lunch              |
| [ ] Take afternoon meds                  |
| [Skip] [Done]                            |
+------------------------------------------+
| UPCOMING                                 |
| Dr. Chen - Cardiology | Dec 13, 2:00 PM  |
+------------------------------------------+
```

### Components

| Component | Data Source | Purpose |
|-----------|-------------|---------|
| GreetingHeader | `patients/{id}` | "Good afternoon, {firstName}" |
| DailyProgressRing | Computed from tasks/meds | % completed today |
| StreakCard | `patients/{id}/streaks/current` | Current streak days |
| QuickActionsBar | Static | Navigate to log, message, appt |
| CardiacHealthPanel | `healthMetrics/{today}` | HR, BP, HRV summary |
| CognitiveHealthPanel | `healthMetrics/{today}` + `wellnessLogs` | Sleep, focus, stress |
| MicroWinsWidget | `microWins/today` | 2-3 daily challenges |
| UpcomingCard | `appointments` (next 1) | Next appointment preview |

### Hooks Required

```typescript
hooks/dashboard/
├── useDashboardData.ts      // Aggregates all dashboard data
├── useDailyProgress.ts      // Tasks + meds completion %
├── useStreak.ts             // Current streak
├── useCardiacHealth.ts      // HR, BP, HRV for today
├── useCognitiveHealth.ts    // Sleep, mood, stress
├── useMicroWins.ts          // Today's micro-wins
└── useNextAppointment.ts    // Single next appointment
```

---

## TAB 2: HEALTH (Metrics & Digital Health)

**Purpose**: Deep dive into health data, trends, and predictive insights

### Screen Layout

```
+------------------------------------------+
| HEALTH                         [Bell][Avatar]
+------------------------------------------+
| [ Health Score: 78 ]                     |
| "Great job! You're on track"             |
+------------------------------------------+
| [Cardiac] [Metabolic] [Mental] [Activity]|  <- Category Tabs
+------------------------------------------+
| CARDIAC METRICS                          |
| +---------+ +---------+ +---------+      |
| | Heart   | | Blood   | | HRV     |      |
| | Rate    | | Pressure| |         |      |
| | 72 bpm  | | 118/76  | | 45 ms   |      |
| | ↑ 3%    | | stable  | | ↑ 8%    |      |
| +---------+ +---------+ +---------+      |
+------------------------------------------+
| TRENDS (7 days)                    [→]   |
| [========Line Chart=========]            |
+------------------------------------------+
| DIGITAL TWIN                       [→]   |
| [3D Heart Model Preview]                 |
| "Tap to explore your heart"              |
+------------------------------------------+
| WHAT-IF SIMULATOR                  [→]   |
| "See how changes affect your health"     |
+------------------------------------------+
```

### Sub-Screens

| Screen | Purpose |
|--------|---------|
| MetricDetailScreen | Deep dive into single metric with history |
| DigitalTwinScreen | 3D interactive heart model |
| TrajectoryScreen | Health projections (6mo, 1yr, 2yr) |
| WhatIfScreen | Interactive simulator for lifestyle changes |
| HealthWeatherScreen | Daily health forecast |

### Hooks Required

```typescript
hooks/health/
├── useHealthData.ts         // Aggregate health data by category
├── useMetricHistory.ts      // Historical data for trends
├── useHealthScore.ts        // Computed overall score
├── useDigitalTwin.ts        // 3D model data
├── useTrajectory.ts         // Health projections
└── useWhatIf.ts             // Simulation engine
```

---

## TAB 3: CARE (Care Management)

**Purpose**: Manage care team, medications, tasks, appointments, and family access

### Screen Layout

```
+------------------------------------------+
| CARE                           [Bell][Avatar]
+------------------------------------------+
| [Overview] [Meds] [Tasks] [Team] [Family]|  <- Sub-tabs
+------------------------------------------+
| TODAY'S PROGRESS                         |
| [==========75%==========]                |
| 6 of 8 items completed                   |
+------------------------------------------+
| MEDICATIONS DUE                          |
| 8:00 AM  ✓ Lisinopril 10mg              |
| 8:00 AM  ✓ Aspirin 81mg                 |
| 6:00 PM  ○ Metformin 500mg   [Take Now] |
| 9:00 PM  ○ Atorvastatin 40mg            |
+------------------------------------------+
| TASKS FOR TODAY                          |
| ✓ Morning walk (30 min)                  |
| ○ Mediterranean lunch                    |
| ○ 10-min meditation          [Complete]  |
+------------------------------------------+
| UPCOMING APPOINTMENTS            [See All]|
| Dec 13 | Dr. Chen | Cardiology  [Prep]   |
+------------------------------------------+
| CARE TEAM                        [See All]|
| [Avatar] Dr. James Chen - Primary        |
| [Avatar] Dr. Emily Rodriguez             |
+------------------------------------------+
```

### Sub-Screens

| Screen | Purpose |
|--------|---------|
| MedicationsScreen | All medications with adherence stats |
| MedicationDetailScreen | Single med details, history |
| TasksScreen | All care tasks |
| TaskDetailScreen | Single task details |
| CareTeamScreen | All care team members |
| ProviderDetailScreen | Single provider with contact options |
| AppointmentsScreen | All appointments (upcoming + past) |
| AppointmentDetailScreen | Single appointment with prep |
| BookAppointmentScreen | Book new appointment |
| VideoCallScreen | Telehealth video call |
| FamilyHubScreen | Family members list |
| InviteFamilyScreen | Send family invite |
| MemberDetailScreen | Manage family member access |

### Hooks Required

```typescript
hooks/care/
├── useCareData.ts           // Aggregate care data
├── useMedications.ts        // All medications
├── useMedicationSchedule.ts // Today's med schedule
├── useMedicationLogging.ts  // Log dose mutation
├── useDrugInteractions.ts   // Interaction warnings
├── useTasks.ts              // All care tasks
├── useCarePlan.ts           // Care plan goals
└── useCareTeam.ts           // Care team members

hooks/appointments/
├── useAppointments.ts       // All appointments
├── useAppointmentDetail.ts  // Single appointment
├── useAvailability.ts       // Available slots
├── useBookAppointment.ts    // Booking mutation
└── useVisitPrep.ts          // Visit prep data

hooks/family/
├── useFamilyMembers.ts      // Family member list
├── useInviteFamily.ts       // Invite mutation
├── useUpdateAccess.ts       // Update permissions
└── useRevokeAccess.ts       // Revoke access
```

---

## TAB 4: JOURNAL (Health Logging)

**Purpose**: Daily logging of mood, food, exercise, and medication adherence

### Screen Layout

```
+------------------------------------------+
| JOURNAL                        [Bell][Avatar]
+------------------------------------------+
| [Wellness] [Food] [Exercise] [Meds]      |  <- Sub-tabs
+------------------------------------------+
| December 6, 2025                   [<] [>]|
+------------------------------------------+
| HOW ARE YOU FEELING?                     |
|                                          |
| Mood     [1]--[2]--[3]--[●4]--[5]       |
| Energy   [1]--[2]--[●3]--[4]--[5]       |
| Stress   [1]--[●2]--[3]--[4]--[5]       |
+------------------------------------------+
| SYMPTOMS                                 |
| [Fatigue] [Headache] [Pain] [+]          |
+------------------------------------------+
| NOTES                                    |
| "Felt good after morning walk..."        |
| [Record Voice Note]                      |
+------------------------------------------+
| TRENDS THIS WEEK               [See All] |
| [Mood sparkline chart]                   |
+------------------------------------------+
| [Save Log]                               |
+------------------------------------------+
```

### Sub-Tabs

| Tab | Purpose |
|-----|---------|
| Wellness | Mood, energy, stress, symptoms, notes |
| Food | Meal logging (manual or photo AI) |
| Exercise | Activity logging |
| Meds | Medication adherence tracker |

### Hooks Required

```typescript
hooks/journal/
├── useWellnessLogs.ts       // Mood/wellness data
├── useAddWellnessLog.ts     // Save wellness mutation
├── useFoodLogs.ts           // Food log data
├── useAddFoodLog.ts         // Save food mutation
├── useExerciseLogs.ts       // Exercise data
├── useAddExerciseLog.ts     // Save exercise mutation
└── useMedicationAdherence.ts // Med adherence view
```

---

## TAB 5: LEARN (Education)

**Purpose**: Educational content to help patients understand their health

### Screen Layout

```
+------------------------------------------+
| LEARN                          [Bell][Avatar]
+------------------------------------------+
| [ Search articles... ]                   |
+------------------------------------------+
| CONTINUE LEARNING                        |
| [Article card: "Understanding Blood..."] |
| Progress: 60%                            |
+------------------------------------------+
| RECOMMENDED FOR YOU                      |
| [Article] Heart-Healthy Diet Basics      |
| [Video] 5-Min Stress Relief Exercise     |
| [Quiz] Test Your Heart Knowledge         |
+------------------------------------------+
| CATEGORIES                               |
| [Heart Health] [Nutrition] [Exercise]    |
| [Mental Health] [Medications] [Sleep]    |
+------------------------------------------+
| POPULAR THIS WEEK                        |
| 1. Managing Blood Pressure at Home       |
| 2. The Mediterranean Diet Guide          |
| 3. Sleep and Heart Health Connection     |
+------------------------------------------+
```

### Sub-Screens

| Screen | Purpose |
|--------|---------|
| ArticleListScreen | Browse articles by category |
| ArticleDetailScreen | Read full article |
| VideoLibraryScreen | Browse video content |
| VideoPlayerScreen | Watch video |
| QuizScreen | Take knowledge quiz |
| QuizResultsScreen | View quiz results |

### Hooks Required

```typescript
hooks/learn/
├── useArticles.ts           // Article list
├── useArticleDetail.ts      // Single article
├── useVideos.ts             // Video list
├── useVideoProgress.ts      // Track video progress
├── useQuizzes.ts            // Available quizzes
├── useSubmitQuiz.ts         // Submit quiz results
└── useLearningProgress.ts   // Overall learning stats
```

---

## PROFILE MENU (Via Avatar Icon)

**Access**: Tap avatar icon in top-right header

### Menu Items

```
+------------------------------------------+
| [Avatar] Sarah Mitchell                  |
| sarah.mitchell@test.nvivo.health         |
+------------------------------------------+
| Profile & Settings              [→]      |
| Connected Devices               [→]      |
| Notifications                   [→]      |
| Privacy & Security              [→]      |
| Help & Support                  [→]      |
| About                           [→]      |
+------------------------------------------+
| [Sign Out]                               |
+------------------------------------------+
```

### Sub-Screens (Not Tabs)

| Screen | Purpose |
|--------|---------|
| ProfileScreen | View/edit personal info |
| EditProfileScreen | Edit profile form |
| WearablesScreen | Connected devices list |
| ConnectDeviceScreen | Terra widget for new device |
| DeviceDetailScreen | Single device details |
| NotificationSettingsScreen | Push notification prefs |
| PrivacySettingsScreen | Data sharing controls |
| SecurityScreen | Password, biometrics, 2FA |
| HelpCenterScreen | FAQ and help articles |
| ContactSupportScreen | Support form |
| AboutScreen | App version, legal |

---

## Firestore Collections

```
patients/{patientId}
├── /profile/current           # Height, weight, allergies, conditions
├── /careTeam/{memberId}       # Care team members
├── /medications/{medId}       # Active medications
├── /medicationLogs/{logId}    # Dose logs
├── /lifestyleTasks/{taskId}   # Care plan tasks
├── /taskLogs/{logId}          # Task completion logs
├── /appointments/{apptId}     # Appointments
├── /healthMetrics/{date}      # Daily health data (YYYY-MM-DD)
├── /wellnessLogs/{logId}      # Mood/wellness logs
├── /foodLogs/{logId}          # Food logs
├── /exerciseLogs/{logId}      # Exercise logs
├── /conversations/{convId}    # Messaging conversations
│   └── /messages/{msgId}      # Messages
├── /familyMembers/{memberId}  # Family hub members
├── /notifications/{notifId}   # Notifications
├── /streaks/current           # Streak data
├── /achievements/{achId}      # Earned achievements
├── /labResults/{labId}        # Lab results
├── /wearableConnections/{id}  # Connected wearables
└── /microWins/{date}          # Daily micro-wins

articles/{articleId}           # Educational articles
videos/{videoId}               # Educational videos
quizzes/{quizId}               # Knowledge quizzes
```

---

## Implementation Order

### Phase 1: Shell & Navigation (Current)
- [x] Login screen
- [x] Auth context
- [x] Basic dashboard
- [ ] Tab bar with 5 tabs
- [ ] Header with avatar + notification bell
- [ ] Profile menu (basic)
- [ ] Placeholder screens for all tabs

### Phase 2: HOME Tab (Complete It First)
- [ ] Greeting header with name from DB
- [ ] Daily progress ring (computed)
- [ ] Streak card
- [ ] Quick actions bar
- [ ] Cardiac health panel
- [ ] Cognitive health panel
- [ ] Micro-wins widget
- [ ] Upcoming appointment card
- [ ] Seed complete dashboard data

### Phase 3: JOURNAL Tab
- [ ] Date selector
- [ ] Wellness log (mood, energy, stress)
- [ ] Symptom tags
- [ ] Notes (text + voice)
- [ ] Food log list + modal
- [ ] Exercise log list + modal
- [ ] Medication tracker view
- [ ] Trends sparklines

### Phase 4: HEALTH Tab
- [ ] Health score card
- [ ] Category tabs
- [ ] Metrics grid
- [ ] Trends chart
- [ ] Metric detail screens
- [ ] Digital twin (3D heart)
- [ ] Trajectory projections
- [ ] What-if simulator

### Phase 5: CARE Tab
- [ ] Overview sub-tab
- [ ] Medications schedule
- [ ] Medication logging
- [ ] Tasks list + completion
- [ ] Care team list
- [ ] Provider detail + contact
- [ ] Appointments list
- [ ] Book appointment flow
- [ ] Visit prep questionnaire
- [ ] Video call (Agora)
- [ ] Family hub
- [ ] Invite family
- [ ] Manage access

### Phase 6: LEARN Tab
- [ ] Article list
- [ ] Article detail
- [ ] Video library
- [ ] Video player
- [ ] Quiz interface
- [ ] Learning progress

### Phase 7: Profile & Settings
- [ ] Profile view/edit
- [ ] Wearables (Terra integration)
- [ ] Notification settings
- [ ] Privacy settings
- [ ] Security settings
- [ ] Help & support

### Phase 8: Polish
- [ ] Skeleton loaders for all screens
- [ ] Error states
- [ ] Empty states
- [ ] Pull to refresh
- [ ] Animations
- [ ] Offline support

---

## Step-by-Step Implementation Checklist

### For Each Feature:

```markdown
1. [ ] Create types in packages/shared/types/
2. [ ] Create hook(s) in apps/patient/src/hooks/
3. [ ] Verify hook returns data from Firestore emulator
4. [ ] Create component(s) in apps/patient/src/components/
5. [ ] Create screen in apps/patient/src/screens/
6. [ ] Add route if needed in App.tsx
7. [ ] Test loading state (skeleton)
8. [ ] Test error state
9. [ ] Test empty state
10. [ ] Test with real data
11. [ ] Verify no hardcoded values
12. [ ] Update BUILD_LOG.md with timestamp
13. [ ] Commit to git with descriptive message
14. [ ] Push to GitHub
```

### Verification Questions:

- Does the data come from Firestore (check emulator UI)?
- Does it show "--" or empty state when data is missing?
- Does every button do something?
- Is there any hardcoded text that looks like real data?
- Does the loading state match the final layout?

---

## Test Credentials

```
Email:    sarah.mitchell@test.nvivo.health
Password: TestPatient2024!
Patient:  sarah-mitchell-test
```

## Emulator Ports

```
Auth:      127.0.0.1:9099
Firestore: 127.0.0.1:8080
Functions: 127.0.0.1:5001
UI:        127.0.0.1:4000
```

---

## Reference: Old Repo Locations

When implementing features, reference these old repo locations:

| Feature | Old Repo Path |
|---------|---------------|
| Home Screen | `/apps/patient/src/screens/HomeScreen.tsx` |
| Cardiac Panel | `/apps/patient/src/screens/home/components/CardiacHealthPanel.tsx` |
| Cognitive Panel | `/apps/patient/src/screens/home/components/CognitiveHealthPanel.tsx` |
| Digital Twin | `/apps/patient/src/screens/health/digital-twin/` |
| Care Team | `/apps/patient/src/screens/care/team/` |
| Medications | `/apps/patient/src/screens/care/medications/` |
| Family Hub | `/apps/patient/src/screens/family/` |
| Journal | `/apps/patient/src/screens/journal/` |
| Wearables | `/apps/patient/src/screens/Wearables/` |
| Appointments | `/apps/patient/src/screens/appointments/` |
| Video Call | `/apps/patient/src/screens/VideoCall/` |
| Messages | `/apps/patient/src/screens/Messaging/` |
| More/Settings | `/apps/patient/src/screens/More/` |
| Animations | `/apps/patient/src/animations/` |
| Skeletons | `/apps/patient/src/components/skeletons/` |

---

## Why This Structure?

### 1. **Tab Efficiency**
- 5 tabs = manageable cognitive load
- Profile/Settings in header = less frequently accessed
- Each tab has clear purpose

### 2. **Reduced Clutter**
- Sub-tabs within Care (instead of separate tabs)
- Logical grouping: meds + tasks + team + appts = Care
- Family hub in Care (it's about care management)

### 3. **Quick Access**
- Notification bell always visible
- Quick actions on Home for daily tasks
- One-tap to most common actions

### 4. **Progressive Disclosure**
- Home shows summary, tap for detail
- Each panel links to deeper screens
- Don't overwhelm with data

### 5. **Mobile-First**
- Bottom tab bar (thumb-friendly)
- Cards for touch targets
- Pull-to-refresh everywhere
