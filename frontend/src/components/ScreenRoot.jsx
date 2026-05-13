import React from 'react';
import Hyperspeed, { hyperspeedPresets } from './Hyperspeed';

const BackgroundLayer = () => {
    return (
        <div className="absolute inset-0 z-0 opacity-50 pointer-events-none overflow-hidden">
            <Hyperspeed effectOptions={hyperspeedPresets.four} />
        </div>
    );
};

const ForegroundLayer = ({ children }) => {
    return (
        <div className="relative z-10 h-full w-full pointer-events-auto">
            {children}
        </div>
    );
};

const ScreenRoot = ({ children }) => {
    return (
        <div className="relative h-screen w-screen overflow-hidden bg-[var(--bg-primary)]">
            <BackgroundLayer />
            <ForegroundLayer>
                {children}
            </ForegroundLayer>
        </div>
    );
};

export default ScreenRoot;
