import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CLINIC_INFO } from './content';

export interface ExamAttachment {
  id: string;
  name: string;
  date: string;
  type: 'Ressonância' | 'Raio-X' | 'Tomografia' | 'Ultrassonografia' | 'Laudo Médico' | 'Outro';
  notes?: string;
  fileData?: string; // base64 or object url
  size?: string;
}

export interface ClinicalPatient {
  id: string;
  registrationNumber: string; // Ex: PRONT-2026-001
  createdAt: string;
  updatedAt: string;
  status: 'ativo' | 'em_avaliacao' | 'alta' | 'inativo';

  // 1. Dados Pessoais e Contato
  fullName: string;
  birthDate: string; // YYYY-MM-DD
  gender: 'Feminino' | 'Masculino' | 'Outro' | 'Não informado';
  cpf: string;
  rg: string;
  phone: string; // Telefone / WhatsApp
  email: string;
  address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };

  // 2. Contato de Emergência
  emergencyContact: {
    name: string;
    relationship: string; // Mãe, Pai, Cônjuge, Irmão(ã), Filho(a), Amigo(a)
    phone: string;
  };

  // 3. Histórico de Saúde e Anamnese
  anamnese: {
    mainGoal: string; // Ex: alívio de dores, flexibilidade, fortalecimento, postura
    physicalActivityCurrent: boolean;
    physicalActivityDetails?: string; // Qual atividade e frequência
    chronicPainOrInjury: boolean;
    chronicPainDetails?: string; // Hérnia de disco, escoliose, dores joelhos, ombros
    recentOrPastSurgeries: boolean;
    surgeriesDetails?: string; // Qual e há quanto tempo
    cardiacOrBloodPressure: 'normal' | 'hipertensao' | 'hipotensao' | 'arritmia' | 'outro';
    cardiacDetails?: string;
    continuousMedication: boolean;
    medicationDetails?: string; // Qual medicamento
    dizzinessOrVertigo: boolean;
    dizzinessDetails?: string; // Tonturas, vertigens ou labirintite
    isPregnant: boolean; // Alunas gestantes
    gestationalWeeks?: number; // Quantas semanas
    additionalNotes?: string;
  };

  // 4. Informações Médicas Complementares
  medicalInfo: {
    doctorName?: string;
    doctorSpecialty?: string;
    doctorPhone?: string;
    examAttachments: ExamAttachment[];
  };

  // 6. Termos e Autorizações (Legislação Vigente: LGPD / COFFITO / Código Civil)
  terms: {
    // a) Termo de consentimento e responsabilidade (atestando veracidade dos dados de saúde)
    consentAccepted: boolean;
    consentSignedAt?: string;
    consentSignatureName?: string;
    // c) Autorização de uso de imagem (opcional)
    imageUsageAuthorized: boolean;
    imageUsageSignedAt?: string;
    // d) Termo de ciência da política de desmarques e reposições
    cancellationPolicyAccepted: boolean;
    cancellationPolicySignedAt?: string;
  };

  // Evolução e Anotações Clínicas
  evolutionNotes?: Array<{
    id: string;
    date: string;
    note: string;
    professional: string;
  }>;
}

export function calculateAge(birthDateStr: string): { years: number; label: string } {
  if (!birthDateStr) return { years: 0, label: '-' };
  const birth = new Date(birthDateStr);
  if (isNaN(birth.getTime())) return { years: 0, label: '-' };
  const today = new Date();
  let years = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
    years--;
  }
  years = Math.max(0, years);
  let label = `${years} anos`;
  if (years < 18) label += ' (Menor de idade)';
  else if (years >= 60) label += ' (Melhor idade / Idoso)';
  else label += ' (Adulto)';
  return { years, label };
}

