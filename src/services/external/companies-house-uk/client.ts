import axios from 'axios';
import { requestLogger, responseLogger, errorLogger } from 'axios-logger';
import config from '../../../config';
import rateLimit from 'axios-rate-limit';

const baseUrl = config.external.companiesHouseUk.baseUrl;
const apiKey = config.external.companiesHouseUk.apiKey;

export function createClient() {
    const client = rateLimit(
        axios.create({
            baseURL: baseUrl,
            auth: {
                username: apiKey,
                password: '',
            },
        }),
        {
            maxRequests: config.external.companiesHouseUk.rateLimit.max,
            perMilliseconds: config.external.companiesHouseUk.rateLimit.windowMs,
        },
    );
    client.interceptors.request.use(requestLogger, errorLogger);
    client.interceptors.response.use(responseLogger, errorLogger);

    return client;
}
