import { Router } from 'express';
import { addValidatedRoute } from './utils/validation';
import {
    advancedSearchQuerySchema,
    companiesHouseUkService,
} from '../services/external/companies-house-uk';
import { cacheHandler } from '../middlewares/cache.middleware';

const router = Router();

router.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

router.get('/my-ip', (req, res) => {
    res.json({
        ip: req.ip,
    });
});

addValidatedRoute(
    router,
    'get',
    '/companies-house-uk/advanced-search',
    {
        query: advancedSearchQuerySchema,
    },
    cacheHandler(),
    async (req, res, next) => {
        try {
            const responseBody = await companiesHouseUkService.advancedSearch(req.query);
            res.status(200).send(responseBody);
        } catch (e) {
            next(e);
        }
    },
);

export default router;
