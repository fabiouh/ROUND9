import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  AUTH0_ISSUER_BASE_URL: z.string().url().transform((u) => (u.endsWith('/') ? u : `${u}/`)),
  AUTH0_AUDIENCE: z.string().min(1),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  NODE_ENV: z.string().default('development'),
});

export const env = schema.parse(process.env);
