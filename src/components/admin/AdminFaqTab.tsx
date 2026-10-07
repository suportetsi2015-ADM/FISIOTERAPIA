import React, { useState } from 'react';
import {
  HelpCircle,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useFaqs } from '../../data/faqStore';
import { FaqItem } from '../../types';

export const AdminFaqTab: React.FC = () => {
  const { faqs, addFaq, updateFaq, deleteFaq, reorderFaqs, resetFaqs } = useFaqs();

  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQuestion, setEditQuestion] = useState('');
  const [editAnswer, setEditAnswer] = useState('');

  // Feedback toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      showToast('Por favor, preencha a pergunta e a resposta.');
      return;
    }

    addFaq({
      question: newQuestion.trim(),
      answer: newAnswer.trim()
    });

    setNewQuestion('');
    setNewAnswer('');
    setIsCreating(false);
    showToast('Nova Pergunta & Resposta adicionada com sucesso!');
  };

  const startEdit = (item: FaqItem) => {
    setEditingId(item.id);
    setEditQuestion(item.question);
    setEditAnswer(item.answer);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditQuestion('');
    setEditAnswer('');
  };

  const saveEdit = (id: string) => {
    if (!editQuestion.trim() || !editAnswer.trim()) {
      showToast('A pergunta e a resposta não podem ficar em branco.');
      return;
    }

    updateFaq(id, {
      question: editQuestion.trim(),
      answer: editAnswer.trim()
    });

    cancelEdit();
    showToast('Pergunta & Resposta atualizada com sucesso!');
  };

  const handleDelete = (id: string) => {
    deleteFaq(id);
    showToast('Pergunta removida!');
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= faqs.length) return;

    const newArr = [...faqs];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    reorderFaqs(newArr);
    showToast('Ordem das perguntas atualizada!');
  };

  const handleReset = () => {
    resetFaqs();
    showToast('Perguntas e respostas originais restauradas!');
  };

  return (
    <div className="space-y-8 animate-fadeIn">
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
            <HelpCircle className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Dúvidas Frequentes da One Page</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            Perguntas & Respostas da Dra. Léia Mar
          </h2>
          <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
            Edite, adicione, reordene ou exclua as dúvidas frequentes exibidas no site. Todas as alterações são salvas automaticamente e refletidas em tempo real para as alunas e visitantes.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
            title="Restaurar perguntas originais de fábrica"
          >
            <RotateCcw className="w-4 h-4 text-[#D85072]" />
            <span>Restaurar Padrão</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Pergunta & Resposta</span>
          </button>
        </div>
      </div>

      {/* Modal / Inline Creator */}
      {isCreating && (
        <div className="bg-[#FFFDFB] rounded-3xl p-6 sm:p-8 border-2 border-[#D85072]/40 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D85072]" />
              <h3 className="font-serif text-lg font-bold text-[#26161B]">
                Adicionar Nova Pergunta & Resposta
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="p-1 rounded-lg text-[#8C3B50] hover:bg-[#FFEBF0]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
                Pergunta / Dúvida da Aluna:
              </label>
              <input
                type="text"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="Ex: Como funciona a avaliação inicial de Pilates?"
                className="w-full px-4 py-3 rounded-xl border border-[#FCD6E0] bg-white text-[#26161B] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#26161B] uppercase tracking-wider mb-1.5">
                Resposta detalhada da Dra. Léia Mar:
              </label>
              <textarea
                rows={4}
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="Escreva a resposta com tom profissional, acolhedor e seguro..."
                className="w-full px-4 py-3 rounded-xl border border-[#FCD6E0] bg-white text-[#26161B] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-sm transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Salvar e Publicar</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* FAQs List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B50]">
            Total de {faqs.length} perguntas cadastradas
          </span>
          <span className="text-xs text-[#5B444C]">
            Use as setas para alterar a ordem no site
          </span>
        </div>

        {faqs.map((item, index) => {
          const isEditing = editingId === item.id;

          if (isEditing) {
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl p-5 sm:p-6 border-2 border-[#D85072] shadow-md space-y-4"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D85072]">
                    Editando Pergunta #{index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="p-1 rounded-md text-[#8C3B50] hover:bg-[#FFEBF0]"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Pergunta:
                  </label>
                  <input
                    type="text"
                    value={editQuestion}
                    onChange={(e) => setEditQuestion(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-[#26161B] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Resposta:
                  </label>
                  <textarea
                    rows={4}
                    value={editAnswer}
                    onChange={(e) => setEditAnswer(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-[#26161B] text-sm focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => saveEdit(item.id)}
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859]"
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
              className="bg-white rounded-2xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs hover:border-[#D85072]/60 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 group"
            >
              <div className="flex items-start gap-3.5 flex-1">
                <span className="w-7 h-7 rounded-full bg-[#FFEBF0] text-[#D85072] font-semibold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>

                <div className="space-y-2 flex-1">
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] leading-snug">
                    {item.question}
                  </h4>
                  <p className="text-sm text-[#5B444C] leading-relaxed">
                    {item.answer}
                  </p>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="flex items-center gap-1.5 self-end sm:self-start pt-2 sm:pt-0 border-t sm:border-t-0 border-[#FCD6E0]/60 w-full sm:w-auto justify-end">
                {/* Reorder Buttons */}
                <button
                  type="button"
                  onClick={() => handleMove(index, 'up')}
                  disabled={index === 0}
                  className="p-2 rounded-xl border border-[#FCD6E0] text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#D85072] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Subir posição"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleMove(index, 'down')}
                  disabled={index === faqs.length - 1}
                  className="p-2 rounded-xl border border-[#FCD6E0] text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#D85072] disabled:opacity-30 disabled:pointer-events-none transition-colors"
                  title="Descer posição"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold text-[#9C2744] hover:bg-[#FFEBF0] transition-colors"
                  title="Editar pergunta e resposta"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                  <span>Editar</span>
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 rounded-xl border border-[#FCD6E0] text-[#8C3B50] hover:bg-[#FDEDF0] hover:text-[#9C2744] transition-colors"
                  title="Excluir pergunta"
                >
                  <Trash2 className="w-4 h-4 text-[#9C2744]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