export const INITIAL_CLINICAL_PATIENTS: ClinicalPatient[] = [
  {
    id: 'pat-001',
    registrationNumber: 'PRONT-2026-001',
    createdAt: '2026-01-15T09:00:00.000Z',
    updatedAt: '2026-09-20T14:30:00.000Z',
    status: 'ativo',
    fullName: 'Mariana Vasconcelos de Souza',
    birthDate: '1989-05-14',
    gender: 'Feminino',
    cpf: '458.912.782-34',
    rg: '1894562-1 SSP/AM',
    phone: '(92) 99123-4567',
    email: 'mariana.vasconcelos@email.com',
    address: {
      street: 'Av. Jornalista Umberto Calderaro Filho',
      number: '1420',
      complement: 'Apto 804 - Edifício Cristal Tower',
      neighborhood: 'Adrianópolis',
      city: 'Manaus',
      state: 'AM',
      zipCode: '69057-015'
    },
    emergencyContact: {
      name: 'Eduardo Vasconcelos',
      relationship: 'Esposo / Cônjuge',
      phone: '(92) 98111-2233'
    },
    anamnese: {
      mainGoal: 'Alívio de dores lombares decorrentes do trabalho home office e melhora da postura e flexibilidade.',
      physicalActivityCurrent: true,
      physicalActivityDetails: 'Caminhada leve 2 vezes na semana.',
      chronicPainOrInjury: true,
      chronicPainDetails: 'Protrusão discal em L4-L5 diagnosticada em ressonância magnética; dores frequentes ao permanecer muito tempo sentada.',
      recentOrPastSurgeries: false,
      surgeriesDetails: '',
      cardiacOrBloodPressure: 'normal',
      cardiacDetails: '',
      continuousMedication: false,
      medicationDetails: '',
      dizzinessOrVertigo: false,
      dizzinessDetails: '',
      isPregnant: false,
      gestationalWeeks: undefined,
      additionalNotes: 'Excelente resposta inicial ao fortalecimento de core e estabilização lombo-pélvica nos aparelhos Cadillac e Reformer.'
    },
    medicalInfo: {
      doctorName: 'Dr. Roberto Magalhães',
      doctorSpecialty: 'Ortopedista Especialista em Coluna',
      doctorPhone: '(92) 3642-8800',
      examAttachments: [
        {
          id: 'exam-01',
          name: 'Ressonancia_Lombar_L4_L5.pdf',
          date: '2026-01-10',
          type: 'Ressonância',
          notes: 'Demonstra protrusão discal póstero-central discreta sem compressão radicular grave.',
          size: '2.4 MB'
        }
      ]
    },
    terms: {
      consentAccepted: true,
      consentSignedAt: '2026-01-15T09:15:00.000Z',
      consentSignatureName: 'Mariana Vasconcelos de Souza',
      imageUsageAuthorized: true,
      imageUsageSignedAt: '2026-01-15T09:16:00.000Z',
      cancellationPolicyAccepted: true,
      cancellationPolicySignedAt: '2026-01-15T09:15:00.000Z'
    },
    evolutionNotes: [
      {
        id: 'evo-01',
        date: '2026-09-18',
        note: 'Sessão focada em mobilidade da coluna torácica e fortalecimento de glúteo médio. Paciente referiu ausência total de dor lombar nas últimas 3 semanas.',
        professional: 'Dra. Léia Mar (CREFITO 12345-F)'
      }
    ]
  },
  {
    id: 'pat-002',
    registrationNumber: 'PRONT-2026-002',
    createdAt: '2026-02-01T10:30:00.000Z',
    updatedAt: '2026-09-22T16:00:00.000Z',
    status: 'ativo',
    fullName: 'Carla Beatriz Alencar Lima',
    birthDate: '1977-11-20',
    gender: 'Feminino',
    cpf: '589.340.112-90',
    rg: '1245890-3 SSP/AM',
    phone: '(92) 98455-8822',
    email: 'carla.alencar@empresa.com.br',
    address: {
      street: 'Rua Salvador',
      number: '480',
      complement: 'Condomínio Reserva das Flores, Bloco C',
      neighborhood: 'Adrianópolis',
      city: 'Manaus',
      state: 'AM',
      zipCode: '69057-040'
    },
    emergencyContact: {
      name: 'Renata Alencar',
      relationship: 'Irmã',
      phone: '(92) 99220-4455'
    },
    anamnese: {
      mainGoal: 'Correção de hipercifose postural, alívio de dor e tensão muscular na região cervical e escápulas.',
      physicalActivityCurrent: false,
      physicalActivityDetails: 'Sedentária atualmente por conta da rotina administrativa.',
      chronicPainOrInjury: true,
      chronicPainDetails: 'Dor miofascial cervical crônica e retificação da lordose cervical.',
      recentOrPastSurgeries: false,
      surgeriesDetails: '',
      cardiacOrBloodPressure: 'hipertensao',
      cardiacDetails: 'Pressão controlada com medicação diária recomendada pelo cardiologista.',
      continuousMedication: true,
      medicationDetails: 'Losartana Potássica 50mg pela manhã.',
      dizzinessOrVertigo: false,
      dizzinessDetails: '',
      isPregnant: false,
      gestationalWeeks: undefined,
      additionalNotes: 'Aferir pressão arterial antes das sessões de intensidade moderada/alta.'
    },
    medicalInfo: {
      doctorName: 'Dra. Juliana Castelo',
      doctorSpecialty: 'Cardiologista e Clínica Geral',
      doctorPhone: '(92) 3234-9911',
      examAttachments: [
        {
          id: 'exam-02',
          name: 'RaioX_Coluna_Cervical_AP_Perfil.pdf',
          date: '2026-01-20',
          type: 'Raio-X',
          notes: 'Retificação da lordose fisiológica cervical com discretos osteófitos marginais incipientes.',
          size: '1.8 MB'
        }
      ]
    },
    terms: {
      consentAccepted: true,
      consentSignedAt: '2026-02-01T10:45:00.000Z',
      consentSignatureName: 'Carla Beatriz Alencar Lima',
      imageUsageAuthorized: false,
      imageUsageSignedAt: '2026-02-01T10:45:00.000Z',
      cancellationPolicyAccepted: true,
      cancellationPolicySignedAt: '2026-02-01T10:45:00.000Z'
    },
    evolutionNotes: [
      {
        id: 'evo-02',
        date: '2026-09-20',
        note: 'Trabalho de liberação miofascial suboccipital e trapézio superior, seguido de ativação de romboides na Chair. Amplitude de rotação cervical aumentada em 20 graus.',
        professional: 'Dra. Léia Mar (CREFITO 12345-F)'
      }
    ]
  },
  {
    id: 'pat-003',
    registrationNumber: 'PRONT-2026-003',
    createdAt: '2026-03-10T14:00:00.000Z',
    updatedAt: '2026-09-24T11:20:00.000Z',
    status: 'ativo',
    fullName: 'Renata Frota Guimarães',
    birthDate: '1995-08-03',
    gender: 'Feminino',
    cpf: '712.445.672-01',
    rg: '2105432-8 SSP/AM',
    phone: '(92) 99341-9090',
    email: 'renata.frota@gmail.com',
    address: {
      street: 'Av. Mário Ypiranga',
      number: '1300',
      complement: 'Condomínio Teresina 275',
      neighborhood: 'Adrianópolis',
      city: 'Manaus',
      state: 'AM',
      zipCode: '69057-002'
    },
    emergencyContact: {
      name: 'Márcio Guimarães',
      relationship: 'Pai',
      phone: '(92) 98888-7711'
    },
    anamnese: {
      mainGoal: 'Reabilitação do joelho direito pós-reconstrução do LCA e fortalecimento muscular seguro.',
      physicalActivityCurrent: true,
      physicalActivityDetails: 'Fisioterapia e Pilates Clínico 2 vezes por semana.',
      chronicPainOrInjury: true,
      chronicPainDetails: 'Pós-operatório de LCA joelho direito (6 meses de cirurgia). Leve rigidez matinal.',
      recentOrPastSurgeries: true,
      surgeriesDetails: 'Artroscopia joelho direito para reconstrução de Ligamento Cruzado Anterior há 6 meses.',
      cardiacOrBloodPressure: 'normal',
      cardiacDetails: '',
      continuousMedication: false,
      medicationDetails: '',
      dizzinessOrVertigo: false,
      dizzinessDetails: '',
      isPregnant: false,
      gestationalWeeks: undefined,
      additionalNotes: 'Liberação médica concedida para ganho de força excêntrica e treino proprioceptivo.'
    },
    medicalInfo: {
      doctorName: 'Dr. Fernando Sampaio',
      doctorSpecialty: 'Cirurgião Ortopedista de Joelho',
      doctorPhone: '(92) 3622-4400',
      examAttachments: [
        {
          id: 'exam-03',
          name: 'Laudo_Liberacao_Medica_LCA.pdf',
          date: '2026-03-05',
          type: 'Laudo Médico',
          notes: 'Enxerto bem integrado, estabilidade articular testada (Lachman negativo). Liberada para fortalecimento em cadeia cinética fechada.',
          size: '1.1 MB'
        }
      ]
    },
    terms: {
      consentAccepted: true,
      consentSignedAt: '2026-03-10T14:15:00.000Z',
      consentSignatureName: 'Renata Frota Guimarães',
      imageUsageAuthorized: true,
      imageUsageSignedAt: '2026-03-10T14:16:00.000Z',
      cancellationPolicyAccepted: true,
      cancellationPolicySignedAt: '2026-03-10T14:15:00.000Z'
    },
    evolutionNotes: [
      {
        id: 'evo-03',
        date: '2026-09-22',
        note: 'Exercícios no Reformer com foco em co-contração de quadríceps e isquiotibiais. Boa estabilidade sem queixa álgica no joelho direito.',
        professional: 'Dra. Léia Mar (CREFITO 12345-F)'
      }
    ]
  },
  {
    id: 'pat-004',
    registrationNumber: 'PRONT-2026-004',
    createdAt: '2026-04-05T15:30:00.000Z',
    updatedAt: '2026-09-19T10:00:00.000Z',
    status: 'ativo',
    fullName: 'Roberto Mendes Fagundes',
    birthDate: '1968-03-25',
    gender: 'Masculino',
    cpf: '331.654.892-12',
    rg: '0981245-0 SSP/AM',
    phone: '(92) 98112-9988',
    email: 'roberto.mendes@adv.br',
    address: {
      street: 'Rua Fortaleza',
      number: '210',
      complement: 'Casa',
      neighborhood: 'Adrianópolis',
      city: 'Manaus',
      state: 'AM',
      zipCode: '69057-080'
    },
    emergencyContact: {
      name: 'Helena Mendes',
      relationship: 'Esposa',
      phone: '(92) 99190-3344'
    },
    anamnese: {
      mainGoal: 'Fortalecimento postural, alívio de dor ciática e mobilidade articular global para a prática de golfe/caminhada.',
      physicalActivityCurrent: true,
      physicalActivityDetails: 'Pratica caminhada nos finais de semana.',
      chronicPainOrInjury: true,
      chronicPainDetails: 'Episódios de dor ciática em membro inferior esquerdo decorrentes de estenose foraminal leve.',
      recentOrPastSurgeries: false,
      surgeriesDetails: '',
      cardiacOrBloodPressure: 'normal',
      cardiacDetails: '',
      continuousMedication: false,
      medicationDetails: '',
      dizzinessOrVertigo: false,
      dizzinessDetails: '',
      isPregnant: false,
      gestationalWeeks: undefined,
      additionalNotes: 'Excelente adesão aos exercícios no Barrel e Cadillac.'
    },
    medicalInfo: {
      doctorName: 'Dr. Paulo Nogueira',
      doctorSpecialty: 'Neurologista e Ortopedista',
      doctorPhone: '(92) 3648-5000',
      examAttachments: []
    },
    terms: {
      consentAccepted: true,
      consentSignedAt: '2026-04-05T15:45:00.000Z',
      consentSignatureName: 'Roberto Mendes Fagundes',
      imageUsageAuthorized: true,
      imageUsageSignedAt: '2026-04-05T15:45:00.000Z',
      cancellationPolicyAccepted: true,
      cancellationPolicySignedAt: '2026-04-05T15:45:00.000Z'
    },
    evolutionNotes: []
  }
];

const CLINICAL_STORAGE_KEY = 'leiamar_clinical_history_v1';

export function getStoredClinicalPatients(): ClinicalPatient[] {
  if (typeof window === 'undefined') return INITIAL_CLINICAL_PATIENTS;
  try {
    const raw = localStorage.getItem(CLINICAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CLINICAL_STORAGE_KEY, JSON.stringify(INITIAL_CLINICAL_PATIENTS));
      return INITIAL_CLINICAL_PATIENTS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return INITIAL_CLINICAL_PATIENTS;
  } catch (err) {
    console.error('Erro ao ler pacientes do localStorage:', err);
    return INITIAL_CLINICAL_PATIENTS;
  }
}

export function saveStoredClinicalPatients(patients: ClinicalPatient[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CLINICAL_STORAGE_KEY, JSON.stringify(patients));
    window.dispatchEvent(new Event('clinical_patients_updated'));
    fetch('/api/clinical-patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patients)
    }).catch(() => {});
  } catch (err) {
    console.error('Erro ao salvar pacientes no localStorage:', err);
  }
}

