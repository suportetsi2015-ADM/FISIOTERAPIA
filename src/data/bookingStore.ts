import { Appointment, ScheduleConfig, AppointmentStatus } from '../types';
import { CLINIC_INFO } from './content';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CONFIG_STORAGE_KEY = 'dra_leia_schedule_config_v1';
const APPOINTMENTS_STORAGE_KEY = 'dra_leia_appointments_v1';

export const DEFAULT_SCHEDULE_CONFIG: ScheduleConfig = {
  activeDays: [1, 2, 3, 4, 5, 6], // Seg a Sáb
  availableSlots: [
    '07:00',
    '08:00',
    '09:00',
    '10:00',
    '11:00',
    '14:00',
    '15:00',
    '16:00',
    '17:00',
    '18:00'
  ],
  sessionDurationMinutes: 50,
  maxPatientsPerSlot: 1,
  blockedDates: []
};

// Seed realistic initial appointments for Manaus-AM studio demonstration
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

export function getScheduleConfig(): ScheduleConfig {
  try {
    const saved = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error('Erro ao ler configurações da agenda:', err);
  }
  return DEFAULT_SCHEDULE_CONFIG;
}

export function saveScheduleConfig(config: ScheduleConfig): void {
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Erro ao salvar configurações da agenda:', err);
  }
}

export function getAppointments(): Appointment[] {
  try {
    const saved = localStorage.getItem(APPOINTMENTS_STORAGE_KEY);
    if (saved) {
      const parsed: Appointment[] = JSON.parse(saved);
      // Garante que o agendamento de demonstração antigo não fique pendente
      const sanitized = parsed.map(apt => (apt.id === 'APT-1003' && apt.status === 'pendente' ? { ...apt, status: 'confirmado' as const } : apt));
      return sanitized;
    }
    // Seed if empty
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(INITIAL_SEED_APPOINTMENTS));
    return INITIAL_SEED_APPOINTMENTS;
  } catch (err) {
    console.error('Erro ao carregar agendamentos:', err);
    return INITIAL_SEED_APPOINTMENTS;
  }
}

export function saveAppointments(appointments: Appointment[]): void {
  try {
    localStorage.setItem(APPOINTMENTS_STORAGE_KEY, JSON.stringify(appointments));
  } catch (err) {
    console.error('Erro ao salvar agendamentos:', err);
  }
}

/**
 * Sincroniza a lista de agendamentos com o servidor global em segundo plano
 */
export async function syncAppointmentsWithServer(): Promise<Appointment[]> {
  if (typeof window === 'undefined') return getAppointments();
  try {
    const res = await fetch('/api/appointments', {
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const serverApts: Appointment[] = await res.json();
      if (Array.isArray(serverApts) && serverApts.length > 0) {
        saveAppointments(serverApts);
        window.dispatchEvent(new CustomEvent('appointments-synced', { detail: serverApts }));
        return serverApts;
      }
    }
  } catch (e) {
    // Falha silenciosa em caso de conexão fraca
  }
  return getAppointments();
}

export const PENDING_ALERT_STORAGE_KEY = 'dra_leia_pending_alert_real_v3';
export const LAST_ACKED_ALERT_KEY = 'dra_leia_last_acked_alert_id_v3';

// Endpoints de sincronização em nuvem para tráfego entre celulares, tablets e navegadores
const CLOUD_SYNC_PRIMARY = 'https://api.restful-api.dev/objects/ff808181a09d98f701a1159fed5b1388';
const CLOUD_SYNC_BACKUP = 'https://api.restful-api.dev/objects/ff808181a09d98f701a115a0dd5a138a';

function broadcastAlertToCloud(apt: Appointment | null, acknowledged: boolean): void {
  const payload = {
    name: 'dra_leia_alert',
    data: {
      appointment: apt,
      timestamp: Date.now(),
      acknowledged
    }
  };
  const body = JSON.stringify(payload);
  const headers = { 'Content-Type': 'application/json' };

  try {
    fetch(CLOUD_SYNC_PRIMARY, { method: 'PUT', headers, body }).catch(() => {});
    fetch(CLOUD_SYNC_BACKUP, { method: 'PUT', headers, body }).catch(() => {});
  } catch (_) {}
}

async function pollCloudAlerts(onFound: (apt: Appointment, ts: number) => void): Promise<void> {
  try {
    const res = await fetch(`${CLOUD_SYNC_PRIMARY}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.appointment && !json.data.acknowledged) {
        onFound(json.data.appointment, json.data.timestamp || Date.now());
        return;
      }
    }
  } catch (_) {}

  try {
    const res = await fetch(`${CLOUD_SYNC_BACKUP}?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache, no-store' }
    });
    if (res.ok) {
      const json = await res.json();
      if (json?.data?.appointment && !json.data.acknowledged) {
        onFound(json.data.appointment, json.data.timestamp || Date.now());
      }
    }
  } catch (_) {}
}

