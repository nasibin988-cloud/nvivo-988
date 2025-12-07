# NVIVO Patient App - Implementation Checklist

**Philosophy**: Complete one phase fully before moving to the next. No half-finished features.

---

## How to Use This Checklist

1. Work through phases in order (1 → 2 → 3 → ...)
2. Complete ALL items in a phase before moving on
3. After each feature, update BUILD_LOG.md with timestamp
4. Commit and push after each milestone (marked with *)
5. Never skip verification steps

---

## Phase 1: Shell & Navigation

### 1.1 Tab Bar Setup
- [ ] Create 5-tab bottom navigation
- [ ] Icons: Home, Heart, Clipboard, Book, GraduationCap
- [ ] Active/inactive states
- [ ] Tab routes work
- [ ] * Commit: "Add 5-tab navigation"

### 1.2 Header Component
- [ ] Create header with logo/title
- [ ] Add notification bell (right side)
- [ ] Add avatar/profile icon (right side)
- [ ] Bell shows badge count (hardcoded 0 for now)
- [ ] Avatar opens profile menu
- [ ] * Commit: "Add header with notifications and profile"

### 1.3 Profile Menu
- [ ] Create slide-out or modal menu
- [ ] Menu items: Profile, Devices, Notifications, Privacy, Help, About, Sign Out
- [ ] Sign Out calls auth signOut
- [ ] Other items show "Coming Soon" for now
- [ ] * Commit: "Add profile menu"

### 1.4 Placeholder Screens
- [ ] Create HomeScreen placeholder
- [ ] Create HealthScreen placeholder
- [ ] Create CareScreen placeholder
- [ ] Create JournalScreen placeholder
- [ ] Create LearnScreen placeholder
- [ ] Each shows tab name and "Coming Soon"
- [ ] * Commit: "Add placeholder screens for all tabs"

### 1.5 Phase 1 Verification
- [ ] All 5 tabs navigate correctly
- [ ] Header appears on all screens
- [ ] Profile menu opens and closes
- [ ] Sign out works
- [ ] No console errors

---

## Phase 2: HOME Tab

### 2.1 Seed Dashboard Data
- [ ] Update seed function to create:
  - [ ] healthMetrics for today (HR, BP, steps, sleep)
  - [ ] streaks/current document
  - [ ] microWins for today (2-3 challenges)
  - [ ] At least 1 upcoming appointment
  - [ ] At least 2 medications with today's schedule
  - [ ] At least 3 lifestyle tasks
- [ ] Run seed and verify in emulator UI
- [ ] * Commit: "Seed complete dashboard data"

### 2.2 Greeting Header
- [ ] Create GreetingHeader component
- [ ] Get firstName from usePatientProfile
- [ ] Compute time-based greeting (morning/afternoon/evening)
- [ ] Display: "Good {time}, {firstName}"
- [ ] Test with real data
- [ ] * Commit: "Add greeting header with real name"

### 2.3 Daily Progress Ring
- [ ] Create DailyProgressRing component
- [ ] Create useDailyProgress hook
- [ ] Hook computes: completed tasks + meds / total
- [ ] Display percentage in ring
- [ ] Show "X of Y completed" text
- [ ] Handle 0/0 case (no tasks/meds)
- [ ] * Commit: "Add daily progress ring"

### 2.4 Streak Card
- [ ] Create StreakCard component
- [ ] Create useStreak hook
- [ ] Hook reads from streaks/current
- [ ] Display "{N} day streak" with fire icon
- [ ] Show "Start your streak!" if 0
- [ ] * Commit: "Add streak card"

### 2.5 Quick Actions Bar
- [ ] Create QuickActionsBar component
- [ ] 4 buttons: Log Mood, Log Food, Message, Appointments
- [ ] Each button navigates to appropriate screen
- [ ] For now, show toast "Coming soon" if screen not built
- [ ] * Commit: "Add quick actions bar"

