import { useState, useEffect, useMemo, useCallback } from 'react';
import axios from 'axios';

const API_BASE = '/v1/analytics';

export const useAnalytics = (projectId, timeRange = '24h', pollingInterval = 30000, enabledModules = [], cohortId = null) => {
    const [overview, setOverview] = useState({});
    const [events, setEvents] = useState([]);
    const [funnel, setFunnel] = useState([]);
    const [retention, setRetention] = useState([]);
    const [segmentation, setSegmentation] = useState({ data: [], meta: {} });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        if (!projectId) return;

        setLoading(true);
        setError(null);
        try {
            const params = { project_id: projectId, range: timeRange, cohort_id: cohortId };
            const promises = [];

            // Always fetch overview if events or engagement are enabled, or just always for safety
            promises.push(axios.get(`${API_BASE}/overview`, { params }).then(r => r.data));

            // Conditional fetches
            const shouldFetchEvents = enabledModules.includes('events') || enabledModules.length === 0;
            const shouldFetchFunnel = enabledModules.includes('funnel') || enabledModules.length === 0;
            const shouldFetchRetention = enabledModules.includes('retention') || enabledModules.length === 0;

            if (shouldFetchEvents) {
                promises.push(axios.get(`${API_BASE}/events`, { params }).then(r => r.data));
            } else {
                promises.push(Promise.resolve([]));
            }

            if (shouldFetchFunnel) {
                promises.push(axios.get(`${API_BASE}/funnel`, {
                    params: {
                        ...params,
                        'steps[]': ['page_view', 'signup_completed', 'feature_used']
                    }
                }).then(r => r.data));
            } else {
                promises.push(Promise.resolve([]));
            }

            if (shouldFetchRetention) {
                promises.push(axios.get(`${API_BASE}/retention`, { params }).then(r => r.data));
            } else {
                promises.push(Promise.resolve([]));
            }

            const [overData, evsData, funData, retData] = await Promise.all(promises);

            setOverview(overData);
            setEvents(conversionEvents => evsData); // Fix naming if needed, here just raw data
            setFunnel(funData);
            setRetention(retData);
            // setEvents(evsData) 
            // Note: I need to match the original setting logic.
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError(err);
        } finally {
            setLoading(false);
        }
    }, [projectId, timeRange, enabledModules, cohortId]);

    const fetchSegmentation = useCallback(async (eventName, filterProp, filterValue) => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_BASE}/segmentation`, {
                params: {
                    project_id: projectId,
                    range: timeRange,
                    event: eventName,
                    prop: filterProp,
                    val: filterValue,
                    cohort_id: cohortId
                }
            });
            setSegmentation(res.data);
        } catch (err) {
            console.error('Segmentation failed:', err);
        } finally {
            setLoading(false);
        }
    }, [projectId, timeRange, cohortId]);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, pollingInterval);
        return () => clearInterval(interval);
    }, [fetchData, pollingInterval]);

    const conversionRate = useMemo(() => {
        if (!funnel || !funnel.length) return 0;
        const topStep = funnel[0].users;
        const bottomStep = funnel[funnel.length - 1].users;
        if (!topStep) return 0;
        return ((bottomStep / topStep) * 100).toFixed(1);
    }, [funnel]);

    return {
        overview,
        events,
        funnel,
        retention,
        segmentation,
        loading,
        error,
        conversionRate,
        refetch: fetchData,
        fetchSegmentation
    };
};

