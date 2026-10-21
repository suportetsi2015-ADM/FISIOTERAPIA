import { useState, useEffect } from 'react';
import { safeStorage } from '../utils/safeStorage';

export interface ThemePalette {
  id: string;
  name: string;
  description: string;
  primary: string;           // Cor principal (botões, ícones de destaque, botões CTA)
  primaryHover: string;      // Hover do botão principal
  accent: string;            // Cor de acento profundo (títulos de destaque, final de gradientes)
  accentHover: string;       // Hover do acento
  pageBg: string;            // Fundo principal da página (One Page)
  pageBgGradientMid: string; // Fundo sutil intermediário para seções alternadas
  cardBg: string;            // Fundo de cartões, caixas e modais
  textDark: string;          // Títulos principais e textos escuros
  textMuted: string;         // Parágrafos e textos secundários
  textAccent: string;        // Subtítulos e pequenos marcadores
  borderLight: string;       // Bordas de cartões e divisórias
  badgeBg: string;           // Fundo de pílulas, tags e badges
  badgeText: string;         // Texto de pílulas e tags
  footerBg: string;          // Fundo institucional escuro do rodapé
}

export const THEME_PRESETS: ThemePalette[] = [
  {
    id: 'boutique-rose',
    name: 'Boutique Rose & Ameixa (Original Dra. Léia Mar)',
    description: 'Paleta nobre, acolhedora e feminina original da marca Dra. Léia Mar.',
    primary: '#D85072',
    primaryHover: '#BC3859',
    accent: '#9C2744',
    accentHover: '#7E1D34',
    pageBg: '#FFFDFB',
    pageBgGradientMid: '#FFF5F5',
    cardBg: '#FFFFFF',
    textDark: '#26161B',
    textMuted: '#5B444C',
    textAccent: '#8C3B50',
    borderLight: '#FCD6E0',
    badgeBg: '#FFEBF0',
    badgeText: '#9C2744',
    footerBg: '#211317'
  },
  {
    id: 'salvia-esmeralda',
    name: 'Menta, Sálvia & Esmeralda (Fisioterapia & Saúde)',
    description: 'Tons verdes terapêuticos e orgânicos, transmitindo cura, vitalidade e reabilitação natural.',
    primary: '#1D7A46',
    primaryHover: '#166237',
    accent: '#0E4724',
    accentHover: '#093319',
    pageBg: '#F9FBF9',
    pageBgGradientMid: '#F1F7F2',
    cardBg: '#FFFFFF',
    textDark: '#132519',
    textMuted: '#3C4F42',
    textAccent: '#265939',
    borderLight: '#BFE3CD',
    badgeBg: '#EAF7EE',
    badgeText: '#125630',
    footerBg: '#112316'
  },
  {
    id: 'champagne-ouro',
    name: 'Ouro Nobre & Champagne (Clínica Boutique Luxury)',
    description: 'Paleta dourada elegante e sofisticada com acabamento luxuoso e clássico.',
    primary: '#B88746',
    primaryHover: '#9C7034',
    accent: '#78511E',
    accentHover: '#5C3C14',
    pageBg: '#FFFDF9',
    pageBgGradientMid: '#FBF5EA',
    cardBg: '#FFFFFF',
    textDark: '#261E14',
    textMuted: '#524535',
    textAccent: '#7D6544',
    borderLight: '#EBD8B8',
    badgeBg: '#FAF2E4',
    badgeText: '#7A521D',
    footerBg: '#1F1810'
  },
  {
    id: 'lavanda-zen',
    name: 'Lavanda & Quartzo Lilás (Serenidade, Yoga & Pilates)',
    description: 'Tons violetas suaves e relaxantes promovendo equilíbrio corporal e tranquilidade mental.',
    primary: '#8B57AC',
    primaryHover: '#744493',
    accent: '#5C2F7A',
    accentHover: '#451F5F',
    pageBg: '#FAF8FD',
    pageBgGradientMid: '#F4EEFB',
    cardBg: '#FFFFFF',
    textDark: '#21142E',
    textMuted: '#4F3E5C',
    textAccent: '#745287',
    borderLight: '#E1D0F0',
    badgeBg: '#F2E9F9',
    badgeText: '#5A2C78',
    footerBg: '#1B0F26'
  },
  {
    id: 'safira-clinico',
    name: 'Azul Safira & Marinho (Reabilitação Ortopédica)',
    description: 'Tons azulados profissionais que inspiram segurança, precisão médica e tranquilidade.',
    primary: '#1E6BB8',
    primaryHover: '#175391',
    accent: '#113C6D',
    accentHover: '#0B284B',
    pageBg: '#F8FAFC',
    pageBgGradientMid: '#EFF5FA',
    cardBg: '#FFFFFF',
    textDark: '#0F1E2E',
    textMuted: '#3B4C5E',
    textAccent: '#1D558A',
    borderLight: '#C7DBED',
    badgeBg: '#EAF2FA',
    badgeText: '#104071',
    footerBg: '#0C1826'
  },
  {
    id: 'terracota-sol',
    name: 'Terracota & Pêssego Solar (Acolhimento & Movimento)',
    description: 'Cores quentes e acolhedoras que remetem à energia do corpo, postura e bem-estar.',
    primary: '#C65B33',
    primaryHover: '#A94B27',
    accent: '#843415',
    accentHover: '#66240C',
    pageBg: '#FDFBFA',
    pageBgGradientMid: '#FBF1EB',
    cardBg: '#FFFFFF',
    textDark: '#291811',
    textMuted: '#574238',
    textAccent: '#8B4B2F',
    borderLight: '#E8CFC2',
    badgeBg: '#F8EBE4',
    badgeText: '#833314',
    footerBg: '#22120C'
  },
  {
    id: 'onix-moderno',
    name: 'Ônix Minimalista & Grafite (Design High-End)',
    description: 'Estética contemporânea e clean com alto contraste e elegância arquitetônica.',
    primary: '#475569',
    primaryHover: '#334155',
    accent: '#1E293B',
    accentHover: '#0F172A',
    pageBg: '#FAFAFA',
    pageBgGradientMid: '#F1F5F9',
    cardBg: '#FFFFFF',
    textDark: '#0F172A',
    textMuted: '#475569',
    textAccent: '#334155',
    borderLight: '#CBD5E1',
    badgeBg: '#F1F5F9',
    badgeText: '#1E293B',
    footerBg: '#0F172A'
  }
];

