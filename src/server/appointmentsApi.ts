import fs from 'fs';
import path from 'path';
import { Appointment, ScheduleConfig } from '../types.ts';
import { formatPhoneBR } from '../utils/phoneFormatter.ts';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const APPOINTMENTS_FILE = path.resolve(DATA_DIR, 'appointments.json');
const SCHEDULE_CONFIG_FILE = path.resolve(DATA_DIR, 'schedule_config.json');
const LATEST_ALERT_FILE = path.resolve(DATA_DIR, 'latest_alert.json');

const INITIAL_SEED_APPOINTMENTS: Appointment[] = [
  {
    id: 'APT-1001',
    patientName: 'Camila Vasconcelos',
    patientPhone: '(92) 99123-4567',
    patientEmail: 'camila.vasconcelos@gmail.com',
    date: '2026-09-22',
    timeSlot: '08:00',
    service: 'Avaliação Fisioterapêutica & Pilates',
    notes: 'Dores lombares crônicas por trabalho em escritório na Cidade Nova.',
    status: 'confirmado',
    createdAt: '2026-09-18T14:30:00.000Z'
  },
  {
    id: 'APT-1002',
    patientName: 'Juliana Barreto Mendes',
    patientPhone: '(92) 98455-8920',
    patientEmail: 'juliana.mendes@hotmail.com',
    date: '2026-09-22',
    timeSlot: '09:00',
    service: 'Pilates Personalizado',
    notes: 'Fortalecimento postural e alívio de tensões nos ombros.',
    status: 'confirmado',
    createdAt: '2026-09-19T09:15:00.000Z'
  },
  {
    id: 'APT-1003',
    patientName: 'Larissa Albuquerque',
    patientPhone: '(92) 98112-3344',
    date: '2026-09-23',
    timeSlot: '15:00',
    service: 'Reabilitação do Movimento & Coluna',
    notes: 'Hérnia de disco L4-L5, indicação médica para estabilização.',
    status: 'confirmado',
    createdAt: '2026-09-19T10:45:00.000Z'
  },
  {
    id: 'APT-1004',
    patientName: 'Beatriz Fontes Nogueira',
    patientPhone: '(92) 99341-7788',
    patientEmail: 'beatriz.fontes@yahoo.com.br',
    date: '2026-09-23',
    timeSlot: '17:00',
    service: 'Pilates para Terceira Idade / Envelhecimento Ativo',
    notes: 'Melhora de equilíbrio e mobilidade geral.',
    status: 'confirmado',
    createdAt: '2026-09-19T11:00:00.000Z'
  }
];

export interface ServerAlertState {
  appointment: Appointment | null;
  timestamp: number;
  acknowledged: boolean;
}

// Conjunto de clientes conectados via Server-Sent Events (SSE) para alerta instantâneo
const sseClients = new Set<any>();

