import { config } from 'dotenv';
import { z } from 'zod';

// Load environment variables from .env file
config();

// Environment variable schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('3001'),
  HOST: z.string().default('localhost'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

// Parse and validate environment variables
export const env = envSchema.parse(process.env);
