import { useState, useEffect } from 'react';
import { safeStorage } from '../utils/safeStorage';

export interface ClinicCredential {
  id: string;
  title: string;
  desc: string;
}

export interface ClinicData {
  // General Info
  name: string;
  crefito: string;
  role: string;
  phoneDisplay: string;
  phoneRaw: string;
  instagramHandle: string;
  instagramUrl: string;
  defaultWhatsAppMessage: string;

  // Início (Hero)
  heroEyebrow: string;
  heroTitle: string;
  heroHighlight: string;
  heroDescription: string;
  heroCta1Text: string;
  heroCta2Text: string;
  heroReassurance1: string;
  heroReassurance2: string;
  heroReassurance3: string;

  // Sobre a Dra. Léia Mar
  aboutTag: string;
  aboutQuote: string;
  aboutPhilosophy: string;
  aboutCredentials: ClinicCredential[];

  // Localização
  address: string;
  addressComplement?: string;
  neighborhood: string;
  cityState: string;
  cep: string;
  landmarks: string;
  referencePoint?: string;
  parkingInfo: string;
  googleMapsDirectionsUrl: string;
  wazeUrl: string;
  googleMapsEmbedUrl: string;
  hours: Array<{ days: string; time: string }>;
}

export const DEFAULT_CLINIC_DATA: ClinicData = {
  name: "Dra. Léia Mar",
  crefito: "426910-F",
  role: "Fisioterapeuta Especialista em Pilates",
  phoneDisplay: "(92) 98620-1641",
  phoneRaw: "5592986201641",
  instagramHandle: "@draleiamar.pilates",
  instagramUrl: "https://instagram.com",
  defaultWhatsAppMessage: "Olá Dra. Léia! Gostaria de saber mais sobre as sessões de Pilates no seu estúdio e agendar uma avaliação.",

  // Início (Hero)
  heroEyebrow: "PILATES • FISIOTERAPIA • MANAUS-AM",
  heroTitle: "Seu corpo em movimento.",
  heroHighlight: "Sua vida com mais alegria e leveza.",
  heroDescription: "Pilates privativo e personalizado conduzido pela Dra. Léia Mar em Manaus. Desenvolva força profunda, flexibilidade, postura e liberdade sem dor em um ambiente acolhedor.",
  heroCta1Text: "Agendamento Automático",
  heroCta2Text: "Falar no WhatsApp",
  heroReassurance1: "Atendimento privativo & exclusivo",
  heroReassurance2: "Novo Aleixo • Manaus-AM",
  heroReassurance3: "Dentro da Academia Infitness",

  // Sobre a Dra. Léia Mar
  aboutTag: "SOBRE A FISIOTERAPEUTA",
  aboutQuote: "“Meu propósito é ajudar cada mulher a se movimentar com liberdade, sem dor, desenvolvendo força profunda e autoestima em cada respiração.”",
  aboutPhilosophy: "Acredito no Pilates como uma experiência de transformação e autocuidado. Fugindo do ambiente barulhento de academias comuns, ofereço um atendimento 100% individualizado, com comandos precisos, correção biomecânica e acolhimento humano.",
  aboutCredentials: [
    {
      id: "cred-1",
      title: "Graduação em Fisioterapia",
      desc: "Formação clínica sólida com ênfase em biomecânica e reabilitação postural."
    },
    {
      id: "cred-2",
      title: "Especialização em Pilates Clássico",
      desc: "Domínio completo de todos os aparelhos: Reformer, Cadillac, Wunda Chair e Ladder Barrel."
    },
    {
      id: "cred-3",
      title: "Certificações em Coluna & Dor",
      desc: "Tratamento conservador de hérnia de disco, lombalgias crônicas e estabilização."
    },
    {
      id: "cred-4",
      title: "Atuação Exclusiva em Pilates",
      desc: "Foco total no método como terapia e qualidade de vida em Manaus."
    }
  ],

  // Localização (Atualizada com os dados reais do estúdio)
  address: "Av. Cel. Sávio Belota, 316",
  addressComplement: "Dentro das dependências da Academia INFITNESS",
  neighborhood: "Novo Aleixo",
  cityState: "Manaus - AM",
  cep: "69029-180",
  landmarks: "Dentro das dependências da Academia INFITNESS",
  referencePoint: "Localizado nas dependências da Academia INFITNESS, no Novo Aleixo, com ambiente privativo e acolhedor.",
  parkingInfo: "Fácil acesso com facilidade de estacionamento nas proximidades e acesso seguro.",
  googleMapsDirectionsUrl: "https://www.google.com/maps/search/?api=1&query=Av.+Cel.+S%C3%A1vio+Belota,+316+-+Novo+Aleixo,+Manaus+-+AM,+69029-180",
  wazeUrl: "https://waze.com/ul?q=Av+Cel+Savio+Belota+316+Manaus",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=Av.%20Cel.%20S%C3%A1vio%20Belota%2C%20316%20-%20Novo%20Aleixo%2C%20Manaus%20-%20AM&t=&z=16&ie=UTF8&iwloc=&output=embed",
  hours: [
    { days: "Segunda a Sexta-feira", time: "08:00 às 19:00" },
    { days: "Sábados", time: "Fechado" },
    { days: "Domingos e Feriados", time: "Fechado" }
  ]
};

