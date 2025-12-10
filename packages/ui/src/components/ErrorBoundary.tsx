/**
 * ErrorBoundary - Catches React errors and displays fallback UI
 */

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onReset?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="w-12 h-12 rounded-full bg-rose-500/15 flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">Something went wrong</h3>
          <p className="text-sm text-text-muted mb-4 max-w-md">
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.1] text-text-primary hover:bg-white/[0.08] transition-colors"
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional error handling
export function useErrorHandler(): (error: Error) => void {
  return React.useCallback((error: Error) => {
    console.error('Error caught by useErrorHandler:', error);
    // Could integrate with error reporting service here
  }, []);
}