const alertSubscribers = new Set<(apt: Appointment) => void>();
let activePollingInterval: number | null = null;
let lastKnownAlertId: string | null = null;
let activeEventSource: EventSource | null = null;
let broadcastChannel: BroadcastChannel | null = null;

function getBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    if (!broadcastChannel) {
      try {
        broadcastChannel = new BroadcastChannel('dra_leia_cross_device_alerts');
      } catch (_) {}
    }
    return broadcastChannel;
  }
  return null;
}

/**
 * Inicia monitoramento contínuo em tempo real via nuvem e servidor (a cada 2.5s e via SSE instantâneo)
 * Detecta novos cadastros feitos por QUALQUER dispositivo externo (celulares, tablets, outros PCs)
 */
export function startCrossDeviceAlertPolling(onNewBooking?: (apt: Appointment) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  if (onNewBooking) {
    alertSubscribers.add(onNewBooking);
  }

  // Executa sincronização inicial com o servidor
  syncAppointmentsWithServer().catch(() => {});

  const channel = getBroadcastChannel();

  const triggerAlert = (alertApt: Appointment, timestamp: number = Date.now()) => {
    const ackedId = localStorage.getItem(LAST_ACKED_ALERT_KEY);
    if (alertApt.status === 'pendente' && alertApt.id !== ackedId && alertApt.id !== lastKnownAlertId) {
      lastKnownAlertId = alertApt.id;
      const alertPayload = JSON.stringify({
        id: alertApt.id,
        appointment: alertApt,
        timestamp
      });
      localStorage.setItem(PENDING_ALERT_STORAGE_KEY, alertPayload);

      // Garante que o agendamento externo também exista na lista local da clínica
      const currentApts = getAppointments();
      if (!currentApts.some((a) => a.id === alertApt.id)) {
        saveAppointments([alertApt, ...currentApts]);
        window.dispatchEvent(new CustomEvent('appointments-synced', { detail: [alertApt, ...currentApts] }));
      }

      // Dispara evento global para toda a plataforma e todos os ouvintes inscritos
      window.dispatchEvent(new CustomEvent('new-online-booking', { detail: alertApt }));
      alertSubscribers.forEach((cb) => {
        try {
          cb(alertApt);
        } catch (_) {}
      });
    }
  };

  // Ouvinte de BroadcastChannel entre abas
  if (channel && !channel.onmessage) {
    channel.onmessage = (msgEvt) => {
      const data = msgEvt.data;
      if (data?.type === 'new-booking' && data.appointment) {
        triggerAlert(data.appointment, data.timestamp || Date.now());
      } else if (data?.type === 'ack-alert' && data.id) {
        window.dispatchEvent(new CustomEvent('alert-silenced', { detail: { id: data.id } }));
      }
    };
  }

  // 1. Conexão Server-Sent Events (SSE) para alerta instantâneo com 0ms de atraso
  if (!activeEventSource && typeof EventSource !== 'undefined') {
    try {
      activeEventSource = new EventSource('/api/appointments/stream');
      activeEventSource.onmessage = (e) => {
        try {
          const payload = JSON.parse(e.data);
          if (payload.type === 'new-booking' && payload.appointment) {
            triggerAlert(payload.appointment, payload.alert?.timestamp || Date.now());
            syncAppointmentsWithServer().catch(() => {});
          } else if (payload.type === 'alert-acknowledged' && payload.alert?.appointment) {
            window.dispatchEvent(new CustomEvent('alert-silenced', { detail: payload.alert }));
          } else if (payload.type === 'appointments-updated' && Array.isArray(payload.appointments)) {
            saveAppointments(payload.appointments);
            window.dispatchEvent(new CustomEvent('appointments-synced', { detail: payload.appointments }));
          }
        } catch (_) {}
      };
      activeEventSource.onerror = () => {
        // SSE reconectará automaticamente, polling abaixo garante a entrega a cada 2.5s
      };
    } catch (_) {}
  }

  // 2. Polling redundante a cada 2,5 segundos via Nuvem e via Servidor
  const pollAllChannels = async () => {
    // 2.1 Polling da Nuvem (garante recepção de celulares mesmo em hospedagem estática/CDN)
    pollCloudAlerts(triggerAlert).catch(() => {});

    // 2.2 Polling do servidor local
    try {
      const res = await fetch('/api/appointments/poll?t=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache, no-store' }
      });
      if (res.ok) {
        const text = await res.text();
        if (text && text.trim().startsWith('{')) {
          const data = JSON.parse(text);
          if (data && Array.isArray(data.appointments)) {
            saveAppointments(data.appointments);
            window.dispatchEvent(new CustomEvent('appointments-synced', { detail: data.appointments }));

            if (data.latestAlert && data.latestAlert.appointment && !data.latestAlert.acknowledged) {
              const alertApt = data.latestAlert.appointment as Appointment;
              triggerAlert(alertApt, data.latestAlert.timestamp || Date.now());
            }
          }
        }
      }
    } catch (_) {
      // Ignora falhas de rede momentâneas
    }
  };

  // Garante que o intervalo contínuo de 2.5s rode em segundo plano como singleton
  if (!activePollingInterval) {
    pollAllChannels();
    activePollingInterval = window.setInterval(pollAllChannels, 2500);
  }

  return () => {
    if (onNewBooking) {
      alertSubscribers.delete(onNewBooking);
    }
  };
}

