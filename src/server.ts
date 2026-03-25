import app from './app';
import { config } from './config';
import { logger } from './config/logger';
import { connectDatabase } from './config/database';
import { initializeModels } from './models';

const startServer = async () => {
  try {
    await connectDatabase();
    await initializeModels();

    app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port} in ${config.env} mode`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

const exitHandler = () => {
  logger.info('Shutting down server...');
  process.exit(1);
};

const unexpectedErrorHandler = (error: Error) => {
  logger.error('Unexpected error:', error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  process.exit(1);
});

startServer();
