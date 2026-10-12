import { useState, useEffect } from 'react';

export interface SocialLinkItem {
  id: string;
  platform: 'whatsapp' | 'instagram' | 'facebook' | 'youtube' | 'tiktok' | 'linkedin' | 'maps' | 'custom';
  label: string;
  url: string;
  customIconUrl?: string; // Optional custom image/icon uploaded by user
  active: boolean;
}

export interface FooterConfig {
  brandTitle: string;
  brandSubtitle: string;
  brandDescription: string;
  navTitle: string;
  contactTitle: string;
  badgeText: string;
  copyrightText: string;
  privacyTitle: string;
  privacyText: string;
  termsTitle: string;
  termsText: string;
  socialLinks: SocialLinkItem[];
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  brandTitle: 'Dra. Léia Mar',
  brandSubtitle: 'Fisioterapia & Pilates • CREFITO 426910-F',
  brandDescription:
    'Pilates personalizado com olhar fisioterapêutico especializado em Manaus. Atendimento exclusivo, acolhedor e individualizado para saúde da coluna, reabilitação, força profunda e qualidade de vida.',
  navTitle: 'Navegação',
  contactTitle: 'Estúdio & Contato',
  badgeText: '',
  copyrightText: '© 2026 Dra. Léia Mar — Todos os direitos reservados. CREFITO 426910-F.',
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
      fetch('/api/footer-data', { method: 'DELETE' }).catch(() => {});
    }
  } catch (e) {
    console.error('Erro ao resetar rodapé:', e);
  }
  return DEFAULT_FOOTER_CONFIG;
}

// Sincronização inicial com o servidor
if (typeof window !== 'undefined') {
  fetch('/api/footer-data')
    .then((r) => r.json())
    .then((res) => {
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
  resetConfig: () => void;
} {
  const [config, setConfig] = useState<FooterConfig>(getStoredFooterConfig);

  useEffect(() => {
    const handleUpdate = () => {
      setConfig(getStoredFooterConfig());
    };
    window.addEventListener('dra_leia_footer_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('admin-sync-footer_data', handleUpdate);
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
    const newId = `soc-${Date.now()}`;
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
    resetConfig
  };
}
