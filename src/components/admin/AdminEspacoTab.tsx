import React, { useRef, useState } from 'react';
import {
  Upload,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  Image as ImageIcon,
  Check
} from 'lucide-react';
import {
  useStudioImages,
  addStudioImage,
  updateStudioImage,
  deleteStudioImage,
  resetStoredStudioImages
} from '../../data/studioStore';
import { StudioImage } from '../../types';
import { processImageFile } from '../../data/photoStore';

export const AdminEspacoTab: React.FC = () => {
  const images = useStudioImages();
  const [toast, setToast] = useState<string | null>(null);

  // New Image Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isUploadingNew, setIsUploadingNew] = useState(false);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Editing state for an existing image
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [replacingImageId, setReplacingImageId] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Upload file for new image
  const handleNewFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploadingNew(true);
      const dataUrl = await processImageFile(file);
      setNewUrl(dataUrl);
      showFeedback('Foto carregada pronta para ser inserida!');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erro ao processar imagem');
    } finally {
      setIsUploadingNew(false);
      if (newFileInputRef.current) newFileInputRef.current.value = '';
    }
  };

  // Submit new image to gallery
  const handleCreateImage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) {
      showFeedback('Por favor, selecione uma foto pelo botão "Carregar Imagem" ou insira a URL da foto.');
      return;
    }
    if (!newTitle.trim()) {
      showFeedback('Por favor, informe o título do procedimento.');
      return;
    }

    addStudioImage({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Procedimento realizado no estúdio da Dra. Léia Mar.',
      url: newUrl.trim(),
      aspect: 'portrait'
    });

    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    setShowAddForm(false);
    showFeedback('Nova imagem de procedimento inserida com sucesso na aba Espaço!');
  };

  // Replace photo of existing item
  const handleTriggerReplace = (id: string) => {
    setReplacingImageId(id);
    replaceFileInputRef.current?.click();
  };

  const handleReplaceFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !replacingImageId) return;
    try {
      const dataUrl = await processImageFile(file);
      updateStudioImage(replacingImageId, { url: dataUrl });
      showFeedback('Foto do procedimento substituída com sucesso!');
    } catch (err) {
      showFeedback(err instanceof Error ? err.message : 'Erro ao processar imagem');
    } finally {
      setReplacingImageId(null);
      if (replaceFileInputRef.current) replaceFileInputRef.current.value = '';
    }
  };

  // Start inline edit of text
  const startEdit = (img: StudioImage) => {
    setEditingId(img.id);
    setEditTitle(img.title);
    setEditDesc(img.description);
  };

  const saveEdit = (id: string) => {
    updateStudioImage(id, {
      title: editTitle.trim(),
      description: editDesc.trim()
    });
    setEditingId(null);
    showFeedback('Textos do procedimento atualizados!');
  };

  // Delete image
  const handleDelete = (id: string, title: string) => {
    deleteStudioImage(id);
    showFeedback(`Imagem "${title}" excluída da galeria do Espaço!`);
  };

  // Reset to original
  const handleResetGallery = () => {
    resetStoredStudioImages();
    showFeedback('Galeria do Espaço restaurada para os itens originais!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hidden file input for replacing an image */}
      <input
        type="file"
        ref={replaceFileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleReplaceFileUpload}
      />

      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#D85072] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
              Gestão da Aba Espaço
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#26161B] mt-2">
              Imagens Reais de Procedimentos (Aba "Espaço")
            </h2>
            <p className="text-sm text-[#5B444C] mt-1 max-w-3xl">
              Poste, insira, troque ou exclua as fotos reais de procedimentos, equipamentos e sessões exibidas na seção "Nosso Espaço".
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{showAddForm ? 'Fechar Formulário' : 'Inserir Nova Imagem'}</span>
            </button>

            <button
              type="button"
              onClick={handleResetGallery}
              className="px-3.5 py-2.5 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0] text-[#8C3B50] hover:bg-[#FFEBF0] text-xs font-semibold transition-colors flex items-center gap-1.5"
              title="Voltar às fotos originais"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Restaurar Padrão</span>
            </button>
          </div>
        </div>
      </div>

      {toast && (
        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2.5 shadow-sm">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* FORM: Inserir Nova Imagem / Procedimento */}
      {showAddForm && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-[#D85072]/30 shadow-md">
          <h3 className="font-serif text-xl font-bold text-[#26161B] mb-2 flex items-center gap-2">
            <Plus className="w-5 h-5 text-[#D85072]" />
            <span>Postar / Inserir Nova Imagem de Procedimento</span>
          </h3>
          <p className="text-xs text-[#5B444C] mb-6">
            Envie uma foto de sessão real realizada no estúdio com a Dra. Léia Mar.
          </p>

          <form onSubmit={handleCreateImage} className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Image Preview & Upload (5 cols) */}
              <div className="lg:col-span-5 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B]">
                  Foto do Procedimento
                </label>
                
                <div className="relative rounded-2xl overflow-hidden border border-[#FCD6E0] aspect-[4/3] bg-[#FFF5F5] flex items-center justify-center">
                  {newUrl ? (
                    <img
                      src={newUrl}
                      alt="Preview da nova foto"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-4 text-[#A8928B]">
                      <ImageIcon className="w-8 h-8 mx-auto mb-2 text-[#D85072]" />
                      <p className="text-xs">Nenhuma foto carregada ainda</p>
                    </div>
                  )}
                </div>

                <input
                  type="file"
                  ref={newFileInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handleNewFileUpload}
                />

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={isUploadingNew}
                    onClick={() => newFileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#FFEBF0] text-[#9C2744] hover:bg-[#FCD6E0] border border-[#FCD6E0] text-xs font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploadingNew ? 'Carregando foto...' : 'Carregar Imagem do Dispositivo'}</span>
                  </button>

                  <input
                    type="url"
                    placeholder="Ou cole o link direto da imagem..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                  />
                </div>
              </div>

              {/* Title & Desc (7 cols) */}
              <div className="lg:col-span-7 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                    Título do Procedimento / Equipamento
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="Ex: Fortalecimento no Reformer Clínico"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-1.5">
                    Descrição / Finalidade do Procedimento
                  </label>
                  <textarea
                    rows={4}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Ex: Exercícios focados no alinhamento postural e alívio de tensões na coluna com assistência direta da fisioterapeuta."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2.5 rounded-xl bg-white border border-[#FCD6E0] text-[#5B444C] text-xs font-semibold hover:bg-[#FFFDFB]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Publicar na Galeria do Espaço</span>
                  </button>
                </div>
              </div>

            </div>
          </form>
        </div>
      )}

      {/* Grid of Existing Space Images */}
      <div>
        <h3 className="font-serif text-xl font-bold text-[#26161B] mb-2">
          Fotos Atualmente Exibidas no Espaço ({images.length})
        </h3>
        <p className="text-xs text-[#5B444C] mb-6">
          Você pode trocar a foto de qualquer item existente, editar seus textos ou excluí-lo a qualquer momento.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {images.map((img) => {
            const isEditing = editingId === img.id;
            return (
              <div
                key={img.id}
                className="bg-white rounded-3xl overflow-hidden border border-[#FCD6E0] shadow-2xs flex flex-col justify-between"
              >
                <div>
                  {/* Photo with Overlay Action Button */}
                  <div className="relative aspect-[4/3] bg-[#FFF5F5] group overflow-hidden">
                    <img
                      src={img.url}
                      alt={img.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-[10px] font-bold text-[#9C2744] border border-[#FCD6E0]">
                      Procedimento
                    </div>

                    {/* Replace Photo Button */}
                    <button
                      type="button"
                      onClick={() => handleTriggerReplace(img.id)}
                      className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-white/95 text-[#9C2744] hover:bg-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                      title="Trocar esta imagem por outra foto do seu computador ou celular"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#D85072]" />
                      <span>Trocar Foto</span>
                    </button>
                  </div>

                  {/* Body / Information */}
                  <div className="p-5">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8C3B50] mb-1">
                            Título
                          </label>
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] text-xs font-semibold text-[#26161B] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-[#8C3B50] mb-1">
                            Descrição
                          </label>
                          <textarea
                            rows={2}
                            value={editDesc}
                            onChange={(e) => setEditDesc(e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] text-xs text-[#5B444C] focus:outline-none focus:ring-1 focus:ring-[#D85072]"
                          />
                        </div>
                        <div className="flex gap-2 justify-end pt-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(null)}
                            className="px-2.5 py-1 text-xs text-[#5B444C] hover:underline"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => saveEdit(img.id)}
                            className="px-3 py-1 rounded-lg bg-[#D85072] text-white text-xs font-semibold hover:bg-[#BC3859]"
                          >
                            Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <h4 className="font-serif text-base font-bold text-[#26161B] mb-1">
                          {img.title}
                        </h4>
                        <p className="text-xs text-[#5B444C] leading-relaxed line-clamp-2">
                          {img.description}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Footer Actions */}
                {!isEditing && (
                  <div className="p-4 pt-0 flex items-center justify-between border-t border-[#FCD6E0]/40 mt-2">
                    <button
                      type="button"
                      onClick={() => startEdit(img)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#D85072] hover:text-[#BC3859]"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Editar Texto</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(img.id, img.title)}
                      className="p-1.5 rounded-lg text-[#A8928B] hover:text-[#C5221F] hover:bg-[#FDEDF0] transition-colors"
                      title="Excluir imagem do Espaço"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
