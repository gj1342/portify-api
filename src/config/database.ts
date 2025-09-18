import mongoose from 'mongoose';
import env from './env';
import { CONSOLE_MESSAGES } from '../constants';

const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log(CONSOLE_MESSAGES.DB_CONNECTED);
  } catch (error) {
    console.error(CONSOLE_MESSAGES.DB_CONNECTION_ERROR, error);
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => {
  console.log(CONSOLE_MESSAGES.DB_DISCONNECTED);
});

mongoose.connection.on('error', (error) => {
  console.error(CONSOLE_MESSAGES.DB_ERROR, error);
});

export default connectDatabase;
