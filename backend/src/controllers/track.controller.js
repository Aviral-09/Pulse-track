const db = require('../config/db');
const { eventSchema, batchEventSchema } = require('../schemas/events.schema');

const trackSingle = async (req, res) => {
  try {
    const validatedData = eventSchema.parse(req.body);
    
    const query = `
      INSERT INTO events (project_id, user_id, anonymous_id, event_name, properties, created_at)
      VALUES ($1, $2, $3, $4, $5, COALESCE($6, NOW()))
    `;
    const values = [
      validatedData.project_id,
      validatedData.user_id || null,
      validatedData.anonymous_id,
      validatedData.event_name,
      validatedData.properties,
      validatedData.timestamp || null
    ];

    await db.query(query, values);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Tracking Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const trackBatch = async (req, res) => {
  try {
    const validatedData = batchEventSchema.parse(req.body);
    const events = validatedData.events;
    
    // Bulk insert using unnest for optimization
    const projectIds = events.map(e => e.project_id);
    const userIds = events.map(e => e.user_id || null);
    const anonymousIds = events.map(e => e.anonymous_id);
    const eventNames = events.map(e => e.event_name);
    const properties = events.map(e => e.properties);
    const timestamps = events.map(e => e.timestamp ? new Date(e.timestamp) : new Date());

    const query = `
      INSERT INTO events (project_id, user_id, anonymous_id, event_name, properties, created_at)
      SELECT * FROM UNNEST($1::uuid[], $2::text[], $3::text[], $4::text[], $5::jsonb[], $6::timestamptz[])
    `;
    
    await db.query(query, [projectIds, userIds, anonymousIds, eventNames, properties, timestamps]);
    
    res.status(200).json({ success: true, count: events.length });
  } catch (error) {
    console.error('Batch Tracking Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { trackSingle, trackBatch };
