import { Router } from 'express';
import { z } from 'zod';
import { addValidatedRoute } from './utils/validation';
import { cacheHandler } from '../middlewares/cache.middleware';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

addValidatedRoute(
    router,
    'post',
    '/test',
    {
        body: z.object({
            key: z.string(),
        }),
    },
    cacheHandler(),
    (req, res) => {
        res.json({
            notKey: `not ${req.body.key}!`,
        });
    },
);

export default router;
