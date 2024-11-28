import type { Request, RequestHandler } from 'express';
import type core from 'express-serve-static-core';
import { cacheService } from '../services/cache.service';
import { RequestHasher } from '../utils/request-hasher';

interface CacheOptions<
    P extends core.ParamsDictionary = core.ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery extends core.Query = core.Query,
> {
    ttl?: number;
    key?: (req: Request<P, ResBody, ReqBody, ReqQuery>) => string;
    condition?: (req: Request<P, ResBody, ReqBody, ReqQuery>) => boolean;

    // Cache-Control directives to manage how response is EXTERNALLY cached, between this server and the client
    public?: boolean; // Response can be stored by any cache (browsers, CDNs, proxies), even if normally non-cacheable like authenticated responses.
    noStore?: boolean; // Prevents all caching; response cannot be stored in any cache and must be fetched from server every time.
    noCache?: boolean; // Response can be cached but must be revalidated with server before each use, even if not expired.
    mustRevalidate?: boolean; // Once response becomes stale, it must be revalidated with origin server before use; if server unreachable, must return error instead of stale content.
    maxAge?: number; // Maximum time in seconds that a response can be reused from cache before becoming stale (client-side caches).
    sMaxAge?: number; // Like max-age but only applies to shared caches (CDNs, proxies), overriding max-age for them while leaving browser caching unaffected.
    staleWhileRevalidate?: number; //Allows cache to serve stale response while revalidating in background, helping performance by avoiding request blocking.
}

function generateCacheControl<
    P extends core.ParamsDictionary = core.ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery extends core.Query = core.Query,
>(options: CacheOptions<P, ResBody, ReqBody, ReqQuery>): string {
    const directives: string[] = [];

    if (options.noStore) {
        directives.push('no-store');
    } else if (options.noCache) {
        directives.push('no-cache');
    } else {
        if (options.public) {
            directives.push('public');
        }
        if (options.mustRevalidate) {
            directives.push('must-revalidate');
        }
        if (typeof options.maxAge === 'number') {
            directives.push(`max-age=${options.maxAge}`);
        }
        if (typeof options.sMaxAge === 'number') {
            directives.push(`s-maxage=${options.sMaxAge}`);
        }
        if (typeof options.staleWhileRevalidate === 'number') {
            directives.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
        }
    }

    return directives.join(', ') || 'no-cache';
}

export const cacheHandler = <
    P extends core.ParamsDictionary = core.ParamsDictionary,
    ResBody = unknown,
    ReqBody = unknown,
    ReqQuery extends core.Query = core.Query,
>(
    options: CacheOptions<P, ResBody, ReqBody, ReqQuery> = {},
): RequestHandler<P, ResBody, ReqBody, ReqQuery> => {
    return (req, res, next) => {
        // Check if client wants fresh data
        if (req.headers['cache-control'] === 'no-cache') {
            return next();
        }

        // Check condition if provided
        if (options.condition && !options.condition(req)) {
            next();
        }

        // Generate cache key
        const key = options.key?.(req) || RequestHasher.hashRequest(req);

        try {
            // Try to get from cache
            const cachedResponse = cacheService.get(key) as ResBody;

            // CACHE HIT!
            if (cachedResponse) {
                res.setHeader('X-Cache', 'HIT');
                res.setHeader('X-Cache-Key', key);
                res.setHeader('X-Cache-TTL', cacheService.getTtl(key) || 'N/A');
                res.setHeader('X-Cache-Hits', cacheService.getStats().hits);
                res.setHeader('Cache-Control', generateCacheControl(options));

                // Append headers for public cache if required
                if (options.public) {
                    res.setHeader(
                        'Last-Modified',
                        new Date(cacheService.getTtl(key)! * 1000).toUTCString(),
                    );
                    res.setHeader(
                        'Expires',
                        new Date(cacheService.getTtl(key)! * 1000).toUTCString(),
                    );
                }

                res.json(cachedResponse);

                // CACHE MISS!
            } else {
                res.setHeader('X-Cache', 'MISS');
                res.setHeader('X-Cache-Key', key);
                res.setHeader('Cache-Control', generateCacheControl(options));

                // Harness original response.json() to intercept response
                const originalJson = res.json.bind(res);
                res.json = ((data: any) => {
                    // Store the intercepted response in cache
                    cacheService.set(key, data, options.ttl);

                    // Append headers for public cache if required
                    if (options.public) {
                        res.setHeader('Last-Modified', new Date().toUTCString());
                        res.setHeader(
                            'Expires',
                            new Date(Date.now() + (options.ttl || 0) * 1000).toUTCString(),
                        );
                    }

                    return originalJson(data);
                }) as any;

                next();
            }
        } catch (error) {
            console.error('Cache Middleware Error:', error);
            next();
        }
    };
};
