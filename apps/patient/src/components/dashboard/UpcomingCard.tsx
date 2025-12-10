/**
 * UpcomingCard - Upcoming Appointment Display
 *
 * Shows the next upcoming appointment with provider details,
 * date/time, and quick actions (directions, video call, calendar).
 *
 * Supports 3 design variants:
 * - Design 1: Floating Card (default)
 * - Design 2: Timeline Style
 * - Design 3: Compact Hero
 */

import {
  type UpcomingCardProps,
  EmptyState,
  Design1,
  Design2,
  Design3,
  UpcomingCardSkeleton,
} from './upcoming-card';

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function UpcomingCard({
  appointment,
  onViewMore,
  onViewAppointment,
  design = 1,
}: UpcomingCardProps): React.ReactElement {
  if (!appointment) {
    return <EmptyState />;
  }

  const props = { appointment, onViewMore, onViewAppointment };

  switch (design) {
    case 1:
      return <Design1 {...props} />;
    case 2:
      return <Design2 {...props} />;
    case 3:
      return <Design3 {...props} />;
    default:
      return <Design1 {...props} />;
  }
}

// Re-export for external use
export { UpcomingCardSkeleton };
export type { UpcomingCardProps } from './upcoming-card';
