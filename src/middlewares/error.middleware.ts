import type { ErrorRequestHandler, RequestHandler } from 'express';
import type { ErrorResponse } from '../types';
import { stringifyError } from '../utils/error-messages';

export const notFoundHandler: RequestHandler = (req, res, next) => {
    const errorResponse = {
        message: 'Not Found',
        status: 404,
    } satisfies ErrorResponse;

    next(errorResponse);
};

export const errorHandler: ErrorRequestHandler = (
    err: Error & { status?: number },
    _req,
    res,
    _next,
) => {
    console.error(stringifyError(err));
    console.error(err.stack);

    const errorResponse = {
        message: err.message || 'Internal Server Error',
        status: err.status || 500,
    } satisfies ErrorResponse;

    res.status(errorResponse.status).json(errorResponse);
};
