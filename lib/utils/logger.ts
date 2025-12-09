/**
 * Simple Logger Utility
 * Console-only logging for development
 */

export interface LoggerOptions {
  /** Additional context data to include with the log */
  context?: Record<string, any>;
}

/**
 * Log to console with formatted output
 */
function logToConsole(
  level: 'error' | 'warn' | 'info' | 'debug',
  message: string,
  error?: Error | unknown,
  context?: Record<string, any>
) {
  const timestamp = new Date().toISOString();
  const prefix = `[${level.toUpperCase()}] ${timestamp}`;

  const logData: Record<string, any> = { message };

  if (error) {
    logData.error = error;
  }

  if (context) {
    logData.context = context;
  }

  if (level === 'error') {
    console.error(prefix, logData);
  } else if (level === 'warn') {
    console.warn(prefix, logData);
  } else if (level === 'debug') {
    console.debug(prefix, logData);
  } else {
    console.log(prefix, logData);
  }
}

/**
 * Simple logger - console only
 */
export const logger = {
  error: (message: string, error?: Error | unknown, options?: LoggerOptions) => {
    logToConsole('error', message, error, options?.context);
  },

  warn: (message: string, options?: LoggerOptions) => {
    logToConsole('warn', message, undefined, options?.context);
  },

  info: (message: string, options?: LoggerOptions) => {
    logToConsole('info', message, undefined, options?.context);
  },

  debug: (message: string, options?: LoggerOptions) => {
    if (__DEV__) {
      logToConsole('debug', message, undefined, options?.context);
    }
  },
};