### 2.6 Cardiac Health Panel
- [ ] Create CardiacHealthPanel component
- [ ] Create useCardiacHealth hook
- [ ] Hook reads today's healthMetrics
- [ ] Display: Heart Rate, Blood Pressure, HRV
- [ ] Show "--" if no data
- [ ] Add insight text below (or "No insights yet")
- [ ] Tap navigates to Health tab
- [ ] * Commit: "Add cardiac health panel"

### 2.7 Cognitive Health Panel
- [ ] Create CognitiveHealthPanel component
- [ ] Create useCognitiveHealth hook
- [ ] Hook reads healthMetrics (sleep) + wellnessLogs (mood, stress)
- [ ] Display: Sleep hours, Focus/Mood, Stress
- [ ] Show "--" if no data
- [ ] Add insight text below
- [ ] Tap navigates to Health tab
- [ ] * Commit: "Add cognitive health panel"

### 2.8 Micro-Wins Widget
- [ ] Create MicroWinsWidget component
- [ ] Create useMicroWins hook
- [ ] Hook reads microWins/{today}
- [ ] Display 2-3 challenges with checkboxes
- [ ] "Done" marks as completed
- [ ] "Skip" marks as skipped
- [ ] Mutations update Firestore
- [ ] * Commit: "Add micro-wins widget"

### 2.9 Upcoming Card
- [ ] Create UpcomingCard component
- [ ] Create useNextAppointment hook
- [ ] Hook queries appointments where date >= today, limit 1
- [ ] Display: Provider name, specialty, date/time
- [ ] Show "No upcoming appointments" if none
- [ ] Tap navigates to appointment detail (or Care tab for now)
- [ ] * Commit: "Add upcoming appointment card"

### 2.10 Dashboard Skeleton
- [ ] Create DashboardSkeleton component
- [ ] Match layout of final dashboard
- [ ] Show while data is loading
- [ ] * Commit: "Add dashboard skeleton"

### 2.11 Phase 2 Verification
- [ ] Dashboard loads with all real data
- [ ] Greeting shows real name
- [ ] Progress ring shows real completion %
- [ ] Streak shows real streak count
- [ ] Cardiac panel shows real or "--" data
- [ ] Cognitive panel shows real or "--" data
- [ ] Micro-wins can be completed/skipped
- [ ] Upcoming shows real appointment
- [ ] Skeleton shows during loading
- [ ] No hardcoded values anywhere

---

## Phase 3: JOURNAL Tab

### 3.1 Journal Tab Structure
- [ ] Create JournalScreen with sub-tabs
- [ ] Sub-tabs: Wellness, Food, Exercise, Meds
- [ ] Tab switching works
- [ ] * Commit: "Add journal screen with sub-tabs"

### 3.2 Date Selector
- [ ] Create DateSelector component
- [ ] Left/right arrows to change date
- [ ] Shows current date in readable format
- [ ] Can't go to future dates
- [ ] * Commit: "Add journal date selector"

### 3.3 Wellness Tab
- [ ] Create WellnessTab component
- [ ] Create useWellnessLogs hook
- [ ] Create useAddWellnessLog mutation
- [ ] Sliders for: Mood (1-5), Energy (1-5), Stress (1-5)
- [ ] Symptom tag selector
- [ ] Notes text area
- [ ] Save button creates/updates document
- [ ] Shows existing data if already logged
- [ ] * Commit: "Add wellness logging"

### 3.4 Food Tab
- [ ] Create FoodTab component
- [ ] Create useFoodLogs hook
- [ ] Create useAddFoodLog mutation
- [ ] List of meals for selected date
- [ ] "Add Meal" button opens modal
- [ ] FoodLogModal: meal type, description, calories (optional)
- [ ] Empty state if no meals
- [ ] * Commit: "Add food logging"

### 3.5 Exercise Tab
- [ ] Create ExerciseTab component
- [ ] Create useExerciseLogs hook
- [ ] Create useAddExerciseLog mutation
- [ ] List of activities for selected date
- [ ] "Add Activity" button opens modal
- [ ] ExerciseLogModal: type, duration, intensity
- [ ] Empty state if no activities
- [ ] * Commit: "Add exercise logging"

