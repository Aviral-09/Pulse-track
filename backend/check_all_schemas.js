import db from './db/index.js';

async function checkAllSchemas() {
    try {
        const tables = ['events', 'users'];
        for (const table of tables) {
            const res = await db.query(`
                SELECT column_name, data_type, is_nullable
                FROM information_schema.columns
                WHERE table_name = $1
                ORDER BY ordinal_position;
            `, [table]);
            console.log(`Columns for ${table}:`);
            console.table(res.rows);
        }
        process.exit(0);
    } catch (err) {
        console.error('Error checking schemas:', err);
        process.exit(1);
    }
}

checkAllSchemas();
