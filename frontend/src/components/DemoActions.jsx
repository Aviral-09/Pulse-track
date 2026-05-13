import React from 'react';
import { analytics } from '../sdk/analytics';
import { Play, ShoppingCart, CheckCircle, Eye, UserPlus, RotateCcw } from 'lucide-react';

const DemoActions = ({ onTrack }) => {
    const triggerEvent = async (name, props = {}) => {
        await analytics.track(name, props);
        if (onTrack) onTrack();
    };

    const handleIdentify = async () => {
        const dummyUserId = crypto.randomUUID();
        await analytics.identify(dummyUserId);
        if (onTrack) onTrack();
    };

    const handleReset = () => {
        analytics.reset();
        window.location.reload();
    };

    const actions = [
        { name: 'page_view', label: 'View Page', icon: Eye, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-tertiary)]' },
        { name: 'add_to_cart', label: 'Add to Cart', icon: ShoppingCart, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-tertiary)]' },
        { name: 'purchase_completed', label: 'Purchase', icon: CheckCircle, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-tertiary)]' },
        { name: 'identify', label: 'Simulate Login', icon: UserPlus, color: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-tertiary)]', cmd: handleIdentify },
        { name: 'reset', label: 'Reset ID', icon: RotateCcw, color: 'text-[var(--text-secondary)]', bg: 'bg-[var(--bg-secondary)]', cmd: handleReset },
    ];

    return (
        <div className="grid grid-cols-2 gap-3">
            {actions.map((action) => {
                const Icon = action.icon;
                return (
                    <button
                        key={action.name}
                        onClick={action.cmd ? action.cmd : () => triggerEvent(action.name, { source: 'simulator' })}
                        className="flex flex-col items-center justify-center p-3 rounded-xl border border-[var(--border-normal)] bg-[var(--bg-secondary)] hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-hover)] transition-all group active:scale-95"
                    >
                        <div className={`p-2 rounded-lg ${action.bg} mb-2 transition-transform group-hover:scale-110`}>
                            <Icon size={16} className={action.color} />
                        </div>
                        <span className="text-[10px] font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] uppercase tracking-wider text-center line-clamp-1">
                            {action.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

export default DemoActions;