const STORAGE_KEY = 'dra_leia_clinic_data_v1';
export const CLINIC_DATA_CHANGED_EVENT = 'dra_leia_clinic_data_changed';
const CLINIC_BROADCAST_CHANNEL = 'dra_leia_clinic_sync_channel';

let cachedClinicData: ClinicData = DEFAULT_CLINIC_DATA;

function getClinicBroadcastChannel(): BroadcastChannel | null {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      return new BroadcastChannel(CLINIC_BROADCAST_CHANNEL);
    } catch (_) {}
  }
  return null;
}

export function getStoredClinicData(): ClinicData {
  if (typeof window === 'undefined') return cachedClinicData;
  try {
    const raw = safeStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        cachedClinicData = { ...DEFAULT_CLINIC_DATA, ...parsed };
        return cachedClinicData;
      }
    }
  } catch (_) {}
  return cachedClinicData;
}

export function saveStoredClinicData(data: ClinicData): void {
  cachedClinicData = { ...DEFAULT_CLINIC_DATA, ...data };
  try {
    safeStorage.setItem(STORAGE_KEY, JSON.stringify(cachedClinicData));
    window.dispatchEvent(new Event(CLINIC_DATA_CHANGED_EVENT));
    window.dispatchEvent(new CustomEvent('admin-sync-clinic_data', { detail: cachedClinicData }));

    // Notifica outras abas abertas no mesmo navegador
    try {
      const channel = getClinicBroadcastChannel();
      channel?.postMessage(cachedClinicData);
    } catch (_) {}

    // Sincroniza imediatamente com o servidor para refletir em todos os aparelhos externos
    if (typeof window !== 'undefined') {
      fetch('/api/clinic-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cachedClinicData)
      }).catch((err) => console.warn('Erro ao salvar clinic-data no servidor:', err));
    }
  } catch (e) {
    console.error('Erro ao salvar dados da clínica:', e);
  }
}

export function resetStoredClinicData(): void {
  cachedClinicData = DEFAULT_CLINIC_DATA;
  try {
    safeStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CLINIC_DATA_CHANGED_EVENT));
    if (typeof window !== 'undefined') {
      fetch('/api/clinic-data', {
        method: 'DELETE'
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao resetar dados da clínica:', e);
  }
}

// Sincronização inicial com o servidor
if (typeof window !== 'undefined') {
  // Inicializa o cache a partir do safeStorage imediatamente
  cachedClinicData = getStoredClinicData();

  fetch('/api/clinic-data?t=' + Date.now(), {
    headers: { 'Cache-Control': 'no-cache, no-store' }
  })
    .then((r) => r.json())
    .then((res) => {
      if (res?.success && res.data) {
        cachedClinicData = { ...DEFAULT_CLINIC_DATA, ...res.data };
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(cachedClinicData));
        window.dispatchEvent(new Event(CLINIC_DATA_CHANGED_EVENT));
      }
    })
    .catch(() => {});

  // Ouve atualizações de outras abas via BroadcastChannel
  try {
    const channel = getClinicBroadcastChannel();
    if (channel) {
      channel.onmessage = (event) => {
        if (event && event.data) {
          cachedClinicData = { ...DEFAULT_CLINIC_DATA, ...event.data };
          safeStorage.setItem(STORAGE_KEY, JSON.stringify(cachedClinicData));
          window.dispatchEvent(new Event(CLINIC_DATA_CHANGED_EVENT));
        }
      };
    }
  } catch (_) {}
}

export function useClinicData(): ClinicData {
  const [data, setData] = useState<ClinicData>(getStoredClinicData);

  useEffect(() => {
    const handleUpdate = () => {
      setData(getStoredClinicData());
    };

    const handleSseDetail = (e: any) => {
      if (e && e.detail) {
        cachedClinicData = { ...DEFAULT_CLINIC_DATA, ...e.detail };
        safeStorage.setItem(STORAGE_KEY, JSON.stringify(cachedClinicData));
        setData(cachedClinicData);
      } else {
        handleUpdate();
      }
    };

    window.addEventListener(CLINIC_DATA_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-clinic_data', handleSseDetail);

    // Atualiza imediatamente quando a janela/aba ganha foco
    const handleFocus = () => {
      fetch('/api/clinic-data?t=' + Date.now(), {
        headers: { 'Cache-Control': 'no-cache, no-store' }
      })
        .then((r) => r.json())
        .then((res) => {
          if (res?.success && res.data) {
            cachedClinicData = { ...DEFAULT_CLINIC_DATA, ...res.data };
            safeStorage.setItem(STORAGE_KEY, JSON.stringify(cachedClinicData));
            setData(cachedClinicData);
          }
        })
        .catch(() => {});
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        handleFocus();
      }
    });

    return () => {
      window.removeEventListener(CLINIC_DATA_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin-sync-clinic_data', handleSseDetail);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  return data;
}
