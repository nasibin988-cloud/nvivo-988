/**
 * Logger utility - Production-safe logging with levels
 *
 * In production, only warnings and errors are logged.
 * In development, all levels are logged with prefixes.
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  prefix?: string;
  enabled?: boolean;
}

// Determine if we're in development mode
// Works in both Node.js and browser environments
const isDev = (() => {
  try {
    // Node.js environment
    if (typeof process !== 'undefined' && process.env) {
      return process.env.NODE_ENV !== 'production';
    }
  } catch {
    // Ignore - browser environment without process
  }
  // Default to true (dev mode) if we can't determine
  return true;
})();

class Logger {
  private prefix: string;
  private enabled: boolean;

  constructor(options: LoggerOptions = {}) {
    this.prefix = options.prefix ? `[${options.prefix}]` : '';
    this.enabled = options.enabled ?? true;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.enabled) return false;
    // In production, only log warnings and errors
    if (!isDev && (level === 'debug' || level === 'info')) return false;
    return true;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString().slice(11, 23);
    return `${timestamp} ${level.toUpperCase().padEnd(5)} ${this.prefix} ${message}`.trim();
  }

  debug(message: string, data?: unknown): void {
    if (!this.shouldLog('debug')) return;
    if (data !== undefined) {
      console.debug(this.formatMessage('debug', message), data);
    } else {
      console.debug(this.formatMessage('debug', message));
    }
  }

  info(message: string, data?: unknown): void {
    if (!this.shouldLog('info')) return;
    if (data !== undefined) {
      console.info(this.formatMessage('info', message), data);
    } else {
      console.info(this.formatMessage('info', message));
    }
  }

  warn(message: string, data?: unknown): void {
    if (!this.shouldLog('warn')) return;
    if (data !== undefined) {
      console.warn(this.formatMessage('warn', message), data);
    } else {
      console.warn(this.formatMessage('warn', message));
    }
  }

  error(message: string, error?: unknown): void {
    if (!this.shouldLog('error')) return;
    const errorMessage = error instanceof Error ? error.message : String(error ?? '');
    console.error(this.formatMessage('error', `${message}${errorMessage ? ': ' + errorMessage : ''}`));
    if (error instanceof Error && error.stack && isDev) {
      console.error(error.stack);
    }
  }
}

/**
 * Create a logger instance with a specific prefix
 */
export function createLogger(prefix: string): Logger {
  return new Logger({ prefix });
}

/**
 * Default logger instance
 */
export const logger = new Logger();

export type { Logger, LoggerOptions, LogLevel };