export const DEFAULT_THEME_PALETTE: ThemePalette = THEME_PRESETS[0];

const STORAGE_THEME_KEY = 'dra_leia_theme_palette_v1';
const THEME_CHANGED_EVENT = 'dra_leia_theme_palette_changed';

let cachedTheme: ThemePalette = DEFAULT_THEME_PALETTE;

// Aplica a paleta dinamicamente ao DOM da página (One Page)
export function applyThemeToDom(theme: ThemePalette): void {
  if (typeof document === 'undefined') return;

  let styleTag = document.getElementById('dra-leia-dynamic-theme-styles') as HTMLStyleElement | null;
  if (!styleTag) {
    styleTag = document.createElement('style');
    styleTag.id = 'dra-leia-dynamic-theme-styles';
    document.head.appendChild(styleTag);
  }

  // Gera as regras CSS que sobrepõem as cores da One Page de forma harmoniosa e completa
  styleTag.textContent = `
    :root {
      --color-theme-primary: ${theme.primary};
      --color-theme-primary-hover: ${theme.primaryHover};
      --color-theme-accent: ${theme.accent};
      --color-theme-accent-hover: ${theme.accentHover};
      --color-theme-bg: ${theme.pageBg};
      --color-theme-bg-mid: ${theme.pageBgGradientMid};
      --color-theme-card-bg: ${theme.cardBg};
      --color-theme-text-dark: ${theme.textDark};
      --color-theme-text-muted: ${theme.textMuted};
      --color-theme-text-accent: ${theme.textAccent};
      --color-theme-border: ${theme.borderLight};
      --color-theme-badge-bg: ${theme.badgeBg};
      --color-theme-badge-text: ${theme.badgeText};
      --color-theme-footer-bg: ${theme.footerBg};
    }

    /* Fundo da página e textos principais */
    #landing-page-root {
      background-color: ${theme.pageBg} !important;
      color: ${theme.textDark} !important;
    }

    body {
      background-color: ${theme.pageBg} !important;
      color: ${theme.textDark} !important;
    }

    /* Sobrescrita de classes de cores da One Page */
    .bg-\\[\\#FFFDFB\\] { background-color: ${theme.pageBg} !important; }
    .bg-\\[\\#FFF5F5\\] { background-color: ${theme.pageBgGradientMid} !important; }
    .text-\\[\\#26161B\\] { color: ${theme.textDark} !important; }
    .text-\\[\\#5B444C\\] { color: ${theme.textMuted} !important; }
    .text-\\[\\#8C3B50\\] { color: ${theme.textAccent} !important; }
    .text-\\[\\#7A2134\\] { color: ${theme.accent} !important; }
    .text-\\[\\#D85072\\] { color: ${theme.primary} !important; }
    .text-\\[\\#9C2744\\] { color: ${theme.accent} !important; }
    .text-\\[\\#BC3859\\] { color: ${theme.primaryHover} !important; }

    /* Bordas */
    .border-\\[\\#FCD6E0\\] { border-color: ${theme.borderLight} !important; }
    .border-\\[\\#FCD6E0\\]\\/60 { border-color: ${theme.borderLight}99 !important; }
    .border-\\[\\#D85072\\] { border-color: ${theme.primary} !important; }

    /* Badges e pílulas */
    .bg-\\[\\#FFEBF0\\] { background-color: ${theme.badgeBg} !important; }
    .bg-\\[\\#FFEBF0\\]\\/70 { background-color: ${theme.badgeBg}B3 !important; }
    .bg-\\[\\#FFEBF0\\]\\/90 { background-color: ${theme.badgeBg}E6 !important; }
    .bg-\\[\\#FDEDF0\\] { background-color: ${theme.badgeBg} !important; }

    /* Botões principais com gradiente */
    .bg-gradient-to-r.from-\\[\\#D85072\\].to-\\[\\#BC3859\\],
    .bg-gradient-to-r.from-\\[\\#D85072\\].to-\\[\\#9C2744\\],
    .from-\\[\\#D85072\\].to-\\[\\#BC3859\\] {
      background-image: linear-gradient(to right, ${theme.primary}, ${theme.accent}) !important;
    }

    .hover\\:from-\\[\\#BC3859\\]:hover {
      --tw-gradient-from: ${theme.primaryHover} var(--tw-gradient-from-position) !important;
    }
    .hover\\:to-\\[\\#9C2744\\]:hover {
      --tw-gradient-to: ${theme.accentHover} var(--tw-gradient-to-position) !important;
    }

    /* Seções Hero com gradiente vertical */
    .from-\\[\\#FFFDFB\\].via-\\[\\#FFF5F5\\].to-\\[\\#FFFDFB\\] {
      background-image: linear-gradient(to bottom, ${theme.pageBg}, ${theme.pageBgGradientMid}, ${theme.pageBg}) !important;
    }

    /* Ambient blurs do Hero */
    #hero .bg-\\[\\#FFEBF0\\]\\/70 {
      background-color: ${theme.badgeBg}B3 !important;
    }

    /* Rodapé principal */
    footer#main-footer, footer[class*="bg-[#211317]"] {
      background-color: ${theme.footerBg} !important;
    }

    /* Seleção de texto no navegador */
    ::selection {
      background-color: ${theme.badgeBg} !important;
      color: ${theme.accent} !important;
    }
  `;
}