### 3.6 Medication Tab
- [ ] Create MedicationTab component (journal view)
- [ ] Show today's medication schedule
- [ ] Each med: name, time, taken/pending status
- [ ] Can mark as taken from here
- [ ] Links to full medications screen
- [ ] * Commit: "Add medication tracker to journal"

### 3.7 Journal Skeleton
- [ ] Create JournalSkeleton for loading state
- [ ] * Commit: "Add journal skeleton"

### 3.8 Phase 3 Verification
- [ ] All journal sub-tabs work
- [ ] Can log wellness (saves to Firestore)
- [ ] Can add food log (saves to Firestore)
- [ ] Can add exercise log (saves to Firestore)
- [ ] Medication status reflects database
- [ ] Date navigation works
- [ ] All data is real, no hardcoded values

---

## Phase 4: HEALTH Tab

### 4.1 Health Screen Structure
- [ ] Create HealthScreen
- [ ] Category tabs: Cardiac, Metabolic, Mental, Activity
- [ ] * Commit: "Add health screen structure"

### 4.2 Health Score Card
- [ ] Create HealthScoreCard component
- [ ] Create useHealthScore hook
- [ ] Compute score from available data (or show "Insufficient data")
- [ ] Only show if enough data points exist
- [ ] * Commit: "Add health score card"

### 4.3 Metrics Grid
- [ ] Create MetricsGrid component
- [ ] Create useHealthData hook
- [ ] Display 6 metric cards per category
- [ ] Each card: label, value, unit, trend arrow
- [ ] "--" if no data
- [ ] * Commit: "Add metrics grid"

### 4.4 Metric Detail Screen
- [ ] Create MetricDetailScreen
- [ ] Create useMetricHistory hook
- [ ] Show metric value + trend chart
- [ ] 7-day, 30-day, 90-day tabs
- [ ] Empty state if no historical data
- [ ] * Commit: "Add metric detail screen"

### 4.5 Trends Chart
- [ ] Create TrendsChart component (reusable)
- [ ] Line chart with real data points
- [ ] No fake data points
- [ ] Empty state when no data
- [ ] * Commit: "Add trends chart component"

### 4.6 Digital Twin (Basic)
- [ ] Create DigitalTwinScreen
- [ ] For now: static heart image with metrics overlay
- [ ] (3D model can be added later)
- [ ] Show relevant cardiac metrics
- [ ] * Commit: "Add basic digital twin screen"

### 4.7 Health Skeleton
- [ ] Create HealthSkeleton
- [ ] * Commit: "Add health skeleton"

### 4.8 Phase 4 Verification
- [ ] Health screen loads with categories
- [ ] Metrics show real or "--" values
- [ ] Metric detail shows real history
- [ ] Charts render real data
- [ ] Digital twin displays metrics
- [ ] All data from database

---

## Phase 5: CARE Tab

### 5.1 Care Screen Structure
- [ ] Create CareScreen with sub-tabs
- [ ] Sub-tabs: Overview, Meds, Tasks, Team, Family
- [ ] * Commit: "Add care screen structure"

### 5.2 Care Overview
- [ ] Create CareOverviewTab
- [ ] Today's progress bar (tasks + meds)
- [ ] Medication schedule preview (next 3 doses)
- [ ] Tasks preview (next 3 tasks)
- [ ] Care team preview (primary provider)
- [ ] Upcoming appointment preview
- [ ] * Commit: "Add care overview tab"

### 5.3 Medications Sub-Tab
- [ ] Create MedicationsTab
- [ ] Create useMedications hook
- [ ] Create useMedicationSchedule hook
- [ ] Create useLogMedication mutation
- [ ] List all active medications
- [ ] Today's schedule with take/skip buttons
- [ ] Adherence percentage
- [ ] * Commit: "Add medications sub-tab"

