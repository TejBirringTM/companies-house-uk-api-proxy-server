import type { SemVer } from 'semver';

export class ConfigError extends Error {
    constructor(
        message: string,
        public errors?: unknown,
    ) {
        super(message);
        this.name = 'ConfigError';
    }
}

export type Version = SemVer;