// Sincronização inicial com o servidor com merge sem perda de dados
if (typeof window !== 'undefined') {
  fetch('/api/clinical-patients?t=' + Date.now())
    .then((r) => r.json())
    .then((res) => {
      const local = getStoredClinicalPatients();
      if (res?.success && Array.isArray(res.data) && res.data.length > 0) {
        const map = new Map<string, ClinicalPatient>();
        res.data.forEach((p: ClinicalPatient) => {
          if (p && p.id) map.set(p.id, p);
        });
        local.forEach((p: ClinicalPatient) => {
          if (p && p.id && !map.has(p.id)) {
            map.set(p.id, p);
          }
        });
        const merged = Array.from(map.values());
        localStorage.setItem(CLINICAL_STORAGE_KEY, JSON.stringify(merged));
        window.dispatchEvent(new Event('clinical_patients_updated'));
      } else if (local && local.length > 0) {
        // Envia os pacientes locais para salvar no servidor se o arquivo do servidor ainda não tiver sido gravado
        fetch('/api/clinical-patients', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(local)
        }).catch(() => {});
      }
    })
    .catch(() => {});
}

export function useClinicalPatients() {
  const [patients, setPatients] = useState<ClinicalPatient[]>(getStoredClinicalPatients());

  useEffect(() => {
    const sync = () => {
      setPatients(getStoredClinicalPatients());
    };
    window.addEventListener('clinical_patients_updated', sync);
    window.addEventListener('storage', sync);
    window.addEventListener('admin-sync-clinical_patients', sync);
    return () => {
      window.removeEventListener('clinical_patients_updated', sync);
      window.removeEventListener('storage', sync);
      window.removeEventListener('admin-sync-clinical_patients', sync);
    };
  }, []);

  const savePatient = (patientData: Partial<ClinicalPatient> & { id?: string }): ClinicalPatient => {
    const current = getStoredClinicalPatients();
    let saved: ClinicalPatient;

    if (patientData.id) {
      // Edit
      const index = current.findIndex(p => p.id === patientData.id);
      if (index >= 0) {
        saved = {
          ...current[index],
          ...patientData,
          updatedAt: new Date().toISOString()
        } as ClinicalPatient;
        current[index] = saved;
      } else {
        saved = {
          ...createBlankPatient(),
          ...patientData,
          id: patientData.id,
          updatedAt: new Date().toISOString()
        } as ClinicalPatient;
        current.unshift(saved);
      }
    } else {
      // Create new
      const nextNum = String(current.length + 1).padStart(3, '0');
      const now = new Date().toISOString();
      saved = {
        ...createBlankPatient(),
        ...patientData,
        id: `pat-${Date.now()}`,
        registrationNumber: `PRONT-2026-${nextNum}`,
        createdAt: now,
        updatedAt: now
      } as ClinicalPatient;
      current.unshift(saved);
    }

    saveStoredClinicalPatients(current);
    setPatients([...current]);
    return saved;
  };

  const removePatient = (id: string): void => {
    const current = getStoredClinicalPatients().filter(p => p.id !== id);
    saveStoredClinicalPatients(current);
    setPatients(current);
  };

  const resetToSample = (): void => {
    saveStoredClinicalPatients(INITIAL_CLINICAL_PATIENTS);
    setPatients(INITIAL_CLINICAL_PATIENTS);
  };

  return {
    patients,
    savePatient,
    removePatient,
    resetToSample
  };
}

export function createBlankPatient(): Omit<ClinicalPatient, 'id' | 'createdAt' | 'updatedAt' | 'registrationNumber'> {
  return {
    status: 'ativo',
    fullName: '',
    birthDate: '',
    gender: 'Feminino',
    cpf: '',
    rg: '',
    phone: '',
    email: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: 'Adrianópolis',
      city: 'Manaus',
      state: 'AM',
      zipCode: '69057-000'
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: ''
    },
    anamnese: {
      mainGoal: '',
      physicalActivityCurrent: false,
      physicalActivityDetails: '',
      chronicPainOrInjury: false,
      chronicPainDetails: '',
      recentOrPastSurgeries: false,
      surgeriesDetails: '',
      cardiacOrBloodPressure: 'normal',
      cardiacDetails: '',
      continuousMedication: false,
      medicationDetails: '',
      dizzinessOrVertigo: false,
      dizzinessDetails: '',
      isPregnant: false,
      gestationalWeeks: undefined,
      additionalNotes: ''
    },
    medicalInfo: {
      doctorName: '',
      doctorSpecialty: '',
      doctorPhone: '',
      examAttachments: []
    },
    terms: {
      consentAccepted: true,
      consentSignedAt: new Date().toISOString(),
      consentSignatureName: '',
      imageUsageAuthorized: false,
      imageUsageSignedAt: undefined,
      cancellationPolicyAccepted: true,
      cancellationPolicySignedAt: new Date().toISOString()
    },
    evolutionNotes: []
  };
}

// -------------------------------------------------------------
// IMPRESSÃO DIRETA: DECLARAÇÃO DE COMPARECIMENTO (LEI VIGENTE)
// -------------------------------------------------------------
export function printAttendanceDeclarationDirect(params: {
  patient: ClinicalPatient;
  sessionDate: string; // YYYY-MM-DD
  startTime: string;   // Ex: 08:00
  endTime: string;     // Ex: 09:00
  purpose: string;     // Ex: Sessão de Fisioterapia & Pilates Clínico
  professionalName?: string;
  professionalCrefito?: string;
  clinicAddress?: string;
  clinicPhone?: string;
}): void {
  const {
    patient,
    sessionDate,
    startTime,
    endTime,
    purpose,
    professionalName = 'Dra. Léia Mar',
    professionalCrefito = '12345-F',
    clinicAddress = 'Av. Jornalista Umberto Calderaro Filho, 1420 - Adrianópolis, Manaus - AM',
    clinicPhone = '(92) 99123-4567'
  } = params;

  // Format date to Brazilian locale
  const [year, month, day] = (sessionDate || '').split('-');
  const dateFormatted = day && month && year ? `${day}/${month}/${year}` : sessionDate;

  // Today long date
  const today = new Date();
  const monthsPt = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  const dateInWords = `Manaus - AM, ${today.getDate()} de ${monthsPt[today.getMonth()]} de ${today.getFullYear()}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Declaração de Comparecimento - ${escapeHtml(patient.fullName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 20mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Helvetica, Arial, sans-serif;
      color: #1A1A1A;
      background: #FFFFFF;
      font-size: 14pt;
      line-height: 1.8;
      padding: 20mm 15mm;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #D85072;
      padding-bottom: 20px;
      margin-bottom: 40px;
    }
    .clinic-name {
      font-size: 22pt;
      font-weight: bold;
      color: #8C3B50;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .clinic-sub {
      font-size: 11pt;
      color: #666;
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .clinic-contacts {
      font-size: 9.5pt;
      color: #777;
      margin-top: 6px;
    }
    .doc-title {
      text-align: center;
      font-size: 18pt;
      font-weight: bold;
      color: #26161B;
      margin-top: 30px;
      margin-bottom: 40px;
      text-transform: uppercase;
      letter-spacing: 2px;
      text-decoration: underline;
      text-underline-offset: 6px;
    }
    .declaration-body {
      text-align: justify;
      text-indent: 40px;
      margin-bottom: 40px;
      font-size: 13.5pt;
      line-height: 2.1;
      color: #222;
    }
    .declaration-body strong {
      color: #000;
      font-weight: 700;
    }
    .patient-box {
      background: #FDF9FA;
      border: 1px solid #F2DCE2;
      border-radius: 8px;
      padding: 14px 20px;
      margin: 25px 0 35px 0;
      font-size: 11pt;
      line-height: 1.6;
    }
    .patient-box-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }
    .date-location {
      text-align: right;
      margin-top: 60px;
      margin-bottom: 70px;
      font-size: 12pt;
      color: #333;
    }
    .signature-area {
      text-align: center;
      width: 320px;
      margin: 0 auto;
      border-top: 1.5px solid #222;
      padding-top: 10px;
    }
    .signature-name {
      font-size: 13pt;
      font-weight: bold;
      color: #111;
    }
    .signature-crefito {
      font-size: 11pt;
      color: #555;
      margin-top: 2px;
    }
    .footer-note {
      position: fixed;
      bottom: 12mm;
      left: 15mm;
      right: 15mm;
      text-align: center;
      font-size: 8.5pt;
      color: #888;
      border-top: 1px solid #EEE;
      padding-top: 10px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="clinic-name">Dra. Léia Mar</div>
    <div class="clinic-sub">Fisioterapia Especializada & Studio de Pilates</div>
    <div class="clinic-contacts">
      ${escapeHtml(clinicAddress)} • WhatsApp: ${escapeHtml(clinicPhone)}
    </div>
  </div>

  <div class="doc-title">DECLARAÇÃO DE COMPARECIMENTO</div>

  <p class="declaration-body">
    Declaro para os devidos fins de comprovação e justificativa de ausência, que 
    o(a) paciente/aluno(a) <strong>${escapeHtml(patient.fullName)}</strong>, 
    portador(a) do CPF nº <strong>${escapeHtml(patient.cpf || 'Não informado')}</strong> e 
    RG nº <strong>${escapeHtml(patient.rg || 'Não informado')}</strong>, 
    compareceu a este estabelecimento no dia <strong>${escapeHtml(dateFormatted)}</strong>, 
    permanecendo em atendimento individualizado no horário das 
    <strong>${escapeHtml(startTime)}</strong> às <strong>${escapeHtml(endTime)}</strong>, 
    para realização de <strong>${escapeHtml(purpose)}</strong> sob meus cuidados profissionais.
  </p>

  <div class="patient-box">
    <div class="patient-box-row">
      <span><strong>Prontuário:</strong> ${escapeHtml(patient.registrationNumber)}</span>
      <span><strong>Data do Atendimento:</strong> ${escapeHtml(dateFormatted)}</span>
    </div>
    <div class="patient-box-row">
      <span><strong>Horário:</strong> ${escapeHtml(startTime)} às ${escapeHtml(endTime)}</span>
      <span><strong>Objetivo:</strong> ${escapeHtml(purpose)}</span>
    </div>
  </div>

  <div class="date-location">
    ${dateInWords}
  </div>

  <div class="signature-area">
    <div class="signature-name">${escapeHtml(professionalName)}</div>
    <div class="signature-crefito">Fisioterapeuta • CREFITO: ${escapeHtml(professionalCrefito)}</div>
    <div class="signature-crefito" style="font-size: 9pt; color: #888; margin-top: 3px;">Assinatura & Carimbo Profissional</div>
  </div>

  <div class="footer-note">
    Documento emitido em conformidade com o Código de Ética e Deontologia da Fisioterapia (Resolução COFFITO nº 424) e Lei Geral de Proteção de Dados (Lei 13.709/2018).
  </div>
</body>
</html>`;

  triggerDirectPrint(html, `Declaracao_Comparecimento_${patient.fullName.replace(/\s+/g, '_')}`);
}

