import app from './app.js';
import config from './config/index.js';
import db from './config/database.js';

const start = async () => {
  // Connect to MongoDB
  await db.connect();

  const PORT = process.env.PORT || 4500;
  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`
╔══════════════════════════════════════════╗
║  SaaS Backend API                        ║
║  Environment: ${config.env.padEnd(25)}║
║  Port:        ${String(config.port).padEnd(25)}║
║  Health:      /api/health                ║
╚══════════════════════════════════════════╝
    `);
  });

  // ---------------------------------------------------------------------------
  // Graceful shutdown
  // ---------------------------------------------------------------------------
  const shutdown = async (signal) => {
    console.log(`\n[server] ${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
      console.log('[server] HTTP server closed');

      await db.disconnect();
      console.log('[server] Database disconnected');

      process.exit(0);
    });

    // Force exit after 10s if graceful shutdown fails
    setTimeout(() => {
      console.error('[server] Forced exit after timeout');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Catch unhandled rejections / exceptions
  process.on('unhandledRejection', (err) => {
    console.error('[server] Unhandled Rejection:', err);
    shutdown('UNHANDLED_REJECTION');
  });

  process.on('uncaughtException', (err) => {
    console.error('[server] Uncaught Exception:', err);
    shutdown('UNCAUGHT_EXCEPTION');
  });
};

start();
