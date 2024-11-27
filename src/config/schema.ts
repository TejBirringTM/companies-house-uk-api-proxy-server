import { z } from 'zod';

export const envSchema = z.object({
    // Node Environment
    NODE_ENV: z.enum(['development', 'test', 'production']).describe('').default('development'),

    // Server Configuration
    PORT: z
        .string()
        .describe('')
        .transform(Number)
        .refine(n => n > 0 && n < 65536, 'Port must be between 0 and 65535')
        .default('3000'),

    // Security
    CORS_ORIGIN: z.string().describe('').default('*'),

    RATE_LIMIT_WINDOW_MS: z.string().describe('').transform(Number).default('900000'), // 15 minutes in milliseconds

    RATE_LIMIT_MAX: z.string().describe('').transform(Number).default('100'),

    // Logging
    LOG_LEVEL: z
        .enum(['error', 'warn', 'info', 'http', 'debug', 'dev'])
        .describe('')
        .default('dev'),

    // Cache Configuration
    CACHE_TTL_S: z.string().describe('').transform(Number).default('3600'), // 1 hour in seconds

    CACHE_CHECK_PERIOD_S: z.string().describe('').transform(Number).default('600'), // In seconds; check for expired keys every 10 minutes

    CACHE_ENABLED: z
        .enum(['true', 'false'])
        .describe('')
        .transform(v => v === 'true')
        .default('true'),

    // Add more environment variables here...
});

export type Env = z.infer<typeof envSchema>;
