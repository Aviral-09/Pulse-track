import React from 'react';
import { Clock, Hash, Tag } from 'lucide-react';

const EventTable = ({ events }) => (
    <div className="w-full">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                <thead className="bg-[var(--bg-tertiary)] border-b border-[var(--border-normal)]">
                    <tr>
                        <th className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                <Tag size={12} />
                                <span>Event Identity</span>
                            </div>
                        </th>
                        <th className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                <Hash size={12} />
                                <span>Occurrence Count</span>
                            </div>
                        </th>
                        <th className="px-6 py-4">
                            <div className="flex items-center space-x-2 text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">
                                <Clock size={12} />
                                <span>Last Activity Scan</span>
                            </div>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-normal)]">
                    {events.length > 0 ? (
                        events.map((event) => (
                            <tr key={event.event_name} className="group hover:bg-[var(--bg-tertiary)] transition-all duration-150">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] opacity-0 group-hover:opacity-100 transition-opacity shadow-sm" />
                                        <span className="text-sm font-bold text-[var(--accent-primary)] font-mono tracking-tight bg-[var(--bg-primary)] border border-[var(--border-hover)] px-2 py-1 rounded">
                                            {event.event_name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-sm font-semibold text-[var(--text-primary)] tabular-nums">
                                        {event.count.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-xs text-[var(--text-secondary)] font-medium tracking-tight">
                                        {new Date(event.last_seen).toLocaleString()}
                                    </span>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="px-6 py-20 text-center">
                                <div className="flex flex-col items-center">
                                    <Hash size={32} className="text-[var(--text-tertiary)] mb-4" />
                                    <p className="text-sm font-semibold text-[var(--text-secondary)] uppercase tracking-widest">
                                        No telemetry recorded in this slice
                                    </p>
                                </div>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
);

export default EventTable;
