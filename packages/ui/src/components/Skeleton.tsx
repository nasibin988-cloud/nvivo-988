/**
 * Skeleton - Loading placeholder component
 */

import React from 'react';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
}

export function Skeleton({
  className = '',
  variant = 'rectangular',
  width,
  height,
  animate = true,
}: SkeletonProps): React.ReactElement {
  const baseClasses = 'bg-white/[0.06]';
  const animateClass = animate ? 'animate-pulse' : '';

  const variantClasses: Record<typeof variant, string> = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg',
  };

  const style: React.CSSProperties = {
    width: width ?? '100%',
    height: height ?? (variant === 'text' ? '1em' : '100%'),
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animateClass} ${className}`}
      style={style}
    />
  );
}

// Compound components for common patterns
export function SkeletonText({
  lines = 1,
  className = '',
}: {
  lines?: number;
  className?: string;
}): React.ReactElement {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          height="0.875rem"
          width={i === lines - 1 && lines > 1 ? '75%' : '100%'}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({
  className = '',
}: {
  className?: string;
}): React.ReactElement {
  return (
    <div className={`bg-surface rounded-2xl border border-border p-5 ${className}`}>
      <Skeleton height={20} width="40%" className="mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
}
