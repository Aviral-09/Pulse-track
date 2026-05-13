const { z } = require('zod');

const eventSchema = z.object({
  project_id: z.string().uuid(),
  user_id: z.string().optional(),
  anonymous_id: z.string(),
  event_name: z.string().min(1).max(255),
  properties: z.record(z.any()).optional().default({}),
  timestamp: z.string().datetime().optional()
});

const batchEventSchema = z.object({
  events: z.array(eventSchema).min(1).max(100)
});

module.exports = {
  eventSchema,
  batchEventSchema
};
