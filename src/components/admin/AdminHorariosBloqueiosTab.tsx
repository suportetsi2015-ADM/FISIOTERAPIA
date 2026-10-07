import React, { useState } from 'react';
import {
  Clock,
  Calendar,
  FileSpreadsheet,
  FileText,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  Award,
  Eye,
  X
} from 'lucide-react';
import { CLINIC_INFO } from '../../data/content';
import {
  getScheduleConfig,
  saveScheduleConfig,
  exportScheduleToXLS,
  exportScheduleToPDF
} from '../../data/bookingStore';
import { ScheduleConfig } from '../../types';

interface AdminHorariosBloqueiosTabProps {
  isUserPortal?: boolean;
}

export const AdminHorariosBloqueiosTab: React.FC<AdminHorariosBloqueiosTabProps> = ({ isUserPortal = false }) => {
  const [scheduleConfig, setScheduleConfigState] = useState<ScheduleConfig>(getScheduleConfig());
  const [newSlotInput, setNewSlotInput] = useState('');
  const [blockDateInput, setBlockDateInput] = useState('');
  const [scheduleToast, setScheduleToast] = useState<string | null>(null);
  const [isVisualReportOpen, setIsVisualReportOpen] = useState(false);

  const showToast = (msg = 'Configurações de horários e bloqueios salvas com sucesso!') => {
    setScheduleToast(msg);
    setTimeout(() => setScheduleToast(null), 3500);
  };

  const handleToggleDay = (dayIndex: number) => {
    const isCurrentlyActive = scheduleConfig.activeDays.includes(dayIndex);
    const updatedDays = isCurrentlyActive
      ? scheduleConfig.activeDays.filter(d => d !== dayIndex)
      : [...scheduleConfig.activeDays, dayIndex].sort();

    setScheduleConfigState({
      ...scheduleConfig,
      activeDays: updatedDays
    });
  };

  const handleAddSlot = () => {
    if (!newSlotInput.trim()) return;
    const cleanSlot = newSlotInput.trim();
    if (scheduleConfig.availableSlots.includes(cleanSlot)) {
      showToast('Este horário já existe na lista.');
      return;
    }
    const updatedSlots = [...scheduleConfig.availableSlots, cleanSlot].sort();
    setScheduleConfigState({
      ...scheduleConfig,
      availableSlots: updatedSlots
    });
    setNewSlotInput('');
  };

  const handleRemoveSlot = (slot: string) => {
    setScheduleConfigState({
      ...scheduleConfig,
      availableSlots: scheduleConfig.availableSlots.filter(s => s !== slot)
    });
  };

  const handleAddBlockedDate = () => {
    if (!blockDateInput) return;
    if (scheduleConfig.blockedDates.includes(blockDateInput)) {
      showToast('Esta data já se encontra bloqueada.');
      return;
    }
    const updated = [...scheduleConfig.blockedDates, blockDateInput].sort();
    setScheduleConfigState({
      ...scheduleConfig,
      blockedDates: updated
    });
    setBlockDateInput('');
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    setScheduleConfigState({
      ...scheduleConfig,
      blockedDates: scheduleConfig.blockedDates.filter(d => d !== dateStr)
    });
  };

  const handleSaveScheduleConfig = () => {
    saveScheduleConfig(scheduleConfig);
    showToast('Configurações de horários e bloqueios salvas com sucesso!');
  };

  const handleExportXLS = () => {
    exportScheduleToXLS(scheduleConfig);
  };

  const handleExportPDF = () => {
    exportScheduleToPDF(scheduleConfig);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {scheduleToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#26161B] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FCD6E0]/40 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          <span className="text-sm font-medium">{scheduleToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#FCD6E0]">
            <Award className="w-3.5 h-3.5 text-[#D85072]" />
            <span>{isUserPortal ? 'Portal do Usuário • Operacional' : 'Portal do Administrador • Grade'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            HORÁRIOS & BLOQUEIOS DA AGENDA
          </h2>
          <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
            Defina os dias da semana em que há aulas de Pilates, gerencie a grade de horários disponíveis e bloqueie feriados ou recessos da clínica.
          </p>
        </div>

        {/* Action / Export Buttons (Standardized "Baixar XLS" and "Baixar PDF") */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportXLS}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer shadow-xs"
            title="Baixar planilha padronizada em formato Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
            <span>Baixar XLS</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-xs"
            title="Baixar relatório padronizado em formato PDF"
          >
            <FileText className="w-4 h-4 text-[#D85072]" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVisualReportOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-[#26161B] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-xs"
            title="Gerar e visualizar relatório em tela (com opções de Baixar XLS e Baixar PDF)"
          >
            <Eye className="w-4 h-4 text-[#8C3B50]" />
            <span>Relatório em Tela (Visual)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveScheduleConfig}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-md cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Salvar Alterações</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Dias de Atendimento */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
          <h3 className="font-serif text-lg font-bold text-[#26161B] mb-2 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#D85072]" />
            <span>Dias de Atendimento na Semana</span>
          </h3>
          <p className="text-xs text-[#5B444C] mb-4">
            Clique no dia para ativar ou desativar o agendamento de alunos.
          </p>
          <div className="space-y-2.5">
            {[
              { dayIndex: 1, label: 'Segunda-feira' },
              { dayIndex: 2, label: 'Terça-feira' },
              { dayIndex: 3, label: 'Quarta-feira' },
              { dayIndex: 4, label: 'Quinta-feira' },
              { dayIndex: 5, label: 'Sexta-feira' },
              { dayIndex: 6, label: 'Sábado' },
              { dayIndex: 0, label: 'Domingo' },
            ].map(({ dayIndex, label }) => {
              const isEnabled = scheduleConfig.activeDays.includes(dayIndex);
              return (
                <div
                  key={dayIndex}
                  onClick={() => handleToggleDay(dayIndex)}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-[#FCD6E0] hover:bg-[#FFFDFB] cursor-pointer transition-colors"
                >
                  <span className="text-sm font-medium text-[#26161B]">{label}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                      isEnabled
                        ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                        : 'bg-[#FBEBEB] text-[#C5221F] border border-[#F6C7C7]'
                    }`}
                  >
                    {isEnabled ? 'Ativo na Agenda' : 'Fechado'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Grade de Horários */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-[#26161B] mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D85072]" />
              <span>Grade de Horários das Aulas</span>
            </h3>
            <p className="text-xs text-[#5B444C] mb-4">
              Horários disponíveis para os alunos marcarem aulas de Pilates.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="time"
                value={newSlotInput}
                onChange={(e) => setNewSlotInput(e.target.value)}
                className="px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-[#FFFDFB] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
              <button
                type="button"
                onClick={handleAddSlot}
                className="px-4 py-2.5 rounded-xl bg-[#9C2744] text-white text-xs font-semibold hover:bg-[#8C3B50] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Horário</span>
              </button>
            </div>

            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-1">
              {scheduleConfig.availableSlots.map((slot) => (
                <div
                  key={slot}
                  className="px-3 py-1.5 rounded-xl bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] text-xs font-bold flex items-center gap-2 shadow-2xs"
                >
                  <Clock className="w-3.5 h-3.5 text-[#D85072]" />
                  <span>{slot}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    className="hover:text-[#C5221F] p-0.5 rounded cursor-pointer transition-colors"
                    title="Remover horário"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#FCD6E0]/60">
            <label className="block text-xs font-semibold text-[#8C3B50] uppercase tracking-wider mb-2">
              Capacidade Máxima por Horário
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min={1}
                max={10}
                value={scheduleConfig.maxPatientsPerSlot}
                onChange={(e) =>
                  setScheduleConfigState({
                    ...scheduleConfig,
                    maxPatientsPerSlot: parseInt(e.target.value, 10) || 1
                  })
                }
                className="w-24 px-3 py-2 rounded-xl border border-[#FCD6E0] text-sm font-bold text-[#26161B] bg-[#FFFDFB] text-center"
              />
              <span className="text-xs text-[#5B444C]">
                aluno(s) por turma / horário de aula
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Datas Bloqueadas */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
        <h3 className="font-serif text-lg font-bold text-[#26161B] mb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#D85072]" />
          <span>Datas com Bloqueio de Atendimento (Feriados, Férias ou Recessos)</span>
        </h3>
        <p className="text-xs text-[#5B444C] mb-4">
          Nestas datas a agenda online permanecerá fechada para novas marcações.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="date"
            value={blockDateInput}
            onChange={(e) => setBlockDateInput(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-[#FFFDFB] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
          />
          <button
            type="button"
            onClick={handleAddBlockedDate}
            className="px-5 py-2.5 rounded-xl bg-[#9C2744] text-white text-xs font-semibold hover:bg-[#8C3B50] transition-colors flex items-center gap-1.5 self-start cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Bloquear Data Selecionada</span>
          </button>
        </div>

        {scheduleConfig.blockedDates.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0] text-xs text-[#8C3B50] italic">
            Nenhuma data bloqueada no momento.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {scheduleConfig.blockedDates.map((dateStr) => {
              const [y, m, d] = dateStr.split('-');
              return (
                <div
                  key={dateStr}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FDEDF0] border border-[#FCD6E0] text-xs font-bold text-[#9C2744]"
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-[#D85072]" />
                    <span>{`${d}/${m}/${y}`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveBlockedDate(dateStr)}
                    className="text-[#8C3B50] hover:text-[#C5221F] p-1 cursor-pointer transition-colors"
                    title="Desbloquear data"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL DE RELATÓRIO EM TELA (VISUAL) — HORÁRIOS & BLOQUEIOS         */}
      {/* Sem opção para IMPRIMIR, prevalecendo somente Baixar XLS e PDF      */}
      {/* =================================================================== */}
      {isVisualReportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsVisualReportOpen(false)}
        >
          <div
            className="bg-[#3D232B] text-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#FCD6E0]/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header / Toolbar: SOMENTE Baixar XLS e Baixar PDF */}
            <div className="p-4 sm:p-5 bg-[#2B151C] border-b border-[#FCD6E0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D85072]" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Visualização do Relatório em Tela — Horários & Bloqueios da Agenda
                  </h3>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Confira a diagramação oficial do relatório em tela. Utilize as opções ao lado para Baixar XLS ou Baixar PDF.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportXLS}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                  <span>Baixar XLS</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#9C2744] bg-white hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#D85072]" />
                  <span>Baixar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsVisualReportOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Paper Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#2A141A]/50 flex justify-center">
              <div className="w-full max-w-4xl bg-white text-[#26161B] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#E5E7EB]">
                {/* Official Clinic Letterhead */}
                <div className="bg-[#8C3B50] text-white p-5 rounded-xl mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                      Dra. Léia Mar — Fisioterapia & Pilates
                    </h1>
                    <p className="text-xs text-rose-100 mt-1">
                      CREFITO: {CLINIC_INFO.crefito} • WhatsApp: {CLINIC_INFO.phoneDisplay} • {CLINIC_INFO.address}, {CLINIC_INFO.neighborhood} - {CLINIC_INFO.cityState}
                    </p>
                  </div>
                  <div className="text-right text-xs text-rose-200">
                    <span className="font-bold text-white block">Documento Gerencial</span>
                    <span>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-[#FCD6E0] gap-2">
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#26161B]">
                      Relatório de Horários & Bloqueios da Agenda
                    </h2>
                    <p className="text-xs text-[#5B444C]">
                      Capacidade máxima: {scheduleConfig.maxPatientsPerSlot} aluno(s) por horário • Horários ativos: {scheduleConfig.availableSlots.length}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] w-fit">
                    Grade Oficial de Horários
                  </span>
                </div>

                <div className="space-y-5 text-xs">
                  {/* Dias da Semana */}
                  <div>
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px] mb-2">1. Dias da Semana na Agenda</h4>
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-[#8C3B50] text-white">
                          <th className="p-2 font-bold">Dia da Semana</th>
                          <th className="p-2 font-bold">Status na Agenda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { dayIndex: 1, label: 'Segunda-feira' },
                          { dayIndex: 2, label: 'Terça-feira' },
                          { dayIndex: 3, label: 'Quarta-feira' },
                          { dayIndex: 4, label: 'Quinta-feira' },
                          { dayIndex: 5, label: 'Sexta-feira' },
                          { dayIndex: 6, label: 'Sábado' },
                          { dayIndex: 0, label: 'Domingo' },
                        ].map((d, i) => {
                          const enabled = scheduleConfig.activeDays.includes(d.dayIndex);
                          return (
                            <tr key={d.dayIndex} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                              <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{d.label}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 font-semibold">
                                {enabled ? 'ATIVO NA AGENDA' : 'FECHADO'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Horários Disponíveis */}
                  <div>
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px] mb-2">2. Grade de Horários Disponíveis</h4>
                    <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0] flex flex-wrap gap-2">
                      {scheduleConfig.availableSlots.map((slot) => (
                        <span key={slot} className="px-2.5 py-1 rounded-lg bg-[#FFEBF0] text-[#9C2744] font-bold border border-[#FCD6E0]">
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Datas Bloqueadas */}
                  <div>
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px] mb-2">3. Datas Bloqueadas (Feriados / Recessos)</h4>
                    <div className="p-3.5 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                      {scheduleConfig.blockedDates.length === 0 ? (
                        <span className="text-[#8C3B50] italic">Nenhuma data bloqueada no momento.</span>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {scheduleConfig.blockedDates.map((d) => (
                            <span key={d} className="px-2.5 py-1 rounded-lg bg-[#FDEDF0] text-[#9C2744] font-bold border border-[#FCD6E0]">
                              {d.split('-').reverse().join('/')}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#5B444C] gap-2">
                  <span>Documento oficial gerado em tela • Dra. Léia Mar</span>
                  <div className="flex items-center gap-6">
                    <span>Assinatura do Responsável: __________________________________</span>
                    <span>Página 1 de 1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-[#2B151C] border-t border-[#FCD6E0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-rose-200">
                Relatório oficial gerado em tela (visual). Utilize as opções no topo para Baixar XLS ou Baixar PDF.
              </span>
              <button
                type="button"
                onClick={() => setIsVisualReportOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
