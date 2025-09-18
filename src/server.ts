import app from './app';
import connectDatabase from './config/database';
import env, { validateEnv } from './config/env';
import { CONSOLE_MESSAGES, CONSOLE_FORMATS } from './constants';

const startServer = async () => {
  try {
    validateEnv();
    await connectDatabase();
    
        const server = app.listen(env.PORT, () => {
          console.log(CONSOLE_FORMATS.PORT_INFO(env.PORT));
          console.log(CONSOLE_FORMATS.HEALTH_CHECK_URL(env.PORT));
          console.log(CONSOLE_FORMATS.ENVIRONMENT_INFO(env.NODE_ENV));
        });

        const gracefulShutdown = (signal: string) => {
          console.log(CONSOLE_FORMATS.SHUTDOWN_SIGNAL(signal));
          server.close(() => {
            console.log(CONSOLE_MESSAGES.SERVER_CLOSED);
            process.exit(0);
          });
        };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
    
      } catch (error) {
        console.error(CONSOLE_MESSAGES.SERVER_START_FAILED, error);
        process.exit(1);
      }
};

startServer();
