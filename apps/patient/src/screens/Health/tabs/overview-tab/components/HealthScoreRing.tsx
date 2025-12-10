/**
 * Health Score Ring - Ring design selector
 */

import type { RingProps } from '../types';
import {
  RingDesign1,
  RingDesign2,
  RingDesign3,
  RingDesign4,
  RingDesign5,
  RingDesign6,
  RingDesign7,
  RingDesign8,
} from './rings';

interface HealthScoreRingProps extends RingProps {
  design: number;
}

export function HealthScoreRing({ score, design }: HealthScoreRingProps): React.ReactElement {
  switch (design) {
    case 1:
      return <RingDesign1 score={score} />;
    case 2:
      return <RingDesign2 score={score} />;
    case 3:
      return <RingDesign3 score={score} />;
    case 4:
      return <RingDesign4 score={score} />;
    case 5:
      return <RingDesign5 score={score} />;
    case 6:
      return <RingDesign6 score={score} />;
    case 7:
      return <RingDesign7 score={score} />;
    case 8:
      return <RingDesign8 score={score} />;
    default:
      return <RingDesign1 score={score} />;
  }
}
