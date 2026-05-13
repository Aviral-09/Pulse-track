import db from '../db/index.js';

/**
 * Parses a time window string or object into a SQL interval.
 */
const parseTimeWindow = (tw) => {
    if (!tw || tw === 'all') return null;

    let type = 'relative';
    let value = '30d';

    if (typeof tw === 'object') {
        type = tw.type || 'relative';
        value = tw.value || '30d';
    } else {
        value = String(tw);
    }

    if (type === 'relative') {
        const amount = parseInt(value) || 30;
        const unit = value.includes('h') ? 'hours' : 'days';
        return `now() - interval '${amount} ${unit}'`;
    }

    // For absolute, expectation is a date string
    return `'${value}'::timestamp`;
};

/**
 * Builds a subquery for a single rule.
 */
const buildRuleQuery = (rule, projectId, paramOffset) => {
    const {
        type = 'event_occurrence',
        event,
        condition = 'occurred', // occurred | not_occurred
        operator = '>=',
        count = 1,
        time_window,
        properties = []
    } = rule;

    const params = [];
    let pIdx = paramOffset;

    // 1. Time Window
    let timeClause = "";
    const timeLimit = parseTimeWindow(time_window);
    if (timeLimit) {
        timeClause = `AND e.created_at > ${timeLimit}`;
    }

    // 2. Property Filters
    let propClause = "";
    if (properties && properties.length > 0) {
        properties.forEach(prop => {
            const { key, operator: propOp, value } = prop;
            const validOps = {
                'equals': '=',
                '=': '=',
                'not equals': '!=',
                '!=': '!=',
                'contains': 'LIKE',
                'LIKE': 'LIKE',
                'greater than': '>',
                '>': '>',
                'less than': '<',
                '<': '<'
            };
            const sqlOp = validOps[propOp] || '=';
            const sqlValue = sqlOp === 'LIKE' ? `%${value}%` : value;

            propClause += ` AND (e.properties->>'${key.replace(/'/g, "")}')::text ${sqlOp} $${pIdx}`;
            params.push(String(sqlValue));
            pIdx++;
        });
    }

    params.push(projectId);
    const projectIdIdx = pIdx++;
    params.push(event);
    const eventIdx = pIdx++;

    // Base query to find matching identities
    const frequencyClause = type === 'event_frequency' ? `HAVING COUNT(*) ${operator} ${parseInt(count)}` : '';

    const baseQuery = `
        SELECT 
            COALESCE(e.user_id::text, im.user_id::text, e.anonymous_id) as identity
        FROM events e
        LEFT JOIN identity_merges im ON e.anonymous_id = im.anonymous_id AND e.project_id = im.project_id
        WHERE e.project_id = $${projectIdIdx}
        AND e.event_name = $${eventIdx}
        ${timeClause}
        ${propClause}
        GROUP BY 1
        ${frequencyClause}
    `;

    if (condition === 'not_occurred' || rule.match_type === 'not_exist') {
        const universeTimeLimit = parseTimeWindow(time_window) || "now() - interval '30 days'";
        const sql = `
            SELECT DISTINCT 
                COALESCE(u.user_id::text, uim.user_id::text, u.anonymous_id) as identity
            FROM events u
            LEFT JOIN identity_merges uim ON u.anonymous_id = uim.anonymous_id AND u.project_id = uim.project_id
            WHERE u.project_id = $${projectIdIdx}
            AND u.created_at > ${universeTimeLimit}
            EXCEPT
            (${baseQuery})
        `;
        return { sql, params, nextParamIdx: pIdx };
    }

    return { sql: baseQuery, params, nextParamIdx: pIdx };
};

/**
 * Builds a SQL query to identify users in a cohort.
 */
const buildCohortQuery = (definition, projectId, paramOffset = 1) => {
    // Standardize definition
    let logic = definition.logic || 'AND';
    let rules = definition.rules;

    // Handle backward compatibility
    if (!rules) {
        rules = [{
            type: definition.count > 1 ? 'event_frequency' : 'event_occurrence',
            event: definition.event,
            condition: definition.match_type === 'not_exist' ? 'not_occurred' : 'occurred',
            operator: definition.operator || '>=',
            count: definition.count || 1,
            time_window: definition.time_window,
            properties: definition.properties || []
        }];
    }

    const allParams = [];
    let currentParamIdx = paramOffset;
    const subQueries = [];

    rules.forEach(rule => {
        const { sql, params, nextParamIdx } = buildRuleQuery(rule, projectId, currentParamIdx);
        subQueries.push(sql);
        allParams.push(...params);
        currentParamIdx = nextParamIdx;
    });

    if (subQueries.length === 0) {
        return { sql: "SELECT NULL LIMIT 0", params: [] };
    }

    const setOperator = logic === 'OR' ? 'UNION' : 'INTERSECT';
    const finalSql = subQueries.join(` ${setOperator} `);

    return {
        sql: finalSql,
        params: allParams
    };
};

export { buildCohortQuery };
