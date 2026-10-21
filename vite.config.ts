import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import { handleAppointmentsApi } from './src/server/appointmentsApi.ts';

function appointmentsBackendPlugin() {
  return {
    name: 'appointments-backend-api',
    configureServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (
          req.url &&
          (req.url.startsWith('/api/appointments') ||
            req.url.startsWith('/api/schedule-config') ||
            req.url === '/api/health')
        ) {
          try {
            const handled = await handleAppointmentsApi(req, res);
            if (handled) return;
          } catch (e) {
            console.error('[API Middleware] Erro:', e);
          }
        }
        next();
      });
    },
    configurePreviewServer(server: any) {
      server.middlewares.use(async (req: any, res: any, next: any) => {
        if (
          req.url &&
          (req.url.startsWith('/api/appointments') ||
            req.url.startsWith('/api/schedule-config') ||
            req.url === '/api/health')
        ) {
          try {
            const handled = await handleAppointmentsApi(req, res);
            if (handled) return;
          } catch (e) {
            console.error('[Preview API Middleware] Erro:', e);
          }
        }
        next();
      });
    }
  };
}

export default defineConfig(() => {
  const rootDir = import.meta.dirname || process.cwd();
  return {
    plugins: [react(), tailwindcss(), appointmentsBackendPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(rootDir, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(rootDir, 'index.html'),
          admin: path.resolve(rootDir, 'admin.html'),
        },
      },
    },
    server: {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
