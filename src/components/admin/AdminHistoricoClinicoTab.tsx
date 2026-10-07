import React, { useState } from 'react';
import {
  User,
  Users,
  Search,
  Plus,
  FileText,
  ShieldCheck,
  Heart,
  Phone,
  Mail,
  MapPin,
  Calendar,
  AlertCircle,
  CheckCircle,
  FileCheck,
  Clock,
  Trash2,
  Edit,
  Eye,
  Activity,
  FileSpreadsheet,
  Check,
  X,
  Upload,
  Paperclip,
  Download,
  Stethoscope,
  Smile,
  Info,
  Receipt,
  DollarSign,
  CreditCard
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  ClinicalPatient,
  ExamAttachment,
  useClinicalPatients,
  createBlankPatient,
  calculateAge,
  exportClinicalPatientsToPDF,
  exportDeclarationToXLS,
  exportDeclarationToPDF,
  exportSinglePatientRecordToXLS,
  exportSinglePatientRecordToPDF,
  exportReceiptToPDF,
  exportReceiptToXLS,
  ReceiptData
} from '../../data/clinicalHistoryStore';
import { useClinicData } from '../../data/clinicStore';
import { usePilatesClasses } from '../../data/pilatesClassesStore';
import { numeroPorExtensoBRL } from '../../utils/numberToWordsPT';

