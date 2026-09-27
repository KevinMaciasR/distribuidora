import { defineConfig } from 'vite';

export default defineConfig({
    root: 'mobile',

    server: {
        host: true,
        port: 5173
    },

    build: {
        outDir: '../dist',
        emptyOutDir: true
    }
});