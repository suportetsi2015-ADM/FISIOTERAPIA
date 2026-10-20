import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CLINIC_INFO } from './content';

// -------------------------------------------------------------
// HELPER: FORMATAÇÃO DE AULAS REALIZADAS
// (Exemplo do usuário: "5 aulas, 3 aulas, 1 aula, 0 aula e etc...")
// -------------------------------------------------------------
export function formatAulasRealizadas(count: number | undefined | null): string {
  const n = typeof count === 'number' && !isNaN(count) ? Math.max(0, Math.floor(count)) : 0;
  if (n === 0) return '0 aula';
  if (n === 1) return '1 aula';
  return `${n} aulas`;
}

import { formatCurrencyBRL } from '../utils/currencyFormatter.ts';
import { formatPhoneBR } from '../utils/phoneFormatter.ts';

export { formatCurrencyBRL };

// -------------------------------------------------------------
// TABELA DE SERVIÇO & PLANOS (MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL, AVULSO)
// Permite INSERIR / EDITAR / EXCLUIR valores, planos, modalidades, datas e horários
// -------------------------------------------------------------
export interface PilatesServiceItem {
  id: string;
  planCategory: 'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'AVULSO' | string;
  name: string;                // Nome do serviço/plano
  modality: string;            // Modalidade (ex: Pilates Clínico / Aparelhos, Solo, Gestante)
  totalValue: number;          // Valor total (R$)
  monthlyValue: number;        // Valor da mensalidade ou parcela (R$)
  gymPassPercentage: number;   // Taxa de repasse academia (padrão 50%)
  gymPassValue: number;        // Valor repasse academia (50%)
  suggestedProfPass: number;   // Repasse sugerido ao profissional
  classCountTotal: number;     // Quantidade total de aulas contratadas no pacote
  weeklyClasses: number;       // Aulas por semana (ex: 2x, 3x)
  daysOfWeek: string;          // Dias da semana (ex: "Segunda e Quarta", "Terça e Quinta", "Seg/Qua/Sex")
  schedules: string;           // Horários (ex: "Manhã: 07h às 11h | Tarde: 14h às 19h")
  validityDays: string;        // Validade/Vigência (ex: "30 dias", "90 dias", "180 dias", "365 dias")
  startDate?: string;          // Data de início da vigência
  endDate?: string;            // Data término / validade da promoção
  notes?: string;              // Observações, regras de reposição e benefícios
  active: boolean;             // Status ativo/inativo
  createdAt: string;
}

export const INITIAL_SERVICES: PilatesServiceItem[] = [
  {
    id: 'serv-001',
    planCategory: 'MENSAL',
    name: 'Pilates Aparelhos & Solo - 2x por Semana',
    modality: 'Pilates Clínico & Aparelhos (Reabilitação e Postura)',
    totalValue: 420.00,
    monthlyValue: 420.00,
    gymPassPercentage: 50,
    gymPassValue: 210.00,
    suggestedProfPass: 180.00,
    classCountTotal: 8,
    weeklyClasses: 2,
    daysOfWeek: 'Segunda e Quarta ou Terça e Quinta',
    schedules: 'Manhã: 07h às 11h | Tarde/Noite: 14h às 19h',
    validityDays: '30 dias (Mensal)',
    startDate: '2026-01-01',
    notes: 'Inclui avaliação biomecânica inicial e acompanhamento postural.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'serv-002',
    planCategory: 'MENSAL',
    name: 'Pilates Aparelhos & Solo - 3x por Semana',
    modality: 'Pilates Aparelhos & Solo (Condicionamento & Força)',
    totalValue: 580.00,
    monthlyValue: 580.00,
    gymPassPercentage: 50,
    gymPassValue: 290.00,
    suggestedProfPass: 240.00,
    classCountTotal: 12,
    weeklyClasses: 3,
    daysOfWeek: 'Segunda, Quarta e Sexta',
    schedules: 'Manhã: 07h às 11h | Tarde/Noite: 14h às 19h',
    validityDays: '30 dias (Mensal)',
    startDate: '2026-01-01',
    notes: 'Treinamento intensivo para fortalecimento global e alívio de dores crônicas.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'serv-003',
    planCategory: 'TRIMESTRAL',
    name: 'Pilates Clínico Fidelidade - 2x por Semana',
    modality: 'Pilates Clínico & Estabilidade Articular',
    totalValue: 1140.00,
    monthlyValue: 380.00,
    gymPassPercentage: 50,
    gymPassValue: 570.00,
    suggestedProfPass: 450.00,
    classCountTotal: 24,
    weeklyClasses: 2,
    daysOfWeek: 'Segunda e Quarta ou Terça e Quinta',
    schedules: '07h às 12h | 14h às 20h',
    validityDays: '90 dias (Trimestral em até 3x)',
    startDate: '2026-01-01',
    notes: 'Desconto de fidelidade trimestral com direito a 2 reposições justificadas.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'serv-004',
    planCategory: 'TRIMESTRAL',
    name: 'Pilates Clínico Fidelidade - 3x por Semana',
    modality: 'Pilates Aparelhos, Solo & Coluna',
    totalValue: 1560.00,
    monthlyValue: 520.00,
    gymPassPercentage: 50,
    gymPassValue: 780.00,
    suggestedProfPass: 620.00,
    classCountTotal: 36,
    weeklyClasses: 3,
    daysOfWeek: 'Segunda, Quarta e Sexta',
    schedules: '07h às 12h | 14h às 20h',
    validityDays: '90 dias (Trimestral em até 3x)',
    startDate: '2026-01-01',
    notes: 'Plano premium de recuperação e estabilidade com foco em hérnia de disco.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'serv-005',
    planCategory: 'SEMESTRAL',
    name: 'Pilates Reabilitação Integral - 2x por Semana',
    modality: 'Pilates Clínico & Reabilitação Funcional',
    totalValue: 2100.00,
    monthlyValue: 350.00,
    gymPassPercentage: 50,
    gymPassValue: 1050.00,
    suggestedProfPass: 850.00,
    classCountTotal: 48,
    weeklyClasses: 2,
    daysOfWeek: 'Segunda e Quarta ou Terça e Quinta',
    schedules: '07h às 12h | 14h às 20h',
    validityDays: '180 dias (Semestral em até 6x)',
    startDate: '2026-01-01',
    notes: 'Parcelamento em 6x sem juros no cartão ou recorrência.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'serv-006',
    planCategory: 'ANUAL',
    name: 'Pilates VIP Diamante - 2x por Semana',
    modality: 'Pilates Completo (Reformer, Cadillac, Chair, Barrel & Solo)',
    totalValue: 3840.00,
    monthlyValue: 320.00,
    gymPassPercentage: 50,
    gymPassValue: 1920.00,
    suggestedProfPass: 1550.00,
    classCountTotal: 96,
    weeklyClasses: 2,
    daysOfWeek: 'Segunda a Sexta (Grade flexível garantida)',
    schedules: '07h às 20h (Horários preferenciais)',
    validityDays: '365 dias (Anual em até 12x)',
    startDate: '2026-01-01',
    notes: 'Plano anual com maior economia, congelamento de até 30 dias em caso de férias.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'serv-007',
    planCategory: 'AVULSO',
    name: 'Sessão Individualizada / Avaliação Inicial',
    modality: 'Avaliação Postural & Biomecânica Individualizada',
    totalValue: 130.00,
    monthlyValue: 130.00,
    gymPassPercentage: 50,
    gymPassValue: 65.00,
    suggestedProfPass: 55.00,
    classCountTotal: 1,
    weeklyClasses: 1,
    daysOfWeek: 'A combinar com a instrutora',
    schedules: 'Horário reservado com exclusividade',
    validityDays: 'Uso imediato / até 15 dias',
    startDate: '2026-01-01',
    notes: 'Aula individual 100% personalizada com anamnese e diagnóstico postural.',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  }
];

