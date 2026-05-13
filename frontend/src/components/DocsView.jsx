import React, { useState } from 'react';
import {
    Book,
    BookOpen,
    Code,
    Shield,
    Activity,
    Link,
    AlertTriangle,
    CheckCircle2,
    Info,
    Terminal,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const DocsView = () => {
    const [activeSection, setActiveSection] = useState('overview');

    const sections = [
        { id: 'overview', title: 'Product Overview', icon: Book },
        { id: 'concepts', title: 'Core Concepts', icon: Info },
        { id: 'quickstart', title: 'Quick Start', icon: Terminal },
        { id: 'events', title: 'Event Design Guide', icon: Activity },
        { id: 'identity', title: 'Identity Handling', icon: Link },
        { id: 'analytics', title: 'Analytics Explained', icon: BookOpen },
        { id: 'mistakes', title: 'Common Mistakes', icon: AlertTriangle },
    ];

    return (
        <div className="flex h-full animate-in fade-in duration-500">
            {/* Nav */}
            <aside className="w-64 border-r border-[var(--border-light)] p-6 space-y-2 overflow-y-auto">
                <header className="mb-8">
                    <h3 className="text-[10px] font-black text-[var(--text-tertiary)] uppercase tracking-[0.3em]">Documentation</h3>
                </header>
                {sections.map(s => {
                    const Icon = s.icon;
                    return (
                        <button
                            key={s.id}
                            onClick={() => setActiveSection(s.id)}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === s.id ? 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] border border-[var(--border-hover)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)] border border-transparent'}`}
                        >
                            <Icon size={16} />
                            <span className="text-xs font-bold">{s.title}</span>
                        </button>
                    );
                })}
            </aside>

            {/* Content */}
            <main className="flex-1 overflow-y-auto p-12 custom-scrollbar">
                <div className="max-w-3xl space-y-12">
                    {activeSection === 'overview' && (
                        <article className="prose prose-invert prose-neutral">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Pulse-Track Overview</h1>
                            <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
                                Pulse-Track is a high-performance, real-time analytics engine designed for technical teams who need total visibility into product telemetry without the bloat of traditional SaaS suites.
                            </p>
                            <div className="grid grid-cols-2 gap-8 mt-12">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center space-x-2">
                                        <CheckCircle2 size={16} className="text-[var(--accent-primary)]" />
                                        <span>What it solves</span>
                                    </h3>
                                    <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-4">
                                        <li>High-latency ingestion in legacy systems.</li>
                                        <li>Opaque data ownership and expensive seat costs.</li>
                                        <li>Broken identity mapping across anonymous sessions.</li>
                                    </ul>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center space-x-2">
                                        <AlertTriangle size={16} className="text-[var(--text-tertiary)]" />
                                        <span>What it is NOT</span>
                                    </h3>
                                    <ul className="text-xs text-[var(--text-secondary)] space-y-2 list-disc pl-4">
                                        <li>A marketing automation tool for email blasting.</li>
                                        <li>A data warehouse for long-term cold storage.</li>
                                        <li>A drag-and-drop website builder.</li>
                                    </ul>
                                </div>
                            </div>
                        </article>
                    )}

                    {activeSection === 'concepts' && (
                        <article className="space-y-8">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Core Concepts</h1>
                            <div className="space-y-6">
                                {[
                                    { title: 'Project', body: 'The top-level isolation unit. Data never leaks between projects. Each project has a unique Public Key.' },
                                    { title: 'Event', body: 'A discrete action taken by a user. Immutable, timestamped, and structured in snake_case.' },
                                    { title: 'Identity Stitching', body: 'The process of merging anonymous history with known user profiles after they log in or sign up.' }
                                ].map((c, i) => (
                                    <div key={i} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl">
                                        <h4 className="text-[var(--text-primary)] font-bold mb-2">{c.title}</h4>
                                        <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{c.body}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    )}

                    {activeSection === 'quickstart' && (
                        <article className="space-y-8">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Quick Start</h1>
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">1. Installation</h3>
                                    <pre className="bg-[var(--bg-primary)] p-6 rounded-2xl text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-normal)]">
                                        npm install @pulse-track/sdk
                                    </pre>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">2. Initialization</h3>
                                    <pre className="bg-[var(--bg-primary)] p-6 rounded-2xl text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-normal)]">
                                        {`import { analytics } from '@pulse-track/sdk';\n\nanalytics.init('YOUR_PUBLIC_KEY');`}
                                    </pre>
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest">3. Tracking</h3>
                                    <pre className="bg-[var(--bg-primary)] p-6 rounded-2xl text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-normal)]">
                                        {`analytics.track('user_signed_up', {\n  plan: 'premium',\n  source: 'referral'\n});`}
                                    </pre>
                                </div>
                            </div>
                        </article>
                    )}

                    {activeSection === 'events' && (
                        <article className="space-y-8">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Event Design Guide</h1>
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border-normal)] p-6 rounded-2xl">
                                <h4 className="text-[var(--text-primary)] font-bold text-sm mb-2 flex items-center space-x-2">
                                    <Shield size={16} />
                                    <span>Strict Metadata Rule</span>
                                </h4>
                                <p className="text-xs text-[var(--text-secondary)] leading-relaxed">
                                    Pulse-Track enforces snake_case and verb_object formatting. Invalid event names will be rejected by the ingestion gateway.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl">
                                    <h4 className="text-[var(--text-primary)] font-bold text-xs uppercase mb-4">Good Design ✓</h4>
                                    <ul className="text-xs text-[var(--text-tertiary)] space-y-2 font-mono">
                                        <li>user_signed_up</li>
                                        <li>project_created</li>
                                        <li>invoice_paid</li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl opacity-60">
                                    <h4 className="text-[var(--text-secondary)] font-bold text-xs uppercase mb-4">Bad Design ✗</h4>
                                    <ul className="text-xs text-[var(--text-tertiary)] space-y-2 font-mono">
                                        <li>UserSignedUp</li>
                                        <li>Click_Submit_Button</li>
                                        <li>new-item</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="space-y-4 pt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                                <p><strong className="text-[var(--text-primary)]">Track Decisions:</strong> Don't track every pixel hover. Track meaningful user intent.</p>
                                <p><strong className="text-[var(--text-primary)]">Properties:</strong> Include as much context as possible. Properties in Pulse-Track are indexed JSONB fields.</p>
                                <p><strong className="text-[var(--text-primary)]">Versioning:</strong> Use `event_version` instead of renaming events to maintain historical continuity.</p>
                            </div>
                        </article>
                    )}

                    {activeSection === 'identity' && (
                        <article className="space-y-8">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Identity Handling</h1>
                            <p className="text-[var(--text-secondary)] leading-relaxed">
                                Pulse-Track uses a shadow identity model. Every user begins as an anonymous ID stored in local browser state.
                            </p>
                            <div className="p-8 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-3xl space-y-6">
                                <h3 className="text-[var(--text-primary)] font-bold tracking-tight">The Identify Call</h3>
                                <pre className="bg-[var(--bg-primary)] p-6 rounded-xl text-xs font-mono text-[var(--text-secondary)] border border-[var(--border-normal)]">
                                    analytics.identify('uuid-from-your-db');
                                </pre>
                                <p className="text-xs text-[var(--text-tertiary)] leading-relaxed italic">
                                    This call links the current anonymous session (and all preceding events) to a permanent record in your system.
                                </p>
                            </div>
                        </article>
                    )}

                    {activeSection === 'analytics' && (
                        <article className="space-y-8">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Analytics Explained</h1>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[
                                    { title: 'Funnels', body: 'Measure step-by-step conversion. Perfect for onboarding or checkout flows.' },
                                    { title: 'Segmentation', body: 'Drill down into events by properties like browser, version, or plan.' },
                                    { title: 'Retention', body: 'Understand loyal behavior. Measure how often users return over time.' }
                                ].map((item, i) => (
                                    <div key={i} className="p-6 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl hover:border-[var(--border-hover)] transition-all">
                                        <h4 className="text-[var(--text-primary)] font-bold text-sm mb-3">{item.title}</h4>
                                        <p className="text-xs text-[var(--text-tertiary)] leading-relaxed">{item.body}</p>
                                    </div>
                                ))}
                            </div>
                        </article>
                    )}

                    {activeSection === 'mistakes' && (
                        <article className="space-y-8">
                            <h1 className="text-3xl font-black text-[var(--text-primary)] italic uppercase tracking-tight">Common Mistakes</h1>
                            <div className="space-y-4">
                                {[
                                    { t: 'Tracking too much', b: 'Measuring everything is measuring nothing. Focus on 10-15 core events.' },
                                    { t: 'Mixing Environments', b: 'Sending test data to your production project ruins your growth metrics.' },
                                    { t: 'Low Property Detail', b: 'Without properties, you cannot segment data to find why users are leaving.' }
                                ].map((m, i) => (
                                    <div key={i} className="flex items-start space-x-4 p-4 border-l-2 border-[var(--border-hover)] bg-[var(--bg-secondary)]">
                                        <AlertTriangle size={20} className="text-[var(--accent-primary)] shrink-0" />
                                        <div>
                                            <h4 className="text-sm font-bold text-[var(--text-primary)]">{m.t}</h4>
                                            <p className="text-xs text-[var(--text-secondary)] mt-1">{m.b}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </article>
                    )}
                </div>
            </main>
        </div>
    );
};

export default DocsView;
