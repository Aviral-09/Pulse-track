import { z } from 'zod';

const eventNameRegex = /^[a-z]+(_[a-z]+)*$/;

export const trackEventSchema = z.object({
    project_id: z.string().uuid(),
    anonymous_id: z.string().min(1),
    event_name: z.string().min(1).regex(eventNameRegex, {
        message: "Event name must be snake_case (e.g., 'user_signed_up')"
    }),
    user_id: z.string().uuid().or(z.literal('')).optional().nullable(),
    properties: z.record(z.any()).optional().nullable(),
    page_url: z.string().optional().nullable(),
    user_agent: z.string().optional().nullable(),
    event_version: z.string().default('1.0.0'),
    sdk_version: z.string().optional().nullable(),
    environment: z.enum(['prod', 'staging', 'development']).default('prod'),
});

export const batchTrackSchema = z.object({
    events: z.array(trackEventSchema).min(1).max(500)
});

export const identifySchema = z.object({
    project_id: z.string().uuid(),
    anonymous_id: z.string().min(1),
    user_id: z.string().uuid(),
});
