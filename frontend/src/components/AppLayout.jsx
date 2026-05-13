import React from 'react';
import Sidebar from './Sidebar';

const AppLayout = ({ children, activeTab, setActiveTab }) => {
    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans selection:bg-[var(--accent-primary)] selection:text-[color:var(--text-inverted)] overflow-hidden">
            {/* Left Sidebar */}
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* Main Main Content Container */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Fixed Topbar will be provided by children/page locally for title context */}
                <div className="flex-1 overflow-y-auto scroll-smooth custom-scrollbar bg-[var(--bg-secondary)]">
                    <div className="p-8">
                        <div className="max-w-7xl mx-auto space-y-8">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppLayout;
