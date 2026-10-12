import React, { useRef, useState } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertCircle,
  Image as ImageIcon,
  Sparkles,
  ShieldCheck,
  Globe,
  X,
  FileCheck
} from 'lucide-react';
import { useOfficialPhotos, processImageFile, saveOfficialPhoto, resetOfficialPhotos, SERVER_OFFICIAL_HERO, SERVER_OFFICIAL_PORTRAIT } from '../../data/photoStore';

interface AdminOfficialPhotoSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminOfficialPhotoSyncModal: React.FC<AdminOfficialPhotoSyncModalProps> = ({ isOpen, onClose }) => {
  const { studioHero, portrait, customLogo } = useOfficialPhotos();
  const heroInputRef = useRef<HTMLInputElement>(null);
  const sobreInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isUploadingSobre, setIsUploadingSobre] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 5000);
  };

  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingLogo(true);
      const dataUrl = await processImageFile(file);
      await saveOfficialPhoto('logo', dataUrl);
      showToast('Logo da Dra. Léia Mar atualizado e gravado no servidor!');
    } catch (err: any) {
      showToast(err?.message || 'Erro ao carregar o logo');
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const handleResetLogo = () => {
    resetOfficialPhotos('logo');
    showToast('Logo restaurado para o emblema vetorial original!');
  };

  const handleUploadPrincipal = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingHero(true);
      const dataUrl = await processImageFile(file);
      await saveOfficialPhoto('studioHero', dataUrl);
      showToast('Foto PRINCIPAL da Dra. Léia Mar gravada definitivamente no servidor global!');
    } catch (err: any) {
      showToast(err?.message || 'Erro ao gravar foto principal');
    } finally {
      setIsUploadingHero(false);
      if (heroInputRef.current) heroInputRef.current.value = '';
    }
  };

  const handleUploadSobre = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingSobre(true);
      const dataUrl = await processImageFile(file);
      await saveOfficialPhoto('portrait', dataUrl);
      showToast('Foto SOBRE da Dra. Léia Mar gravada definitivamente no servidor global!');
    } catch (err: any) {
      showToast(err?.message || 'Erro ao gravar foto sobre');
    } finally {
      setIsUploadingSobre(false);
      if (sobreInputRef.current) sobreInputRef.current.value = '';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#14080B]/75 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border-2 border-[#D85072]/30 overflow-hidden text-[#26161B] max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Banner */}
        <div className="h-3 w-full bg-gradient-to-r from-[#D85072] via-[#BC3859] to-[#9C2744]" />

        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between gap-4 border-b border-[#FCD6E0]/60 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-[11px] font-bold tracking-wider uppercase mb-1 border border-[#FCD6E0]">
                <Globe className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Servidor Global • leiamarpilates.online</span>
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B]">
                Substituição Definitiva das Fotos da Dra. Léia Mar
              </h2>
              <p className="text-xs sm:text-sm text-[#5B444C] mt-1">
                Garante que ao abrir o domínio em qualquer navegador ou celular, <strong>apenas as fotos 100% originais da Dra. Léia Mar sejam exibidas</strong>, substituindo permanentemente as imagens sintéticas do AI Studio.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-[#8C3B50] hover:text-[#26161B] hover:bg-[#FFEBF0] transition-colors"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {toastMessage && (
            <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2 shadow-xs">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Grid de Substituição em 2 Colunas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* SLOT 1: FOTO PRINCIPAL (CAPA / HERO) */}
            <div className="bg-[#FFFDFB] rounded-2xl border-2 border-[#FCD6E0] p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744] bg-[#FFEBF0] px-2.5 py-0.5 rounded-full border border-[#FCD6E0]">
                    1. Foto Principal (Capa)
                  </span>
                  <FileCheck className="w-4 h-4 text-[#1D7A46]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#26161B] mb-1">
                  Dra. Léia Mar - PRINCIPAL.jpeg
                </h3>
                <p className="text-[11px] text-[#5B444C] mb-3">
                  Exibida na abertura e destaque principal da página (One Page).
                </p>

                {/* Preview */}
                <div className="relative rounded-xl overflow-hidden border border-[#FCD6E0] aspect-[4/5] bg-[#FFF5F5] mb-3 shadow-inner">
                  <img
                    src={studioHero}
                    alt="Foto Principal Dra. Léia Mar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={heroInputRef}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleUploadPrincipal}
                />
                <button
                  type="button"
                  disabled={isUploadingHero}
                  onClick={() => heroInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-bold text-xs hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingHero ? 'Gravando no servidor...' : 'Carregar "Dra. Léia Mar - PRINCIPAL.jpeg"'}</span>
                </button>
                <span className="text-[10px] text-center text-[#8C3B50] block mt-1.5 font-medium">
                  Salva em: <code className="bg-gray-100 px-1 py-0.5 rounded">/images/dra_leia_principal.jpg</code>
                </span>
              </div>
            </div>

            {/* SLOT 2: FOTO SOBRE A FISIOTERAPEUTA */}
            <div className="bg-[#FFFDFB] rounded-2xl border-2 border-[#FCD6E0] p-4 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744] bg-[#FFEBF0] px-2.5 py-0.5 rounded-full border border-[#FCD6E0]">
                    2. Foto da Seção Sobre
                  </span>
                  <FileCheck className="w-4 h-4 text-[#1D7A46]" />
                </div>
                <h3 className="font-serif text-base font-bold text-[#26161B] mb-1">
                  Dra. Léia Mar - SOBRE.jpeg
                </h3>
                <p className="text-[11px] text-[#5B444C] mb-3">
                  Exibida na biografia e autoridade técnica da fisioterapeuta.
                </p>

                {/* Preview */}
                <div className="relative rounded-xl overflow-hidden border border-[#FCD6E0] aspect-[4/5] bg-[#FFF5F5] mb-3 shadow-inner">
                  <img
                    src={portrait}
                    alt="Foto Sobre Dra. Léia Mar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              <div>
                <input
                  type="file"
                  ref={sobreInputRef}
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  className="hidden"
                  onChange={handleUploadSobre}
                />
                <button
                  type="button"
                  disabled={isUploadingSobre}
                  onClick={() => sobreInputRef.current?.click()}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-bold text-xs hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                >
                  <Upload className="w-4 h-4" />
                  <span>{isUploadingSobre ? 'Gravando no servidor...' : 'Carregar "Dra. Léia Mar - SOBRE.jpeg"'}</span>
                </button>
                <span className="text-[10px] text-center text-[#8C3B50] block mt-1.5 font-medium">
                  Salva em: <code className="bg-gray-100 px-1 py-0.5 rounded">/images/dra_leia_sobre.jpg</code>
                </span>
              </div>
            </div>
          </div>

          {/* 3. Logo Oficial da Marca */}
          <div className="bg-white rounded-2xl border-2 border-[#FCD6E0] p-5 shadow-xs">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-[#FFFDFB] rounded-2xl border border-[#FCD6E0] shadow-inner flex items-center justify-center">
                  <img
                    src="/images/logo_oficial.png"
                    alt="Logo Oficial Dra. Léia Mar"
                    className="w-14 h-14 object-contain rounded-full shadow-2xs"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-[#9C2744]">
                      Logo Oficial da Marca
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]">
                      Arquivo Oficial Ativo
                    </span>
                  </div>
                  <p className="text-xs text-[#5B444C] mt-1">
                    Exibido no Cabeçalho e Rodapé da Página da Dra. Léia Mar.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="file"
                  ref={logoInputRef}
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  className="hidden"
                  onChange={handleUploadLogo}
                />
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="flex-1 md:flex-none py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-bold text-xs hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploadingLogo ? 'Gravando...' : 'Carregar Imagem de Logo'}</span>
                </button>
                {customLogo && (
                  <button
                    type="button"
                    onClick={handleResetLogo}
                    className="py-2.5 px-3 rounded-xl bg-[#FFEBF0] text-[#9C2744] hover:bg-[#FCD6E0] text-xs font-semibold transition-colors cursor-pointer"
                    title="Restaurar emblema vetorial original"
                  >
                    Restaurar Vetor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Garantia Técnica */}
          <div className="bg-[#FFF9F7] rounded-2xl border border-[#FCD6E0] p-4 text-xs text-[#5B444C] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#1D7A46] shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-[#26161B] block">Garantia de Entrega para Todos os Navegadores:</strong>
              <p>
                Ao carregar os arquivos neste painel, as imagens originais são salvas diretamente no disco do servidor (<code className="bg-white px-1 py-0.5 rounded border border-[#FCD6E0]">/public/images/</code>). Isso assegura que pacientes e visitantes em qualquer navegador ou celular visualizem imediatamente as fotos 100% autênticas da Dra. Léia Mar.
              </p>
            </div>
          </div>

          <div className="pt-2 text-right">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-[#26161B] hover:bg-[#3D252D] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
            >
              Concluir & Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
