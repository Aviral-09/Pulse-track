import express from 'express';
import db from '../db/index.js';
import { trackEventSchema, identifySchema, batchTrackSchema } from '../utils/validation.js';

const router = express.Router();

// POST /v1/track
router.post('/', async (req, res) => {
    const start = Date.now();
    try {
        const result = trackEventSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: 'Invalid payload', details: result.error.format() });
        }

        const {
            project_id,
            event_name,
            anonymous_id,
            user_id,
            properties,
            page_url,
            user_agent,
            event_version,
            sdk_version,
            environment
        } = result.data;

        const query = `
            INSERT INTO events (
                project_id, event_name, anonymous_id, user_id, 
                properties, page_url, user_agent, event_version, 
                sdk_version, environment, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        `;

        const values = [
            project_id,
            event_name,
            anonymous_id,
            user_id || null,
            properties || {},
            page_url || null,
            user_agent || null,
            event_version || '1.0.0',
            sdk_version || null,
            environment || 'prod'
        ];

        await db.query(query, values);
        
        const duration = Date.now() - start;
        return res.status(202).json({ status: 'ok', duration: `${duration}ms` });
    } catch (err) {
        console.error('INGESTION CATCH:', err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

// POST /v1/track/batch
router.post('/batch', async (req, res) => {
    const start = Date.now();
    try {
        const result = batchTrackSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: 'Invalid batch payload', details: result.error.format() });
        }

        const events = result.data.events;
        
        const projectIds = events.map(e => e.project_id);
        const anonymousIds = events.map(e => e.anonymous_id);
        const userIds = events.map(e => e.user_id || null);
        const eventNames = events.map(e => e.event_name);
        const propertiesArray = events.map(e => e.properties || {});
        const pageUrls = events.map(e => e.page_url || null);
        const userAgents = events.map(e => e.user_agent || null);
        const eventVersions = events.map(e => e.event_version || '1.0.0');
        const sdkVersions = events.map(e => e.sdk_version || null);
        const environments = events.map(e => e.environment || 'prod');

        const query = `
            INSERT INTO events (
                project_id, anonymous_id, user_id, event_name, 
                properties, page_url, user_agent, event_version, 
                sdk_version, environment, created_at
            ) SELECT * FROM UNNEST(
                $1::uuid[], $2::text[], $3::uuid[], $4::text[], 
                $5::jsonb[], $6::text[], $7::text[], $8::text[], 
                $9::text[], $10::text[], 
                ARRAY(SELECT NOW() FROM generate_series(1, array_length($1::uuid[], 1)))::timestamptz[]
            )
        `;

        const values = [
            projectIds, anonymousIds, userIds, eventNames, propertiesArray,
            pageUrls, userAgents, eventVersions, sdkVersions, environments
        ];

        await db.query(query, values);
        
        const duration = Date.now() - start;
        return res.status(202).json({ status: 'ok', count: events.length, duration: `${duration}ms` });
    } catch (err) {
        console.error('BATCH INGESTION CATCH:', err);
        return res.status(500).json({ error: 'Internal server error', message: err.message });
    }
});

router.post('/identify', async (req, res) => {
    try {
        const result = identifySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: 'Invalid payload', details: result.error.format() });
        }

        const { project_id, anonymous_id, user_id } = result.data;

        await db.query(`
            INSERT INTO identity_merges (anonymous_id, user_id, project_id)
            VALUES ($1, $2, $3)
            ON CONFLICT (anonymous_id, user_id, project_id) DO NOTHING
        `, [anonymous_id, user_id, project_id]);

        await db.query(`
            INSERT INTO users (id, anonymous_id)
            VALUES ($1, $2)
            ON CONFLICT (id) DO UPDATE SET anonymous_id = EXCLUDED.anonymous_id
        `, [user_id, anonymous_id]);

        return res.status(200).json({ status: 'ok', identity_linked: true });
    } catch (err) {
        console.error('IDENTIFY ERROR:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.delete('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const { project_id } = req.query;

    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    try {
        await db.query('BEGIN');
        await db.query('DELETE FROM events WHERE user_id = $1 AND project_id = $2', [userId, project_id]);
        await db.query('DELETE FROM identity_merges WHERE user_id = $1 AND project_id = $2', [userId, project_id]);
        await db.query('DELETE FROM users WHERE id = $1', [userId]);
        await db.query('COMMIT');

        res.json({ status: 'ok', message: 'User data deleted' });
    } catch (err) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

export default router;
