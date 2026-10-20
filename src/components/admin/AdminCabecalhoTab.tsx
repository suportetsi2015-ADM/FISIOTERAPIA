import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Upload,
  Trash2,
  RotateCcw,
  Plus,
  Edit3,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  Save,
  CheckCircle2,
  Eye,
  EyeOff,
  ExternalLink,
  Layers,
  Calendar,
  Phone,
  Sliders,
  Image as ImageIcon
} from 'lucide-react';
import { useHeaderData, HeaderNavItem, DEFAULT_HEADER_CONFIG } from '../../data/headerStore';
import { processImageFile } from '../../data/photoStore';

export const AdminCabecalhoTab: React.FC = () => {
  const {
    config: header,
    updateConfig,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    reorderNavItems,
    resetConfig
  } = useHeaderData();

  // Local form for general header settings
  const [formData, setFormData] = useState({
    logoUrl: header.logoUrl,
    logoHeight: header.logoHeight || 52,
    showLogo: header.showLogo !== false,
    logoShape: header.logoShape || 'natural',
    logoBackground: header.logoBackground || 'transparent',

    brandTitle: header.brandTitle || 'Dra. Léia Mar',
    brandSubtitle: header.brandSubtitle || 'Fisioterapia & Pilates',
    showSubtitle: header.showSubtitle !== false,

    showCtaButton: header.showCtaButton !== false,
    ctaButtonText: header.ctaButtonText || 'Agendar Sessão',
    ctaButtonAction: header.ctaButtonAction || 'booking_modal',

    showWhatsAppButton: header.showWhatsAppButton !== false,
    whatsAppText: header.whatsAppText || 'WhatsApp',
    whatsAppPhoneDisplay: header.whatsAppPhoneDisplay || '(92) 98620-1641',
    whatsAppPhoneRaw: header.whatsAppPhoneRaw || '5592986201641',

    headerStyle: header.headerStyle || 'glass'
  });

  // Navigation Items State
  const [isAddingNav, setIsAddingNav] = useState(false);
  const [newNavLabel, setNewNavLabel] = useState('');
  const [newNavHref, setNewNavHref] = useState('');
  const [newNavNewTab, setNewNavNewTab] = useState(false);

  const [editingNavId, setEditingNavId] = useState<string | null>(null);
  const [editNavLabel, setEditNavLabel] = useState('');
  const [editNavHref, setEditNavHref] = useState('');
  const [editNavNewTab, setEditNavNewTab] = useState(false);

  // File Upload Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Upload custom logo image
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Processando e otimizando imagem da Logo...');
      const dataUrl = await processImageFile(file);
      const updated = {
        ...formData,
        logoUrl: dataUrl,
        showLogo: true
      };
      setFormData(updated);
      updateConfig({ logoUrl: dataUrl, showLogo: true });
      showToast('Nova Logo do Cabeçalho aplicada com sucesso!');
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
    showToast('Logo removida do cabeçalho. Apenas os textos da marca serão exibidos.');
  };

  const handleResetLogo = () => {
    const updated = {
      ...formData,
      logoUrl: DEFAULT_HEADER_CONFIG.logoUrl,
      logoHeight: DEFAULT_HEADER_CONFIG.logoHeight,
      showLogo: true,
      logoBackground: 'transparent'
    };
    setFormData(updated);
    updateConfig({
      logoUrl: DEFAULT_HEADER_CONFIG.logoUrl,
      logoHeight: DEFAULT_HEADER_CONFIG.logoHeight,
      showLogo: true,
      logoBackground: 'transparent'
    });
    showToast('Logo oficial transparente restaurada!');
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    showToast('Configurações e textos do Cabeçalho salvos e atualizados em tempo real!');
  };

  const handleAddNav = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNavLabel.trim() || !newNavHref.trim()) {
      showToast('Preencha o nome do link e o destino.');
      return;
    }
    addNavItem({
      label: newNavLabel.trim(),
      href: newNavHref.trim(),
      openInNewTab: newNavNewTab,
      active: true
    });
    setNewNavLabel('');
    setNewNavHref('');
    setNewNavNewTab(false);
    setIsAddingNav(false);
    showToast('Novo link inserido no menu de navegação!');
  };

  const startEditNav = (item: HeaderNavItem) => {
    setEditingNavId(item.id);
    setEditNavLabel(item.label);
    setEditNavHref(item.href);
    setEditNavNewTab(!!item.openInNewTab);
  };

  const saveEditNav = (id: string) => {
    if (!editNavLabel.trim() || !editNavHref.trim()) {
      showToast('Nome e link são obrigatórios.');
      return;
    }
    updateNavItem(id, {
      label: editNavLabel.trim(),
      href: editNavHref.trim(),
      openInNewTab: editNavNewTab
    });
    setEditingNavId(null);
    showToast('Link do cabeçalho modificado com sucesso!');
  };

  const handleDeleteNav = (id: string, label: string) => {
    deleteNavItem(id);
    showToast(`Link "${label}" excluído do cabeçalho!`);
  };

  const handleMoveNav = (index: number, direction: 'up' | 'down') => {
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= header.navItems.length) return;

    const arr = [...header.navItems];
    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;

    reorderNavItems(arr);
    showToast('Ordem dos links do menu atualizada!');
  };

  const handleToggleNavActive = (id: string, current: boolean) => {
    updateNavItem(id, { active: !current });
    showToast(!current ? 'Link ativado no cabeçalho!' : 'Link ocultado do cabeçalho!');
  };

  const handleResetAll = () => {
    resetConfig();
    setFormData({
      logoUrl: DEFAULT_HEADER_CONFIG.logoUrl,
      logoHeight: DEFAULT_HEADER_CONFIG.logoHeight,
      showLogo: true,
      logoShape: 'natural',
      logoBackground: 'transparent',
      brandTitle: DEFAULT_HEADER_CONFIG.brandTitle,
      brandSubtitle: DEFAULT_HEADER_CONFIG.brandSubtitle,
      showSubtitle: true,
      showCtaButton: true,
      ctaButtonText: DEFAULT_HEADER_CONFIG.ctaButtonText,
      ctaButtonAction: 'booking_modal',
      showWhatsAppButton: true,
      whatsAppText: 'WhatsApp',
      whatsAppPhoneDisplay: '(92) 98620-1641',
      whatsAppPhoneRaw: '5592986201641',
      headerStyle: 'glass'
    });
    showToast('Cabeçalho restaurado para o padrão original de fábrica!');
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
            <Sparkles className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Gestão do Topo & Marca Oficial (One Page)</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            Cabeçalho, Logo & Menus de Navegação
          </h2>
          <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
            Insira, altere, modifique, edite ou exclua a <strong>Logo</strong>, os textos da marca, os <strong>links de navegação</strong> e os botões de ação do cabeçalho. Todas as alterações são aceitas pela One Page de forma imediata!
          </p>
        </div>

        <button
          type="button"
          onClick={handleResetAll}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer self-start md:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-[#D85072]" />
          <span>Restaurar Cabeçalho Padrão</span>
        </button>
      </div>

      {/* SECTION 1: GESTÃO DA LOGO DO CABEÇALHO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCD6E0]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#D85072]" />
              <span>Logo do Cabeçalho (Inserir, Alterar, Modificar, Excluir)</span>
            </h3>
            <p className="text-xs text-[#5B444C] mt-0.5">
              Personalize a logo exibida no topo do site com upload direto, ajuste de tamanho, forma e transparência.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-all cursor-pointer shadow-xs"
            >
              <Upload className="w-4 h-4" />
              <span>Fazer Upload de Nova Logo</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUploadLogo}
            />

            <button
              type="button"
              onClick={handleResetLogo}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#5B444C] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
              title="Restaurar logo padrão"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#D85072]" />
              <span>Restaurar Padrão</span>
            </button>

            {formData.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
                title="Remover logo do topo"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#9C2744]" />
                <span>Excluir / Ocultar Logo</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Preview Box */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-[#FFFDFB] p-5 sm:p-6 rounded-2xl border border-[#FCD6E0]">
          {/* Preview On Light Background */}
          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#FCD6E0] bg-white min-h-[140px]">
            <span className="text-[11px] font-bold text-[#8C3B50] uppercase tracking-wider mb-2">
              Pré-visualização em Fundo Claro (Header)
            </span>
            {formData.showLogo && formData.logoUrl ? (
              <div
                style={{ height: `${formData.logoHeight}px` }}
                className={`flex items-center justify-center transition-all ${
                  formData.logoBackground === 'white' ? 'bg-white p-1 rounded-full shadow-xs' : ''
                } ${formData.logoShape === 'circular' ? 'rounded-full overflow-hidden' : ''}`}
              >
                <img
                  src={formData.logoUrl}
                  alt="Prévia da Logo"
                  style={{ maxHeight: `${formData.logoHeight}px` }}
                  className="object-contain"
                />
              </div>
            ) : (
              <div className="text-center py-4 text-xs text-[#8C3B50]">
                <EyeOff className="w-6 h-6 mx-auto mb-1 opacity-50" />
                <span>Logo atualmente oculta/removida</span>
              </div>
            )}
          </div>

          {/* Preview On Dark Background */}
          <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-[#4A2430] bg-[#211317] min-h-[140px] text-white">
            <span className="text-[11px] font-bold text-[#FFB3C6] uppercase tracking-wider mb-2">
              Prévia sobre Fundo Escuro
            </span>
            {formData.showLogo && formData.logoUrl ? (
              <div
                style={{ height: `${formData.logoHeight}px` }}
                className={`flex items-center justify-center transition-all ${
                  formData.logoBackground === 'white' ? 'bg-white p-1 rounded-full' : ''
                }`}
              >
                <img
                  src={formData.logoUrl}
                  alt="Prévia Escura"
                  style={{ maxHeight: `${formData.logoHeight}px` }}
                  className="object-contain"
                />
              </div>
            ) : (
              <span className="text-xs text-[#DFBAC6] opacity-60">Sem logo</span>
            )}
          </div>

          {/* Quick Controls */}
          <div className="md:col-span-3 space-y-3">
            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Altura da Logo: <span className="text-[#D85072]">{formData.logoHeight}px</span>
              </label>
              <input
                type="range"
                min="32"
                max="80"
                value={formData.logoHeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData({ ...formData, logoHeight: val });
                  updateConfig({ logoHeight: val });
                }}
                className="w-full accent-[#D85072] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-[#8C3B50] font-medium mt-0.5">
                <span>32px (Compacta)</span>
                <span>52px (Padrão)</span>
                <span>80px (Grande)</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-[#FCD6E0]/60">
              <span className="text-xs font-bold text-[#26161B]">Exibir Logo no Topo:</span>
              <button
                type="button"
                onClick={() => {
                  const val = !formData.showLogo;
                  setFormData({ ...formData, showLogo: val });
                  updateConfig({ showLogo: val });
                  showToast(val ? 'Logo visível no cabeçalho!' : 'Logo ocultada do cabeçalho!');
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                  formData.showLogo
                    ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                    : 'bg-[#FDEDF0] text-[#9C2744] border border-[#FCD6E0]'
                }`}
              >
                {formData.showLogo ? 'Visível' : 'Oculta'}
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Form for Logo & Identity */}
        <form onSubmit={handleSaveGeneral} className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Título da Marca / Nome:
              </label>
              <input
                type="text"
                value={formData.brandTitle}
                onChange={(e) => setFormData({ ...formData, brandTitle: e.target.value })}
                placeholder="Ex: Dra. Léia Mar"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                Subtítulo / Especialidade:
              </label>
              <input
                type="text"
                value={formData.brandSubtitle}
                onChange={(e) => setFormData({ ...formData, brandSubtitle: e.target.value })}
                placeholder="Ex: Fisioterapia & Pilates"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                URL Direta da Logo (Opcional):
              </label>
              <input
                type="text"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="/images/logo_transparente.png"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-[#FCD6E0]/60">
            <div className="flex items-center gap-6">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#26161B]">
                <input
                  type="checkbox"
                  checked={formData.showSubtitle}
                  onChange={(e) => setFormData({ ...formData, showSubtitle: e.target.checked })}
                  className="rounded text-[#D85072] focus:ring-[#D85072]"
                />
                <span>Exibir Subtítulo no Topo</span>
              </label>

              <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#26161B]">
                <input
                  type="checkbox"
                  checked={formData.logoBackground === 'white'}
                  onChange={(e) => setFormData({ ...formData, logoBackground: e.target.checked ? 'white' : 'transparent' })}
                  className="rounded text-[#D85072] focus:ring-[#D85072]"
                />
                <span>Fundo Branco Suave na Logo (se não for transparente)</span>
              </label>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#1D7A46] hover:bg-[#155D34] transition-all cursor-pointer shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações da Logo</span>
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: ITENS DE NAVEGAÇÃO DO CABEÇALHO */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#FCD6E0]">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#D85072]" />
              <span>Itens & Links do Menu do Cabeçalho</span>
            </h3>
            <p className="text-xs text-[#5B444C] mt-0.5">
              Insira novos itens de navegação, edite os nomes e âncoras (ex: #pilates), ative/desative, reordene ou exclua itens.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddingNav(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Inserir Novo Link no Menu</span>
          </button>
        </div>

        {/* Modal / Inline Form to Add New Nav Item */}
        {isAddingNav && (
          <div className="bg-[#FFFDFB] rounded-2xl p-5 border-2 border-[#D85072]/40 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#D85072]">
                Cadastrar Novo Link no Menu Principal
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
                    Rótulo / Nome do Link:
                  </label>
                  <input
                    type="text"
                    value={newNavLabel}
                    onChange={(e) => setNewNavLabel(e.target.value)}
                    placeholder="Ex: Depoimentos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
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
                    placeholder="Ex: #depoimentos ou https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-medium text-[#26161B]">
                  <input
                    type="checkbox"
                    checked={newNavNewTab}
                    onChange={(e) => setNewNavNewTab(e.target.checked)}
                    className="rounded text-[#D85072] focus:ring-[#D85072]"
                  />
                  <span>Abrir em nova aba (_blank)</span>
                </label>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingNav(false)}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors"
                  >
                    Confirmar e Inserir
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* List of Navigation Items */}
        <div className="space-y-2.5">
          {header.navItems.map((item, index) => {
            const isEditing = editingNavId === item.id;

            if (isEditing) {
              return (
                <div
                  key={item.id}
                  className="bg-[#FFFDFB] rounded-2xl p-4 border-2 border-[#D85072] shadow-sm space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#8C3B50] uppercase mb-1">
                        Nome do Link:
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

                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-2 text-xs font-medium text-[#26161B]">
                      <input
                        type="checkbox"
                        checked={editNavNewTab}
                        onChange={(e) => setEditNavNewTab(e.target.checked)}
                        className="rounded text-[#D85072]"
                      />
                      <span>Abrir em nova aba</span>
                    </label>

                    <div className="flex items-center gap-2">
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
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#1D7A46] hover:bg-[#155D34]"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Salvar Modificação</span>
                      </button>
                    </div>
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
                  <div className="w-7 h-7 rounded-full bg-[#FFEBF0] text-[#D85072] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#26161B]">
                        {item.label}
                      </span>
                      {item.openInNewTab && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 font-medium">
                          Nova Aba
                        </span>
                      )}
                      {item.active === false && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                          Oculto
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-[#8C3B50] font-mono">
                      {item.href}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mt-2 sm:mt-0 self-end sm:self-auto">
                  {/* Reorder Buttons */}
                  <button
                    type="button"
                    onClick={() => handleMoveNav(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Subir ordem"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMoveNav(index, 'down')}
                    disabled={index === header.navItems.length - 1}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-20 cursor-pointer disabled:cursor-not-allowed"
                    title="Descer ordem"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => handleToggleNavActive(item.id, item.active !== false)}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                    title={item.active !== false ? 'Ocultar item' : 'Ativar item'}
                  >
                    {item.active !== false ? (
                      <Eye className="w-4 h-4 text-[#1D7A46]" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-amber-600" />
                    )}
                  </button>

                  {/* Edit Button */}
                  <button
                    type="button"
                    onClick={() => startEditNav(item)}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#D85072] cursor-pointer"
                    title="Editar Link"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteNav(item.id, item.label)}
                    className="p-1.5 rounded-lg text-[#5B444C] hover:bg-[#FDEDF0] hover:text-[#9C2744] cursor-pointer"
                    title="Excluir Link"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: BOTÕES DE AÇÃO DO CABEÇALHO (CTA & WHATSAPP) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#FCD6E0]">
          <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D85072]" />
            <span>Botões de Ação do Cabeçalho (CTA & WhatsApp)</span>
          </h3>
          <p className="text-xs text-[#5B444C] mt-0.5">
            Configure o botão de agendamento online e o atalho de contato via WhatsApp no topo da página.
          </p>
        </div>

        <form onSubmit={handleSaveGeneral} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Box 1: Botão CTA Principal */}
            <div className="bg-[#FFFDFB] p-5 rounded-2xl border border-[#FCD6E0] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]/60">
                <span className="text-xs font-bold uppercase tracking-wider text-[#D85072] flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Botão de Agendamento (CTA)</span>
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#26161B]">
                  <input
                    type="checkbox"
                    checked={formData.showCtaButton}
                    onChange={(e) => setFormData({ ...formData, showCtaButton: e.target.checked })}
                    className="rounded text-[#D85072] focus:ring-[#D85072]"
                  />
                  <span>Ativar Botão</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  Texto do Botão:
                </label>
                <input
                  type="text"
                  value={formData.ctaButtonText}
                  onChange={(e) => setFormData({ ...formData, ctaButtonText: e.target.value })}
                  placeholder="Ex: Agendar Sessão"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  Ação ao Clicar:
                </label>
                <select
                  value={formData.ctaButtonAction}
                  onChange={(e) => setFormData({ ...formData, ctaButtonAction: e.target.value as any })}
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                >
                  <option value="booking_modal">Abrir Modal de Agendamento Online</option>
                  <option value="scroll_agendamento">Rolar até a seção #agendamento</option>
                  <option value="whatsapp">Abrir WhatsApp Diretamente</option>
                </select>
              </div>
            </div>

            {/* Box 2: Botão WhatsApp / Telefone */}
            <div className="bg-[#FFFDFB] p-5 rounded-2xl border border-[#FCD6E0] space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]/60">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1D7A46] flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  <span>Botão WhatsApp no Cabeçalho</span>
                </span>
                <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#26161B]">
                  <input
                    type="checkbox"
                    checked={formData.showWhatsAppButton}
                    onChange={(e) => setFormData({ ...formData, showWhatsAppButton: e.target.checked })}
                    className="rounded text-[#1D7A46] focus:ring-[#1D7A46]"
                  />
                  <span>Ativar WhatsApp</span>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  Texto de Exibição:
                </label>
                <input
                  type="text"
                  value={formData.whatsAppText}
                  onChange={(e) => setFormData({ ...formData, whatsAppText: e.target.value })}
                  placeholder="Ex: WhatsApp"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                    Telefone Exibição:
                  </label>
                  <input
                    type="text"
                    value={formData.whatsAppPhoneDisplay}
                    onChange={(e) => setFormData({ ...formData, whatsAppPhoneDisplay: e.target.value })}
                    placeholder="(92) 98620-1641"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                    Número (Somente dígitos):
                  </label>
                  <input
                    type="text"
                    value={formData.whatsAppPhoneRaw}
                    onChange={(e) => setFormData({ ...formData, whatsAppPhoneRaw: e.target.value })}
                    placeholder="5592986201641"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Style Selector & Save Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[#FCD6E0]">
            <div className="flex items-center gap-3">
              <label className="text-xs font-bold text-[#26161B] uppercase tracking-wider">
                Estilo Visual da Barra:
              </label>
              <select
                value={formData.headerStyle}
                onChange={(e) => setFormData({ ...formData, headerStyle: e.target.value as any })}
                className="px-3 py-1.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs font-semibold text-[#26161B]"
              >
                <option value="glass">Vidro Translúcido com Blur (Padrão Sofisticado)</option>
                <option value="solid">Branco Sólido Clean</option>
                <option value="bordered">Borda Delicada Rosé</option>
              </select>
            </div>

            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-all cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Todas as Configurações do Cabeçalho</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
