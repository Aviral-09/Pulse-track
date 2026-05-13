const db = require('./db/index');

const checkSchema = async () => {
    try {
        const res = await db.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns
            WHERE table_name = 'events';
        `);
        console.log("Events Schema:", res.rows);
        process.exit(0);
    } catch (err) {
        console.error("Schema check failed:", err);
        process.exit(1);
    }
};

checkSchema();
