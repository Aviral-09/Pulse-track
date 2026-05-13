const db = require('../config/db');

const getTopEvents = async (req, res) => {
  try {
    const { project_id, limit = 10 } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });

    const query = `
      SELECT event_name, COUNT(*) as count
      FROM events
      WHERE project_id = $1
      GROUP BY event_name
      ORDER BY count DESC
      LIMIT $2
    `;
    const { rows } = await db.query(query, [project_id, parseInt(limit, 10)]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Top Events Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getEventsCount = async (req, res) => {
  try {
    const { project_id, days = 7 } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id is required' });

    const query = `
      SELECT DATE_TRUNC('day', created_at) as date, COUNT(*) as count
      FROM events
      WHERE project_id = $1 AND created_at >= NOW() - INTERVAL '1 day' * $2
      GROUP BY date
      ORDER BY date ASC
    `;
    const { rows } = await db.query(query, [project_id, parseInt(days, 10)]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Events Count Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

const getFunnel = async (req, res) => {
  try {
    const { project_id, steps } = req.query; 
    if (!project_id || !steps) return res.status(400).json({ error: 'project_id and steps are required' });

    const stepArray = steps.split(',');
    if (stepArray.length === 0) return res.status(400).json({ error: 'Invalid steps' });
    
    let withClauses = [];
    let joins = [];
    let selects = [];
    
    stepArray.forEach((step, index) => {
      const stepName = `step_${index + 1}`;
      withClauses.push(`
        ${stepName} AS (
          SELECT anonymous_id, MIN(created_at) as first_time
          FROM events
          WHERE project_id = $1 AND event_name = $${index + 2}
          GROUP BY anonymous_id
        )
      `);
      
      if (index === 0) {
        joins.push(`FROM ${stepName}`);
      } else {
        const prevStepName = `step_${index}`;
        joins.push(`
          LEFT JOIN ${stepName} ON ${stepName}.anonymous_id = ${prevStepName}.anonymous_id 
          AND ${stepName}.first_time > ${prevStepName}.first_time
        `);
      }
      selects.push(`COUNT(DISTINCT ${stepName}.anonymous_id) as ${stepName}_count`);
    });

    const query = `
      WITH ${withClauses.join(',\n')}
      SELECT ${selects.join(', ')}
      ${joins.join('\n')}
    `;
    
    const params = [project_id, ...stepArray];
    const { rows } = await db.query(query, params);
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Funnel Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = { getTopEvents, getEventsCount, getFunnel };
