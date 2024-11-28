export class ConfigError extends Error {
    constructor(
        message: string,
        public errors?: unknown,
    ) {
        super(message);
        this.name = 'ConfigError';
    }
}

export class ExternalServiceError extends Error {
    constructor(
        message: string,
        public serviceName: string,
        public status: number,
        public errors?: unknown,
    ) {
        super(message);
        this.name = 'ExternalServiceError';
    }
}
