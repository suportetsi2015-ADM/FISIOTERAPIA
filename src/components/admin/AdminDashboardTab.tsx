import React, { useState, useRef } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  Users,
  DollarSign,
  Award,
  Stethoscope,
  Clock,
  ShieldCheck,
  Tag,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileText,
  Filter,
  BarChart3,
  PieChart as PieChartIcon,
  Layers,
  Sparkles,
  ArrowUpRight,
  Maximize2,
  RefreshCw,
  Eye,
  Check,
  Banknote
} from 'lucide-react';
import { usePilatesClasses } from '../../data/pilatesClassesStore';
import { useClinicalPatients, calculateAge } from '../../data/clinicalHistoryStore';
import { getAppointments } from '../../data/bookingStore';
import { useClinicData } from '../../data/clinicStore';
import { calculateInstructorsPayroll, exportPayrollToPDF, exportPayrollToXLS } from '../../data/payrollStore';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AdminDashboardTabProps {
  isUserPortal?: boolean;
}

type DashboardCategory =
  | 'todos'
  | 'aulas'
  | 'financeiro'
  | 'folha'
  | 'servicos'
  | 'profissionais'
  | 'agenda'
  | 'historico';

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ isUserPortal = false }) => {
  const clinic = useClinicData();
  const { classes, services, professionals } = usePilatesClasses();
  const { patients } = useClinicalPatients();
  const appointments = getAppointments();

  const [activeCategory, setActiveCategory] = useState<DashboardCategory>('todos');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isExportingAll, setIsExportingAll] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatBRL = (val: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val || 0);
  };

  // ==========================================================================
  // METRICS & AGGREGATIONS
  // ==========================================================================
  // 1. Aulas & Alunos
  const totalStudents = classes.length;
  const activeStudents = classes.filter(c => c.status === 'ativo').length;
  const inactiveStudents = classes.filter(c => c.status === 'trancado' || c.status === 'concluido').length;
  const gympassStudents = classes.filter(c => c.planType.toLowerCase().includes('gympass') || c.planType.toLowerCase().includes('avulso')).length;

  const totalClassesPlanned = classes.reduce((acc, c) => acc + (c.totalClassHours || 0), 0);
  const totalClassesAttended = classes.reduce((acc, c) => acc + (c.attendedHours || 0), 0);
  const totalClassesRemaining = Math.max(0, totalClassesPlanned - totalClassesAttended);
  const globalCompletionRate = totalClassesPlanned > 0 ? (totalClassesAttended / totalClassesPlanned) * 100 : 0;

  // 2. Financeiro
  const totalContractRevenue = classes.reduce((acc, c) => acc + (c.totalPlanValue || 0), 0);
  const totalMonthlyRevenue = classes.reduce((acc, c) => acc + (c.monthlyInstallmentValue || 0), 0);
  const totalGymPassPayout = classes.reduce((acc, c) => acc + (c.totalPlanValue ? c.totalPlanValue * ((c.gymPassPercentage || 50) / 100) : 0), 0);
  const totalProfPayout = classes.reduce((acc, c) => acc + (c.professionalPassValue || 0), 0);
  const totalNetClinic = Math.max(0, totalContractRevenue - totalGymPassPayout - totalProfPayout);
  const avgTicketPerStudent = totalStudents > 0 ? totalContractRevenue / totalStudents : 0;
  const avgHourlyCost = totalClassesPlanned > 0 ? totalContractRevenue / totalClassesPlanned : 0;

  // 3. Tabela de Serviços
  const servicesByCategory = {
    mensal: services.filter(s => s.planCategory === 'MENSAL'),
    trimestral: services.filter(s => s.planCategory === 'TRIMESTRAL'),
    semestral: services.filter(s => s.planCategory === 'SEMESTRAL'),
    anual: services.filter(s => s.planCategory === 'ANUAL'),
    avulso: services.filter(s => s.planCategory === 'AVULSO')
  };

  // 4. Agenda & Marcações
  const pendingAppointments = appointments.filter(a => a.status === 'pendente').length;
  const confirmedAppointments = appointments.filter(a => a.status === 'confirmado').length;
  const completedAppointments = appointments.filter(a => a.status === 'concluido').length;
  const cancelledAppointments = appointments.filter(a => a.status === 'cancelado').length;

  const morningApts = appointments.filter(a => {
    const h = parseInt(a.timeSlot.split(':')[0] || '8', 10);
    return h < 12;
  }).length;
  const afternoonApts = appointments.filter(a => {
    const h = parseInt(a.timeSlot.split(':')[0] || '12', 10);
    return h >= 12 && h < 18;
  }).length;
  const eveningApts = appointments.filter(a => {
    const h = parseInt(a.timeSlot.split(':')[0] || '18', 10);
    return h >= 18;
  }).length;

  // 5. Histórico Clínico & Anamnese
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'ativo').length;
  const chronicPainPatients = patients.filter(p => p.anamnese.chronicPainOrInjury).length;
  const surgeryPatients = patients.filter(p => p.anamnese.recentOrPastSurgeries).length;
  const pregnantPatients = patients.filter(p => p.anamnese.isPregnant).length;
  const cardiacPatients = patients.filter(p => p.anamnese.cardiacOrBloodPressure !== 'normal').length;
  const lgpdSignedPatients = patients.filter(p => p.terms.consentAccepted).length;
  const imageAuthorizedPatients = patients.filter(p => p.terms.imageUsageAuthorized).length;

  // 6. Folha de Pagamento Consolidada dos Instrutores
  const dashboardPayroll = calculateInstructorsPayroll(professionals, classes, '10/2026');
  const totalPayrollInstructors = dashboardPayroll.length;
  const totalPayrollDays = dashboardPayroll.reduce((acc, s) => acc + s.totalDays, 0);
  const totalPayrollClasses = dashboardPayroll.reduce((acc, s) => acc + s.totalClassesAttended, 0);
  const totalPayrollHours = dashboardPayroll.reduce((acc, s) => acc + s.totalHoursPlanned, 0);
  const totalPayrollAmount = dashboardPayroll.reduce((acc, s) => acc + s.netPaymentValue, 0);

  // Age calculation groups
  const ageGroups = {
    under30: 0,
    from30to45: 0,
    from46to60: 0,
    over60: 0
  };
  patients.forEach(p => {
    const age = calculateAge(p.birthDate).years;
    if (age < 30) ageGroups.under30++;
    else if (age <= 45) ageGroups.from30to45++;
    else if (age <= 60) ageGroups.from46to60++;
    else ageGroups.over60++;
  });

  // ==========================================================================
  // DOWNLOAD CHART AS PNG FUNCTION
  // ==========================================================================
  const downloadChartAsPNG = (elementId: string, chartTitle: string) => {
    try {
      const container = document.getElementById(elementId);
      if (!container) {
        showToast('Erro: elemento do gráfico não encontrado');
        return;
      }

      const svgEl = container.querySelector('svg');
      if (!svgEl) {
        showToast('Erro ao capturar visualização do gráfico');
        return;
      }

      // Serialize SVG
      const serializer = new XMLSerializer();
      let source = serializer.serializeToString(svgEl);

      // Add namespaces if missing
      if (!source.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
      const URLObj = window.URL || window.webkitURL || window;
      const blobURL = URLObj.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = svgEl.clientWidth * 2 || 800;
        canvas.height = svgEl.clientHeight * 2 || 500;
        const context = canvas.getContext('2d');
        if (context) {
          // Fill background white
          context.fillStyle = '#FFFFFF';
          context.fillRect(0, 0, canvas.width, canvas.height);

          // Draw header banner on canvas
          context.fillStyle = '#9C2744';
          context.font = 'bold 24px Georgia, serif';
          context.fillText(`Dra. Léia Mar — ${chartTitle}`, 30, 40);

          context.fillStyle = '#5B444C';
          context.font = '14px sans-serif';
          context.fillText(`CREFITO: ${clinic.crefito} • Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 30, 65);

          // Draw chart
          context.drawImage(image, 20, 80, canvas.width - 40, canvas.height - 100);

          const pngURL = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          const cleanName = chartTitle.toLowerCase().replace(/[^a-z0-9]/g, '_');
          downloadLink.download = `Grafico_${cleanName}_Dra_Leia_Mar.png`;
          downloadLink.href = pngURL;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URLObj.revokeObjectURL(blobURL);
          showToast(`Gráfico "${chartTitle}" baixado com sucesso em PNG!`);
        }
      };
      image.src = blobURL;
    } catch (err) {
      showToast('Erro ao baixar gráfico. Tente novamente.');
    }
  };

  // ==========================================================================
  // DOWNLOAD CHART DATA AS CSV FUNCTION
  // ==========================================================================
  const downloadChartDataCSV = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      '\uFEFF' +
      [headers.join(';'), ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';'))].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Dados do gráfico baixados em CSV com sucesso!');
  };

  // ==========================================================================
  // EXPORT COMPLETE DASHBOARD PDF
  // ==========================================================================
  const handleExportFullDashboardPDF = () => {
    setIsExportingAll(true);
    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      // Header Banner
      doc.setFillColor(156, 39, 68); // #9C2744
      doc.rect(0, 0, 210, 32, 'F');

      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text('Dra. Léia Mar — Studio de Fisioterapia & Pilates', 14, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(255, 235, 240);
      doc.text(`CREFITO: ${clinic.crefito} | WhatsApp: ${clinic.phoneDisplay} | Adrianópolis - Manaus/AM`, 14, 21);
      doc.text(`RELATÓRIO EXECUTIVO COMPLETO DE INTELIGÊNCIA & DASHBOARD — ${new Date().toLocaleDateString('pt-BR')}`, 14, 27);

      // Section 1: KPIs
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(38, 22, 27);
      doc.text('1. Indicadores Chave de Performance (PowerBI Analytics)', 14, 42);

      autoTable(doc, {
        startY: 46,
        head: [['Indicador Executivo', 'Resultado Apurado', 'Meta / Classificação', 'Aba de Origem']],
        body: [
          ['Total de Alunos Matriculados', `${totalStudents} alunos`, `${activeStudents} em frequência ativa`, 'Aulas de Pilates'],
          ['Carga Horária Contratada', `${totalClassesPlanned} horas/aulas`, `${totalClassesAttended} aulas já realizadas`, 'Aulas de Pilates'],
          ['Faturamento Total Bruto', formatBRL(totalContractRevenue), 'Volume global de contratos', 'Gestão Financeira'],
          ['Receita Mensal Vigente', formatBRL(totalMonthlyRevenue), 'Parcelas mensais vigentes', 'Gestão Financeira'],
          ['Repasse Academia (50%)', formatBRL(totalGymPassPayout), 'Retenção acordada de 50%', 'Gestão Financeira'],
          ['Repasse Profissionais', formatBRL(totalProfPayout), 'Honorários equipe técnica', 'Gestão Financeira'],
          ['Saldo Líquido da Clínica', formatBRL(totalNetClinic), 'Margem líquida apurada', 'Gestão Financeira'],
          ['Agendamentos Confirmados', `${confirmedAppointments} marcações`, `${pendingAppointments} aguardando contato`, 'Agenda Online'],
          ['Prontuários no Histórico', `${totalPatients} pacientes`, `${lgpdSignedPatients} termos LGPD assinados`, 'Histórico Clínico']
        ],
        theme: 'grid',
        headStyles: { fillColor: [156, 39, 68], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8, textColor: [38, 22, 27] }
      });

      // Section 2: Desempenho dos Profissionais
      const afterKpiY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFont('times', 'bold');
      doc.setFontSize(12);
      doc.text('2. Desempenho e Repasses por Profissional', 14, afterKpiY);

      const profRows = professionals.map(p => {
        const pStudents = classes.filter(c => c.professionalName === p.name);
        const pAttended = pStudents.reduce((acc, c) => acc + (c.attendedHours || 0), 0);
        const pRevenue = pStudents.reduce((acc, c) => acc + (c.totalPlanValue || 0), 0);
        const pPayout = pStudents.reduce((acc, c) => acc + (c.professionalPassValue || 0), 0);
        return [
          p.name,
          p.roleTitle || 'Fisioterapeuta',
          `${pStudents.length} alunos`,
          `${pAttended} aulas`,
          formatBRL(pRevenue),
          formatBRL(pPayout)
        ];
      });

      autoTable(doc, {
        startY: afterKpiY + 4,
        head: [['Profissional', 'Cargo / Especialidade', 'Alunos', 'Aulas Realizadas', 'Faturamento', 'Repasse Devido']],
        body: profRows,
        theme: 'striped',
        headStyles: { fillColor: [29, 122, 70], textColor: 255, fontStyle: 'bold', fontSize: 8 },
        bodyStyles: { fontSize: 8 }
      });

      // Footer
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(140, 59, 80);
        doc.text(
          `Dra. Léia Mar • CREFITO ${clinic.crefito} • Página ${i} de ${pageCount} • Conforme normas COFFITO e LGPD`,
          14,
          290
        );
      }

      doc.save(`Dashboard_Executivo_Completo_Dra_Leia_Mar_${new Date().toISOString().split('T')[0]}.pdf`);
      showToast('Relatório Executivo Geral em PDF baixado com sucesso!');
    } catch (err) {
      showToast('Erro ao exportar PDF. Tente novamente.');
    } finally {
      setIsExportingAll(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn text-[#26161B]">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#9C2744] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FCD6E0] animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-white" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* POWERBI EXECUTIVE HEADER BANNER                                       */}
      {/* ===================================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#26161B] via-[#4A1523] to-[#8C233C] text-white p-6 sm:p-8 shadow-xl border border-[#FCD6E0]/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D85072]/15 rounded-full blur-3xl pointer-events-none -mr-28 -mt-28" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-black/25 rounded-full blur-2xl pointer-events-none -ml-28 -mb-28" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#FFEBF0] text-xs font-bold border border-white/15">
              <BarChart3 className="w-3.5 h-3.5 text-[#FCD6E0]" />
              <span>POWERBI ANALYTICS • INTELIGÊNCIA DE DADOS</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse ml-1" />
              <span className="text-[11px] text-emerald-300 font-semibold">Tempo Real</span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Dashboard de Indicadores & Gráficos — Dra. Léia Mar
            </h2>

            <p className="text-xs sm:text-sm text-[#FFEBF0]/90 leading-relaxed font-light">
              Central de inteligência analítica no perfil <strong>PowerBI</strong>: todos os gráficos consolidados de cada categoria da clínica, com comparativos em tempo real e <strong>opção de baixar cada gráfico individualmente em PNG de alta resolução ou exportar seus dados em CSV</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-[#FCD6E0]/90">
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 6 Categorias Analíticas
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> 16 Gráficos Interativos
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Download Individual de cada Gráfico
              </span>
              <span className="inline-flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Padrão COFFITO & LGPD
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-stretch sm:items-center lg:items-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={handleExportFullDashboardPDF}
              disabled={isExportingAll}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-xl cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{isExportingAll ? 'Gerando Relatório...' : 'Exportar Relatório do Dashboard (PDF)'}</span>
            </button>
            <span className="text-[11px] text-[#FFEBF0]/70 text-center lg:text-right">
              Atualizado em: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CATEGORY FILTER TABS                                                  */}
      {/* ===================================================================== */}
      <div className="bg-white rounded-2xl p-2 shadow-xs border border-[#FCD6E0] flex flex-wrap gap-1.5">
        <button
          type="button"
          onClick={() => setActiveCategory('todos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'todos'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Visão Geral (Todas as Categorias)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('aulas')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'aulas'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Aulas de Pilates</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('financeiro')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'financeiro'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Gestão Financeira</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('folha')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'folha'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Banknote className="w-4 h-4" />
          <span>Folha de Pagamento</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('servicos')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'servicos'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Tabela de Serviços & Planos</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('profissionais')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'profissionais'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Corpo Técnico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('agenda')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'agenda'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Agenda & Marcações</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('historico')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeCategory === 'historico'
              ? 'bg-[#9C2744] text-white shadow-xs font-bold'
              : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
          }`}
        >
          <Stethoscope className="w-4 h-4" />
          <span>Histórico Clínico & LGPD</span>
        </button>
      </div>

      {/* ===================================================================== */}
      {/* CATEGORIA 1: AULAS DE PILATES (ALUNOS & FREQUÊNCIA)                   */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'aulas') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                Categoria 1: Aulas de Pilates (Alunos & Frequência)
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] px-2.5 py-1 rounded-full border border-[#FCD6E0]">
              Controle Operacional
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 1.1: Distribuição de Alunos por Status */}
            <div
              id="chart-alunos-status"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Gráfico de Rosca • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Distribuição de Alunos por Status
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Proporção de alunos ativos, avulsos/gympass e inativos
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-alunos-status', 'Alunos_Por_Status')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Alunos_Por_Status',
                      ['Status', 'Quantidade', 'Percentual'],
                      [
                        ['Ativos', activeStudents, `${totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(1) : 0}%`],
                        ['Gympass / Avulso', gympassStudents, `${totalStudents > 0 ? ((gympassStudents / totalStudents) * 100).toFixed(1) : 0}%`],
                        ['Trancados / Concluídos', inactiveStudents, `${totalStudents > 0 ? ((inactiveStudents / totalStudents) * 100).toFixed(1) : 0}%`]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Visual Donut Chart SVG */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-2">
                <div className="relative w-44 h-44 flex items-center justify-center flex-shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle cx="50" cy="50" r="38" fill="transparent" stroke="#FCE7ED" strokeWidth="14" />
                    {/* Active Slice */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#1D7A46"
                      strokeWidth="14"
                      strokeDasharray={`${totalStudents > 0 ? (activeStudents / totalStudents) * 238.7 : 0} 238.7`}
                      strokeDashoffset="0"
                      className="transition-all duration-1000 ease-out"
                    />
                    {/* Gympass Slice */}
                    <circle
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke="#D85072"
                      strokeWidth="14"
                      strokeDasharray={`${totalStudents > 0 ? (gympassStudents / totalStudents) * 238.7 : 0} 238.7`}
                      strokeDashoffset={`${totalStudents > 0 ? -(activeStudents / totalStudents) * 238.7 : 0}`}
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="font-serif text-2xl font-bold text-[#26161B]">{totalStudents}</span>
                    <span className="text-[10px] uppercase font-bold text-[#8C3B50]">Total Alunos</span>
                  </div>
                </div>

                {/* Legend with Values */}
                <div className="space-y-2.5 w-full max-w-xs">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#EBF7EE]/60 border border-[#B6E3C3] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#1D7A46]" />
                      <span className="font-semibold text-[#1D7A46]">Ativos</span>
                    </div>
                    <span className="font-bold text-[#1D7A46]">{activeStudents} ({totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(0) : 0}%)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-[#FFEBF0]/60 border border-[#FCD6E0] text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#D85072]" />
                      <span className="font-semibold text-[#D85072]">Gympass / Avulso</span>
                    </div>
                    <span className="font-bold text-[#D85072]">{gympassStudents} ({totalStudents > 0 ? ((gympassStudents / totalStudents) * 100).toFixed(0) : 0}%)</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-gray-400" />
                      <span className="font-semibold text-[#5B444C]">Trancados / Concluídos</span>
                    </div>
                    <span className="font-bold text-[#5B444C]">{inactiveStudents} ({totalStudents > 0 ? ((inactiveStudents / totalStudents) * 100).toFixed(0) : 0}%)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico 1.2: Aulas Realizadas vs Restantes por Aluno */}
            <div
              id="chart-aulas-progresso"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Gráfico de Barras Empilhadas • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Carga Horária: Realizadas vs Restantes
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Progresso de execução de aulas por aluno cadastrado
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-aulas-progresso', 'Progresso_Aulas_Alunos')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Progresso_Aulas_Alunos',
                      ['Aluno', 'Plano', 'Aulas Realizadas', 'Aulas Restantes', 'Total'],
                      classes.map(c => [
                        c.studentName,
                        c.planType,
                        c.attendedHours || 0,
                        Math.max(0, (c.totalClassHours || 0) - (c.attendedHours || 0)),
                        c.totalClassHours || 0
                      ])
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress bars list */}
              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {classes.slice(0, 6).map(c => {
                  const attended = c.attendedHours || 0;
                  const total = c.totalClassHours || 8;
                  const pct = total > 0 ? Math.min(100, (attended / total) * 100) : 0;
                  return (
                    <div key={c.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#26161B] truncate max-w-[180px]">
                          {c.studentName}
                        </span>
                        <span className="text-[11px] font-mono font-bold text-[#8C3B50]">
                          {attended}/{total} aulas ({pct.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden flex">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full bg-gradient-to-r from-[#D85072] to-[#9C2744] rounded-l-full transition-all duration-700"
                        />
                        <div
                          style={{ width: `${100 - pct}%` }}
                          className="h-full bg-rose-100"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-[#FCD6E0]/60 flex items-center justify-between text-xs text-[#5B444C]">
                <span>Total Presenças: <strong>{totalClassesAttended}</strong></span>
                <span>Saldo Pendente: <strong>{totalClassesRemaining}</strong></span>
                <span>Aproveitamento Global: <strong>{globalCompletionRate.toFixed(1)}%</strong></span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* CATEGORIA 2: GESTÃO FINANCEIRA (VALORES & REPASSES)                   */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'financeiro') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                Categoria 2: Gestão Financeira (Valores & Repasses)
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] px-2.5 py-1 rounded-full border border-[#B6E3C3]">
              Finanças & 50% Academia
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 2.1: Decomposição do Faturamento Bruto */}
            <div
              id="chart-faturamento-decomposicao"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D7A46] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    Gráfico de Colunas • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Composição do Faturamento & Repasses
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Divisão entre Academia (50%), Equipe Técnica e Saldo Líquido
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-faturamento-decomposicao', 'Composicao_Faturamento')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Composicao_Faturamento',
                      ['Item', 'Valor (R$)', 'Percentual'],
                      [
                        ['Faturamento Total Bruto', formatBRL(totalContractRevenue), '100%'],
                        ['Repasse Academia NEW FIT (50%)', formatBRL(totalGymPassPayout), '50%'],
                        ['Repasse Instrutores / Fisioterapeutas', formatBRL(totalProfPayout), `${totalContractRevenue > 0 ? ((totalProfPayout / totalContractRevenue) * 100).toFixed(1) : 0}%`],
                        ['Saldo Líquido da Clínica', formatBRL(totalNetClinic), `${totalContractRevenue > 0 ? ((totalNetClinic / totalContractRevenue) * 100).toFixed(1) : 0}%`]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Bar Chart Visualization */}
              <div className="pt-4 pb-2">
                <svg className="w-full h-48" viewBox="0 0 400 180">
                  {/* Grid lines */}
                  <line x1="40" y1="20" x2="380" y2="20" stroke="#F3E8EC" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="70" x2="380" y2="70" stroke="#F3E8EC" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="120" x2="380" y2="120" stroke="#F3E8EC" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1="40" y1="160" x2="380" y2="160" stroke="#E5D0D6" strokeWidth="1.5" />

                  {/* Max reference */}
                  {(() => {
                    const maxVal = Math.max(totalContractRevenue, 1);
                    const hTotal = (totalContractRevenue / maxVal) * 130;
                    const hGym = (totalGymPassPayout / maxVal) * 130;
                    const hProf = (totalProfPayout / maxVal) * 130;
                    const hNet = (totalNetClinic / maxVal) * 130;

                    return (
                      <>
                        {/* Col 1: Total */}
                        <rect x="60" y={160 - hTotal} width="50" height={hTotal} rx="6" fill="#1D7A46" />
                        <text x="85" y={150 - hTotal} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#1D7A46">
                          R${(totalContractRevenue / 1000).toFixed(1)}k
                        </text>
                        <text x="85" y="174" textAnchor="middle" fontSize="9" fill="#5B444C">Bruto</text>

                        {/* Col 2: Academia 50% */}
                        <rect x="145" y={160 - hGym} width="50" height={hGym} rx="6" fill="#9C2744" />
                        <text x="170" y={150 - hGym} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#9C2744">
                          R${(totalGymPassPayout / 1000).toFixed(1)}k
                        </text>
                        <text x="170" y="174" textAnchor="middle" fontSize="9" fill="#5B444C">Academia</text>

                        {/* Col 3: Profissionais */}
                        <rect x="230" y={160 - hProf} width="50" height={hProf} rx="6" fill="#D85072" />
                        <text x="255" y={150 - hProf} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#D85072">
                          R${(totalProfPayout / 1000).toFixed(1)}k
                        </text>
                        <text x="255" y="174" textAnchor="middle" fontSize="9" fill="#5B444C">Equipe</text>

                        {/* Col 4: Líquido */}
                        <rect x="315" y={160 - hNet} width="50" height={hNet} rx="6" fill="#124B2B" />
                        <text x="340" y={150 - hNet} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#124B2B">
                          R${(totalNetClinic / 1000).toFixed(1)}k
                        </text>
                        <text x="340" y="174" textAnchor="middle" fontSize="9" fill="#5B444C">Líquido</text>
                      </>
                    );
                  })()}
                </svg>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 text-center text-xs">
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-[#8C3B50] block">Bruto Total</span>
                  <strong className="text-[#1D7A46]">{formatBRL(totalContractRevenue)}</strong>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-[#8C3B50] block">Academia (50%)</span>
                  <strong className="text-[#9C2744]">{formatBRL(totalGymPassPayout)}</strong>
                </div>
                <div className="p-2 rounded-xl bg-gray-50">
                  <span className="text-[10px] text-[#8C3B50] block">Equipe Técnica</span>
                  <strong className="text-[#D85072]">{formatBRL(totalProfPayout)}</strong>
                </div>
                <div className="p-2 rounded-xl bg-[#EBF7EE]">
                  <span className="text-[10px] text-[#1D7A46] block">Saldo Clínica</span>
                  <strong className="text-[#124B2B]">{formatBRL(totalNetClinic)}</strong>
                </div>
              </div>
            </div>

            {/* Gráfico 2.2: Indicadores Unitários & Médias */}
            <div
              id="chart-indicadores-unitarios"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D7A46] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    KPIs Analíticos • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Ticket Médio & Eficiência Financeira
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Métricas de rentabilidade por aluno e por hora de sessão ministrada
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-indicadores-unitarios', 'Eficiencia_Financeira')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Eficiencia_Financeira',
                      ['Indicador', 'Valor'],
                      [
                        ['Ticket Médio de Contrato por Aluno', formatBRL(avgTicketPerStudent)],
                        ['Valor Médio da Hora/Aula Ministrada', `${formatBRL(avgHourlyCost)} / hora`],
                        ['Receita Mensal Recorrente Total', `${formatBRL(totalMonthlyRevenue)} / mês`],
                        ['Margem Líquida da Clínica', `${totalContractRevenue > 0 ? ((totalNetClinic / totalContractRevenue) * 100).toFixed(1) : 0}%`]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 py-1">
                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FCD6E0] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#8C3B50]">Ticket Médio por Aluno</span>
                    <h5 className="font-serif text-xl sm:text-2xl font-bold text-[#9C2744]">
                      {formatBRL(avgTicketPerStudent)}
                    </h5>
                    <p className="text-[11px] text-[#5B444C]">Investimento médio por plano contratado</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center font-bold text-sm">
                    {totalStudents} un.
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#EBF7EE]/60 border border-[#B6E3C3] flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-[#1D7A46]">Valor Médio por Hora/Aula</span>
                    <h5 className="font-serif text-xl sm:text-2xl font-bold text-[#1D7A46]">
                      {formatBRL(avgHourlyCost)} / hora
                    </h5>
                    <p className="text-[11px] text-[#5B444C]">Custo médio de sessão nas turmas</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center font-bold text-sm">
                    {totalClassesPlanned}h
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-amber-800">Previsão Mensal Recorrente</span>
                    <h5 className="font-serif text-xl sm:text-2xl font-bold text-amber-900">
                      {formatBRL(totalMonthlyRevenue)} / mês
                    </h5>
                    <p className="text-[11px] text-amber-700">Entrada prevista em parcelas ativas</p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-sm">
                    {classes.length} parc.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* CATEGORIA 3: TABELA DE SERVIÇOS & PLANOS                             */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'servicos') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Tag className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                Categoria 3: Tabela de Serviços & Planos
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] px-2.5 py-1 rounded-full border border-[#FCD6E0]">
              Precificação & Mix
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 3.1: Mix de Planos por Categoria */}
            <div
              id="chart-servicos-mix"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Gráfico de Barras Horizontais • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Mix de Serviços Cadastrados por Categoria
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Quantidade de planos ativos na tabela oficial
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-servicos-mix', 'Mix_Servicos_Planos')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Mix_Servicos_Planos',
                      ['Categoria', 'Quantidade de Planos'],
                      [
                        ['Mensal', servicesByCategory.mensal.length],
                        ['Trimestral', servicesByCategory.trimestral.length],
                        ['Semestral', servicesByCategory.semestral.length],
                        ['Anual', servicesByCategory.anual.length],
                        ['Avulso / Gympass', servicesByCategory.avulso.length]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Bar Chart */}
              <div className="space-y-3 py-2">
                {[
                  { label: 'Planos Mensais', count: servicesByCategory.mensal.length, color: '#D85072' },
                  { label: 'Planos Trimestrais', count: servicesByCategory.trimestral.length, color: '#BC3859' },
                  { label: 'Planos Semestrais', count: servicesByCategory.semestral.length, color: '#9C2744' },
                  { label: 'Planos Anuais', count: servicesByCategory.anual.length, color: '#1D7A46' },
                  { label: 'Sessões Avulsas / Gympass', count: servicesByCategory.avulso.length, color: '#F59E0B' }
                ].map(item => {
                  const maxC = Math.max(...Object.values(servicesByCategory).map(arr => arr.length), 1);
                  const pct = (item.count / maxC) * 100;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#26161B]">{item.label}</span>
                        <span className="font-bold text-[#8C3B50]">{item.count} planos</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                          className="h-full rounded-full transition-all duration-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico 3.2: Comparativo Valor Total vs Mensalidade */}
            <div
              id="chart-servicos-valores"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Comparativo de Precificação • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Preço Total x Mensalidade dos Serviços
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Relação entre investimento fechado e parcela por serviço
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-servicos-valores', 'Comparativo_Precos_Servicos')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Comparativo_Precos_Servicos',
                      ['Serviço', 'Categoria', 'Valor Total (R$)', 'Mensalidade (R$)'],
                      services.map(s => [s.name, s.planCategory, s.totalValue || 0, s.monthlyValue || 0])
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Services Table List */}
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {services.slice(0, 5).map(s => (
                  <div key={s.id} className="p-2.5 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-[#26161B] block truncate max-w-[200px]">{s.name}</span>
                      <span className="text-[10px] text-[#8C3B50]">{s.planCategory} • {s.weeklyClasses}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-[#1D7A46] block">{formatBRL(s.totalValue || 0)}</span>
                      <span className="text-[10px] text-[#5B444C]">{formatBRL(s.monthlyValue || 0)}/mês</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* CATEGORIA 4: CADASTRO DE PROFISSIONAIS (CORPO TÉCNICO)                 */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'profissionais') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                Categoria 4: Cadastro de Profissionais (Corpo Técnico)
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] px-2.5 py-1 rounded-full border border-[#FCD6E0]">
              Equipe & Honorários
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 4.1: Alunos por Instrutor */}
            <div
              id="chart-prof-alunos"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Distribuição de Alunos • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Alunos Vinculados por Profissional
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Divisão de turmas e atendimento entre os fisioterapeutas
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-prof-alunos', 'Alunos_Por_Profissional')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Alunos_Por_Profissional',
                      ['Profissional', 'Cargo', 'Alunos Vinculados'],
                      professionals.map(p => [
                        p.name,
                        p.roleTitle || 'Fisioterapeuta',
                        classes.filter(c => c.professionalName === p.name).length
                      ])
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 py-2">
                {professionals.map(p => {
                  const count = classes.filter(c => c.professionalName === p.name).length;
                  const pct = totalStudents > 0 ? (count / totalStudents) * 100 : 0;
                  return (
                    <div key={p.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#26161B]">{p.name}</span>
                        <span className="font-bold text-[#D85072]">{count} alunos ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          style={{ width: `${pct}%` }}
                          className="h-full rounded-full bg-gradient-to-r from-[#D85072] to-[#9C2744] transition-all duration-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico 4.2: Faturamento & Repasses por Instrutor */}
            <div
              id="chart-prof-repasses"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#1D7A46] bg-[#EBF7EE] px-2 py-0.5 rounded-md">
                    Repasses de Honorários • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Faturamento Gerado x Repasses Devidos
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Honorários calculados para o corpo técnico
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-prof-repasses', 'Faturamento_Repasse_Profissionais')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Faturamento_Repasse_Profissionais',
                      ['Profissional', 'Faturamento (R$)', 'Repasse (R$)'],
                      professionals.map(p => {
                        const pClasses = classes.filter(c => c.professionalName === p.name);
                        return [
                          p.name,
                          formatBRL(pClasses.reduce((acc, c) => acc + (c.totalPlanValue || 0), 0)),
                          formatBRL(pClasses.reduce((acc, c) => acc + (c.professionalPassValue || 0), 0))
                        ];
                      })
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                {professionals.map(p => {
                  const pClasses = classes.filter(c => c.professionalName === p.name);
                  const rev = pClasses.reduce((acc, c) => acc + (c.totalPlanValue || 0), 0);
                  const pass = pClasses.reduce((acc, c) => acc + (c.professionalPassValue || 0), 0);
                  return (
                    <div key={p.id} className="p-3 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <strong className="text-[#26161B] block">{p.name}</strong>
                        <span className="text-[10px] text-[#8C3B50]">{p.roleTitle || 'Instrutora de Pilates'}</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        <span className="font-bold text-[#1D7A46] block">Gerado: {formatBRL(rev)}</span>
                        <span className="font-semibold text-[#9C2744] block text-[11px]">Repasse: {formatBRL(pass)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* CATEGORIA 5: AGENDA & MARCAÇÕES ONLINE                                */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'agenda') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                Categoria 5: Agenda & Marcações Online
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] px-2.5 py-1 rounded-full border border-[#FCD6E0]">
              Fluxo de Sessões
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 5.1: Status das Marcações */}
            <div
              id="chart-agenda-status"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Status de Atendimento • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Agendamentos por Status Operacional
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Volume de confirmações, pendências e sessões concluídas
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-agenda-status', 'Agendamentos_Por_Status')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Agendamentos_Por_Status',
                      ['Status', 'Quantidade'],
                      [
                        ['Confirmados', confirmedAppointments],
                        ['Pendentes', pendingAppointments],
                        ['Concluídos', completedAppointments],
                        ['Cancelados', cancelledAppointments]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-4 rounded-2xl bg-[#EBF7EE]/70 border border-[#B6E3C3]">
                  <span className="text-xs font-semibold text-[#1D7A46] block">Confirmados</span>
                  <span className="text-2xl font-bold font-serif text-[#1D7A46] mt-1 block">
                    {confirmedAppointments}
                  </span>
                  <span className="text-[11px] text-[#5B444C]">Sessões garantidas na grade</span>
                </div>

                <div className="p-4 rounded-2xl bg-[#FFF9FA] border border-[#FCD6E0]">
                  <span className="text-xs font-semibold text-[#D85072] block">Pendentes</span>
                  <span className="text-2xl font-bold font-serif text-[#D85072] mt-1 block">
                    {pendingAppointments}
                  </span>
                  <span className="text-[11px] text-[#5B444C]">Aguardando WhatsApp</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="text-xs font-semibold text-[#5B444C] block">Concluídos</span>
                  <span className="text-2xl font-bold font-serif text-[#26161B] mt-1 block">
                    {completedAppointments}
                  </span>
                  <span className="text-[11px] text-[#5B444C]">Sessões ministradas</span>
                </div>

                <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-500 block">Cancelados</span>
                  <span className="text-2xl font-bold font-serif text-gray-600 mt-1 block">
                    {cancelledAppointments}
                  </span>
                  <span className="text-[11px] text-gray-500">Horários liberados</span>
                </div>
              </div>
            </div>

            {/* Gráfico 5.2: Agendamentos por Turno */}
            <div
              id="chart-agenda-turnos"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Ocupação por Turno • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Procura de Atendimento por Turno
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Concentração de horários entre Manhã, Tarde e Noite
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-agenda-turnos', 'Agendamentos_Por_Turno')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Agendamentos_Por_Turno',
                      ['Turno', 'Horário', 'Quantidade'],
                      [
                        ['Manhã', '07:00 às 11:59', morningApts],
                        ['Tarde', '12:00 às 17:59', afternoonApts],
                        ['Noite', '18:00 às 21:00', eveningApts]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4 py-2">
                {[
                  { label: 'Turno da Manhã (07:00 às 11:59)', count: morningApts, color: '#D85072' },
                  { label: 'Turno da Tarde (12:00 às 17:59)', count: afternoonApts, color: '#1D7A46' },
                  { label: 'Turno da Noite (18:00 às 21:00)', count: eveningApts, color: '#3B82F6' }
                ].map(item => {
                  const totalA = Math.max(appointments.length, 1);
                  const pct = (item.count / totalA) * 100;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#26161B]">{item.label}</span>
                        <span className="font-bold text-[#8C3B50]">{item.count} sessões ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                          className="h-full rounded-full transition-all duration-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* CATEGORIA 6: HISTÓRICO CLÍNICO, ANAMNESE & LGPD                       */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'historico') && (
        <section className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#FCD6E0]">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Stethoscope className="w-4 h-4" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                Categoria 6: Histórico Clínico & Anamnese (Padrão COFFITO & LGPD)
              </h3>
            </div>
            <span className="text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] px-2.5 py-1 rounded-full border border-[#FCD6E0]">
              Saúde da Coluna & Postura
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico 6.1: Condições Especiais dos Pacientes */}
            <div
              id="chart-clinico-condicoes"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Perfil Clínico • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Prevalência de Queixas & Condições Especiais
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Mapeamento fisioterapêutico para planejamento de aulas
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-clinico-condicoes', 'Condicoes_Clinicas')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Condicoes_Clinicas',
                      ['Condição Clínica', 'Quantidade', 'Percentual'],
                      [
                        ['Dor Crônica / Coluna', chronicPainPatients, `${totalPatients > 0 ? ((chronicPainPatients / totalPatients) * 100).toFixed(1) : 0}%`],
                        ['Cirurgias Prévias (Reabilitação)', surgeryPatients, `${totalPatients > 0 ? ((surgeryPatients / totalPatients) * 100).toFixed(1) : 0}%`],
                        ['Pilates Gestacional (Gravidez)', pregnantPatients, `${totalPatients > 0 ? ((pregnantPatients / totalPatients) * 100).toFixed(1) : 0}%`],
                        ['Atenção Pressão / Cardíaco', cardiacPatients, `${totalPatients > 0 ? ((cardiacPatients / totalPatients) * 100).toFixed(1) : 0}%`]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 py-2">
                {[
                  { label: 'Dor Crônica / Queixa de Coluna', count: chronicPainPatients, color: '#9C2744' },
                  { label: 'Histórico de Cirurgias Prévias', count: surgeryPatients, color: '#D85072' },
                  { label: 'Pilates Gestacional (Gestantes)', count: pregnantPatients, color: '#3B82F6' },
                  { label: 'Condição Cardíaca / Hipertensão', count: cardiacPatients, color: '#F59E0B' }
                ].map(item => {
                  const totalP = Math.max(totalPatients, 1);
                  const pct = (item.count / totalP) * 100;
                  return (
                    <div key={item.label} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#26161B]">{item.label}</span>
                        <span className="font-bold text-[#8C3B50]">{item.count} pacientes ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          style={{ width: `${pct}%`, backgroundColor: item.color }}
                          className="h-full rounded-full transition-all duration-700"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gráfico 6.2: Faixa Etária & Conformidade LGPD */}
            <div
              id="chart-clinico-faixa-etaria"
              className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C3B50] bg-[#FFEBF0] px-2 py-0.5 rounded-md">
                    Demografia & LGPD • PowerBI
                  </span>
                  <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] mt-1">
                    Faixa Etária & Conformidade Legal
                  </h4>
                  <p className="text-xs text-[#5B444C]">
                    Idade média dos alunos e percentual de termos assinados
                  </p>
                </div>
                {/* Download Actions */}
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => downloadChartAsPNG('chart-clinico-faixa-etaria', 'Faixa_Etaria_LGPD')}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] border border-[#FCD6E0] transition-colors cursor-pointer"
                    title="Baixar Gráfico em Imagem PNG"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => downloadChartDataCSV(
                      'Faixa_Etaria_LGPD',
                      ['Faixa Etária / Termo', 'Quantidade'],
                      [
                        ['Até 29 anos', ageGroups.under30],
                        ['30 a 45 anos', ageGroups.from30to45],
                        ['46 a 60 anos', ageGroups.from46to60],
                        ['Acima de 60 anos (Sênior)', ageGroups.over60],
                        ['Termos LGPD Assinados', lgpdSignedPatients],
                        ['Uso de Imagem Autorizado', imageAuthorizedPatients]
                      ]
                    )}
                    className="p-2 rounded-xl bg-[#FFFDFB] hover:bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] transition-colors cursor-pointer"
                    title="Baixar Dados em CSV"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] text-[#5B444C] block">Até 29 anos</span>
                  <strong className="text-lg font-serif font-bold text-[#26161B]">{ageGroups.under30} alunos</strong>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] text-[#5B444C] block">30 a 45 anos</span>
                  <strong className="text-lg font-serif font-bold text-[#9C2744]">{ageGroups.from30to45} alunos</strong>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] text-[#5B444C] block">46 a 60 anos</span>
                  <strong className="text-lg font-serif font-bold text-[#D85072]">{ageGroups.from46to60} alunos</strong>
                </div>
                <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] text-[#5B444C] block">Acima de 60 anos (Sênior)</span>
                  <strong className="text-lg font-serif font-bold text-[#1D7A46]">{ageGroups.over60} alunos</strong>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-[#EBF7EE]/60 border border-[#B6E3C3] flex items-center justify-between text-xs text-[#1D7A46]">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Termos LGPD Assinados: <strong>{lgpdSignedPatients}/{totalPatients}</strong> ({totalPatients > 0 ? ((lgpdSignedPatients / totalPatients) * 100).toFixed(0) : 0}%)</span>
                </div>
                <span className="font-bold">100% COFFITO</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================================================================== */}
      {/* CATEGORIA 7: FOLHA DE PAGAMENTO DOS INSTRUTORES (COLETA E CONSOLIDAÇÃO) */}
      {/* ===================================================================== */}
      {(activeCategory === 'todos' || activeCategory === 'folha') && (
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-[#FCD6E0] gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Banknote className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                  Categoria 7: Folha de Pagamento (Instrutores & Aulas Prestadas)
                </h3>
                <p className="text-xs text-[#8C3B50]">
                  Consolidação oficial de todas as aulas prestadas, totais de dias, aulas, horas e valores devidos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  exportPayrollToXLS(dashboardPayroll, '10/2026');
                  showToast('Folha de Pagamento exportada em XLS com sucesso!');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] text-xs font-semibold hover:bg-[#D5EEDC] transition-colors flex items-center gap-1 cursor-pointer"
                title="Baixar planilha consolidada em Excel"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>XLS</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  exportPayrollToPDF(dashboardPayroll, '10/2026');
                  showToast('Folha de Pagamento exportada em PDF com sucesso!');
                }}
                className="px-3 py-1.5 rounded-xl bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] text-xs font-semibold hover:bg-[#FCD6E0] transition-colors flex items-center gap-1 cursor-pointer"
                title="Baixar documento timbrado oficial em PDF"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>PDF</span>
              </button>
            </div>
          </div>

          {/* Cards de Métricas da Folha */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                Totais de Dias Prestados
              </span>
              <p className="font-serif text-2xl font-bold text-[#26161B] mt-1">
                {totalPayrollDays} dias
              </p>
              <span className="text-[10px] text-[#5B444C]">Presença nas turmas</span>
            </div>

            <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                Totais de Aulas Realizadas
              </span>
              <p className="font-serif text-2xl font-bold text-[#9C2744] mt-1">
                {totalPayrollClasses} aulas
              </p>
              <span className="text-[10px] text-[#5B444C]">Ministradas no mês</span>
            </div>

            <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                Carga Horária (Horas)
              </span>
              <p className="font-serif text-2xl font-bold text-[#D85072] mt-1">
                {totalPayrollHours}h
              </p>
              <span className="text-[10px] text-[#5B444C]">Horas contratadas</span>
            </div>

            <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] shadow-xs">
              <span className="text-[11px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                Total para Pagamento
              </span>
              <p className="font-serif text-2xl font-bold text-[#1D7A46] mt-1">
                {formatBRL(totalPayrollAmount)}
              </p>
              <span className="text-[10px] text-[#1D7A46] font-semibold">Consolidado da equipe</span>
            </div>
          </div>

          {/* Tabela de Consolidação por Profissional */}
          <div className="bg-white rounded-2xl border border-[#FCD6E0] shadow-xs overflow-hidden">
            <div className="p-3.5 sm:p-4 bg-[#FFF9F7] border-b border-[#FCD6E0] flex items-center justify-between">
              <span className="text-xs font-bold text-[#8C3B50] uppercase tracking-wider">
                Consolidação Individual por Instrutor(a) • Competência 10/2026
              </span>
              <span className="text-xs text-[#5B444C]">{totalPayrollInstructors} profissionais</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FFFDFB] text-[#8C3B50] uppercase text-[10px] border-b border-[#FCD6E0]">
                  <tr>
                    <th className="py-2.5 px-3">Profissional Instrutor(a)</th>
                    <th className="py-2.5 px-2 text-center">Alunos</th>
                    <th className="py-2.5 px-2 text-center">Dias</th>
                    <th className="py-2.5 px-2 text-center">Aulas</th>
                    <th className="py-2.5 px-2 text-center">Horas</th>
                    <th className="py-2.5 px-3 text-right">Faturamento</th>
                    <th className="py-2.5 px-3 text-right">Repasse Acad. 50%</th>
                    <th className="py-2.5 px-3 text-right font-bold">Valor a Pagar</th>
                    <th className="py-2.5 px-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FCD6E0]/40 text-[#26161B]">
                  {dashboardPayroll.map((item) => (
                    <tr key={item.professionalId} className="hover:bg-[#FFF5F7] transition-colors">
                      <td className="py-2.5 px-3">
                        <strong className="block text-[#26161B]">{item.professionalName}</strong>
                        <span className="text-[10px] text-[#8C3B50]">
                          {item.roleTitle} • CREFITO: {item.crefito}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-[#5B444C]">
                        {item.studentsCount}
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-[#26161B]">
                        {item.totalDays} dias
                      </td>
                      <td className="py-2.5 px-2 text-center font-bold text-[#9C2744]">
                        {item.totalClassesAttended}
                      </td>
                      <td className="py-2.5 px-2 text-center font-semibold text-[#5B444C]">
                        {item.totalHoursPlanned}h
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#5B444C]">
                        {formatBRL(item.grossRevenueGenerated)}
                      </td>
                      <td className="py-2.5 px-3 text-right text-[#9C2744]">
                        {formatBRL(item.gymPassRetention)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#1D7A46]">
                        {formatBRL(item.netPaymentValue)}
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            item.status === 'pago'
                              ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                              : 'bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A]'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