export function bookAppointment(params: {
  patientName: string;
  patientPhone: string;
  patientEmail?: string;
  date: string;
  timeSlot: string;
  service: string;
  notes?: string;
  status?: AppointmentStatus;
}): Appointment {
  const appointments = getAppointments();
  
  const newAppointment: Appointment = {
    id: `APT-${Math.floor(1000 + Math.random() * 9000)}`,
    patientName: params.patientName.trim(),
    patientPhone: params.patientPhone.trim(),
    patientEmail: params.patientEmail?.trim() || undefined,
    date: params.date,
    timeSlot: params.timeSlot,
    service: params.service,
    notes: params.notes?.trim() || undefined,
    status: params.status || 'pendente',
    createdAt: new Date().toISOString()
  };

  const updated = [newAppointment, ...appointments];
  saveAppointments(updated);

  // Armazena para notificação local e nuvem
  if (typeof window !== 'undefined') {
    try {
      const alertPayload = JSON.stringify({
        id: newAppointment.id,
        appointment: newAppointment,
        timestamp: Date.now()
      });
      localStorage.setItem(PENDING_ALERT_STORAGE_KEY, alertPayload);
      window.dispatchEvent(new CustomEvent('new-online-booking', { detail: newAppointment }));
      const channel = getBroadcastChannel();
      if (channel) {
        channel.postMessage({ type: 'new-booking', appointment: newAppointment, timestamp: Date.now() });
      }

      // TRANSMISSÃO PARA A NUVEM GLOBAL EM TEMPO REAL:
      // Garante chegada instantânea do celular para o computador da clínica
      broadcastAlertToCloud(newAppointment, false);
    } catch (e) {
      console.error(e);
    }

    // Transmissão complementar para o servidor Node local
    fetch('/api/appointments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store'
      },
      body: JSON.stringify(newAppointment)
    })
      .then(async (res) => {
        if (res.ok) {
          const data = await res.json();
          if (data && data.appointment) {
            syncAppointmentsWithServer().catch(() => {});
          }
        }
      })
      .catch((err) => {
        console.warn('[Sync] Agendamento gravado localmente, sincronizará em seguida:', err);
      });
  }

  return newAppointment;
}