export const PREDEFINED_PLANS = INITIAL_SERVICES;

// -------------------------------------------------------------
// CORPO CLÍNICO: PROFISSIONAIS
// -------------------------------------------------------------
export interface PilatesProfessional {
  id: string;
  name: string;
  roleTitle?: string;
  crefito?: string;
  phone?: string;
  active: boolean;
  createdAt: string;
}

export const INITIAL_PROFESSIONALS: PilatesProfessional[] = [
  {
    id: 'prof-001',
    name: 'Dra. Léia Mar',
    roleTitle: 'Fisioterapeuta Responsável & Instrutora',
    crefito: '12345-F',
    phone: '(92) 99123-4567',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  },
  {
    id: 'prof-002',
    name: 'Dra. Camila Torres',
    roleTitle: 'Fisioterapeuta & Instrutora de Pilates',
    crefito: '28410-F',
    phone: '(92) 98455-8822',
    active: true,
    createdAt: '2026-01-01T08:00:00.000Z'
  }
];

// -------------------------------------------------------------
// REGISTRO DE ALUNOS & TURMAS
// -------------------------------------------------------------
export interface PilatesClassRecord {
  id: string;
  professionalName: string;         // a) Nome do Profissional
  studentName: string;              // b) Nome do Aluno(a)
  studentPhone?: string;
  planType: string;                 // c) Tipo de plano contratado pelo aluno(a)
  totalPlanValue: number;           // d) Valor total do plano contratado
  monthlyInstallmentValue: number;  // e) Valor da mensalidade/parcelas
  gymPassPercentage: number;        // Taxa base academia (50%)
  gymPassValue: number;             // f) Valor de repasse para a academia (50%) do bruto
  professionalPassValue: number;    // g) Valor de repasse para os profissionais (definido manualmente)
  studentHourlyRate: number;        // h) Valor da hora de aula do aluno(a)
  weeklyClassHours?: number;        // legado
  totalClassHours: number;          // Total de horas contratadas
  attendedHours: number;            // c) AULAS REALIZADAS: quantidade de aulas realizadas pelo aluno(a) (ex: 5 aulas, 3 aulas, 1 aula, 0 aula)
  status: 'ativo' | 'concluido' | 'trancado';
  startDate: string;
  notes?: string;
  createdAt: string;
}

export const INITIAL_PILATES_RECORDS: PilatesClassRecord[] = [
  {
    id: 'pilates-001',
    professionalName: 'Dra. Léia Mar',
    studentName: 'Mariana Vasconcelos',
    studentPhone: '(92) 99123-4567',
    planType: 'Trimestral - 2x por semana',
    totalPlanValue: 1140.00,
    monthlyInstallmentValue: 380.00,
    gymPassPercentage: 50,
    gymPassValue: 570.00,
    professionalPassValue: 450.00,
    studentHourlyRate: 47.50,
    weeklyClassHours: 2,
    totalClassHours: 24,
    attendedHours: 5, // Exemplo: 5 aulas
    status: 'ativo',
    startDate: '2026-08-10',
    notes: 'Foco em fortalecimento do assoalho pélvico e lombar.',
    createdAt: '2026-08-10T10:00:00.000Z'
  },
  {
    id: 'pilates-002',
    professionalName: 'Dra. Léia Mar',
    studentName: 'Carla Beatriz Alencar',
    studentPhone: '(92) 98455-8822',
    planType: 'Mensal - 3x por semana',
    totalPlanValue: 580.00,
    monthlyInstallmentValue: 580.00,
    gymPassPercentage: 50,
    gymPassValue: 290.00,
    professionalPassValue: 240.00,
    studentHourlyRate: 48.33,
    weeklyClassHours: 3,
    totalClassHours: 12,
    attendedHours: 3, // Exemplo: 3 aulas
    status: 'ativo',
    startDate: '2026-09-01',
    notes: 'Alívio de tensão cervical e correção de hipercifose.',
    createdAt: '2026-09-01T09:30:00.000Z'
  },
  {
    id: 'pilates-003',
    professionalName: 'Dra. Léia Mar',
    studentName: 'Renata Frota Guimarães',
    studentPhone: '(92) 99341-9090',
    planType: 'Semestral - 2x por semana',
    totalPlanValue: 2100.00,
    monthlyInstallmentValue: 350.00,
    gymPassPercentage: 50,
    gymPassValue: 1050.00,
    professionalPassValue: 850.00,
    studentHourlyRate: 43.75,
    weeklyClassHours: 2,
    totalClassHours: 48,
    attendedHours: 1, // Exemplo: 1 aula
    status: 'ativo',
    startDate: '2026-07-05',
    notes: 'Reabilitação postural após cirurgia de joelho.',
    createdAt: '2026-07-05T14:15:00.000Z'
  },
  {
    id: 'pilates-004',
    professionalName: 'Dra. Camila Torres',
    studentName: 'Fernanda Lira Dias',
    studentPhone: '(92) 98112-3344',
    planType: 'Mensal - 2x por semana',
    totalPlanValue: 420.00,
    monthlyInstallmentValue: 420.00,
    gymPassPercentage: 50,
    gymPassValue: 210.00,
    professionalPassValue: 180.00,
    studentHourlyRate: 52.50,
    weeklyClassHours: 2,
    totalClassHours: 8,
    attendedHours: 8, // Exemplo: 8 aulas
    status: 'concluido',
    startDate: '2026-08-01',
    notes: 'Concluiu ciclo mensal com excelente ganho de flexibilidade.',
    createdAt: '2026-08-01T11:00:00.000Z'
  },
  {
    id: 'pilates-005',
    professionalName: 'Dra. Camila Torres',
    studentName: 'Juliana Paiva Melo',
    studentPhone: '(92) 99201-7788',
    planType: 'Trimestral - 2x por semana',
    totalPlanValue: 1140.00,
    monthlyInstallmentValue: 380.00,
    gymPassPercentage: 50,
    gymPassValue: 570.00,
    professionalPassValue: 450.00,
    studentHourlyRate: 47.50,
    weeklyClassHours: 2,
    totalClassHours: 24,
    attendedHours: 0, // Exemplo: 0 aula
    status: 'ativo',
    startDate: '2026-09-08',
    notes: 'Aluna recém-matriculada, iniciará a primeira aula na próxima semana.',
    createdAt: '2026-09-08T15:00:00.000Z'
  }
];

