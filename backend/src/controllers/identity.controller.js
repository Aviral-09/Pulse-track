const db = require('../config/db');
const { z } = require('zod');

const identifySchema = z.object({
  project_id: z.string().uuid(),
  anonymous_id: z.string(),
  user_id: z.string()
});

const identify = async (req, res) => {
  try {
    const validatedData = identifySchema.parse(req.body);
    
    const query = `
      UPDATE events
      SET user_id = $1
      WHERE project_id = $2 AND anonymous_id = $3 AND user_id IS NULL
    `;
    
    const { rowCount } = await db.query(query, [
      validatedData.user_id,
      validatedData.project_id,
      validatedData.anonymous_id
    ]);
    
    res.status(200).json({ success: true, updated_events: rowCount });
  } catch (error) {
    console.error('Identify Error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: 'Validation Error', details: error.errors });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { identify };
