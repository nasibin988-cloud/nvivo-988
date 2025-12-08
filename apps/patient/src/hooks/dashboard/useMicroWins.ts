import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpsCallable } from 'firebase/functions';
import { getFunctions } from '@nvivo/shared';

export interface MicroWinChallenge {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  skipped: boolean;
  completedAt: Date | null;
}

export interface MicroWins {
  date: string;
  challenges: MicroWinChallenge[];
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Hook to get today's MicroWins for a patient.
 * Calls the getDailyMicroWins Cloud Function which will:
 * - Return existing MicroWins if they exist
 * - Generate new ones from the challenge library if they don't
 */
export function useMicroWins(patientId: string | null) {
  const date = getTodayDate();

  return useQuery({
    queryKey: ['micro-wins', patientId, date],
    queryFn: async (): Promise<MicroWins | null> => {
      if (!patientId) return null;

      const functions = getFunctions();
      const getDailyMicroWins = httpsCallable<
        { patientId: string; challengeCount?: number },
        MicroWins
      >(functions, 'getDailyMicroWins');

      const result = await getDailyMicroWins({
        patientId,
        challengeCount: 5,
      });

      return result.data;
    },
    enabled: !!patientId,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 2,
  });
}

/**
 * Hook to complete or skip a MicroWin challenge.
 * Calls the completeMicroWin Cloud Function and uses optimistic updates
 * for immediate UI feedback.
 */
export function useCompleteMicroWin(patientId: string | null) {
  const queryClient = useQueryClient();
  const date = getTodayDate();

  return useMutation({
    mutationFn: async ({ challengeId, action }: { challengeId: string; action: 'complete' | 'skip' | 'undo' }) => {
      if (!patientId) throw new Error('No patient ID');

      const functions = getFunctions();
      const completeMicroWin = httpsCallable<
        { patientId: string; challengeId: string; action: 'complete' | 'skip' | 'undo' },
        MicroWins
      >(functions, 'completeMicroWin');

      const result = await completeMicroWin({
        patientId,
        challengeId,
        action,
      });

      return result.data;
    },
    // Optimistic update for immediate UI feedback
    onMutate: async ({ challengeId, action }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['micro-wins', patientId, date] });

      // Snapshot the previous value
      const previousData = queryClient.getQueryData<MicroWins>(['micro-wins', patientId, date]);

      // Optimistically update to the new value
      if (previousData) {
        queryClient.setQueryData<MicroWins>(['micro-wins', patientId, date], {
          ...previousData,
          challenges: previousData.challenges.map((c) => {
            if (c.id === challengeId) {
              if (action === 'undo') {
                return {
                  ...c,
                  completed: false,
                  skipped: false,
                  completedAt: null,
                };
              }
              return {
                ...c,
                completed: action === 'complete',
                skipped: action === 'skip',
                completedAt: action === 'complete' ? new Date() : null,
              };
            }
            return c;
          }),
        });
      }

      // Return context with previous data for rollback
      return { previousData };
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData(['micro-wins', patientId, date], context.previousData);
      }
    },
    onSuccess: (data) => {
      // Update cache with the actual server response
      queryClient.setQueryData(['micro-wins', patientId, date], data);
    },
    onSettled: () => {
      // Invalidate to refetch fresh data
      queryClient.invalidateQueries({ queryKey: ['micro-wins', patientId, date] });
    },
  });
}
