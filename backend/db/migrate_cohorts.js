const db = require('./index');

const migrate = async () => {
    try {
        console.log('Migrating cohorts table...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS cohorts (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                definition JSONB NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Index for faster lookups by project
        await db.query(`
            CREATE INDEX IF NOT EXISTS idx_cohorts_project_id ON cohorts(project_id);
        `);

        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