// -------------------------------------------------------------
// IMPRESSÃO DIRETA: PRONTUÁRIO CLÍNICO & ANAMNESE COMPLETA
// -------------------------------------------------------------
export function printClinicalRecordDirect(patient: ClinicalPatient): void {
  const age = calculateAge(patient.birthDate);
  const today = new Date().toLocaleDateString('pt-BR');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Prontuário Clínico & Anamnese - ${escapeHtml(patient.fullName)}</title>
  <style>
    @page {
      size: A4 portrait;
      margin: 15mm;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, Roboto, Helvetica, Arial, sans-serif;
      color: #1A1A1A;
      background: #FFF;
      font-size: 10pt;
      line-height: 1.5;
      padding: 10mm 5mm;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px solid #D85072;
      padding-bottom: 12px;
      margin-bottom: 16px;
    }
    .header h1 {
      font-size: 16pt;
      color: #8C3B50;
      text-transform: uppercase;
      font-weight: bold;
    }
    .header p {
      font-size: 8.5pt;
      color: #666;
    }
    .badge {
      background: #FFEBF0;
      color: #9C2744;
      padding: 4px 10px;
      border-radius: 6px;
      font-weight: bold;
      font-size: 9pt;
      border: 1px solid #FCD6E0;
    }
    .section-title {
      background: #F9ECEF;
      color: #8C3B50;
      padding: 6px 12px;
      font-size: 10.5pt;
      font-weight: bold;
      border-left: 4px solid #D85072;
      margin-top: 14px;
      margin-bottom: 8px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px 16px;
      font-size: 9.5pt;
    }
    .grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 8px 16px;
      font-size: 9.5pt;
    }
    .field {
      margin-bottom: 6px;
    }
    .field-label {
      font-weight: bold;
      color: #444;
      display: block;
      font-size: 8.5pt;
      text-transform: uppercase;
    }
    .field-val {
      color: #111;
      font-size: 9.5pt;
    }
    .box-anamnese {
      background: #FAFAFA;
      border: 1px solid #EAEAEA;
      border-radius: 6px;
      padding: 10px 14px;
      margin-bottom: 8px;
    }
    .status-tag {
      display: inline-block;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 8pt;
      font-weight: bold;
    }
    .status-sim { background: #FDE8E8; color: #9C2744; }
    .status-nao { background: #EBF7EE; color: #1D7A46; }
    .signature-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 40px;
      padding-top: 20px;
    }
    .signature-line {
      border-top: 1px solid #333;
      padding-top: 6px;
      text-align: center;
      font-size: 9pt;
    }
    .footer-doc {
      margin-top: 25px;
      border-top: 1px solid #DDD;
      padding-top: 8px;
      font-size: 8pt;
      color: #888;
      display: flex;
      justify-content: space-between;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <h1>Dra. Léia Mar • Prontuário & Ficha Clínica</h1>
      <p>Studio de Fisioterapia & Pilates • CREFITO 12345-F • Manaus - AM</p>
    </div>
    <div>
      <span class="badge">${escapeHtml(patient.registrationNumber)}</span>
    </div>
  </div>

  <div class="section-title">1. Dados Pessoais e Contato</div>
  <div class="grid-3">
    <div class="field">
      <span class="field-label">Nome Completo:</span>
      <span class="field-val"><strong>${escapeHtml(patient.fullName)}</strong></span>
    </div>
    <div class="field">
      <span class="field-label">Data de Nascimento / Idade:</span>
      <span class="field-val">${escapeHtml(patient.birthDate)} (${age.label})</span>
    </div>
    <div class="field">
      <span class="field-label">Gênero:</span>
      <span class="field-val">${escapeHtml(patient.gender)}</span>
    </div>
  </div>

  <div class="grid-3">
    <div class="field">
      <span class="field-label">CPF:</span>
      <span class="field-val">${escapeHtml(patient.cpf || 'Não informado')}</span>
    </div>
    <div class="field">
      <span class="field-label">RG:</span>
      <span class="field-val">${escapeHtml(patient.rg || 'Não informado')}</span>
    </div>
    <div class="field">
      <span class="field-label">Telefone / WhatsApp:</span>
      <span class="field-val">${escapeHtml(patient.phone || 'Não informado')}</span>
    </div>
  </div>

  <div class="grid-2">
    <div class="field">
      <span class="field-label">E-mail:</span>
      <span class="field-val">${escapeHtml(patient.email || 'Não informado')}</span>
    </div>
    <div class="field">
      <span class="field-label">Endereço Residencial Completo:</span>
      <span class="field-val">
        ${escapeHtml(patient.address.street || '')}, ${escapeHtml(patient.address.number || '')} 
        ${patient.address.complement ? '- ' + escapeHtml(patient.address.complement) : ''} - 
        ${escapeHtml(patient.address.neighborhood || '')}, ${escapeHtml(patient.address.city || '')} / ${escapeHtml(patient.address.state || '')} - CEP: ${escapeHtml(patient.address.zipCode || '')}
      </span>
    </div>
  </div>

  <div class="section-title">2. Contato de Emergência</div>
  <div class="grid-3">
    <div class="field">
      <span class="field-label">Nome do Contato:</span>
      <span class="field-val">${escapeHtml(patient.emergencyContact.name || 'Não informado')}</span>
    </div>
    <div class="field">
      <span class="field-label">Grau de Parentesco:</span>
      <span class="field-val">${escapeHtml(patient.emergencyContact.relationship || 'Não informado')}</span>
    </div>
    <div class="field">
      <span class="field-label">Telefone de Emergência:</span>
      <span class="field-val"><strong>${escapeHtml(patient.emergencyContact.phone || 'Não informado')}</strong></span>
    </div>
  </div>

  <div class="section-title">3. Histórico de Saúde e Anamnese Fisioterapêutica</div>
  <div class="box-anamnese">
    <div class="field" style="margin-bottom: 8px;">
      <span class="field-label">Objetivo Principal:</span>
      <span class="field-val" style="font-size: 10pt; color: #8C3B50; font-weight: bold;">
        ${escapeHtml(patient.anamnese.mainGoal || 'Não informado')}
      </span>
    </div>
    <div class="grid-2">
      <div class="field">
        <span class="field-label">Pratica atividade física atualmente?</span>
        <span class="status-tag ${patient.anamnese.physicalActivityCurrent ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.physicalActivityCurrent ? 'SIM' : 'NÃO'}
        </span>
        ${patient.anamnese.physicalActivityDetails ? `<div style="font-size: 9pt; margin-top: 3px;">${escapeHtml(patient.anamnese.physicalActivityDetails)}</div>` : ''}
      </div>
      <div class="field">
        <span class="field-label">Possui lesão ou dor crônica? (hérnia, escoliose, joelhos, ombros):</span>
        <span class="status-tag ${patient.anamnese.chronicPainOrInjury ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.chronicPainOrInjury ? 'SIM' : 'NÃO'}
        </span>
        ${patient.anamnese.chronicPainDetails ? `<div style="font-size: 9pt; margin-top: 3px;"><strong>Detalhes:</strong> ${escapeHtml(patient.anamnese.chronicPainDetails)}</div>` : ''}
      </div>
    </div>

    <div class="grid-2" style="margin-top: 8px;">
      <div class="field">
        <span class="field-label">Cirurgia recente ou antiga?</span>
        <span class="status-tag ${patient.anamnese.recentOrPastSurgeries ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.recentOrPastSurgeries ? 'SIM' : 'NÃO'}
        </span>
        ${patient.anamnese.surgeriesDetails ? `<div style="font-size: 9pt; margin-top: 3px;">${escapeHtml(patient.anamnese.surgeriesDetails)}</div>` : ''}
      </div>
      <div class="field">
        <span class="field-label">Problema Cardíaco ou de Pressão (alta/baixa):</span>
        <span class="status-tag ${patient.anamnese.cardiacOrBloodPressure !== 'normal' ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.cardiacOrBloodPressure.toUpperCase()}
        </span>
        ${patient.anamnese.cardiacDetails ? `<div style="font-size: 9pt; margin-top: 3px;">${escapeHtml(patient.anamnese.cardiacDetails)}</div>` : ''}
      </div>
    </div>

    <div class="grid-3" style="margin-top: 8px;">
      <div class="field">
        <span class="field-label">Medicamento de uso contínuo?</span>
        <span class="status-tag ${patient.anamnese.continuousMedication ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.continuousMedication ? 'SIM' : 'NÃO'}
        </span>
        ${patient.anamnese.medicationDetails ? `<div style="font-size: 8.5pt; margin-top: 2px;">${escapeHtml(patient.anamnese.medicationDetails)}</div>` : ''}
      </div>
      <div class="field">
        <span class="field-label">Tonturas, vertigens ou labirintite?</span>
        <span class="status-tag ${patient.anamnese.dizzinessOrVertigo ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.dizzinessOrVertigo ? 'SIM' : 'NÃO'}
        </span>
        ${patient.anamnese.dizzinessDetails ? `<div style="font-size: 8.5pt; margin-top: 2px;">${escapeHtml(patient.anamnese.dizzinessDetails)}</div>` : ''}
      </div>
      <div class="field">
        <span class="field-label">Aluna Gestante?</span>
        <span class="status-tag ${patient.anamnese.isPregnant ? 'status-sim' : 'status-nao'}">
          ${patient.anamnese.isPregnant ? `SIM (${patient.anamnese.gestationalWeeks || '?'} semanas)` : 'NÃO'}
        </span>
      </div>
    </div>

    ${patient.anamnese.additionalNotes ? `
      <div class="field" style="margin-top: 8px; border-top: 1px dashed #DDD; padding-top: 6px;">
        <span class="field-label">Observações Clínicas Adicionais:</span>
        <div style="font-size: 9pt; color: #333;">${escapeHtml(patient.anamnese.additionalNotes)}</div>
      </div>
    ` : ''}
  </div>

  <div class="section-title">4. Informações Médicas Complementares</div>
  <div class="grid-2">
    <div class="field">
      <span class="field-label">Médico Assistente / Especialista:</span>
      <span class="field-val">${escapeHtml(patient.medicalInfo.doctorName || 'Não possui acompanhamento externo no momento')} ${patient.medicalInfo.doctorSpecialty ? `(${escapeHtml(patient.medicalInfo.doctorSpecialty)})` : ''}</span>
    </div>
    <div class="field">
      <span class="field-label">Telefone do Médico:</span>
      <span class="field-val">${escapeHtml(patient.medicalInfo.doctorPhone || 'Não informado')}</span>
    </div>
  </div>
  ${patient.medicalInfo.examAttachments && patient.medicalInfo.examAttachments.length > 0 ? `
    <div class="field" style="margin-top: 4px;">
      <span class="field-label">Exames e Laudos Anexados:</span>
      <ul style="margin-left: 20px; font-size: 9pt; color: #444; margin-top: 3px;">
        ${patient.medicalInfo.examAttachments.map(ex => `<li><strong>[${escapeHtml(ex.type)}]</strong> ${escapeHtml(ex.name)} (${escapeHtml(ex.date)}) - ${escapeHtml(ex.notes || '')}</li>`).join('')}
      </ul>
    </div>
  ` : '<div style="font-size: 8.5pt; color: #777; margin-top: 2px;">Nenhum laudo ou exame externo anexado.</div>'}

  <div class="section-title">6. Termos e Autorizações (Conforme Lei Vigente)</div>
  <div style="font-size: 9pt; line-height: 1.6; background: #FFFDFB; border: 1px solid #FCD6E0; border-radius: 6px; padding: 10px 14px;">
    <p><strong>a) Termo de Consentimento e Responsabilidade:</strong> ${patient.terms.consentAccepted ? 'Aceito e Assinado digitalmente atestando que todas as informações de saúde são autênticas e verdadeiras.' : 'Pendente'}</p>
    <p><strong>c) Autorização de Uso de Imagem:</strong> ${patient.terms.imageUsageAuthorized ? 'AUTORIZADO expressamente para divulgação científica e registros do estúdio em redes sociais.' : 'NÃO AUTORIZADO (uso restrito interno).'}</p>
    <p><strong>d) Termo de Ciência da Política de Desmarques e Reposições:</strong> ${patient.terms.cancellationPolicyAccepted ? 'Ciente e de acordo com o prazo mínimo de 24 horas para remarcações sem perda da aula.' : 'Pendente'}</p>
  </div>

  <div class="signature-grid">
    <div class="signature-line">
      <strong>${escapeHtml(patient.terms.consentSignatureName || patient.fullName)}</strong><br>
      Assinatura do(a) Aluno(a) / Paciente<br>
      <span style="font-size: 7.5pt; color: #666;">Data: ${today}</span>
    </div>
    <div class="signature-line">
      <strong>Dra. Léia Mar</strong><br>
      Fisioterapeuta Responsável • CREFITO 12345-F<br>
      <span style="font-size: 7.5pt; color: #666;">Data: ${today}</span>
    </div>
  </div>

  <div class="footer-doc">
    <span>Prontuário emitido sob normas do COFFITO e LGPD (Lei Federal 13.709/2018).</span>
    <span>Emissão em: ${today}</span>
  </div>