### 5.4 Medication Detail Screen
- [ ] Create MedicationDetailScreen
- [ ] Show: name, dosage, frequency, prescribedBy, instructions
- [ ] History of doses taken
- [ ] Refill date if set
- [ ] * Commit: "Add medication detail screen"

### 5.5 Tasks Sub-Tab
- [ ] Create TasksTab
- [ ] Create useTasks hook
- [ ] Create useCompleteTask mutation
- [ ] List all active tasks
- [ ] Complete button marks as done
- [ ] Filter: Today, All
- [ ] * Commit: "Add tasks sub-tab"

### 5.6 Care Team Sub-Tab
- [ ] Create CareTeamTab
- [ ] Create useCareTeam hook
- [ ] List all care team members
- [ ] Primary badge on primary provider
- [ ] Tap to view detail
- [ ] * Commit: "Add care team sub-tab"

### 5.7 Provider Detail Screen
- [ ] Create ProviderDetailScreen
- [ ] Show: name, title, specialty, contact info
- [ ] Message button (goes to messaging)
- [ ] Call button (opens phone)
- [ ] * Commit: "Add provider detail screen"

### 5.8 Family Hub Sub-Tab
- [ ] Create FamilyHubTab
- [ ] Create useFamilyMembers hook
- [ ] List family members with access level
- [ ] Pending invitations
- [ ] "Invite" button
- [ ] * Commit: "Add family hub sub-tab"

### 5.9 Invite Family Screen
- [ ] Create InviteFamilyScreen
- [ ] Create useInviteFamily mutation
- [ ] Form: name, email, relationship, access level
- [ ] Submit creates pending member
- [ ] * Commit: "Add invite family screen"

### 5.10 Manage Family Access
- [ ] Create MemberDetailScreen
- [ ] Show member info + current permissions
- [ ] Create useUpdateAccess mutation
- [ ] Create useRevokeAccess mutation
- [ ] Update/revoke buttons
- [ ] * Commit: "Add manage family access"

### 5.11 Appointments
- [ ] Create AppointmentsScreen
- [ ] Create useAppointments hook
- [ ] List upcoming + past appointments
- [ ] Tab filter: Upcoming, Past
- [ ] * Commit: "Add appointments screen"

### 5.12 Appointment Detail Screen
- [ ] Create AppointmentDetailScreen
- [ ] Show: provider, date, time, type, reason
- [ ] "Add to Calendar" button (placeholder)
- [ ] "Join Call" for telehealth (placeholder)
- [ ] Visit prep button
- [ ] * Commit: "Add appointment detail screen"

### 5.13 Book Appointment (Basic)
- [ ] Create BookAppointmentScreen
- [ ] Provider selection
- [ ] Reason input
- [ ] Date/time selection (from seed data for now)
- [ ] Confirmation step
- [ ] Creates appointment document
- [ ] * Commit: "Add book appointment flow"

### 5.14 Care Skeleton
- [ ] Create CareSkeleton
- [ ] * Commit: "Add care skeleton"

### 5.15 Phase 5 Verification
- [ ] All care sub-tabs work
- [ ] Medications list from database
- [ ] Can log medication doses
- [ ] Tasks list from database
- [ ] Can complete tasks
- [ ] Care team from database
- [ ] Family hub works
- [ ] Appointments from database
- [ ] Can book appointment
- [ ] All data real

---

## Phase 6: LEARN Tab

### 6.1 Seed Learning Content
- [ ] Add articles collection with 5+ articles
- [ ] Add videos collection with 2+ videos
- [ ] Add quizzes collection with 1+ quiz
- [ ] * Commit: "Seed learning content"

### 6.2 Learn Screen
- [ ] Create LearnScreen
- [ ] Create useArticles hook
- [ ] Create useVideos hook
- [ ] Featured/recommended section
- [ ] Category filters
- [ ] * Commit: "Add learn screen"

