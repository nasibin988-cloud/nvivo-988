/**
 * Menu Scanner Utilities
 */

/**
 * Generate a unique ID for menu items
 */
export function generateId(): string {
  return `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format price string for display
 */
export function formatPrice(price?: string): string {
  if (!price) return '';
  // Ensure it has a dollar sign
  if (!price.startsWith('$')) {
    return `$${price}`;
  }
  return price;
}

/**
 * Calculate nutrition confidence color
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'text-emerald-400';
  if (confidence >= 0.6) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Get confidence badge background
 */
export function getConfidenceBg(confidence: number): string {
  if (confidence >= 0.8) return 'bg-emerald-500/15';
  if (confidence >= 0.6) return 'bg-amber-500/15';
  return 'bg-red-500/15';
}

/**
 * Format confidence as percentage
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}