</body>
</html>`;

  triggerDirectPrint(html, `Prontuario_${patient.fullName.replace(/\s+/g, '_')}`);
}

function escapeHtml(str: string | undefined | null): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function triggerDirectPrint(htmlContent: string, titleDoc: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0px';
  iframe.style.height = '0px';
  iframe.style.border = 'none';
  iframe.style.visibility = 'hidden';
  iframe.id = 'direct-print-clinical-frame';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!doc || !iframe.contentWindow) {
    document.body.removeChild(iframe);
    window.print();
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (e) {
      console.warn('Fallback print:', e);
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 3000);
    }
  }, 350);
}

// -------------------------------------------------------------
// EXPORTAÇÃO DO HISTÓRICO CLÍNICO EM PDF (PADRÃO BAIXAR PDF)
// -------------------------------------------------------------
export function exportClinicalPatientsToPDF(patients: ClinicalPatient[]): void {
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

  // Header background
  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 297, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Studio de Pilates', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 18);
  doc.text(`Prontuário & Histórico Clínico Geral de Alunos e Pacientes`, 14, 23);

  // Subtitle
  doc.setTextColor(45, 30, 35);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Oficial de Histórico Clínico & Cadastros de Pacientes', 14, 34);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 90, 95);
  doc.text(`Emitido em: ${today}  |  Total de Pacientes: ${patients.length}`, 14, 40);

  const tableData = patients.map((p) => {
    const age = calculateAge(p.birthDate);
    const dorOuLesao = p.anamnese.chronicPainOrInjury ? `Sim: ${p.anamnese.chronicPainDetails || 'Sem detalhes'}` : 'Não';
    const cirurgias = p.anamnese.recentOrPastSurgeries ? `Sim: ${p.anamnese.surgeriesDetails || 'Sem detalhes'}` : 'Não';
    const pressao = p.anamnese.cardiacOrBloodPressure === 'hipertensao' ? 'Hipertensão' : p.anamnese.cardiacOrBloodPressure === 'hipotensao' ? 'Hipotensão' : 'Normal';

    return [
      p.registrationNumber,
      p.fullName,
      `${age.years} anos`,
      p.cpf || '-',
      p.phone || '-',
      p.anamnese.mainGoal || '-',
      dorOuLesao,
      cirurgias,
      pressao,
      p.status.toUpperCase()
    ];
  });

  autoTable(doc, {
    startY: 45,
    head: [['Prontuário', 'Nome do Paciente', 'Idade', 'CPF', 'Telefone', 'Objetivo Principal', 'Dor/Lesão', 'Cirurgia', 'Pressão', 'Status']],
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
      cellPadding: 2,
      textColor: [40, 30, 35]
    },
    columnStyles: {
      0: { cellWidth: 24 },
      1: { cellWidth: 42 },
      2: { cellWidth: 16 },
      3: { cellWidth: 26 },
      4: { cellWidth: 26 },
      5: { cellWidth: 42 },
      6: { cellWidth: 38 },
      7: { cellWidth: 28 },
      8: { cellWidth: 18 },
      9: { cellWidth: 18 }
    },
    alternateRowStyles: {
      fillColor: [253, 246, 244]
    }
  });

  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(140, 130, 135);
    doc.text(
      `Dra. Léia Mar Fisioterapia & Pilates • Manaus-AM • Prontuário Confidencial (LGPD) • Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.height - 7
    );
  }

  const todayStr = new Date().toISOString().split('T')[0];
  doc.save(`Historico_Clinico_Pacientes_Dra_Leia_Mar_${todayStr}.pdf`);
}