export function broadcastSSE(data: any): void {
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

export function loadAppointmentsFromDisk(): Appointment[] {
  ensureDataDir();
  try {
    if (fs.existsSync(APPOINTMENTS_FILE)) {
      const raw = fs.readFileSync(APPOINTMENTS_FILE, 'utf-8');
      const parsed: Appointment[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((apt) => ({
          ...apt,
          patientPhone: formatPhoneBR(apt.patientPhone)
        }));
      }
    }
  } catch (e) {
    console.error('[Server] Erro ao ler appointments.json:', e);
  }

  // Seed default if missing or invalid
  const formattedSeeds = INITIAL_SEED_APPOINTMENTS.map(apt => ({
    ...apt,
    patientPhone: formatPhoneBR(apt.patientPhone)
  }));
  saveAppointmentsToDisk(formattedSeeds);
  return formattedSeeds;
}

export function saveAppointmentsToDisk(apts: Appointment[]): void {
  ensureDataDir();
  try {
    const formatted = apts.map(apt => ({
      ...apt,
      patientPhone: formatPhoneBR(apt.patientPhone)
    }));
    fs.writeFileSync(APPOINTMENTS_FILE, JSON.stringify(formatted, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Server] Erro ao salvar appointments.json:', e);
  }
}

export function loadLatestAlertFromDisk(): ServerAlertState {
  ensureDataDir();
  try {
    if (fs.existsSync(LATEST_ALERT_FILE)) {
      const raw = fs.readFileSync(LATEST_ALERT_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('[Server] Erro ao ler latest_alert.json:', e);
  }
  return { appointment: null, timestamp: 0, acknowledged: true };
}

export function saveLatestAlertToDisk(alertState: ServerAlertState): void {
  ensureDataDir();
  try {
    fs.writeFileSync(LATEST_ALERT_FILE, JSON.stringify(alertState, null, 2), 'utf-8');
  } catch (e) {
    console.error('[Server] Erro ao salvar latest_alert.json:', e);
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
 * Middleware para responder todas as rotas /api/appointments e sincronização entre múltiplos dispositivos externos
 */
export async function handleAppointmentsApi(req: any, res: any): Promise<boolean> {
  const url = req.url || '';
  const method = req.method || 'GET';

  // Handle CORS preflight
  if (method === 'OPTIONS' && url.startsWith('/api/')) {
    sendJson(res, 204, {});
    return true;
  }

  // 1. Health check
  if (url === '/api/health') {
    sendJson(res, 200, { status: 'ok', time: Date.now() });
    return true;
  }

  // 1.1 SSE Stream para alerta instantâneo entre múltiplos navegadores e celulares
  if (url.startsWith('/api/appointments/stream')) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.flushHeaders?.();

    // Envia handshake inicial com estado atual
    const appointments = loadAppointmentsFromDisk();
    const latestAlert = loadLatestAlertFromDisk();
    res.write(`data: ${JSON.stringify({
      type: 'init',
      appointments,
      latestAlert: latestAlert.acknowledged ? null : latestAlert,
      serverTime: Date.now()
    })}\n\n`);

    sseClients.add(res);

    req.on('close', () => {
      sseClients.delete(res);
    });
    return true;
  }

  // 2. Polling rápido de alertas e novos agendamentos para celulares, tablets e computadores
  // GET /api/appointments/poll
  if (url.startsWith('/api/appointments/poll')) {
    if (method !== 'GET') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return true;
    }
    const appointments = loadAppointmentsFromDisk();
    const latestAlert = loadLatestAlertFromDisk();
    const pendingCount = appointments.filter((a) => a.status === 'pendente').length;

    sendJson(res, 200, {
      appointments,
      latestAlert: latestAlert.acknowledged ? null : latestAlert,
      pendingCount,
      serverTime: Date.now()
    });
    return true;
  }

  // 3. Reconhecer/Silenciar Alerta
  // POST /api/appointments/ack-alert
  if (url === '/api/appointments/ack-alert') {
    if (method !== 'POST') {
      sendJson(res, 405, { error: 'Method not allowed' });
      return true;
    }
    const currentAlert = loadLatestAlertFromDisk();
    currentAlert.acknowledged = true;
    saveLatestAlertToDisk(currentAlert);
    broadcastSSE({ type: 'alert-acknowledged', alert: currentAlert });
    sendJson(res, 200, { success: true, message: 'Alerta reconhecido com sucesso' });
    return true;
  }

  // 4. Listar e Criar Agendamentos
  // /api/appointments
  if (url === '/api/appointments' || url.startsWith('/api/appointments?')) {
    if (method === 'GET') {
      const appointments = loadAppointmentsFromDisk();
      sendJson(res, 200, appointments);
      return true;
    }

    if (method === 'POST') {
      try {
        const body = await readRequestBody(req);
        if (!body.patientName || !body.patientPhone) {
          sendJson(res, 400, { error: 'Nome e telefone são obrigatórios' });
          return true;
        }

        const appointments = loadAppointmentsFromDisk();
        const idToUse = body.id && typeof body.id === 'string' && body.id.trim()
          ? body.id.trim()
          : `APT-${Math.floor(1000 + Math.random() * 9000)}`;

        const existingIdx = appointments.findIndex((a) => a.id === idToUse);
        const newApt: Appointment = {
          id: idToUse,
          patientName: String(body.patientName).trim(),
          patientPhone: formatPhoneBR(String(body.patientPhone).trim()),
          patientEmail: body.patientEmail ? String(body.patientEmail).trim() : undefined,
          date: body.date || new Date().toISOString().split('T')[0],
          timeSlot: body.timeSlot || '09:00',
          service: body.service || 'Avaliação Fisioterapêutica & Pilates',
          notes: body.notes ? String(body.notes).trim() : undefined,
          status: body.status || 'pendente',
          createdAt: body.createdAt || new Date().toISOString()
        };

        let updated: Appointment[];
        if (existingIdx >= 0) {
          updated = [...appointments];
          updated[existingIdx] = newApt;
        } else {
          updated = [newApt, ...appointments];
        }
        saveAppointmentsToDisk(updated);

        // Se for um cadastro pendente real, ativa o alerta sonoro e visual global
        if (newApt.status === 'pendente') {
          const alertState: ServerAlertState = {
            appointment: newApt,
            timestamp: Date.now(),
            acknowledged: false
          };
          saveLatestAlertToDisk(alertState);
          broadcastSSE({ type: 'new-booking', appointment: newApt, alert: alertState });
        } else {
          broadcastSSE({ type: 'appointments-updated', appointments: updated });
        }

        sendJson(res, 201, { success: true, appointment: newApt });
        return true;
      } catch (err: any) {
        sendJson(res, 500, { error: err.message || 'Erro ao processar cadastro' });
        return true;
      }
    }

    // PUT via query ?id=xxx
    if (method === 'PUT') {
      const parsedUrl = new URL(url, 'http://localhost');
      const id = parsedUrl.searchParams.get('id');
      if (!id) {
        sendJson(res, 400, { error: 'ID do agendamento é obrigatório' });
        return true;
      }
      const body = await readRequestBody(req);
      const appointments = loadAppointmentsFromDisk();
      let updatedApt: Appointment | null = null;
      const nextList: Appointment[] = appointments.map((a) => {
        if (a.id === id) {
          const merged: Appointment = {
            ...a,
            ...body,
            ...(body.patientPhone ? { patientPhone: formatPhoneBR(body.patientPhone) } : {})
          };
          updatedApt = merged;
          return merged;
        }
        return a;
      });

      if (!updatedApt) {
        sendJson(res, 404, { error: 'Agendamento não encontrado' });
        return true;
      }

      saveAppointmentsToDisk(nextList);

      // Se o agendamento foi confirmado ou alterado, silencia alerta do mesmo ID
      const currentAlert = loadLatestAlertFromDisk();
      if (currentAlert.appointment?.id === id) {
        currentAlert.acknowledged = true;
        saveLatestAlertToDisk(currentAlert);
      }

      sendJson(res, 200, { success: true, appointment: updatedApt });
      return true;
    }

    // DELETE via query ?id=xxx
    if (method === 'DELETE') {
      const parsedUrl = new URL(url, 'http://localhost');
      const id = parsedUrl.searchParams.get('id');
      if (!id) {
        sendJson(res, 400, { error: 'ID do agendamento é obrigatório' });
        return true;
      }
      const appointments = loadAppointmentsFromDisk();
      const nextList = appointments.filter((a) => a.id !== id);
      saveAppointmentsToDisk(nextList);
      sendJson(res, 200, { success: true });
      return true;
    }
  }

  // 5. Atualização ou Exclusão por Path: /api/appointments/:id
  const idMatch = url.match(/^\/api\/appointments\/([A-Za-z0-9_-]+)/);
  if (idMatch) {
    const id = idMatch[1];
    if (method === 'PUT') {
      const body = await readRequestBody(req);
      const appointments = loadAppointmentsFromDisk();
      let updatedApt: Appointment | null = null;
      const nextList: Appointment[] = appointments.map((a) => {
        if (a.id === id) {
          const merged: Appointment = { ...a, ...body };
          updatedApt = merged;
          return merged;
        }
        return a;
      });

      if (!updatedApt) {
        sendJson(res, 404, { error: 'Agendamento não encontrado' });
        return true;
      }

      saveAppointmentsToDisk(nextList);

      const currentAlert = loadLatestAlertFromDisk();
      if (currentAlert.appointment?.id === id) {
        currentAlert.acknowledged = true;
        saveLatestAlertToDisk(currentAlert);
      }

      sendJson(res, 200, { success: true, appointment: updatedApt });
      return true;
    }

    if (method === 'DELETE') {
      const appointments = loadAppointmentsFromDisk();
      const nextList = appointments.filter((a) => a.id !== id);
      saveAppointmentsToDisk(nextList);
      sendJson(res, 200, { success: true });
      return true;
    }
  }

  // 6. Configuração da Agenda
  if (url === '/api/schedule-config' || url.startsWith('/api/schedule-config?')) {
    ensureDataDir();
    if (method === 'GET') {
      if (fs.existsSync(SCHEDULE_CONFIG_FILE)) {
        try {
          const cfg = JSON.parse(fs.readFileSync(SCHEDULE_CONFIG_FILE, 'utf-8'));
          sendJson(res, 200, cfg);
          return true;
        } catch (e) {}
      }
      sendJson(res, 200, null);
      return true;
    }

    if (method === 'POST') {
      const body = await readRequestBody(req);
      fs.writeFileSync(SCHEDULE_CONFIG_FILE, JSON.stringify(body, null, 2), 'utf-8');
      sendJson(res, 200, { success: true, config: body });
      return true;
    }
  }

  return false;
}
