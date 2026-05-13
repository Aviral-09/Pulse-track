import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    RefreshCw,
    Calendar,
    ChevronDown,
    Database,
    Zap,
    Search,
    Bell,
    Settings,
    Users
} from 'lucide-react';

const Topbar = ({
    pageTitle,
    loading,
    onSync,
    projects,
    currentProject,
    onProjectChange,
    timeRange,
    onTimeRangeChange,
    selectedCohort,
    onCohortChange
}) => {
    const [usage, setUsage] = useState(null);
    const [cohorts, setCohorts] = useState([]);

    useEffect(() => {
        if (currentProject?.id) {
            axios.get(`http://localhost:6543/v1/analytics/usage?project_id=${currentProject.id}`)
                .then(res => setUsage(res.data))
                .catch(err => console.error('Usage fetch failed', err));

            // Fetch cohorts for the selector
            axios.get(`http://localhost:6543/v1/cohorts?project_id=${currentProject.id}`)
                .then(res => setCohorts(res.data))
                .catch(err => console.error('Cohorts fetch failed', err));
        } else {
            setCohorts([]);
        }
    }, [currentProject]);

    const usagePercent = usage ? Math.min(Math.round((usage.current_month_events / usage.usage_limit_events) * 100), 100) : 0;

    return (
        <header className="Topbar_topbar">
            <div className="flex items-center space-x-8">
                <div className="flex items-center space-x-4">
                    <h1 className="text-xl font-medium tracking-wide text-[var(--text-primary)]">{pageTitle}</h1>
                </div>

                {/* Project Selector */}
                <div className="flex items-center space-x-3 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl px-3 py-1.5 focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition-all">
                    <Database size={14} className="text-[var(--text-secondary)]" />
                    <div className="relative flex items-center">
                        <select
                            className="appearance-none bg-transparent text-[11px] font-bold outline-none cursor-pointer pr-6 text-[var(--text-primary)]"
                            value={currentProject?.id || ''}
                            onChange={(e) => onProjectChange(projects.find(p => p.id === e.target.value))}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id} className="bg-[var(--bg-primary)]">{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-0 text-[var(--text-secondary)] pointer-events-none" />
                    </div>
                </div>

                {/* Usage Monitor */}
                {usage && (
                    <div className="hidden lg:flex items-center space-x-4 px-4 border-l border-[var(--border-normal)]">
                        <div className="flex flex-col w-32">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[9px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Inbound Capacity</span>
                                <span className="text-[9px] font-bold text-[var(--accent-primary)]">
                                    {usagePercent}%
                                </span>
                            </div>
                            <div className="w-full h-1 bg-[var(--border-light)] rounded-full overflow-hidden">
                                <div
                                    className="h-full transition-all duration-1000 bg-[var(--accent-primary)]"
                                    style={{ width: `${usagePercent}%` }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-6">
                {/* Search */}
                <div className="hidden md:flex items-center bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl px-3 py-1.5 text-[var(--text-secondary)] focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition-all cursor-text">
                    <Search size={14} />
                    <span className="text-[10px] font-bold ml-2 uppercase tracking-widest">Search telemetry...</span>
                </div>

                {/* Cohort Selector */}
                <div className="flex items-center space-x-3 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl px-3 py-1.5 focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition-all">
                    <Users size={14} className="text-[var(--text-secondary)]" />
                    <div className="relative flex items-center">
                        <select
                            value={selectedCohort || ''}
                            onChange={(e) => onCohortChange(e.target.value)}
                            className="appearance-none bg-transparent text-[11px] font-bold outline-none cursor-pointer pr-6 max-w-[150px] truncate text-[var(--text-primary)]"
                        >
                            <option value="" className="bg-[var(--bg-primary)]">All Users (No Cohort)</option>
                            {cohorts.map(c => (
                                <option key={c.id} value={c.id} className="bg-[var(--bg-primary)]">{c.name}</option>
                            ))}
                        </select>
                        <ChevronDown size={12} className="absolute right-0 text-[var(--text-secondary)] pointer-events-none" />
                    </div>
                </div>

                {/* Time Range */}
                <div className="flex items-center space-x-3 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl px-3 py-1.5 focus-within:border-[var(--accent-primary)] focus-within:ring-1 focus-within:ring-[var(--accent-primary)] transition-all">
                    <Calendar size={14} className="text-[var(--text-secondary)]" />
                    <div className="relative flex items-center">
                        <select
                            value={timeRange}
                            onChange={(e) => onTimeRangeChange(e.target.value)}
                            className="appearance-none bg-transparent text-[11px] font-bold outline-none cursor-pointer pr-6 text-[var(--text-primary)]"
                        >
                            <option value="24h" className="bg-[var(--bg-primary)]">Last 24h</option>
                            <option value="7d" className="bg-[var(--bg-primary)]">Last 7 days</option>
                            <option value="30d" className="bg-[var(--bg-primary)]">Last 30 days</option>
                        </select>
                        <ChevronDown size={12} className="absolute right-0 text-[var(--text-secondary)] pointer-events-none" />
                    </div>
                </div>

                {/* Global Actions */}
                <div className="flex items-center space-x-2 border-l border-[var(--border-normal)] pl-6">
                    <button
                        onClick={onSync}
                        className={`p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-normal)] hover:border-[var(--border-hover)] transition-all text-[var(--text-primary)] ${loading ? 'animate-spin' : ''}`}
                    >
                        <RefreshCw size={14} />
                    </button>
                    <button className="p-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-normal)] hover:border-[var(--border-hover)] transition-all relative text-[var(--text-primary)]">
                        <Bell size={14} />
                        <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
