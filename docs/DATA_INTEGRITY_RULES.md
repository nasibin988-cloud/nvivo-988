# NVIVO Patient App - Data Integrity Rules

## THE GOLDEN RULE

# ⚠️ ABSOLUTELY NO HARDCODED VALUES - EVER ⚠️

This is the most important rule in the entire codebase. Every single piece of data that appears in the UI **MUST** come from:

1. **Firestore database** (via hooks that query real collections)
2. **Firebase Auth** (for user identity)
3. **Computed values** derived from database data
4. **Static labels** (button text, headers - NOT data that looks like real data)

---

## What This Means

### ❌ NEVER DO THIS:

```typescript
// WRONG - Hardcoded user data
const userName = "Sarah";

// WRONG - Hardcoded health metrics
const heartRate = 72;
const steps = 8432;
const sleepHours = 7.5;

// WRONG - Hardcoded streak
const currentStreak = 7;

// WRONG - Hardcoded appointments
const nextAppointment = {
  provider: "Dr. Chen",
  date: "Dec 13",
  time: "2:00 PM"
};

// WRONG - Placeholder that looks real
<Text>Heart Rate: 72 bpm</Text>

// WRONG - Fake loading states with real-looking data
{isLoading ? <Skeleton /> : <Text>72 bpm</Text>}
// ^ Even if this shows real data when loaded, the structure suggests
// someone might accidentally leave "72 bpm" in there
```

### ✅ ALWAYS DO THIS:

```typescript
// CORRECT - Data from hook that queries Firestore
const { data: profile, isLoading, error } = usePatientProfile(patientId);

// CORRECT - Computed greeting from real data
const greeting = profile?.firstName
  ? `Good ${timeOfDay}, ${profile.firstName}`
  : null;

// CORRECT - Handle all states
if (isLoading) return <DashboardSkeleton />;
if (error) return <ErrorState onRetry={refetch} />;
if (!profile) return <EmptyState message="Profile not found" />;

// CORRECT - Display real data or explicit empty state
<Text>{profile.firstName}</Text>

// CORRECT - Metrics with proper empty handling
const heartRate = metrics?.heartRate?.resting;
<MetricCard
  label="Heart Rate"
  value={heartRate ?? null}  // null triggers empty state
  unit="bpm"
/>

// CORRECT - Empty state is explicit, not fake data
{heartRate !== null ? (
  <Text>{heartRate} bpm</Text>
) : (
  <Text className="text-muted">No data</Text>
)}
```

---

## The Empty State Pattern

Every data display component MUST handle these states:

```typescript
interface DataDisplayProps {
  value: number | string | null | undefined;
  // null/undefined = no data available
}

function MetricDisplay({ value, label, unit }: DataDisplayProps) {
  // Case 1: No data
  if (value === null || value === undefined) {
    return (
      <div className="metric-card empty">
        <span className="label">{label}</span>
        <span className="value text-muted">—</span>
        {/* Note: "—" (em dash) or "No data", NEVER a fake number */}
      </div>
    );
  }

  // Case 2: Real data
  return (
    <div className="metric-card">
      <span className="label">{label}</span>
      <span className="value">{value} {unit}</span>
    </div>
  );
}
```

---

## Skeleton Loaders

Skeleton loaders should NEVER contain text that looks like data:

```typescript
// ❌ WRONG - Skeleton with fake-looking content
function MetricSkeleton() {
  return <div className="animate-pulse">72 bpm</div>;
}

// ✅ CORRECT - Skeleton with abstract shapes
function MetricSkeleton() {
  return (
    <div className="metric-card">
      <div className="h-4 w-20 bg-surface-2 rounded animate-pulse" />
      <div className="h-8 w-16 bg-surface-2 rounded animate-pulse mt-2" />
    </div>
  );
}
```

---

## Why This Matters

1. **Trust**: Users must trust that data shown is THEIR real data
2. **Debugging**: Fake data masks bugs where real data isn't loading
3. **Testing**: We can't verify the app works if we can't distinguish real from fake
4. **Demo Mode**: If we need demo data, it comes from seeded Firestore, not hardcoded

---

## The Seed Function Is Your Demo Data

When you need to demonstrate the app:

1. Run the seed function to create test patient data
2. The app displays that seeded data
3. Every value shown came from Firestore
4. Changing seed data changes what the app shows

```bash
# Seed test data
curl -X POST http://127.0.0.1:5001/nvivo-988/us-central1/seedTestPatientFn \
  -H "Content-Type: application/json" \
  -d '{"data":{}}'
```

---

## Verification Checklist

Before committing ANY component, ask:

- [ ] Does this component receive data via props or hooks?
- [ ] Is the hook querying a real Firestore collection?
- [ ] What happens when the data is `null`? (Must show empty state)
- [ ] What happens when the data is loading? (Must show skeleton)
- [ ] What happens when there's an error? (Must show error state)
- [ ] Is there ANY number or text that I typed instead of getting from data?
- [ ] Could someone mistake this for real data when it's not?

---

## Exceptions (Very Few)

The ONLY acceptable "hardcoded" values are:

1. **UI Labels**: "Heart Rate", "Steps", "Sleep" - these are labels, not data
2. **Units**: "bpm", "steps", "hrs" - these describe the data format
3. **Static Instructions**: "Tap to log mood", "Pull to refresh"
4. **Empty State Messages**: "No appointments scheduled", "No data available"
5. **Error Messages**: "Failed to load. Tap to retry."

---

## Enforcement

If you see hardcoded data during code review:

1. **Reject the PR immediately**
2. Require the developer to:
   - Create the proper hook
   - Query the real collection
   - Handle loading/error/empty states
   - Verify with Firestore emulator

There are NO exceptions to this rule.
