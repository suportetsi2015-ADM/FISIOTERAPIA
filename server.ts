import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { handleAppointmentsApi, broadcastSSE } from './src/server/appointmentsApi';
import { handleAdminSyncApi } from './src/server/adminSyncApi';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // 1. Parser de JSON e URL Encoded para requisições de API
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // 2. Headers globais de CORS e anti-cache para garantir sincronização entre celulares e computadores
  app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    // Headers anti-cache para rotas de dados e HTML
    if (req.url.startsWith('/api') || req.url === '/' || req.url.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
    next();
  });

  // 2.1 Servir imagens estáticas da pasta public/images com anti-cache para garantir a entrega das fotos originais
  const publicImagesDir = path.resolve(__dirname, 'public/images');
  app.use('/images', express.static(publicImagesDir, {
    setHeaders: (res) => {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }));

  // 3. Rota especializada para salvar fotos oficiais
  app.post('/api/save-official-photo', (req, res) => {
    try {
      const { type, dataUrl } = req.body;
      if (!dataUrl) {
        res.status(400).json({ error: 'Nenhum dado de imagem fornecido' });
        return;
      }
      const matches = dataUrl.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (!matches) {
        res.status(400).json({ error: 'Formato de imagem inválido' });
        return;
      }
      const buffer = Buffer.from(matches[2], 'base64');
      const filename =
        type === 'logo'
          ? 'logo.png'
          : type === 'principal' || type === 'studioHero' || type === 'hero'
          ? 'dra_leia_principal.jpg'
          : 'dra_leia_sobre.jpg';

      const publicDir = path.resolve(__dirname, 'public/images');
      const assetsDir = path.resolve(__dirname, 'src/assets/images');
      const distImagesDir = path.resolve(__dirname, 'dist/images');

      fs.mkdirSync(publicDir, { recursive: true });
      fs.mkdirSync(assetsDir, { recursive: true });
      if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
        fs.mkdirSync(distImagesDir, { recursive: true });
        fs.writeFileSync(path.resolve(distImagesDir, filename), buffer);
      }

      fs.writeFileSync(path.resolve(publicDir, filename), buffer);
      fs.writeFileSync(path.resolve(assetsDir, filename), buffer);

      const photoUrl = `/images/${filename}?t=${Date.now()}`;
      broadcastSSE({
        type: 'admin-config-updated',
        entity: 'official_photo',
        data: { type, url: photoUrl },
        timestamp: Date.now()
      });

      res.json({
        success: true,
        url: photoUrl
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Delegador para rotas de agendamentos, alertas e sincronização de configurações do Administrador em tempo real
  app.use(async (req, res, next) => {
    if (
      req.url.startsWith('/api/appointments') ||
      req.url.startsWith('/api/schedule-config') ||
      req.url === '/api/health'
    ) {
      try {
        const handled = await handleAppointmentsApi(req, res);
        if (handled) return;
      } catch (err) {
        console.error('[API Server] Erro ao processar rota de agendamentos:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro interno ao processar agendamento' });
        }
        return;
      }
    }

    // 4.1 Rotas de Sincronização em Tempo Real do Administrador (Multi-dispositivos)
    if (
      req.url.startsWith('/api/clinic-data') ||
      req.url.startsWith('/api/schedule-config') ||
      req.url.startsWith('/api/pilates-data') ||
      req.url.startsWith('/api/clinical-patients') ||
      req.url.startsWith('/api/payroll-adjustments') ||
      req.url.startsWith('/api/faq-data') ||
      req.url.startsWith('/api/header-data') ||
      req.url.startsWith('/api/footer-data') ||
      req.url.startsWith('/api/studio-data') ||
      req.url.startsWith('/api/auth-passwords')
    ) {
      try {
        const handledAdmin = await handleAdminSyncApi(req, res);
        if (handledAdmin) return;
      } catch (err) {
        console.error('[API Server] Erro ao processar sincronização de administrador:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Erro interno ao sincronizar configurações' });
        }
        return;
      }
    }
    next();
  });

  // 5. Servir arquivos estáticos ou middleware do Vite conforme ambiente
  const distDir = path.resolve(__dirname, 'dist');
  const hasDist = fs.existsSync(distDir) && fs.existsSync(path.resolve(distDir, 'index.html'));

  if (isProd || (hasDist && process.env.VITE_DEV !== 'true')) {
    console.log('[Server] Modo Produção: servindo arquivos estáticos de', distDir);
    app.use(
      express.static(distDir, {
        setHeaders: (res, filePath) => {
          // Arquivos HTML nunca devem ficar em cache no navegador
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
            res.setHeader('Pragma', 'no-cache');
            res.setHeader('Expires', '0');
          }
        }
      })
    );

    // Fallback SPA
    app.use((req, res, next) => {
      if (req.method !== 'GET') return next();
      if (req.url.startsWith('/api')) return next();
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  } else {
    console.log('[Server] Modo Desenvolvimento: inicializando middlewares Vite...');
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Dra. Léia Mar Server] Servidor Full-Stack rodando na porta ${PORT} (0.0.0.0:${PORT})`);
    console.log(`[Dra. Léia Mar Server] Alertas em tempo real monitorando na rota /api/appointments/poll e /api/appointments/stream`);
  });
}

startServer().catch((err) => {
  console.error('[Dra. Léia Mar Server] Falha fatal ao iniciar servidor:', err);
  process.exit(1);
});
