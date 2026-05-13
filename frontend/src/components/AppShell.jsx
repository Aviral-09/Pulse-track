import React from 'react';

const AppShell = ({ children }) => {
    return (
        <div className="shared_page-layout bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-500">
            {children}
        </div>
    );
};

export default AppShell;
