import { useAuth } from '../../contexts/AuthContext';
import { usePatientProfile } from '../../hooks/usePatientProfile';
import { LogOut, RefreshCw } from 'lucide-react';

export default function DashboardScreen() {
  const { patientId, signOut } = useAuth();
  const { data: profile, isLoading, error, refetch } = usePatientProfile(patientId);

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-surface rounded w-2/3" />
          <div className="h-4 bg-surface rounded w-1/2" />
          <div className="h-32 bg-surface rounded-2xl mt-6" />
          <div className="h-32 bg-surface rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
          <p className="text-red-400">Failed to load profile</p>
          <button
            onClick={() => refetch()}
            className="mt-2 flex items-center gap-2 text-accent-purple"
          >
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary p-4 pb-24">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">
            {getGreeting()}, {profile?.firstName ?? '--'}
          </h1>
          <p className="text-text-secondary text-sm mt-1">
            Welcome to your health dashboard
          </p>
        </div>
        <button
          onClick={signOut}
          className="p-2 rounded-xl bg-surface hover:bg-surface-elevated"
          title="Sign out"
        >
          <LogOut size={20} className="text-text-muted" />
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-surface rounded-2xl p-4 border border-border mb-4">
        <h2 className="text-lg font-semibold mb-3">Your Profile</h2>
        <div className="space-y-2 text-sm">
          <ProfileRow label="Name" value={profile ? `${profile.firstName} ${profile.lastName}` : '--'} />
          <ProfileRow label="Email" value={profile?.email ?? '--'} />
          <ProfileRow label="Phone" value={profile?.phone ?? '--'} />
          <ProfileRow label="Patient ID" value={patientId ?? '--'} />
        </div>
      </div>

      {/* Placeholder sections */}
      <div className="bg-surface rounded-2xl p-4 border border-border mb-4">
        <h2 className="text-lg font-semibold mb-2">Today's Tasks</h2>
        <p className="text-text-secondary text-sm">
          Task data will be displayed here after Phase 8 (Care Tab).
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-4 border border-border mb-4">
        <h2 className="text-lg font-semibold mb-2">Health Metrics</h2>
        <p className="text-text-secondary text-sm">
          Health data will be displayed here after Phase 6 (Health Tab).
        </p>
      </div>

      <div className="bg-surface rounded-2xl p-4 border border-border">
        <h2 className="text-lg font-semibold mb-2">Upcoming Appointments</h2>
        <p className="text-text-secondary text-sm">
          Appointments will be displayed here after Phase 11.
        </p>
      </div>
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="text-text-primary">{value}</span>
    </div>
  );
}
