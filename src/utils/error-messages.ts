import type { ZodError } from 'zod';

export const extractErrorMessagesFromZodError = (error: ZodError) =>
    error.errors.map(e => {
        const field = e.path.join('.');
        return `${field}: ${e.message}`;
    });

export const stringifyError = <E extends Error>(error: E) => {
    // Capture all enumerable properties
    const plainObject = Object.getOwnPropertyNames(error).reduce(
        (obj, key) => {
            obj[key] = error[key as keyof E];
            return obj;
        },
        {} as Record<string, unknown>,
    );
    // Return the simple object clone
    return plainObject;
};
