/**
 * LoadingSpinner - Consistent loading indicator
 */

import React from 'react';
import { Loader2 } from 'lucide-react';

export type SpinnerSize = 'sm' | 'md' | 'lg';
export type SpinnerColor = 'default' | 'primary' | 'white';

export interface LoadingSpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
  className?: string;
}

const sizeConfig: Record<SpinnerSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

const colorConfig: Record<SpinnerColor, string> = {
  default: 'text-text-muted',
  primary: 'text-primary',
  white: 'text-white',
};

export function LoadingSpinner({
  size = 'md',
  color = 'default',
  className = '',
}: LoadingSpinnerProps): React.ReactElement {
  return (
    <Loader2
      size={sizeConfig[size]}
      className={`animate-spin ${colorConfig[color]} ${className}`}
    />
  );
}
