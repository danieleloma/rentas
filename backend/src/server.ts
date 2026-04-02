import http from 'http';
import { app } from './app';
import { config } from './config';
import { logger } from './utils/logger';
import { initializeWebSocket } from './websocket';

const server = http.createServer(app);

initializeWebSocket(server);

server.listen(config.port, () => {
  logger.info(`Server running on port ${config.port} in ${config.nodeEnv} mode`);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message });
  process.exit(1);
});
