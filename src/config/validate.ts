import { z } from 'zod';
import { envSchema } from './schema';
import { ConfigError } from './types';
import { parse as parseVersion } from 'semver';
import pkg from '../../package.json';

export function validateEnv() {
    try {
        // Parse and validate environment variables
        const env = envSchema.parse(process.env);

        // Additional custom validation logic
        if (env.NODE_ENV === 'production') {
            // Add production-specific validation rules here...
            // Example: require SSL in production
            // if (!env.DATABASE_SSL) {
            //   throw new ConfigError('SSL must be enabled in production');
            // }
        }

        return Object.freeze(env);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const messages = error.errors.map(e => {
                const field = e.path.join('.');
                return `${field}: ${e.message}`;
            });

            throw new ConfigError('❌ Environment variables do not follow schema', messages);
        }

        throw error;
    }
}

export const validateVersion = () => {
    const v = parseVersion(pkg.version);
    if (!v) {
        throw new ConfigError(
            '❌ Project version in package.json does not follow Semantic Versioning 2.0.0',
            {
                version: pkg.version,
            },
        );
    } else {
        return v;
    }
};
