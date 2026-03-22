import mongoose from 'mongoose';
import config from './index.js';


let isConnected = false;

mongoose.connect("mongodb://localhost:27017/saas-backend");

const connect = async () => {
  if (isConnected) return;

  mongoose.connection.on('connected', () => {
    isConnected = true;
    console.log(`[db] Connected to MongoDB (${config.env})`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('[db] MongoDB connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn('[db] MongoDB disconnected');
  });

  try {
    await mongoose.connect("mongodb://localhost:27017/saas-backend");
  } catch (err) {
    console.error('[db] Initial connection failed:', err.message);
    // Retry once after 5s — beyond that, let the process manager restart
    setTimeout(() => {
      console.log('[db] Retrying connection...');
      mongoose.connect("mongodb://localhost:27017/saas-backend", config.mongo.options).catch(() => {
        console.error('[db] Retry failed. Exiting.');
        process.exit(1);
      });
    }, 5000);
  }
};

const disconnect = async () => {
  if (!isConnected) return;
  await mongoose.disconnect();
};

const getStatus = () => ({
  connected: isConnected,
  readyState: mongoose.connection.readyState,
  // 0=disconnected, 1=connected, 2=connecting, 3=disconnecting
});

export default { connect, disconnect, getStatus };
