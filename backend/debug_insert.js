const db = require('./db/index');

const testInsert = async () => {
    try {
        const payload = {
            name: "Test Debug Project",
            environment: "prod",
            product_type: "saas"
        };

        const DEFAULT_MODULES = {
            'ecommerce': ['events', 'funnel', 'revenue', 'conversion', 'segmentation'],
            'content': ['events', 'engagement', 'retention', 'segmentation'],
            'saas': ['events', 'funnel', 'retention', 'feature_usage', 'segmentation'],
            'custom': ['events', 'funnel', 'retention', 'segmentation']
        };

        const modules = DEFAULT_MODULES[payload.product_type] || DEFAULT_MODULES['custom'];

        console.log("Inserting with modules:", modules);

        const result = await db.query(
            'INSERT INTO projects (name, plan_type, usage_limit_events, retention_days, product_type, enabled_modules) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [payload.name, 'free', 10000, 30, payload.product_type, JSON.stringify(modules)]
        );
        console.log("Success:", result.rows[0]);
    } catch (err) {
        console.error("FAIL:", err);
    }
};

testInsert();
