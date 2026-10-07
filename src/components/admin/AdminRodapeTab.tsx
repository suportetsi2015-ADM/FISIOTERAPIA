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
  EyeOff
} from 'lucide-react';
import { useFooterData, SocialLinkItem } from '../../data/footerStore';
import { processImageFile } from '../../data/photoStore';

export const AdminRodapeTab: React.FC = () => {
  const {
    config: footer,
    updateConfig,
    addSocialLink,
    updateSocialLink,
    deleteSocialLink,
    reorderSocialLinks,
    resetConfig
  } = useFooterData();

  // Local form state for general texts
  const [formData, setFormData] = useState({
    brandTitle: footer.brandTitle,
    brandSubtitle: footer.brandSubtitle,
    brandDescription: footer.brandDescription,
    navTitle: footer.navTitle,
    contactTitle: footer.contactTitle,
    badgeText: footer.badgeText,
    copyrightText: footer.copyrightText,
    privacyTitle: footer.privacyTitle,
    privacyText: footer.privacyText,
    termsTitle: footer.termsTitle,
    termsText: footer.termsText
  });

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

  const handleSaveTexts = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfig(formData);
    showToast('Textos do Rodapé atualizados com sucesso!');
  };

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

  // Upload custom icon image
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
      brandTitle: footer.brandTitle,
      brandSubtitle: footer.brandSubtitle,
      brandDescription: footer.brandDescription,
      navTitle: footer.navTitle,
      contactTitle: footer.contactTitle,
      badgeText: footer.badgeText,
      copyrightText: footer.copyrightText,
      privacyTitle: footer.privacyTitle,
      privacyText: footer.privacyText,
      termsTitle: footer.termsTitle,
      termsText: footer.termsText
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
            <span>Rodapé & Redes Sociais da One Page</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            Gestão de Textos, Links e Ícones do Rodapé
          </h2>
          <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
            Insira novas redes sociais, troque links, edite descrições institucionais, copyright e termos legais de privacidade exibidos no rodapé do site.
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

      {/* SECTION 1: REDES SOCIAIS E ÍCONES */}
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
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
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
                    placeholder="Ex: Instagram da Dra. Léia Mar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  Link de Destino (URL completa):
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://instagram.com/dra.leiamar ou https://wa.me/..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  required
                />
              </div>

              {/* Optional Custom Image Icon Upload */}
              <div className="bg-white p-4 rounded-xl border border-[#FCD6E0]">
                <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1">
                  Imagem / Ícone Personalizado (Opcional):
                </label>
                <p className="text-xs text-[#5B444C] mb-3">
                  Se você desejar um ícone com imagem própria em vez do símbolo padrão da plataforma.
                </p>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={newIconFileRef}
                    accept="image/*"
                    onChange={(e) => handleUploadIcon(e, false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => newIconFileRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] hover:bg-[#FCD6E0] transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Carregar Arquivo de Imagem</span>
                  </button>

                  {newCustomIconUrl && (
                    <div className="flex items-center gap-2">
                      <img
                        src={newCustomIconUrl}
                        alt="Preview"
                        className="w-7 h-7 rounded-full object-cover border border-[#D85072]"
                      />
                      <button
                        type="button"
                        onClick={() => setNewCustomIconUrl('')}
                        className="text-xs text-[#9C2744] hover:underline"
                      >
                        Remover imagem
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingSocial(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#5B444C] hover:bg-[#FFEBF0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859]"
                >
                  <Check className="w-4 h-4" />
                  <span>Adicionar ao Rodapé</span>
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
                  className="bg-white rounded-2xl p-5 border-2 border-[#D85072] shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#D85072]">
                      Editando Link #{index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEditingSocialId(null)}
                      className="p-1 rounded text-[#8C3B50] hover:bg-[#FFEBF0]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#26161B] mb-1">
                        Plataforma:
                      </label>
                      <select
                        value={editPlatform}
                        onChange={(e) => setEditPlatform(e.target.value as SocialLinkItem['platform'])}
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
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
                      <label className="block text-xs font-bold text-[#26161B] mb-1">
                        Identificação / Rótulo:
                      </label>
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      URL / Link Completo:
                    </label>
                    <input
                      type="text"
                      value={editUrl}
                      onChange={(e) => setEditUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
                    />
                  </div>

                  {/* Edit Custom Icon */}
                  <div className="flex items-center gap-3 pt-1">
                    <input
                      type="file"
                      ref={editIconFileRef}
                      accept="image/*"
                      onChange={(e) => handleUploadIcon(e, true)}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => editIconFileRef.current?.click()}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] hover:bg-[#FCD6E0]"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editCustomIconUrl ? 'Trocar Imagem do Ícone' : 'Carregar Imagem para o Ícone'}</span>
                    </button>
                    {editCustomIconUrl && (
                      <div className="flex items-center gap-2">
                        <img
                          src={editCustomIconUrl}
                          alt="Ícone"
                          className="w-6 h-6 rounded-full object-cover border border-[#D85072]"
                        />
                        <button
                          type="button"
                          onClick={() => setEditCustomIconUrl('')}
                          className="text-xs text-[#9C2744] hover:underline"
                        >
                          Remover
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setEditingSocialId(null)}
                      className="px-3.5 py-1.5 rounded-xl text-xs text-[#5B444C] hover:bg-[#FFEBF0]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEditSocial(item.id)}
                      className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859]"
                    >
                      <Check className="w-4 h-4" />
                      <span>Salvar Alterações</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={item.id}
                className="bg-[#FFFDFB] rounded-2xl p-4 border border-[#FCD6E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#D85072]/60 transition-all"
              >
                <div className="flex items-center gap-3">
                  {renderIconBadge(item)}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-[#26161B]">
                        {item.label}
                      </span>
                      {item.active === false && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-200 text-gray-700 text-[10px] font-bold">
                          Oculto
                        </span>
                      )}
                    </div>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#8C3B50] hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <span className="truncate max-w-xs">{item.url}</span>
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                    </a>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleToggleSocialActive(item.id, item.active !== false)}
                    className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#5B444C] hover:bg-[#FFEBF0] transition-colors"
                    title={item.active === false ? 'Exibir no site' : 'Ocultar do site'}
                  >
                    {item.active === false ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-[#1D7A46]" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveSocial(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-30 transition-colors"
                    title="Mover para cima"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleMoveSocial(index, 'down')}
                    disabled={index === footer.socialLinks.length - 1}
                    className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#5B444C] hover:bg-[#FFEBF0] disabled:opacity-30 transition-colors"
                    title="Mover para baixo"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => startEditSocial(item)}
                    className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] transition-colors"
                    title="Editar link e ícone"
                  >
                    <Edit3 className="w-4 h-4 text-[#D85072]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteSocial(item.id, item.label)}
                    className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0] transition-colors"
                    title="Excluir rede social"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: TEXTOS GERAIS DO RODAPÉ */}
      <form onSubmit={handleSaveTexts} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div className="pb-4 border-b border-[#FCD6E0] flex items-center justify-between">
          <div>
            <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#D85072]" />
              <span>Textos Institucionais & Selos do Rodapé</span>
            </h3>
            <p className="text-xs text-[#5B444C] mt-0.5">
              Altere o título da marca, credencial, descrição da clínica, texto do selo e direitos autorais.
            </p>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Textos</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
              Título da Marca no Rodapé:
            </label>
            <input
              type="text"
              value={formData.brandTitle}
              onChange={(e) => setFormData({ ...formData, brandTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
              Subtítulo / Credenciais CREFITO:
            </label>
            <input
              type="text"
              value={formData.brandSubtitle}
              onChange={(e) => setFormData({ ...formData, brandSubtitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
            Biografia Curta / Descrição Institucional do Rodapé:
          </label>
          <textarea
            rows={3}
            value={formData.brandDescription}
            onChange={(e) => setFormData({ ...formData, brandDescription: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
              Título da Coluna de Navegação:
            </label>
            <input
              type="text"
              value={formData.navTitle}
              onChange={(e) => setFormData({ ...formData, navTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
              Título da Coluna de Contato:
            </label>
            <input
              type="text"
              value={formData.contactTitle}
              onChange={(e) => setFormData({ ...formData, contactTitle: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
              Selo / Destaque de Atendimento:
            </label>
            <input
              type="text"
              value={formData.badgeText}
              onChange={(e) => setFormData({ ...formData, badgeText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
              Texto de Copyright / Direitos Autorais:
            </label>
            <input
              type="text"
              value={formData.copyrightText}
              onChange={(e) => setFormData({ ...formData, copyrightText: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B]"
            />
          </div>
        </div>

        {/* Legal Modals Content */}
        <div className="pt-4 border-t border-[#FCD6E0] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D85072]" />
            <h4 className="font-serif text-lg font-bold text-[#26161B]">
              Políticas Legais (LGPD & Termos de Uso)
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider">
                Conteúdo da Política de Privacidade:
              </label>
              <textarea
                rows={5}
                value={formData.privacyText}
                onChange={(e) => setFormData({ ...formData, privacyText: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B]"
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
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B]"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-sm transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Todas as Alterações do Rodapé</span>
          </button>
        </div>
      </form>
    </div>
  );
};