/**
 * Retorna o agendamento pendente SOMENTE se houver uma nova marcação online real em andamento.
 * NUNCA toca por conta própria ou para agendamentos antigos do banco de dados!
 */
export function getPendingAlertAppointment(): Appointment | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const raw = localStorage.getItem(PENDING_ALERT_STORAGE_KEY);
    if (!raw) return null;

    let alertId = raw;
    let alertTime = 0;
    let cachedApt: Appointment | null = null;

    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.id) {
        alertId = parsed.id;
        alertTime = parsed.timestamp || 0;
        if (parsed.appointment) {
          cachedApt = parsed.appointment;
        }
      }
    } catch (_) {}

    // Se o alerta foi emitido há mais de 15 minutos, expira automaticamente para não tocar sozinho
    if (alertTime && Date.now() - alertTime > 15 * 60 * 1000) {
      localStorage.removeItem(PENDING_ALERT_STORAGE_KEY);
      return null;
    }

    const appointments = getAppointments();
    const match = appointments.find(a => a.id === alertId && a.status === 'pendente');
    if (match) return match;
    if (cachedApt && cachedApt.status === 'pendente') {
      return cachedApt;
    }

    // Se o agendamento já foi confirmado ou não existe, limpa a chave
    localStorage.removeItem(PENDING_ALERT_STORAGE_KEY);
  } catch (e) {
    console.error(e);
  }

  return null;
}

export function dismissPendingAlertAppointment(id?: string): void {
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(PENDING_ALERT_STORAGE_KEY);
      let alertId = id;
      if (!alertId && raw) {
        try {
          const parsed = JSON.parse(raw);
          if (parsed?.id) alertId = parsed.id;
        } catch (_) {}
      }

      if (alertId) {
        localStorage.setItem(LAST_ACKED_ALERT_KEY, alertId);
        const channel = getBroadcastChannel();
        if (channel) {
          channel.postMessage({ type: 'ack-alert', id: alertId });
        }
      }
      localStorage.removeItem(PENDING_ALERT_STORAGE_KEY);

      // Informa a nuvem e o servidor que o alerta foi silenciado/reconhecido
      broadcastAlertToCloud(null, true);
      fetch('/api/appointments/ack-alert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      }).catch(() => {});
    } catch (e) {}
  }
}

