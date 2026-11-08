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

  // 3. Rotas especializadas para gerenciamento e sincronização de fotos oficiais em tempo real
  const PHOTOS_CONFIG_PATH = path.resolve(__dirname, 'data/official_photos.json');

  function getOfficialPhotosConfig() {
    try {
      if (fs.existsSync(PHOTOS_CONFIG_PATH)) {
        return JSON.parse(fs.readFileSync(PHOTOS_CONFIG_PATH, 'utf-8'));
      }
    } catch (_) {}
    return {
      studioHero: '/images/dra_leia_principal.jpg',
      portrait: '/images/dra_leia_sobre.jpg',
      customLogo: '/images/logo_transparente.png',
      heroUpdatedAt: Date.now(),
      portraitUpdatedAt: Date.now(),
      logoUpdatedAt: Date.now()
    };
  }

  function saveOfficialPhotosConfig(config: any) {
    try {
      const dataDir = path.resolve(__dirname, 'data');
      if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
      fs.writeFileSync(PHOTOS_CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8');
    } catch (e) {
      console.error('[OfficialPhotos] Erro ao gravar config:', e);
    }
  }

  // 3.1 Consulta de fotos oficiais atuais (usada por qualquer navegador ao carregar a página)
  app.get('/api/official-photos', (req, res) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    const config = getOfficialPhotosConfig();
    res.json({
      success: true,
      data: config
    });
  });

  // 3.2 Salvar / Atualizar foto oficial (suporta Base64 de arquivo e URL externa)
  app.post('/api/save-official-photo', (req, res) => {
    try {
      const { type, dataUrl } = req.body;
      if (!dataUrl || typeof dataUrl !== 'string') {
        res.status(400).json({ error: 'Nenhum dado ou URL de imagem fornecido' });
        return;
      }

      const config = getOfficialPhotosConfig();
      let photoUrl = '';
      const now = Date.now();

      // Caso 1: Imagem Base64 enviada por upload de arquivo
      if (dataUrl.startsWith('data:')) {
        const base64Index = dataUrl.indexOf(';base64,');
        if (base64Index === -1) {
          res.status(400).json({ error: 'Formato Base64 inválido (marcador ;base64, não encontrado)' });
          return;
        }
        const rawBase64 = dataUrl.slice(base64Index + 8).trim();
        const buffer = Buffer.from(rawBase64, 'base64');

        const baseName =
          type === 'logo' || type === 'customLogo'
            ? 'logo_oficial'
            : type === 'principal' || type === 'studioHero' || type === 'hero'
            ? 'dra_leia_principal'
            : 'dra_leia_sobre';

        const ext = type === 'logo' || type === 'customLogo' ? '.png' : '.jpg';
        const filename = `${baseName}${ext}`;
        const uniqueFilename = `${baseName}_${now}${ext}`;

        const publicDir = path.resolve(__dirname, 'public/images');
        const assetsDir = path.resolve(__dirname, 'src/assets/images');
        const distImagesDir = path.resolve(__dirname, 'dist/images');

        fs.mkdirSync(publicDir, { recursive: true });
        fs.mkdirSync(assetsDir, { recursive: true });
        if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
          fs.mkdirSync(distImagesDir, { recursive: true });
          fs.writeFileSync(path.resolve(distImagesDir, filename), buffer);
          fs.writeFileSync(path.resolve(distImagesDir, uniqueFilename), buffer);
        }

        // Grava tanto o nome fixo quanto o nome único versionado
        fs.writeFileSync(path.resolve(publicDir, filename), buffer);
        fs.writeFileSync(path.resolve(publicDir, uniqueFilename), buffer);
        fs.writeFileSync(path.resolve(assetsDir, filename), buffer);

        // Se for logo, também atualiza logo.png para retrocompatibilidade
        if (baseName === 'logo_oficial') {
          fs.writeFileSync(path.resolve(publicDir, 'logo.png'), buffer);
        }

        // A URL única garante que NENHUM navegador ou celular use cache antigo
        photoUrl = `/images/${uniqueFilename}`;
      } else {
        // Caso 2: URL direta informada pelo administrador
        photoUrl = dataUrl.trim();
      }

      // Atualiza o registro canônico
      if (type === 'studioHero' || type === 'hero' || type === 'principal') {
        config.studioHero = photoUrl;
        config.heroUpdatedAt = now;
      } else if (type === 'portrait' || type === 'sobre') {
        config.portrait = photoUrl;
        config.portraitUpdatedAt = now;
      } else if (type === 'logo' || type === 'customLogo') {
        config.customLogo = photoUrl;
        config.logoUpdatedAt = now;
      }

      saveOfficialPhotosConfig(config);

      // Transmissão Server-Sent Events para atualizar todos os navegadores e celulares abertos
      broadcastSSE({
        type: 'admin-config-updated',
        entity: 'official_photos',
        data: { type, url: photoUrl, photos: config },
        timestamp: now
      });
      broadcastSSE({
        type: 'admin-config-updated',
        entity: 'official_photo',
        data: { type, url: photoUrl, photos: config },
        timestamp: now
      });

      res.json({
        success: true,
        url: photoUrl,
        photos: config
      });
    } catch (err: any) {
      console.error('[OfficialPhotos] Erro no upload:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // 3.3 Restaurar foto para o padrão original
  app.post('/api/reset-official-photo', (req, res) => {
    try {
      const { type } = req.body || {};
      const config = getOfficialPhotosConfig();
      const now = Date.now();

      if (!type || type === 'studioHero' || type === 'hero' || type === 'principal') {
        config.studioHero = `/images/dra_leia_principal.jpg?t=${now}`;
        config.heroUpdatedAt = now;
      }
      if (!type || type === 'portrait' || type === 'sobre') {
        config.portrait = `/images/dra_leia_sobre.jpg?t=${now}`;
        config.portraitUpdatedAt = now;
      }
      if (!type || type === 'logo' || type === 'customLogo') {
        config.customLogo = `/images/logo_transparente.png?t=${now}`;
        config.logoUpdatedAt = now;
      }

      saveOfficialPhotosConfig(config);

      broadcastSSE({
        type: 'admin-config-updated',
        entity: 'official_photos',
        data: { type: type || 'all', photos: config },
        timestamp: now
      });
      broadcastSSE({
        type: 'admin-config-updated',
        entity: 'official_photo',
        data: { type: type || 'all', photos: config },
        timestamp: now
      });

      res.json({ success: true, photos: config });
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
      req.url.startsWith('/api/auth-passwords') ||
      req.url.startsWith('/api/theme-data') ||
      req.url.startsWith('/api/security-alerts')
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

  // 4.2 Rota externa independente e dedicada para o Painel do Administrador (/admin)
  app.get(['/admin', '/admin/'], (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    if (isProd || (hasDist && process.env.VITE_DEV !== 'true')) {
      const adminFile = path.resolve(distDir, 'admin.html');
      if (fs.existsSync(adminFile)) {
        res.sendFile(adminFile);
        return;
      }
    } else {
      req.url = '/admin.html';
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
