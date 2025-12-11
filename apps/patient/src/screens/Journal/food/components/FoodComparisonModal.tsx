/**
 * Food Comparison Modal
 * Multi-food health grade analysis and comparison with parallel processing
 * Supports 2-5 food items via photo, text, or manual entry
 */

import { MultiComparisonModal } from './food-comparison';

interface FoodComparisonModalProps {
  onClose: () => void;
}

export default function FoodComparisonModal({
  onClose,
}: FoodComparisonModalProps): React.ReactElement {
  return <MultiComparisonModal onClose={onClose} />;
}
