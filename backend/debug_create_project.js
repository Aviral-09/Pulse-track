const db = require('./db/index');

const testInsert = async () => {
    try {
        const name = "Test Project " + Date.now();
        const product_type = "saas";
        const modules = ["events", "funnel"];

        console.log("Attempting insert...");
        const result = await db.query(
            'INSERT INTO projects (name, plan_type, usage_limit_events, retention_days, product_type, enabled_modules) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, 'free', 10000, 30, product_type, JSON.stringify(modules)]
        );
        console.log("Insert successful:", result.rows[0]);
    } catch (err) {
        console.error("Insert failed:", err);
    }
};

testInsert();
