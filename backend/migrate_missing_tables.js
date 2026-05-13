import db from './db/index.js';

async function migrate() {
    try {
        console.log('Starting migration for missing tables...');

        // 1. Projects table
        await db.query(`
            CREATE TABLE IF NOT EXISTS projects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name TEXT NOT NULL,
                public_key UUID UNIQUE DEFAULT gen_random_uuid(),
                plan_type TEXT DEFAULT 'free',
                usage_limit_events BIGINT DEFAULT 10000,
                retention_days INT DEFAULT 30,
                product_type TEXT DEFAULT 'custom',
                enabled_modules JSONB DEFAULT '["events", "funnel", "retention", "segmentation"]'::jsonb,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✓ Projects table created or exists.');

        // 2. Identity Merges table
        await db.query(`
            CREATE TABLE IF NOT EXISTS identity_merges (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                anonymous_id TEXT NOT NULL,
                user_id UUID NOT NULL,
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                UNIQUE(anonymous_id, user_id, project_id)
            );
        `);
        console.log('✓ Identity Merges table created or exists.');

        // 3. Cohorts table
        await db.query(`
            CREATE TABLE IF NOT EXISTS cohorts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
                name TEXT NOT NULL,
                description TEXT,
                definition JSONB NOT NULL,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);
        console.log('✓ Cohorts table created or exists.');

        console.log('Migration completed successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
}

migrate();
