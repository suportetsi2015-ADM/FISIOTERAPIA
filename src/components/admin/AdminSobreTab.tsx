import React, { useRef, useState } from 'react';
import {
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { ClinicData, ClinicCredential, saveStoredClinicData } from '../../data/clinicStore';
import { useOfficialPhotos, processImageFile, saveOfficialPhoto, resetOfficialPhotos } from '../../data/photoStore';

interface AdminSobreTabProps {
  clinicForm: ClinicData;
  setClinicForm: React.Dispatch<React.SetStateAction<ClinicData>>;
  onSaved: () => void;
}

export const AdminSobreTab: React.FC<AdminSobreTabProps> = ({
  clinicForm,
  setClinicForm,
  onSaved
}) => {
  const { portrait, portraitIsCustom } = useOfficialPhotos();
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
      await saveOfficialPhoto('portrait', dataUrl);
      setToast('Foto Sobre da Dra. Léia Mar salva definitivamente no servidor global!');
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
      await saveOfficialPhoto('portrait', urlInput.trim());
      setUrlInput('');
      setToast('Foto da Seção Sobre atualizada com sucesso e sincronizada em todos os navegadores!');
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
      await resetOfficialPhotos('portrait');
      setToast('Foto original da Seção Sobre restaurada com sucesso!');
    } catch (err: any) {
      setToast(err?.message || 'Erro ao restaurar foto');
    } finally {
      setIsUploading(false);
      setTimeout(() => setToast(null), 4000);
    }
  };

  // Credentials management (adicionar/editar/excluir formações)
  const handleAddCredential = () => {
    const newCred: ClinicCredential = {
      id: `cred-${Date.now()}`,
      title: 'Nova Certificação ou Especialização',
      desc: 'Descrição da certificação ou área de atendimento com a Dra. Léia Mar.'
    };
    setClinicForm({
      ...clinicForm,
      aboutCredentials: [...(clinicForm.aboutCredentials || []), newCred]
    });
  };

  const handleUpdateCredential = (id: string, field: 'title' | 'desc', value: string) => {
    const updated = (clinicForm.aboutCredentials || []).map(c => {
      if (c.id === id) {
        return { ...c, [field]: value };
      }
      return c;
    });
    setClinicForm({ ...clinicForm, aboutCredentials: updated });
  };

  const handleDeleteCredential = (id: string) => {
    const updated = (clinicForm.aboutCredentials || []).filter(c => c.id !== id);
    setClinicForm({ ...clinicForm, aboutCredentials: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredClinicData(clinicForm);
    onSaved();
    setToast('Textos e credenciais da seção "Sobre a Dra. Léia Mar" salvos com sucesso!');
    setTimeout(() => setToast(null), 4000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
        <span className="text-xs font-bold uppercase tracking-widest text-[#D85072] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
          Gestão da Aba Sobre
        </span>
        <h2 className="font-serif text-2xl font-bold text-[#26161B] mt-2">
          Imagens e Textos de "Sobre a Dra. Léia Mar"
        </h2>
        <p className="text-sm text-[#5B444C] mt-1 max-w-3xl">
          Poste, edite, insira, troque ou exclua o retrato oficial, a biografia, a citação de acolhimento e a lista de credenciais da Dra. Léia Mar.
        </p>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* CARD 1: Foto do Perfil (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-xl font-bold text-[#26161B]">
                Retrato Oficial da Dra. Léia Mar
              </h3>
              {portraitIsCustom ? (
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
              Foto que representa a profissional na seção "Sobre". Renderizada de forma pura e limpa sem quadros que cubram seu rosto.
            </p>

            <div className="relative rounded-2xl overflow-hidden border border-[#FCD6E0] aspect-[4/5] bg-[#FFF5F5] mb-5 shadow-inner">
              <img
                src={portrait}
                alt="Preview do Retrato Oficial da Dra. Léia Mar"
                className="w-full h-full object-cover object-[center_15%]"
              />
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />

            <div className="space-y-3">
              <button
                type="button"
                disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Processando...' : 'Postar / Trocar Foto da Dra. Léia'}</span>
              </button>

              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="Ou cole a URL direta da imagem..."
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

              {portraitIsCustom && (
                <button
                  type="button"
                  onClick={handleResetPhoto}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0] text-[#8C3B50] hover:bg-[#FFEBF0] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Excluir Foto Personalizada (Voltar à Original)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CARD 2: Textos e Credenciais (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
          <h3 className="font-serif text-xl font-bold text-[#26161B] mb-2">
            Textos e Biografia da Dra. Léia Mar
          </h3>
          <p className="text-xs text-[#5B444C] mb-6">
            Altere os dados de titulação, frases e lista de credenciais exibidas na One Page.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Nome da Profissional
                </label>
                <input
                  type="text"
                  value={clinicForm.name}
                  onChange={(e) => setClinicForm({ ...clinicForm, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                  Registro Profissional (CREFITO)
                </label>
                <input
                  type="text"
                  value={clinicForm.crefito}
                  onChange={(e) => setClinicForm({ ...clinicForm, crefito: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Especialidade / Cargo
              </label>
              <input
                type="text"
                value={clinicForm.role}
                onChange={(e) => setClinicForm({ ...clinicForm, role: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Selo Superior da Seção (Eyebrow)
              </label>
              <input
                type="text"
                value={clinicForm.aboutTag || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, aboutTag: e.target.value })}
                placeholder="Ex: SOBRE A FISIOTERAPEUTA"
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Citação de Filosofia em Destaque (Aspas)
              </label>
              <textarea
                rows={2}
                value={clinicForm.aboutQuote || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, aboutQuote: e.target.value })}
                placeholder="Ex: “Meu propósito é ajudar cada mulher a se movimentar com liberdade...”"
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] italic focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                Texto de Filosofia e Acolhimento
              </label>
              <textarea
                rows={3}
                value={clinicForm.aboutPhilosophy || ''}
                onChange={(e) => setClinicForm({ ...clinicForm, aboutPhilosophy: e.target.value })}
                placeholder="Acredito no Pilates como uma experiência de transformação e autocuidado..."
                className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>

            {/* Credenciais & Formações (Inserir / Editar / Excluir) */}
            <div className="pt-4 border-t border-[#FCD6E0]/60 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#26161B]">
                    Credenciais e Certificações Clínicas
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Adicione, edite ou exclua formações exibidas nos cartões da seção "Sobre".
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddCredential}
                  className="px-3 py-1.5 rounded-xl bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold hover:bg-[#FCD6E0] transition-colors border border-[#FCD6E0] flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inserir Credencial</span>
                </button>
              </div>

              <div className="space-y-3">
                {(clinicForm.aboutCredentials || []).map((cred) => (
                  <div
                    key={cred.id}
                    className="p-3.5 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between"
                  >
                    <div className="flex-1 space-y-1.5 w-full">
                      <input
                        type="text"
                        value={cred.title}
                        onChange={(e) => handleUpdateCredential(cred.id, 'title', e.target.value)}
                        placeholder="Título da formação ou especialidade"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] text-xs font-bold text-[#26161B] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                      />
                      <input
                        type="text"
                        value={cred.desc}
                        onChange={(e) => handleUpdateCredential(cred.id, 'desc', e.target.value)}
                        placeholder="Descrição curta da certificação"
                        className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] text-xs text-[#5B444C] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCredential(cred.id)}
                      className="p-2 rounded-lg text-[#A8928B] hover:text-[#C5221F] hover:bg-[#FDEDF0] transition-colors self-end sm:self-center"
                      title="Excluir esta credencial"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-[#FCD6E0]/60 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-md flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Alterações de "Sobre a Dra. Léia Mar"</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};
