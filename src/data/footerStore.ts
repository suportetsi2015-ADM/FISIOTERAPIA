import { useState, useEffect } from 'react';

export interface SocialLinkItem {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin' | 'maps' | 'custom';
  label: string;
  url: string;
  customIconUrl?: string; // Optional custom image/icon uploaded by user
  active: boolean;
}

export interface FooterNavItem {
  id: string;
  label: string;
  href: string;
  active: boolean;
}

export interface FooterConfig {
  // Logo do Rodapé (inserir, alterar, modificar, editar, excluir/ocultar)
  logoUrl: string;
  logoHeight: number; // in pixels (e.g. 56)
  showLogo: boolean;
  logoBackground: 'transparent' | 'white';

  // Identificação da Empresa e CNPJ
  brandTitle: string;
  brandSubtitle: string;
  companyLegalName: string;
  cnpj: string;
  showCnpj: boolean;
  brandDescription: string;

  // Títulos das Colunas
  navTitle: string;
  contactTitle: string;
  badgeText: string;
  copyrightText: string;

  // Dados de Endereço & Contato do Rodapé
  contactAddress?: string;
  contactLandmarks?: string;
  contactNeighborhood?: string;
  contactCityState?: string;
  contactPhone?: string;

  // Links de Navegação do Rodapé (inserir, alterar, editar, excluir, reordenar)
  navLinks: FooterNavItem[];

  // Políticas Legais
  privacyTitle: string;
  privacyText: string;
  termsTitle: string;
  termsText: string;

  // Redes Sociais & Ícones
  socialLinks: SocialLinkItem[];
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  logoUrl: '/images/logo_transparente.png',
  logoHeight: 56,
  showLogo: true,
  logoBackground: 'transparent',

  brandTitle: 'Dra. Léia Mar',
  brandSubtitle: 'Fisioterapia & Pilates • CREFITO 426910-F',
  companyLegalName: 'MOVEX CENTRO DE MOVIMENTO E PERFORMANCE',
  cnpj: '69.533.975/0001-81',
  showCnpj: true,

  brandDescription:
    'Pilates personalizado com olhar fisioterapêutico especializado em Manaus. Atendimento exclusivo, acolhedor e individualizado para saúde da coluna, reabilitação, força profunda e qualidade de vida.',
  navTitle: 'Navegação',
  contactTitle: 'Estúdio & Contato',
  badgeText: '',
  copyrightText: '© 2026 Dra. Léia Mar — Todos os direitos reservados. CNPJ: 69.533.975/0001-81 - MOVEX CENTRO DE MOVIMENTO E PERFORMANCE • CREFITO 426910-F.',
  
  contactAddress: '',
  contactLandmarks: '',
  contactNeighborhood: '',
  contactCityState: '',
  contactPhone: '',

  navLinks: [
    { id: 'fnav-inicio', label: 'Início', href: '/', active: true },
    { id: 'fnav-agendamento', label: 'Agendamento Online', href: '#agendamento', active: true },
    { id: 'fnav-pilates', label: 'Pilates com Propósito', href: '#pilates', active: true },
    { id: 'fnav-beneficios', label: 'Benefícios', href: '#beneficios', active: true },
    { id: 'fnav-sobre', label: 'Sobre a Dra. Léia', href: '#sobre', active: true },
    { id: 'fnav-metodo', label: 'Método & Fases', href: '#metodo', active: true },
    { id: 'fnav-espaco', label: 'Nosso Estúdio', href: '#espaco', active: true },
    { id: 'fnav-depoimentos', label: 'Depoimentos', href: '#depoimentos', active: true },
    { id: 'fnav-faq', label: 'Dúvidas Frequentes', href: '#faq', active: true },
    { id: 'fnav-localizacao', label: 'Localização em Manaus', href: '#localizacao', active: true }
  ],

  privacyTitle: 'Política de Privacidade',
  privacyText:
    'Respeitamos a sua privacidade. Seus dados pessoais de contato e saúde compartilhados para agendamento de sessões de Pilates são confidenciais e utilizados estritamente para a prestação do serviço e contato direto da clínica.',
  termsTitle: 'Termos de Uso',
  termsText:
    'Este site tem caráter informativo sobre os serviços de Fisioterapia e Pilates da Dra. Léia Mar na Cidade Nova, Manaus-AM. As avaliações e sessões são agendadas mediante disponibilidade de horários.',
  
  socialLinks: [
    {
      id: 'soc-whatsapp',
      platform: 'whatsapp',
      label: 'WhatsApp de Atendimento',
      url: 'https://wa.me/5592986201641?text=Ol%C3%A1%2C%20gostaria%20de%20informa%C3%A7%C3%B5es%20sobre%20as%20sess%C3%B5es%20de%20Pilates.',
      active: true
    },
    {
      id: 'soc-instagram',
      platform: 'instagram',
      label: 'Instagram Oficial (@dra.leiamar)',
      url: 'https://instagram.com',
      active: true
    },
    {
      id: 'soc-maps',
      platform: 'maps',
      label: 'Localização no Google Maps',
      url: '#localizacao',
      active: true
    }
  ]
};

const FOOTER_STORAGE_KEY = 'dra_leia_footer_config_v1';

