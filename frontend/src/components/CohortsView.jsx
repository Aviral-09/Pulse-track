import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, Plus, Trash2, Search, Filter, AlertCircle, Save, Check, X } from 'lucide-react';

const CohortsView = ({ projectId }) => {
    const [cohorts, setCohorts] = useState([]);
    const [eventOptions, setEventOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // Initial Rule Template
    const createEmptyRule = () => ({
        type: 'event_occurrence',
        event: '',
        condition: 'occurred',
        operator: '>=',
        count: 1,
        time_window: { type: 'relative', value: '30d' },
        properties: []
    });

    // New Cohort State
    const [newCohort, setNewCohort] = useState({
        name: '',
        description: '',
        definition: {
            logic: 'AND',
            rules: [createEmptyRule()]
        }
    });

    const [previewCount, setPreviewCount] = useState(null);
    const [saving, setSaving] = useState(false);

    const fetchCohorts = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:6543/v1/cohorts?project_id=${projectId}`);
            setCohorts(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEvents = async () => {
        if (!projectId) return;
        try {
            const res = await axios.get(`http://localhost:6543/v1/analytics/events?project_id=${projectId}`);
            setEventOptions(res.data.map(e => e.event_name));
        } catch (err) {
            console.error("Failed to load events", err);
        }
    };

    useEffect(() => {
        fetchCohorts();
        fetchEvents();
    }, [projectId]);

    const handlePreview = async () => {
        try {
            const res = await axios.post('http://localhost:6543/v1/cohorts/preview', {
                project_id: projectId,
                definition: newCohort.definition
            });
            setPreviewCount(res.data.count);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSave = async () => {
        if (!newCohort.name || newCohort.definition.rules.some(r => !r.event)) return;
        setSaving(true);
        try {
            await axios.post('http://localhost:6543/v1/cohorts', {
                project_id: projectId,
                ...newCohort
            });
            setIsCreating(false);
            setNewCohort({
                name: '',
                description: '',
                definition: { logic: 'AND', rules: [createEmptyRule()] }
            });
            setPreviewCount(null);
            fetchCohorts();
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this cohort?')) return;
        try {
            await axios.delete(`http://localhost:6543/v1/cohorts/${id}`);
            fetchCohorts();
        } catch (err) {
            console.error(err);
        }
    };

    // Rule Management
    const addRule = () => {
        setNewCohort({
            ...newCohort,
            definition: {
                ...newCohort.definition,
                rules: [...newCohort.definition.rules, createEmptyRule()]
            }
        });
    };

    const updateRule = (index, field, value) => {
        const newRules = [...newCohort.definition.rules];
        newRules[index][field] = value;
        setNewCohort({ ...newCohort, definition: { ...newCohort.definition, rules: newRules } });
    };

    const removeRule = (index) => {
        if (newCohort.definition.rules.length <= 1) return;
        const newRules = newCohort.definition.rules.filter((_, i) => i !== index);
        setNewCohort({ ...newCohort, definition: { ...newCohort.definition, rules: newRules } });
    };

    // Property Management per Rule
    const addProperty = (ruleIdx) => {
        const newRules = [...newCohort.definition.rules];
        newRules[ruleIdx].properties = [...(newRules[ruleIdx].properties || []), { key: '', operator: 'equals', value: '' }];
        setNewCohort({ ...newCohort, definition: { ...newCohort.definition, rules: newRules } });
    };

    const updateProperty = (ruleIdx, propIdx, field, value) => {
        const newRules = [...newCohort.definition.rules];
        newRules[ruleIdx].properties[propIdx][field] = value;
        setNewCohort({ ...newCohort, definition: { ...newCohort.definition, rules: newRules } });
    };

    const removeProperty = (ruleIdx, propIdx) => {
        const newRules = [...newCohort.definition.rules];
        newRules[ruleIdx].properties = newRules[ruleIdx].properties.filter((_, i) => i !== propIdx);
        setNewCohort({ ...newCohort, definition: { ...newCohort.definition, rules: newRules } });
    };

    if (loading && !isCreating && cohorts.length === 0) {
        return <div className="p-8 text-[var(--text-secondary)] animate-pulse">Loading cohorts...</div>;
    }

    return (
        <div className="p-8 space-y-8 animate-in fade-in duration-500">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Cohorts</h2>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">Define and track groups of users based on behavior.</p>
                </div>
                {!isCreating && (
                    <button
                        onClick={() => setIsCreating(true)}
                        className="bg-[var(--accent-primary)] hover:opacity-90 text-[color:var(--text-inverted)] px-4 py-2 rounded-xl flex items-center space-x-2 font-bold text-sm transition-all shadow-md"
                    >
                        <Plus size={16} />
                        <span>Create Cohort</span>
                    </button>
                )}
            </header>

            {isCreating ? (
                <div className="dashboard-card p-8 max-w-4xl mx-auto">
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                        <Users className="text-[var(--accent-primary)]" size={20} />
                        Cohort Definition
                    </h3>

                    <div className="space-y-8">
                        {/* Meta */}
                        <div className="grid grid-cols-2 gap-6 pb-8 border-b border-[var(--border-normal)]">
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Cohort Name</label>
                                <input
                                    type="text"
                                    value={newCohort.name}
                                    onChange={e => setNewCohort({ ...newCohort, name: e.target.value })}
                                    placeholder="e.g. Power Users"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-normal)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)] font-bold"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest block mb-2">Description</label>
                                <input
                                    type="text"
                                    value={newCohort.description}
                                    onChange={e => setNewCohort({ ...newCohort, description: e.target.value })}
                                    placeholder="Optional description"
                                    className="w-full bg-[var(--bg-primary)] border border-[var(--border-normal)] rounded-xl px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                                />
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest">Inclusion Rules</label>
                                <div className="flex items-center space-x-2">
                                    <span className="text-[10px] text-[var(--text-tertiary)] font-black uppercase">Logic:</span>
                                    <select
                                        value={newCohort.definition.logic}
                                        onChange={e => setNewCohort({ ...newCohort, definition: { ...newCohort.definition, logic: e.target.value } })}
                                        className="bg-[var(--bg-tertiary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-2 py-1 text-[10px] font-bold focus:outline-none"
                                    >
                                        <option value="AND">AND</option>
                                        <option value="OR">OR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {newCohort.definition.rules.map((rule, idx) => (
                                    <div key={idx} className="relative bg-[var(--bg-tertiary)] p-6 rounded-2xl border border-[var(--border-normal)] animate-in slide-in-from-bottom-2 duration-300">
                                        {newCohort.definition.rules.length > 1 && (
                                            <button
                                                onClick={() => removeRule(idx)}
                                                className="absolute top-4 right-4 text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors"
                                            >
                                                <X size={16} />
                                            </button>
                                        )}

                                        <div className="space-y-6">
                                            {/* Top Line: User Type + Event */}
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="text-sm font-bold text-[var(--text-secondary)]">Users who</span>
                                                <select
                                                    value={rule.condition}
                                                    onChange={e => updateRule(idx, 'condition', e.target.value)}
                                                    className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all"
                                                >
                                                    <option value="occurred">DID perform</option>
                                                    <option value="not_occurred">DID NOT perform</option>
                                                </select>
                                                <select
                                                    value={rule.event}
                                                    onChange={e => updateRule(idx, 'event', e.target.value)}
                                                    className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all min-w-[220px]"
                                                >
                                                    <option value="">Select Event...</option>
                                                    {eventOptions.map(e => <option key={e} value={e}>{e}</option>)}
                                                </select>
                                            </div>

                                            {/* Rule Specifics: Frequency & Time */}
                                            <div className="flex flex-wrap items-center gap-6 pt-4 border-t border-[var(--border-light)]">
                                                {/* Frequency */}
                                                {rule.condition === 'occurred' && (
                                                    <div className="flex items-center space-x-3">
                                                        <select
                                                            value={rule.type}
                                                            onChange={e => updateRule(idx, 'type', e.target.value)}
                                                            className="bg-transparent text-xs font-bold text-[var(--accent-primary)] uppercase tracking-widest outline-none cursor-pointer"
                                                        >
                                                            <option value="event_occurrence">Occurrence</option>
                                                            <option value="event_frequency">Frequency</option>
                                                        </select>
                                                        {rule.type === 'event_frequency' && (
                                                            <div className="flex items-center gap-2 animate-in fade-in zoom-in-95">
                                                                <select
                                                                    value={rule.operator}
                                                                    onChange={e => updateRule(idx, 'operator', e.target.value)}
                                                                    className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                                                                >
                                                                    <option value=">=">≥</option>
                                                                    <option value="=">=</option>
                                                                    <option value="<=">≤</option>
                                                                </select>
                                                                <input
                                                                    type="number"
                                                                    min="1"
                                                                    value={rule.count}
                                                                    onChange={e => updateRule(idx, 'count', parseInt(e.target.value))}
                                                                    className="w-16 bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-2 py-1.5 text-xs focus:outline-none text-center"
                                                                />
                                                                <span className="text-[10px] font-black text-[var(--text-tertiary)] uppercase">Times</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Time Window */}
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-widest italic">Within the</span>
                                                    <select
                                                        value={rule.time_window?.value || rule.time_window || '30d'}
                                                        onChange={e => updateRule(idx, 'time_window', { type: 'relative', value: e.target.value })}
                                                        className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs font-bold focus:outline-none"
                                                    >
                                                        <option value="24h">Last 24 Hours</option>
                                                        <option value="7d">Last 7 Days</option>
                                                        <option value="30d">Last 30 Days</option>
                                                        <option value="90d">Last 90 Days</option>
                                                        <option value="all">All Time</option>
                                                    </select>
                                                </div>
                                            </div>

                                            {/* Nested Properties */}
                                            <div className="pt-4 border-t border-[var(--border-light)] space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-[0.2em]">Refined by Properties</span>
                                                    <button
                                                        onClick={() => addProperty(idx)}
                                                        className="text-[10px] font-black text-[var(--accent-primary)] hover:underline px-2 py-1 rounded transition-colors uppercase"
                                                    >
                                                        + Add Filter
                                                    </button>
                                                </div>

                                                <div className="space-y-2">
                                                    {rule.properties?.length === 0 && (
                                                        <p className="text-[10px] text-[var(--text-tertiary)] italic font-medium">No active property constraints</p>
                                                    )}
                                                    {rule.properties?.map((prop, pIdx) => (
                                                        <div key={pIdx} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)] opacity-40" />
                                                            <input
                                                                type="text"
                                                                placeholder="Key"
                                                                value={prop.key}
                                                                onChange={e => updateProperty(idx, pIdx, 'key', e.target.value)}
                                                                className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs focus:outline-none flex-1 placeholder:text-[var(--text-tertiary)]"
                                                            />
                                                            <select
                                                                value={prop.operator}
                                                                onChange={e => updateProperty(idx, pIdx, 'operator', e.target.value)}
                                                                className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-2 py-1.5 text-xs focus:outline-none"
                                                            >
                                                                <option value="equals">equals</option>
                                                                <option value="not equals">not equals</option>
                                                                <option value="contains">contains</option>
                                                                <option value="greater than">greater than</option>
                                                                <option value="less than">less than</option>
                                                            </select>
                                                            <input
                                                                type="text"
                                                                placeholder="Value"
                                                                value={prop.value}
                                                                onChange={e => updateProperty(idx, pIdx, 'value', e.target.value)}
                                                                className="bg-[var(--bg-primary)] border border-[var(--border-normal)] text-[var(--text-primary)] rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all flex-1 placeholder:text-[var(--text-tertiary)]"
                                                            />
                                                            <button onClick={() => removeProperty(idx, pIdx)} className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] p-2">
                                                                <X size={14} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={addRule}
                                    className="w-full py-4 border-2 border-dashed border-[var(--border-light)] rounded-2xl text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all text-sm font-bold flex items-center justify-center space-x-2"
                                >
                                    <Plus size={16} />
                                    <span>Add Requirement</span>
                                </button>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-8 border-t border-[var(--border-normal)]">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={handlePreview}
                                    className="text-[var(--text-secondary)] hover:text-[var(--accent-primary)] text-xs font-bold flex items-center space-x-2 transition-colors uppercase tracking-widest"
                                >
                                    <Users size={16} />
                                    <span>Estimate Reach</span>
                                </button>
                                {previewCount !== null && (
                                    <span className="text-[var(--accent-primary)] text-xs font-black bg-[var(--bg-tertiary)] border border-[var(--border-hover)] px-4 py-1.5 rounded-full animate-in zoom-in">
                                        {previewCount.toLocaleString()} Users Identified
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setIsCreating(false)}
                                    className="px-6 py-2.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-bold transition-colors uppercase"
                                >
                                    Discard
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={saving || !newCohort.name || newCohort.definition.rules.some(r => !r.event)}
                                    className="bg-[var(--accent-primary)] text-[color:var(--text-inverted)] px-8 py-2.5 rounded-xl font-black text-xs uppercase hover:opacity-90 transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:border disabled:border-[var(--border-normal)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed shadow-sm"
                                >
                                    {saving ? 'Processing...' : 'Deploy Cohort'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cohorts.length === 0 ? (
                        <div className="col-span-full py-20 text-center opacity-40">
                            <Filter className="w-16 h-16 text-[var(--text-tertiary)] mx-auto mb-4" />
                            <h3 className="text-lg font-bold text-[var(--text-primary)]">No active cohorts</h3>
                            <p className="text-[var(--text-secondary)] text-xs mt-2 uppercase tracking-widest font-bold">Start tracking specific segments</p>
                        </div>
                    ) : (
                        cohorts.map(cohort => (
                            <div key={cohort.id} className="bg-[var(--bg-primary)] border border-[var(--border-normal)] hover:border-[var(--border-hover)] hover:bg-[var(--bg-tertiary)] transition-all rounded-2xl p-6 group relative h-full flex flex-col">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="p-3 bg-[var(--bg-tertiary)] rounded-xl border border-[var(--border-normal)] group-hover:border-[var(--border-hover)]">
                                        <Users className="text-[var(--text-primary)]" size={20} />
                                    </div>
                                    <button
                                        onClick={() => handleDelete(cohort.id)}
                                        className="text-[var(--text-tertiary)] hover:text-rose-600 dark:hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2 italic tracking-tight uppercase">{cohort.name}</h3>
                                    <p className="text-[10px] font-medium text-[var(--text-secondary)] line-clamp-2 h-7 mb-4 uppercase tracking-tighter">{cohort.description || 'No description provided'}</p>
                                </div>

                                <div className="mt-auto pt-4 border-t border-[var(--border-light)]">
                                    <div className="flex items-center justify-between text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest mb-3">
                                        <span>Logic Pipeline</span>
                                        <span className="text-[var(--accent-primary)] opacity-80">Stable</span>
                                    </div>
                                    <div className="space-y-2">
                                        {(cohort.definition.rules || [cohort.definition]).slice(0, 2).map((rule, ri) => (
                                            <div key={ri} className="flex items-center space-x-2 group/tag">
                                                <div className="w-1 h-1 rounded-full bg-[var(--accent-primary)] opacity-50" />
                                                <code className="text-[9px] text-[var(--text-secondary)] font-mono bg-[var(--bg-primary)] px-2 py-0.5 rounded border border-[var(--border-normal)] truncate flex-1">
                                                    {rule.event || rule.event_name}
                                                </code>
                                            </div>
                                        ))}
                                        {(cohort.definition.rules?.length > 2) && (
                                            <p className="text-[9px] text-[var(--text-tertiary)] font-bold uppercase pl-3">+ {cohort.definition.rules.length - 2} more requirements</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CohortsView;
