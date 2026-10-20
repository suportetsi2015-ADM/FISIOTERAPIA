import fs from 'fs';
import path from 'path';
import { broadcastSSE } from './appointmentsApi.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getFilePath(entity: string): string {
  ensureDataDir();
  return path.resolve(DATA_DIR, `${entity}.json`);
}

function readEntity<T>(entity: string): T | null {
  try {
    const file = getFilePath(entity);
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[AdminSync] Erro ao ler ${entity}:`, err);
  }
  return null;
}

function writeEntity<T>(entity: string, data: T): boolean {
  try {
    const file = getFilePath(entity);
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
    // Transmite a alteração em tempo real via Server-Sent Events (SSE) para todos os celulares e computadores
    broadcastSSE({
      type: 'admin-config-updated',
      entity,
      data,
      timestamp: Date.now()
    });
    return true;
  } catch (err) {
    console.error(`[AdminSync] Erro ao gravar ${entity}:`, err);
    return false;
  }
}

function readRequestBody(req: any): Promise<any> {
  if (req.body && typeof req.body === 'object') {
    return Promise.resolve(req.body);
  }
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf-8');
        resolve(bodyStr ? JSON.parse(bodyStr) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', (err: any) => reject(err));
  });
}

function sendJson(res: any, statusCode: number, data: any): void {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.end(JSON.stringify(data));
}

/**
 * Rotas para sincronização em tempo real de todas as configurações do ADMINISTRADOR:
 * /api/clinic-data
 * /api/schedule-config
 * /api/pilates-data
 * /api/clinical-patients
 * /api/payroll-adjustments
 * /api/faq-data
 * /api/footer-data
 * /api/studio-data
 */
export async function handleAdminSyncApi(req: any, res: any): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';

  const routeEntityMap: Record<string, string> = {
    '/api/clinic-data': 'clinic_data',
    '/api/schedule-config': 'schedule_config',
    '/api/pilates-data': 'pilates_data',
    '/api/clinical-patients': 'clinical_patients',
    '/api/payroll-adjustments': 'payroll_adjustments',
    '/api/faq-data': 'faq_data',
    '/api/header-data': 'header_data',
    '/api/footer-data': 'footer_data',
    '/api/studio-data': 'studio_data',
    '/api/auth-passwords': 'auth_passwords'
  };

  for (const [routePrefix, entityName] of Object.entries(routeEntityMap)) {
    if (url === routePrefix || url.startsWith(`${routePrefix}?`)) {
      if (method === 'GET') {
        const data = readEntity(entityName);
        sendJson(res, 200, { success: true, data });
        return true;
      }
      if (method === 'POST' || method === 'PUT') {
        const body = await readRequestBody(req);
        const payloadToSave = body.data !== undefined ? body.data : body;
        const ok = writeEntity(entityName, payloadToSave);
        sendJson(res, ok ? 200 : 500, { success: ok, data: payloadToSave });
        return true;
      }
      if (method === 'DELETE') {
        const file = getFilePath(entityName);
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
        broadcastSSE({
          type: 'admin-config-updated',
          entity: entityName,
          data: null,
          timestamp: Date.now()
        });
        sendJson(res, 200, { success: true, data: null });
        return true;
      }
    }
  }

  return false;
}
