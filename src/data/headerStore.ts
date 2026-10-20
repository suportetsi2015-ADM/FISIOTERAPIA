import { useState, useEffect } from 'react';

export interface HeaderNavItem {
  id: string;
  label: string;
  href: string;
  openInNewTab?: boolean;
  active: boolean;
}

export interface HeaderConfig {
  // Logo
  logoUrl: string;
  logoHeight: number; // in pixels (e.g. 52)
  showLogo: boolean;
  logoShape: 'natural' | 'circular' | 'rounded';
  logoBackground: 'transparent' | 'white';

  // Marca & Identidade
  brandTitle: string;
  brandSubtitle: string;
  showSubtitle: boolean;

  // Itens de Navegação (inserir, editar, excluir, ativar/desativar, reordenar)
  navItems: HeaderNavItem[];

  // Botão CTA (Agendamento)
  showCtaButton: boolean;
  ctaButtonText: string;
  ctaButtonAction: 'booking_modal' | 'scroll_agendamento' | 'whatsapp';

  // Botão WhatsApp / Telefone
  showWhatsAppButton: boolean;
  whatsAppText: string;
  whatsAppPhoneDisplay: string;
  whatsAppPhoneRaw: string;

  // Estilo do Cabeçalho
  headerStyle: 'glass' | 'solid' | 'bordered';
}

export const DEFAULT_HEADER_CONFIG: HeaderConfig = {
  logoUrl: '/images/logo_transparente.png',
  logoHeight: 52,
  showLogo: true,
  logoShape: 'natural',
  logoBackground: 'transparent',

  brandTitle: 'Dra. Léia Mar',
  brandSubtitle: 'Fisioterapia & Pilates',
  showSubtitle: true,

  navItems: [
    { id: 'nav-inicio', label: 'Início', href: '/', active: true },
    { id: 'nav-agendamento', label: 'Agendamento', href: '#agendamento', active: true },
    { id: 'nav-pilates', label: 'Pilates', href: '#pilates', active: true },
    { id: 'nav-beneficios', label: 'Benefícios', href: '#beneficios', active: true },
    { id: 'nav-sobre', label: 'Sobre', href: '#sobre', active: true },
    { id: 'nav-metodo', label: 'Método', href: '#metodo', active: true },
    { id: 'nav-espaco', label: 'Espaço', href: '#espaco', active: true },
    { id: 'nav-depoimentos', label: 'Depoimentos', href: '#depoimentos', active: true },
    { id: 'nav-localizacao', label: 'Localização', href: '#localizacao', active: true }
  ],

  showCtaButton: true,
  ctaButtonText: 'Agendar Sessão',
  ctaButtonAction: 'booking_modal',

  showWhatsAppButton: true,
  whatsAppText: 'WhatsApp',
  whatsAppPhoneDisplay: '(92) 98620-1641',
  whatsAppPhoneRaw: '5592986201641',

  headerStyle: 'glass'
};

const HEADER_STORAGE_KEY = 'dra_leia_header_config_v1';
const HEADER_CHANGED_EVENT = 'dra_leia_header_updated';

export function getStoredHeaderConfig(): HeaderConfig {
  try {
    const saved = localStorage.getItem(HEADER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_HEADER_CONFIG,
        ...parsed,
        navItems: Array.isArray(parsed.navItems) && parsed.navItems.length > 0 ? parsed.navItems : DEFAULT_HEADER_CONFIG.navItems
      };
    }
  } catch (e) {
    console.error('Erro ao ler configuração do cabeçalho:', e);
  }
  return DEFAULT_HEADER_CONFIG;
}

export function saveStoredHeaderConfig(config: HeaderConfig): void {
  try {
    localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event(HEADER_CHANGED_EVENT));
    if (typeof window !== 'undefined') {
      fetch('/api/header-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao salvar configuração do cabeçalho:', e);
  }
}

export function resetStoredHeaderConfig(): void {
  try {
    localStorage.removeItem(HEADER_STORAGE_KEY);
    window.dispatchEvent(new Event(HEADER_CHANGED_EVENT));
    if (typeof window !== 'undefined') {
      fetch('/api/header-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_HEADER_CONFIG)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao resetar configuração do cabeçalho:', e);
  }
}

export function useHeaderData() {
  const [config, setConfig] = useState<HeaderConfig>(getStoredHeaderConfig);

  useEffect(() => {
    // 1. Tentar carregar dados atualizados do servidor na montagem
    fetch('/api/header-data')
      .then(res => res.json())
      .then(res => {
        if (res && res.success && res.data) {
          localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(res.data));
          setConfig({
            ...DEFAULT_HEADER_CONFIG,
            ...res.data,
            navItems: Array.isArray(res.data.navItems) && res.data.navItems.length > 0 ? res.data.navItems : DEFAULT_HEADER_CONFIG.navItems
          });
        }
      })
      .catch(() => {});

    // 2. Ouvintes de eventos em tempo real
    const handleUpdate = () => {
      setConfig(getStoredHeaderConfig());
    };

    window.addEventListener(HEADER_CHANGED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-header_data', (e: any) => {
      if (e.detail) {
        localStorage.setItem(HEADER_STORAGE_KEY, JSON.stringify(e.detail));
      }
      handleUpdate();
    });

    return () => {
      window.removeEventListener(HEADER_CHANGED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin-sync-header_data', handleUpdate);
    };
  }, []);

  const updateConfig = (partial: Partial<HeaderConfig>) => {
    const updated: HeaderConfig = {
      ...config,
      ...partial
    };
    setConfig(updated);
    saveStoredHeaderConfig(updated);
  };

  const addNavItem = (item: Omit<HeaderNavItem, 'id'>) => {
    const newItem: HeaderNavItem = {
      id: `nav-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      ...item
    };
    const updated = {
      ...config,
      navItems: [...config.navItems, newItem]
    };
    setConfig(updated);
    saveStoredHeaderConfig(updated);
  };

  const updateNavItem = (id: string, partial: Partial<HeaderNavItem>) => {
    const updated = {
      ...config,
      navItems: config.navItems.map(item => item.id === id ? { ...item, ...partial } : item)
    };
    setConfig(updated);
    saveStoredHeaderConfig(updated);
  };

  const deleteNavItem = (id: string) => {
    const updated = {
      ...config,
      navItems: config.navItems.filter(item => item.id !== id)
    };
    setConfig(updated);
    saveStoredHeaderConfig(updated);
  };

  const reorderNavItems = (newOrder: HeaderNavItem[]) => {
    const updated = {
      ...config,
      navItems: newOrder
    };
    setConfig(updated);
    saveStoredHeaderConfig(updated);
  };

  const resetConfig = () => {
    resetStoredHeaderConfig();
    setConfig(DEFAULT_HEADER_CONFIG);
  };

  return {
    config,
    updateConfig,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    reorderNavItems,
    resetConfig
  };
}
