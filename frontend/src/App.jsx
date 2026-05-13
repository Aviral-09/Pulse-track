import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Dashboard from './Dashboard';
import Onboarding from './Onboarding';

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            {/* Catch-all route to redirect to landing */}
            <Route path="*" element={<LandingPage />} />
        </Routes>
    );
}