export const AdminHistoricoClinicoTab: React.FC = () => {
  const clinic = useClinicData();
  const { classes } = usePilatesClasses();
  const { patients, savePatient, removePatient, resetToSample } = useClinicalPatients();

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'em_avaliacao' | 'alta' | 'inativo'>('todos');
  const [conditionFilter, setConditionFilter] = useState<'todos' | 'dor_cronica' | 'gestante' | 'cirurgia'>('todos');

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<ClinicalPatient | null>(null);
  const [activeFormTab, setActiveFormTab] = useState<'pessoais' | 'emergencia' | 'anamnese' | 'medico' | 'termos'>('pessoais');

  // Modal: View Clinical Record (Visual Report on Screen)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPatient, setViewingPatient] = useState<ClinicalPatient | null>(null);

  // Modal: General Clinical History Visual Report on Screen
  const [isGeneralReportOpen, setIsGeneralReportOpen] = useState(false);

  // Modal: Confirm Patient Deletion (in-app dialog instead of blocked window.confirm)
  const [patientToDelete, setPatientToDelete] = useState<{ id: string; name: string } | null>(null);

  // Modal: Declaração de Comparecimento (Form & Visual Report on Screen)
  const [isDeclarationModalOpen, setIsDeclarationModalOpen] = useState(false);
  const [isDeclarationVisualOpen, setIsDeclarationVisualOpen] = useState(false);
  const [declarationPatient, setDeclarationPatient] = useState<ClinicalPatient | null>(null);
  const [declarationDate, setDeclarationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [declarationStartTime, setDeclarationStartTime] = useState('08:00');
  const [declarationEndTime, setDeclarationEndTime] = useState('09:00');
  const [declarationPurpose, setDeclarationPurpose] = useState('Sessão individualizada de Fisioterapia & Pilates Clínico para tratamento postural e fortalecimento.');
  const [declarationProfessional, setDeclarationProfessional] = useState('Dra. Léia Mar');
  const [declarationCrefito, setDeclarationCrefito] = useState(clinic.crefito || '12345-F');

  // Modal: Recibo de Pagamento Oficial Conforme a Lei (Form & Visual Report on Screen)
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isReceiptVisualOpen, setIsReceiptVisualOpen] = useState(false);
  const [receiptPatient, setReceiptPatient] = useState<ClinicalPatient | null>(null);
  const [receiptValue, setReceiptValue] = useState<number>(350);
  const [receiptValueInWords, setReceiptValueInWords] = useState<string>('trezentos e cinquenta reais');
  const [receiptServiceDesc, setReceiptServiceDesc] = useState<string>(
    'Mensalidade de Aulas de Pilates Clínico e Fisioterapia Postural (2x por semana)'
  );
  const [receiptCompetence, setReceiptCompetence] = useState<string>('10/2026');
  const [receiptPaymentMethod, setReceiptPaymentMethod] = useState<string>('PIX');
  const [receiptPaymentDate, setReceiptPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [receiptProfessional, setReceiptProfessional] = useState<string>('Dra. Léia Mar');
  const [receiptCrefito, setReceiptCrefito] = useState<string>(clinic.crefito || '12345-F');
  const [receiptObs, setReceiptObs] = useState<string>(
    'Pagamento integral quitado. Recibo legal com plena eficácia probatória em conformidade com o Art. 320 do Código Civil (Lei Federal nº 10.406/2002) e Lei Federal nº 8.846/1994 (apto para dedução de IRPF junto à Receita Federal).'
  );

  // Attachment upload helper state
  const [newAttachmentName, setNewAttachmentName] = useState('');
  const [newAttachmentType, setNewAttachmentType] = useState<ExamAttachment['type']>('Ressonância');
  const [newAttachmentNotes, setNewAttachmentNotes] = useState('');

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter patients
  const filteredPatients = patients.filter((p) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      p.fullName.toLowerCase().includes(term) ||
      p.cpf.includes(term) ||
      p.phone.includes(term) ||
      p.email.toLowerCase().includes(term) ||
      p.registrationNumber.toLowerCase().includes(term) ||
      p.anamnese.mainGoal.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'todos' || p.status === statusFilter;

    let matchesCondition = true;
    if (conditionFilter === 'dor_cronica') matchesCondition = p.anamnese.chronicPainOrInjury;
    else if (conditionFilter === 'gestante') matchesCondition = p.anamnese.isPregnant;
    else if (conditionFilter === 'cirurgia') matchesCondition = p.anamnese.recentOrPastSurgeries;

    return matchesSearch && matchesStatus && matchesCondition;
  });

  // Metrics
  const totalCount = patients.length;
  const activeCount = patients.filter((p) => p.status === 'ativo').length;
  const painCount = patients.filter((p) => p.anamnese.chronicPainOrInjury).length;
  const surgeryCount = patients.filter((p) => p.anamnese.recentOrPastSurgeries).length;
  const pregnantCount = patients.filter((p) => p.anamnese.isPregnant).length;
  const signedTermsCount = patients.filter((p) => p.terms.consentAccepted).length;

  // Open Edit/Create Modal
  const handleOpenCreate = () => {
    const blank = createBlankPatient();
    setEditingPatient({
      ...blank,
      id: '',
      registrationNumber: `PRONT-2026-${String(patients.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    } as ClinicalPatient);
    setActiveFormTab('pessoais');
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (p: ClinicalPatient) => {
    // Clone deeply to avoid modifying state directly
    setEditingPatient(JSON.parse(JSON.stringify(p)));
    setActiveFormTab('pessoais');
    setIsEditModalOpen(true);
  };

  const handleOpenView = (p: ClinicalPatient) => {
    setViewingPatient(p);
    setIsViewModalOpen(true);
  };

  const handleOpenDeclaration = (p: ClinicalPatient) => {
    setDeclarationPatient(p);
    setIsDeclarationModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPatient) return;

    if (!editingPatient.fullName.trim()) {
      showToast('Por favor, informe o Nome Completo do aluno/paciente.');
      setActiveFormTab('pessoais');
      return;
    }

    savePatient(editingPatient);
    setIsEditModalOpen(false);
    setEditingPatient(null);
    showToast('Prontuário do aluno/paciente salvo com sucesso!');
  };

  const handleDeletePatient = (id: string, name: string) => {
    setPatientToDelete({ id, name });
  };

  const confirmDeletePatient = () => {
    if (!patientToDelete) return;
    removePatient(patientToDelete.id);
    if (editingPatient?.id === patientToDelete.id) {
      setIsEditModalOpen(false);
      setEditingPatient(null);
    }
    if (viewingPatient?.id === patientToDelete.id) {
      setIsViewModalOpen(false);
      setViewingPatient(null);
    }
    showToast(`Cadastro de "${patientToDelete.name}" excluído com sucesso!`);
    setPatientToDelete(null);
  };

  const handleAddAttachment = () => {
    if (!editingPatient || !newAttachmentName.trim()) {
      showToast('Informe o nome ou identificação do exame/laudo.');
      return;
    }
    const newAtt: ExamAttachment = {
      id: `att-${Date.now()}`,
      name: newAttachmentName.trim(),
      date: new Date().toISOString().split('T')[0],
      type: newAttachmentType,
      notes: newAttachmentNotes.trim(),
      size: '1.2 MB'
    };
    setEditingPatient({
      ...editingPatient,
      medicalInfo: {
        ...editingPatient.medicalInfo,
        examAttachments: [...(editingPatient.medicalInfo.examAttachments || []), newAtt]
      }
    });
    setNewAttachmentName('');
    setNewAttachmentNotes('');
    showToast('Exame anexado com sucesso!');
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!editingPatient) return;
    setEditingPatient({
      ...editingPatient,
      medicalInfo: {
        ...editingPatient.medicalInfo,
        examAttachments: (editingPatient.medicalInfo.examAttachments || []).filter((a) => a.id !== attId)
      }
    });
  };

  // Open Visual Report on Screen for Attendance Declaration (NO direct printing)
  const handlePrintDeclaration = () => {
    if (!declarationPatient) return;
    setIsDeclarationModalOpen(false);
    setIsDeclarationVisualOpen(true);
  };

  const handleExportDeclarationXLS = () => {
    if (!declarationPatient) return;
    exportDeclarationToXLS({
      patient: declarationPatient,
      sessionDate: declarationDate,
      startTime: declarationStartTime,
      endTime: declarationEndTime,
      purpose: declarationPurpose,
      professionalName: declarationProfessional,
      professionalCrefito: declarationCrefito
    });
    showToast('Declaração de Comparecimento baixada em XLS com sucesso!');
  };

  const handleExportDeclarationPDF = () => {
    if (!declarationPatient) return;
    exportDeclarationToPDF({
      patient: declarationPatient,
      sessionDate: declarationDate,
      startTime: declarationStartTime,
      endTime: declarationEndTime,
      purpose: declarationPurpose,
      professionalName: declarationProfessional,
      professionalCrefito: declarationCrefito
    });
    showToast('Declaração de Comparecimento baixada em PDF com sucesso!');
  };

  // =====================================================================
  // HANDLERS: RECIBO DE PAGAMENTO CONFORME A LEI (ITEM B)
  // =====================================================================
  const handleOpenReceipt = (p: ClinicalPatient) => {
    setReceiptPatient(p);
    // Tenta identificar o plano/matrícula do aluno nas turmas de pilates
    const enrolledClass = classes.find(
      (c) =>
        c.studentName.toLowerCase().trim() === p.fullName.toLowerCase().trim() ||
        c.studentName.toLowerCase().includes(p.fullName.toLowerCase()) ||
        p.fullName.toLowerCase().includes(c.studentName.toLowerCase())
    );

    const val = enrolledClass?.totalPlanValue || 350;
    setReceiptValue(val);
    setReceiptValueInWords(numeroPorExtensoBRL(val));

    if (enrolledClass) {
      setReceiptServiceDesc(
        `Mensalidade de Pilates Clínico - ${enrolledClass.planType} com ${enrolledClass.professionalName}`
      );
    } else {
      setReceiptServiceDesc('Mensalidade de Aulas de Pilates Clínico e Fisioterapia Postural (2x por semana)');
    }

    setReceiptPaymentDate(new Date().toISOString().split('T')[0]);
    setIsReceiptModalOpen(true);
  };

  const getReceiptData = (): ReceiptData | null => {
    if (!receiptPatient) return null;
    const numPart = receiptPatient.registrationNumber.replace(/[^0-9]/g, '').slice(-3) || '001';
    const compPart = receiptCompetence.replace('/', '');
    const receiptNumber = `REC-${compPart}-${numPart}`;
    return {
      receiptNumber,
      patient: receiptPatient,
      value: receiptValue,
      valueInWords: receiptValueInWords || numeroPorExtensoBRL(receiptValue),
      serviceDescription: receiptServiceDesc,
      competenceMonth: receiptCompetence,
      paymentMethod: receiptPaymentMethod,
      paymentDate: receiptPaymentDate,
      professionalName: receiptProfessional,
      professionalCrefito: receiptCrefito,
      observations: receiptObs
    };
  };

  const handleExportReceiptPDF = () => {
    const data = getReceiptData();
    if (!data) return;
    exportReceiptToPDF(data);
    showToast('Recibo de Pagamento Oficial baixado em PDF com sucesso!');
  };

  const handleExportReceiptXLS = () => {
    const data = getReceiptData();
    if (!data) return;
    exportReceiptToXLS(data);
    showToast('Recibo de Pagamento baixado em XLS (Excel) com sucesso!');
  };

  const handlePrintReceipt = () => {
    if (!receiptPatient) return;
    setIsReceiptModalOpen(false);
    setIsReceiptVisualOpen(true);
  };

  const handleCopyReceiptText = () => {
    const data = getReceiptData();
    if (!data) return;
    const formatBRL = (v: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
    const text =
      `*RECIBO DE PAGAMENTO DE SERVIÇOS DE SAÚDE*\n` +
      `*Nº Registro:* ${data.receiptNumber}\n` +
      `*Clínica:* ${clinic.name} • CREFITO: ${data.professionalCrefito}\n` +
      `*Profissional Emitente:* ${data.professionalName}\n` +
      `*Aluno(a) / Paciente:* ${data.patient.fullName}\n` +
      `*CPF do Pagador:* ${data.patient.cpf || 'Não informado'}\n` +
      `*Serviço:* ${data.serviceDescription}\n` +
      `*Competência:* ${data.competenceMonth}\n` +
      `*Valor Quitado:* ${formatBRL(data.value)} (${data.valueInWords})\n` +
      `*Forma de Pagamento:* ${data.paymentMethod}\n` +
      `*Data do Pagamento:* ${data.paymentDate.split('-').reverse().join('/')}\n\n` +
      `*QUITAÇÃO LEGAL:* Declaramos ter recebido de ${data.patient.fullName} a quantia retro mencionada, conferindo-lhe plena, rasa e irrevogável quitação do valor recebido.\n` +
      `_Documento emitido nos termos da Lei nº 8.846/1994 e Art. 320 da Lei Federal nº 10.406/2002 (Código Civil), válido para comprovação contábil e dedução no IRPF._`;
    navigator.clipboard.writeText(text);
    showToast('Texto oficial do Recibo copiado para WhatsApp!');
  };

  // Open Visual Report on Screen for Clinical Record (NO direct printing)
  const handlePrintRecord = (p: ClinicalPatient) => {
    setViewingPatient(p);
    setIsViewModalOpen(true);
  };

  const handleExportSingleRecordXLS = (p: ClinicalPatient) => {
    exportSinglePatientRecordToXLS(p);
    showToast(`Ficha de ${p.fullName} baixada em XLS com sucesso!`);
  };

  const handleExportSingleRecordPDF = (p: ClinicalPatient) => {
    exportSinglePatientRecordToPDF(p);
    showToast(`Ficha de ${p.fullName} baixada em PDF com sucesso!`);
  };

  // Export to XLS
  const handleExportXLS = () => {
    try {
      const dataToExport = patients.map((p) => {
        const age = calculateAge(p.birthDate);
        return {
          'Nº Prontuário': p.registrationNumber,
          'Nome Completo': p.fullName,
          'Idade': age.years,
          'Data Nasc.': p.birthDate,
          'Gênero': p.gender,
          'CPF': p.cpf,
          'RG': p.rg,
          'Telefone / WhatsApp': p.phone,
          'E-mail': p.email,
          'Endereço': `${p.address.street}, ${p.address.number} - ${p.address.neighborhood} - ${p.address.city}/${p.address.state}`,
          'Contato de Emergência': `${p.emergencyContact.name} (${p.emergencyContact.relationship}) - Tel: ${p.emergencyContact.phone}`,
          'Objetivo Principal': p.anamnese.mainGoal,
          'Atividade Física': p.anamnese.physicalActivityCurrent ? `Sim: ${p.anamnese.physicalActivityDetails}` : 'Não',
          'Lesão / Dor Crônica': p.anamnese.chronicPainOrInjury ? `Sim: ${p.anamnese.chronicPainDetails}` : 'Não',
          'Cirurgias': p.anamnese.recentOrPastSurgeries ? `Sim: ${p.anamnese.surgeriesDetails}` : 'Não',
          'Pressão / Cardíaco': p.anamnese.cardiacOrBloodPressure,
          'Medicamentos': p.anamnese.continuousMedication ? `Sim: ${p.anamnese.medicationDetails}` : 'Não',
          'Gestante': p.anamnese.isPregnant ? `Sim (${p.anamnese.gestationalWeeks} semanas)` : 'Não',
          'Médico Acompanhante': `${p.medicalInfo.doctorName || '-'} (${p.medicalInfo.doctorPhone || '-'})`,
          'Termo Consentimento': p.terms.consentAccepted ? 'Assinado' : 'Pendente',
          'Uso Imagem': p.terms.imageUsageAuthorized ? 'Autorizado' : 'Não autorizado',
          'Status': p.status.toUpperCase()
        };
      });

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Historico_Clinico');
      XLSX.writeFile(wb, `Cadastro_Geral_Alunos_Pacientes_${new Date().toISOString().split('T')[0]}.xlsx`);
      showToast('Planilha Excel (.xlsx) baixada com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar planilha Excel.');
    }
  };

  const handleExportPDF = () => {
    try {
      exportClinicalPatientsToPDF(patients);
      showToast('Relatório oficial em PDF baixado com sucesso!');
    } catch (err) {
      console.error(err);
      showToast('Erro ao exportar PDF.');
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#26161B] text-white px-5 py-3 rounded-2xl shadow-2xl border border-[#D85072]/50 text-sm font-semibold flex items-center gap-2.5">
          <CheckCircle className="w-5 h-5 text-[#48BB78] flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#FFFDFB] to-[#FFF5F7] rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#D85072]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-bold uppercase tracking-wider mb-2 border border-[#FCD6E0]">
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Secretária & Histórico Clínico • Padrão Legal COFFITO & LGPD</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B]">
              Histórico Clínico & Cadastro Geral dos Alunos
            </h2>
            <p className="text-sm text-[#5B444C] mt-1 max-w-3xl leading-relaxed">
              Gestão completa e atualizada conforme a legislação vigente (Lei Geral de Proteção de Dados e Código de Ética da Fisioterapia). Anamneses completas, termos de consentimento com assinatura, exames anexados e emissão oficial de Declarações de Comparecimento.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleOpenCreate}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] text-white font-semibold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Aluno / Paciente</span>
            </button>

            <button
              onClick={handleExportXLS}
              className="px-3.5 py-2.5 rounded-xl bg-[#EBF7EE] hover:bg-[#D5EEDC] text-[#1D7A46] border border-[#B6E3C3] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Baixar planilha padronizada em formato Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
              <span>Baixar XLS</span>
            </button>

            <button
              onClick={handleExportPDF}
              className="px-3.5 py-2.5 rounded-xl bg-[#FFEBF0] hover:bg-[#FCD6E0] text-[#9C2744] border border-[#FCD6E0] font-semibold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Baixar relatório padronizado em formato PDF"
            >
              <FileText className="w-4 h-4 text-[#D85072]" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={() => setIsGeneralReportOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#FFEBF0] text-[#26161B] border border-[#FCD6E0] font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Gerar e visualizar relatório completo em tela (com opções de Baixar XLS e Baixar PDF)"
            >
              <Eye className="w-4 h-4 text-[#8C3B50]" />
              <span>Relatório em Tela (Visual)</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 pt-6 border-t border-[#FCD6E0]/60">
          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#FCD6E0]/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C3B50] block">
              Total Cadastrados
            </span>
            <span className="text-2xl font-bold text-[#26161B] mt-0.5 block">{totalCount}</span>
            <span className="text-[10px] text-[#A8928B]">Alunos & Pacientes</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#FCD6E0]/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#1D7A46] block">
              Alunos Ativos
            </span>
            <span className="text-2xl font-bold text-[#1D7A46] mt-0.5 block">{activeCount}</span>
            <span className="text-[10px] text-[#A8928B]">Em prática frequente</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#FCD6E0]/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D85072] block">
              Lesão / Dor Crônica
            </span>
            <span className="text-2xl font-bold text-[#9C2744] mt-0.5 block">{painCount}</span>
            <span className="text-[10px] text-[#A8928B]">Acompanhamento especial</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#FCD6E0]/70">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9C2744] block">
              Alunas Gestantes
            </span>
            <span className="text-2xl font-bold text-[#BC3859] mt-0.5 block">{pregnantCount}</span>
            <span className="text-[10px] text-[#A8928B]">Pilates para Gestante</span>
          </div>

          <div className="bg-white/80 p-3.5 rounded-2xl border border-[#FCD6E0]/70 col-span-2 sm:col-span-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#26161B] block">
              Termos & LGPD
            </span>
            <span className="text-2xl font-bold text-[#26161B] mt-0.5 block">{signedTermsCount}</span>
            <span className="text-[10px] text-[#1D7A46] font-medium">100% em conformidade</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#FCD6E0] shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C3B50] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome, CPF, WhatsApp, prontuário ou queixa/objetivo..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs sm:text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072] focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#8C3B50] hover:text-[#26161B]"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 text-xs text-[#5B444C]">
            <span className="font-semibold text-[#8C3B50]">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-2.5 py-2 rounded-lg border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
            >
              <option value="todos">Todos ({patients.length})</option>
              <option value="ativo">Ativos</option>
              <option value="em_avaliacao">Em Avaliação</option>
              <option value="alta">Alta Fisioterapêutica</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#5B444C]">
            <span className="font-semibold text-[#8C3B50]">Condição:</span>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value as any)}
              className="px-2.5 py-2 rounded-lg border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
            >
              <option value="todos">Todas</option>
              <option value="dor_cronica">Dor Crônica / Coluna</option>
              <option value="gestante">Gestantes</option>
              <option value="cirurgia">Cirurgia Prévia</option>
            </select>
          </div>
        </div>
      </div>

      {/* Patient Cards / List */}
      <div className="space-y-4">
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#FCD6E0] text-[#5B444C]">
            <Users className="w-12 h-12 text-[#D85072]/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#26161B]">Nenhum aluno/paciente encontrado</h3>
            <p className="text-xs text-[#8C3B50] mt-1 max-w-md mx-auto">
              Nenhum cadastro corresponde ao termo de busca "{searchTerm}" ou filtros selecionados.
            </p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('todos');
                  setConditionFilter('todos');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFEBF0] hover:bg-[#FCD6E0] transition-colors"
              >
                Limpar Filtros
              </button>
              <button
                onClick={handleOpenCreate}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors"
              >
                Cadastrar Novo Aluno
              </button>
            </div>
          </div>
        ) : (
          filteredPatients.map((patient) => {
            const age = calculateAge(patient.birthDate);
            return (
              <div
                key={patient.id}
                className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs hover:shadow-md transition-all hover:border-[#D85072]/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#FCD6E0]/60">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#FFEBF0] to-[#FCD6E0] text-[#8C3B50] flex items-center justify-center font-bold text-base flex-shrink-0 border border-[#FCD6E0]">
                      {patient.fullName
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                          {patient.fullName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFEBF0] text-[#8C3B50] border border-[#FCD6E0]">
                          {patient.registrationNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            patient.status === 'ativo'
                              ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                              : patient.status === 'em_avaliacao'
                              ? 'bg-[#FFF8E6] text-[#B7791F] border border-[#FEEBC8]'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {patient.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#5B444C] mt-1 font-medium">
                        <span>
                          <strong>Nascimento:</strong> {patient.birthDate || 'Não inf.'} ({age.label})
                        </span>
                        <span>
                          <strong>Gênero:</strong> {patient.gender}
                        </span>
                        <span>
                          <strong>CPF:</strong> {patient.cpf || 'Não inf.'}
                        </span>
                        <span>
                          <strong>RG:</strong> {patient.rg || 'Não inf.'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
                    <button
                      onClick={() => handleOpenDeclaration(patient)}
                      className="px-3 py-2 rounded-xl bg-[#FFF5F7] hover:bg-[#FFEBF0] text-[#8C3B50] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Emitir Declaração de Comparecimento para o aluno/paciente"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[#D85072]" />
                      <span>Declaração</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenReceipt(patient)}
                      className="px-3 py-2 rounded-xl bg-[#FFF5F7] hover:bg-[#FFEBF0] text-[#8C3B50] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Emitir Recibo de Pagamento legalmente válido para respaldar o aluno(a) conforme Lei nº 8.846/94 e Art. 320 do Código Civil"
                    >
                      <Receipt className="w-3.5 h-3.5 text-[#D85072]" />
                      <span>Recibo</span>
                    </button>

                    <button
                      onClick={() => handlePrintRecord(patient)}
                      className="px-3 py-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#26161B] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Visualizar prontuário e ficha completa em tela (com opções de Baixar XLS e Baixar PDF)"
                    >
                      <FileText className="w-3.5 h-3.5 text-[#8C3B50]" />
                      <span className="hidden sm:inline">Ficha em Tela</span>
                    </button>

                    <button
                      onClick={() => handleOpenView(patient)}
                      className="px-3 py-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#26161B] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Visualizar prontuário completo"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5B444C]" />
                      <span>Ver</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(patient)}
                      className="px-3 py-2 rounded-xl bg-[#D85072] hover:bg-[#BC3859] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      title="Editar cadastro e anamnese"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeletePatient(patient.id, patient.fullName)}
                      className="px-3 py-2 rounded-xl bg-[#FDEDF0] hover:bg-[#FCD6E0] text-[#9C2744] border border-[#FCD6E0] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                      title="Excluir aluno/paciente"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-[#D85072]" />
                      <span>Excluir</span>
                    </button>
                  </div>
                </div>

                {/* Patient Summary Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                  {/* Contato & Endereço */}
                  <div className="bg-[#FFFDFB] p-3.5 rounded-2xl border border-[#FCD6E0]/60 space-y-1.5">
                    <span className="font-bold text-[#8C3B50] uppercase tracking-wider block text-[10px]">
                      1. Contato & Residência
                    </span>
                    <p className="flex items-center gap-1.5 text-[#26161B]">
                      <Phone className="w-3.5 h-3.5 text-[#D85072] flex-shrink-0" />
                      <span>{patient.phone || 'Sem telefone'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[#5B444C]">
                      <Mail className="w-3.5 h-3.5 text-[#A8928B] flex-shrink-0" />
                      <span className="truncate">{patient.email || 'Sem e-mail'}</span>
                    </p>
                    <p className="flex items-start gap-1.5 text-[#5B444C] leading-snug">
                      <MapPin className="w-3.5 h-3.5 text-[#A8928B] flex-shrink-0 mt-0.5" />
                      <span className="line-clamp-2">
                        {patient.address.street} {patient.address.number}, {patient.address.neighborhood} - {patient.address.city}/{patient.address.state}
                      </span>
                    </p>
                  </div>

                  {/* Contato de Emergência */}
                  <div className="bg-[#FFFDFB] p-3.5 rounded-2xl border border-[#FCD6E0]/60 space-y-1.5">
                    <span className="font-bold text-[#8C3B50] uppercase tracking-wider block text-[10px]">
                      2. Contato de Emergência
                    </span>
                    <p className="font-semibold text-[#26161B] text-sm">
                      {patient.emergencyContact.name || 'Não informado'}
                    </p>
                    <p className="text-[#5B444C]">
                      <strong>Parentesco:</strong> {patient.emergencyContact.relationship || '-'}
                    </p>
                    <p className="text-[#8C3B50] font-semibold flex items-center gap-1">
                      <Phone className="w-3 h-3 text-[#D85072]" />
                      <span>{patient.emergencyContact.phone || '-'}</span>
                    </p>
                  </div>

                  {/* Histórico Clínico & Anamnese */}
                  <div className="bg-[#FFFDFB] p-3.5 rounded-2xl border border-[#FCD6E0]/60 space-y-1.5">
                    <span className="font-bold text-[#8C3B50] uppercase tracking-wider block text-[10px]">
                      3. Objetivo & Saúde
                    </span>
                    <p className="text-[#26161B] font-medium line-clamp-2">
                      <strong>Objetivo:</strong> {patient.anamnese.mainGoal || 'Não informado'}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {patient.anamnese.chronicPainOrInjury && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FDEDF0] text-[#9C2744] border border-[#FCD6E0]">
                          Dor Crônica
                        </span>
                      )}
                      {patient.anamnese.isPregnant && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFEBF0] text-[#BC3859] border border-[#FCD6E0]">
                          Gestante ({patient.anamnese.gestationalWeeks} sem.)
                        </span>
                      )}
                      {patient.anamnese.recentOrPastSurgeries && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E6] text-[#B7791F] border border-[#FEEBC8]">
                          Cirurgia Prévia
                        </span>
                      )}
                      {patient.anamnese.continuousMedication && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Medicação Contínua
                        </span>
                      )}
                      {patient.terms.consentAccepted && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]">
                          Termos LGPD OK
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: CADASTRO / EDIÇÃO COMPLETO DO ALUNO/PACIENTE              */}
      {/* =================================================================== */}
      {isEditModalOpen && editingPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#FFFDFB] text-[#26161B] max-w-4xl w-full rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-[#FCD6E0] shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#FCD6E0]">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8C3B50]">
                  {editingPatient.id ? 'Atualização de Prontuário' : 'Novo Cadastro Geral'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B]">
                  {editingPatient.id ? editingPatient.fullName : 'Ficha Cadastral & Anamnese'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-full hover:bg-[#FFEBF0] text-[#8C3B50] transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form navigation tabs */}
            <div className="flex flex-wrap gap-1.5 sm:gap-2 border-b border-[#FCD6E0] py-3 text-xs sm:text-sm font-semibold">
              <button
                type="button"
                onClick={() => setActiveFormTab('pessoais')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFormTab === 'pessoais'
                    ? 'bg-[#D85072] text-white shadow-xs'
                    : 'text-[#5B444C] hover:bg-[#FFEBF0]'
                }`}
              >
                1. Dados Pessoais & Contato
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('emergencia')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFormTab === 'emergencia'
                    ? 'bg-[#D85072] text-white shadow-xs'
                    : 'text-[#5B444C] hover:bg-[#FFEBF0]'
                }`}
              >
                2. Contato de Emergência
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('anamnese')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFormTab === 'anamnese'
                    ? 'bg-[#D85072] text-white shadow-xs'
                    : 'text-[#5B444C] hover:bg-[#FFEBF0]'
                }`}
              >
                3. Histórico de Saúde & Anamnese
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('medico')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFormTab === 'medico'
                    ? 'bg-[#D85072] text-white shadow-xs'
                    : 'text-[#5B444C] hover:bg-[#FFEBF0]'
                }`}
              >
                4. Informações Médicas & Exames
              </button>

              <button
                type="button"
                onClick={() => setActiveFormTab('termos')}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  activeFormTab === 'termos'
                    ? 'bg-[#D85072] text-white shadow-xs'
                    : 'text-[#5B444C] hover:bg-[#FFEBF0]'
                }`}
              >
                6. Termos & Autorizações
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-6 pt-4">
              {/* TAB 1: DADOS PESSOAIS E CONTATO */}
              {activeFormTab === 'pessoais' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#FFF5F7] p-3 rounded-xl border border-[#FCD6E0] text-xs text-[#8C3B50] flex items-center gap-2">
                    <Info className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Dados necessários para emissão de notas fiscais, contratos de prestação de serviços e avaliação da faixa etária.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPatient.fullName}
                        onChange={(e) => setEditingPatient({ ...editingPatient, fullName: e.target.value })}
                        placeholder="Ex: Mariana Vasconcelos de Souza"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Data de Nascimento *
                      </label>
                      <input
                        type="date"
                        required
                        value={editingPatient.birthDate}
                        onChange={(e) => setEditingPatient({ ...editingPatient, birthDate: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                      {editingPatient.birthDate && (
                        <p className="text-[11px] text-[#8C3B50] mt-1 font-semibold">
                          Idade calculada: {calculateAge(editingPatient.birthDate).label}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Gênero
                      </label>
                      <select
                        value={editingPatient.gender}
                        onChange={(e) => setEditingPatient({ ...editingPatient, gender: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      >
                        <option value="Feminino">Feminino</option>
                        <option value="Masculino">Masculino</option>
                        <option value="Outro">Outro</option>
                        <option value="Não informado">Prefiro não informar</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        CPF (Para emissão de NF e contrato)
                      </label>
                      <input
                        type="text"
                        value={editingPatient.cpf}
                        onChange={(e) => setEditingPatient({ ...editingPatient, cpf: e.target.value })}
                        placeholder="000.000.000-00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        RG
                      </label>
                      <input
                        type="text"
                        value={editingPatient.rg}
                        onChange={(e) => setEditingPatient({ ...editingPatient, rg: e.target.value })}
                        placeholder="Ex: 1894562-1 SSP/AM"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Telefone / WhatsApp *
                      </label>
                      <input
                        type="text"
                        required
                        value={editingPatient.phone}
                        onChange={(e) => setEditingPatient({ ...editingPatient, phone: e.target.value })}
                        placeholder="(92) 99123-4567"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={editingPatient.email}
                        onChange={(e) => setEditingPatient({ ...editingPatient, email: e.target.value })}
                        placeholder="aluno@email.com"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Status do Paciente
                      </label>
                      <select
                        value={editingPatient.status}
                        onChange={(e) => setEditingPatient({ ...editingPatient, status: e.target.value as any })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="em_avaliacao">Em Avaliação Inicial</option>
                        <option value="alta">Alta / Concluído</option>
                        <option value="inativo">Inativo / Trancado</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Nº de Prontuário / Matrícula
                      </label>
                      <input
                        type="text"
                        value={editingPatient.registrationNumber}
                        onChange={(e) => setEditingPatient({ ...editingPatient, registrationNumber: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>
                  </div>

                  {/* Endereço Residencial */}
                  <div className="pt-3 border-t border-[#FCD6E0]">
                    <h4 className="text-xs font-bold text-[#8C3B50] uppercase tracking-wider mb-3">
                      Endereço Residencial Completo
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">Logradouro (Rua/Av.)</label>
                        <input
                          type="text"
                          value={editingPatient.address.street}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              address: { ...editingPatient.address, street: e.target.value }
                            })
                          }
                          placeholder="Ex: Av. Jornalista Umberto Calderaro Filho"
                          className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">Número</label>
                        <input
                          type="text"
                          value={editingPatient.address.number}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              address: { ...editingPatient.address, number: e.target.value }
                            })
                          }
                          placeholder="Ex: 1420"
                          className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">Complemento / Apto</label>
                        <input
                          type="text"
                          value={editingPatient.address.complement || ''}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              address: { ...editingPatient.address, complement: e.target.value }
                            })
                          }
                          placeholder="Ex: Apto 804"
                          className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">Bairro</label>
                        <input
                          type="text"
                          value={editingPatient.address.neighborhood}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              address: { ...editingPatient.address, neighborhood: e.target.value }
                            })
                          }
                          placeholder="Ex: Adrianópolis"
                          className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">Cidade / UF / CEP</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={editingPatient.address.city}
                            onChange={(e) =>
                              setEditingPatient({
                                ...editingPatient,
                                address: { ...editingPatient.address, city: e.target.value }
                              })
                            }
                            placeholder="Manaus"
                            className="w-2/3 px-2 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                          />
                          <input
                            type="text"
                            value={editingPatient.address.zipCode}
                            onChange={(e) =>
                              setEditingPatient({
                                ...editingPatient,
                                address: { ...editingPatient.address, zipCode: e.target.value }
                              })
                            }
                            placeholder="69057-015"
                            className="w-1/3 px-2 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CONTATO DE EMERGÊNCIA */}
              {activeFormTab === 'emergencia' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#FFF5F7] p-3.5 rounded-xl border border-[#FCD6E0] text-xs text-[#8C3B50] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>
                      Contato indispensável para pronto acionamento em caso de intercorrências ou emergências de saúde durante o atendimento.
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Nome do Contato de Emergência *
                      </label>
                      <input
                        type="text"
                        value={editingPatient.emergencyContact.name}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            emergencyContact: { ...editingPatient.emergencyContact, name: e.target.value }
                          })
                        }
                        placeholder="Ex: Eduardo Vasconcelos"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Grau de Parentesco *
                      </label>
                      <input
                        type="text"
                        value={editingPatient.emergencyContact.relationship}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            emergencyContact: { ...editingPatient.emergencyContact, relationship: e.target.value }
                          })
                        }
                        placeholder="Ex: Esposo, Mãe, Pai, Irmã, Filho..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Telefone de Contato de Emergência *
                      </label>
                      <input
                        type="text"
                        value={editingPatient.emergencyContact.phone}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            emergencyContact: { ...editingPatient.emergencyContact, phone: e.target.value }
                          })
                        }
                        placeholder="Ex: (92) 98111-2233"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: HISTÓRICO DE SAÚDE E ANAMNESE */}
              {activeFormTab === 'anamnese' && (
                <div className="space-y-5 animate-fadeIn">
                  <div>
                    <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                      Objetivo Principal do Aluno/Paciente *
                    </label>
                    <textarea
                      rows={2}
                      value={editingPatient.anamnese.mainGoal}
                      onChange={(e) =>
                        setEditingPatient({
                          ...editingPatient,
                          anamnese: { ...editingPatient.anamnese, mainGoal: e.target.value }
                        })
                      }
                      placeholder="Ex: Alívio de dores na coluna lombar, flexibilidade, fortalecimento de core e melhora da postura..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    />
                  </div>

                  {/* Pratica atividade física */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-[#26161B] block">
                          Pratica alguma atividade física atualmente?
                        </span>
                        <span className="text-[11px] text-[#8C3B50]">
                          Se sim, especifique qual e a frequência semanal
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-[#26161B] cursor-pointer">
                          <input
                            type="radio"
                            name="physicalActivity"
                            checked={editingPatient.anamnese.physicalActivityCurrent}
                            onChange={() =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: { ...editingPatient.anamnese, physicalActivityCurrent: true }
                              })
                            }
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-[#26161B] cursor-pointer">
                          <input
                            type="radio"
                            name="physicalActivity"
                            checked={!editingPatient.anamnese.physicalActivityCurrent}
                            onChange={() =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: {
                                  ...editingPatient.anamnese,
                                  physicalActivityCurrent: false,
                                  physicalActivityDetails: ''
                                }
                              })
                            }
                          />
                          <span>Não (Sedentário)</span>
                        </label>
                      </div>
                    </div>
                    {editingPatient.anamnese.physicalActivityCurrent && (
                      <input
                        type="text"
                        value={editingPatient.anamnese.physicalActivityDetails || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            anamnese: { ...editingPatient.anamnese, physicalActivityDetails: e.target.value }
                          })
                        }
                        placeholder="Ex: Musculação 3x por semana, caminhadas aos sábados..."
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                      />
                    )}
                  </div>

                  {/* Lesão ou dor crônica */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-[#26161B] block">
                          Possui alguma lesão ou dor crônica?
                        </span>
                        <span className="text-[11px] text-[#8C3B50]">
                          Ex: Hérnia de disco, escoliose, dores nos joelhos, ombros, cervicalgia...
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-[#26161B] cursor-pointer">
                          <input
                            type="radio"
                            name="chronicPain"
                            checked={editingPatient.anamnese.chronicPainOrInjury}
                            onChange={() =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: { ...editingPatient.anamnese, chronicPainOrInjury: true }
                              })
                            }
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-[#26161B] cursor-pointer">
                          <input
                            type="radio"
                            name="chronicPain"
                            checked={!editingPatient.anamnese.chronicPainOrInjury}
                            onChange={() =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: {
                                  ...editingPatient.anamnese,
                                  chronicPainOrInjury: false,
                                  chronicPainDetails: ''
                                }
                              })
                            }
                          />
                          <span>Não</span>
                        </label>
                      </div>
                    </div>
                    {editingPatient.anamnese.chronicPainOrInjury && (
                      <input
                        type="text"
                        value={editingPatient.anamnese.chronicPainDetails || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            anamnese: { ...editingPatient.anamnese, chronicPainDetails: e.target.value }
                          })
                        }
                        placeholder="Descreva a lesão ou dor (ex: Hérnia discal L4-L5, tendinite no ombro direito...)"
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                      />
                    )}
                  </div>

                  {/* Cirurgias */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-semibold text-xs text-[#26161B] block">
                          Passou por alguma cirurgia recente ou antiga?
                        </span>
                        <span className="text-[11px] text-[#8C3B50]">
                          Especifique o tipo de cirurgia e há quanto tempo foi realizada
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="flex items-center gap-1.5 text-xs text-[#26161B] cursor-pointer">
                          <input
                            type="radio"
                            name="surgeries"
                            checked={editingPatient.anamnese.recentOrPastSurgeries}
                            onChange={() =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: { ...editingPatient.anamnese, recentOrPastSurgeries: true }
                              })
                            }
                          />
                          <span>Sim</span>
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-[#26161B] cursor-pointer">
                          <input
                            type="radio"
                            name="surgeries"
                            checked={!editingPatient.anamnese.recentOrPastSurgeries}
                            onChange={() =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: {
                                  ...editingPatient.anamnese,
                                  recentOrPastSurgeries: false,
                                  surgeriesDetails: ''
                                }
                              })
                            }
                          />
                          <span>Não</span>
                        </label>
                      </div>
                    </div>
                    {editingPatient.anamnese.recentOrPastSurgeries && (
                      <input
                        type="text"
                        value={editingPatient.anamnese.surgeriesDetails || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            anamnese: { ...editingPatient.anamnese, surgeriesDetails: e.target.value }
                          })
                        }
                        placeholder="Ex: Artroscopia joelho direito há 6 meses..."
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                      />
                    )}
                  </div>

                  {/* Pressão / Cardíaco & Medicamentos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-2">
                      <label className="block text-xs font-semibold text-[#26161B]">
                        Problema Cardíaco ou de Pressão (alta/baixa)?
                      </label>
                      <select
                        value={editingPatient.anamnese.cardiacOrBloodPressure}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            anamnese: { ...editingPatient.anamnese, cardiacOrBloodPressure: e.target.value as any }
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                      >
                        <option value="normal">Normal (Sem problemas)</option>
                        <option value="hipertensao">Hipertensão (Pressão Alta)</option>
                        <option value="hipotensao">Hipotensão (Pressão Baixa)</option>
                        <option value="arritmia">Arritmia Cardíaca</option>
                        <option value="outro">Outro</option>
                      </select>
                      {editingPatient.anamnese.cardiacOrBloodPressure !== 'normal' && (
                        <input
                          type="text"
                          value={editingPatient.anamnese.cardiacDetails || ''}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              anamnese: { ...editingPatient.anamnese, cardiacDetails: e.target.value }
                            })
                          }
                          placeholder="Detalhes ou cuidados necessários..."
                          className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      )}
                    </div>

                    <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#26161B]">
                          Medicamento de uso contínuo?
                        </label>
                        <input
                          type="checkbox"
                          checked={editingPatient.anamnese.continuousMedication}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              anamnese: { ...editingPatient.anamnese, continuousMedication: e.target.checked }
                            })
                          }
                          className="w-4 h-4 text-[#D85072]"
                        />
                      </div>
                      {editingPatient.anamnese.continuousMedication && (
                        <input
                          type="text"
                          value={editingPatient.anamnese.medicationDetails || ''}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              anamnese: { ...editingPatient.anamnese, medicationDetails: e.target.value }
                            })
                          }
                          placeholder="Qual medicamento e dosagem diária?"
                          className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Tonturas / Labirintite & Gestante */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#26161B]">
                          Apresenta tonturas, vertigens ou labirintite?
                        </label>
                        <input
                          type="checkbox"
                          checked={editingPatient.anamnese.dizzinessOrVertigo}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              anamnese: { ...editingPatient.anamnese, dizzinessOrVertigo: e.target.checked }
                            })
                          }
                          className="w-4 h-4 text-[#D85072]"
                        />
                      </div>
                      {editingPatient.anamnese.dizzinessOrVertigo && (
                        <input
                          type="text"
                          value={editingPatient.anamnese.dizzinessDetails || ''}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              anamnese: { ...editingPatient.anamnese, dizzinessDetails: e.target.value }
                            })
                          }
                          placeholder="Frequência de crises ou posições que causam tontura..."
                          className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B]"
                        />
                      )}
                    </div>

                    <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-[#26161B]">
                          No caso de alunas: Está gestante?
                        </label>
                        <input
                          type="checkbox"
                          checked={editingPatient.anamnese.isPregnant}
                          onChange={(e) =>
                            setEditingPatient({
                              ...editingPatient,
                              anamnese: { ...editingPatient.anamnese, isPregnant: e.target.checked }
                            })
                          }
                          className="w-4 h-4 text-[#D85072]"
                        />
                      </div>
                      {editingPatient.anamnese.isPregnant && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#5B444C]">Quantas semanas?</span>
                          <input
                            type="number"
                            min="1"
                            max="42"
                            value={editingPatient.anamnese.gestationalWeeks || ''}
                            onChange={(e) =>
                              setEditingPatient({
                                ...editingPatient,
                                anamnese: {
                                  ...editingPatient.anamnese,
                                  gestationalWeeks: e.target.value ? parseInt(e.target.value) : undefined
                                }
                              })
                            }
                            placeholder="Semanas"
                            className="w-24 px-3 py-1.5 rounded-lg border border-[#FCD6E0] text-xs text-[#26161B]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Observações Adicionais */}
                  <div>
                    <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                      Observações Clínicas e Orientações da Fisioterapeuta
                    </label>
                    <textarea
                      rows={2}
                      value={editingPatient.anamnese.additionalNotes || ''}
                      onChange={(e) =>
                        setEditingPatient({
                          ...editingPatient,
                          anamnese: { ...editingPatient.anamnese, additionalNotes: e.target.value }
                        })
                      }
                      placeholder="Anotações de evolução, restrições biomecânicas ou recomendações de exercícios..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 4: INFORMAÇÕES MÉDICAS COMPLEMENTARES & LAUDOS */}
              {activeFormTab === 'medico' && (
                <div className="space-y-5 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Médico / Ortopedista / Fisioterapeuta
                      </label>
                      <input
                        type="text"
                        value={editingPatient.medicalInfo.doctorName || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            medicalInfo: { ...editingPatient.medicalInfo, doctorName: e.target.value }
                          })
                        }
                        placeholder="Nome do profissional que acompanha"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Especialidade Médica
                      </label>
                      <input
                        type="text"
                        value={editingPatient.medicalInfo.doctorSpecialty || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            medicalInfo: { ...editingPatient.medicalInfo, doctorSpecialty: e.target.value }
                          })
                        }
                        placeholder="Ex: Ortopedista de Coluna, Cirurgião..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-1.5">
                        Telefone do Médico
                      </label>
                      <input
                        type="text"
                        value={editingPatient.medicalInfo.doctorPhone || ''}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            medicalInfo: { ...editingPatient.medicalInfo, doctorPhone: e.target.value }
                          })
                        }
                        placeholder="(92) 3642-8800"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>
                  </div>

                  {/* Espaço para anexar laudos ou exames (ressonâncias, raio-x, tomografias) */}
                  <div className="bg-[#FFFDFB] p-4 sm:p-5 rounded-2xl border border-[#FCD6E0] space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-sm font-bold text-[#26161B]">
                          Espaço para Anexar Laudos e Exames
                        </h4>
                        <p className="text-xs text-[#8C3B50]">
                          Ressonâncias magnéticas, Raios-X, tomografias, relatórios de liberação médica
                        </p>
                      </div>
                    </div>

                    {/* Add new attachment form */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-[#FFF5F7] p-3.5 rounded-xl border border-[#FCD6E0]">
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                          Nome do Arquivo / Exame
                        </label>
                        <input
                          type="text"
                          value={newAttachmentName}
                          onChange={(e) => setNewAttachmentName(e.target.value)}
                          placeholder="Ex: Ressonancia_Lombar_2026.pdf"
                          className="w-full px-3 py-2 rounded-lg border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                          Tipo de Exame
                        </label>
                        <select
                          value={newAttachmentType}
                          onChange={(e) => setNewAttachmentType(e.target.value as any)}
                          className="w-full px-3 py-2 rounded-lg border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                        >
                          <option value="Ressonância">Ressonância Magnética</option>
                          <option value="Raio-X">Raio-X</option>
                          <option value="Tomografia">Tomografia Computadorizada</option>
                          <option value="Ultrassonografia">Ultrassonografia</option>
                          <option value="Laudo Médico">Laudo Médico / Liberação</option>
                          <option value="Outro">Outro</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                          Conclusão / Notas
                        </label>
                        <input
                          type="text"
                          value={newAttachmentNotes}
                          onChange={(e) => setNewAttachmentNotes(e.target.value)}
                          placeholder="Ex: Protrusão L4-L5 leve"
                          className="w-full px-3 py-2 rounded-lg border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                        />
                      </div>

                      <div className="sm:col-span-2 flex items-end">
                        <button
                          type="button"
                          onClick={handleAddAttachment}
                          className="w-full py-2 px-3 rounded-lg bg-[#D85072] text-white font-semibold text-xs hover:bg-[#BC3859] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <Paperclip className="w-3.5 h-3.5" />
                          <span>Anexar</span>
                        </button>
                      </div>
                    </div>

                    {/* List of attachments */}
                    <div className="space-y-2">
                      {(editingPatient.medicalInfo.examAttachments || []).length === 0 ? (
                        <p className="text-xs text-[#A8928B] italic py-2">
                          Nenhum exame ou laudo anexado a este prontuário ainda.
                        </p>
                      ) : (
                        editingPatient.medicalInfo.examAttachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#FCD6E0] text-xs"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 rounded-lg bg-[#FFEBF0] text-[#D85072]">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div>
                                <span className="font-semibold text-[#26161B] block">{att.name}</span>
                                <span className="text-[#8C3B50] text-[11px]">
                                  [{att.type}] • Data: {att.date} {att.notes ? `• ${att.notes}` : ''}
                                </span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveAttachment(att.id)}
                              className="p-1.5 text-[#A8928B] hover:text-[#9C2744] hover:bg-[#FDEDF0] rounded-lg transition-colors cursor-pointer"
                              title="Remover anexo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: TERMOS E AUTORIZAÇÕES (LGPD / COFFITO) */}
              {activeFormTab === 'termos' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-[#FFF5F7] p-3.5 rounded-xl border border-[#FCD6E0] text-xs text-[#8C3B50]">
                    <strong>Termos e Autorizações Conforme Legislação Vigente:</strong> Cumprimento integral da LGPD (Lei nº 13.709/2018), Código Civil Brasileiro e Resoluções COFFITO.
                  </div>

                  {/* a) Termo de consentimento e responsabilidade */}
                  <div className="p-4 rounded-2xl border border-[#FCD6E0] bg-[#FFFDFB] space-y-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="consent-check"
                        checked={editingPatient.terms.consentAccepted}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            terms: {
                              ...editingPatient.terms,
                              consentAccepted: e.target.checked,
                              consentSignedAt: e.target.checked ? new Date().toISOString() : undefined,
                              consentSignatureName: e.target.checked
                                ? editingPatient.fullName || editingPatient.terms.consentSignatureName
                                : ''
                            }
                          })
                        }
                        className="w-4 h-4 text-[#D85072] mt-0.5 rounded cursor-pointer"
                      />
                      <label htmlFor="consent-check" className="text-xs text-[#26161B] leading-relaxed cursor-pointer">
                        <strong>a) Termo de Consentimento e Responsabilidade (Assinatura Digital):</strong>
                        <p className="text-[#5B444C] mt-0.5">
                          Atesto expressamente que todas as informações de saúde prestadas nesta ficha de anamnese são verdadeiras e completas, não omitindo histórico de cirurgias, dores, medicamentos ou contraindicações médicas.
                        </p>
                      </label>
                    </div>

                    {editingPatient.terms.consentAccepted && (
                      <div className="pt-2 pl-7 flex flex-wrap items-center gap-4 text-xs text-[#1D7A46]">
                        <span>✓ Assinado digitalmente por: <strong>{editingPatient.terms.consentSignatureName || editingPatient.fullName}</strong></span>
                        <span className="text-[#A8928B]">Registro: {new Date(editingPatient.terms.consentSignedAt || Date.now()).toLocaleDateString('pt-BR')}</span>
                      </div>
                    )}
                  </div>

                  {/* c) Autorização de uso de imagem */}
                  <div className="p-4 rounded-2xl border border-[#FCD6E0] bg-[#FFFDFB] space-y-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="image-check"
                        checked={editingPatient.terms.imageUsageAuthorized}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            terms: {
                              ...editingPatient.terms,
                              imageUsageAuthorized: e.target.checked,
                              imageUsageSignedAt: e.target.checked ? new Date().toISOString() : undefined
                            }
                          })
                        }
                        className="w-4 h-4 text-[#D85072] mt-0.5 rounded cursor-pointer"
                      />
                      <label htmlFor="image-check" className="text-xs text-[#26161B] leading-relaxed cursor-pointer">
                        <strong>c) Autorização de Uso de Imagem (Opcional):</strong>
                        <p className="text-[#5B444C] mt-0.5">
                          Autorizo o uso de fotos e vídeos de exercícios realizados nas dependências do estúdio para fins de divulgação pedagógica, institucional e redes sociais do Studio Dra. Léia Mar.
                        </p>
                      </label>
                    </div>
                  </div>

                  {/* d) Termo de ciência da política de desmarques e reposições */}
                  <div className="p-4 rounded-2xl border border-[#FCD6E0] bg-[#FFFDFB] space-y-2">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="cancel-check"
                        checked={editingPatient.terms.cancellationPolicyAccepted}
                        onChange={(e) =>
                          setEditingPatient({
                            ...editingPatient,
                            terms: {
                              ...editingPatient.terms,
                              cancellationPolicyAccepted: e.target.checked,
                              cancellationPolicySignedAt: e.target.checked ? new Date().toISOString() : undefined
                            }
                          })
                        }
                        className="w-4 h-4 text-[#D85072] mt-0.5 rounded cursor-pointer"
                      />
                      <label htmlFor="cancel-check" className="text-xs text-[#26161B] leading-relaxed cursor-pointer">
                        <strong>d) Termo de Ciência da Política de Desmarques e Reposições:</strong>
                        <p className="text-[#5B444C] mt-0.5">
                          Declaro ciência de que desmarcações de aulas devem ser avisadas com antecedência mínima de 24 horas para que haja direito à reposição dentro da vigência do plano contratado, respeitando as vagas disponíveis.
                        </p>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Modal footer action buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-xs font-semibold text-[#5B444C] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <div className="flex items-center gap-2.5">
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] text-white text-xs sm:text-sm font-semibold shadow-md transition-all cursor-pointer"
                  >
                    Salvar Prontuário
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: EMISSÃO DE DECLARAÇÃO DE COMPARECIMENTO (ITEM E)           */}
      {/* =================================================================== */}
      {isDeclarationModalOpen && declarationPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#FFFDFB] text-[#26161B] max-w-2xl w-full rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-[#FCD6E0] shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#FCD6E0]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#FFEBF0] text-[#D85072]">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-[#26161B]">
                    Declaração de Comparecimento
                  </h3>
                  <p className="text-xs text-[#8C3B50]">
                    Emissão rápida timbrada para comprovação de presença / trabalho
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsDeclarationModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FFEBF0] text-[#8C3B50]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              <div className="bg-[#FFF5F7] p-3.5 rounded-xl border border-[#FCD6E0] space-y-1">
                <span className="font-bold text-[#8C3B50] uppercase tracking-wider block text-[10px]">
                  Paciente / Aluno(a) Selecionado(a)
                </span>
                <p className="text-sm font-bold text-[#26161B]">{declarationPatient.fullName}</p>
                <p className="text-[#5B444C]">
                  CPF: {declarationPatient.cpf || 'Não informado'} • RG: {declarationPatient.rg || 'Não informado'} • Prontuário: {declarationPatient.registrationNumber}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Data do Atendimento
                  </label>
                  <input
                    type="date"
                    value={declarationDate}
                    onChange={(e) => setDeclarationDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Horário Início
                  </label>
                  <input
                    type="time"
                    value={declarationStartTime}
                    onChange={(e) => setDeclarationStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Horário Término
                  </label>
                  <input
                    type="time"
                    value={declarationEndTime}
                    onChange={(e) => setDeclarationEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                  Finalidade / Procedimento Realizado
                </label>
                <textarea
                  rows={2}
                  value={declarationPurpose}
                  onChange={(e) => setDeclarationPurpose(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Profissional Emitente
                  </label>
                  <input
                    type="text"
                    value={declarationProfessional}
                    onChange={(e) => setDeclarationProfessional(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    CREFITO
                  </label>
                  <input
                    type="text"
                    value={declarationCrefito}
                    onChange={(e) => setDeclarationCrefito(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white"
                  />
                </div>
              </div>

              {/* Preview preview card */}
              <div className="bg-white p-4 rounded-xl border border-[#D85072]/30 shadow-inner text-[11px] space-y-2 text-[#444]">
                <p className="font-bold text-[#8C3B50] uppercase text-center text-xs">
                  Dra. Léia Mar • Fisioterapia & Studio de Pilates
                </p>
                <p className="text-center font-bold text-sm text-[#26161B] tracking-wider">
                  DECLARAÇÃO DE COMPARECIMENTO
                </p>
                <p className="text-justify leading-relaxed text-[#222]">
                  Declaro que o(a) paciente/aluno(a) <strong>{declarationPatient.fullName}</strong> compareceu a este estabelecimento no dia <strong>{declarationDate.split('-').reverse().join('/')}</strong>, das <strong>{declarationStartTime}</strong> às <strong>{declarationEndTime}</strong>, para <strong>{declarationPurpose}</strong>.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => setIsDeclarationModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-xs font-semibold text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                >
                  Fechar
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportDeclarationXLS}
                    className="px-3.5 py-2.5 rounded-xl bg-[#EBF7EE] hover:bg-[#D5EEDC] text-[#1D7A46] border border-[#B6E3C3] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                    <span>Baixar XLS</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportDeclarationPDF}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FFEBF0] hover:bg-[#FCD6E0] text-[#9C2744] border border-[#FCD6E0] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-[#D85072]" />
                    <span>Baixar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintDeclaration}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white text-xs sm:text-sm font-semibold shadow-md hover:from-[#BC3859] transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Relatório em Tela (Visual)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2B: DECLARAÇÃO DE COMPARECIMENTO EM TELA (LAYOUT VISUAL)      */}
      {/* Sem opção para IMPRIMIR, prevalecendo somente Baixar XLS e PDF      */}
      {/* =================================================================== */}
      {isDeclarationVisualOpen && declarationPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsDeclarationVisualOpen(false)}
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
                    Visualização do Relatório em Tela — Declaração de Comparecimento
                  </h3>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Confira a diagramação oficial em tela. Utilize as opções ao lado para Baixar XLS ou Baixar PDF.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleExportDeclarationXLS}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                  <span>Baixar XLS</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportDeclarationPDF}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#9C2744] bg-white hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#D85072]" />
                  <span>Baixar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsDeclarationVisualOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Paper Preview */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#2A141A]/50 flex justify-center">
              <div className="w-full max-w-4xl bg-white text-[#26161B] rounded-2xl shadow-2xl p-6 sm:p-10 border border-[#E5E7EB]">
                {/* Official Clinic Letterhead */}
                <div className="bg-[#8C3B50] text-white p-5 rounded-xl mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight">
                      Dra. Léia Mar — Fisioterapia & Pilates
                    </h1>
                    <p className="text-xs text-rose-100 mt-1">
                      CREFITO: {declarationCrefito || clinic.crefito} • WhatsApp: {clinic.phoneDisplay} • {clinic.address}, {clinic.neighborhood} - {clinic.cityState}
                    </p>
                  </div>
                  <div className="text-right text-xs text-rose-200">
                    <span className="font-bold text-white block">Documento Oficial</span>
                    <span>{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b-2 border-[#FCD6E0] gap-2">
                  <div>
                    <h2 className="font-serif text-lg sm:text-xl font-bold text-[#26161B]">
                      DECLARAÇÃO DE COMPARECIMENTO
                    </h2>
                    <p className="text-xs text-[#5B444C]">
                      Prontuário nº {declarationPatient.registrationNumber} • Paciente: {declarationPatient.fullName}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] w-fit">
                    Histórico Clínico & Secretária
                  </span>
                </div>

                {/* Declaration Content */}
                <div className="p-6 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] text-sm leading-relaxed text-[#26161B] space-y-4 mb-6">
                  <p className="text-justify">
                    Declaro, para os devidos fins de comprovação junto ao empregador, instituição de ensino ou órgão competente, que o(a) paciente/aluno(a){' '}
                    <strong className="text-[#9C2744]">{declarationPatient.fullName}</strong>, inscrito(a) no CPF sob o nº{' '}
                    <strong>{declarationPatient.cpf || 'Não informado'}</strong> e RG nº{' '}
                    <strong>{declarationPatient.rg || 'Não informado'}</strong>, esteve presente neste estabelecimento de saúde no dia{' '}
                    <strong>{declarationDate.split('-').reverse().join('/')}</strong>, no período das{' '}
                    <strong>{declarationStartTime}</strong> às <strong>{declarationEndTime}</strong>, para realização de{' '}
                    <strong>{declarationPurpose}</strong>.
                  </p>
                </div>

                {/* Summary Table */}
                <table className="w-full text-left text-xs border-collapse mb-10">
                  <thead>
                    <tr className="bg-[#8C3B50] text-white">
                      <th className="p-2.5 font-bold">Campo de Identificação</th>
                      <th className="p-2.5 font-bold">Informação Registrada</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="bg-white">
                      <td className="p-2.5 border-b border-[#FCD6E0]/60 font-bold w-1/3">Nº do Prontuário</td>
                      <td className="p-2.5 border-b border-[#FCD6E0]/60">{declarationPatient.registrationNumber}</td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 border-b border-[#FCD6E0]/60 font-bold">Paciente / Aluno(a)</td>
                      <td className="p-2.5 border-b border-[#FCD6E0]/60 font-semibold">{declarationPatient.fullName}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 border-b border-[#FCD6E0]/60 font-bold">Data e Horário</td>
                      <td className="p-2.5 border-b border-[#FCD6E0]/60">
                        {declarationDate.split('-').reverse().join('/')} • Das {declarationStartTime} às {declarationEndTime}
                      </td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 border-b border-[#FCD6E0]/60 font-bold">Profissional Emitente</td>
                      <td className="p-2.5 border-b border-[#FCD6E0]/60">
                        {declarationProfessional} — CREFITO {declarationCrefito}
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Footer of Document */}
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
                onClick={() => setIsDeclarationVisualOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2C: EMISSÃO DE RECIBO DE PAGAMENTO DO ALUNO(A) (ITEM B)        */}
      {/* Respalda o pagamento realizado pelo aluno(a) conforme a LEI         */}
      {/* =================================================================== */}
      {isReceiptModalOpen && receiptPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-[#FFFDFB] text-[#26161B] max-w-3xl w-full rounded-3xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto border border-[#FCD6E0] shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-[#FCD6E0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-[#FFEBF0] text-[#D85072]">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-xl font-bold text-[#26161B]">
                      Recibo de Pagamento do Aluno(a)
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]">
                      Conforme a LEI
                    </span>
                  </div>
                  <p className="text-xs text-[#8C3B50]">
                    Registro válido para respaldar o pagamento do aluno(a) • Art. 320 do Código Civil & Lei 8.846/94 (Apto para IRPF)
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-[#FFEBF0] text-[#8C3B50] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 pt-4 text-xs">
              {/* Aluno Identificação Card */}
              <div className="bg-[#FFF5F7] p-4 rounded-2xl border border-[#FCD6E0] space-y-1.5">
                <span className="font-bold text-[#8C3B50] uppercase tracking-wider block text-[10px]">
                  Aluno(a) / Pagador Identificado
                </span>
                <p className="text-sm font-bold text-[#26161B]">{receiptPatient.fullName}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#5B444C]">
                  <span>
                    <strong>CPF:</strong>{' '}
                    <span className={receiptPatient.cpf ? 'font-semibold text-[#26161B]' : 'text-amber-700 italic'}>
                      {receiptPatient.cpf || 'Não informado (solicitar para IRPF)'}
                    </span>
                  </span>
                  <span>
                    <strong>RG:</strong> {receiptPatient.rg || 'Não informado'}
                  </span>
                  <span>
                    <strong>Prontuário:</strong> {receiptPatient.registrationNumber}
                  </span>
                </div>
                <p className="text-[11px] text-[#5B444C]">
                  <strong>Endereço:</strong> {receiptPatient.address.street} {receiptPatient.address.number || 'S/N'}, {receiptPatient.address.neighborhood} - {receiptPatient.address.city}/{receiptPatient.address.state}
                </p>
              </div>

              {/* Grid de Configuração do Pagamento */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Valor do Pagamento */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Valor Recebido (R$) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-xs font-bold text-[#8C3B50]">R$</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={receiptValue}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        setReceiptValue(val);
                        setReceiptValueInWords(numeroPorExtensoBRL(val));
                      }}
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-bold text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                    />
                  </div>
                </div>

                {/* Competência / Mês */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Mês de Competência *
                  </label>
                  <input
                    type="text"
                    value={receiptCompetence}
                    onChange={(e) => setReceiptCompetence(e.target.value)}
                    placeholder="Ex: 10/2026"
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs font-semibold text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                  />
                </div>

                {/* Data do Pagamento */}
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Data da Quitação *
                  </label>
                  <input
                    type="date"
                    value={receiptPaymentDate}
                    onChange={(e) => setReceiptPaymentDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                  />
                </div>
              </div>

              {/* Botões Rápidos de Valor */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] font-bold text-[#8C3B50] uppercase mr-1">Valores Rápidos:</span>
                {[150, 250, 350, 480, 600].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => {
                      setReceiptValue(v);
                      setReceiptValueInWords(numeroPorExtensoBRL(v));
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer border ${
                      receiptValue === v
                        ? 'bg-[#D85072] text-white border-[#D85072]'
                        : 'bg-[#FFFDFB] text-[#5B444C] border-[#FCD6E0] hover:bg-[#FFEBF0]'
                    }`}
                  >
                    R$ {v},00
                  </button>
                ))}
              </div>

              {/* Valor por extenso */}
              <div>
                <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                  Valor por Extenso (Exigência do Código Civil Art. 320)
                </label>
                <input
                  type="text"
                  value={receiptValueInWords}
                  onChange={(e) => setReceiptValueInWords(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#5B444C] bg-[#FFF9F7] font-medium"
                />
              </div>

              {/* Forma de Pagamento e Descrição */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Forma de Pagamento *
                  </label>
                  <select
                    value={receiptPaymentMethod}
                    onChange={(e) => setReceiptPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                  >
                    <option value="PIX">PIX</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Cartão de Débito">Cartão de Débito</option>
                    <option value="Dinheiro em Espécie">Dinheiro em Espécie</option>
                    <option value="Transferência Bancária (TED/DOC)">Transferência Bancária</option>
                    <option value="Boleto Bancário">Boleto Bancário</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                    Profissional Emitente & CREFITO
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={receiptProfessional}
                      onChange={(e) => setReceiptProfessional(e.target.value)}
                      placeholder="Nome da Profissional"
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                    />
                    <input
                      type="text"
                      value={receiptCrefito}
                      onChange={(e) => setReceiptCrefito(e.target.value)}
                      placeholder="CREFITO"
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                    />
                  </div>
                </div>
              </div>

              {/* Descrição dos Serviços Prestados */}
              <div>
                <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                  Discriminação dos Serviços Prestados *
                </label>
                <textarea
                  rows={2}
                  value={receiptServiceDesc}
                  onChange={(e) => setReceiptServiceDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#26161B] bg-white focus:outline-none focus:border-[#D85072]"
                />
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="text-[10px] text-[#8C3B50] font-semibold">Exemplos Rápidos:</span>
                  {[
                    'Mensalidade Pilates (2x/sem)',
                    'Mensalidade Pilates (3x/sem)',
                    'Sessão Avulsa Fisioterapia',
                    'Plano Trimestral Pilates',
                    'Avaliação Postural Global'
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setReceiptServiceDesc(preset)}
                      className="px-2 py-0.5 rounded text-[10px] bg-[#FFEBF0] text-[#9C2744] hover:bg-[#FCD6E0] transition-colors cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Observações / Fundamento Legal */}
              <div>
                <label className="block text-[11px] font-semibold text-[#26161B] mb-1">
                  Fundamento Legal & Observações Contábeis
                </label>
                <input
                  type="text"
                  value={receiptObs}
                  onChange={(e) => setReceiptObs(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] text-xs text-[#5B444C] bg-white"
                />
              </div>

              {/* Preview Box do Recibo */}
              <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#D85072]/30 shadow-inner text-[11px] space-y-2">
                <div className="flex items-center justify-between border-b border-[#FCD6E0] pb-2">
                  <span className="font-bold text-[#8C3B50] uppercase text-[10px]">
                    Dra. Léia Mar • Studio de Fisioterapia & Pilates
                  </span>
                  <span className="font-bold text-[#1D7A46] bg-[#EBF7EE] px-2 py-0.5 rounded-full text-[10px]">
                    Quitação Válida
                  </span>
                </div>
                <div className="text-center py-1">
                  <p className="font-serif font-bold text-sm text-[#26161B]">
                    RECIBO DE PAGAMENTO DE SERVIÇOS DE SAÚDE
                  </p>
                  <p className="text-[10px] text-[#8C3B50]">
                    Nº REC-{receiptCompetence.replace('/', '')}-
                    {receiptPatient.registrationNumber.replace(/[^0-9]/g, '').slice(-3) || '001'} • Valor: R$ {receiptValue.toFixed(2)} ({receiptValueInWords})
                  </p>
                </div>
                <p className="text-justify leading-relaxed text-[#26161B]">
                  Recebi(emos) de <strong>{receiptPatient.fullName}</strong>, CPF nº{' '}
                  <strong>{receiptPatient.cpf || 'Não informado'}</strong>, a importância de{' '}
                  <strong className="text-[#9C2744]">R$ {receiptValue.toFixed(2)} ({receiptValueInWords})</strong>, referente a{' '}
                  <strong>{receiptServiceDesc}</strong>, na modalidade <strong>{receiptPaymentMethod}</strong>, conferindo plena e irrevogável quitação.
                </p>
                <div className="pt-2 border-t border-[#FCD6E0]/60 flex items-center justify-between text-[10px] text-[#8C3B50]">
                  <span>Válido conforme Art. 320 do Código Civil e Lei nº 8.846/94</span>
                  <span>{receiptProfessional} (CREFITO: {receiptCrefito})</span>
                </div>
              </div>

              {/* Botões do Modal */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => setIsReceiptModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-xs font-semibold text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                >
                  Fechar
                </button>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyReceiptText}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FFF9F7] hover:bg-[#FFEBF0] text-[#8C3B50] border border-[#FCD6E0] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    title="Copiar texto formal com formatação para WhatsApp"
                  >
                    <span>Copiar WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportReceiptXLS}
                    className="px-3.5 py-2.5 rounded-xl bg-[#EBF7EE] hover:bg-[#D5EEDC] text-[#1D7A46] border border-[#B6E3C3] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Baixar planilha de comprovante em Excel"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                    <span>Baixar XLS</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleExportReceiptPDF}
                    className="px-3.5 py-2.5 rounded-xl bg-[#FFEBF0] hover:bg-[#FCD6E0] text-[#9C2744] border border-[#FCD6E0] text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Baixar recibo timbrado oficial em PDF com assinatura"
                  >
                    <FileText className="w-4 h-4 text-[#D85072]" />
                    <span>Baixar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white text-xs sm:text-sm font-semibold shadow-md hover:from-[#BC3859] transition-all flex items-center gap-2 cursor-pointer"
                    title="Visualizar documento timbrado completo em tela com opção de impressão"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Recibo em Tela (Visual)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2D: RECIBO DE PAGAMENTO EM TELA (LAYOUT VISUAL TIMBRADO)       */}
      {/* =================================================================== */}
      {isReceiptVisualOpen && receiptPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsReceiptVisualOpen(false)}
        >
          <div
            className="bg-[#3D232B] text-white rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl border border-[#FCD6E0]/30 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header / Toolbar */}
            <div className="p-4 sm:p-5 bg-[#2B151C] border-b border-[#FCD6E0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-[#D85072]" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Recibo Oficial de Pagamento em Tela — Respaldo Legal
                  </h3>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Documento com validade jurídica emitido nos termos do Art. 320 do Código Civil e Lei 8.846/94
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleCopyReceiptText}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-200 bg-white/10 hover:bg-white/20 transition-colors cursor-pointer shadow-xs"
                  title="Copiar texto para WhatsApp"
                >
                  <span>Copiar WhatsApp</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportReceiptXLS}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                  <span>Baixar XLS</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportReceiptPDF}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#9C2744] bg-white hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#D85072]" />
                  <span>Baixar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] transition-all cursor-pointer shadow-xs"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Imprimir Recibo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReceiptVisualOpen(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-rose-200 hover:text-white transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Content View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#2A161D] flex justify-center">
              <div className="bg-[#FFFDFB] text-[#26161B] max-w-4xl w-full rounded-2xl shadow-xl border border-[#FCD6E0] p-6 sm:p-10 relative">
                {/* Header Timbrado */}
                <div className="bg-[#8C3B50] text-white p-6 rounded-2xl mb-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div>
                      <h1 className="font-serif text-2xl font-bold tracking-tight">
                        Dra. Léia Mar — Fisioterapia & Pilates
                      </h1>
                      <p className="text-xs text-rose-100 font-semibold uppercase tracking-wider mt-1">
                        Studio de Reabilitação Postural & Movimento • CREFITO: {receiptCrefito}
                      </p>
                    </div>
                    <div className="text-xs text-rose-100 text-center sm:text-right space-y-0.5">
                      <p className="font-semibold">{clinic.address}</p>
                      <p>{clinic.neighborhood} — {clinic.cityState}</p>
                      <p>WhatsApp: {clinic.phoneDisplay}</p>
                    </div>
                  </div>
                </div>

                {/* Receipt Title Box */}
                <div className="bg-[#FFF5F7] border border-[#FCD6E0] rounded-2xl p-5 mb-6 text-center space-y-1">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]">
                    Comprovante de Quitação • Eficácia Probatória Lei 8.846/94
                  </span>
                  <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#9C2744] tracking-wide pt-1">
                    RECIBO DE PAGAMENTO DE SERVIÇOS DE SAÚDE
                  </h2>
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#5B444C] pt-2">
                    <span>
                      Nº Registro:{' '}
                      <strong className="text-[#26161B]">
                        REC-{receiptCompetence.replace('/', '')}-
                        {receiptPatient.registrationNumber.replace(/[^0-9]/g, '').slice(-3) || '001'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span>
                      Competência: <strong className="text-[#26161B]">{receiptCompetence}</strong>
                    </span>
                    <span>•</span>
                    <span className="text-sm text-[#1D7A46] font-bold">
                      Valor: R$ {receiptValue.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Receipt Body Declaration */}
                <div className="p-6 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] text-sm leading-relaxed text-[#26161B] space-y-4 mb-6 shadow-2xs">
                  <p className="text-justify leading-relaxed">
                    Recebi(emos) de{' '}
                    <strong className="text-[#9C2744] uppercase">{receiptPatient.fullName}</strong>, inscrito(a) no CPF
                    sob o nº <strong>{receiptPatient.cpf || 'Não informado'}</strong> e RG nº{' '}
                    <strong>{receiptPatient.rg || 'Não informado'}</strong>, residente e domiciliado(a) em{' '}
                    <strong>
                      {receiptPatient.address.street} {receiptPatient.address.number || 'S/N'},{' '}
                      {receiptPatient.address.neighborhood} - {receiptPatient.address.city}/{receiptPatient.address.state}
                    </strong>
                    , a quantia líquida de{' '}
                    <strong className="text-[#9C2744]">
                      R$ {receiptValue.toFixed(2)} ({receiptValueInWords})
                    </strong>
                    , referente à prestação de serviços de{' '}
                    <strong className="text-[#26161B]">{receiptServiceDesc}</strong>, relativa ao mês de competência{' '}
                    <strong>{receiptCompetence}</strong>, quitada por meio de{' '}
                    <strong>{receiptPaymentMethod.toUpperCase()}</strong> na data de{' '}
                    <strong>{receiptPaymentDate.split('-').reverse().join('/')}</strong>, pelo que firmo(amos) o presente
                    recibo dando plena, geral, rasa e irrevogável quitação da quantia recebida.
                  </p>
                </div>

                {/* Breakdown Table */}
                <table className="w-full text-left text-xs border-collapse mb-6 shadow-2xs rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-[#8C3B50] text-white">
                      <th className="p-2.5 font-bold">Discriminação Contábil & Fiscal</th>
                      <th className="p-2.5 font-bold">Informação Registrada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FCD6E0]/60">
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-[#8C3B50] w-1/3">Nº do Recibo de Quitação</td>
                      <td className="p-2.5 font-semibold">
                        REC-{receiptCompetence.replace('/', '')}-
                        {receiptPatient.registrationNumber.replace(/[^0-9]/g, '').slice(-3) || '001'}
                      </td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Aluno(a) / Pagador</td>
                      <td className="p-2.5 font-semibold text-[#26161B]">{receiptPatient.fullName}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-[#8C3B50]">CPF do Pagador (Obrigatório IRPF)</td>
                      <td className="p-2.5">{receiptPatient.cpf || 'Não informado'}</td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Serviço Prestado</td>
                      <td className="p-2.5">{receiptServiceDesc}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Mês de Competência</td>
                      <td className="p-2.5">{receiptCompetence}</td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Modalidade de Pagamento</td>
                      <td className="p-2.5 font-semibold text-[#26161B]">{receiptPaymentMethod}</td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Data Efetiva da Quitação</td>
                      <td className="p-2.5">{receiptPaymentDate.split('-').reverse().join('/')}</td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Profissional Responsável</td>
                      <td className="p-2.5">
                        {receiptProfessional} (Fisioterapeuta • CREFITO: {receiptCrefito})
                      </td>
                    </tr>
                    <tr className="bg-white">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Valor Quitado (Moeda Corrente)</td>
                      <td className="p-2.5 font-bold text-[#1D7A46]">
                        R$ {receiptValue.toFixed(2)} ({receiptValueInWords})
                      </td>
                    </tr>
                    <tr className="bg-[#FFF8FA]">
                      <td className="p-2.5 font-bold text-[#8C3B50]">Fundamentação Legal</td>
                      <td className="p-2.5 text-[11px] text-[#5B444C]">
                        Artigo 320 da Lei nº 10.406/2002 (Código Civil Brasileiro) e Lei nº 8.846/1994.
                      </td>
                    </tr>
                  </tbody>
                </table>

                {/* Legal Note Box */}
                <div className="p-3.5 rounded-xl bg-[#EBF7EE]/60 border border-[#B6E3C3] text-center text-xs text-[#1D7A46] mb-8">
                  <p className="font-semibold">
                    Documento emitido com plena eficácia jurídica para fins de comprovação legal de despesas de saúde e dedução no Imposto de Renda Pessoa Física (IRPF - Receita Federal do Brasil).
                  </p>
                </div>

                {/* Date & Signature */}
                <div className="text-center pt-2">
                  <p className="text-xs text-[#5B444C] mb-8">
                    Manaus - AM, {receiptPaymentDate.split('-').reverse().join('/')}.
                  </p>
                  <div className="max-w-xs mx-auto border-t border-[#26161B] pt-2">
                    <p className="font-serif font-bold text-sm text-[#26161B]">{receiptProfessional}</p>
                    <p className="text-xs text-[#8C3B50]">Fisioterapeuta • CREFITO: {receiptCrefito}</p>
                    <p className="text-[10px] text-[#5B444C]">Studio de Fisioterapia & Pilates Dra. Léia Mar</p>
                  </div>
                </div>

                {/* Document Footer */}
                <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#5B444C] gap-2">
                  <span>Recibo oficial gerado em tela com validade jurídica • Sistema Dra. Léia Mar</span>
                  <span>Página 1 de 1</span>
                </div>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="p-4 bg-[#2B151C] border-t border-[#FCD6E0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span className="text-xs text-rose-200">
                Recibo oficial gerado em tela. Utilize as opções no topo para Baixar XLS, Baixar PDF ou Imprimir.
              </span>
              <button
                type="button"
                onClick={() => setIsReceiptVisualOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Sem opção para IMPRIMIR, prevalecendo somente Baixar XLS e PDF      */}
      {/* =================================================================== */}
      {isViewModalOpen && viewingPatient && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsViewModalOpen(false)}
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
                    Visualização do Prontuário em Tela — {viewingPatient.fullName}
                  </h3>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Confira a ficha clínica completa em tela. Utilize as opções ao lado para Baixar XLS ou Baixar PDF.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => handleExportSingleRecordXLS(viewingPatient)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] transition-colors cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                  <span>Baixar XLS</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportSingleRecordPDF(viewingPatient)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#9C2744] bg-white hover:bg-rose-50 transition-colors cursor-pointer shadow-xs"
                >
                  <FileText className="w-4 h-4 text-[#D85072]" />
                  <span>Baixar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
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
                      CREFITO: {clinic.crefito} • WhatsApp: {clinic.phoneDisplay} • {clinic.address}, {clinic.neighborhood} - {clinic.cityState}
                    </p>
                  </div>
                  <div className="text-right text-xs text-rose-200">
                    <span className="font-bold text-white block">Ficha Clínica Individual</span>
                    <span>{viewingPatient.registrationNumber}</span>
                  </div>
                </div>

                {/* Subtitle */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-[#FCD6E0] gap-2">
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#26161B]">
                      Prontuário & Anamnese Clínica — {viewingPatient.fullName}
                    </h2>
                    <p className="text-xs text-[#5B444C]">
                      Status: {viewingPatient.status.toUpperCase()} • CPF: {viewingPatient.cpf || '-'}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] w-fit">
                    Padrão COFFITO & LGPD
                  </span>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Box 1: Pessoais */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-2">
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px]">1. Dados Pessoais & Contato</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[#333]">
                      <div><strong>Nascimento:</strong> {viewingPatient.birthDate} ({calculateAge(viewingPatient.birthDate).label})</div>
                      <div><strong>Gênero:</strong> {viewingPatient.gender}</div>
                      <div><strong>CPF:</strong> {viewingPatient.cpf}</div>
                      <div><strong>RG:</strong> {viewingPatient.rg}</div>
                      <div><strong>Telefone:</strong> {viewingPatient.phone}</div>
                      <div><strong>E-mail:</strong> {viewingPatient.email}</div>
                      <div className="col-span-2 sm:col-span-3">
                        <strong>Endereço:</strong> {viewingPatient.address.street} {viewingPatient.address.number} {viewingPatient.address.complement} - {viewingPatient.address.neighborhood}, {viewingPatient.address.city}/{viewingPatient.address.state} - CEP: {viewingPatient.address.zipCode}
                      </div>
                    </div>
                  </div>

                  {/* Box 2: Emergencia */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-1">
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px]">2. Contato de Emergência</h4>
                    <p className="text-sm font-semibold text-[#26161B]">{viewingPatient.emergencyContact.name}</p>
                    <p className="text-[#5B444C]">Parentesco: {viewingPatient.emergencyContact.relationship} • Telefone: {viewingPatient.emergencyContact.phone}</p>
                  </div>

                  {/* Box 3: Anamnese */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-2">
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px]">3. Histórico de Saúde & Anamnese</h4>
                    <p className="text-sm font-semibold text-[#D85072]">
                      Objetivo: {viewingPatient.anamnese.mainGoal}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#333]">
                      <div>
                        <strong>Atividade Física Atual:</strong> {viewingPatient.anamnese.physicalActivityCurrent ? `Sim (${viewingPatient.anamnese.physicalActivityDetails})` : 'Não'}
                      </div>
                      <div>
                        <strong>Lesão ou Dor Crônica:</strong> {viewingPatient.anamnese.chronicPainOrInjury ? `Sim (${viewingPatient.anamnese.chronicPainDetails})` : 'Não'}
                      </div>
                      <div>
                        <strong>Cirurgias:</strong> {viewingPatient.anamnese.recentOrPastSurgeries ? `Sim (${viewingPatient.anamnese.surgeriesDetails})` : 'Não'}
                      </div>
                      <div>
                        <strong>Pressão / Coração:</strong> {viewingPatient.anamnese.cardiacOrBloodPressure} {viewingPatient.anamnese.cardiacDetails}
                      </div>
                      <div>
                        <strong>Medicamentos de uso contínuo:</strong> {viewingPatient.anamnese.continuousMedication ? `Sim (${viewingPatient.anamnese.medicationDetails})` : 'Não'}
                      </div>
                      <div>
                        <strong>Gestante:</strong> {viewingPatient.anamnese.isPregnant ? `Sim (${viewingPatient.anamnese.gestationalWeeks} semanas)` : 'Não'}
                      </div>
                    </div>
                  </div>

                  {/* Box 4: Termos */}
                  <div className="bg-[#FFFDFB] p-4 rounded-2xl border border-[#FCD6E0] space-y-1.5">
                    <h4 className="font-bold text-[#8C3B50] uppercase text-[11px]">4. Termos & LGPD</h4>
                    <p>✓ Consentimento e Veracidade: {viewingPatient.terms.consentAccepted ? 'Aceito e Assinado' : 'Pendente'}</p>
                    <p>✓ Uso de Imagem: {viewingPatient.terms.imageUsageAuthorized ? 'Autorizado' : 'Não autorizado'}</p>
                    <p>✓ Política de Desmarques e Reposições: {viewingPatient.terms.cancellationPolicyAccepted ? 'Ciente (24h de aviso)' : 'Pendente'}</p>
                  </div>
                </div>

                {/* Footer of Document */}
                <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#5B444C] gap-2">
                  <span>Documento oficial gerado em tela • Dra. Léia Mar</span>
                  <div className="flex items-center gap-6">
                    <span>Assinatura do Paciente/Responsável: _______________________________</span>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleOpenEdit(viewingPatient);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors cursor-pointer"
                >
                  Editar Dados
                </button>
                <button
                  type="button"
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  Fechar Visualização
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: RELATÓRIO GERAL DE HISTÓRICO CLÍNICO EM TELA (VISUAL)      */}
      {/* Sem opção para IMPRIMIR, prevalecendo somente Baixar XLS e PDF      */}
      {/* =================================================================== */}
      {isGeneralReportOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsGeneralReportOpen(false)}
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
                    Visualização do Relatório em Tela — Histórico Clínico Geral
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
                  onClick={() => setIsGeneralReportOpen(false)}
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
                      CREFITO: {clinic.crefito} • WhatsApp: {clinic.phoneDisplay} • {clinic.address}, {clinic.neighborhood} - {clinic.cityState}
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
                      Relatório Consolidado de Histórico Clínico & Pacientes
                    </h2>
                    <p className="text-xs text-[#5B444C]">
                      Total de alunos/pacientes computados: {filteredPatients.length}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] w-fit">
                    Padrão COFFITO & LGPD
                  </span>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                  <div className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                    <span className="text-[10px] uppercase font-bold text-[#8C3B50] block">Total Cadastrados</span>
                    <strong className="text-sm sm:text-base font-bold text-[#26161B]">{totalCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EBF7EE]/50 border border-[#B6E3C3]">
                    <span className="text-[10px] uppercase font-bold text-[#1D7A46] block">Alunos Ativos</span>
                    <strong className="text-sm sm:text-base font-bold text-[#1D7A46]">{activeCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#FFEBF0]/30 border border-[#FCD6E0]">
                    <span className="text-[10px] uppercase font-bold text-[#9C2744] block">Lesão / Dor Crônica</span>
                    <strong className="text-sm sm:text-base font-bold text-[#9C2744]">{painCount}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-[#EBF2FF]/40 border border-[#C6DCFF]">
                    <span className="text-[10px] uppercase font-bold text-[#1877F2] block">Histórico Cirúrgico</span>
                    <strong className="text-sm sm:text-base font-bold text-[#1877F2]">{surgeryCount}</strong>
                  </div>
                </div>

                {/* Table */}
                <table className="w-full text-left text-[11px] border-collapse">
                  <thead>
                    <tr className="bg-[#8C3B50] text-white">
                      <th className="p-2 font-bold">Prontuário</th>
                      <th className="p-2 font-bold">Aluno(a) / Paciente</th>
                      <th className="p-2 font-bold">Idade</th>
                      <th className="p-2 font-bold">CPF</th>
                      <th className="p-2 font-bold">WhatsApp</th>
                      <th className="p-2 font-bold">Objetivo Principal</th>
                      <th className="p-2 font-bold">Dor / Lesão</th>
                      <th className="p-2 font-bold text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((p, i) => (
                      <tr key={p.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                        <td className="p-2 border-b border-[#FCD6E0]/60 font-semibold">{p.registrationNumber}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{p.fullName}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{calculateAge(p.birthDate).label}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{p.cpf || '-'}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{p.phone || '-'}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">{p.anamnese.mainGoal}</td>
                        <td className="p-2 border-b border-[#FCD6E0]/60">
                          {p.anamnese.chronicPainOrInjury ? `Sim (${p.anamnese.chronicPainDetails || ''})` : 'Não'}
                        </td>
                        <td className="p-2 border-b border-[#FCD6E0]/60 text-center uppercase font-bold text-[9px]">
                          {p.status}
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
                onClick={() => setIsGeneralReportOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-200 hover:text-white bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE CLIENTE / PRONTUÁRIO            */}
      {/* =================================================================== */}
      {patientToDelete && (
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
                  Tem certeza que deseja excluir permanentemente o cadastro e o prontuário clínico de{' '}
                  <strong className="text-[#9C2744]">{patientToDelete.name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#FCD6E0]/70">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5B444C] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeletePatient}
                className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-gradient-to-r from-[#D85072] to-[#9C2744] hover:from-[#BC3859] hover:to-[#7A1C33] shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir Cadastro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
