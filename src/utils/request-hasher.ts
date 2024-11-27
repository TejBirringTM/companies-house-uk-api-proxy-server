import type { Request } from 'express';
import type core from 'express-serve-static-core';

type JsonPrimitive = string | number | boolean | null;
type JsonArray = JsonValue[];
type JsonObject = { [key: string]: JsonValue };
type JsonValue = JsonPrimitive | JsonObject | JsonArray;

interface SerialisableRequest extends JsonObject {
    method: string;
    path: string;
    query: Record<string, string | string[]>;
    body: JsonValue;
    params: Record<string, string>;
    headers: Record<string, string>;
}

// Configuration options for request serialisation
interface RequestHashOptions {
    includeHeaders?: boolean | string[];
    excludeHeaders?: string[];
    includePath?: boolean;
    includeQuery?: boolean;
    includeBody?: boolean;
    includeParams?: boolean;
    normaliseArrays?: boolean;
    trimStrings?: boolean;
}

const defaultOptions = {
    includeHeaders: ['content-type', 'accept'],
    excludeHeaders: ['authorization', 'cookie', 'user-agent'],
    includePath: true,
    includeQuery: true,
    includeBody: true,
    includeParams: true,
    normaliseArrays: true,
    trimStrings: true,
} satisfies RequestHashOptions;

export class RequestHasher {
    private static sortObjectKeys = <T extends JsonValue>(obj: T): T => {
        if (obj === null || typeof obj !== 'object') {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(RequestHasher.sortObjectKeys) as T;
        }

        return Object.keys(obj as JsonObject)
            .sort()
            .reduce<JsonObject>((acc, key) => {
                acc[key] = RequestHasher.sortObjectKeys((obj as JsonObject)[key]);
                return acc;
            }, {}) as T;
    };

    private static normaliseValue(value: any, options: RequestHashOptions) {
        if (typeof value === 'string' && options.trimStrings) {
            return value.trim();
        }

        if (Array.isArray(value) && options.normaliseArrays) {
            return [...new Set(value)].sort();
        }

        return value;
    }

    private static hashString(str: string) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = (hash << 5) - hash + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    private static filterHeaders(
        headers: Record<string, string | string[] | undefined>,
        options: RequestHashOptions,
    ) {
        const normalisedHeaders: Record<string, string> = {};
        const includeHeaders =
            options.includeHeaders === true ? Object.keys(headers) : options.includeHeaders || [];

        const excludeHeaders = options.excludeHeaders || [];

        for (const [key, value] of Object.entries(headers)) {
            const headerKey = key.toLowerCase();
            if (
                value !== undefined &&
                includeHeaders.includes(headerKey) &&
                !excludeHeaders.includes(headerKey)
            ) {
                normalisedHeaders[headerKey] = Array.isArray(value) ? value.join(', ') : value;
            }
        }

        return normalisedHeaders;
    }

    static serialiseRequest<
        P extends core.ParamsDictionary = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery extends core.Query = core.Query,
    >(req: Request<P, ResBody, ReqBody, ReqQuery>, options: RequestHashOptions = {}) {
        const mergedOptions = { ...defaultOptions, ...options };

        const serialised: SerialisableRequest = {
            method: req.method,
            path: mergedOptions.includePath ? req.path : '',
            query: mergedOptions.includeQuery
                ? Object.entries(req.query).reduce(
                      (acc, [key, value]) => {
                          acc[key] = RequestHasher.normaliseValue(value, mergedOptions);
                          return acc;
                      },
                      {} as Record<string, string | string[]>,
                  )
                : {},
            body: mergedOptions.includeBody
                ? RequestHasher.normaliseValue(req.body, mergedOptions)
                : {},
            params: mergedOptions.includeParams
                ? Object.entries(req.params).reduce(
                      (acc, [key, value]) => {
                          acc[key] = RequestHasher.normaliseValue(value, mergedOptions);
                          return acc;
                      },
                      {} as Record<string, string>,
                  )
                : {},
            headers: mergedOptions.includeHeaders
                ? RequestHasher.filterHeaders(req.headers, mergedOptions)
                : {},
        };

        return serialised;
    }

    static hashRequest<
        P extends core.ParamsDictionary = core.ParamsDictionary,
        ResBody = any,
        ReqBody = any,
        ReqQuery extends core.Query = core.Query,
    >(req: Request<P, ResBody, ReqBody, ReqQuery>, options: RequestHashOptions = {}) {
        const serialised = RequestHasher.serialiseRequest(req, options);
        const sorted = RequestHasher.sortObjectKeys(serialised);
        const stringified = JSON.stringify(sorted);
        return RequestHasher.hashString(stringified);
    }
}
