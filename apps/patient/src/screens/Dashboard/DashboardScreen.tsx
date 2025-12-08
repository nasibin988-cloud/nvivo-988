import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { usePatientProfile } from '../../hooks/usePatientProfile';
import {
  useStreak,
  useMicroWins,
  useCompleteMicroWin,
  useNextAppointment,
  useCardiacHealth,
  useCognitiveHealth,
  useTodayWellnessLog,
  useTodayMedicationStatus,
  useTodayFoodLogStatus,
} from '../../hooks/dashboard';
import {
  DashboardHero,
  DashboardHeroSkeleton,
  CardiacHealthPanel,
  CardiacHealthPanelSkeleton,
  CognitiveHealthPanel,
  CognitiveHealthPanelSkeleton,
  MicroWinsWidget,
  MicroWinsWidgetSkeleton,
  UpcomingCard,
  UpcomingCardSkeleton,
  AIInsightsPanel,
} from '../../components/dashboard';
import { Header, HeaderSkeleton } from '../../components/layout/Header';
import { RefreshCw } from 'lucide-react';

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { patientId, signOut } = useAuth();

  // Data hooks
  const {
    data: profile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = usePatientProfile(patientId);

  const { data: streak, isLoading: streakLoading } = useStreak(patientId);
  const { data: wellnessLog, isLoading: wellnessLoading } = useTodayWellnessLog(patientId);
  const { data: medicationStatus, isLoading: medicationLoading } = useTodayMedicationStatus(patientId);
  const { data: foodLogStatus, isLoading: foodLogLoading } = useTodayFoodLogStatus(patientId);
  const { data: microWins, isLoading: microWinsLoading } = useMicroWins(patientId);
  const { data: appointment, isLoading: appointmentLoading } = useNextAppointment(patientId);
  const { data: cardiacHealth, isLoading: cardiacLoading } = useCardiacHealth(patientId);
  const { data: cognitiveHealth, isLoading: cognitiveLoading } = useCognitiveHealth(patientId);

  // Mutations
  const completeMicroWin = useCompleteMicroWin(patientId);

  // Loading states
  const isHeaderLoading = profileLoading;
  const isHeroLoading = streakLoading || wellnessLoading || medicationLoading || foodLogLoading;

  // Error state
  if (profileError) {
    return (
      <div className="min-h-screen bg-background p-4 pb-24">
        <div className="bg-error-muted border border-error/20 rounded-theme-lg p-4">
          <p className="text-error">Failed to load your profile</p>
          <button
            onClick={() => refetchProfile()}
            className="mt-3 flex items-center gap-2 text-accent text-sm font-medium"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  // Handlers
  const handleProfileClick = () => {
    // TODO: Open profile modal/screen
    signOut();
  };

  const handleNotificationsClick = () => {
    navigate('/notifications');
  };

  const handleCompleteMicroWin = (challengeId: string) => {
    completeMicroWin.mutate({ challengeId, action: 'complete' });
  };

  const handleSkipMicroWin = (challengeId: string) => {
    completeMicroWin.mutate({ challengeId, action: 'skip' });
  };

  const handleUndoMicroWin = (challengeId: string) => {
    completeMicroWin.mutate({ challengeId, action: 'undo' });
  };

  const handleViewAppointment = (id: string) => {
    navigate(`/care/appointments/${id}`);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-4 pt-2">
        {/* Header */}
        {isHeaderLoading ? (
          <HeaderSkeleton />
        ) : (
          <Header
            firstName={profile?.firstName}
            onProfileClick={handleProfileClick}
            onNotificationsClick={handleNotificationsClick}
            onSettingsClick={() => navigate('/settings')}
            onSearchClick={() => navigate('/search')}
            unreadCount={0}
            streak={streak?.currentStreak ?? 0}
            healthScore={wellnessLog ? Math.round((wellnessLog.mood + wellnessLog.energy + wellnessLog.sleepQuality) / 3 * 10) : 80}
            medicationsToday={medicationStatus?.takenDoses ?? 0}
            appointmentsToday={appointment ? 1 : 0}
            avatarUrl={profile?.avatarUrl ?? undefined}
          />
        )}

        {/* Main Content */}
        <div className="space-y-4 mt-4">
          {/* Dashboard Hero - Vitality, Streak, Meals, Meds */}
          {isHeroLoading ? (
            <DashboardHeroSkeleton />
          ) : (
            <DashboardHero
              wellnessLog={wellnessLog}
              streak={streak}
              medicationStatus={medicationStatus}
              foodLogStatus={foodLogStatus}
            />
          )}

          {/* Micro-Wins */}
          {microWinsLoading ? (
            <MicroWinsWidgetSkeleton />
          ) : (
            <MicroWinsWidget
              microWins={microWins}
              onComplete={handleCompleteMicroWin}
              onSkip={handleSkipMicroWin}
              onUndo={handleUndoMicroWin}
            />
          )}

          {/* AI Insights */}
          <AIInsightsPanel onViewMore={() => navigate('/insights')} />

          {/* Cardiac Health Panel */}
          {cardiacLoading ? (
            <CardiacHealthPanelSkeleton />
          ) : (
            <CardiacHealthPanel
              data={cardiacHealth}
              onViewMore={() => navigate('/health?category=cardiac')}
            />
          )}

          {/* Cognitive Health Panel */}
          {cognitiveLoading ? (
            <CognitiveHealthPanelSkeleton />
          ) : (
            <CognitiveHealthPanel
              data={cognitiveHealth}
              onViewMore={() => navigate('/health?category=cognitive')}
            />
          )}

          {/* Upcoming Appointment */}
          {appointmentLoading ? (
            <UpcomingCardSkeleton />
          ) : (
            <UpcomingCard
              appointment={appointment}
              onViewMore={() => navigate('/care?tab=appointments')}
              onViewAppointment={handleViewAppointment}
              design={1}
            />
          )}
        </div>
      </div>
    </div>
  );
}