const STORAGE_KEY = 'dra_leia_pilates_classes_v2';
const PROFESSIONALS_STORAGE_KEY = 'dra_leia_pilates_professionals_v2';
const SERVICES_STORAGE_KEY = 'dra_leia_pilates_services_v2';

// -------------------------------------------------------------
// SERVICES STORE (TABELA DE SERVIÇO)
// -------------------------------------------------------------
export function getStoredPilatesServices(): PilatesServiceItem[] {
  try {
    const saved = localStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler tabela de serviços de pilates:', e);
  }
  return INITIAL_SERVICES;
}

function syncPilatesDataToServer(): void {
  if (typeof window === 'undefined') return;
  try {
    const payload = {
      services: getStoredPilatesServices(),
      professionals: getStoredProfessionals(),
      classes: getStoredPilatesClasses()
    };
    fetch('/api/pilates-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  } catch (_) {}
}

export function saveStoredPilatesServices(services: PilatesServiceItem[]): void {
  try {
    localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    window.dispatchEvent(new Event('dra_leia_pilates_services_updated'));
    syncPilatesDataToServer();
  } catch (e) {
    console.error('Erro ao salvar tabela de serviços de pilates:', e);
  }
}

export function resetStoredPilatesServices(): PilatesServiceItem[] {
  try {
    localStorage.removeItem(SERVICES_STORAGE_KEY);
    window.dispatchEvent(new Event('dra_leia_pilates_services_updated'));
    syncPilatesDataToServer();
  } catch (e) {
    console.error('Erro ao resetar tabela de serviços de pilates:', e);
  }
  return INITIAL_SERVICES;
}

// -------------------------------------------------------------
// PROFESSIONALS STORE
// -------------------------------------------------------------
export function getStoredProfessionals(): PilatesProfessional[] {
  try {
    const saved = localStorage.getItem(PROFESSIONALS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler profissionais de pilates:', e);
  }
  return INITIAL_PROFESSIONALS;
}

export function saveStoredProfessionals(professionals: PilatesProfessional[]): void {
  try {
    localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(professionals));
    window.dispatchEvent(new Event('dra_leia_pilates_professionals_updated'));
    syncPilatesDataToServer();
  } catch (e) {
    console.error('Erro ao salvar profissionais de pilates:', e);
  }
}

export function resetStoredProfessionals(): PilatesProfessional[] {
  try {
    localStorage.removeItem(PROFESSIONALS_STORAGE_KEY);
    window.dispatchEvent(new Event('dra_leia_pilates_professionals_updated'));
    syncPilatesDataToServer();
  } catch (e) {
    console.error('Erro ao resetar profissionais de pilates:', e);
  }
  return INITIAL_PROFESSIONALS;
}

// -------------------------------------------------------------
// CLASSES STORE
// -------------------------------------------------------------
export function getStoredPilatesClasses(): PilatesClassRecord[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Erro ao ler aulas de pilates:', e);
  }
  return INITIAL_PILATES_RECORDS;
}

export function saveStoredPilatesClasses(records: PilatesClassRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    window.dispatchEvent(new Event('dra_leia_pilates_classes_updated'));
    syncPilatesDataToServer();
  } catch (e) {
    console.error('Erro ao salvar aulas de pilates:', e);
  }
}

export function resetStoredPilatesClasses(): PilatesClassRecord[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event('dra_leia_pilates_classes_updated'));
    syncPilatesDataToServer();
  } catch (e) {
    console.error('Erro ao resetar aulas de pilates:', e);
  }
  return INITIAL_PILATES_RECORDS;
}

// Sincronização inicial com o servidor
if (typeof window !== 'undefined') {
  fetch('/api/pilates-data')
    .then((r) => r.json())
    .then((res) => {
      const d = res?.data;
      if (d && typeof d === 'object') {
        if (Array.isArray(d.services) && d.services.length > 0) {
          localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(d.services));
          window.dispatchEvent(new Event('dra_leia_pilates_services_updated'));
        }
        if (Array.isArray(d.professionals) && d.professionals.length > 0) {
          localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(d.professionals));
          window.dispatchEvent(new Event('dra_leia_pilates_professionals_updated'));
        }
        if (Array.isArray(d.classes) && d.classes.length > 0) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(d.classes));
          window.dispatchEvent(new Event('dra_leia_pilates_classes_updated'));
        }
      }
    })
    .catch(() => {});

  window.addEventListener('admin-sync-pilates_data', ((e: CustomEvent) => {
    const d = e.detail;
    if (d && typeof d === 'object') {
      if (Array.isArray(d.services)) {
        localStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(d.services));
        window.dispatchEvent(new Event('dra_leia_pilates_services_updated'));
      }
      if (Array.isArray(d.professionals)) {
        localStorage.setItem(PROFESSIONALS_STORAGE_KEY, JSON.stringify(d.professionals));
        window.dispatchEvent(new Event('dra_leia_pilates_professionals_updated'));
      }
      if (Array.isArray(d.classes)) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(d.classes));
        window.dispatchEvent(new Event('dra_leia_pilates_classes_updated'));
      }
    }
  }) as EventListener);
}

