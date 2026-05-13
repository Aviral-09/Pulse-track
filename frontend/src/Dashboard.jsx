import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Activity,
    Users,
    Zap,
    BarChart3,
    Info,
    Settings,
    LineChart as LineChartIcon,
    RotateCcw
} from 'lucide-react';

import AppShell from './components/AppShell';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import StatCard from './components/StatCard';
import FunnelView from './components/FunnelView';
import EventTable from './components/EventTable';
import DemoActions from './components/DemoActions';
import SegmentationView from './components/SegmentationView';
import RetentionView from './components/RetentionView';
import DocsView from './components/DocsView';
import CohortsView from './components/CohortsView';

import { useAnalytics } from './hooks/useAnalytics';
import { analytics } from './sdk/analytics';

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [timeRange, setTimeRange] = useState('24h');
    const [selectedCohort, setSelectedCohort] = useState(''); // Global Cohort Filter
    const [activeTab, setActiveTab] = useState('overview');

    // Fetch projects on mount
    useEffect(() => {
        const loadProjects = async () => {
            try {
                const res = await axios.get('http://localhost:6543/v1/analytics/projects');
                setProjects(res.data);
                if (res.data.length > 0 && !selectedProject) {
                    setSelectedProject(res.data[0]);
                }
            } catch (err) {
                console.error('Failed to load projects', err);
            }
        };
        loadProjects();
    }, []);

    // Re-initialize SDK when project changes for Demo purposes
    useEffect(() => {
        if (selectedProject?.public_key) {
            analytics.init(selectedProject.public_key);
        }
    }, [selectedProject]);

    // Parse enabled modules from project
    const enabledModules = selectedProject?.enabled_modules
        ? (typeof selectedProject.enabled_modules === 'string'
            ? JSON.parse(selectedProject.enabled_modules)
            : selectedProject.enabled_modules)
        : ['events', 'funnel', 'retention', 'segmentation']; // Fallback

    const {
        overview,
        events,
        funnel,
        retention,
        segmentation,
        loading,
        conversionRate,
        refetch,
        fetchSegmentation
    } = useAnalytics(selectedProject?.id, timeRange, 30000, enabledModules, selectedCohort);

    const isModuleEnabled = (module) => enabledModules.includes(module);

    const pageTitle = {
        overview: 'Overview',
        events: 'Real-time Events',
        funnel: 'Conversion Funnel',
        segmentation: 'Segmentation',
        retention: 'Retention',
        cohorts: 'User Cohorts',
        docs: 'Knowledge Base',
        logs: 'Audit Logs',
        settings: 'System Config'
    }[activeTab];

    return (
        <AppShell>
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} enabledModules={enabledModules} />

            <main className="shared_container">
                <Topbar
                    pageTitle={pageTitle}
                    loading={loading}
                    onSync={refetch}
                    projects={projects}
                    currentProject={selectedProject}
                    onProjectChange={setSelectedProject}
                    timeRange={timeRange}
                    onTimeRangeChange={setTimeRange}
                    selectedCohort={selectedCohort}
                    onCohortChange={setSelectedCohort}
                />

                <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth custom-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        {!selectedProject ? (
                            <div className="h-full flex items-center justify-center py-20">
                                <p className="text-[var(--text-secondary)] animate-pulse font-bold tracking-widest text-xs uppercase">Initializing Data Streams...</p>
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                            {isModuleEnabled('events') && (
                                                <StatCard
                                                    title="Total Events"
                                                    value={overview.total_events || 0}
                                                    icon={Activity}
                                                    change="+12.4%"
                                                    subtitle={`${timeRange} window`}
                                                />
                                            )}
                                            {isModuleEnabled('engagement') && (
                                                <StatCard
                                                    title="Unique Users"
                                                    value={overview.unique_users || 0}
                                                    icon={Users}
                                                    change="+8.2%"
                                                    subtitle="Distinct identity total"
                                                />
                                            )}
                                            {isModuleEnabled('engagement') && (
                                                <StatCard
                                                    title="Active Users"
                                                    value={overview.active_users_24h || 0}
                                                    icon={Zap}
                                                    change="+21%"
                                                    subtitle="Last 24 hours"
                                                />
                                            )}
                                            {isModuleEnabled('funnel') && (
                                                <StatCard
                                                    title="Conversion %"
                                                    value={conversionRate}
                                                    icon={BarChart3}
                                                    change={conversionRate > 5 ? '+2.1%' : '-0.5%'}
                                                    subtitle="Funnel completion"
                                                />
                                            )}
                                        </section>

                                        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                            {isModuleEnabled('funnel') && (
                                                <div className="lg:col-span-12 xl:col-span-8 dashboard-card">
                                                    <div className="p-6 border-b border-[var(--border-normal)] flex items-center justify-between">
                                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Conversion Pipeline</h3>
                                                        <span className="text-[10px] text-[var(--accent-primary)] font-bold border border-[var(--border-light)] px-2 py-1 rounded bg-[var(--bg-tertiary)]">IDENTITY-STITCHED</span>
                                                    </div>
                                                    <FunnelView data={funnel} />
                                                </div>
                                            )}

                                            <div className="lg:col-span-12 xl:col-span-4 flex flex-col space-y-6">
                                                <div className="dashboard-card p-6">
                                                    <div className="flex items-center space-x-2 mb-4">
                                                        <Zap size={16} className="text-[var(--accent-primary)]" />
                                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Event Simulator</h3>
                                                    </div>
                                                    <DemoActions onTrack={refetch} />
                                                </div>

                                                <div className="dashboard-card p-6">
                                                    <div className="flex items-start space-x-3">
                                                        <Info size={18} className="text-[var(--text-secondary)] shrink-0 mt-0.5" />
                                                        <div>
                                                            <h4 className="text-sm font-bold text-[var(--text-primary)]">Identity Guard</h4>
                                                            <p className="text-xs text-[var(--text-secondary)] mt-1 leading-relaxed">
                                                                Anonymous events are automatically linked to users upon identification.
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        {isModuleEnabled('events') && (
                                            <section className="dashboard-card">
                                                <div className="p-6 border-b border-[var(--border-normal)] flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <BarChart3 size={18} className="text-[var(--text-secondary)]" />
                                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Live Stream</h3>
                                                    </div>
                                                </div>
                                                <EventTable events={events} />
                                            </section>
                                        )}
                                    </div>
                                )}

                                {activeTab === 'events' && isModuleEnabled('events') && (
                                    <div className="dashboard-card animate-in fade-in duration-300">
                                        <EventTable events={events} />
                                    </div>
                                )}

                                {activeTab === 'funnel' && isModuleEnabled('funnel') && (
                                    <div className="dashboard-card animate-in fade-in duration-300">
                                        <FunnelView data={funnel} />
                                    </div>
                                )}

                                {activeTab === 'segmentation' && isModuleEnabled('segmentation') && (
                                    <SegmentationView
                                        events={events}
                                        fetchSegmentation={fetchSegmentation}
                                        segmentation={segmentation}
                                    />
                                )}

                                {activeTab === 'retention' && (
                                    <RetentionView retention={retention} />
                                )}

                                {activeTab === 'cohorts' && (
                                    <CohortsView projectId={selectedProject?.id} />
                                )}

                                {activeTab === 'docs' && <DocsView />}


                                {(activeTab === 'logs') && (
                                    <div className="flex flex-col items-center justify-center py-32 border border-[var(--border-normal)] border-dashed rounded-3xl animate-in zoom-in-95 duration-500 bg-[var(--bg-secondary)]">
                                        <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6">
                                            <RotateCcw className="text-[var(--text-secondary)]" size={32} />
                                        </div>
                                        <h3 className="text-lg font-bold text-[var(--text-primary)]">System Logs</h3>
                                        <p className="text-sm text-[var(--text-secondary)] mt-2">Access restricted to platform administrators.</p>
                                    </div>
                                )}

                                {activeTab === 'settings' && (
                                    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
                                        <div className="dashboard-card p-8">
                                            <header className="mb-8">
                                                <div className="flex items-center space-x-3 mb-2">
                                                    <Settings className="text-[var(--accent-primary)]" size={24} />
                                                    <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Module Configuration</h2>
                                                </div>
                                                <p className="text-sm text-[var(--text-secondary)]">
                                                    Enable or disable analytics modules based on your product type ({selectedProject.product_type || 'custom'}).
                                                </p>
                                            </header>

                                            <div className="space-y-4">
                                                {[
                                                    { id: 'events', label: 'Real-time Events', desc: 'Live event stream and debugging' },
                                                    { id: 'funnel', label: 'Conversion Funnels', desc: 'Step-by-step conversion analysis' },
                                                    { id: 'retention', label: 'Retention Cohorts', desc: 'User engagement over time' },
                                                    { id: 'segmentation', label: 'Segmentation', desc: 'Breakdown by properties' },
                                                    { id: 'revenue', label: 'Revenue Analytics', desc: 'Purchase and LTV tracking' },
                                                    { id: 'engagement', label: 'Deep Engagement', desc: 'Session time and depth' },
                                                ].map((module) => {
                                                    const isEnabled = enabledModules.includes(module.id);
                                                    return (
                                                        <div key={module.id} className={`flex items-start p-4 rounded-xl border transition-all ${isEnabled ? 'bg-[var(--bg-tertiary)] border-[var(--border-hover)]' : 'bg-[var(--bg-primary)] border-[var(--border-normal)]'}`}>
                                                            <div className="flex-1">
                                                                <h4 className={`text-sm font-bold ${isEnabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>{module.label}</h4>
                                                                <p className="text-xs text-[var(--text-tertiary)] mt-1">{module.desc}</p>
                                                            </div>
                                                            <button
                                                                onClick={async () => {
                                                                    const newModules = isEnabled
                                                                        ? enabledModules.filter(m => m !== module.id)
                                                                        : [...enabledModules, module.id];

                                                                    // Optimistic update
                                                                    const updatedProject = { ...selectedProject, enabled_modules: newModules };
                                                                    setSelectedProject(updatedProject); // Update local state

                                                                    // Persist
                                                                    try {
                                                                        await axios.patch(`http://localhost:6543/v1/analytics/projects/${selectedProject.id}/config`, { enabled_modules: newModules });
                                                                    } catch (e) {
                                                                        console.error("Failed to save config", e);
                                                                    }
                                                                }}
                                                                className={`w-12 h-6 rounded-full transition-colors relative ${isEnabled ? 'bg-[var(--accent-primary)] shadow-md' : 'bg-[var(--border-normal)]'}`}
                                                            >
                                                                <div className={`absolute top-1 w-4 h-4 rounded-full transition-all ${isEnabled ? 'left-7 bg-[var(--accent-secondary)]' : 'left-1 bg-[var(--text-secondary)]'}`} />
                                                            </button>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
        </AppShell>
    );
};

export default Dashboard;

