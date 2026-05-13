import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, subtitle }) => {
    const isPositive = change && !change.startsWith('-');

    return (
        <div className="dashboard-card p-6 flex flex-col justify-between h-full group">
            <div className="flex items-center justify-between mb-4">
                <div className="bg-[var(--bg-tertiary)] p-2.5 rounded-xl border border-[var(--border-normal)] group-hover:border-[var(--border-hover)] transition-colors">
                    <Icon size={18} className="text-[var(--text-primary)]" />
                </div>
                {change && (
                    <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${isPositive ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
                        }`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>{change}</span>
                    </div>
                )}
            </div>

            <div>
                <h3 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-widest mb-1.5">{title}</h3>
                <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                        {value != null ? value.toLocaleString() : '0'}
                    </span>
                    {subtitle && (
                        <span className="text-[10px] text-[var(--text-tertiary)] font-medium tracking-tight uppercase">{subtitle}</span>
                    )}
                </div>
            </div>

            {/* Subtle bottom indicator */}
            <div className="mt-5 h-1 w-full bg-[var(--border-light)] rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${isPositive ? 'bg-[var(--accent-primary)] shadow-sm' : 'bg-[var(--border-hover)]'}`}
                    style={{ width: `${Math.max(10, Math.min(100, (value / 500) * 100))}%` }} // Purely illustrative
                />
            </div>
        </div>
    );
};

export default StatCard;
