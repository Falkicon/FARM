import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import multipart from '@fastify/multipart';
import { env } from './config/env.js';
import { systemRoutes } from './api/system.js';

// Create Fastify instance
const fastify = Fastify({
  logger: {
    transport: env.NODE_ENV === 'development'
      ? {
        target: 'pino-pretty',
        options: {
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
      : undefined,
  },
});

// Register plugins
await fastify.register(cors, {
  origin: env.CORS_ORIGIN,
  credentials: true,
});

await fastify.register(helmet, {
  contentSecurityPolicy: false,
});

await fastify.register(multipart);

// Register routes
await fastify.register(systemRoutes);

// Health check route
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);
  reply.status(error.statusCode ?? 500).send({
    error: error.name,
    message: error.message,
    statusCode: error.statusCode ?? 500,
  });
});

// Start server
const start = async () => {
  try {
    await fastify.listen({
      port: env.PORT,
      host: env.HOST
    });
    fastify.log.info(`Server listening on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
