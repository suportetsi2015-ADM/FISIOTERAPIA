import React, { useState, useRef } from 'react';
import {
  Share2,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  Upload,
  Globe,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  Linkedin,
  MapPin,
  ExternalLink,
  ShieldCheck,
  FileText,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Building2,
  Layers,
  Phone
} from 'lucide-react';
import { useFooterData, SocialLinkItem, FooterNavItem, DEFAULT_FOOTER_CONFIG } from '../../data/footerStore';
import { processImageFile } from '../../data/photoStore';

export const AdminRodapeTab: React.FC = () => {
  const {
    config: footer,
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
  } = useFooterData();

  // Local form state for general texts and settings
  const [formData, setFormData] = useState({
    // Logo
    logoUrl: footer.logoUrl || '/images/logo_transparente.png',
    logoHeight: footer.logoHeight || 56,
    showLogo: footer.showLogo !== false,
    logoBackground: footer.logoBackground || 'transparent',

    // Identificação e CNPJ
    brandTitle: footer.brandTitle || 'Dra. Léia Mar',
    brandSubtitle: footer.brandSubtitle || 'Fisioterapia & Pilates • CREFITO 426910-F',
    companyLegalName: footer.companyLegalName || 'MOVEX CENTRO DE MOVIMENTO E PERFORMANCE',
    cnpj: footer.cnpj || '69.533.975/0001-81',
    showCnpj: footer.showCnpj !== false,
    brandDescription: footer.brandDescription,

    // Títulos de Seção
    navTitle: footer.navTitle || 'Navegação',
    contactTitle: footer.contactTitle || 'Estúdio & Contato',
    badgeText: footer.badgeText || '',
    copyrightText: footer.copyrightText || '© 2026 Dra. Léia Mar — Todos os direitos reservados. CNPJ: 69.533.975/0001-81 - MOVEX CENTRO DE MOVIMENTO E PERFORMANCE • CREFITO 426910-F.',

    // Endereço e Contato
    contactAddress: footer.contactAddress || '',
    contactLandmarks: footer.contactLandmarks || '',
    contactNeighborhood: footer.contactNeighborhood || '',
    contactCityState: footer.contactCityState || '',
    contactPhone: footer.contactPhone || '',

    // Políticas Legais
    privacyTitle: footer.privacyTitle || 'Política de Privacidade',
    privacyText: footer.privacyText,
    termsTitle: footer.termsTitle || 'Termos de Uso',
    termsText: footer.termsText
  });

  // Logo file upload ref
  const logoFileRef = useRef<HTMLInputElement>(null);

  // Nav link creation form
  const [isAddingNav, setIsAddingNav] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');

  // Nav link edit form
  const [editingNavId, setEditingNavId] = useState<string | null>(null);
  const [editNavLabel, setEditNavLabel] = useState('');
  const [editNavHref, setEditNavHref] = useState('');

  // Social link creation form
  const [isAddingSocial, setIsAddingSocial] = useState(false);
  const [newPlatform, setNewPlatform] = useState<SocialLinkItem['platform']>('instagram');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCustomIconUrl, setNewCustomIconUrl] = useState('');
  const newIconFileRef = useRef<HTMLInputElement>(null);

  // Social link edit form
  const [editingSocialId, setEditingSocialId] = useState<string | null>(null);
  const [editPlatform, setEditPlatform] = useState<SocialLinkItem['platform']>('instagram');
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editCustomIconUrl, setEditCustomIconUrl] = useState('');
  const editIconFileRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Upload Logo do Rodapé
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processando imagem da Logo do rodapé...');
      const dataUrl = await processImageFile(file);
      const updated = {
        ...formData,
        logoUrl: dataUrl,
        showLogo: true
      };
      setFormData(updated);
      updateConfig({ logoUrl: dataUrl, showLogo: true });
      showToast('Nova Logo do Rodapé aplicada com sucesso!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao processar imagem.');
    }
  };

  const handleRemoveLogo = () => {
    const updated = {
      ...formData,
      logoUrl: '',
      showLogo: false
    };
    setFormData(updated);
    updateConfig({ logoUrl: '', showLogo: false });
    showToast('Logo removida do rodapé.');
  };

  const handleResetLogo = () => {
    const updated = {
      ...formData,
      logoUrl: DEFAULT_FOOTER_CONFIG.logoUrl,
      logoHeight: DEFAULT_FOOTER_CONFIG.logoHeight,
      showLogo: true,
      logoBackground: 'transparent' as const
    };
    setFormData(updated);
    updateConfig({
      logoUrl: DEFAULT_FOOTER_CONFIG.logoUrl,
      logoHeight: DEFAULT_FOOTER_CONFIG.logoHeight,
      showLogo: true,
      logoBackground: 'transparent'
    });
    showToast('Logo padrão do rodapé restaurada (sem fundo branco)!');
  };

  const handleSaveTexts = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    showToast('Configurações e textos do Rodapé salvos e atualizados em tempo real!');
  };

  // Nav Links Handlers
  const handleAddNav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLabel.trim() || !newNavHref.trim()) {
      showToast('Informe o nome e link de destino.');
      return;
    }
    addNavLink({
      label: newNavLabel.trim(),
      href: newNavHref.trim(),
      active: true
    });
    setNewNavLabel('');
    setNewNavHref('');
    setIsAddingNav(false);
    showToast('Novo link inserido no rodapé!');
  };

  const startEditNav = (item: FooterNavItem) => {
    setEditingNavId(item.id);
    setEditNavLabel(item.label);
    setEditNavHref(item.href);
  };

  const saveEditNav = (id: string) => {
    if (!editNavLabel.trim() || !editNavHref.trim()) {
      showToast('Nome e link são obrigatórios.');
      return;
    }
    updateNavLink(id, {
      label: editNavLabel.trim(),
      href: editNavHref.trim()
    });
    setEditingNavId(null);
    showToast('Link do rodapé modificado!');
  };

  const handleDeleteNav = (id: string, label: string) => {
    deleteNavLink(id);
    showToast(`Link "${label}" excluído do rodapé!`);
  };

  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= footer.navLinks.length) return;

    const arr = [...footer.navLinks];
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;

    reorderNavLinks(arr);
    showToast('Ordem dos links do rodapé atualizada!');
  };

  const handleToggleNavActive = (id: string, current: boolean) => {
    updateNavLink(id, { active: !current });
    showToast(!current ? 'Link ativado no rodapé!' : 'Link ocultado do rodapé!');
  };

  // Social Links Handlers
  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabel.trim() || !newUrl.trim()) {
      showToast('Preencha o nome e o link da rede social.');
      return;
    }

    addSocialLink({
      platform: newPlatform,
      label: newLabel.trim(),
      url: newUrl.trim(),
      customIconUrl: newCustomIconUrl.trim() || undefined,
      active: true
    });

    setNewLabel('');
    setNewUrl('');
    setNewCustomIconUrl('');
    setIsAddingSocial(false);
    showToast('Nova rede social inserida no Rodapé!');
  };

  const startEditSocial = (item: SocialLinkItem) => {
    setEditingSocialId(item.id);
    setEditPlatform(item.platform);
    setEditLabel(item.label);
    setEditUrl(item.url);
    setEditCustomIconUrl(item.customIconUrl || '');
  };

  const saveEditSocial = (id: string) => {
    if (!editLabel.trim() || !editUrl.trim()) {
      showToast('Nome e link são obrigatórios.');
      return;
    }

    updateSocialLink(id, {
      platform: editPlatform,
      label: editLabel.trim(),
      url: editUrl.trim(),
      customIconUrl: editCustomIconUrl.trim() || undefined
    });

    setEditingSocialId(null);
    showToast('Rede social atualizada com sucesso!');
  };

  const handleDeleteSocial = (id: string, label: string) => {
    deleteSocialLink(id);
    showToast(`Rede social "${label}" excluída!`);
  };

  const handleMoveSocial = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= footer.socialLinks.length) return;

    const arr = [...footer.socialLinks];
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;

    reorderSocialLinks(arr);
    showToast('Ordem dos ícones atualizada!');
  };

  const handleToggleSocialActive = (id: string, current: boolean) => {
    updateSocialLink(id, { active: !current });
    showToast(!current ? 'Ícone ativado no site!' : 'Ícone ocultado do site!');
  };

  const handleUploadIcon = async (e: React.ChangeEvent<HTMLInputElement>, isEditing = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const dataUrl = await processImageFile(file);
      if (isEditing) {
        setEditCustomIconUrl(dataUrl);
      } else {
        setNewCustomIconUrl(dataUrl);
      }
      showToast('Ícone personalizado carregado com sucesso!');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao carregar imagem');
    }
  };

  const handleReset = () => {
    resetConfig();
    setFormData({
      logoUrl: DEFAULT_FOOTER_CONFIG.logoUrl,
      logoHeight: DEFAULT_FOOTER_CONFIG.logoHeight,
      showLogo: true,
      logoBackground: 'transparent',
      brandTitle: DEFAULT_FOOTER_CONFIG.brandTitle,
      brandSubtitle: DEFAULT_FOOTER_CONFIG.brandSubtitle,
      companyLegalName: DEFAULT_FOOTER_CONFIG.companyLegalName,
      cnpj: DEFAULT_FOOTER_CONFIG.cnpj,
      showCnpj: true,
      brandDescription: DEFAULT_FOOTER_CONFIG.brandDescription,
      navTitle: DEFAULT_FOOTER_CONFIG.navTitle,
      contactTitle: DEFAULT_FOOTER_CONFIG.contactTitle,
      badgeText: DEFAULT_FOOTER_CONFIG.badgeText,
      copyrightText: DEFAULT_FOOTER_CONFIG.copyrightText,
      contactAddress: '',
      contactLandmarks: '',
      contactNeighborhood: '',
      contactCityState: '',
      contactPhone: '',
      privacyTitle: DEFAULT_FOOTER_CONFIG.privacyTitle,
      privacyText: DEFAULT_FOOTER_CONFIG.privacyText,
      termsTitle: DEFAULT_FOOTER_CONFIG.termsTitle,
      termsText: DEFAULT_FOOTER_CONFIG.termsText
    });
    showToast('Configurações originais do rodapé restauradas!');
  };

  const renderIconBadge = (item: SocialLinkItem) => {
    if (item.customIconUrl) {
      return (
        <img
          src={item.customIconUrl}
          alt={item.label}
          className="w-8 h-8 rounded-full object-cover border border-[#FCD6E0]"
        />
      );
    }
    switch (item.platform) {
      case 'whatsapp':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center">
            <MessageCircle className="w-4 h-4" />
          </div>
        );
      case 'instagram':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
            <Instagram className="w-4 h-4" />
          </div>
        );
      case 'facebook':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF2FF] text-[#1877F2] flex items-center justify-center">
            <Facebook className="w-4 h-4" />
          </div>
        );
      case 'youtube':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FDEDF0] text-[#FF0000] flex items-center justify-center">
            <Youtube className="w-4 h-4" />
          </div>
        );
      case 'linkedin':
        return (
          <div className="w-8 h-8 rounded-full bg-[#EBF2FF] text-[#0A66C2] flex items-center justify-center">
            <Linkedin className="w-4 h-4" />
          </div>
        );
      case 'maps':
        return (
          <div className="w-8 h-8 rounded-full bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
            <MapPin className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-8 h-8 rounded-full bg-[#F3EFEA] text-[#5B444C] flex items-center justify-center">
            <Globe className="w-4 h-4" />
          </div>
        );
    }
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#26161B] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FCD6E0]/40 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#FCD6E0]">
            <Share2 className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Rodapé, Marca & Redes Sociais da One Page</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            Gestão Completa do Rodapé & Logo
          </h2>
          <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
            Insira, altere, modifique, edite ou exclua a <strong>Logo do Rodapé</strong>, dados da Empresa (CNPJ), links de navegação rápida, dados de endereço e ícones sociais. Todas as alterações são aceitas pela One Page de forma imediata!
          </p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-[#D85072]" />
          <span>Restaurar Rodapé Padrão</span>
        </button>
      </div>

      {/* SECTION 1: LOGO DO RODAPÉ (INSERIR, ALTERAR, MODIFICAR, EDITAR, EXCLUIR) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCD6E0]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D85072]" />
              <span>Logo do Rodapé (Inserir, Alterar, Modificar, Excluir)</span>
            </h3>
            <p className="text-xs text-[#5B444C] mt-0.5">
              Defina a logo exibida no rodapé. Por padrão ela é transparente (sem fundo branco), com ajuste livre de tamanho.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => logoFileRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Fazer Upload de Nova Logo</span>
            </button>
            <input
              ref={logoFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadLogo}
            />

            <button
              type="button"
              onClick={handleResetLogo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5B444C] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D85072]" />
              <span>Restaurar Logo Padrão</span>
            </button>

            {formData.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#9C2744]" />
                <span>Excluir / Ocultar Logo</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Preview on Dark Background (Real Footer Appearance) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FFFDFB] p-5 sm:p-6 rounded-2xl border border-[#FCD6E0]">
          <div className="md:col-span-6 flex flex-col items-center justify-center p-5 rounded-2xl border border-[#4A2430] bg-[#211317] text-white min-h-[140px] shadow-inner">
            <span className="text-[11px] font-bold text-[#FFB3C6] uppercase tracking-wider mb-2">
              Pré-visualização Oficial no Rodapé Escuro (#211317)
            </span>
            {formData.showLogo && formData.logoUrl ? (
              <div
                style={{
                  height: `${formData.logoHeight}px`,
                  width: `${formData.logoHeight}px`
                }}
                className={`flex items-center justify-center shrink-0 transition-all ${
                  formData.logoBackground === 'white' ? 'bg-white p-1 rounded-full' : ''
                }`}
              >
                <img
                  src={formData.logoUrl}
                  alt="Prévia da Logo no Rodapé"
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#DFBAC6] opacity-60">
                <EyeOff className="w-6 h-6 mx-auto mb-1" />
                <span>Logo oculta no rodapé</span>
              </div>
            )}
            <p className="text-[11px] text-[#A8828F] mt-2 text-center">
              Fundo da logo: <strong>{formData.logoBackground === 'white' ? 'Branco Circular' : 'Transparente (Recomendado)'}</strong>
            </p>
          </div>

          <div className="md:col-span-6 space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Tamanho da Logo no Rodapé: <span className="text-[#D85072]">{formData.logoHeight}px</span>
              </label>
              <input
                type="range"
                min="36"
                max="84"
                value={formData.logoHeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, logoHeight: val });
                  updateConfig({ logoHeight: val });
                }}
                className="w-full accent-[#D85072] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C3B50] font-medium mt-0.5">
                <span>36px (Pequena)</span>
                <span>56px (Padrão)</span>
                <span>84px (Destaque)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#FCD6E0]/60 flex flex-wrap items-center justify-between gap-3">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#26161B]">
                <input
                  type="checkbox"
                  checked={formData.showLogo}
                  onChange={(e) => {
                    const val = e.target.checked;
                    setFormData({ ...formData, showLogo: val });
                    updateConfig({ showLogo: val });
                  }}
                  className="rounded text-[#D85072] focus:ring-[#D85072]"
                />
                <span>Exibir Logo no Rodapé</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#26161B]">
                <input
                  type="checkbox"
                  checked={formData.logoBackground === 'white'}
                  onChange={(e) => {
                    const bg = e.target.checked ? 'white' : 'transparent';
                    setFormData({ ...formData, logoBackground: bg });
                    updateConfig({ logoBackground: bg });
                  }}
                  className="rounded text-[#D85072] focus:ring-[#D85072]"
                />
                <span>Fundo Branco (Apenas se a imagem não for transparente)</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: IDENTIFICAÇÃO INSTITUCIONAL & CNPJ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#FCD6E0]">
          <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#D85072]" />
            <span>Identificação Institucional, Razão Social & CNPJ</span>
          </h3>
          <p className="text-xs text-[#5B444C] mt-0.5">
            Mantenha as credenciais oficiais da Dra. Léia Mar e da pessoa jurídica atualizadas no rodapé.
          </p>
        </div>

        <form onSubmit={handleSaveTexts} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Nome da Marca / Título Principal:
              </label>
              <input
                type="text"
                value={formData.brandTitle}
                onChange={(e) => setFormData({ ...formData, brandTitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Subtítulo / CREFITO:
              </label>
              <input
                type="text"
                value={formData.brandSubtitle}
                onChange={(e) => setFormData({ ...formData, brandSubtitle: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                CNPJ da Dra. Léia Mar:
              </label>
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                placeholder="69.533.975/0001-81"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Razão Social / Nome da Empresa:
              </label>
              <input
                type="text"
                value={formData.companyLegalName}
                onChange={(e) => setFormData({ ...formData, companyLegalName: e.target.value })}
                placeholder="MOVEX CENTRO DE MOVIMENTO E PERFORMANCE"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
              />
            </div>

            <div className="flex items-center gap-4 pt-5">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#26161B]">
                <input
                  type="checkbox"
                  checked={formData.showCnpj}
                  onChange={(e) => setFormData({ ...formData, showCnpj: e.target.checked })}
                  className="rounded text-[#D85072] focus:ring-[#D85072]"
                />
                <span>Exibir CNPJ e Razão Social no Rodapé</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
              Descrição Institucional do Rodapé:
            </label>
            <textarea
              rows={3}
              value={formData.brandDescription}
              onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            />
          </div>

          {/* Endereço e Contato Customizáveis */}
          <div className="pt-4 border-t border-[#FCD6E0] space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D85072] block">
              Dados de Endereço & Contato Exibidos no Rodapé (Opcional - sobrescreve os dados gerais):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-[#26161B] uppercase mb-1">
                  Endereço Físico:
                </label>
                <input
                  type="text"
                  value={formData.contactAddress}
                  onChange={(e) => setFormData({ ...formData, contactAddress: e.target.value })}
                  placeholder="Deixe em branco para usar o padrão da clínica"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#26161B] uppercase mb-1">
                  Ponto de Referência:
                </label>
                <input
                  type="text"
                  value={formData.contactLandmarks}
                  onChange={(e) => setFormData({ ...formData, contactLandmarks: e.target.value })}
                  placeholder="Deixe em branco para usar o padrão"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#26161B] uppercase mb-1">
                  Bairro / Cidade:
                </label>
                <input
                  type="text"
                  value={formData.contactNeighborhood}
                  onChange={(e) => setFormData({ ...formData, contactNeighborhood: e.target.value })}
                  placeholder="Deixe em branco para usar o padrão"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#26161B] uppercase mb-1">
                  WhatsApp de Contato:
                </label>
                <input
                  type="text"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  placeholder="Deixe em branco para usar o padrão"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#1D7A46] hover:bg-[#155D34] transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Dados Institucionais & CNPJ</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 3: LINKS DE NAVEGAÇÃO DO RODAPÉ (INSERIR, EDITAR, EXCLUIR, REORDENAR) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCD6E0]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D85072]" />
              <span>Links de Navegação do Rodapé (Inserir, Editar, Excluir)</span>
            </h3>
            <p className="text-xs text-[#5B444C] mt-0.5">
              Gerencie a coluna de navegação rápida que fica no rodapé do site.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNav(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir Novo Link no Rodapé</span>
          </button>
        </div>

        {/* Form to Add New Nav Link in Footer */}
        {isAddingNav && (
          <div className="bg-[#FFFDFB] rounded-2xl p-5 border-2 border-[#D85072]/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D85072]">
                Cadastrar Novo Link no Rodapé
              </span>
              <button
                type="button"
                onClick={() => setIsAddingNav(false)}
                className="p-1 rounded text-[#8C3B50] hover:bg-[#FFEBF0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNav} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                    Nome do Link:
                  </label>
                  <input
                    type="text"
                    value={newNavLabel}
                    onChange={(e) => setNewNavLabel(e.target.value)}
                    placeholder="Ex: Agendamento Online"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                    Destino / Link / Âncora:
                  </label>
                  <input
                    type="text"
                    value={newNavHref}
                    onChange={(e) => setNewNavHref(e.target.value)}
                    placeholder="Ex: #agendamento ou /"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNav(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859]"
                >
                  Confirmar e Inserir
                </button>
              </div>
            </form>
          </div>
        )}

        {/* List of Footer Nav Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {footer.navLinks.map((item, index) => {
            const isEditing = editingNavId === item.id;

            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="col-span-full bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#D85072] space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8C3B50] uppercase mb-1">
                        Nome:
                      </label>
                      <input
                        type="text"
                        value={editNavLabel}
                        onChange={(e) => setEditNavLabel(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#8C3B50] uppercase mb-1">
                        Destino / Âncora:
                      </label>
                      <input
                        type="text"
                        value={editNavHref}
                        onChange={(e) => setEditNavHref(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingNavId(null)}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditNav(item.id)}
                      className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1D7A46]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  item.active !== false
                    ? 'bg-white border-[#FCD6E0]/80 shadow-xs'
                    : 'bg-[#FDF6F8]/60 border-[#FCD6E0]/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <span className="w-6 h-6 rounded-full bg-[#FFEBF0] text-[#D85072] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="truncate">
                    <span className="font-semibold text-xs text-[#26161B] block truncate">
                      {item.label}
                    </span>
                    <span className="text-[11px] text-[#8C3B50] font-mono truncate block">
                      {item.href}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleMoveNav(index, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveNav(index, 'down')}
                    disabled={index === footer.navLinks.length - 1}
                    className="p-1 rounded text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleNavActive(item.id, item.active !== false)}
                    className="p-1 rounded text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                  >
                    {item.active !== false ? (
                      <Eye className="w-3.5 h-3.5 text-[#1D7A46]" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditNav(item)}
                    className="p-1 rounded text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteNav(item.id, item.label)}
                    className="p-1 rounded text-[#5B444C] hover:bg-[#FDEDF0] hover:text-[#9C2744] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 4: REDES SOCIAIS E ÍCONES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCD6E0]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <Share2 className="w-5 h-5 text-[#D85072]" />
              <span>Ícones & Redes Sociais do Rodapé</span>
            </h3>
            <p className="text-xs text-[#5B444C] mt-0.5">
              Adicione links para Instagram, WhatsApp, TikTok, YouTube, Maps ou insira ícones personalizados.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingSocial(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir Nova Rede / Link</span>
          </button>
        </div>

        {/* Create Social Modal / Form */}
        {isAddingSocial && (
          <div className="bg-[#FFFDFB] rounded-2xl p-5 sm:p-6 border-2 border-[#D85072]/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D85072]">
                Cadastrar Novo Ícone / Link de Rede Social
              </span>
              <button
                type="button"
                onClick={() => setIsAddingSocial(false)}
                className="p-1 rounded text-[#8C3B50] hover:bg-[#FFEBF0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSocial} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                    Plataforma / Tipo de Ícone:
                  </label>
                  <select
                    value={newPlatform}
                    onChange={(e) => setNewPlatform(e.target.value as SocialLinkItem['platform'])}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                  >
                    <option value="instagram">Instagram</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="facebook">Facebook</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="linkedin">LinkedIn</option>
                    <option value="maps">Localização no Google Maps</option>
                    <option value="custom">Outro / Link Personalizado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                    Rótulo / Nome de Identificação:
                  </label>
                  <input
                    type="text"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder="Ex: Instagram Oficial"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  URL / Link de Redirecionamento:
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  Ícone Personalizado (Upload de Imagem - Opcional):
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => newIconFileRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C3B50] bg-white border border-[#FCD6E0] hover:bg-[#FFEBF0] flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Ícone Próprio</span>
                  </button>
                  <input
                    ref={newIconFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleUploadIcon(e, false)}
                  />
                  {newCustomIconUrl && (
                    <div className="flex items-center gap-2">
                      <img src={newCustomIconUrl} alt="Preview" className="w-7 h-7 rounded-full object-cover border border-[#FCD6E0]" />
                      <button
                        type="button"
                        onClick={() => setNewCustomIconUrl('')}
                        className="text-xs text-red-600 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => setIsAddingSocial(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859]"
                >
                  Inserir Ícone no Rodapé
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Social Links List */}
        <div className="space-y-3">
          {footer.socialLinks.map((item, index) => {
            const isEditing = editingSocialId === item.id;

            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="bg-[#FFFDFB] rounded-2xl p-5 border-2 border-[#D85072] space-y-4"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8C3B50] uppercase mb-1">
                        Plataforma:
                      </label>
                      <select
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-white text-xs"
                      >
                        <option value="instagram">Instagram</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="facebook">Facebook</option>
                        <option value="youtube">YouTube</option>
                        <option value="tiktok">TikTok</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="maps">Google Maps</option>
                        <option value="custom">Outro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-[#8C3B50] uppercase mb-1">
                        Rótulo:
                      </label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-white text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#8C3B50] uppercase mb-1">
                      Link / URL:
                    </label>
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-white text-xs"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#FCD6E0]">
                    <button
                      type="button"
                      onClick={() => setEditingSocialId(null)}
                      className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditSocial(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1D7A46]"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvar</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                  item.active !== false
                    ? 'bg-white border-[#FCD6E0]/80 shadow-xs'
                    : 'bg-[#FDF6F8]/60 border-[#FCD6E0]/40 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {renderIconBadge(item)}
                  <div>
                    <span className="font-semibold text-sm text-[#26161B] block">
                      {item.label}
                    </span>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#8C3B50] hover:text-[#D85072] flex items-center gap-1 mt-0.5 truncate max-w-xs sm:max-w-md"
                    >
                      <span className="truncate">{item.url}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2 sm:mt-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleMoveSocial(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveSocial(index, 'down')}
                    disabled={index === footer.socialLinks.length - 1}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-20 cursor-pointer"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSocialActive(item.id, item.active !== false)}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                  >
                    {item.active !== false ? (
                      <Eye className="w-4 h-4 text-[#1D7A46]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditSocial(item)}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSocial(item.id, item.label)}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FDEDF0] hover:text-[#9C2744] cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 5: COPYRIGHT & TERMOS LEGAIS (LGPD) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#FCD6E0]">
          <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D85072]" />
            <span>Direitos Autorais & Políticas Legais</span>
          </h3>
          <p className="text-xs text-[#5B444C] mt-0.5">
            Configure o texto inferior de copyright e o conteúdo dos modais de Privacidade e Termos de Uso.
          </p>
        </div>

        <form onSubmit={handleSaveTexts} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
              Texto de Copyright / Direitos Autorais (Barra Inferior):
            </label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider">
                Conteúdo da Política de Privacidade (LGPD):
              </label>
              <textarea
                rows={5}
                value={formData.privacyText}
                onChange={(e) => setFormData({ ...formData, privacyText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] leading-relaxed"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider">
                Conteúdo dos Termos de Uso:
              </label>
              <textarea
                rows={5}
                value={formData.termsText}
                onChange={(e) => setFormData({ ...formData, termsText: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] leading-relaxed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-[#FCD6E0]">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Configurações do Rodapé</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
