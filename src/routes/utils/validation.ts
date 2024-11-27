import type { Router, RequestHandler } from 'express';
import type core from 'express-serve-static-core';
import { z } from 'zod';

export interface ValidationSchema {
    params?: z.ZodType<core.ParamsDictionary>;
    query?: z.ZodType<core.Query>;
    body?: z.ZodType<object>;
}

type ValidatedRequestHandler<Schema extends ValidationSchema, ResponseBody> = RequestHandler<
    Schema['params'] extends z.ZodType ? z.infer<Schema['params']> : core.ParamsDictionary,
    ResponseBody,
    Schema['body'] extends z.ZodType ? z.infer<Schema['body']> : any,
    Schema['query'] extends z.ZodType ? z.infer<Schema['query']> : core.Query
>;

const validateRequest =
    <Schema extends ValidationSchema>(schema: Schema): ValidatedRequestHandler<Schema, unknown> =>
    (req, res, next) => {
        try {
            const validated: Record<string, unknown> = {};

            if (schema.params) {
                validated.params = schema.params.parse(req.params);
            }

            if (schema.query) {
                validated.query = schema.query.parse(req.query);
            }

            if (schema.body) {
                validated.body = schema.body.parse(req.body);
            }

            next();
        } catch (error) {
            if (error instanceof z.ZodError) {
                const errors = error.errors.map(err => ({
                    path: err.path.join('.'),
                    message: err.message,
                }));

                res.status(400).json({
                    message: '❌ Request validation failed',
                    status: 400,
                    errors,
                });
                return;
            }

            next(error);
        }
    };

export function addValidatedRoute<
    Path extends string,
    Schema extends ValidationSchema,
    ResponseBody,
>(
    router: Router,
    method: Extract<keyof Router, 'get' | 'post' | 'put' | 'delete' | 'patch'>,
    path: Path,
    schema: Schema,
    ...handlers: ValidatedRequestHandler<Schema, ResponseBody>[]
) {
    router[method](path, validateRequest(schema), ...handlers);
}
