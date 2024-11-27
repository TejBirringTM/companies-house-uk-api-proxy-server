import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import config, { isDevelopment } from './config';
import { errorHandler } from './middlewares/error.middleware';
import path from 'path';
import fs from 'fs';

const app = express();
const ALL_ROUTERS_PATH = path.join(__dirname, 'routes');
const ALL_ROUTES_PREFIX = `/api/v${config.version.major}`;

function loadRouters(folderPath: string) {
    const files = fs.readdirSync(folderPath);

    return files
        .filter(file => file.endsWith('.ts'))
        .map(file => {
            const routerPath = path.join(folderPath, file);
            const router = require(routerPath).default;
            return {
                name: file.replace('.ts', ''),
                router,
            };
        });
}

// Security middlewares
app.use(
    cors({
        origin: config.corsOrigin,
    }),
);
app.use(helmet());
app.use(
    rateLimit({
        windowMs: config.rateLimit.windowMs,
        max: config.rateLimit.max,
        message: 'Too many requests from this IP address, please try again later',
    }),
);

// Logging middleware
app.use(morgan(config.logLevel));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Development-only middleware
if (isDevelopment) {
    app.use((req, res, next) => {
        console.log(`🔍 [${req.method}] ${req.path}`);
        next();
    });
}

// Routes
const routers = loadRouters(ALL_ROUTERS_PATH);
routers.forEach(router => {
    const routePath = `${ALL_ROUTES_PREFIX}/${router.name}`;
    app.use(routePath, router.router);
    console.log(`✅ Loaded router => ${router.name} => ${routePath}`);
});
console.log(`✅ Loaded all routers (${routers.length} in total)`);

// Error handling
app.use(errorHandler);

// Start server
app.listen(config.port, () => {
    console.log(`
🚀 Server running in ${config.env} mode on port ${config.port}
👉 http://localhost:${config.port}

Environment Configuration:
- CORS Origin: ${config.corsOrigin}
- Log Level: ${config.logLevel}
- Rate Limit: ${config.rateLimit.max} requests per ${config.rateLimit.windowMs / 60000} minute window
- Cache: ${config.cache.enabled ? `enabled, Time to Live (TTL) = ${config.cache.ttl / 60} minutes, checking every ${config.cache.checkPeriod / 60} minutes` : 'disabled'}
  `);
});
