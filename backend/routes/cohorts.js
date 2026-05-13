import express from 'express';
import db from '../db/index.js';
import { buildCohortQuery } from '../utils/cohortEngine.js';

const router = express.Router();

// GET /v1/cohorts
router.get('/', async (req, res) => {
    const { project_id } = req.query;
    if (!project_id) return res.status(400).json({ error: 'project_id required' });

    try {
        const result = await db.query(
            'SELECT * FROM cohorts WHERE project_id = $1 ORDER BY created_at DESC',
            [project_id]
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /v1/cohorts/:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM cohorts WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cohort not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /v1/cohorts
router.post('/', async (req, res) => {
    const { project_id, name, description, definition } = req.body;
    if (!project_id || !name || !definition) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const result = await db.query(
            'INSERT INTO cohorts (project_id, name, description, definition) VALUES ($1, $2, $3, $4) RETURNING *',
            [project_id, name, description, definition]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /v1/cohorts/:id
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, definition } = req.body;

    // We don't verify project_id match here for brevity, but in production we should ensure 
    // the user has access to this cohort's project.

    try {
        const result = await db.query(
            'UPDATE cohorts SET name = COALESCE($1, name), description = COALESCE($2, description), definition = COALESCE($3, definition), updated_at = NOW() WHERE id = $4 RETURNING *',
            [name, description, definition, id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Cohort not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /v1/cohorts/:id
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM cohorts WHERE id = $1', [id]);
        res.json({ status: 'ok' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /v1/cohorts/preview
router.post('/preview', async (req, res) => {
    const { project_id, definition } = req.body;
    if (!project_id || !definition) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const { sql, params } = buildCohortQuery(definition, project_id);
        const countQuery = `SELECT COUNT(*) as count FROM (${sql}) as sub`;

        const result = await db.query(countQuery, params);
        res.json({ count: parseInt(result.rows[0].count) });
    } catch (err) {
        console.error("Cohort preview error", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
