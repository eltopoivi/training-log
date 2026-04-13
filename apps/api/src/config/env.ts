import { z } from 'zod';

const schema = z.object({
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  MINIO_ENDPOINT: z.string().url(),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1),
  MINIO_BUCKET: z.string().min(1).default('tracker-raw'),
  MINIO_REGION: z.string().min(1).default('us-east-1'),
  API_PORT: z.coerce.number().int().positive().default(3001),
  WEB_ORIGIN: z.string().url().default('http://localhost:3000'),
  SEED_USER_EMAIL: z.string().email().default('ivan@local.test'),
  SEED_USER_NAME: z.string().min(1).default('Ivan'),
  STRAVA_CLIENT_ID: z.string().min(1),
  STRAVA_CLIENT_SECRET: z.string().min(1),
  STRAVA_REDIRECT_URI: z
    .string()
    .url()
    .default('http://localhost:3001/api/integrations/strava/callback'),
  STRAVA_VERIFY_TOKEN: z.string().min(1),
  STRAVA_WEBHOOK_CALLBACK_URL: z.string().url().optional(),
  ENCRYPTION_KEY: z
    .string()
    .regex(/^[0-9a-fA-F]{64}$/, 'ENCRYPTION_KEY must be 32 bytes hex (64 chars)'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof schema>;

export function loadEnv(): Env {
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    console.error('Invalid environment:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env: Env = loadEnv();
