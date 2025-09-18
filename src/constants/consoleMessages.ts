export const CONSOLE_MESSAGES = {
  SERVER_STARTED: '🚀 Server running on port',
  HEALTH_CHECK: '📊 Health check: http://localhost:',
  ENVIRONMENT: '🌍 Environment:',
  GRACEFUL_SHUTDOWN: 'received. Shutting down gracefully...',
  SERVER_CLOSED: 'Server closed.',
  SERVER_START_FAILED: '❌ Failed to start server:',

  DB_CONNECTED: '✅ Connected to MongoDB successfully',
  DB_CONNECTION_ERROR: '❌ MongoDB connection error:',
  DB_DISCONNECTED: '⚠️ MongoDB disconnected',
  DB_ERROR: '❌ MongoDB error:',

  MISSING_ENV_VARS: '⚠️ Missing environment variables:',
  USING_DEFAULTS: 'Using default values. Create .env file for production.',

  GLOBAL_ERROR: '❌ Global Error Handler:',
} as const;

export const CONSOLE_FORMATS = {
  PORT_INFO: (port: number) => `${CONSOLE_MESSAGES.SERVER_STARTED} ${port}`,
  HEALTH_CHECK_URL: (port: number) => `${CONSOLE_MESSAGES.HEALTH_CHECK}${port}/health`,
  ENVIRONMENT_INFO: (env: string) => `${CONSOLE_MESSAGES.ENVIRONMENT} ${env}`,
  SHUTDOWN_SIGNAL: (signal: string) => `\n${signal} ${CONSOLE_MESSAGES.GRACEFUL_SHUTDOWN}`,
  MISSING_ENV_LIST: (missing: string[]) => `${CONSOLE_MESSAGES.MISSING_ENV_VARS} ${missing.join(', ')}`,
} as const;
