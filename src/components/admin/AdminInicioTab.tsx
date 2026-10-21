import React, { useRef, useState } from 'react';
import {
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Image as ImageIcon,
  Sparkles,
  Heart,
  Calendar,
  Phone,
  Check
} from 'lucide-react';
import { ClinicData, saveStoredClinicData } from '../../data/clinicStore';
import { useOfficialPhotos, processImageFile, saveOfficialPhoto, resetOfficialPhotos } from '../../data/photoStore';

interface AdminInicioTabProps {
  clinicForm: ClinicData;
  setClinicForm: React.Dispatch<React.SetStateAction<ClinicData>>;
  onSaved: () => void;
}

export const AdminInicioTab: React.FC<AdminInicioTabProps> = ({
  clinicForm,
  setClinicForm,
  onSaved
}) => {
  const { studioHero, heroIsCustom } = useOfficialPhotos();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      const dataUrl = await processImageFile(file);
      await saveOfficialPhoto('studioHero', dataUrl);
      setToast('Foto Principal da Dra. Léia Mar salva definitivamente no servidor global!');
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast(err instanceof Error ? err.message : 'Erro ao processar imagem');
      setTimeout(() => setToast(null), 4000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleApplyUrl = async () => {
    if (!urlInput.trim()) return;
    try {
      setIsUploading(true);
      await saveOfficialPhoto('studioHero', urlInput.trim());
      setUrlInput('');
      setToast('Foto Principal atualizada com sucesso e sincronizada em todos os navegadores!');
    } catch (err: any) {
      setToast(err?.message || 'Erro ao atualizar foto via URL');
    } finally {
      setIsUploading(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleResetPhoto = async () => {
    try {
      setIsUploading(true);
      await resetOfficialPhotos('studioHero');
      setToast('Foto do Início restaurada com sucesso!');
    } catch (err: any) {
      setToast(err?.message || 'Erro ao restaurar foto');
    } finally {
      setIsUploading(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleSubmitTexts = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredClinicData(clinicForm);
    onSaved();
    setToast('Textos da Seção Início salvos e sincronizados com a One Page!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D85072] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
              Gestão da Aba Início
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#26161B] mt-2">
              Imagens e Textos da Seção Início (Capa)
            </h2>
            <p className="text-sm text-[#5B444C] mt-1 max-w-3xl">
              Poste, edite, insira, troque ou exclua a foto de destaque e os textos principais exibidos na abertura do site Dra. Léia Mar.
            </p>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Grid: 1 col for photo, 1 col for texts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CARD 1: Imagem da Seção Início (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-[#26161B]">
                Foto Principal do Início
              </h3>
              {heroIsCustom ? (
                <span className="px-2.5 py-1 rounded-full bg-[#EBF7EE] text-[#1D7A46] text-xs font-bold border border-[#B6E3C3]">
                  Personalizada
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-full bg-[#FFFDFB] text-[#8C3B50] text-xs font-bold border border-[#FCD6E0]">
                  Original
                </span>
              )}
            </div>

            <p className="text-xs text-[#5B444C] mb-4">
              Esta é a imagem central exibida no topo da One Page. Sem nenhum banner ou quadro bloqueando a visão da foto.
            </p>

            {/* Image preview */}
            <div className="relative rounded-2xl overflow-hidden border border-[#FCD6E0] aspect-[4/5] bg-[#FFF5F5] mb-5 shadow-inner group">
              <img
                src={studioHero}
                alt="Preview da foto do Início"
                className="w-full h-full object-cover"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Enviando imagem...' : 'Postar / Trocar Foto do Início'}</span>
              </button>

              {/* Paste URL */}
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Ou cole o link direto de uma imagem..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] placeholder-[#A8928B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
                <button
                  type="button"
                  onClick={handleApplyUrl}
                  disabled={!urlInput.trim()}
                  className="px-3.5 py-2 rounded-xl bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold hover:bg-[#FCD6E0] transition-colors border border-[#FCD6E0] disabled:opacity-50"
                >
                  Aplicar
                </button>
              </div>

              {heroIsCustom && (
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0] text-[#8C3B50] hover:bg-[#FFEBF0] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Excluir Foto Customizada (Restaurar Original)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: Textos da Seção Início (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
          <h3 className="font-serif text-xl font-bold text-[#26161B] mb-2">
            Textos e Frases da Aba Início
          </h3>
          <p className="text-xs text-[#5B444C] mb-6">
            Edite cada texto que aparece na abertura do site. Suas alterações são salvas e refletidas em tempo real.
          </p>

          <form onSubmit={handleSubmitTexts} className="space-y-5">
            {/* Selo / Eyebrow */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Selo Superior (Eyebrow Badge)
              </label>
              <input
                type="text"
                value={clinicForm.heroEyebrow || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, heroEyebrow: e.target.value })}
                placeholder="Ex: PILATES • FISIOTERAPIA • MANAUS-AM"
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Título Principal */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Título Principal (H1)
              </label>
              <input
                type="text"
                value={clinicForm.heroTitle || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, heroTitle: e.target.value })}
                placeholder="Ex: Seu corpo em movimento."
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Destaque em Itálico */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Complemento do Título (Frase em Destaque Rosa)
              </label>
              <input
                type="text"
                value={clinicForm.heroHighlight || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, heroHighlight: e.target.value })}
                placeholder="Ex: Sua vida com mais alegria e leveza."
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#D85072] font-serif italic focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Descrição / Apresentação */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Parágrafo Descritivo de Apresentação
              </label>
              <textarea
                rows={3}
                value={clinicForm.heroDescription || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, heroDescription: e.target.value })}
                placeholder="Pilates privativo e personalizado conduzido pela Dra. Léia Mar..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Botões de Ação */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Texto do Botão 1 (Agendamento)
                </label>
                <input
                  type="text"
                  value={clinicForm.heroCta1Text || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, heroCta1Text: e.target.value })}
                  placeholder="Ex: Agendamento Automático"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Texto do Botão 2 (WhatsApp)
                </label>
                <input
                  type="text"
                  value={clinicForm.heroCta2Text || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, heroCta2Text: e.target.value })}
                  placeholder="Ex: Falar no WhatsApp"
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>
            </div>

            {/* 3 Itens de Confirmação Rápida */}
            <div className="pt-3 border-t border-[#FCD6E0]/60 space-y-3">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B]">
                3 Pontos de Destaque / Garantia (Linha Inferior do Início)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  type="text"
                  value={clinicForm.heroReassurance1 || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, heroReassurance1: e.target.value })}
                  placeholder="Destaque 1 (ex: Atendimento privativo)"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
                <input
                  type="text"
                  value={clinicForm.heroReassurance2 || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, heroReassurance2: e.target.value })}
                  placeholder="Destaque 2 (ex: Cidade Nova • Manaus-AM)"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
                <input
                  type="text"
                  value={clinicForm.heroReassurance3 || ''}
                  onChange={(e) => setClinicForm({ ...clinicForm, heroReassurance3: e.target.value })}
                  placeholder="Destaque 3 (ex: Altos da Academia New Fit)"
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-[#FCD6E0]/60 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Textos da Aba Início</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
