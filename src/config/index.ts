import dotenv from 'dotenv';
import path from 'path';
import { validateEnv, validateVersion } from './validate';
import type { Env } from './schema';
import type { DeepReadonly } from 'ts-essentials';
import type { Version } from './types';

export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';
export const isTest = process.env.NODE_ENV === 'test';

// Load environment variables from file only in development
if (isDevelopment) {
    const envPath = path.resolve(process.cwd(), '.env');
    const result = dotenv.config({ path: envPath });

    if (result.error) {
        console.warn('⚠️ Warning: .env file not found in development mode');
    } else {
        console.log('✅ Loaded .env file in development mode');
    }
}

// Validate environment configuration
let env: DeepReadonly<Env>;
let version: Version;

try {
    env = validateEnv();
    version = validateVersion();

    console.log('✅ Environment validation successful');
} catch (error) {
    if (error instanceof Error) {
        console.error('❌ Environment validation failed');
        console.error(error.message);
        if ('errors' in error && error.errors) {
            console.error(error.errors);
        }
    }
    process.exit(1);
}

// Export validated configuration
const config = {
    env: env.NODE_ENV,
    port: env.PORT,
    corsOrigin: env.CORS_ORIGIN,
    logLevel: env.LOG_LEVEL,
    rateLimit: {
        windowMs: env.RATE_LIMIT_WINDOW_MS,
        max: env.RATE_LIMIT_MAX,
    },
    cache: {
        enabled: env.CACHE_ENABLED,
        ttl: env.CACHE_TTL_S,
        checkPeriod: env.CACHE_CHECK_PERIOD_S,
    },
    version: {
        major: version.major,
        minor: version.minor,
        patch: version.patch,
    },
    // Add other configuration properties here...
} as const;

export default config;
