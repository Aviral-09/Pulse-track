import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
    plugins: [react(), tailwindcss()],
    // STABILIZED DEV SERVER CONFIGURATION
    server: {
        host: "localhost", // Force localhost instead of 0.0.0.0 to prevent ERR_NETWORK_CHANGED
        port: 5173,        // Standardize on 5173
        strictPort: true,  // Don't auto-switch ports if busy

        hmr: {
            overlay: false // Disable connection error overlay to prevent blocking UI
            // set to false to disable HMR completely if instability continues
        },

        watch: {
            usePolling: true, // Use polling to fix file watch issues on Windows/WSL/VPN
            interval: 1000,   // Poll every second (balance cpu/responsiveness)
        }
    },
});

/*
    NETWORK STABILITY GUIDE (WINDOWS/VPN):
    - VPNs and virtual network adapters (Hyper-V, VirtualBox) can cause localhost IP changes.
    - If ERR_NETWORK_CHANGED persists, disable unused network adapters.
    
    SAFE RESTART:
    1. Stop dev server (Ctrl+C)
    2. npm run dev
    3. Open http://localhost:5173 in a NEW tab
*/