### 6.3 Article Detail
- [ ] Create ArticleDetailScreen
- [ ] Create useArticleDetail hook
- [ ] Full article content
- [ ] Read time
- [ ] Track reading progress (optional)
- [ ] * Commit: "Add article detail screen"

### 6.4 Video Library
- [ ] Create VideoLibraryScreen
- [ ] Video cards with thumbnails
- [ ] Duration display
- [ ] * Commit: "Add video library"

### 6.5 Quiz Interface
- [ ] Create QuizScreen
- [ ] Create useQuiz hook
- [ ] Question display with options
- [ ] Submit and show results
- [ ] * Commit: "Add quiz interface"

### 6.6 Learn Skeleton
- [ ] Create LearnSkeleton
- [ ] * Commit: "Add learn skeleton"

### 6.7 Phase 6 Verification
- [ ] Articles load from database
- [ ] Can read full articles
- [ ] Videos display
- [ ] Quiz works
- [ ] All content from database

---

## Phase 7: Profile & Settings

### 7.1 Profile Screen
- [ ] Create ProfileScreen
- [ ] Display: name, email, phone, avatar
- [ ] "Edit" button
- [ ] * Commit: "Add profile screen"

### 7.2 Edit Profile Screen
- [ ] Create EditProfileScreen
- [ ] Form: firstName, lastName, phone
- [ ] Save updates patient document
- [ ] * Commit: "Add edit profile screen"

### 7.3 Wearables Screen
- [ ] Create WearablesScreen
- [ ] Create useWearableConnections hook
- [ ] List connected devices
- [ ] "Connect Device" button
- [ ] For MVP: placeholder for Terra widget
- [ ] * Commit: "Add wearables screen"

### 7.4 Notification Settings
- [ ] Create NotificationSettingsScreen
- [ ] Toggles for notification categories
- [ ] Save to patient settings
- [ ] * Commit: "Add notification settings"

### 7.5 Help & About
- [ ] Create HelpScreen with FAQ
- [ ] Create AboutScreen with version info
- [ ] * Commit: "Add help and about screens"

### 7.6 Phase 7 Verification
- [ ] Can view profile
- [ ] Can edit profile (saves to database)
- [ ] Wearables screen shows connections
- [ ] Settings save correctly
- [ ] All screens accessible from profile menu

---

## Phase 8: Polish

### 8.1 Loading States
- [ ] All screens show skeletons during load
- [ ] Skeletons match final layout

### 8.2 Error States
- [ ] All screens handle query errors
- [ ] Show retry button
- [ ] Friendly error messages

### 8.3 Empty States
- [ ] All lists show appropriate empty states
- [ ] Call-to-action where appropriate

### 8.4 Pull to Refresh
- [ ] Add to all list screens
- [ ] Actually refetches data

### 8.5 Animations (Basic)
- [ ] Page transitions
- [ ] Button feedback
- [ ] List item animations

### 8.6 Final Verification
- [ ] All features work end-to-end
- [ ] No console errors
- [ ] No hardcoded data
- [ ] All buttons functional
- [ ] All forms save to database
- [ ] All lists from database
- [ ] Loading/error/empty states work

---

## Commit Message Format

```
{type}: {description}

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation
- style: Formatting
- refactor: Code restructure
- test: Tests
- chore: Maintenance

Examples:
- feat: Add cardiac health panel with real-time data
- fix: Resolve medication logging mutation error
- docs: Update implementation checklist
```

---

## Daily Workflow

1. Pick next unchecked item from checklist
2. Create necessary files (types → hooks → components → screens)
3. Test with Firestore emulator
4. Verify no hardcoded values
5. Update BUILD_LOG.md with timestamp
6. Commit with descriptive message
7. Push to GitHub
8. Move to next item

---

## Emergency Debugging

If something breaks:

1. Check Firestore emulator UI (localhost:4000)
2. Check browser console for errors
3. Check Firebase functions logs
4. Verify project ID is `nvivo-988`
5. Verify auth UID matches patient ID path
6. Check firestore.rules allow access
7. Document the issue and fix in BUILD_LOG.md
