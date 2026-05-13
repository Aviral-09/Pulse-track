import express from 'express';
import db from '../db/index.js';
import { buildCohortQuery } from '../utils/cohortEngine.js';

const router = express.Router();

// Helper to get time range filter
const getTimeFilter = (range, alias = '') => {
    const prefix = alias ? `${alias}.` : '';
    switch (range) {
        case '24h': return `AND ${prefix}created_at > now() - interval '24 hours'`;
        case '7d': return `AND ${prefix}created_at > now() - interval '7 days'`;
        case '30d': return `AND ${prefix}created_at > now() - interval '30 days'`;
        default: return `AND ${prefix}created_at > now() - interval '24 hours'`;
    }
};

// Helper to generate cohort subquery and params
const getCohortCondition = async (cohortId, projectId, paramOffset, identityExpr) => {
    if (!cohortId) return { clause: '', params: [] };

    const cRes = await db.query('SELECT definition FROM cohorts WHERE id = $1', [cohortId]);
    if (cRes.rows.length === 0) throw new Error('Cohort not found');

    const { sql, params } = buildCohortQuery(cRes.rows[0].definition, projectId, paramOffset);
    return {
        clause: `AND ${identityExpr} IN (${sql})`,
        params
    };
};

// GET /v1/analytics/overview
router.get('/overview', async (req, res) => {
    const { project_id, range = '24h', cohort_id } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    try {
        const timeFilter = getTimeFilter(range, 'e');
        // FIXED: Fully qualified identity expression to avoid ambiguity with joined tables
        const { clause: cohortClause, params: cohortParams } = await getCohortCondition(cohort_id, project_id, 2, "COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)");

        // Aliasing the tables in `overview`: `FROM events e` to match the timeFilter alias 'e'
        const safeQuery = `
            SELECT 
                (SELECT COUNT(*) FROM events e LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id WHERE e.project_id = $1 ${timeFilter} ${cohortClause}) as total_events,
                (SELECT COUNT(DISTINCT e.anonymous_id) FROM events e LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id WHERE e.project_id = $1 ${timeFilter} ${cohortClause}) as unique_users,
                (SELECT COUNT(DISTINCT e.anonymous_id) FROM events e LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id WHERE e.project_id = $1 AND e.created_at > now() - interval '24 hours' ${cohortClause}) as active_users_24h
        `;

        const result = await db.query(safeQuery, [project_id, ...cohortParams]);
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/analytics/events
router.get('/events', async (req, res) => {
    const { project_id, range = '24h', cohort_id } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    try {
        const timeFilter = getTimeFilter(range, 'e'); // "AND e.created_at ..."
        // We need consistent aliasing "e" for getCohortCondition compatibility if we use e.user_id
        const { clause: cohortClause, params: cohortParams } = await getCohortCondition(cohort_id, project_id, 2, "COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)");

        const query = `
SELECT
e.event_name,
    COUNT(*) as count,
    MAX(e.created_at) as last_seen
      FROM events e
      LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
      WHERE e.project_id = $1 ${timeFilter} ${cohortClause}
      GROUP BY e.event_name
      ORDER BY count DESC
    `;
        const result = await db.query(query, [project_id, ...cohortParams]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/analytics/funnel
// SUGGESTION: Move this complex CTE query to a Supabase RPC (PostgreSQL function) for better performance.
// Calling an RPC via Supabase would significantly reduce query planning overhead for multi-step funnels.
router.get('/funnel', async (req, res) => {
    const { project_id, range = '24h', cohort_id } = req.query;
    let steps = req.query.steps || req.query['steps[]'];
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    if (typeof steps === 'string') steps = [steps];
    if (!Array.isArray(steps) || steps.length < 2) {
        return res.status(400).json({ error: 'Minimum 2 steps required' });
    }

    try {
        const timeFilter = getTimeFilter(range, 'e');

        // Handle Cohort Filter
        // Param offset: $1=project_id, $2..$N=steps. So offset starts at 2 + steps.length
        const paramOffset = 2 + steps.length;
        // The identity expression in the CTEs is COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)
        // But we need to be careful. The CTEs build identity.
        // We should filter INSIDE the CTEs for performance? 
        // Or filter the first step? 
        // Filtering inside the CTEs ensures we only consider relevant users from the start.

        // Note: The CTE queries use `COALESCE(...) as identity`. 
        // So we can matching against that expression.
        const identityExpr = "COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)";
        const { clause: cohortClause, params: cohortParams } = await getCohortCondition(cohort_id, project_id, paramOffset, identityExpr);

        let cteQueries = [];
        steps.forEach((step, index) => {
            // Steps params are at index + 2 (since $1 is project_id)
            if (index === 0) {
                cteQueries.push(`
          step_0 AS(
        SELECT 
              ${identityExpr} as identity,
        MIN(e.created_at) as t0
            FROM events e
            LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
            WHERE e.project_id = $1 AND e.event_name = $${index + 2} ${timeFilter} ${cohortClause}
            GROUP BY 1
    )
        `);
            } else {
                // For subsequent steps, we join on previous step, so we implicitly filter by cohort 
                // IF the first step is filtered. HOWEVER, users might enter the funnel late?
                // Standard funnel logic is sequential. If step 0 is filtered, the whole funnel finds users in that cohort.
                // But if cohort is "Users who did X", maybe they did X independently of this funnel.
                // Safest to apply cohort filter to ALL steps or just rely on the identity join if users must flow through step 0.
                // Usually applying to step 0 is sufficient for "Users who started here".
                // But valid funnels might allow loose entry? Our logic enforces `JOIN step_${ index - 1 } `, so step 0 is the gatekeeper.

                cteQueries.push(`
          step_${index} AS(
        SELECT 
              ${identityExpr} as identity,
        MIN(e.created_at) as t${index}
            FROM events e
            LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
            JOIN step_${index - 1} prev ON ${identityExpr} = prev.identity
            WHERE e.project_id = $1 AND e.event_name = $${index + 2} AND e.created_at > prev.t${index - 1}
        GROUP BY 1
    )
    `);
            }
        });

        const finalSelect = steps.map((_, i) => `(SELECT COUNT(*) FROM step_${i}) as step_${i} _count`).join(', ');
        const fullQuery = `WITH ${cteQueries.join(', ')} SELECT ${finalSelect} `;

        const result = await db.query(fullQuery, [project_id, ...steps, ...cohortParams]);
        const counts = result.rows[0];

        const report = steps.map((step, i) => {
            const currentCount = parseInt(counts[`step_${i} _count`]);
            const prevCount = i === 0 ? currentCount : parseInt(counts[`step_${i - 1} _count`]);

            return {
                step,
                users: currentCount,
                conversion_rate: i === 0 ? 100 : (prevCount === 0 ? 0 : parseFloat(((currentCount / prevCount) * 100).toFixed(2))),
                drop_off: i === 0 ? 0 : (prevCount === 0 ? 0 : parseFloat(((1 - (currentCount / prevCount)) * 100).toFixed(2)))
            };
        });

        res.json(report);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/analytics/segmentation
router.get('/segmentation', async (req, res) => {
    const { project_id, range = '24h', event, prop, val, cohort_id } = req.query;
    if (!project_id || !event) return res.status(400).json({ error: 'project_id and event required' });

    try {
        const timeFilter = getTimeFilter(range, 'e');
        let propFilter = '';
        const params = [project_id, event];

        // Param index tracking
        let paramIdx = 3;

        if (prop && val) {
            propFilter = `AND properties ->> $${paramIdx} = $${paramIdx + 1} `;
            params.push(prop, val);
            paramIdx += 2;
        }

        const identityExpr = "COALESCE(user_id::text, anonymous_id)";
        // Note: Segmentation query currently uses `events` table directly without explicit join to `identity_merges` in the WHERE clause?
        // But wait, `buildCohortQuery` returns unified identity.
        // The original query was simpler:
        /*
            SELECT ... FROM events
            WHERE project_id = $1 ...
        */
        // If we want to filter by cohort (which uses unified identities), we should support unified identity here too.
        // But `events` table has `user_id` and `anonymous_id`.
        // If the cohort engine references `identity_merges`, we need to be consistent.

        // For correctness, we should match against:
        // COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)
        // But we need to JOIN `identity_merges` in the main query if we want to support this identity resolution.
        // The original segmentation query didn't join `identity_merges`, it just counted events.
        // If we apply a cohort filter (User list), we must ensure we match the User correctly.

        // Let's add the JOIN if cohort is present? Or just use subquery match?
        // "COALESCE(user_id::text, anonymous_id) IN ..."
        // This misses the case where `anonymous_id` matches a merged user.
        // To support this fully, we should JOIN identity_merges.

        // Let's update the query to be robust.

        const { clause: cohortClause, params: cohortParams } = await getCohortCondition(cohort_id, project_id, paramIdx, "COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)");

        const query = `
SELECT
date_trunc('hour', e.created_at) as time,
    COUNT(*) as count,
    COUNT(DISTINCT e.anonymous_id) as unique_users
            FROM events e
            LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
            WHERE e.project_id = $1 AND e.event_name = $2 ${timeFilter} ${propFilter} ${cohortClause}
            GROUP BY 1
            ORDER BY 1 ASC
        `;

        const result = await db.query(query, [...params, ...cohortParams]);
        res.json({ data: result.rows, meta: { event, prop, val } });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/analytics/retention
// SUGGESTION: Move this heavy retention calculation to a Supabase RPC. 
// Executing this directly in PostgreSQL as a compiled function is more efficient.
router.get('/retention', async (req, res) => {
    const { project_id, range = '30d', cohort_id } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    try {
        // Param offset: $1 is project_id. Next is 2.
        const identityExpr = "COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id)"; // Used in cohort query
        // Wait, the main query also defines `identity` in CTE.
        // `first_action` CTE.

        const { clause: cohortClause, params: cohortParams } = await getCohortCondition(cohort_id, project_id, 2, "COALESCE(user_id::text, anonymous_id)");
        // Note: The `first_action` CTE selects from `events`. 
        // Ideally we join identity_merges there too for consistency.

        // Updated Retention Query with Identity Support + Cohort
        const query = `
            WITH first_action AS(
        SELECT 
                    COALESCE(e.user_id:: text, im.user_id:: text, e.anonymous_id) as identity,
        MIN(e.created_at:: date) as cohort_date
                FROM events e
                LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
                WHERE e.project_id = $1 ${cohortClause}
                GROUP BY 1
    ),
    subsequent_actions AS(
        SELECT 
                    f.cohort_date,
        COALESCE(e.user_id:: text, im.user_id:: text, e.anonymous_id) as identity,
        (e.created_at:: date - f.cohort_date) as day_diff
                FROM events e
                LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
                JOIN first_action f ON COALESCE(e.user_id:: text, im.user_id:: text, e.anonymous_id) = f.identity
                WHERE e.project_id = $1 AND e.created_at:: date >= f.cohort_date
            )
SELECT
cohort_date,
    day_diff,
    COUNT(DISTINCT identity) as users
            FROM subsequent_actions
            WHERE day_diff <= 7
            GROUP BY 1, 2
            ORDER BY 1, 2
    `;

        const result = await db.query(query, [project_id, ...cohortParams]);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/analytics/projects
router.get('/projects', async (req, res) => {
    try {
        const result = await db.query('SELECT id, name, public_key, plan_type, retention_days, product_type, enabled_modules, created_at FROM projects ORDER BY created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const DEFAULT_MODULES = {
    'ecommerce': ['events', 'funnel', 'revenue', 'conversion', 'segmentation'],
    'content': ['events', 'engagement', 'retention', 'segmentation'],
    'saas': ['events', 'funnel', 'retention', 'feature_usage', 'segmentation'],
    'custom': ['events', 'funnel', 'retention', 'segmentation']
};

// POST /v1/analytics/projects (Onboarding)
router.post('/projects', async (req, res) => {
    console.log('--------------------------------------------------');
    console.log('[API] Hit POST /v1/analytics/projects');
    console.log('[API] Request body:', JSON.stringify(req.body, null, 2));
    
    const { name, environment = 'prod', product_type = 'custom' } = req.body;
    if (!name) {
        console.error('[API] Validation failed: name is required');
        return res.status(400).json({ error: 'Project name required' });
    }

    const modules = DEFAULT_MODULES[product_type] || DEFAULT_MODULES['custom'];
    console.log('[API] Assigned modules for product type:', product_type, '->', modules);

    try {
        console.log('[API] Executing INSERT query...');
        const result = await db.query(
            'INSERT INTO projects (name, plan_type, usage_limit_events, retention_days, product_type, enabled_modules) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, 'free', 10000, 30, product_type, JSON.stringify(modules)]
        );
        console.log('[API] DB Insert Success. Created ID:', result.rows[0].id);
        console.log('[API] Generated Public Key:', result.rows[0].public_key);
        console.log('--------------------------------------------------');
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('[API] !! Create Project DATABASE ERROR !!');
        console.error('[API] Error Details:', err.message);
        console.error('[API] Stack Trace:', err.stack);
        console.log('--------------------------------------------------');
        res.status(500).json({ error: err.message });
    }
});

// PATCH /v1/analytics/projects/:id/config
router.patch('/projects/:id/config', async (req, res) => {
    const { id } = req.params;
    const { enabled_modules } = req.body;

    if (!Array.isArray(enabled_modules)) {
        return res.status(400).json({ error: 'enabled_modules must be an array' });
    }

    try {
        const result = await db.query(
            'UPDATE projects SET enabled_modules = $1 WHERE id = $2 RETURNING *',
            [JSON.stringify(enabled_modules), id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/analytics/usage
router.get('/usage', async (req, res) => {
    const { project_id } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    try {
        const query = `
SELECT
p.plan_type,
    p.usage_limit_events,
    p.retention_days,
    (SELECT COUNT(*) FROM events WHERE project_id = p.id AND created_at > date_trunc('month', now())) as current_month_events,
        (SELECT COUNT(DISTINCT identity_id) FROM(
            SELECT COALESCE(user_id:: text, anonymous_id) as identity_id 
                    FROM events 
                    WHERE project_id = p.id AND created_at > now() - interval '30 days'
        ) as users) as active_users_30d
            FROM projects p
            WHERE p.id = $1
    `;
        const result = await db.query(query, [project_id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Project not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


export default router;
