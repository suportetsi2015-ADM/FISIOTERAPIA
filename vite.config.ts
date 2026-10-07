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

function officialPhotosPlugin() {
  return {
    name: 'official-photos-api',
    configureServer(server: any) {
      server.middlewares.use('/api/save-official-photo', (req: any, res: any) => {
        if (req.method === 'POST') {
          const chunks: Buffer[] = [];
          req.on('data', (chunk: Buffer) => chunks.push(chunk));
          req.on('end', () => {
            try {
              const body = JSON.parse(Buffer.concat(chunks).toString('utf-8'));
              const { type, dataUrl } = body;
              const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
              if (!matches) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Formato de imagem inválido' }));
                return;
              }
              const buffer = Buffer.from(matches[2], 'base64');
              const filename =
                type === 'principal' || type === 'studioHero' || type === 'hero'
                  ? 'dra_leia_principal.jpg'
                  : 'dra_leia_sobre.jpg';

              const rootDir = import.meta.dirname || process.cwd();
              const publicDir = path.resolve(rootDir, 'public/images');
              const assetsDir = path.resolve(rootDir, 'src/assets/images');
              const distImagesDir = path.resolve(rootDir, 'dist/images');

              fs.mkdirSync(publicDir, { recursive: true });
              fs.mkdirSync(assetsDir, { recursive: true });
              if (fs.existsSync(path.resolve(rootDir, 'dist'))) {
                fs.mkdirSync(distImagesDir, { recursive: true });
                fs.writeFileSync(path.resolve(distImagesDir, filename), buffer);
              }

              const publicPath = path.resolve(publicDir, filename);
              const assetsPath = path.resolve(assetsDir, filename);

              fs.writeFileSync(publicPath, buffer);
              fs.writeFileSync(assetsPath, buffer);

              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({
                success: true,
                url: `/images/${filename}?t=${Date.now()}`
              }));
            } catch (err: any) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ error: err.message }));
            }
          });
        } else {
          res.statusCode = 405;
          res.end('Method Not Allowed');
        }
      });
    },
  };
}

export default defineConfig(() => {
  const rootDir = import.meta.dirname || process.cwd();
  return {
    plugins: [react(), tailwindcss(), appointmentsBackendPlugin(), officialPhotosPlugin()],
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
