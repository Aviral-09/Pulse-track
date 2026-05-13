require('dotenv').config();
const app = require('./app');
const db = require('./config/db');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        // Check DB connection
        await db.query('SELECT 1');
        console.log('Database connected successfully.');

        app.listen(PORT, () => {
            console.log(`[Pulse-Track] Production Server running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Failed to connect to the database', err);
        process.exit(1);
    }
};

startServer();
