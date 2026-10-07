import React, { useState, useEffect } from 'react';
import {
  Banknote,
  Users,
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  Clock4,
  FileSpreadsheet,
  FileText,
  Eye,
  Download,
  Filter,
  Search,
  Sparkles,
  ChevronDown,
  ChevronUp,
  DollarSign,
  TrendingUp,
  Check,
  AlertCircle,
  X,
  Printer,
  Share2,
  Edit2
} from 'lucide-react';
import { usePilatesClasses } from '../../data/pilatesClassesStore';
import {
  calculateInstructorsPayroll,
  exportPayrollToPDF,
  exportPayrollToXLS,
  exportInstructorHoleriteToPDF,
  InstructorPayrollSummary,
  getStoredPayrollAdjustments,
  saveStoredPayrollAdjustments,
  PayrollRecordAdjustment
} from '../../data/payrollStore';
import { CLINIC_INFO } from '../../data/content';
import { numeroPorExtensoBRL } from '../../utils/numberToWordsPT';

interface AdminFolhaPagamentoTabProps {
  isUserPortal?: boolean;
}

export const AdminFolhaPagamentoTab: React.FC<AdminFolhaPagamentoTabProps> = ({ isUserPortal = false }) => {
  const { classes, professionals } = usePilatesClasses();

  // Competência selecionada (ex: Outubro/2026)
  const [competence, setCompetence] = useState('10/2026');
  const [selectedProfFilter, setSelectedProfFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'pendente' | 'pago'>('todos');
  const [searchQuery, setSearchQuery] = useState('');

  // Expandir turmas do instrutor
  const [expandedProfId, setExpandedProfId] = useState<string | null>(null);

  // Modal de Ajuste (Bônus / Descontos / Status)
  const [adjustmentModalItem, setAdjustmentModalItem] = useState<InstructorPayrollSummary | null>(null);
  const [formBonus, setFormBonus] = useState('0');
  const [formDeduction, setFormDeduction] = useState('0');
  const [formStatus, setFormStatus] = useState<'pendente' | 'pago'>('pendente');
  const [formPaymentMethod, setFormPaymentMethod] = useState('PIX');
  const [formNotes, setFormNotes] = useState('');

  // Modal de Visualização do Holerite em Tela
  const [viewHoleriteItem, setViewHoleriteItem] = useState<InstructorPayrollSummary | null>(null);

  // Modal de Visualização da Folha Geral em Tela
  const [isVisualFolhaOpen, setIsVisualFolhaOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatBRL = (val: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);

  // Calcula a folha consolidada com dados das turmas e profissionais
  const payrollSummaries = calculateInstructorsPayroll(professionals, classes, competence);

  // Filtros aplicados
  const filteredSummaries = payrollSummaries.filter(s => {
    const matchesProf = selectedProfFilter === 'todos' || s.professionalId === selectedProfFilter;
    const matchesStatus = statusFilter === 'todos' || s.status === statusFilter;
    const matchesSearch =
      s.professionalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.roleTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.crefito.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesProf && matchesStatus && matchesSearch;
  });

  // Totais Gerais Consolidados
  const totalGeralInstrutores = payrollSummaries.length;
  const totalGeralDias = payrollSummaries.reduce((acc, s) => acc + s.totalDays, 0);
  const totalGeralAulas = payrollSummaries.reduce((acc, s) => acc + s.totalClassesAttended, 0);
  const totalGeralHoras = payrollSummaries.reduce((acc, s) => acc + s.totalHoursPlanned, 0);
  const totalGeralFolha = payrollSummaries.reduce((acc, s) => acc + s.netPaymentValue, 0);
  const totalGeralPago = payrollSummaries.filter(s => s.status === 'pago').reduce((acc, s) => acc + s.netPaymentValue, 0);
  const totalGeralPendente = payrollSummaries.filter(s => s.status === 'pendente').reduce((acc, s) => acc + s.netPaymentValue, 0);

  const handleOpenAdjustment = (item: InstructorPayrollSummary) => {
    setAdjustmentModalItem(item);
    setFormBonus(item.bonusValue.toString());
    setFormDeduction(item.deductionValue.toString());
    setFormStatus(item.status);
    setFormPaymentMethod(item.paymentMethod || 'PIX');
    setFormNotes('');
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustmentModalItem) return;

    const currentAdjustments = getStoredPayrollAdjustments();
    const key = `${adjustmentModalItem.professionalId}_${competence}`;

    const updatedAdj: PayrollRecordAdjustment = {
      professionalId: adjustmentModalItem.professionalId,
      competence,
      bonusValue: parseFloat(formBonus) || 0,
      deductionValue: parseFloat(formDeduction) || 0,
      status: formStatus,
      paymentDate: formStatus === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: formPaymentMethod,
      notes: formNotes
    };

    currentAdjustments[key] = updatedAdj;
    saveStoredPayrollAdjustments(currentAdjustments);
    setAdjustmentModalItem(null);
    showToast(`Folha de pagamento de "${adjustmentModalItem.professionalName}" atualizada com sucesso!`);
  };

  const handleTogglePaymentStatus = (item: InstructorPayrollSummary) => {
    const currentAdjustments = getStoredPayrollAdjustments();
    const key = `${item.professionalId}_${competence}`;
    const nextStatus = item.status === 'pago' ? 'pendente' : 'pago';

    const updatedAdj: PayrollRecordAdjustment = {
      professionalId: item.professionalId,
      competence,
      bonusValue: item.bonusValue,
      deductionValue: item.deductionValue,
      status: nextStatus,
      paymentDate: nextStatus === 'pago' ? new Date().toISOString().split('T')[0] : undefined,
      paymentMethod: item.paymentMethod || 'PIX'
    };

    currentAdjustments[key] = updatedAdj;
    saveStoredPayrollAdjustments(currentAdjustments);
    showToast(`Status de pagamento de ${item.professionalName} alterado para ${nextStatus.toUpperCase()}!`);
  };

  const handleExportXLS = () => {
    exportPayrollToXLS(payrollSummaries, competence);
    showToast('Folha de Pagamento baixada em XLS com sucesso!');
  };

  const handleExportPDF = () => {
    exportPayrollToPDF(payrollSummaries, competence);
    showToast('Folha de Pagamento baixada em PDF com sucesso!');
  };

  const handleExportHolerite = (item: InstructorPayrollSummary) => {
    exportInstructorHoleriteToPDF(item);
    showToast(`Holerite/Comprovante de "${item.professionalName}" baixado em PDF com sucesso!`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-[#26161B] text-white text-xs sm:text-sm font-semibold shadow-2xl flex items-center gap-3 border border-[#FCD6E0]/20 animate-fade-in">
          <Sparkles className="w-4 h-4 text-[#FACC15]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase border border-[#FCD6E0]">
            <Banknote className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Módulo Financeiro • Folha de Pagamento</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
            FOLHA DE PAGAMENTO DOS INSTRUTORES
          </h2>
          <p className="text-xs sm:text-sm text-[#5B444C] max-w-2xl">
            Coleta e apuração completa de todas as aulas prestadas pelo profissional instrutor(a), consolidando totais de dias, aulas, horas e valores devidos para quitação de honorários.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 relative z-10">
          <button
            type="button"
            onClick={handleExportXLS}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer shadow-2xs"
            title="Baixar planilha Excel com a Folha de Pagamento dos Instrutores"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
            <span>Baixar XLS</span>
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
            title="Baixar relatório executivo em PDF da Folha de Pagamento"
          >
            <FileText className="w-4 h-4 text-[#D85072]" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={() => setIsVisualFolhaOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#26161B] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
            title="Visualizar a folha de pagamento completa em tela"
          >
            <Eye className="w-4 h-4 text-[#8C3B50]" />
            <span>Relatório em Tela</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards: Totais de Dias, Aulas, Horas e Valores */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Card 1: Instrutores Ativos */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FCD6E0] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#8C3B50] tracking-wider">
              Instrutores
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#26161B]">
            {totalGeralInstrutores} profissionais
          </div>
          <p className="text-[11px] text-[#5B444C] mt-1">Corpo docente ativo</p>
        </div>

        {/* Card 2: Totais de Dias Trabalhados */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FCD6E0] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#8C3B50] tracking-wider">
              Totais de Dias
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#9C2744]">
            {totalGeralDias} dias
          </div>
          <p className="text-[11px] text-[#5B444C] mt-1">Atendimentos no mês</p>
        </div>

        {/* Card 3: Totais de Aulas Prestadas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#B6E3C3] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#1D7A46] tracking-wider">
              Totais de Aulas
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center">
              <Award className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#1D7A46]">
            {totalGeralAulas} aulas
          </div>
          <p className="text-[11px] text-[#5B444C] mt-1">Ministradas com alunos</p>
        </div>

        {/* Card 4: Totais de Horas */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FCD6E0] shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#8C3B50] tracking-wider">
              Totais de Horas
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#26161B]">
            {totalGeralHoras} horas
          </div>
          <p className="text-[11px] text-[#5B444C] mt-1">Carga horária vinculada</p>
        </div>

        {/* Card 5: Total da Folha Líquida */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-white to-[#FFEBF0]/50 rounded-2xl p-4 sm:p-5 border-2 border-[#D85072] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase text-[#9C2744] tracking-wider">
              Total da Folha
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#9C2744] text-white flex items-center justify-center">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-serif font-bold text-[#9C2744]">
            {formatBRL(totalGeralFolha)}
          </div>
          <div className="flex items-center justify-between text-[11px] mt-1 text-[#5B444C]">
            <span className="text-emerald-700 font-medium">Pago: {formatBRL(totalGeralPago)}</span>
            <span className="text-amber-800 font-medium">Pend: {formatBRL(totalGeralPendente)}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-[#FCD6E0] shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Competência Selector */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C3B50]">
            <Calendar className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Competência:</span>
            <select
              value={competence}
              onChange={(e) => setCompetence(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs font-semibold text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
            >
              <option value="10/2026">Outubro / 2026</option>
              <option value="09/2026">Setembro / 2026</option>
              <option value="08/2026">Agosto / 2026</option>
              <option value="11/2026">Novembro / 2026 (Previsão)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C3B50]">
            <Filter className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs font-semibold text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
            >
              <option value="todos">Todos os Status</option>
              <option value="pendente">Pendente de Pagamento</option>
              <option value="pago">Quitado / Pago</option>
            </select>
          </div>

          {/* Instructor Filter */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#8C3B50]">
            <Users className="w-3.5 h-3.5 text-[#D85072]" />
            <span>Instrutor(a):</span>
            <select
              value={selectedProfFilter}
              onChange={(e) => setSelectedProfFilter(e.target.value)}
              className="px-2.5 py-1.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs font-semibold text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
            >
              <option value="todos">Todos os Instrutores</option>
              {professionals.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Buscar por instrutor ou CREFITO..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-1.5 pl-8 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
          />
          <Search className="w-3.5 h-3.5 text-[#8C3B50] absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Instructors Payroll List */}
      <div className="space-y-4">
        {filteredSummaries.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-[#FCD6E0] text-center text-sm text-[#5B444C] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#D85072] mx-auto" />
            <p className="font-semibold text-base text-[#26161B]">Nenhum registro de folha encontrado.</p>
            <p className="text-xs">Tente ajustar os filtros de busca ou certifique-se de que há turmas vinculadas ao corpo docente.</p>
          </div>
        ) : (
          filteredSummaries.map((item) => {
            const isExpanded = expandedProfId === item.professionalId;

            return (
              <div
                key={item.professionalId}
                className="bg-white rounded-3xl border border-[#FCD6E0] shadow-sm overflow-hidden transition-all hover:border-[#D85072]/60"
              >
                {/* Header card of professional */}
                <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5 border-b border-[#FCD6E0]/60 bg-gradient-to-r from-white via-white to-[#FFEBF0]/20">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFEBF0] to-[#FCD6E0] text-[#9C2744] flex items-center justify-center font-serif font-bold text-lg shadow-xs flex-shrink-0">
                      {item.professionalName.split(' ').map(n => n[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                          {item.professionalName}
                        </h3>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === 'pago'
                              ? 'bg-[#EBF7EE] text-[#1D7A46] border-[#B6E3C3]'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          {item.status === 'pago' ? 'Quitado / Pago' : 'Pendente de Pagamento'}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#8C3B50] mt-1">
                        <span>{item.roleTitle}</span>
                        <span>•</span>
                        <span>CREFITO: {item.crefito}</span>
                        <span>•</span>
                        <span>PIX: {item.pixKey || 'Não cadastrado'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleTogglePaymentStatus(item)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border ${
                        item.status === 'pago'
                          ? 'bg-[#FFF9FA] text-[#8C3B50] hover:bg-[#FFEBF0] border-[#FCD6E0]'
                          : 'bg-[#1D7A46] text-white hover:bg-[#155D35] border-transparent shadow-xs'
                      }`}
                      title={item.status === 'pago' ? 'Reabrir como pendente' : 'Confirmar quitação de pagamento'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.status === 'pago' ? 'Pago (Alterar)' : 'Marcar como Pago'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenAdjustment(item)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#FFEBF0] text-[#26161B] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Lançar bônus, adiantamento ou desconto na folha"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-[#8C3B50]" />
                      <span>Ajustes</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setViewHoleriteItem(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Visualizar demonstrativo de pagamento em tela"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#D85072]" />
                      <span>Holerite em Tela</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleExportHolerite(item)}
                      className="px-3 py-1.5 rounded-xl bg-[#FFEBF0] hover:bg-[#FCD6E0] text-[#9C2744] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Baixar comprovante de honorários em PDF"
                    >
                      <Download className="w-3.5 h-3.5 text-[#D85072]" />
                      <span>Baixar PDF</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setExpandedProfId(isExpanded ? null : item.professionalId)}
                      className="p-2 rounded-xl text-[#8C3B50] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                      title={isExpanded ? 'Recolher turmas' : 'Ver turmas e alunos'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* KPI Metrics of Instructor: Dias, Aulas, Horas, Valores */}
                <div className="p-5 sm:p-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5 bg-[#FFFDFB]">
                  {/* Totais de Dias */}
                  <div className="p-3 rounded-2xl bg-white border border-[#FCD6E0] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#8C3B50] block">
                      Totais de Dias
                    </span>
                    <strong className="text-base sm:text-lg font-serif text-[#9C2744] block mt-0.5">
                      {item.totalDays} dias
                    </strong>
                    <span className="text-[10px] text-[#5B444C]">Atendidos no mês</span>
                  </div>

                  {/* Totais de Aulas */}
                  <div className="p-3 rounded-2xl bg-white border border-[#B6E3C3] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#1D7A46] block">
                      Totais de Aulas
                    </span>
                    <strong className="text-base sm:text-lg font-serif text-[#1D7A46] block mt-0.5">
                      {item.totalClassesAttended} aulas
                    </strong>
                    <span className="text-[10px] text-[#5B444C]">Realizadas por alunos</span>
                  </div>

                  {/* Totais de Horas */}
                  <div className="p-3 rounded-2xl bg-white border border-[#FCD6E0] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#8C3B50] block">
                      Totais de Horas
                    </span>
                    <strong className="text-base sm:text-lg font-serif text-[#26161B] block mt-0.5">
                      {item.totalHoursPlanned}h
                    </strong>
                    <span className="text-[10px] text-[#5B444C]">Carga horária total</span>
                  </div>

                  {/* Faturamento Gerado */}
                  <div className="p-3 rounded-2xl bg-white border border-[#FCD6E0] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#8C3B50] block">
                      Faturamento Gerado
                    </span>
                    <strong className="text-base sm:text-lg font-serif text-[#26161B] block mt-0.5">
                      {formatBRL(item.grossRevenueGenerated)}
                    </strong>
                    <span className="text-[10px] text-[#5B444C]">Planos vinculados</span>
                  </div>

                  {/* Repasse Academia */}
                  <div className="p-3 rounded-2xl bg-white border border-[#FCD6E0] shadow-2xs">
                    <span className="text-[10px] font-bold uppercase text-[#8C3B50] block">
                      Academia 50%
                    </span>
                    <strong className="text-base sm:text-lg font-serif text-[#9C2744] block mt-0.5">
                      {formatBRL(item.gymPassRetention)}
                    </strong>
                    <span className="text-[10px] text-[#5B444C]">Infraestrutura</span>
                  </div>

                  {/* Valor Líquido a Pagar */}
                  <div className="col-span-2 sm:col-span-1 p-3 rounded-2xl bg-[#EBF7EE] border-2 border-[#1D7A46] shadow-xs">
                    <span className="text-[10px] font-bold uppercase text-[#1D7A46] block">
                      Líquido a Pagar
                    </span>
                    <strong className="text-base sm:text-lg font-serif text-[#124B2B] block mt-0.5">
                      {formatBRL(item.netPaymentValue)}
                    </strong>
                    <span className="text-[10px] text-[#1D7A46] font-medium">
                      {item.bonusValue > 0 || item.deductionValue > 0
                        ? `(Base ${formatBRL(item.basePaymentValue)})`
                        : 'Honorários devidos'}
                    </span>
                  </div>
                </div>

                {/* Detailed Classes & Students Table (Expandable) */}
                {isExpanded && (
                  <div className="p-5 sm:p-6 border-t border-[#FCD6E0] bg-[#FFF9FA]/60 space-y-3 animate-fade-in">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C3B50] flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-[#D85072]" />
                        <span>Alunos & Turmas sob Responsabilidade de {item.professionalName} ({item.classes.length})</span>
                      </h4>
                      <span className="text-[11px] text-[#5B444C]">
                        Competência Oficial: {item.competence}
                      </span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-[#FCD6E0] bg-white">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-[#FFEBF0]/70 text-[#9C2744] border-b border-[#FCD6E0] font-bold">
                            <th className="py-2.5 px-3">Aluno(a)</th>
                            <th className="py-2.5 px-3">Plano Contratado</th>
                            <th className="py-2.5 px-3 text-center">Aulas Realizadas</th>
                            <th className="py-2.5 px-3 text-center">Carga Horária</th>
                            <th className="py-2.5 px-3 text-right">Valor Plano</th>
                            <th className="py-2.5 px-3 text-right">Academia 50%</th>
                            <th className="py-2.5 px-3 text-right text-[#1D7A46]">Honorários Instrutor</th>
                            <th className="py-2.5 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#FCD6E0]/60 text-[#26161B]">
                          {item.classes.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="py-6 text-center text-xs text-[#5B444C]">
                                Nenhum aluno matriculado diretamente com este profissional no momento.
                              </td>
                            </tr>
                          ) : (
                            item.classes.map((c) => (
                              <tr key={c.id} className="hover:bg-[#FFFDFB] transition-colors">
                                <td className="py-2.5 px-3 font-semibold">
                                  <div>{c.studentName}</div>
                                  <div className="text-[10px] text-[#8C3B50]">{c.studentPhone || '-'}</div>
                                </td>
                                <td className="py-2.5 px-3">{c.planType}</td>
                                <td className="py-2.5 px-3 text-center font-bold text-[#1D7A46]">
                                  {c.attendedHours || 0} aulas
                                </td>
                                <td className="py-2.5 px-3 text-center">{c.totalClassHours}h</td>
                                <td className="py-2.5 px-3 text-right font-medium">{formatBRL(c.totalPlanValue)}</td>
                                <td className="py-2.5 px-3 text-right text-[#9C2744]">{formatBRL(c.gymPassValue)}</td>
                                <td className="py-2.5 px-3 text-right font-bold text-[#1D7A46]">
                                  {formatBRL(c.professionalPassValue)}
                                </td>
                                <td className="py-2.5 px-3 text-center">
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7EE] text-[#1D7A46]">
                                    {c.status.toUpperCase()}
                                  </span>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: AJUSTES DA FOLHA (BÔNUS, DESCONTOS & FORMA DE PAGAMENTO)   */}
      {/* =================================================================== */}
      {adjustmentModalItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#14080B]/75 backdrop-blur-xs animate-fade-in"
          onClick={() => setAdjustmentModalItem(null)}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-2 border-[#D85072]/30 overflow-hidden text-[#26161B]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-2.5 bg-gradient-to-r from-[#D85072] via-[#BC3859] to-[#9C2744]" />
            <div className="p-6 space-y-5">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C3B50] bg-[#FFEBF0] px-2.5 py-0.5 rounded-md">
                    Folha • Competência {competence}
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#26161B] mt-1">
                    Ajustes de Honorários • {adjustmentModalItem.professionalName}
                  </h3>
                  <p className="text-xs text-[#5B444C]">
                    Lançamento de bônus, adiantamentos e liquidação de pagamento.
                  </p>
                </div>
                <button
                  onClick={() => setAdjustmentModalItem(null)}
                  className="p-1.5 rounded-xl text-[#8C3B50] hover:bg-[#FFEBF0]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-[#FFF9FA] border border-[#FCD6E0] text-xs flex justify-between">
                  <span className="text-[#8C3B50] font-semibold">Honorários Base Apurados:</span>
                  <strong className="text-[#1D7A46] font-bold text-sm">
                    {formatBRL(adjustmentModalItem.basePaymentValue)}
                  </strong>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Bônus / Produtividade (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formBonus}
                      onChange={(e) => setFormBonus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Descontos / Adiantamentos (R$)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formDeduction}
                      onChange={(e) => setFormDeduction(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Status do Pagamento
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    >
                      <option value="pendente">Pendente</option>
                      <option value="pago">Quitado / Pago</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Forma de Pagamento
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    >
                      <option value="PIX">PIX</option>
                      <option value="Transferência Bancária">Transferência TED/DOC</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Observações Internas
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Quitação efetuada via comprovante bancário"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                {/* Total recalculado preview */}
                <div className="p-3.5 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1D7A46]">Total Líquido Recalculado:</span>
                  <strong className="text-base font-serif font-bold text-[#124B2B]">
                    {formatBRL(
                      Math.max(
                        0,
                        adjustmentModalItem.basePaymentValue + (parseFloat(formBonus) || 0) - (parseFloat(formDeduction) || 0)
                      )
                    )}
                  </strong>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdjustmentModalItem(null)}
                    className="px-4 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold text-[#5B444C] hover:bg-[#FFEBF0]"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white text-xs font-bold shadow-md hover:from-[#BC3859] hover:to-[#9C2744]"
                  >
                    Salvar Ajustes da Folha
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: VISUALIZAÇÃO EM TELA DO HOLERITE INDIVIDUAL DO INSTRUTOR   */}
      {/* =================================================================== */}
      {viewHoleriteItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#14080B]/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setViewHoleriteItem(null)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border-2 border-[#D85072]/30 overflow-hidden text-[#26161B] max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#D85072] to-[#9C2744] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
                  Comprovante Oficial de Honorários
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  Holerite • {viewHoleriteItem.professionalName}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportHolerite(viewHoleriteItem)}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#9C2744] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-rose-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5 text-[#D85072]" />
                  <span>Baixar PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewHoleriteItem(null)}
                  className="p-1.5 rounded-xl text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs sm:text-sm">
              <div className="p-5 rounded-2xl border border-[#FCD6E0] bg-[#FFF9FA] space-y-3">
                <div className="flex justify-between items-start border-b border-[#FCD6E0]/60 pb-3">
                  <div>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B]">
                      {CLINIC_INFO.name}
                    </h4>
                    <p className="text-xs text-[#8C3B50]">
                      CREFITO: {CLINIC_INFO.crefito} • {CLINIC_INFO.address}, {CLINIC_INFO.neighborhood} - Manaus/AM
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase text-[#8C3B50] block">Nº Registro</span>
                    <strong className="text-xs text-[#9C2744]">{viewHoleriteItem.receiptNumber}</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-[#8C3B50] block text-[11px]">Profissional:</span>
                    <strong className="text-[#26161B]">{viewHoleriteItem.professionalName}</strong>
                  </div>
                  <div>
                    <span className="text-[#8C3B50] block text-[11px]">CREFITO:</span>
                    <strong className="text-[#26161B]">{viewHoleriteItem.crefito}</strong>
                  </div>
                  <div>
                    <span className="text-[#8C3B50] block text-[11px]">Competência:</span>
                    <strong className="text-[#9C2744] font-bold">{viewHoleriteItem.competence}</strong>
                  </div>
                  <div>
                    <span className="text-[#8C3B50] block text-[11px]">Status:</span>
                    <strong className={viewHoleriteItem.status === 'pago' ? 'text-emerald-700' : 'text-amber-800'}>
                      {viewHoleriteItem.status.toUpperCase()}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Summary of Days, Classes, Hours */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-2xl bg-white border border-[#FCD6E0] text-center">
                  <span className="text-[10px] text-[#8C3B50] block font-bold uppercase">Totais de Dias</span>
                  <strong className="text-lg font-serif text-[#9C2744]">{viewHoleriteItem.totalDays} dias</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#B6E3C3] text-center">
                  <span className="text-[10px] text-[#1D7A46] block font-bold uppercase">Aulas Realizadas</span>
                  <strong className="text-lg font-serif text-[#1D7A46]">{viewHoleriteItem.totalClassesAttended} aulas</strong>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#FCD6E0] text-center">
                  <span className="text-[10px] text-[#8C3B50] block font-bold uppercase">Carga Horária</span>
                  <strong className="text-lg font-serif text-[#26161B]">{viewHoleriteItem.totalHoursPlanned}h</strong>
                </div>
              </div>

              {/* Table of Classes */}
              <div className="space-y-2">
                <h5 className="font-bold text-xs uppercase tracking-wider text-[#8C3B50]">
                  Detalhamento de Alunos & Aulas
                </h5>
                <div className="border border-[#FCD6E0] rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-[#FFEBF0] text-[#9C2744] font-bold">
                      <tr>
                        <th className="p-2">Aluno(a)</th>
                        <th className="p-2">Plano</th>
                        <th className="p-2 text-center">Aulas</th>
                        <th className="p-2 text-right">Repasse Devido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#FCD6E0]/60">
                      {viewHoleriteItem.classes.map(c => (
                        <tr key={c.id}>
                          <td className="p-2 font-semibold">{c.studentName}</td>
                          <td className="p-2">{c.planType}</td>
                          <td className="p-2 text-center font-bold text-[#1D7A46]">{c.attendedHours || 0}</td>
                          <td className="p-2 text-right font-bold text-[#1D7A46]">{formatBRL(c.professionalPassValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Box */}
              <div className="p-4 rounded-2xl bg-[#EBF7EE] border-2 border-[#1D7A46] flex flex-col sm:flex-row items-center justify-between gap-2">
                <div>
                  <span className="text-xs font-bold text-[#1D7A46] uppercase tracking-wider block">
                    Valor Líquido Quitado
                  </span>
                  <p className="text-[11px] text-[#124B2B] italic">
                    ({numeroPorExtensoBRL(viewHoleriteItem.netPaymentValue)})
                  </p>
                </div>
                <div className="text-xl sm:text-2xl font-serif font-bold text-[#124B2B]">
                  {formatBRL(viewHoleriteItem.netPaymentValue)}
                </div>
              </div>

              {/* Quittance legal note */}
              <p className="text-[11px] text-[#5B444C] text-justify leading-relaxed">
                Declaro para os devidos fins de direito haver prestado os serviços de instrução de Fisioterapia e Pilates Clínico discriminados neste demonstrativo na competência {viewHoleriteItem.competence}, outorgando plena quitação dos respectivos honorários.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: VISUALIZAÇÃO GERAL DA FOLHA EM TELA                       */}
      {/* =================================================================== */}
      {isVisualFolhaOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#14080B]/80 backdrop-blur-xs animate-fade-in"
          onClick={() => setIsVisualFolhaOpen(false)}
        >
          <div
            className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border-2 border-[#D85072]/30 overflow-hidden text-[#26161B] max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#D85072] to-[#9C2744] text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-100">
                  Relatório em Tela • Módulo Financeiro
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-bold">
                  Folha de Pagamento Consolidada — {competence}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportXLS}
                  className="px-3 py-1.5 rounded-xl bg-[#EBF7EE] text-[#1D7A46] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-[#D5EEDC] cursor-pointer"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>XLS</span>
                </button>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="px-3 py-1.5 rounded-xl bg-white text-[#9C2744] font-bold text-xs flex items-center gap-1.5 shadow-sm hover:bg-rose-50 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsVisualFolhaOpen(false)}
                  className="p-1.5 rounded-xl text-white hover:bg-white/20"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
              <div className="p-4 rounded-2xl bg-[#FFEBF0]/50 border border-[#FCD6E0] flex flex-wrap justify-between items-center gap-4">
                <div>
                  <h4 className="font-serif text-base font-bold text-[#26161B]">{CLINIC_INFO.name}</h4>
                  <p className="text-xs text-[#8C3B50]">{CLINIC_INFO.address}, {CLINIC_INFO.neighborhood} - Manaus/AM</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-[#9C2744] block">Competência: {competence}</span>
                  <span className="text-[11px] text-[#5B444C]">Total Geral: {formatBRL(totalGeralFolha)}</span>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-[#FCD6E0]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#FFEBF0] text-[#9C2744] font-bold">
                    <tr>
                      <th className="p-3">Instrutor(a)</th>
                      <th className="p-3">Alunos</th>
                      <th className="p-3 text-center">Dias</th>
                      <th className="p-3 text-center">Aulas</th>
                      <th className="p-3 text-center">Horas</th>
                      <th className="p-3 text-right">Faturamento</th>
                      <th className="p-3 text-right">Repasse Devido</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCD6E0]/60">
                    {payrollSummaries.map((s) => (
                      <tr key={s.professionalId} className="hover:bg-[#FFF9FA]">
                        <td className="p-3 font-bold">{s.professionalName}</td>
                        <td className="p-3">{s.studentsCount} alunos</td>
                        <td className="p-3 text-center font-bold text-[#9C2744]">{s.totalDays} dias</td>
                        <td className="p-3 text-center font-bold text-[#1D7A46]">{s.totalClassesAttended}</td>
                        <td className="p-3 text-center">{s.totalHoursPlanned}h</td>
                        <td className="p-3 text-right">{formatBRL(s.grossRevenueGenerated)}</td>
                        <td className="p-3 text-right font-bold text-[#1D7A46]">{formatBRL(s.netPaymentValue)}</td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              s.status === 'pago' ? 'bg-[#EBF7EE] text-[#1D7A46]' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {s.status.toUpperCase()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-[#FFEBF0]/70 font-bold text-[#9C2744] border-t border-[#FCD6E0]">
                    <tr>
                      <td className="p-3">TOTAIS CONSOLIDADOS</td>
                      <td className="p-3">{payrollSummaries.reduce((a, b) => a + b.studentsCount, 0)} alunos</td>
                      <td className="p-3 text-center">{totalGeralDias} dias</td>
                      <td className="p-3 text-center">{totalGeralAulas} aulas</td>
                      <td className="p-3 text-center">{totalGeralHoras}h</td>
                      <td className="p-3 text-right">
                        {formatBRL(payrollSummaries.reduce((a, b) => a + b.grossRevenueGenerated, 0))}
                      </td>
                      <td className="p-3 text-right text-emerald-800 text-sm">{formatBRL(totalGeralFolha)}</td>
                      <td className="p-3 text-center">-</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
