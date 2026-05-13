import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { BarChart3 } from 'lucide-react';

const FunnelView = ({ data }) => {
    const chartData = data.map(item => ({
        name: item.step.replace('_', ' ').toUpperCase(),
        users: item.users,
        conversion: item.conversion_rate
    }));

    const COLORS = ['var(--accent-primary)', 'var(--text-secondary)', 'var(--border-hover)', 'var(--border-normal)'];

    const hasData = data && data.length > 0 && data[0].users > 0;

    if (!hasData) {
        return (
            <div className="flex flex-col h-full">
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center opacity-60">
                    <div className="w-12 h-12 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="text-[var(--text-secondary)]" size={24} />
                    </div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">No events detected</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 max-w-[200px]">Waiting for step events to populate the pipeline.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="p-8">
                <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 40, right: 40 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border-light)" />
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em' }}
                                width={120}
                            />
                            <Tooltip
                                cursor={{ fill: 'var(--bg-tertiary)' }}
                                content={({ active, payload }) => {
                                    if (active && payload && payload.length) {
                                        return (
                                            <div className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] p-3 rounded-lg shadow-lg">
                                                <p className="text-xs font-bold text-[var(--text-secondary)] mb-2">{payload[0].payload.name}</p>
                                                <div className="space-y-1">
                                                    <div className="flex items-center justify-between space-x-8">
                                                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Users</span>
                                                        <span className="text-sm font-bold font-mono">{payload[0].value}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between space-x-8">
                                                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase">Conversion</span>
                                                        <span className="text-sm font-bold font-mono text-[var(--text-primary)]">{payload[0].payload.conversion}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                    return null;
                                }}
                            />
                            <Bar dataKey="users" radius={[0, 4, 4, 0]} barSize={32}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                                ))}
                                <LabelList
                                    dataKey="conversion"
                                    position="right"
                                    content={({ x, y, width, value }) => (
                                        <text x={x + width + 10} y={y + 20} fill="var(--text-primary)" fontSize={10} fontWeight="bold">
                                            {value}%
                                        </text>
                                    )}
                                />
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {data.map((step, i) => (
                        <div key={i} className="bg-[var(--bg-tertiary)] border border-[var(--border-normal)] hover:border-[var(--border-hover)] hover:shadow-md transition-all rounded-xl p-4 text-center">
                            <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-widest mb-1">{step.step}</p>
                            <p className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">{step.users}</p>
                            {i > 0 && (
                                <div className="mt-2 flex items-center justify-center space-x-1">
                                    <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
                                    <p className="text-[10px] font-bold text-[var(--accent-primary)] uppercase">
                                        {step.conversion_rate}% Conv.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FunnelView;
