import { Router } from 'express';
import { cacheService } from '../services/cache.service';

const router = Router();

router.get('/cache/stats', (req, res) => {
    const stats = cacheService.getStats();
    const keys = cacheService.getKeys();
    const memoryUsage = (() => {
        const m = process.memoryUsage();
        return {
            residentSetSize: (m.rss / 1000_000).toLocaleString() + ' Megabytes',
            heapTotal: (m.heapTotal / 1000_000).toLocaleString() + ' Megabytes',
            heapUsed: (m.heapUsed / 1000_000).toLocaleString() + ' Megabytes',
            external: (m.external / 1000_000).toLocaleString() + ' Megabytes',
            arrayBuffers: (m.arrayBuffers / 1000_000).toLocaleString() + ' Megabytes',
        };
    })();

    res.json({
        stats,
        keys: keys.map(key => ({
            key,
            ttl: cacheService.getTtl(key),
        })),
        totalKeys: keys.length,
        memoryUsage,
    });
});

router.delete('/cache/keys/:key', (req, res) => {
    const deleted = cacheService.del(req.params.key);
    res.json({ deleted });
});

router.post('/cache/flush', (req, res) => {
    cacheService.flush();
    res.json({ message: 'Cache cleared' });
});

export default router;
