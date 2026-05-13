import db from './db/index.js';

async function listTables() {
    try {
        const res = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public';
        `);
        console.log('Tables in public schema:');
        console.table(res.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error listing tables:', err);
        process.exit(1);
    }
}

listTables();