export function usePilatesClasses() {
  const [classes, setClasses] = useState<PilatesClassRecord[]>(getStoredPilatesClasses);
  const [professionals, setProfessionals] = useState<PilatesProfessional[]>(getStoredProfessionals);
  const [services, setServices] = useState<PilatesServiceItem[]>(getStoredPilatesServices);

  useEffect(() => {
    const handleUpdate = () => {
      setClasses(getStoredPilatesClasses());
      setProfessionals(getStoredProfessionals());
      setServices(getStoredPilatesServices());
    };
    window.addEventListener('dra_leia_pilates_classes_updated', handleUpdate);
    window.addEventListener('dra_leia_pilates_professionals_updated', handleUpdate);
    window.addEventListener('dra_leia_pilates_services_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('dra_leia_pilates_classes_updated', handleUpdate);
      window.removeEventListener('dra_leia_pilates_professionals_updated', handleUpdate);
      window.removeEventListener('dra_leia_pilates_services_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Class CRUD
  const addClassRecord = (rec: Omit<PilatesClassRecord, 'id' | 'createdAt'>) => {
    const newId = `pilates-${Date.now()}`;
    const newRecord: PilatesClassRecord = {
      ...rec,
      id: newId,
      createdAt: new Date().toISOString()
    };
    const updated = [newRecord, ...classes];
    saveStoredPilatesClasses(updated);
    setClasses(updated);
  };

  const updateClassRecord = (id: string, patch: Partial<PilatesClassRecord>) => {
    const updated = classes.map(item => (item.id === id ? { ...item, ...patch } : item));
    saveStoredPilatesClasses(updated);
    setClasses(updated);
  };

  const deleteClassRecord = (id: string) => {
    const updated = classes.filter(item => item.id !== id);
    saveStoredPilatesClasses(updated);
    setClasses(updated);
  };

  const quickIncrementAttended = (id: string, current: number = 0) => {
    updateClassRecord(id, { attendedHours: current + 1 });
  };

  const resetClasses = () => {
    const res = resetStoredPilatesClasses();
    setClasses(res);
  };

  // Professional CRUD
  const addProfessional = (prof: Omit<PilatesProfessional, 'id' | 'createdAt'>) => {
    const newId = `prof-${Date.now()}`;
    const newProf: PilatesProfessional = {
      ...prof,
      id: newId,
      createdAt: new Date().toISOString()
    };
    const updated = [...professionals, newProf];
    saveStoredProfessionals(updated);
    setProfessionals(updated);
  };

  const updateProfessional = (id: string, patch: Partial<PilatesProfessional>) => {
    const updated = professionals.map(p => (p.id === id ? { ...p, ...patch } : p));
    saveStoredProfessionals(updated);
    setProfessionals(updated);
  };

  const deleteProfessional = (id: string) => {
    const updated = professionals.filter(p => p.id !== id);
    saveStoredProfessionals(updated);
    setProfessionals(updated);
  };

  const resetProfessionalsList = () => {
    const res = resetStoredProfessionals();
    setProfessionals(res);
  };

  // Services CRUD (Tabela de Serviço)
  const addServiceItem = (service: Omit<PilatesServiceItem, 'id' | 'createdAt'>) => {
    const newId = `serv-${Date.now()}`;
    const newServ: PilatesServiceItem = {
      ...service,
      id: newId,
      createdAt: new Date().toISOString()
    };
    const updated = [newServ, ...services];
    saveStoredPilatesServices(updated);
    setServices(updated);
  };

  const updateServiceItem = (id: string, patch: Partial<PilatesServiceItem>) => {
    const updated = services.map(s => (s.id === id ? { ...s, ...patch } : s));
    saveStoredPilatesServices(updated);
    setServices(updated);
  };

  const deleteServiceItem = (id: string) => {
    const updated = services.filter(s => s.id !== id);
    saveStoredPilatesServices(updated);
    setServices(updated);
  };

  const resetServicesList = () => {
    const res = resetStoredPilatesServices();
    setServices(res);
  };

  // Distinct list of professional names
  const professionalsSet = new Set<string>();
  professionals.forEach(p => {
    if (p.name && p.active !== false) professionalsSet.add(p.name);
  });
  classes.forEach(c => {
    if (c.professionalName) professionalsSet.add(c.professionalName);
  });
  if (!professionalsSet.has('Dra. Léia Mar')) {
    professionalsSet.add('Dra. Léia Mar');
  }
  const professionalsList = Array.from(professionalsSet);

  return {
    classes,
    professionals,
    services,
    addClassRecord,
    updateClassRecord,
    deleteClassRecord,
    quickIncrementAttended,
    resetClasses,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    resetProfessionalsList,
    professionalsList,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    resetServicesList
  };
}

// -------------------------------------------------------------
// RELATÓRIOS OFICIAIS: EXCEL (.XLSX) COM COLUNA 'AULAS'
// -------------------------------------------------------------
export function exportPilatesToXLS(classes: PilatesClassRecord[], titleSuffix = 'Geral'): void {
  const rows = classes.map(c => {
    const margin = c.totalPlanValue - c.gymPassValue - c.professionalPassValue;
    return {
      'Profissional': c.professionalName,
      'Nome do Aluno(a)': c.studentName,
      'Telefone / WhatsApp': formatPhoneBR(c.studentPhone) || '-',
      'Tipo de Plano': c.planType,
      'Valor Total Contratado (R$)': formatCurrencyBRL(c.totalPlanValue),
      'Mensalidade / Parcela (R$)': formatCurrencyBRL(c.monthlyInstallmentValue),
      'Repasse Academia 50% (R$)': formatCurrencyBRL(c.gymPassValue),
      'Repasse Profissional Manual (R$)': formatCurrencyBRL(c.professionalPassValue),
      'Margem Clínica (R$)': formatCurrencyBRL(margin),
      'Valor Hora Aula (R$)': `${formatCurrencyBRL(c.studentHourlyRate)}/h`,
      'AULAS': formatAulasRealizadas(c.attendedHours),
      'Total de Horas no Plano': `${c.totalClassHours}h`,
      'Status': c.status.toUpperCase(),
      'Data de Início': c.startDate || '-',
      'Observações': c.notes || '-'
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet['!cols'] = [
    { wch: 22 }, // Profissional
    { wch: 28 }, // Aluno
    { wch: 18 }, // Telefone
    { wch: 30 }, // Plano
    { wch: 26 }, // Valor Total
    { wch: 24 }, // Mensalidade
    { wch: 25 }, // Repasse Academia 50%
    { wch: 28 }, // Repasse Profissional
    { wch: 20 }, // Margem Clínica
    { wch: 20 }, // Valor Hora Aula
    { wch: 16 }, // AULAS
    { wch: 22 }, // Total de Horas
    { wch: 15 }, // Status
    { wch: 16 }, // Data Início
    { wch: 35 }  // Observações
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Aulas de Pilates');

  const todayStr = new Date().toISOString().split('T')[0];
  const safeTitle = titleSuffix.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(workbook, `Relatorio_Pilates_${safeTitle}_${todayStr}.xlsx`);
}

// -------------------------------------------------------------
// RELATÓRIOS OFICIAIS: PDF COM COLUNA 'AULAS'
// -------------------------------------------------------------
export function exportPilatesToPDF(classes: PilatesClassRecord[], titleSuffix = 'Geral'): void {
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

  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 18);
  doc.text(`Endereço: ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 14, 23);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(`Relatório de Aulas de Pilates & Repasses Financeiros — ${titleSuffix}`, 14, 34);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 68, 76);
  doc.text(`Emitido em: ${today}  |  Total de Alunos: ${classes.length}`, 14, 40);

  const totalContratado = classes.reduce((sum, c) => sum + (c.totalPlanValue || 0), 0);
  const totalMensal = classes.reduce((sum, c) => sum + (c.monthlyInstallmentValue || 0), 0);
  const totalAcademia = classes.reduce((sum, c) => sum + (c.gymPassValue || 0), 0);
  const totalProfissionais = classes.reduce((sum, c) => sum + (c.professionalPassValue || 0), 0);
  const totalAulasRealizadas = classes.reduce((sum, c) => sum + (c.attendedHours || 0), 0);

  const formatCurrency = (v: number) => formatCurrencyBRL(v);

  doc.setFontSize(8.5);
  doc.text(
    `Totais: Contratado: ${formatCurrency(totalContratado)}  |  Mensalidades: ${formatCurrency(totalMensal)}  |  Repasse Academia (50%): ${formatCurrency(totalAcademia)}  |  Repasse Profissionais: ${formatCurrency(totalProfissionais)}  |  Aulas Realizadas: ${totalAulasRealizadas}`,
    14,
    46
  );

  const tableData = classes.map(c => [
    c.professionalName,
    c.studentName,
    formatPhoneBR(c.studentPhone) || '-',
    c.planType,
    formatCurrency(c.totalPlanValue),
    formatCurrency(c.monthlyInstallmentValue),
    formatCurrency(c.gymPassValue),
    formatCurrency(c.professionalPassValue),
    `${formatCurrency(c.studentHourlyRate)}/h`,
    formatAulasRealizadas(c.attendedHours),
    `${c.totalClassHours}h`,
    c.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 50,
    head: [
      [
        'Profissional',
        'Aluno(a)',
        'WhatsApp',
        'Plano Contratado',
        'Total Plano',
        'Mensalidade',
        'Repasse Academia (50%)',
        'Repasse Profissional',
        'Valor Hora',
        'AULAS',
        'Total Horas',
        'Status'
      ]
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      halign: 'left'
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 7.5,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [255, 248, 250]
    },
    columnStyles: {
      0: { cellWidth: 28 }, // Profissional
      1: { cellWidth: 32 }, // Aluno
      2: { cellWidth: 22 }, // WhatsApp
      3: { cellWidth: 35 }, // Plano
      4: { cellWidth: 22, halign: 'right' }, // Total
      5: { cellWidth: 22, halign: 'right' }, // Mensalidade
      6: { cellWidth: 25, halign: 'right' }, // Repasse Academia
      7: { cellWidth: 25, halign: 'right' }, // Repasse Profissional
      8: { cellWidth: 18, halign: 'right' }, // Valor Hora
      9: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }, // AULAS
      10: { cellWidth: 16, halign: 'center' }, // Total Horas
      11: { cellWidth: 16, halign: 'center' }  // Status
    },
    margin: { left: 14, right: 14 }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const safeTitle = titleSuffix.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Relatorio_Pilates_${safeTitle}_${todayStr}.pdf`);
}

// -------------------------------------------------------------
// IMPRESSÃO DIRETA NA IMPRESSORA PADRÃO COM FALLBACK IFRAME
// -------------------------------------------------------------
// IMPRESSÃO DIRETA FORMATADA NA IMPRESSORA PADRÃO
// -------------------------------------------------------------
export function printPilatesReportDirect(classes: PilatesClassRecord[], titleSuffix = 'Geral'): void {
  const formatCurrency = (v: number) => formatCurrencyBRL(v);

  const today = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalContratado = classes.reduce((sum, c) => sum + (c.totalPlanValue || 0), 0);
  const totalMensal = classes.reduce((sum, c) => sum + (c.monthlyInstallmentValue || 0), 0);
  const totalAcademia = classes.reduce((sum, c) => sum + (c.gymPassValue || 0), 0);
  const totalProfissionais = classes.reduce((sum, c) => sum + (c.professionalPassValue || 0), 0);
  const totalAulasRealizadas = classes.reduce((sum, c) => sum + (c.attendedHours || 0), 0);

  // Remove any lingering print iframes
  const existingFrame = document.getElementById('direct-print-pilates-frame');
  if (existingFrame && existingFrame.parentNode) {
    existingFrame.parentNode.removeChild(existingFrame);
  }

  const iframe = document.createElement('iframe');
  iframe.id = 'direct-print-pilates-frame';
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0.01';
  iframe.style.pointerEvents = 'none';
  iframe.style.border = 'none';
  iframe.style.zIndex = '-1';
  document.body.appendChild(iframe);

  const rowsHtml = classes.map((c, i) => `
    <tr style="background: ${i % 2 === 0 ? '#FFFFFF' : '#FFF8FA'};">
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; font-weight: 600;">${c.professionalName}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; font-weight: 600;">
        ${c.studentName}
        ${c.studentPhone ? `<div style="font-size: 9px; color: #1D7A46; font-weight: normal;">${formatPhoneBR(c.studentPhone)}</div>` : ''}
      </td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0;">${c.planType}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: right; font-weight: 700;">${formatCurrency(c.totalPlanValue)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: right;">${formatCurrency(c.monthlyInstallmentValue)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: right; color: #9C2744; font-weight: 700; background: #FFF5F7;">${formatCurrency(c.gymPassValue)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: right; color: #1877F2; font-weight: 700; background: #F4F8FF;">${formatCurrency(c.professionalPassValue)}</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: right;">${formatCurrency(c.studentHourlyRate)}/h</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: center; font-weight: bold; color: #9C2744; background: #FFEBF0;">
        ${formatAulasRealizadas(c.attendedHours)}
      </td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: center; font-weight: 600;">${c.totalClassHours}h</td>
      <td style="padding: 6px 8px; border-bottom: 1px solid #FCD6E0; text-align: center;">
        <span style="display: inline-block; padding: 2px 6px; border-radius: 999px; font-size: 8px; font-weight: bold; text-transform: uppercase; background: ${c.status === 'ativo' ? '#EBF7EE' : '#EBF2FF'}; color: ${c.status === 'ativo' ? '#1D7A46' : '#1877F2'};">
          ${c.status}
        </span>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="utf-8">
      <title>Relatório de Aulas de Pilates - Dra. Léia Mar</title>
      <style>
        @page {
          size: A4 landscape;
          margin: 8mm 8mm;
        }
        * {
          box-sizing: border-box;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          margin: 0;
          padding: 8px;
          color: #26161B;
          background: #FFFFFF;
          font-size: 10px;
        }
        .header {
          background: #8C3B50;
          color: #FFFFFF;
          padding: 12px 16px;
          border-radius: 8px;
          margin-bottom: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .header h1 {
          margin: 0 0 4px 0;
          font-size: 18px;
          font-weight: 700;
        }
        .header p {
          margin: 0;
          font-size: 9px;
          opacity: 0.92;
        }
        .meta-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          border-bottom: 2px solid #FCD6E0;
          padding-bottom: 6px;
        }
        .meta-title {
          font-size: 14px;
          font-weight: 700;
          color: #26161B;
        }
        .meta-sub {
          font-size: 9px;
          color: #5B444C;
        }
        .cards {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 8px;
          margin-bottom: 12px;
        }
        .card {
          border: 1px solid #FCD6E0;
          border-radius: 6px;
          padding: 6px 10px;
          background: #FFFDFB;
        }
        .card-label {
          font-size: 8px;
          text-transform: uppercase;
          font-weight: 700;
          color: #8C3B50;
          margin-bottom: 2px;
        }
        .card-val {
          font-size: 13px;
          font-weight: 700;
          color: #26161B;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 9px;
        }
        th {
          background: #8C3B50;
          color: #FFFFFF;
          text-align: left;
          padding: 6px 8px;
          font-weight: 700;
          text-transform: uppercase;
          font-size: 8px;
          letter-spacing: 0.5px;
        }
        .footer {
          margin-top: 14px;
          padding-top: 8px;
          border-top: 1px solid #E5E7EB;
          display: flex;
          justify-content: space-between;
          font-size: 8px;
          color: #8C3B50;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <h1>Dra. Léia Mar — Fisioterapia & Pilates</h1>
          <p>CREFITO: ${CLINIC_INFO.crefito} • WhatsApp: ${CLINIC_INFO.phoneDisplay} • ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}</p>
        </div>
        <div style="text-align: right; font-size: 9px;">
          <strong>Documento Gerencial</strong><br/>
          <span>${today}</span>
        </div>
      </div>

      <div class="meta-bar">
        <div>
          <div class="meta-title">Relatório de Aulas de Pilates & Gestão Financeira — ${titleSuffix}</div>
          <div class="meta-sub">Emitido em: ${today} | Total de Alunos no Relatório: ${classes.length}</div>
        </div>
      </div>

      <div class="cards">
        <div class="card">
          <div class="card-label">Faturamento Total</div>
          <div class="card-val">${formatCurrency(totalContratado)}</div>
        </div>
        <div class="card">
          <div class="card-label">Mensalidades Vigentes</div>
          <div class="card-val">${formatCurrency(totalMensal)}/mês</div>
        </div>
        <div class="card">
          <div class="card-label" style="color: #9C2744;">Repasse Academia (50%)</div>
          <div class="card-val" style="color: #9C2744;">${formatCurrency(totalAcademia)}</div>
        </div>
        <div class="card">
          <div class="card-label" style="color: #1877F2;">Repasse Profissionais</div>
          <div class="card-val" style="color: #1877F2;">${formatCurrency(totalProfissionais)}</div>
        </div>
        <div class="card">
          <div class="card-label" style="color: #9C2744;">Aulas Realizadas</div>
          <div class="card-val" style="color: #9C2744;">${totalAulasRealizadas} aulas</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Profissional</th>
            <th>Aluno(a)</th>
            <th>Plano Contratado</th>
            <th style="text-align: right;">Total Plano</th>
            <th style="text-align: right;">Mensalidade</th>
            <th style="text-align: right; background: #7C2A3D;">Repasse Academia (50%)</th>
            <th style="text-align: right; background: #0E5AA7;">Repasse Profissional</th>
            <th style="text-align: right;">Valor Hora</th>
            <th style="text-align: center; background: #561825;">AULAS</th>
            <th style="text-align: center;">Total Horas</th>
            <th style="text-align: center;">Status</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <div class="footer">
        <span>Documento oficial gerado pelo Portal do Administrador • Dra. Léia Mar Fisioterapia & Pilates</span>
        <span>Página 1 de 1</span>
      </div>
    </body>
    </html>
  `;

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    window.print();
    return;
  }

  doc.open();
  doc.write(html);
  doc.close();

  const cleanup = () => {
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 1500);
  };

  const executePrintAction = () => {
    try {
      if (iframe.contentWindow) {
        iframe.contentWindow.addEventListener('afterprint', cleanup);
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn('Erro ao chamar print() no iframe, acionando window.print():', e);
      window.print();
    }
  };

  // Wait for resources to load in iframe before triggering print
  setTimeout(executePrintAction, 300);
}

// -------------------------------------------------------------
// EXPORTAÇÃO DA TABELA DE SERVIÇOS & PLANOS (XLS & PDF)
// -------------------------------------------------------------
export function exportServicesToXLS(services: PilatesServiceItem[]): void {
  const rows = services.map(s => ({
    'Categoria': s.planCategory,
    'Nome do Plano / Serviço': s.name,
    'Modalidade': s.modality,
    'Valor Total (R$)': formatCurrencyBRL(s.totalValue || 0),
    'Mensalidade / Parcela (R$)': formatCurrencyBRL(s.monthlyValue || 0),
    'Repasse Academia 50% (R$)': formatCurrencyBRL(s.gymPassValue || 0),
    'Repasse Sugerido Profissional (R$)': formatCurrencyBRL(s.suggestedProfPass || 0),
    'Total de Aulas': s.classCountTotal,
    'Aulas / Semana': `${s.weeklyClasses}x`,
    'Dias da Semana': s.daysOfWeek || '-',
    'Horários': s.schedules || '-',
    'Vigência / Validade': s.validityDays || '-',
    'Status': s.active ? 'ATIVO' : 'INATIVO',
    'Observações': s.notes || '-'
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 16 },
    { wch: 36 },
    { wch: 36 },
    { wch: 18 },
    { wch: 22 },
    { wch: 22 },
    { wch: 26 },
    { wch: 15 },
    { wch: 15 },
    { wch: 28 },
    { wch: 34 },
    { wch: 20 },
    { wch: 14 },
    { wch: 35 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Tabela_Servicos_Planos');
  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Tabela_Servicos_Planos_Dra_Leia_Mar_${todayStr}.xlsx`);
}

export function exportServicesToPDF(services: PilatesServiceItem[]): void {
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

  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 18);
  doc.text(`Endereço: ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 14, 23);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Tabela Oficial de Serviços, Planos e Valores de Pilates', 14, 34);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 68, 76);
  doc.text(`Emitido em: ${today}  |  Total de Planos Cadastrados: ${services.length}`, 14, 40);

  const formatCurrency = (v: number) => formatCurrencyBRL(v);

  const tableData = services.map(s => [
    s.planCategory,
    s.name,
    s.modality,
    formatCurrency(s.totalValue),
    formatCurrency(s.monthlyValue),
    formatCurrency(s.gymPassValue),
    formatCurrency(s.suggestedProfPass),
    `${s.classCountTotal} (${s.weeklyClasses}x/sem)`,
    s.daysOfWeek || '-',
    s.validityDays || '-'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        'Categoria',
        'Plano / Serviço',
        'Modalidade',
        'Valor Total',
        'Mensalidade',
        'Academia (50%)',
        'Profissional',
        'Aulas',
        'Dias da Semana',
        'Vigência'
      ]
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 7.5,
      cellPadding: 2
    },
    alternateRowStyles: {
      fillColor: [255, 248, 250]
    },
    margin: { left: 14, right: 14 }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Tabela_Servicos_Planos_Dra_Leia_Mar_${todayStr}.pdf`);
}

// -------------------------------------------------------------
// EXPORTAÇÃO SOMENTE CONTROLE E REGISTRO DE ALUNOS (ABA AULAS DE PILATES - SEM VALORES)
// -------------------------------------------------------------
export function exportPilatesStudentsOnlyToXLS(classes: PilatesClassRecord[]): void {
  const rows = classes.map(c => ({
    'Profissional': c.professionalName,
    'Nome do Aluno(a)': c.studentName,
    'Telefone / WhatsApp': c.studentPhone || '-',
    'Tipo de Plano': c.planType,
    'Data de Início': c.startDate || '-',
    'AULAS Realizadas': formatAulasRealizadas(c.attendedHours),
    'Total de Horas no Plano': `${c.totalClassHours}h`,
    'Status': c.status.toUpperCase(),
    'Observações / Objetivos': c.notes || '-'
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 24 },
    { wch: 28 },
    { wch: 18 },
    { wch: 34 },
    { wch: 16 },
    { wch: 18 },
    { wch: 22 },
    { wch: 15 },
    { wch: 36 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Controle de Alunos');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Controle_Alunos_Aulas_Pilates_${todayStr}.xlsx`);
}

export function exportPilatesStudentsOnlyToPDF(classes: PilatesClassRecord[]): void {
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

  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 18);
  doc.text(`Endereço: ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 14, 23);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Aulas de Pilates — Controle e Registro de Alunos', 14, 34);

  const totalAulasRealizadas = classes.reduce((sum, c) => sum + (c.attendedHours || 0), 0);
  const totalHorasPlano = classes.reduce((sum, c) => sum + (c.totalClassHours || 0), 0);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 68, 76);
  doc.text(
    `Emitido em: ${today}  |  Total de Alunos: ${classes.length}  |  Aulas Realizadas: ${totalAulasRealizadas} aulas  |  Carga Horária Total: ${totalHorasPlano}h`,
    14,
    40
  );

  const tableData = classes.map(c => [
    c.professionalName,
    c.studentName,
    c.studentPhone || '-',
    c.planType,
    c.startDate || '-',
    formatAulasRealizadas(c.attendedHours),
    `${c.totalClassHours}h`,
    c.status.toUpperCase(),
    c.notes || '-'
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        'Profissional',
        'Aluno(a)',
        'WhatsApp',
        'Plano / Modalidade',
        'Início',
        'AULAS',
        'Total Horas',
        'Status',
        'Observações / Objetivos'
      ]
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 8,
      cellPadding: 2.5
    },
    alternateRowStyles: {
      fillColor: [255, 248, 250]
    },
    margin: { left: 14, right: 14 }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Controle_Alunos_Aulas_Pilates_${todayStr}.pdf`);
}

// -------------------------------------------------------------
// EXPORTAÇÃO GESTÃO FINANCEIRA (SOMENTE VALORES E REPASSES)
// -------------------------------------------------------------
export function exportPilatesFinancialOnlyToXLS(classes: PilatesClassRecord[]): void {
  const rows = classes.map(c => {
    const margin = c.totalPlanValue - c.gymPassValue - c.professionalPassValue;
    return {
      'Aluno(a)': c.studentName,
      'Profissional': c.professionalName,
      'Tipo de Plano': c.planType,
      'Valor Total do Plano (R$)': formatCurrencyBRL(c.totalPlanValue),
      'Mensalidade / Parcela (R$)': formatCurrencyBRL(c.monthlyInstallmentValue),
      'Repasse Academia 50% (R$)': formatCurrencyBRL(c.gymPassValue),
      'Repasse Profissional (R$)': formatCurrencyBRL(c.professionalPassValue),
      'Saldo Líquido Clínica (R$)': formatCurrencyBRL(margin),
      'Valor Hora/Aula (R$)': `${formatCurrencyBRL(c.studentHourlyRate)}/h`,
      'Status': c.status.toUpperCase()
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet['!cols'] = [
    { wch: 28 },
    { wch: 24 },
    { wch: 32 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 24 },
    { wch: 20 },
    { wch: 15 }
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Gestão Financeira');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Gestao_Financeira_Pilates_${todayStr}.xlsx`);
}

export function exportPilatesFinancialOnlyToPDF(classes: PilatesClassRecord[]): void {
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

  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 18);
  doc.text(`Endereço: ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 14, 23);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Gestão Financeira — Valores, Mensalidades e Repasses', 14, 34);

  const totalContratado = classes.reduce((sum, c) => sum + (c.totalPlanValue || 0), 0);
  const totalMensal = classes.reduce((sum, c) => sum + (c.monthlyInstallmentValue || 0), 0);
  const totalAcademia = classes.reduce((sum, c) => sum + (c.gymPassValue || 0), 0);
  const totalProfissionais = classes.reduce((sum, c) => sum + (c.professionalPassValue || 0), 0);
  const saldoLiquido = totalContratado - totalAcademia - totalProfissionais;

  const formatCurrency = (v: number) => formatCurrencyBRL(v);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 68, 76);
  doc.text(
    `Emitido em: ${today}  |  Faturamento Total: ${formatCurrency(totalContratado)}  |  Mensalidades: ${formatCurrency(totalMensal)}  |  Academia (50%): ${formatCurrency(totalAcademia)}  |  Profissionais: ${formatCurrency(totalProfissionais)}  |  Saldo Clínica: ${formatCurrency(saldoLiquido)}`,
    14,
    40
  );

  const tableData = classes.map(c => [
    c.studentName,
    c.professionalName,
    c.planType,
    formatCurrency(c.totalPlanValue),
    formatCurrency(c.monthlyInstallmentValue),
    formatCurrency(c.gymPassValue),
    formatCurrency(c.professionalPassValue),
    `${formatCurrency(c.studentHourlyRate)}/h`,
    c.status.toUpperCase()
  ]);

  autoTable(doc, {
    startY: 45,
    head: [
      [
        'Aluno(a)',
        'Profissional',
        'Tipo de Plano',
        'Valor Total',
        'Mensalidade',
        'Repasse Academia (50%)',
        'Repasse Profissional',
        'Valor Hora/Aula',
        'Status'
      ]
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 8,
      cellPadding: 2.5
    },
    alternateRowStyles: {
      fillColor: [255, 248, 250]
    },
    margin: { left: 14, right: 14 }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Gestao_Financeira_Pilates_${todayStr}.pdf`);
}

// -------------------------------------------------------------
// EXPORTAÇÃO DO CADASTRO DE PROFISSIONAIS (XLS & PDF)
// -------------------------------------------------------------
export function exportProfessionalsToXLS(professionals: PilatesProfessional[], classes: PilatesClassRecord[] = []): void {
  const rows = professionals.map(p => {
    const studentCount = classes.filter(c => (c.professionalName?.toLowerCase() === p.name?.toLowerCase()) && c.status === 'ativo').length;
    return {
      'Nome do Profissional': p.name,
      'Cargo / Especialidade': p.roleTitle || 'Fisioterapeuta & Instrutor(a) de Pilates',
      'CREFITO': p.crefito || 'Não informado',
      'Telefone / WhatsApp': p.phone || 'Não informado',
      'Status': p.active ? 'ATIVO' : 'INATIVO',
      'Alunos Ativos Atendidos': studentCount,
      'Data de Cadastro': p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : '-'
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 38 },
    { wch: 18 },
    { wch: 22 },
    { wch: 14 },
    { wch: 24 },
    { wch: 18 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Profissionais');
  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Cadastro_Profissionais_Dra_Leia_Mar_${todayStr}.xlsx`);
}

export function exportProfessionalsToPDF(professionals: PilatesProfessional[], classes: PilatesClassRecord[] = []): void {
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

  // Banner Superior
  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  CNPJ: 69.533.975/0001-81 - MOVEX CENTRO DE MOVIMENTO E PERFORMANCE`, 14, 18);
  doc.text(`WhatsApp: ${CLINIC_INFO.phoneDisplay}  •  Endereço: ${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 14, 23);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Oficial de Cadastro & Gestão de Profissionais', 14, 34);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(91, 68, 76);
  doc.text(`Emitido em: ${today}  |  Total de Profissionais Cadastrados: ${professionals.length}`, 14, 40);

  const tableData = professionals.map(p => {
    const studentCount = classes.filter(c => (c.professionalName?.toLowerCase() === p.name?.toLowerCase()) && c.status === 'ativo').length;
    return [
      p.name,
      p.roleTitle || 'Fisioterapeuta & Instrutor(a)',
      p.crefito || '-',
      p.phone || '-',
      p.active ? 'ATIVO' : 'INATIVO',
      String(studentCount),
      p.createdAt ? new Date(p.createdAt).toLocaleDateString('pt-BR') : '-'
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [
      [
        'Nome do Profissional',
        'Cargo / Especialidade',
        'CREFITO',
        'Telefone / WhatsApp',
        'Status',
        'Alunos Ativos',
        'Data Cadastro'
      ]
    ],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 8.5,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [255, 248, 250]
    },
    margin: { left: 14, right: 14 }
  });

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Cadastro_Profissionais_Dra_Leia_Mar_${todayStr}.pdf`);
}