// Inicializa o tema do safeStorage ou default
export function getStoredThemePalette(): ThemePalette {
  if (typeof window === 'undefined') return DEFAULT_THEME_PALETTE;
  try {
    const raw = safeStorage.getItem(STORAGE_THEME_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.primary && parsed.accent && parsed.pageBg) {
        cachedTheme = parsed;
        return parsed;
      }
    }
  } catch (_) {}
  return DEFAULT_THEME_PALETTE;
}

export function saveStoredThemePalette(theme: ThemePalette): void {
  cachedTheme = theme;
  try {
    safeStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(theme));
  } catch (_) {}

  applyThemeToDom(theme);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
    window.dispatchEvent(new CustomEvent('admin-sync-theme_data', { detail: theme }));

    // Persiste no servidor para que todos os navegadores e celulares recebam a nova paleta
    fetch('/api/theme-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(theme)
    }).catch((err) => console.warn('Erro ao salvar tema no servidor:', err));
  }
}

export function resetStoredThemePalette(): ThemePalette {
  saveStoredThemePalette(DEFAULT_THEME_PALETTE);
  return DEFAULT_THEME_PALETTE;
}

// Sincronização inicial no boot da aplicação
if (typeof window !== 'undefined') {
  // 1. Aplica o tema local salvo imediatamente para evitar flash
  const initial = getStoredThemePalette();
  applyThemeToDom(initial);

  // 2. Consulta o servidor para garantir a paleta mais recente definida pelo administrador
  fetch('/api/theme-data?t=' + Date.now())
    .then((r) => r.json())
    .then((res) => {
      const serverTheme = res?.data;
      if (serverTheme && serverTheme.primary && serverTheme.pageBg) {
        cachedTheme = serverTheme;
        safeStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(serverTheme));
        applyThemeToDom(serverTheme);
        window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
      }
    })
    .catch(() => {});

  // 3. Ouve atualizações em tempo real disparadas pelo SSE
  window.addEventListener('admin-sync-theme_data', ((e: CustomEvent) => {
    if (e.detail && e.detail.primary) {
      cachedTheme = e.detail;
      safeStorage.setItem(STORAGE_THEME_KEY, JSON.stringify(e.detail));
      applyThemeToDom(e.detail);
      window.dispatchEvent(new Event(THEME_CHANGED_EVENT));
    }
  }) as EventListener);
}

export function useThemePalette() {
  const [theme, setTheme] = useState<ThemePalette>(getStoredThemePalette);

  useEffect(() => {
    const handleUpdate = () => {
      setTheme({ ...cachedTheme });
    };

    window.addEventListener(THEME_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(THEME_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return {
    theme,
    setTheme: saveStoredThemePalette,
    resetTheme: resetStoredThemePalette,
    presets: THEME_PRESETS
  };
}