export function updateAppointmentStatus(id: string, newStatus: AppointmentStatus): Appointment[] {
  const appointments = getAppointments();
  const updated = appointments.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt));
  saveAppointments(updated);

  if (typeof window !== 'undefined') {
    if (newStatus === 'confirmado') {
      dismissPendingAlertAppointment(id);
    }

    // Atualiza no servidor para que todos os aparelhos externos vejam a alteração
    fetch(`/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus })
    }).catch(() => {});
  }

  return updated;
}

export function deleteAppointment(id: string): Appointment[] {
  const appointments = getAppointments();
  const updated = appointments.filter((apt) => apt.id !== id);
  saveAppointments(updated);

  if (typeof window !== 'undefined') {
    fetch(`/api/appointments/${id}`, {
      method: 'DELETE'
    }).catch(() => {});
  }

  return updated;
}

/**
 * Returns available slots for a specific date, filtering out booked slots
 */
export function getAvailableSlotsForDate(
  dateStr: string,
  config: ScheduleConfig,
  appointments: Appointment[]
): string[] {
  // Check if date is blocked
  if (config.blockedDates.includes(dateStr)) {
    return [];
  }

  // Check if day of week is active
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();

  if (!config.activeDays.includes(dayOfWeek)) {
    return [];
  }

  // Sábados podem ter apenas turno da manhã por padrão (ex: até 12:00)
  const isSaturday = dayOfWeek === 6;
  const baseSlots = isSaturday
    ? config.availableSlots.filter((s) => parseInt(s.split(':')[0], 10) < 13)
    : config.availableSlots;

  // Filter out slots that have already reached maxPatientsPerSlot
  return baseSlots.filter((slot) => {
    const bookedCount = appointments.filter(
      (apt) => apt.date === dateStr && apt.timeSlot === slot && apt.status !== 'cancelado'
    ).length;
    return bookedCount < config.maxPatientsPerSlot;
  });
}

// -------------------------------------------------------------
// RELATÓRIOS EM TEMPO REAL: EXCEL (XLS/XLSX) & PDF
// -------------------------------------------------------------

export function exportAppointmentsToXLS(appointments: Appointment[]): void {
  const rows = appointments.map((apt) => {
    const [year, month, day] = apt.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    const createdAtFormatted = new Date(apt.createdAt).toLocaleString('pt-BR');

    return {
      'Código': apt.id,
      'Data da Sessão': formattedDate,
      'Horário': apt.timeSlot,
      'Nome da Paciente': apt.patientName,
      'WhatsApp': apt.patientPhone,
      'E-mail': apt.patientEmail || '-',
      'Serviço / Objetivo': apt.service,
      'Status': apt.status.toUpperCase(),
      'Observações / Queixas': apt.notes || '-',
      'Data de Agendamento': createdAtFormatted
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Column width auto-fit
  worksheet['!cols'] = [
    { wch: 12 }, // Código
    { wch: 15 }, // Data
    { wch: 10 }, // Horário
    { wch: 28 }, // Nome
    { wch: 18 }, // WhatsApp
    { wch: 25 }, // E-mail
    { wch: 35 }, // Serviço
    { wch: 15 }, // Status
    { wch: 40 }, // Observações
    { wch: 20 }  // Criado em
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Agendamentos');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Relatorio_Agendamentos_Dra_Leia_Mar_${todayStr}.xlsx`);
}

export function exportAppointmentsToPDF(appointments: Appointment[]): void {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Header background banner (refined warm rose-wine / terracotta palette)
  doc.setFillColor(140, 59, 80); // #8C3B50 warm feminine wine/rose
  doc.rect(0, 0, 297, 26, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 18);
  doc.text(`Endereço: ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState} (${CLINIC_INFO.landmarks})`, 14, 23);

  // Subtitle / Report info
  doc.setTextColor(45, 30, 35);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Oficial de Agendamentos em Tempo Real', 14, 34);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 95);
  doc.text(`Emitido em: ${today}  |  Total de Registros: ${appointments.length}`, 14, 40);

  // Summary counts
  const confirmados = appointments.filter((a) => a.status === 'confirmado').length;
  const pendentes = appointments.filter((a) => a.status === 'pendente').length;
  const concluidos = appointments.filter((a) => a.status === 'concluido').length;
  const cancelados = appointments.filter((a) => a.status === 'cancelado').length;

  doc.setFontSize(8.5);
  doc.text(
    `Resumo: Confirmados (${confirmados})  •  Pendentes (${pendentes})  •  Concluídos (${concluidos})  •  Cancelados (${cancelados})`,
    14,
    46
  );

  // Table rows
  const tableData = appointments.map((apt) => {
    const [year, month, day] = apt.date.split('-');
    const formattedDate = `${day}/${month}/${year}`;
    return [
      apt.id,
      formattedDate,
      apt.timeSlot,
      apt.patientName,
      apt.patientPhone,
      apt.service,
      apt.status.toUpperCase(),
      apt.notes || '-'
    ];
  });

  autoTable(doc, {
    startY: 50,
    head: [['Cód', 'Data', 'Horário', 'Paciente', 'WhatsApp', 'Objetivo / Serviço', 'Status', 'Observações']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [40, 30, 35]
    },
    columnStyles: {
      0: { cellWidth: 16 },
      1: { cellWidth: 20 },
      2: { cellWidth: 16 },
      3: { cellWidth: 42 },
      4: { cellWidth: 28 },
      5: { cellWidth: 55 },
      6: { cellWidth: 24 },
      7: { cellWidth: 68 }
    },
    alternateRowStyles: {
      fillColor: [253, 246, 244]
    }
  });

  // Footer note
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 130, 135);
    doc.text(
      `Estúdio de Pilates Dra. Léia Mar • Manaus-AM • Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 7
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Relatorio_Agendamentos_Dra_Leia_Mar_${todayStr}.pdf`);
}

