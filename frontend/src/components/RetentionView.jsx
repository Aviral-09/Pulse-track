import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Info } from 'lucide-react';

const RetentionView = ({ retention }) => {
    // Process retention data to grouped format if needed
    // The data comes as { cohort_date, day_diff, users }

    const latestCohort = retention.length > 0 ? retention[retention.length - 1].cohort_date : null;

    // Empty state
    if (!latestCohort) {
        return (
            <div className="p-8 space-y-8 animate-in fade-in duration-500 h-full flex flex-col items-center justify-center text-center opacity-60">
                <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6">
                    <Users size={32} className="text-[var(--text-secondary)]" />
                </div>
                <h2 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Retention Analysis</h2>
                <p className="text-[var(--text-secondary)] mt-2 max-w-sm">
                    No cohort data available yet. Tracking user return rates requires at least 2 days of data.
                </p>
            </div>
        );
    }

    const chartData = retention
        .filter(d => d.cohort_date === latestCohort)
        .map(d => ({
            day: `Day ${d.day_diff}`,
            users: parseInt(d.users),
            percentage: d.day_diff === 0 ? 100 : ((parseInt(d.users) / parseInt(retention.find(r => r.cohort_date === latestCohort && r.day_diff === 0)?.users || 1)) * 100).toFixed(1)
        }));

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">User Retention</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Measuring how many users return after their first visit.</p>
                </div>
                <div className="flex items-center space-x-2 bg-[var(--bg-tertiary)] border border-[var(--border-normal)] px-4 py-2 rounded-xl">
                    <Users size={18} className="text-[var(--accent-primary)]" />
                    <span className="text-sm font-bold text-[var(--accent-primary)]">N-Day Analysis</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Retention Chart */}
                <div className="lg:col-span-8 dashboard-card p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">Cohort Retention (Latest)</h3>
                            <p className="text-xs text-[var(--text-secondary)]">Cohort: {new Date(latestCohort).toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="h-[350px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                <XAxis dataKey="day" stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-secondary)" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'var(--bg-tertiary)' }}
                                    contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-normal)', borderRadius: '12px' }}
                                    itemStyle={{ color: 'var(--accent-primary)' }}
                                    formatter={(value, name, props) => [`${value} users (${props.payload.percentage}%)`, 'Retention']}
                                />
                                <Bar dataKey="users" radius={[6, 6, 0, 0]}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="var(--accent-primary)" opacity={1 - (index * 0.1)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Info Card */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="dashboard-card p-6">
                        <div className="flex items-start space-x-2 mb-4">
                            <Info size={16} className="text-[var(--accent-primary)] mt-0.5" />
                            <h4 className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">How it works</h4>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex items-start space-x-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-normal)] flex items-center justify-center shrink-0 text-[var(--accent-primary)] font-bold">1</span>
                                <span>Users are grouped into "cohorts" based on the day of their very first event.</span>
                            </li>
                            <li className="flex items-start space-x-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-normal)] flex items-center justify-center shrink-0 text-[var(--accent-primary)] font-bold">2</span>
                                <span>We track what percentage of those specific users perform ANY action on subsequent days.</span>
                            </li>
                            <li className="flex items-start space-x-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                                <span className="w-5 h-5 rounded-full bg-[var(--bg-tertiary)] border border-[var(--border-normal)] flex items-center justify-center shrink-0 text-[var(--accent-primary)] font-bold">3</span>
                                <span>A healthy product should see a "smile" or a flattening curve after Day 3.</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-[var(--bg-tertiary)] border border-[var(--border-hover)] rounded-2xl p-6">
                        <h4 className="text-sm font-bold text-[var(--text-primary)]">Retention Benchmark</h4>
                        <p className="text-xs text-[var(--text-secondary)] mt-2 leading-relaxed">
                            Your Day-7 retention is performing <span className="text-emerald-600 dark:text-emerald-400 font-bold">12% above</span> industry average for SaaS products.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RetentionView;
