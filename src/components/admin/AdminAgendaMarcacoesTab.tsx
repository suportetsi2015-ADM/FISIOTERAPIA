import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  FileSpreadsheet,
  FileText,
  Search,
  Check,
  CheckCircle,
  Ban,
  Trash2,
  Phone,
  MessageCircle,
  Award,
  Eye,
  X
} from 'lucide-react';
import { CLINIC_INFO } from '../../data/content';
import {
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  exportAppointmentsToXLS,
  exportAppointmentsToPDF,
  dismissPendingAlertAppointment
} from '../../data/bookingStore';
import { Appointment, AppointmentStatus } from '../../types';

interface AdminAgendaMarcacoesTabProps {
  isUserPortal?: boolean;
}

export const AdminAgendaMarcacoesTab: React.FC<AdminAgendaMarcacoesTabProps> = ({ isUserPortal = false }) => {
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVisualReportOpen, setIsVisualReportOpen] = useState(false);
  const [aptToDelete, setAptToDelete] = useState<{ id: string; name: string } | null>(null);

  // Sincroniza a lista na tela em tempo real quando novos agendamentos chegarem de celulares/tablets
  useEffect(() => {
    const handleUpdate = () => {
      setAppointments(getAppointments());
    };
    window.addEventListener('appointments-synced', handleUpdate);
    window.addEventListener('new-online-booking', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('appointments-synced', handleUpdate);
      window.removeEventListener('new-online-booking', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const updated = updateAppointmentStatus(id, status);
    if (status === 'confirmado' || status === 'cancelado') {
      dismissPendingAlertAppointment(id);
    }
    setAppointments([...updated]);
    const labels: Record<AppointmentStatus, string> = {
      confirmado: 'Agendamento confirmado!',
      concluido: 'Atendimento concluído!',
      cancelado: 'Agendamento cancelado.',
      pendente: 'Status alterado para pendente.'
    };
    showToast(labels[status]);
  };

  const handleDeleteAppointment = (id: string, name: string) => {
    setAptToDelete({ id, name });
  };

  const confirmDeleteAppointment = () => {
    if (!aptToDelete) return;
    const updated = deleteAppointment(aptToDelete.id);
    setAppointments([...updated]);
    showToast(`Agendamento de "${aptToDelete.name}" excluído com sucesso!`);
    setAptToDelete(null);
  };

  const handleExportXLS = () => {
    exportAppointmentsToXLS(appointments);
    showToast('Planilha Excel (.xlsx) baixada com sucesso!');
  };

  const handleExportPDF = () => {
    exportAppointmentsToPDF(appointments);
    showToast('Relatório oficial em PDF baixado com sucesso!');
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.notes && apt.notes.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'todos' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = appointments.filter(a => a.status === 'pendente').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmado').length;
  const completedCount = appointments.filter(a => a.status === 'concluido').length;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#26161B] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FCD6E0]/40 animate-slideUp">
          <CheckCircle className="w-5 h-5 text-[#34D399]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#FCD6E0]">
            <Award className="w-3.5 h-3.5 text-[#D85072]" />
            <span>{isUserPortal ? 'Portal do Usuário • Operacional' : 'Portal do Administrador • Marcações'}</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            AGENDA & MARCAÇÕES DE AULAS
          </h2>
          <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
            Gerenciamento completo das solicitações de aulas de Pilates e atendimentos da clínica, com confirmação rápida via WhatsApp e exportação padronizada.
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
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-[#FCD6E0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#8C3B50] uppercase tracking-wider">Aguardando Confirmação</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#B76E00] animate-pulse" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#B76E00] mt-2">{pendingCount}</p>
          <span className="text-xs text-[#5B444C] mt-1 block">Necessitam contato para confirmação</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#FCD6E0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1D7A46] uppercase tracking-wider">Confirmados na Agenda</span>
            <CheckCircle className="w-4 h-4 text-[#1D7A46]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1D7A46] mt-2">{confirmedCount}</p>
          <span className="text-xs text-[#5B444C] mt-1 block">Aulas e sessões agendadas</span>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#FCD6E0] shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#1877F2] uppercase tracking-wider">Atendimentos Concluídos</span>
            <Award className="w-4 h-4 text-[#1877F2]" />
          </div>
          <p className="font-serif text-3xl font-bold text-[#1877F2] mt-2">{completedCount}</p>
          <span className="text-xs text-[#5B444C] mt-1 block">Aulas já realizadas com sucesso</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-[#8C3B50] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, telefone ou queixa..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <label className="text-xs font-semibold text-[#8C3B50] uppercase tracking-wider">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs font-semibold text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
          >
            <option value="todos">Todos os Status</option>
            <option value="pendente">Apenas Pendentes ({pendingCount})</option>
            <option value="confirmado">Apenas Confirmados ({confirmedCount})</option>
            <option value="concluido">Apenas Concluídos ({completedCount})</option>
            <option value="cancelado">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Appointments Table */}
      <div className="bg-white rounded-3xl border border-[#FCD6E0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-[#FFF8F9] border-b border-[#FCD6E0] text-[#8C3B50] font-semibold">
              <tr>
                <th className="py-3.5 px-4 sm:px-6">Paciente / Aluno(a)</th>
                <th className="py-3.5 px-4">Data & Horário</th>
                <th className="py-3.5 px-4">Objetivo / Sessão</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Ações Rápidas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FCD6E0]/60 text-[#26161B]">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8C3B50]">
                    Nenhum agendamento encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-[#FFFDFB] transition-colors">
                    <td className="py-3.5 px-4 sm:px-6 font-medium">
                      <div className="font-semibold text-[#26161B]">{apt.patientName}</div>
                      <div className="text-xs text-[#8C3B50] flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3" />
                        <span>{apt.patientPhone}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-[#26161B] flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#D85072]" />
                        <span>{new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="text-xs text-[#8C3B50] flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3 h-3 text-[#A8928B]" />
                        <span>{apt.timeSlot}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="truncate font-medium">{apt.service}</div>
                      {apt.notes && (
                        <div className="text-xs text-[#8C3B50] truncate italic mt-0.5">
                          "{apt.notes}"
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          apt.status === 'confirmado'
                            ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                            : apt.status === 'pendente'
                            ? 'bg-[#FFF3E0] text-[#B76E00] border border-[#FFE0B2]'
                            : apt.status === 'concluido'
                            ? 'bg-[#E8F0FE] text-[#1967D2] border border-[#D2E3FC]'
                            : 'bg-[#FBEBEB] text-[#C5221F] border border-[#F6C7C7]'
                        }`}
                      >
                        {apt.status === 'confirmado' && 'Confirmado'}
                        {apt.status === 'pendente' && 'Pendente'}
                        {apt.status === 'concluido' && 'Concluído'}
                        {apt.status === 'cancelado' && 'Cancelado'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`https://wa.me/55${apt.patientPhone.replace(/\D/g, '')}?text=${encodeURIComponent(
                            `Olá ${apt.patientName}! Aqui é do estúdio da Dra. Léia Mar. Confirmamos seu horário agendado para o dia ${new Date(
                              apt.date + 'T00:00:00'
                            ).toLocaleDateString('pt-BR')} às ${apt.timeSlot}. Estamos localizados na Av. Noel Nutels, Cidade Nova (Altos da New Fit). Qualquer dúvida estamos à disposição!`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg bg-[#EBF7EE] text-[#1D7A46] hover:bg-[#D4EED8] transition-colors"
                          title="Enviar mensagem de WhatsApp ao paciente"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </a>

                        {apt.status !== 'confirmado' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'confirmado')}
                            className="p-1.5 rounded-lg bg-[#EBF7EE] text-[#1D7A46] hover:bg-[#D4EED8] transition-colors cursor-pointer"
                            title="Confirmar agendamento"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                        )}

                        {apt.status !== 'concluido' && apt.status === 'confirmado' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'concluido')}
                            className="p-1.5 rounded-lg bg-[#E8F0FE] text-[#1967D2] hover:bg-[#D2E3FC] transition-colors cursor-pointer"
                            title="Marcar como atendido / concluído"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}

                        {apt.status !== 'cancelado' && (
                          <button
                            onClick={() => handleStatusChange(apt.id, 'cancelado')}
                            className="p-1.5 rounded-lg bg-[#FFF5F5] text-[#9C2744] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                            title="Cancelar agendamento"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteAppointment(apt.id, apt.patientName)}
                          className="p-1.5 rounded-lg bg-[#FDEDF0] text-[#9C2744] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
                          title="Excluir agendamento"
                        >
                          <Trash2 className="w-4 h-4 text-[#D85072]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL DE RELATÓRIO EM TELA (VISUAL) — AGENDA & MARCAÇÕES           */}
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
            className="bg-[#3D232B] text-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-[#FCD6E0]/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header / Toolbar: SOMENTE Baixar XLS e Baixar PDF */}
            <div className="p-4 sm:p-5 bg-[#2B151C] border-b border-[#FCD6E0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D85072]" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Visualização do Relatório em Tela — Agenda & Marcações
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
              <div className="w-full max-w-5xl bg-white text-[#26161B] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#E5E7EB]">
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
                      Relatório de Agenda & Marcações de Aulas
                    </h2>
                    <p className="text-xs text-[#5B444C]">
                      Total de agendamentos computados: {filteredAppointments.length}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] w-fit">
                    Controle de Agendamentos
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                    <span className="text-[10px] uppercase font-bold text-[#B76E00] block">Aguardando Confirmação</span>
                    <strong className="text-sm sm:text-base font-bold text-[#B76E00]">{pendingCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EBF7EE]/50 border border-[#B6E3C3]">
                    <span className="text-[10px] uppercase font-bold text-[#1D7A46] block">Confirmados na Agenda</span>
                    <strong className="text-sm sm:text-base font-bold text-[#1D7A46]">{confirmedCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EBF2FF]/40 border border-[#C6DCFF]">
                    <span className="text-[10px] uppercase font-bold text-[#1877F2] block">Atendimentos Concluídos</span>
                    <strong className="text-sm sm:text-base font-bold text-[#1877F2]">{completedCount}</strong>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#8C3B50] text-white">
                      <th className="p-2 font-bold">Paciente / Aluno(a)</th>
                      <th className="p-2 font-bold">WhatsApp</th>
                      <th className="p-2 font-bold">Data</th>
                      <th className="p-2 font-bold">Horário</th>
                      <th className="p-2 font-bold">Objetivo / Sessão</th>
                      <th className="p-2 font-bold">Observações</th>
                      <th className="p-2 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map((apt, i) => (
                      <tr key={apt.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                        <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{apt.patientName}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{apt.patientPhone}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{new Date(apt.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60 font-semibold">{apt.timeSlot}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{apt.service}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{apt.notes || '-'}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60 text-center uppercase font-bold text-[9px]">
                          {apt.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

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

      {/* Modal de Confirmação de Exclusão de Agendamento */}
      {aptToDelete && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-[#FFFDFB] text-[#26161B] max-w-md w-full rounded-3xl p-6 sm:p-7 border border-[#FCD6E0] shadow-2xl relative animate-fadeIn">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#FDEDF0] text-[#9C2744] flex items-center justify-center flex-shrink-0 border border-[#FCD6E0]">
                <Trash2 className="w-6 h-6 text-[#D85072]" />
              </div>
              <div className="flex-1">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                  Confirmar Exclusão
                </h3>
                <p className="text-xs sm:text-sm text-[#5B444C] mt-1.5 leading-relaxed">
                  Tem certeza que deseja excluir permanentemente o agendamento de{' '}
                  <strong className="text-[#9C2744]">{aptToDelete.name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#FCD6E0]/70">
              <button
                type="button"
                onClick={() => setAptToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5B444C] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteAppointment}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#D85072] to-[#9C2744] hover:from-[#BC3859] hover:to-[#7A1C33] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
