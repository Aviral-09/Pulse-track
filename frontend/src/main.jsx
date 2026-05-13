import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import ScreenRoot from './components/ScreenRoot';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { analytics } from './sdk/analytics';

// Initialize Analytics for the system itself
analytics.init('78aedd6a-99c8-46cd-a4ae-552dde245911', { environment: 'prod' });

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary>
            <BrowserRouter>
                <ScreenRoot>
                    <App />
                </ScreenRoot>
            </BrowserRouter>
        </ErrorBoundary>
    </React.StrictMode>
);

