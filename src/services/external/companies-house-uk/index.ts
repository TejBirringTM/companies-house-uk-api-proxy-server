import { AxiosError } from 'axios';
import { createClient } from './client';
import type core from 'express-serve-static-core';
import { z, ZodError } from 'zod';
import { ExternalServiceError } from '../../../errors';
import { extractErrorMessagesFromZodError } from '../../../utils/error-messages';
import constants from './constants.json';

/**
 * See:
 *  https://developer-specs.company-information.service.gov.uk/guides/gettingStarted
 *  https://developer-specs.company-information.service.gov.uk/guides/index
 *  https://developer-specs.company-information.service.gov.uk/
 *  https://developer.company-information.service.gov.uk/manage-applications
 *  https://developer-specs.company-information.service.gov.uk/companies-house-public-data-api/reference/search/advanced-company-search
 */

// OpenAPI Specs are ignored (https://developer-specs.company-information.service.gov.uk/api.ch.gov.uk-specifications/swagger-2.0/spec/swagger.json)
// Instead, enums are derived directly from constants obtained from Companies House GitHub, explained here https://developer-specs.company-information.service.gov.uk/guides/gettingStarted
const companyStatusSchema = z.enum(Object.keys(constants.company_status) as [string, ...string[]]);
const companyTypeSchema = z.enum(Object.keys(constants.company_type) as [string, ...string[]]);
const companySubtypeSchema = z.enum(
    Object.keys(constants.company_subtype) as [string, ...string[]],
);
const companySicCodeSchema = z.enum(
    Object.keys(constants.sic_descriptions) as [string, ...string[]],
);

const advancedCompanyRegisteredOfficeAddressSchema = z.object({
    address_line_1: z.string().optional(),
    address_line_2: z.string().optional(),
    locality: z.string().optional(),
    postal_code: z.string().optional(),
    region: z.string().optional(),
    country: z.string().optional(),
});

const advancedCompanySchema = z.object({
    company_name: z.string(),
    company_number: z.string(),
    company_status: companyStatusSchema,
    company_type: companyTypeSchema,
    company_subtype: companySubtypeSchema.optional(),
    kind: z.literal('search-results#company'),
    links: z
        .object({
            company_profile: z.string(),
        })
        .optional(),
    date_of_cessation: z.string().date().optional(),
    date_of_creation: z.string().date(),
    sic_codes: z.array(companySicCodeSchema).optional(),
    registered_office_address: advancedCompanyRegisteredOfficeAddressSchema.optional(),
});

const advancedSearchResponseBodySchema = z.object({
    etag: z.string().optional(),
    hits: z.number(),
    kind: z.literal('search#advanced-search'),
    items: z.array(advancedCompanySchema),
});

const populateSicCodes = (keys: string[]) => {
    const sicDescriptions = constants.sic_descriptions;
    const obj = {} as Record<string, string | null>;
    for (const key of keys) {
        if (key in sicDescriptions) {
            obj[key] = sicDescriptions[key as keyof typeof sicDescriptions];
        } else {
            obj[key] = null;
        }
    }
    return obj;
};

const tranformItem = (item: z.infer<typeof advancedCompanySchema>) => {
    return {
        ...item,
        kind: undefined,
        sic_codes: item.sic_codes ? populateSicCodes(item.sic_codes) : undefined,
    };
};

export const advancedSearchQuerySchema = z
    .object({
        size: z.never().optional(),
        start_index: z.never().optional(),
    })
    .passthrough() as z.ZodType<core.Query>;

async function advancedSearch<Query extends core.Query>(query: Query) {
    const client = createClient();
    const requestPath = 'advanced-search/companies';
    const request = async (startIndex: number = 0) => {
        try {
            const response = await client.get(requestPath, {
                params: {
                    ...query,
                    size: 5000,
                    start_index: startIndex,
                },
            });
            const responseBody = advancedSearchResponseBodySchema.parse(response.data);
            return responseBody;
        } catch (e) {
            if (e instanceof AxiosError) {
                throw new ExternalServiceError(
                    'Companies House UK advance search failed',
                    'Companies House UK',
                    e.status || 500,
                    e.response?.data,
                );
            } else if (e instanceof ZodError) {
                throw new ExternalServiceError(
                    'Failed to parse response from Companies House UK advance search',
                    'Companies House UK',
                    502,
                    extractErrorMessagesFromZodError(e),
                );
            } else {
                throw e;
            }
        }
    };
    const initialResponse = await request();
    const hits = initialResponse.hits;
    const items = initialResponse.items;
    let startIndex = items.length;
    while (items.length !== hits) {
        const _response = await request(startIndex);
        items.push(..._response.items);
        startIndex = items.length;
    }
    return items.map(item => tranformItem(item));
}

export const companiesHouseUkService = {
    advancedSearch,
};
