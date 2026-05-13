import db from './db/index.js';

async function checkSchema() {
    try {
        const res = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'projects'
            ORDER BY ordinal_position;
        `);
        console.log('Projects table columns:');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error checking schema:', err);
        process.exit(1);
    }
}

checkSchema();