// -------------------------------------------------------------
// EXPORTAÇÃO DE HORÁRIOS & BLOQUEIOS (XLS & PDF)
// -------------------------------------------------------------

export function exportScheduleToXLS(config: ScheduleConfig): void {
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  
  // Sheet 1: Dias e Horários de Atendimento
  const slotsRows = config.availableSlots.map((slot) => {
    return {
      'Horário': slot,
      'Capacidade Máx / Horário': `${config.maxPatientsPerSlot} alunos`,
      'Dias Ativos na Semana': config.activeDays.map(d => dayNames[d]).join(', ')
    };
  });

  // Sheet 2: Datas Bloqueadas
  const blockedRows = config.blockedDates.map((dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return {
      'Data Bloqueada': `${day}/${month}/${year}`,
      'Status': 'INDISPONÍVEL PARA AGENDAMENTO',
      'Motivo / Tipo': 'Bloqueio Gerencial / Feriado / Férias'
    };
  });

  const workbook = XLSX.utils.book_new();
  const wsSlots = XLSX.utils.json_to_sheet(slotsRows.length ? slotsRows : [{ 'Aviso': 'Nenhum horário configurado' }]);
  const wsBlocked = XLSX.utils.json_to_sheet(blockedRows.length ? blockedRows : [{ 'Aviso': 'Nenhuma data bloqueada' }]);

  XLSX.utils.book_append_sheet(workbook, wsSlots, 'Grade de Horarios');
  XLSX.utils.book_append_sheet(workbook, wsBlocked, 'Datas Bloqueadas');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Grade_Horarios_Bloqueios_Dra_Leia_Mar_${todayStr}.xlsx`);
}

export function exportScheduleToPDF(config: ScheduleConfig): void {
  const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Header background banner
  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 17);
  doc.text(`${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 14, 21);

  // Subtitle
  doc.setTextColor(45, 30, 35);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Configuração Oficial de Horários de Aulas & Datas Bloqueadas', 14, 32);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 95);
  doc.text(`Emitido em: ${today}`, 14, 37);

  // Section 1: Active Days
  const activeDaysStr = config.activeDays.map(d => dayNames[d]).join(', ');
  doc.setFontSize(9);
  doc.setTextColor(140, 59, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('1. DIAS DE ATENDIMENTO NA SEMANA', 14, 45);

  doc.setFontSize(8.5);
  doc.setTextColor(50, 40, 45);
  doc.setFont('helvetica', 'normal');
  doc.text(activeDaysStr || 'Nenhum dia ativo configurado.', 14, 50);

  // Section 2: Time Slots Table
  const slotsTable = config.availableSlots.map(s => [s, `${config.maxPatientsPerSlot} alunos simultâneos`, 'Ativo']);
  autoTable(doc, {
    startY: 55,
    head: [['Horário da Aula', 'Capacidade Máxima', 'Status']],
    body: slotsTable,
    theme: 'striped',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: { fontSize: 8, cellPadding: 2 }
  });

  const finalY = (doc as any).lastAutoTable?.finalY || 120;

  // Section 3: Blocked Dates
  doc.setFontSize(9);
  doc.setTextColor(140, 59, 80);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DATAS COM BLOQUEIO DE ATENDIMENTO (FERIADOS / RECESSO)', 14, finalY + 10);

  const blockedTable = config.blockedDates.map(d => {
    const [year, month, day] = d.split('-');
    return [`${day}/${month}/${year}`, 'Bloqueado para agendamentos', 'Feriado / Recesso'];
  });

  autoTable(doc, {
    startY: finalY + 14,
    head: [['Data Bloqueada', 'Condição', 'Observação']],
    body: blockedTable.length ? blockedTable : [['Nenhuma data bloqueada no momento', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [188, 56, 89],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    styles: { fontSize: 8, cellPadding: 2 }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Grade_Horarios_Bloqueios_Dra_Leia_Mar_${todayStr}.pdf`);
}
