const db = require('./index');

const migrate = async () => {
    try {
        console.log('Migrating projects table...');

        // Add product_type column
        await db.query(`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS product_type VARCHAR(50) DEFAULT 'custom';
        `);

        // Add enabled_modules column (using JSONB for flexibility)
        await db.query(`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS enabled_modules JSONB DEFAULT '["events", "funnel", "retention"]'::jsonb;
        `);

        console.log('Migration successful.');
        process.exit(0);
    } catch (err) {
        console.error('Migration failed:', err);
        process.exit(1);
    }
};

migrate();