export function getStoredFooterConfig(): FooterConfig {
  try {
    const saved = localStorage.getItem(FOOTER_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...DEFAULT_FOOTER_CONFIG,
        ...parsed,
        navLinks: Array.isArray(parsed.navLinks) && parsed.navLinks.length > 0 ? parsed.navLinks : DEFAULT_FOOTER_CONFIG.navLinks,
        socialLinks: Array.isArray(parsed.socialLinks) ? parsed.socialLinks : DEFAULT_FOOTER_CONFIG.socialLinks
      };
    }
  } catch (e) {
    console.error('Erro ao ler configuração do rodapé:', e);
  }
  return DEFAULT_FOOTER_CONFIG;
}

export function saveStoredFooterConfig(config: FooterConfig): void {
  try {
    localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('dra_leia_footer_updated'));
    if (typeof window !== 'undefined') {
      fetch('/api/footer-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao salvar configuração do rodapé:', e);
  }
}

export function resetStoredFooterConfig(): FooterConfig {
  try {
    localStorage.removeItem(FOOTER_STORAGE_KEY);
    window.dispatchEvent(new Event('dra_leia_footer_updated'));
    if (typeof window !== 'undefined') {
      fetch('/api/footer-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(DEFAULT_FOOTER_CONFIG)
      }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao resetar configuração do rodapé:', e);
  }
  return DEFAULT_FOOTER_CONFIG;
}

export function initFooterDataSync(): void {
  if (typeof window === 'undefined') return;
  fetch('/api/footer-data')
    .then(res => res.json())
    .then(res => {
      if (res?.success && res.data && typeof res.data === 'object') {
        localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(res.data));
        window.dispatchEvent(new Event('dra_leia_footer_updated'));
      }
    })
    .catch(() => {});
}

export function useFooterData(): {
  config: FooterConfig;
  updateConfig: (patch: Partial<FooterConfig>) => void;
  addSocialLink: (link: Omit<SocialLinkItem, 'id'>) => void;
  updateSocialLink: (id: string, patch: Partial<SocialLinkItem>) => void;
  deleteSocialLink: (id: string) => void;
  reorderSocialLinks: (links: SocialLinkItem[]) => void;
  addNavLink: (item: Omit<FooterNavItem, 'id'>) => void;
  updateNavLink: (id: string, patch: Partial<FooterNavItem>) => void;
  deleteNavLink: (id: string) => void;
  reorderNavLinks: (links: FooterNavItem[]) => void;
  resetConfig: () => void;
} {
  const [config, setConfig] = useState<FooterConfig>(getStoredFooterConfig);

  useEffect(() => {
    initFooterDataSync();
    const handleUpdate = () => {
      setConfig(getStoredFooterConfig());
    };
    window.addEventListener('dra_leia_footer_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-footer_data', (e: any) => {
      if (e.detail) {
        localStorage.setItem(FOOTER_STORAGE_KEY, JSON.stringify(e.detail));
      }
      handleUpdate();
    });
    return () => {
      window.removeEventListener('dra_leia_footer_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('admin-sync-footer_data', handleUpdate);
    };
  }, []);

  const updateConfig = (patch: Partial<FooterConfig>) => {
    const updated = { ...config, ...patch };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const addSocialLink = (link: Omit<SocialLinkItem, 'id'>) => {
    const newId = `soc-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const updatedLinks = [...config.socialLinks, { ...link, id: newId }];
    const updated = { ...config, socialLinks: updatedLinks };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const updateSocialLink = (id: string, patch: Partial<SocialLinkItem>) => {
    const updatedLinks = config.socialLinks.map(item =>
      item.id === id ? { ...item, ...patch } : item
    );
    const updated = { ...config, socialLinks: updatedLinks };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const deleteSocialLink = (id: string) => {
    const updatedLinks = config.socialLinks.filter(item => item.id !== id);
    const updated = { ...config, socialLinks: updatedLinks };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const reorderSocialLinks = (links: SocialLinkItem[]) => {
    const updated = { ...config, socialLinks: links };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const addNavLink = (item: Omit<FooterNavItem, 'id'>) => {
    const newId = `fnav-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const updatedNav = [...config.navLinks, { ...item, id: newId }];
    const updated = { ...config, navLinks: updatedNav };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const updateNavLink = (id: string, patch: Partial<FooterNavItem>) => {
    const updatedNav = config.navLinks.map(item =>
      item.id === id ? { ...item, ...patch } : item
    );
    const updated = { ...config, navLinks: updatedNav };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const deleteNavLink = (id: string) => {
    const updatedNav = config.navLinks.filter(item => item.id !== id);
    const updated = { ...config, navLinks: updatedNav };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const reorderNavLinks = (links: FooterNavItem[]) => {
    const updated = { ...config, navLinks: links };
    saveStoredFooterConfig(updated);
    setConfig(updated);
  };

  const resetConfig = () => {
    const reset = resetStoredFooterConfig();
    setConfig(reset);
  };

  return {
    config,
    updateConfig,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    reorderSocialLinks,
    addNavLink,
    updateNavLink,
    deleteNavLink,
    reorderNavLinks,
    resetConfig
  };
}
