import { useState, useEffect } from 'react';

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
  neighborhood: string;
  cityState: string;
  cep: string;
  landmarks: string;
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
  defaultWhatsAppMessage: "Olá Dra. Léia! Gostaria de saber mais sobre as sessões de Pilates no seu estúdio na Cidade Nova (Manaus) e agendar uma avaliação.",

  // Início (Hero)
  heroEyebrow: "PILATES • FISIOTERAPIA • MANAUS-AM",
  heroTitle: "Seu corpo em movimento.",
  heroHighlight: "Sua vida com mais alegria e leveza.",
  heroDescription: "Pilates privativo e personalizado conduzido pela Dra. Léia Mar na Cidade Nova, Manaus. Desenvolva força profunda, flexibilidade, postura e liberdade sem dor em um ambiente acolhedor.",
  heroCta1Text: "Agendamento Automático",
  heroCta2Text: "Falar no WhatsApp",
  heroReassurance1: "Atendimento privativo & exclusivo",
  heroReassurance2: "Cidade Nova • Manaus-AM",
  heroReassurance3: "Altos da Academia New Fit",

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

  // Localização
  address: "Avenida Noel Nutels, 1762",
  neighborhood: "Cidade Nova",
  cityState: "Manaus - AM",
  cep: "69090-000",
  landmarks: "Altos da Academia NEW FIT",
  parkingInfo: "Fácil acesso pela Av. Noel Nutels, com facilidade de estacionamento nas proximidades e acesso seguro.",
  googleMapsDirectionsUrl: "https://www.google.com/maps/search/?api=1&query=Avenida+Noel+Nutels,+1762+-+Cidade+Nova,+Manaus+-+AM",
  wazeUrl: "https://waze.com/ul?q=Avenida+Noel+Nutels+1762+Manaus",
  googleMapsEmbedUrl: "https://maps.google.com/maps?q=Avenida%20Noel%20Nutels%2C%201762%20-%20Cidade%20Nova%20Manaus%20AM&t=&z=16&ie=UTF8&iwloc=&output=embed",
  hours: [
    { days: "Segunda a Sexta-feira", time: "07:00 às 19:00" },
    { days: "Sábados", time: "08:00 às 12:00" },
    { days: "Domingos e Feriados", time: "Fechado" }
  ]
};

const STORAGE_KEY = 'dra_leia_clinic_data_v1';
const CLINIC_DATA_CHANGED_EVENT = 'dra_leia_clinic_data_changed';

export function getStoredClinicData(): ClinicData {
  if (typeof window === 'undefined') return DEFAULT_CLINIC_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CLINIC_DATA;
    return { ...DEFAULT_CLINIC_DATA, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CLINIC_DATA;
  }
}

export function saveStoredClinicData(data: ClinicData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event(CLINIC_DATA_CHANGED_EVENT));
  } catch (e) {
    console.error('Erro ao salvar dados da clínica:', e);
  }
}

export function resetStoredClinicData(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event(CLINIC_DATA_CHANGED_EVENT));
  } catch (e) {
    console.error('Erro ao resetar dados da clínica:', e);
  }
}

export function useClinicData(): ClinicData {
  const [data, setData] = useState<ClinicData>(getStoredClinicData());

  useEffect(() => {
    const handleUpdate = () => {
      setData(getStoredClinicData());
    };
    window.addEventListener(CLINIC_DATA_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(CLINIC_DATA_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return data;
}