// -------------------------------------------------------------
// EXPORTAÇÃO DE DECLARAÇÃO DE COMPARECIMENTO (XLS & PDF)
// -------------------------------------------------------------
export function exportDeclarationToXLS(params: {
  patient: ClinicalPatient;
  sessionDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  professionalName: string;
  professionalCrefito: string;
}): void {
  const { patient, sessionDate, startTime, endTime, purpose, professionalName, professionalCrefito } = params;
  const formattedDate = sessionDate ? sessionDate.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');

  const rows = [
    {
      'Documento': 'DECLARAÇÃO DE COMPARECIMENTO',
      'Nº Prontuário': patient.registrationNumber,
      'Paciente / Aluno(a)': patient.fullName,
      'CPF': patient.cpf || 'Não informado',
      'RG': patient.rg || 'Não informado',
      'Data do Atendimento': formattedDate,
      'Horário Início': startTime,
      'Horário Término': endTime,
      'Finalidade / Procedimento': purpose,
      'Profissional Emitente': professionalName,
      'CREFITO': professionalCrefito,
      'Clínica': 'Dra. Léia Mar — Fisioterapia & Pilates'
    }
  ];

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [
    { wch: 30 },
    { wch: 18 },
    { wch: 30 },
    { wch: 18 },
    { wch: 16 },
    { wch: 20 },
    { wch: 15 },
    { wch: 15 },
    { wch: 45 },
    { wch: 26 },
    { wch: 18 },
    { wch: 35 }
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Declaracao_Comparecimento');
  const safeName = patient.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Declaracao_Comparecimento_${safeName}.xlsx`);
}

export function exportDeclarationToPDF(params: {
  patient: ClinicalPatient;
  sessionDate: string;
  startTime: string;
  endTime: string;
  purpose: string;
  professionalName: string;
  professionalCrefito: string;
}): void {
  const { patient, sessionDate, startTime, endTime, purpose, professionalName, professionalCrefito } = params;
  const formattedDate = sessionDate ? sessionDate.split('-').reverse().join('/') : new Date().toLocaleDateString('pt-BR');
  const todayFull = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 16, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${professionalCrefito || CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 16, 21);
  doc.text(`${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 16, 27);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('DECLARAÇÃO DE COMPARECIMENTO', 105, 52, { align: 'center' });

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  const declarationBody = `Declaro, para os devidos fins de comprovação junto ao empregador, instituição de ensino ou órgão competente, que o(a) paciente/aluno(a) ${patient.fullName}, inscrito(a) no CPF sob o nº ${patient.cpf || 'Não informado'} e RG nº ${patient.rg || 'Não informado'}, esteve presente neste estabelecimento de saúde no dia ${formattedDate}, no período das ${startTime} às ${endTime}, para realização de ${purpose}.`;

  const splitText = doc.splitTextToSize(declarationBody, 174);
  doc.text(splitText, 18, 70);

  autoTable(doc, {
    startY: 110,
    head: [['Campo de Identificação', 'Informação Registrada']],
    body: [
      ['Nº do Prontuário', patient.registrationNumber],
      ['Nome do Paciente / Aluno(a)', patient.fullName],
      ['CPF / RG', `${patient.cpf || 'Não informado'} / ${patient.rg || 'Não informado'}`],
      ['Data do Comparecimento', formattedDate],
      ['Horário de Permanência', `Das ${startTime} às ${endTime}`],
      ['Procedimento / Finalidade', purpose],
      ['Profissional Responsável', `${professionalName} (CREFITO ${professionalCrefito})`],
      ['Local de Atendimento', `${CLINIC_INFO.address} - ${CLINIC_INFO.neighborhood}, ${CLINIC_INFO.cityState}`]
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9.5
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 9.5,
      cellPadding: 3.5
    },
    columnStyles: {
      0: { cellWidth: 60, fontStyle: 'bold' },
      1: { cellWidth: 114 }
    },
    margin: { left: 18, right: 18 }
  });

  doc.setFontSize(10);
  doc.text(`Manaus - AM, ${todayFull}.`, 105, 215, { align: 'center' });

  doc.line(60, 242, 150, 242);
  doc.setFont('helvetica', 'bold');
  doc.text(professionalName, 105, 248, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Fisioterapeuta • CREFITO ${professionalCrefito}`, 105, 253, { align: 'center' });

  const safeName = patient.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Declaracao_Comparecimento_${safeName}.pdf`);
}

// -------------------------------------------------------------
// RECIBO DE PAGAMENTO CONFORME A LEI (PDF, XLS & WHATSAPP)
// Atende à Lei nº 8.846/94, art. 319 do Código Civil e normas da Receita Federal
// -------------------------------------------------------------
export interface ReceiptData {
  receiptNumber: string;
  patient: ClinicalPatient;
  value: number;
  valueInWords?: string;
  serviceDescription: string;
  competenceMonth: string;
  paymentMethod: string;
  paymentDate: string;
  professionalName: string;
  professionalCrefito: string;
  observations?: string;
}

export function exportReceiptToPDF(receipt: ReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  // Outer border & background tint
  doc.setDrawColor(216, 80, 114);
  doc.setLineWidth(0.8);
  doc.rect(10, 10, 190, 277);

  // Inner subtle border
  doc.setDrawColor(252, 214, 224);
  doc.setLineWidth(0.3);
  doc.rect(13, 13, 184, 271);

  // Header Banner
  doc.setFillColor(140, 59, 80);
  doc.rect(13, 13, 184, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('times', 'bold');
  doc.setFontSize(16);
  doc.text('Dra. Léia Mar — Studio de Fisioterapia & Pilates', 105, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text(`CREFITO: ${receipt.professionalCrefito || CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 105, 29, { align: 'center' });
  doc.text(`${CLINIC_INFO.address}, ${CLINIC_INFO.neighborhood} - ${CLINIC_INFO.cityState}`, 105, 35, { align: 'center' });

  // Receipt Number & Title Box
  doc.setFillColor(255, 245, 247);
  doc.rect(18, 46, 174, 20, 'F');
  doc.setDrawColor(252, 214, 224);
  doc.rect(18, 46, 174, 20);

  doc.setTextColor(156, 39, 68);
  doc.setFont('times', 'bold');
  doc.setFontSize(14);
  doc.text('RECIBO DE PAGAMENTO DE SERVIÇOS DE SAÚDE', 105, 54, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(91, 68, 76);
  doc.text(`Nº REGISTRO: ${receipt.receiptNumber}`, 24, 61);
  doc.text(`VALOR PAGO: ${formatBRL(receipt.value)}`, 186, 61, { align: 'right' });

  // Legal declaration body
  const dateFormatted = receipt.paymentDate
    ? receipt.paymentDate.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');

  const textBody =
    `Recebi(emos) de ${receipt.patient.fullName.toUpperCase()}, inscrito(a) no CPF sob o nº ${receipt.patient.cpf || 'Não informado'} e RG nº ${receipt.patient.rg || 'Não informado'}, residente em ${receipt.patient.address.street}, ${receipt.patient.address.number || 'S/N'} - ${receipt.patient.address.neighborhood}, ${receipt.patient.address.city}/${receipt.patient.address.state}, a importância de ${formatBRL(receipt.value)}${receipt.valueInWords ? ` (${receipt.valueInWords})` : ''}, referente à prestação de serviços profissionais descritos abaixo, pelo que firmo(amos) o presente recibo dando-lhe plena, rasa e irrevogável quitação.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(38, 22, 27);
  const splitBody = doc.splitTextToSize(textBody, 174);
  doc.text(splitBody, 18, 74);

  // Table with detailed receipt breakdown
  const tableStartY = 74 + splitBody.length * 5 + 4;

  autoTable(doc, {
    startY: tableStartY,
    head: [['Discriminação dos Dados Contábeis & Fiscais', 'Informações Oficiais Registradas']],
    body: [
      ['Nº do Recibo de Quitação', receipt.receiptNumber],
      ['Paciente / Aluno(a)', receipt.patient.fullName],
      ['CPF do Pagador (Obrigatório IRPF)', receipt.patient.cpf || 'Não informado'],
      ['Serviço Prestado', receipt.serviceDescription],
      ['Mês de Competência / Período', receipt.competenceMonth],
      ['Forma de Pagamento', receipt.paymentMethod.toUpperCase()],
      ['Data Efetiva do Pagamento', dateFormatted],
      ['Profissional Responsável', `${receipt.professionalName} (CREFITO ${receipt.professionalCrefito})`],
      ['Valor Líquido Quitado', `${formatBRL(receipt.value)}${receipt.valueInWords ? `\n(${receipt.valueInWords})` : ''}`],
      ['Observações / Notas', receipt.observations || 'Atendimento realizado conforme diretrizes técnicas e éticas do COFFITO.']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [156, 39, 68],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 8.5,
      cellPadding: 3
    },
    columnStyles: {
      0: { cellWidth: 62, fontStyle: 'bold' },
      1: { cellWidth: 112 }
    },
    margin: { left: 18, right: 18 }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;

  // Legal compliance note
  doc.setFontSize(7.5);
  doc.setTextColor(140, 59, 80);
  doc.setFont('helvetica', 'italic');
  doc.text(
    'Documento emitido para fins fiscais, comprobatórios e de dedução legal na Declaração de Imposto de Renda Pessoa Física (IRPF - Receita Federal do Brasil), em consonância com a Lei nº 8.846/94 e o Código Civil Brasileiro.',
    105,
    finalY,
    { align: 'center', maxWidth: 174 }
  );

  // Signature Block
  const sigY = finalY + 24;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.setTextColor(38, 22, 27);
  doc.text(`Manaus - AM, ${dateFormatted}.`, 105, sigY, { align: 'center' });

  doc.setDrawColor(91, 68, 76);
  doc.line(55, sigY + 22, 155, sigY + 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(receipt.professionalName, 105, sigY + 27, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(140, 59, 80);
  doc.text(`Fisioterapeuta • CREFITO: ${receipt.professionalCrefito}`, 105, sigY + 32, { align: 'center' });
  doc.text('Studio de Fisioterapia & Pilates Dra. Léia Mar', 105, sigY + 36, { align: 'center' });

  const safeName = receipt.patient.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Recibo_Pagamento_${safeName}_${receipt.receiptNumber}.pdf`);
}

export function exportReceiptToXLS(receipt: ReceiptData): void {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const rows = [
    { 'Campo': 'Número do Recibo', 'Valor': receipt.receiptNumber },
    { 'Campo': 'Nome do Aluno/Paciente', 'Valor': receipt.patient.fullName },
    { 'Campo': 'CPF', 'Valor': receipt.patient.cpf || '-' },
    { 'Campo': 'RG', 'Valor': receipt.patient.rg || '-' },
    { 'Campo': 'Telefone / WhatsApp', 'Valor': receipt.patient.phone || '-' },
    { 'Campo': 'Endereço', 'Valor': `${receipt.patient.address.street}, ${receipt.patient.address.number || ''} - ${receipt.patient.address.neighborhood}, ${receipt.patient.address.city}/${receipt.patient.address.state}` },
    { 'Campo': 'Serviço Prestado', 'Valor': receipt.serviceDescription },
    { 'Campo': 'Mês de Competência', 'Valor': receipt.competenceMonth },
    { 'Campo': 'Forma de Pagamento', 'Valor': receipt.paymentMethod },
    { 'Campo': 'Data do Pagamento', 'Valor': receipt.paymentDate },
    { 'Campo': 'Valor Pago (R$)', 'Valor': formatBRL(receipt.value) },
    { 'Campo': 'Valor por Extenso', 'Valor': receipt.valueInWords || '-' },
    { 'Campo': 'Profissional Emissor', 'Valor': `${receipt.professionalName} (CREFITO ${receipt.professionalCrefito})` },
    { 'Campo': 'Clínica', 'Valor': CLINIC_INFO.name },
    { 'Campo': 'Observações', 'Valor': receipt.observations || '-' }
  ];

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 30 }, { wch: 60 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Recibo');

  const safeName = receipt.patient.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Recibo_Pagamento_${safeName}_${receipt.receiptNumber}.xlsx`);
}

export function getReceiptWhatsAppText(receipt: ReceiptData): string {
  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  const dateFormatted = receipt.paymentDate
    ? receipt.paymentDate.split('-').reverse().join('/')
    : new Date().toLocaleDateString('pt-BR');

  return `*RECIBO DE PAGAMENTO • ${CLINIC_INFO.name.toUpperCase()}* 🌸

Olá, *${receipt.patient.fullName}*! Segue a confirmação e o comprovante do seu pagamento com respaldo legal:

📋 *Nº do Recibo:* ${receipt.receiptNumber}
💰 *Valor Pago:* ${formatBRL(receipt.value)}
📝 *Por Extenso:* ${receipt.valueInWords || ''}
🧘‍♀️ *Serviço:* ${receipt.serviceDescription}
📅 *Competência:* ${receipt.competenceMonth}
💳 *Forma de Pagamento:* ${receipt.paymentMethod}
🗓️ *Data:* ${dateFormatted}
👩‍⚕️ *Profissional:* ${receipt.professionalName} (CREFITO: ${receipt.professionalCrefito})

📍 *Local:* ${CLINIC_INFO.address} - ${CLINIC_INFO.neighborhood}

_Declaro para os devidos fins de direito e em conformidade com o art. 319 do Código Civil Brasileiro haver recebido a importância retro mencionada, dando plena e geral quitação._

Agradecemos pela confiança em nosso cuidado! ✨`;
}

// -------------------------------------------------------------
// EXPORTAÇÃO DE FICHA INDIVIDUAL / PRONTUÁRIO COMPLETO (XLS & PDF)
// -------------------------------------------------------------
export function exportSinglePatientRecordToXLS(patient: ClinicalPatient): void {
  const age = calculateAge(patient.birthDate);
  const rows = [
    { 'Seção': '1. Dados Pessoais', 'Campo': 'Nº Prontuário', 'Valor': patient.registrationNumber },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'Nome Completo', 'Valor': patient.fullName },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'Nascimento / Idade', 'Valor': `${patient.birthDate} (${age.label})` },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'Gênero', 'Valor': patient.gender },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'CPF', 'Valor': patient.cpf || '-' },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'RG', 'Valor': patient.rg || '-' },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'Telefone / WhatsApp', 'Valor': patient.phone || '-' },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'E-mail', 'Valor': patient.email || '-' },
    { 'Seção': '1. Dados Pessoais', 'Campo': 'Endereço', 'Valor': `${patient.address.street}, ${patient.address.number} ${patient.address.complement || ''} - ${patient.address.neighborhood}, ${patient.address.city}/${patient.address.state} - CEP: ${patient.address.zipCode}` },
    { 'Seção': '2. Contato de Emergência', 'Campo': 'Nome', 'Valor': patient.emergencyContact.name || '-' },
    { 'Seção': '2. Contato de Emergência', 'Campo': 'Parentesco', 'Valor': patient.emergencyContact.relationship || '-' },
    { 'Seção': '2. Contato de Emergência', 'Campo': 'Telefone', 'Valor': patient.emergencyContact.phone || '-' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Objetivo Principal', 'Valor': patient.anamnese.mainGoal || '-' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Atividade Física Atual', 'Valor': patient.anamnese.physicalActivityCurrent ? `Sim (${patient.anamnese.physicalActivityDetails || ''})` : 'Não' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Lesão ou Dor Crônica', 'Valor': patient.anamnese.chronicPainOrInjury ? `Sim (${patient.anamnese.chronicPainDetails || ''})` : 'Não' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Cirurgias Recentes ou Antigas', 'Valor': patient.anamnese.recentOrPastSurgeries ? `Sim (${patient.anamnese.surgeriesDetails || ''})` : 'Não' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Pressão / Cardíaco', 'Valor': `${patient.anamnese.cardiacOrBloodPressure} ${patient.anamnese.cardiacDetails || ''}` },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Medicamentos de Uso Contínuo', 'Valor': patient.anamnese.continuousMedication ? `Sim (${patient.anamnese.medicationDetails || ''})` : 'Não' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Tontura / Vertigem / Labirintite', 'Valor': patient.anamnese.dizzinessOrVertigo ? `Sim (${patient.anamnese.dizzinessDetails || ''})` : 'Não' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Gestante', 'Valor': patient.anamnese.isPregnant ? `Sim (${patient.anamnese.gestationalWeeks || ''} semanas)` : 'Não' },
    { 'Seção': '3. Anamnese & Saúde', 'Campo': 'Observações Clínicas', 'Valor': patient.anamnese.additionalNotes || '-' },
    { 'Seção': '4. Informações Médicas', 'Campo': 'Médico Acompanhante', 'Valor': `${patient.medicalInfo.doctorName || '-'} (${patient.medicalInfo.doctorSpecialty || '-'}) - Tel: ${patient.medicalInfo.doctorPhone || '-'}` },
    { 'Seção': '5. Termos & LGPD', 'Campo': 'Termo de Consentimento', 'Valor': patient.terms.consentAccepted ? 'Aceito e Assinado' : 'Pendente' },
    { 'Seção': '5. Termos & LGPD', 'Campo': 'Uso de Imagem', 'Valor': patient.terms.imageUsageAuthorized ? 'Autorizado' : 'Não autorizado' },
    { 'Seção': '5. Termos & LGPD', 'Campo': 'Política de Desmarques (24h)', 'Valor': patient.terms.cancellationPolicyAccepted ? 'Ciente e Aceito' : 'Pendente' }
  ];

  const ws = XLSX.utils.json_to_sheet(rows);
  ws['!cols'] = [{ wch: 28 }, { wch: 32 }, { wch: 65 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ficha_Prontuario');
  const safeName = patient.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  XLSX.writeFile(wb, `Prontuario_${patient.registrationNumber}_${safeName}.xlsx`);
}

export function exportSinglePatientRecordToPDF(patient: ClinicalPatient): void {
  const age = calculateAge(patient.birthDate);
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  doc.setFillColor(140, 59, 80);
  doc.rect(0, 0, 210, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('Dra. Léia Mar — Fisioterapia & Pilates', 14, 11);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`CREFITO: ${CLINIC_INFO.crefito}  •  WhatsApp: ${CLINIC_INFO.phoneDisplay}`, 14, 17);
  doc.text(`Ficha Oficial de Prontuário & Anamnese Clínica (Padrão COFFITO & LGPD)`, 14, 23);

  doc.setTextColor(38, 22, 27);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`PRONTUÁRIO CLÍNICO INDIVIDUAL — ${patient.registrationNumber}`, 14, 37);

  doc.setFontSize(9.5);
  doc.text(`Paciente / Aluno(a): ${patient.fullName}  |  Status: ${patient.status.toUpperCase()}`, 14, 43);

  autoTable(doc, {
    startY: 48,
    head: [['Seção Clínica', 'Item / Pergunta', 'Registro do Paciente']],
    body: [
      ['1. Dados Pessoais', 'Nascimento / Idade', `${patient.birthDate} (${age.label})`],
      ['1. Dados Pessoais', 'Gênero', patient.gender],
      ['1. Dados Pessoais', 'CPF / RG', `${patient.cpf || '-'} / ${patient.rg || '-'}`],
      ['1. Dados Pessoais', 'Telefone / E-mail', `${patient.phone || '-'}  |  ${patient.email || '-'}`],
      ['1. Dados Pessoais', 'Endereço Completo', `${patient.address.street}, ${patient.address.number} ${patient.address.complement || ''} - ${patient.address.neighborhood}, ${patient.address.city}/${patient.address.state}`],
      ['2. Emergência', 'Contato de Emergência', `${patient.emergencyContact.name || '-'} (${patient.emergencyContact.relationship || '-'}) — Tel: ${patient.emergencyContact.phone || '-'}`],
      ['3. Anamnese', 'Objetivo Principal', patient.anamnese.mainGoal || '-'],
      ['3. Anamnese', 'Atividade Física Atual', patient.anamnese.physicalActivityCurrent ? `Sim: ${patient.anamnese.physicalActivityDetails || ''}` : 'Não'],
      ['3. Anamnese', 'Lesão ou Dor Crônica', patient.anamnese.chronicPainOrInjury ? `Sim: ${patient.anamnese.chronicPainDetails || ''}` : 'Não'],
      ['3. Anamnese', 'Cirurgias', patient.anamnese.recentOrPastSurgeries ? `Sim: ${patient.anamnese.surgeriesDetails || ''}` : 'Não'],
      ['3. Anamnese', 'Pressão / Cardíaco', `${patient.anamnese.cardiacOrBloodPressure.toUpperCase()} ${patient.anamnese.cardiacDetails || ''}`],
      ['3. Anamnese', 'Medicamentos Contínuos', patient.anamnese.continuousMedication ? `Sim: ${patient.anamnese.medicationDetails || ''}` : 'Não'],
      ['3. Anamnese', 'Tontura / Labirintite', patient.anamnese.dizzinessOrVertigo ? `Sim: ${patient.anamnese.dizzinessDetails || ''}` : 'Não'],
      ['3. Anamnese', 'Gestante', patient.anamnese.isPregnant ? `Sim (${patient.anamnese.gestationalWeeks || ''} semanas)` : 'Não'],
      ['3. Anamnese', 'Observações Adicionais', patient.anamnese.additionalNotes || '-'],
      ['4. Médico', 'Médico Acompanhante', `${patient.medicalInfo.doctorName || '-'} (${patient.medicalInfo.doctorSpecialty || '-'}) — Tel: ${patient.medicalInfo.doctorPhone || '-'}`],
      ['5. Termos & LGPD', 'Consentimento & Veracidade', patient.terms.consentAccepted ? 'Aceito e Assinado' : 'Pendente'],
      ['5. Termos & LGPD', 'Autorização de Imagem', patient.terms.imageUsageAuthorized ? 'Autorizado' : 'Não autorizado'],
      ['5. Termos & LGPD', 'Política de Reposição (24h)', patient.terms.cancellationPolicyAccepted ? 'Ciente e Aceito' : 'Pendente']
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [140, 59, 80],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5
    },
    bodyStyles: {
      textColor: [38, 22, 27],
      fontSize: 8,
      cellPadding: 2.5
    },
    columnStyles: {
      0: { cellWidth: 34, fontStyle: 'bold' },
      1: { cellWidth: 48, fontStyle: 'bold' },
      2: { cellWidth: 100 }
    },
    margin: { left: 14, right: 14 }
  });

  const safeName = patient.fullName.replace(/[^a-zA-Z0-9_-]/g, '_');
  doc.save(`Prontuario_${patient.registrationNumber}_${safeName}.pdf`);
}

