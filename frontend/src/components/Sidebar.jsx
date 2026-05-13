import React from 'react';
import {
    LayoutDashboard,
    Zap,
    BarChart3,
    LineChart as LineChartIcon,
    Users,
    History,
    Settings,
    ChevronLeft,
    BookOpen
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab, enabledModules = [] }) => {
    const allNavItems = [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard, requiredModule: null },
        { id: 'events', label: 'Real-time Events', icon: Zap, requiredModule: 'events' },
        { id: 'funnel', label: 'Funnel', icon: BarChart3, requiredModule: 'funnel' },
        { id: 'segmentation', label: 'Segmentation', icon: LineChartIcon, requiredModule: 'segmentation' },
        { id: 'retention', label: 'Retention', icon: Users, requiredModule: 'retention' },
        { id: 'cohorts', label: 'Cohorts', icon: Users, requiredModule: 'custom' },
        { id: 'docs', label: 'Docs', icon: BookOpen, requiredModule: null },
        { id: 'logs', label: 'Audit Logs', icon: History, requiredModule: null },
        { id: 'settings', label: 'System Config', icon: Settings, requiredModule: null },
    ];

    const navItems = allNavItems.filter(item =>
        !item.requiredModule || enabledModules.includes(item.requiredModule)
    );

    return (
        <nav className="Sidebar_sidebar">
            <div className="h-[72px] flex items-center px-6 border-b border-[var(--border-normal)]">
                <button className="flex items-center space-x-3 text-[var(--text-primary)] hover:text-[var(--text-secondary)] transition-colors">
                    <ChevronLeft size={20} strokeWidth={1.5} />
                    <span className="text-lg font-bold tracking-tight uppercase italic">Pulse-Track</span>
                </button>
            </div>

            <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
                <div className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest px-2 mb-4">
                    Analytics Suite
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${isActive
                                ? 'bg-[var(--bg-primary)] text-[var(--text-primary)] font-semibold border border-[var(--border-normal)] shadow-sm'
                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)] hover:text-[var(--text-primary)] border border-transparent'
                                }`}
                        >
                            <Icon size={18} className={`mr-3 ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)]'}`} />
                            <span className="text-sm">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            <div className="p-4 border-t border-[var(--border-normal)] mt-auto">
                <div className="flex items-center space-x-3 p-2 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-primary)] text-[var(--accent-secondary)] flex items-center justify-center text-xs font-bold">
                        AV
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">Senior Analyst</p>
                        <p className="text-xs text-[var(--text-secondary)] truncate">V1.0.4-stable</p>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Sidebar;
