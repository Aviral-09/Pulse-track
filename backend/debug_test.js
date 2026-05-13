const axios = require('axios');

async function testAnalytics() {
    try {
        console.log("Fetching projects...");
        const projectsRes = await axios.get('http://localhost:5000/v1/analytics/projects');
        const projectId = projectsRes.data[0].id;
        console.log("Using Project ID:", projectId);

        console.log("Testing Overview...");
        const overviewRes = await axios.get(`http://localhost:5000/v1/analytics/overview?project_id=${projectId}`);
        console.log("Overview OK:", overviewRes.data);

        console.log("Testing Events...");
        const eventsRes = await axios.get(`http://localhost:5000/v1/analytics/events?project_id=${projectId}`);
        console.log("Events OK, count:", eventsRes.data.length);

        console.log("Testing Segmentation (should not crash)...");
        // We need a valid event name. Assume 'page_view' or take first from events
        const eventName = eventsRes.data.length > 0 ? eventsRes.data[0].event_name : 'page_view';
        const segRes = await axios.get(`http://localhost:5000/v1/analytics/segmentation?project_id=${projectId}&event=${eventName}`);
        console.log("Segmentation OK:", segRes.data.data.length, "points");

    } catch (err) {
        console.error("Error:", err.response ? err.response.data : err.message);
    }
}

testAnalytics();
