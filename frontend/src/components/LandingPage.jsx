import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronRight,
    Database,
    Shield,
    Zap,
    Workflow,
    Target,
    Cpu,
    Code,
    Lock,
    Globe,
    Terminal,
    LayoutGrid,
    Search,
    Heart,
    Bookmark,
    MoreHorizontal,
    Sun,
    Moon
} from 'lucide-react';
import { analytics } from '../sdk/analytics';
import Hyperspeed, { hyperspeedPresets } from './Hyperspeed';

const SidebarIcon = ({ icon: Icon, active, onClick, tooltip, isDark }) => {
    const activeClasses = isDark 
        ? 'bg-white/10 text-white shadow-inner border border-white/5' 
        : 'bg-[#E5DED0] text-[#1A1A1A] shadow-inner border border-[#D8D1C7]';
    const inactiveClasses = isDark
        ? 'text-white/40 hover:bg-white/5 hover:text-white'
        : 'text-[#5F5A54] hover:bg-[#EEE8DD] hover:text-[#1A1A1A]';
    const tooltipClasses = isDark
        ? 'bg-white text-black'
        : 'bg-[#1A1A1A] text-[#F8F5EE]';

    return (
        <div className="relative group cursor-pointer flex items-center justify-center" onClick={onClick}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${active ? activeClasses : inactiveClasses}`}>
                <Icon size={18} strokeWidth={active ? 2 : 1.5} />
            </div>
            {tooltip && (
                <div className={`absolute left-full top-1/2 -translate-y-1/2 ml-4 px-2.5 py-1.5 text-xs font-medium rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl ${tooltipClasses}`}>
                    {tooltip}
                </div>
            )}
        </div>
    );
};

const LandingPage = () => {
    const navigate = useNavigate();
    const [theme, setTheme] = useState('dark');
    const isDark = theme === 'dark';

    useEffect(() => {
        analytics.track('page_view', { page_type: 'landing' });
    }, []);

    const features = [
        {
            icon: Target,
            title: "Identity Stitching",
            desc: "Proprietary shadow models merge anonymous telemetry with identified profiles across sessions automatically."
        },
        {
            icon: Workflow,
            title: "Infinite Funnels",
            desc: "Analyze complex user paths with zero recalculation latency. Track every drop-off with millisecond precision."
        },
        {
            icon: Shield,
            title: "Total Ownership",
            desc: "No third-party trackers. All telemetry resides in your private cloud infrastructure, under your total control."
        }
    ];

    const c = {
        bg: isDark ? 'bg-[#050505]' : 'bg-[#F8F5EE]',
        text: isDark ? 'text-white' : 'text-[#1A1A1A]',
        selection: isDark ? 'selection:bg-white/20' : 'selection:bg-[#D8D1C7]',
        sidebarBg: isDark ? 'bg-[#050505]/80' : 'bg-[#F8F5EE]/80',
        topbarBg: isDark ? 'bg-[#050505]/60' : 'bg-[#F8F5EE]/60',
        borderLight: isDark ? 'border-white/5' : 'border-[#D8D1C7]/60',
        borderNormal: isDark ? 'border-white/10' : 'border-[#D8D1C7]',
        borderHover: isDark ? 'hover:border-white/20' : 'hover:border-[#B5AFA4]',
        textMuted: isDark ? 'text-white/40' : 'text-[#5F5A54]',
        textSubtle: isDark ? 'text-white/30' : 'text-[#5F5A54]/60',
        textHighlight: isDark ? 'text-white/80' : 'text-[#1A1A1A]',
        cardBg: isDark ? 'bg-[#0a0a0a]/80' : 'bg-[#EEE8DD]/80',
        cardBgDarker: isDark ? 'bg-black' : 'bg-[#E5DED0]',
        codeBlockBg: isDark ? 'bg-[#050505]/90' : 'bg-[#F8F5EE]/90',
        gradientCTA: isDark ? 'from-[#111] to-[#050505]' : 'from-[#E5DED0] to-[#F8F5EE]',
        btnPrimary: isDark ? 'bg-white text-black hover:bg-slate-200 shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'bg-[#1A1A1A] text-[#F8F5EE] hover:bg-black shadow-[0_0_15px_rgba(26,26,26,0.15)]',
        btnSecondary: isDark ? 'bg-[#111] text-white hover:bg-white/5' : 'bg-[#F8F5EE] text-[#1A1A1A] hover:bg-white',
        btnOutline: isDark ? 'bg-transparent text-white border-white/20 hover:bg-white/5' : 'bg-transparent text-[#1A1A1A] border-[#D8D1C7] hover:bg-[#EEE8DD]',
        dot: isDark ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#1A1A1A] shadow-[0_0_8px_rgba(26,26,26,0.5)]',
        terminalIconBg: isDark ? 'bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.2)]' : 'bg-[#1A1A1A] text-[#F8F5EE] shadow-[0_0_20px_rgba(26,26,26,0.1)]',
        gridLine: isDark ? '#ffffff05' : '#1a1a1a08',
    };

    return (
        <div className={`flex h-screen w-screen font-sans overflow-hidden transition-colors duration-500 ${c.bg} ${c.text} ${c.selection}`}>
            {/* Background Layer (Hyperspeed) */}
            <div className={`fixed inset-0 z-0 pointer-events-none opacity-[0.15] transition-all duration-500 ${isDark ? '' : 'invert'}`}>
                <Hyperspeed effectOptions={hyperspeedPresets.four} />
            </div>

            {/* Sidebar */}
            <nav className={`w-[72px] h-full border-r backdrop-blur-xl flex flex-col items-center py-6 z-50 flex-shrink-0 relative transition-colors duration-500 ${c.sidebarBg} ${c.borderLight}`}>
                <div 
                    className={`w-10 h-10 rounded-xl flex items-center justify-center mb-8 cursor-pointer hover:scale-105 transition-all duration-300 ${c.terminalIconBg}`} 
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                    <Terminal size={20} strokeWidth={2.5} />
                </div>
                
                <div className="flex flex-col space-y-4 w-full items-center">
                    <SidebarIcon icon={LayoutGrid} active tooltip="Overview" isDark={isDark} />
                    <SidebarIcon icon={Database} onClick={() => navigate('/dashboard')} tooltip="Console" isDark={isDark} />
                    <SidebarIcon icon={Zap} onClick={() => navigate('/onboarding')} tooltip="Get Started" isDark={isDark} />
                </div>
                
                <div className="mt-auto flex flex-col space-y-4 w-full items-center">
                    <SidebarIcon icon={Search} tooltip="Search" isDark={isDark} />
                    <div className={`w-9 h-9 rounded-full border flex items-center justify-center cursor-pointer overflow-hidden mt-4 transition-colors ${isDark ? 'bg-white/10 border-white/20 hover:border-white/40' : 'bg-[#EEE8DD] border-[#D8D1C7] hover:border-[#B5AFA4]'}`}>
                        <div className={`w-full h-full bg-gradient-to-tr ${isDark ? 'from-white/20' : 'from-[#1A1A1A]/10'} to-transparent`} />
                    </div>
                </div>
            </nav>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full relative overflow-hidden z-10">
                {/* Topbar */}
                <header className={`h-[72px] px-8 flex items-center justify-between border-b backdrop-blur-md z-40 flex-shrink-0 transition-colors duration-500 ${c.topbarBg} ${c.borderLight}`}>
                    <div className="flex items-center space-x-4">
                        <h1 className="text-base font-medium tracking-wide">Pulse-Track</h1>
                        <div className={`h-4 w-px ${isDark ? 'bg-white/10' : 'bg-[#D8D1C7]'}`} />
                        <div className={`flex items-center space-x-2 px-2.5 py-1 rounded-full border ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#EEE8DD] border-[#D8D1C7]'}`}>
                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${c.dot}`} />
                            <span className={`text-[10px] font-medium tracking-widest uppercase ${c.textMuted}`}>System v1.0 Live</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={() => setTheme(isDark ? 'light' : 'dark')} 
                            className={`p-2 rounded-md transition-colors ${isDark ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-[#5F5A54] hover:text-[#1A1A1A] hover:bg-[#EEE8DD]'}`}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button 
                            onClick={() => navigate('/onboarding')} 
                            className={`px-4 py-2 text-xs font-medium rounded-md transition-all ${c.btnPrimary}`}
                        >
                            Initialize
                        </button>
                    </div>
                </header>

                {/* Scrollable Grid */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto pb-12">
                        {/* Grid Container */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(320px,auto)] grid-flow-row-dense">
                            
                            {/* Hero Card */}
                            <div className={`md:col-span-2 lg:col-span-2 row-span-2 group relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col p-8 md:p-12 ${c.cardBg} ${c.borderNormal} ${c.borderHover}`}>
                                <div className="flex flex-col justify-center h-full max-w-2xl">
                                    <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full border w-fit mb-8 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#EEE8DD] border-[#D8D1C7]'}`}>
                                        <Terminal size={12} className={c.textMuted} />
                                        <span className={`text-[10px] font-medium uppercase tracking-widest ${c.textMuted}`}>Pulse-Track Telemetry</span>
                                    </div>
                                    <h2 className="text-5xl md:text-7xl lg:text-8xl font-light tracking-tighter leading-[1.1] mb-6">
                                        Precision<br />
                                        <span className="font-medium">Telemetry.</span>
                                    </h2>
                                    <p className={`text-lg leading-relaxed font-light mb-10 max-w-xl ${c.textMuted}`}>
                                        The performance-first analytics engine for systems that demand total visibility.
                                        Built for scale, engineered for privacy, deployed for clarity.
                                    </p>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <button onClick={() => navigate('/onboarding')} className={`px-6 py-3.5 font-medium text-sm rounded-xl transition-all flex items-center space-x-2 shadow-lg ${c.btnPrimary}`}>
                                            <span>Initialize Interface</span>
                                            <ChevronRight size={16} />
                                        </button>
                                        <button onClick={() => navigate('/dashboard')} className={`px-6 py-3.5 border font-medium text-sm rounded-xl transition-colors ${c.btnSecondary} ${c.borderNormal}`}>
                                            Admin Preview
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Feature 1 */}
                            <div className={`col-span-1 row-span-1 group relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col p-6 md:p-8 ${c.cardBg} ${c.borderNormal} ${c.borderHover}`}>
                                <div className="flex flex-col h-full">
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#F8F5EE] border-[#D8D1C7]'}`}>
                                        <Target size={18} className={c.textHighlight} />
                                    </div>
                                    <h3 className="text-xl font-medium mb-3 tracking-tight">{features[0].title}</h3>
                                    <p className={`text-sm leading-relaxed font-light ${c.textMuted}`}>{features[0].desc}</p>
                                    

                                </div>
                            </div>

                            {/* Feature 2 */}
                            <div className={`col-span-1 row-span-1 group relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col p-6 md:p-8 ${c.cardBg} ${c.borderNormal} ${c.borderHover}`}>
                                <div className="flex flex-col h-full">
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#F8F5EE] border-[#D8D1C7]'}`}>
                                        <Workflow size={18} className={c.textHighlight} />
                                    </div>
                                    <h3 className="text-xl font-medium mb-3 tracking-tight">{features[1].title}</h3>
                                    <p className={`text-sm leading-relaxed font-light ${c.textMuted}`}>{features[1].desc}</p>
                                    

                                </div>
                            </div>

                            {/* Code Snippet Card */}
                            <div className={`md:col-span-2 row-span-1 group relative border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col ${c.cardBgDarker} ${c.borderNormal} ${c.borderHover}`}>
                                {/* Grid Background inside code card */}
                                <div 
                                    className="absolute inset-0"
                                    style={{
                                        backgroundImage: `linear-gradient(to right, ${c.gridLine} 1px, transparent 1px), linear-gradient(to bottom, ${c.gridLine} 1px, transparent 1px)`,
                                        backgroundSize: '24px 24px'
                                    }}
                                />
                                
                                <div className={`relative z-10 flex-1 flex flex-col p-6 md:p-10 font-mono text-xs md:text-sm leading-relaxed justify-center items-center ${c.textMuted}`}>
                                    <div className={`backdrop-blur-sm border rounded-xl p-6 md:p-8 shadow-2xl w-full max-w-xl relative overflow-hidden transition-colors ${c.codeBlockBg} ${c.borderNormal} ${c.borderHover}`}>
                                        <div className="flex space-x-2 mb-6">
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-[#D8D1C7]'}`} />
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-[#D8D1C7]'}`} />
                                            <div className={`w-2.5 h-2.5 rounded-full ${isDark ? 'bg-white/20' : 'bg-[#D8D1C7]'}`} />
                                        </div>
                                        <span className={c.textSubtle}>// Initialize Telemetry Pipeline</span><br />
                                        <span className={c.textHighlight}>await</span> <span className={c.text}>PulseTrack</span>.<span className={c.textHighlight}>init</span>(<span className={isDark ? 'text-white/50' : 'text-[#5F5A54]'}>&apos;PROJ_KEY_V1&apos;</span>);<br /><br />
                                        <span className={c.textSubtle}>// Identity Stitching</span><br />
                                        <span className={c.text}>PulseTrack</span>.<span className={c.textHighlight}>identify</span>(<span className={isDark ? 'text-white/50' : 'text-[#5F5A54]'}>&apos;usr_772&apos;</span>, &#123;<br />
                                        &nbsp;&nbsp;<span className={c.textMuted}>tier</span>: <span className={isDark ? 'text-white/50' : 'text-[#5F5A54]'}>&apos;premium&apos;</span>,<br />
                                        &nbsp;&nbsp;<span className={c.textMuted}>region</span>: <span className={isDark ? 'text-white/50' : 'text-[#5F5A54]'}>&apos;eu-west-1&apos;</span><br />
                                        &#125;);
                                    </div>
                                </div>

                            </div>

                            {/* Feature 3 */}
                            <div className={`col-span-1 row-span-1 group relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col p-6 md:p-8 ${c.cardBg} ${c.borderNormal} ${c.borderHover}`}>
                                <div className="flex flex-col h-full">
                                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center mb-6 ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#F8F5EE] border-[#D8D1C7]'}`}>
                                        <Shield size={18} className={c.textHighlight} />
                                    </div>
                                    <h3 className="text-xl font-medium mb-3 tracking-tight">{features[2].title}</h3>
                                    <p className={`text-sm leading-relaxed font-light ${c.textMuted}`}>{features[2].desc}</p>
                                    

                                </div>
                            </div>

                            {/* Philosophy Stats */}
                            <div className={`col-span-1 row-span-1 group relative backdrop-blur-xl border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col p-6 md:p-8 ${c.cardBg} ${c.borderNormal} ${c.borderHover}`}>
                                <div className="flex flex-col h-full">
                                    <h3 className="text-2xl font-light mb-8 tracking-tight leading-snug">Performance is<br/><span className="font-medium">Non-Negotiable.</span></h3>
                                    <div className="flex-1 flex flex-col justify-center space-y-5">
                                        {[
                                            { icon: Cpu, label: "0.2ms Ingestion" },
                                            { icon: Zap, label: "Real-time Stream" },
                                            { icon: Code, label: "Type-Safe Client" },
                                            { icon: Globe, label: "Global Edge" }
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center space-x-4">
                                                <div className={`w-8 h-8 rounded border flex items-center justify-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-[#F8F5EE] border-[#D8D1C7]'}`}>
                                                    <item.icon size={14} className={c.textMuted} />
                                                </div>
                                                <span className={`text-sm font-medium ${isDark ? 'text-white/70' : 'text-[#1A1A1A]/80'}`}>{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                </div>
                            </div>

                            {/* Final CTA */}
                            <div className={`md:col-span-2 row-span-1 group relative bg-gradient-to-br border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col p-8 md:p-12 ${c.gradientCTA} ${c.borderNormal} ${c.borderHover}`}>
                                <div className="flex flex-col items-center justify-center h-full text-center relative z-10">
                                    <Database size={32} className={`mb-6 group-hover:scale-110 transition-transform duration-500 ${isDark ? 'text-white/20' : 'text-[#D8D1C7]'}`} />
                                    <h3 className="text-3xl md:text-5xl font-light tracking-tighter mb-4">
                                        Ready to scale <span className="font-medium">the interface.</span>
                                    </h3>
                                    <p className={`text-sm md:text-base max-w-md mx-auto mb-8 font-light leading-relaxed ${c.textMuted}`}>
                                        Stop guessing. Start observing. Deploy the unified platform for modern product engineering teams.
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-4">
                                        <button onClick={() => navigate('/onboarding')} className={`px-8 py-3.5 font-medium text-sm rounded-xl transition-all hover:scale-105 active:scale-95 ${c.btnPrimary}`}>
                                            Deploy Production
                                        </button>
                                        <button onClick={() => navigate('/dashboard')} className={`px-8 py-3.5 font-medium text-sm rounded-xl transition-colors ${c.btnOutline}`}>
                                            Admin Console
                                        </button>
                                    </div>
                                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 md:gap-10">
                                        <div className="flex items-center space-x-2">
                                            <Lock size={12} className={c.textSubtle} />
                                            <span className={`text-[10px] font-medium uppercase tracking-widest ${c.textSubtle}`}>E2E Encryption</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Shield size={12} className={c.textSubtle} />
                                            <span className={`text-[10px] font-medium uppercase tracking-widest ${c.textSubtle}`}>SOC2 Ready</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Zap size={12} className={c.textSubtle} />
                                            <span className={`text-[10px] font-medium uppercase tracking-widest ${c.textSubtle}`}>99.99% SLC</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                    <Shield size={200} className="rotate-12 translate-x-10 -translate-y-10" />
                                </div>
                            </div>

                        </div>
                        
                        <footer className={`mt-16 text-center opacity-30 text-[10px] font-medium uppercase tracking-[0.3em] ${c.text}`}>
                            &copy; 2024 Pulse-Track Telemetry Inc // All Systems Autonomous
                        </footer>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default LandingPage;
