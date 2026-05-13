import React, { Component } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        // You could log the error to an external service here
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 bg-[var(--bg-tertiary)] rounded-full flex items-center justify-center mb-6 border border-[var(--border-normal)]">
                        <AlertTriangle className="text-[var(--accent-primary)]" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Module Offline</h1>
                    <p className="text-[var(--text-secondary)] max-w-md mb-8">
                        The dashboard encountered a critical telemetry failure. This might be due to a connection drop or an internal processing error.
                    </p>
                    <button
                        onClick={this.handleReset}
                        className="flex items-center space-x-2 px-6 py-3 bg-[var(--accent-primary)] hover:opacity-90 text-[color:var(--text-inverted)] rounded-xl font-bold transition-all active:scale-95 shadow-sm"
                    >
                        <RefreshCcw size={18} />
                        <span>REBOOT INTERFACE</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
