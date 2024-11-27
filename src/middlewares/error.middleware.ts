import type { Request, Response } from 'express';
import type { ErrorResponse } from '../types';

export const errorHandler = (err: Error, req: Request, res: Response) => {
    console.error(err.stack);

    const errorResponse: ErrorResponse = {
        message: err.message || 'Internal Server Error',
        status: 500,
    };

    res.status(errorResponse.status).json(errorResponse);
};
