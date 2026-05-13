import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    ChevronRight,
    Rocket,
    Code,
    Zap,
    CheckCircle,
    ArrowRight,
    Copy,
    Database,
    LineChart
} from 'lucide-react';
import { analytics } from './sdk/analytics';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [project, setProject] = useState({ name: '', environment: 'prod', product_type: 'saas' });
    const [createdProject, setCreatedProject] = useState(null);
    const [simulatedCount, setSimulatedCount] = useState(0);

    const nextStep = () => setStep(s => s + 1);

    const handleCreateProject = async (e) => {
        e.preventDefault();
        console.log('[Frontend] Initiating project creation...', project);
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:6543/v1/analytics/projects', project);
            console.log('[Frontend] Project created successfully:', res.data);
            setCreatedProject(res.data);
            analytics.init(res.data.public_key);
            nextStep();
        } catch (err) {
            console.error('Failed to create project', err);
            alert(`Failed to create project: ${err.response?.data?.error || err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const simulateEvent = async (name) => {
        await analytics.track(name, { source: 'onboarding_sim' });
        setSimulatedCount(c => c + 1);
    };

    const sdkSnippet = `import { analytics } from '@antigravity/sdk';

analytics.init('${createdProject?.public_key || 'YOUR_PUBLIC_KEY'}');
analytics.track('page_view');`;

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Hyperspeed Background Placeholder - Assume it's in parent ScreenRoot */}

            <div className="w-full max-w-2xl bg-[var(--bg-primary)] backdrop-blur-2xl border border-[var(--border-normal)] rounded-[2.5rem] p-12 shadow-2xl relative z-10 animate-in fade-in zoom-in duration-500">

                {/* Progress Indicators */}
                <div className="flex items-center space-x-2 mb-12">
                    {[1, 2, 3, 4, 5].map((num) => (
                        <div
                            key={num}
                            className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= num ? 'bg-[var(--accent-primary)]' : 'bg-[var(--bg-tertiary)]'}`}
                        />
                    ))}
                </div>

                {/* Step 1: Signup Mock */}
                {step === 1 && (
                    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                        <header>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Begin Ingestion.</h1>
                            <p className="text-[var(--text-secondary)] mt-2">Zero configuration, developer-first telemetry.</p>
                        </header>
                        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); nextStep(); }}>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Work Email</label>
                                <input
                                    type="email"
                                    required
                                    placeholder="name@company.com"
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Password</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-[var(--accent-primary)] text-[color:var(--text-inverted)] font-bold py-4 rounded-2xl hover:opacity-90 transition-opacity flex items-center justify-center space-x-2"
                            >
                                <span>Create Account</span>
                                <ArrowRight size={18} />
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 2: Create Project */}
                {step === 2 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <header>
                            <div className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl flex items-center justify-center mb-6">
                                <Rocket className="text-[var(--accent-primary)]" size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Define your Product.</h1>
                            <p className="text-[var(--text-secondary)] mt-2">A project isolates telemetry data for a specific product or environment.</p>
                        </header>
                        <form className="space-y-6" onSubmit={handleCreateProject}>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Product Name</label>
                                <input
                                    type="text"
                                    value={project.name}
                                    onChange={(e) => setProject({ ...project, name: e.target.value })}
                                    placeholder="e.g. Antigravity Web"
                                    className="w-full bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-2xl px-6 py-4 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] focus:ring-1 focus:ring-[var(--accent-primary)] transition-all placeholder:text-[var(--text-tertiary)]"
                                    required
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Product Type</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'saas', label: 'SaaS / App' },
                                        { id: 'ecommerce', label: 'E-Commerce' },
                                        { id: 'content', label: 'Content Site' },
                                        { id: 'custom', label: 'Custom' }
                                    ].map(type => (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => setProject({ ...project, product_type: type.id })}
                                            className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${project.product_type === type.id ? 'bg-[var(--accent-primary)] text-[color:var(--text-inverted)] border-[var(--accent-primary)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-normal)] hover:border-[var(--border-hover)]'}`}
                                        >
                                            {type.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-[var(--text-tertiary)] uppercase tracking-widest mb-2 block">Environment</label>
                                <div className="grid grid-cols-2 gap-4">
                                    {['prod', 'staging'].map(env => (
                                        <button
                                            key={env}
                                            type="button"
                                            onClick={() => setProject({ ...project, environment: env })}
                                            className={`py-3 rounded-xl border font-bold text-xs uppercase tracking-widest transition-all ${project.environment === env ? 'bg-[var(--accent-primary)] text-[color:var(--text-inverted)] border-[var(--accent-primary)]' : 'bg-transparent text-[var(--text-secondary)] border-[var(--border-normal)] hover:border-[var(--border-hover)]'}`}
                                        >
                                            {env}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[var(--accent-primary)] text-[color:var(--text-inverted)] font-bold py-4 rounded-2xl hover:opacity-90 transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:border disabled:border-[var(--border-normal)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
                            >
                                {loading ? 'Initializing Interface...' : 'Create Project'}
                            </button>
                        </form>
                    </div>
                )}

                {/* Step 3: SDK Setup */}
                {step === 3 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <header>
                            <div className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl flex items-center justify-center mb-6">
                                <Code className="text-[var(--accent-primary)]" size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Connect SDK.</h1>
                            <p className="text-[var(--text-secondary)] mt-2">Drop this snippet into your app entry point to start tracking.</p>
                        </header>
                        <div className="relative group">
                            <pre className="bg-[var(--bg-primary)] text-[var(--text-secondary)] p-6 rounded-2xl text-xs font-mono overflow-x-auto border border-[var(--border-normal)]">
                                {sdkSnippet}
                            </pre>
                            <button
                                onClick={() => navigator.clipboard.writeText(sdkSnippet)}
                                className="absolute top-4 right-4 p-2 bg-[var(--bg-tertiary)] hover:bg-[var(--border-normal)] rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-all shadow-sm"
                            >
                                <Copy size={16} />
                            </button>
                        </div>
                        <div className="bg-[var(--bg-secondary)] border border-[var(--border-light)] p-4 rounded-xl flex items-center space-x-3 text-xs text-[var(--text-secondary)]">
                            <Zap size={14} className="text-[var(--accent-primary)]" />
                            <span>The SDK handles anonymous IDs and offline retries automatically.</span>
                        </div>
                        <button
                            onClick={nextStep}
                            className="w-full bg-[var(--accent-primary)] text-[color:var(--text-inverted)] font-bold py-4 rounded-2xl hover:opacity-90 transition-colors"
                        >
                            I've Added the Snippet
                        </button>
                    </div>
                )}

                {/* Step 4: Simulation */}
                {step === 4 && (
                    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                        <header>
                            <div className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border-normal)] rounded-xl flex items-center justify-center mb-6">
                                <Zap className="text-[var(--accent-primary)]" size={24} />
                            </div>
                            <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Validate Ingestion.</h1>
                            <p className="text-[var(--text-secondary)] mt-2">Trigger your first events to see the pipeline in action.</p>
                        </header>
                        <div className="grid grid-cols-1 gap-4">
                            {[
                                { name: 'page_view', label: 'Simulate Page View' },
                                { name: 'signup_completed', label: 'Simulate Signup' },
                                { name: 'feature_used', label: 'Simulate Feature Usage' }
                            ].map(btn => (
                                <button
                                    key={btn.name}
                                    onClick={() => simulateEvent(btn.name)}
                                    className="flex items-center justify-between p-4 bg-[var(--bg-secondary)] border border-[var(--border-light)] rounded-xl hover:bg-[var(--bg-tertiary)] hover:border-[var(--border-normal)] transition-all group"
                                >
                                    <div className="flex items-center space-x-3">
                                        <Database size={18} className="text-[var(--text-tertiary)]" />
                                        <span className="text-sm font-bold text-[var(--text-primary)]">{btn.label}</span>
                                    </div>
                                    <ArrowRight size={16} className="text-[var(--text-tertiary)] group-hover:text-[var(--text-primary)] group-hover:translate-x-1 transition-all" />
                                </button>
                            ))}
                        </div>
                        {simulatedCount > 0 && (
                            <div className="text-center animate-in fade-in duration-300">
                                <p className="text-xs text-[color:var(--text-inverted)] font-bold bg-[var(--accent-primary)] px-4 py-2 rounded-full inline-block">
                                    {simulatedCount} events captured live
                                </p>
                            </div>
                        )}
                        <button
                            onClick={nextStep}
                            disabled={simulatedCount === 0}
                            className="w-full bg-[var(--accent-primary)] text-[color:var(--text-inverted)] font-bold py-4 rounded-2xl hover:opacity-90 transition-all disabled:bg-[var(--bg-tertiary)] disabled:text-[var(--text-tertiary)] disabled:border disabled:border-[var(--border-normal)] disabled:shadow-none cursor-pointer disabled:cursor-not-allowed"
                        >
                            Continue to Insights
                        </button>
                    </div>
                )}

                {/* Step 5: Success */}
                {step === 5 && (
                    <div className="text-center space-y-8 animate-in zoom-in-95 duration-500">
                        <div className="w-20 h-20 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border-hover)]">
                            <CheckCircle className="text-[var(--accent-primary)]" size={40} />
                        </div>
                        <header>
                            <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight italic uppercase">System Online.</h1>
                            <p className="text-[var(--text-secondary)] mt-2 max-w-sm mx-auto">
                                Your first insight is ready. We've auto-generated a conversion funnel and traffic overview for {createdProject?.name}.
                            </p>
                        </header>
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="w-full bg-[var(--accent-primary)] text-[color:var(--text-inverted)] font-extrabold py-5 rounded-3xl hover:opacity-90 transition-all transform hover:scale-[1.02] shadow-sm"
                        >
                            GO TO DASHBOARD
                        </button>
                        <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-[0.3em] font-black">Time to insight: 4m 12s</p>
                    </div>
                )}
            </div>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--accent-primary)] opacity-5 blur-[120px] rounded-full -mr-64 -mt-64 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[var(--accent-primary)] opacity-5 blur-[120px] rounded-full -ml-64 -mb-64 pointer-events-none" />
        </div>
    );
};

export default Onboarding;
