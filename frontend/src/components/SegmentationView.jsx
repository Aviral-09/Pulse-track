import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, TrendingUp } from 'lucide-react';

const SegmentationView = ({ events, fetchSegmentation, segmentation }) => {
    const [selectedEvent, setSelectedEvent] = useState('');
    const [prop, setProp] = useState('');
    const [val, setVal] = useState('');

    useEffect(() => {
        if (selectedEvent) {
            fetchSegmentation(selectedEvent, prop, val);
        }
    }, [selectedEvent, prop, val, fetchSegmentation]);

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            {/* Controls */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Target Event</label>
                    <select
                        value={selectedEvent}
                        onChange={(e) => setSelectedEvent(e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-normal)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--border-hover)]"
                    >
                        <option value="">Select an event...</option>
                        {events.map(e => <option key={e.event_name} value={e.event_name}>{e.event_name}</option>)}
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Filter Property</label>
                    <input
                        type="text"
                        placeholder="e.g. plan_type"
                        value={prop}
                        onChange={(e) => setProp(e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-normal)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Property Value</label>
                    <input
                        type="text"
                        placeholder="e.g. premium"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                        className="w-full bg-[var(--bg-primary)] border border-[var(--border-normal)] rounded-xl px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                    />
                </div>
            </div>

            {/* Analysis Area */}
            <div className="dashboard-card p-8 min-h-[400px]">
                {!selectedEvent ? (
                    <div className="h-[400px] flex flex-col items-center justify-center text-[var(--text-secondary)] space-y-4">
                        <TrendingUp size={48} className="opacity-20" />
                        <p className="text-sm font-medium">Select an event to start segmenting your users</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-bold text-[var(--text-primary)]">Event Trends</h3>
                                <p className="text-xs text-[var(--text-secondary)]">Hourly aggregation for {selectedEvent}</p>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="text-right">
                                    <p className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Grand Total</p>
                                    <p className="text-lg font-bold text-[var(--accent-primary)]">
                                        {segmentation.data?.reduce((sum, d) => sum + parseInt(d.count), 0).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={segmentation.data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" vertical={false} />
                                    <XAxis
                                        dataKey="time"
                                        stroke="var(--text-secondary)"
                                        fontSize={10}
                                        tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    />
                                    <YAxis stroke="var(--text-secondary)" fontSize={10} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-normal)', borderRadius: '12px' }}
                                        labelStyle={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="count"
                                        name="Total Events"
                                        stroke="var(--accent-primary)"
                                        strokeWidth={3}
                                        dot={false}
                                        activeDot={{ r: 6, stroke: 'var(--bg-primary)', strokeWidth: 2, fill: 'var(--accent-primary)' }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="unique_users"
                                        name="Unique Users"
                                        stroke="var(--text-secondary)"
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SegmentationView;
