import NodeCache from 'node-cache';
import config from '../config';
import { EventEmitter } from 'events';

class CacheService extends EventEmitter {
    private cache: NodeCache;
    private enabled: boolean;

    constructor() {
        super();
        this.enabled = config.cache.enabled;

        // Initialise cache
        this.cache = new NodeCache({
            stdTTL: config.cache.ttl,
            checkperiod: config.cache.checkPeriod,
            useClones: false, // Improve performance by not cloning data
        });

        // Setup event listeners for monitoring
        this.setupEventListeners();

        console.log('✅ Cache service initialised');
    }

    private setupEventListeners() {
        this.cache.on('expired', (key: string, value: unknown) => {
            this.emit('expired', { key, value });
            console.debug(`Cache key expired: ${key}`);
        });

        this.cache.on('flush', () => {
            this.emit('flush');
            console.debug('Cache cleared');
        });

        this.cache.on('del', (key: string, value: unknown) => {
            this.emit('deleted', { key, value });
            console.debug(`Cache key deleted: ${key}`);
        });

        this.cache.on('set', (key: string, value: unknown) => {
            this.emit('set', { key, value });
            console.debug(`Cache key set: ${key}`);
        });

        // Custom events for monitoring
        this.on('hit', ({ key }) => {
            console.debug(`Cache hit: ${key}`);
        });

        this.on('miss', ({ key }) => {
            console.debug(`Cache miss: ${key}`);
        });

        // Error handling
        this.on('error', error => {
            console.error('Cache Error:', error);
        });
    }

    public get<T>(key: string) {
        if (!this.enabled) return null;

        try {
            const value = this.cache.get<T>(key);
            if (value === undefined) {
                this.emit('miss', { key });
                return null;
            } else {
                this.emit('hit', { key, value });
                return value;
            }
        } catch (error) {
            this.emit('error', error);
            return null;
        }
    }

    public set(key: string, value: unknown, ttl?: number) {
        if (!this.enabled) return false;

        try {
            return ttl ? this.cache.set(key, value, ttl) : this.cache.set(key, value);
        } catch (error) {
            this.emit('error', error);
            return false;
        }
    }

    public del(key: string): number {
        if (!this.enabled) return 0;

        try {
            // Support wildcard deletion using internal node-cache methods
            if (key.includes('*')) {
                const keys = this.cache.keys().filter(k => k.startsWith(key.replace('*', '')));
                return this.cache.del(keys);
            } else {
                return this.cache.del(key);
            }
        } catch (error) {
            this.emit('error', error);
            return 0;
        }
    }

    public flush() {
        if (!this.enabled) return;

        try {
            this.cache.flushAll();
        } catch (error) {
            this.emit('error', error);
        }
    }

    public getStats() {
        return this.cache.getStats();
    }

    public getKeys() {
        return this.cache.keys();
    }

    public has(key: string) {
        return this.cache.has(key);
    }

    // TTL management
    public getTtl(key: string): number | undefined {
        return this.cache.getTtl(key);
    }

    public setTtl(key: string, ttl: number): boolean {
        return this.cache.ttl(key, ttl);
    }
}

export const cacheService = new CacheService();
