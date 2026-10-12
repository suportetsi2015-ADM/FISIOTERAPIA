import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  DollarSign,
  Calendar,
  Clock,
  Plus,
  Search,
  Filter,
  Download,
  Edit3,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building,
  UserCheck,
  Percent,
  Calculator,
  MessageCircle,
  FileSpreadsheet,
  FileText,
  X,
  Check,
  RotateCcw,
  Sparkles,
  TrendingUp,
  Award,
  UserPlus,
  ShieldCheck,
  Phone,
  Briefcase,
  Layers,
  Tag,
  Eye,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  usePilatesClasses,
  PilatesClassRecord,
  PilatesProfessional,
  PilatesServiceItem,
  INITIAL_SERVICES,
  formatAulasRealizadas,
  exportPilatesToXLS,
  exportPilatesToPDF,
  exportServicesToXLS,
  exportServicesToPDF,
  exportPilatesStudentsOnlyToXLS,
  exportPilatesStudentsOnlyToPDF,
  exportPilatesFinancialOnlyToXLS,
  exportPilatesFinancialOnlyToPDF
} from '../../data/pilatesClassesStore';
import { CLINIC_INFO } from '../../data/content';
import { formatPhoneBR } from '../../utils/phoneFormatter';

export interface AdminAulasPilatesTabProps {
  portalSection?: 'aulas' | 'financeiro' | 'servicos' | 'profissionais' | 'relatorios';
  initialSubView?: 'geral' | 'individual' | 'tabela' | 'servicos';
  triggerOpenProfModal?: number;
  triggerOpenReportModal?: number;
}

export const AdminAulasPilatesTab: React.FC<AdminAulasPilatesTabProps> = ({
  portalSection = 'aulas',
  initialSubView = 'geral',
  triggerOpenProfModal = 0,
  triggerOpenReportModal = 0
}) => {
  const {
    classes,
    professionals,
    services,
    addClassRecord,
    updateClassRecord,
    deleteClassRecord,
    quickIncrementAttended,
    resetClasses,
    addProfessional,
    updateProfessional,
    deleteProfessional,
    resetProfessionalsList,
    professionalsList,
    addServiceItem,
    updateServiceItem,
    deleteServiceItem,
    resetServicesList
  } = usePilatesClasses();

  // View modes: 'geral', 'individual', 'tabela' (todos alunos), 'servicos' (Tabela de Serviços)
  const [subView, setSubView] = useState<'geral' | 'individual' | 'tabela' | 'servicos'>(initialSubView);
  const [selectedProfessional, setSelectedProfessional] = useState<string>('Dra. Léia Mar');

  // Filters & Search for Students / Classes
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'todos' | 'ativo' | 'concluido' | 'trancado'>('todos');

  // Filters for Tabela de Serviços
  const [serviceCategoryFilter, setServiceCategoryFilter] = useState<string>('TODOS');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  // ---------------------------------------------------------------------------
  // REQUIREMENT A: PRINT PREVIEW MODAL STATE ("mostre na tela a visualização do arquivo para impressão")
  // ---------------------------------------------------------------------------
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);
  const printableAreaRef = useRef<HTMLDivElement>(null);

  // Modal / Form state for Class/Student
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Modal state for Deletion Confirmation (in-app dialog instead of blocked window.confirm)
  const [itemToDelete, setItemToDelete] = useState<{
    type: 'class' | 'service' | 'prof';
    id: string;
    name: string;
  } | null>(null);

  // Modal state for Professionals Management
  const [isProfModalOpen, setIsProfModalOpen] = useState(false);

  useEffect(() => {
    if (portalSection === 'servicos') {
      setSubView('servicos');
    } else if (portalSection === 'aulas' || portalSection === 'financeiro') {
      setSubView('geral');
    } else {
      setSubView(initialSubView);
    }
  }, [portalSection, initialSubView]);

  useEffect(() => {
    if (triggerOpenProfModal > 0 && portalSection !== 'profissionais') {
      setIsProfModalOpen(true);
    }
  }, [triggerOpenProfModal, portalSection]);

  useEffect(() => {
    if (triggerOpenReportModal > 0) {
      setIsPrintPreviewOpen(true);
    }
  }, [triggerOpenReportModal]);
  const [isCreatingProf, setIsCreatingProf] = useState(false);
  const [editingProfId, setEditingProfId] = useState<string | null>(null);
  const [profName, setProfName] = useState('');
  const [profRole, setProfRole] = useState('Fisioterapeuta & Instrutora de Pilates');
  const [profCrefito, setProfCrefito] = useState('');
  const [profPhone, setProfPhone] = useState('');

  // ---------------------------------------------------------------------------
  // REQUIREMENT B: MODAL STATE FOR TABELA DE SERVIÇO (INSERIR / EDITAR / EXCLUIR)
  // ---------------------------------------------------------------------------
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [servPlanCategory, setServPlanCategory] = useState<'MENSAL' | 'TRIMESTRAL' | 'SEMESTRAL' | 'ANUAL' | 'AVULSO' | string>('MENSAL');
  const [servName, setServName] = useState('');
  const [servModality, setServModality] = useState('Pilates Clínico & Aparelhos');
  const [servTotalValue, setServTotalValue] = useState<number>(420.00);
  const [servMonthlyValue, setServMonthlyValue] = useState<number>(420.00);
  const [servGymPercentage, setServGymPercentage] = useState<number>(50);
  const [servGymValue, setServGymValue] = useState<number>(210.00);
  const [servSuggestedProfPass, setServSuggestedProfPass] = useState<number>(180.00);
  const [servClassCountTotal, setServClassCountTotal] = useState<number>(8);
  const [servWeeklyClasses, setServWeeklyClasses] = useState<number>(2);
  const [servDaysOfWeek, setServDaysOfWeek] = useState('Segunda e Quarta ou Terça e Quinta');
  const [servSchedules, setServSchedules] = useState('Manhã: 07h às 11h | Tarde: 14h às 19h');
  const [servValidityDays, setServValidityDays] = useState('30 dias (Mensal)');
  const [servStartDate, setServStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [servEndDate, setServEndDate] = useState('');
  const [servNotes, setServNotes] = useState('');
  const [servActive, setServActive] = useState(true);

  // Form fields for Class/Student Enrollment
  const [formProfName, setFormProfName] = useState('Dra. Léia Mar');
  const [formCustomProf, setFormCustomProf] = useState('');
  const [formStudentName, setFormStudentName] = useState('');
  const [formStudentPhone, setFormStudentPhone] = useState('');
  const [formPlanType, setFormPlanType] = useState(services[0]?.name || 'Pilates Aparelhos & Solo - 2x por Semana');
  const [formTotalPlanValue, setFormTotalPlanValue] = useState<number>(services[0]?.totalValue || 420.00);
  const [formMonthlyValue, setFormMonthlyValue] = useState<number>(services[0]?.monthlyValue || 420.00);
  const [formGymPercentage, setFormGymPercentage] = useState<number>(50);
  const [formGymPassValue, setFormGymPassValue] = useState<number>(services[0]?.gymPassValue || 210.00);
  const [formProfPassValue, setFormProfPassValue] = useState<number>(services[0]?.suggestedProfPass || 180.00);
  const [formHourlyRate, setFormHourlyRate] = useState<number>(
    Number(((services[0]?.totalValue || 420) / (services[0]?.classCountTotal || 8)).toFixed(2))
  );
  const [formTotalHours, setFormTotalHours] = useState<number>(services[0]?.classCountTotal || 8);
  // REQUIREMENT C: AULAS REALIZADAS (ex: 5 aulas, 3 aulas, 1 aula, 0 aula)
  const [formAttendedAulas, setFormAttendedAulas] = useState<number>(0);
  const [formStatus, setFormStatus] = useState<'ativo' | 'concluido' | 'trancado'>('ativo');
  const [formStartDate, setFormStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formNotes, setFormNotes] = useState<string>('');

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Filtered dataset for classes/students
  const filteredClasses = useMemo(() => {
    return classes.filter(item => {
      if (subView === 'individual' && selectedProfessional) {
        if (item.professionalName !== selectedProfessional) return false;
      }
      if (statusFilter !== 'todos' && item.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesStudent = item.studentName.toLowerCase().includes(q);
        const matchesProf = item.professionalName.toLowerCase().includes(q);
        const matchesPlan = item.planType.toLowerCase().includes(q);
        if (!matchesStudent && !matchesProf && !matchesPlan) return false;
      }
      return true;
    });
  }, [classes, subView, selectedProfessional, statusFilter, searchQuery]);

  // Filtered services for Tabela de Serviço
  const filteredServices = useMemo(() => {
    return services.filter(serv => {
      if (serviceCategoryFilter !== 'TODOS' && serv.planCategory !== serviceCategoryFilter) {
        return false;
      }
      if (serviceSearchQuery.trim()) {
        const q = serviceSearchQuery.toLowerCase();
        const matchName = serv.name.toLowerCase().includes(q);
        const matchMod = serv.modality.toLowerCase().includes(q);
        const matchSched = serv.schedules.toLowerCase().includes(q);
        const matchDays = serv.daysOfWeek.toLowerCase().includes(q);
        if (!matchName && !matchMod && !matchSched && !matchDays) return false;
      }
      return true;
    });
  }, [services, serviceCategoryFilter, serviceSearchQuery]);

  // Financial calculations (Geral)
  const generalStats = useMemo(() => {
    const totalStudents = classes.length;
    const activeStudents = classes.filter(c => c.status === 'ativo').length;
    const totalContratado = classes.reduce((sum, c) => sum + (c.totalPlanValue || 0), 0);
    const totalMensalidades = classes.reduce((sum, c) => sum + (c.monthlyInstallmentValue || 0), 0);
    const totalRepasseAcademia = classes.reduce((sum, c) => sum + (c.gymPassValue || 0), 0);
    const totalRepasseProfissionais = classes.reduce((sum, c) => sum + (c.professionalPassValue || 0), 0);
    const saldoLiquidoClinica = totalContratado - totalRepasseAcademia - totalRepasseProfissionais;
    const totalHorasAulas = classes.reduce((sum, c) => sum + (c.totalClassHours || 0), 0);
    const totalAulasRealizadas = classes.reduce((sum, c) => sum + (c.attendedHours || 0), 0);

    return {
      totalStudents,
      activeStudents,
      totalContratado,
      totalMensalidades,
      totalRepasseAcademia,
      totalRepasseProfissionais,
      saldoLiquidoClinica,
      totalHorasAulas,
      totalAulasRealizadas
    };
  }, [classes]);

  // Financial calculations (Individual)
  const professionalStats = useMemo(() => {
    const profClasses = classes.filter(c => c.professionalName === selectedProfessional);
    const totalAlunos = profClasses.length;
    const ativos = profClasses.filter(c => c.status === 'ativo').length;
    const faturamentoProf = profClasses.reduce((sum, c) => sum + (c.totalPlanValue || 0), 0);
    const repasseAcademia = profClasses.reduce((sum, c) => sum + (c.gymPassValue || 0), 0);
    const repasseProfissional = profClasses.reduce((sum, c) => sum + (c.professionalPassValue || 0), 0);
    const totalHoras = profClasses.reduce((sum, c) => sum + (c.totalClassHours || 0), 0);
    const aulasRealizadas = profClasses.reduce((sum, c) => sum + (c.attendedHours || 0), 0);
    const mediaHoraAula = totalHoras > 0 ? faturamentoProf / totalHoras : 0;

    return {
      profClasses,
      totalAlunos,
      ativos,
      faturamentoProf,
      repasseAcademia,
      repasseProfissional,
      totalHoras,
      aulasRealizadas,
      mediaHoraAula
    };
  }, [classes, selectedProfessional]);

  // Current dataset to print or export
  const activeReportDataset = useMemo(() => {
    if (subView === 'individual') {
      return professionalStats.profClasses;
    }
    return classes;
  }, [subView, professionalStats.profClasses, classes]);

  const activeReportTitleSuffix = useMemo(() => {
    if (subView === 'individual') return selectedProfessional;
    return 'Geral';
  }, [subView, selectedProfessional]);

  // ---------------------------------------------------------------------------
  // REQUIREMENT A: OPEN VISUAL REPORT ON SCREEN (NO DIRECT PRINTING)
  // ---------------------------------------------------------------------------
  const handleOpenPrintPreview = () => {
    setIsPrintPreviewOpen(true);
  };

  // Export handlers
  const handleExportXLS = () => {
    if (subView === 'servicos' || portalSection === 'servicos') {
      exportServicesToXLS(filteredServices);
      showToast('Planilha da Tabela de Serviços (.xlsx) baixada com sucesso!');
      return;
    }
    if (portalSection === 'aulas') {
      exportPilatesStudentsOnlyToXLS(filteredClasses);
      showToast('Planilha de Controle e Registro de Alunos (.xlsx) baixada com sucesso!');
      return;
    }
    if (portalSection === 'financeiro') {
      exportPilatesFinancialOnlyToXLS(filteredClasses);
      showToast('Planilha de Gestão Financeira (.xlsx) baixada com sucesso!');
      return;
    }
    exportPilatesToXLS(activeReportDataset, activeReportTitleSuffix);
    showToast(`Planilha Excel (.xlsx) baixada com sucesso!`);
  };

  const handleExportPDF = () => {
    if (subView === 'servicos' || portalSection === 'servicos') {
      exportServicesToPDF(filteredServices);
      showToast('Relatório da Tabela de Serviços em PDF baixado com sucesso!');
      return;
    }
    if (portalSection === 'aulas') {
      exportPilatesStudentsOnlyToPDF(filteredClasses);
      showToast('Relatório de Controle e Registro de Alunos em PDF baixado com sucesso!');
      return;
    }
    if (portalSection === 'financeiro') {
      exportPilatesFinancialOnlyToPDF(filteredClasses);
      showToast('Relatório de Gestão Financeira em PDF baixado com sucesso!');
      return;
    }
    exportPilatesToPDF(activeReportDataset, activeReportTitleSuffix);
    showToast(`Relatório oficial em PDF baixado com sucesso!`);
  };

  // ---------------------------------------------------------------------------
  // REQUIREMENT B: TABELA DE SERVIÇO ACTIONS (INSERIR, EDITAR, EXCLUIR)
  // ---------------------------------------------------------------------------
  const openNewServiceModal = () => {
    setEditingServiceId(null);
    setServPlanCategory('MENSAL');
    setServName('');
    setServModality('Pilates Clínico & Aparelhos');
    setServTotalValue(420.00);
    setServMonthlyValue(420.00);
    setServGymPercentage(50);
    setServGymValue(210.00);
    setServSuggestedProfPass(180.00);
    setServClassCountTotal(8);
    setServWeeklyClasses(2);
    setServDaysOfWeek('Segunda e Quarta ou Terça e Quinta');
    setServSchedules('Manhã: 07h às 11h | Tarde: 14h às 19h');
    setServValidityDays('30 dias (Mensal)');
    setServStartDate(new Date().toISOString().split('T')[0]);
    setServEndDate('');
    setServNotes('');
    setServActive(true);
    setIsServiceModalOpen(true);
  };

  const openEditServiceModal = (item: PilatesServiceItem) => {
    setEditingServiceId(item.id);
    setServPlanCategory(item.planCategory);
    setServName(item.name);
    setServModality(item.modality);
    setServTotalValue(item.totalValue);
    setServMonthlyValue(item.monthlyValue);
    setServGymPercentage(item.gymPassPercentage || 50);
    setServGymValue(item.gymPassValue);
    setServSuggestedProfPass(item.suggestedProfPass);
    setServClassCountTotal(item.classCountTotal);
    setServWeeklyClasses(item.weeklyClasses);
    setServDaysOfWeek(item.daysOfWeek);
    setServSchedules(item.schedules);
    setServValidityDays(item.validityDays);
    setServStartDate(item.startDate || new Date().toISOString().split('T')[0]);
    setServEndDate(item.endDate || '');
    setServNotes(item.notes || '');
    setServActive(item.active);
    setIsServiceModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!servName.trim()) {
      showToast('Por favor, informe o nome do plano ou serviço.');
      return;
    }

    const payload = {
      planCategory: servPlanCategory,
      name: servName.trim(),
      modality: servModality.trim(),
      totalValue: Number(servTotalValue) || 0,
      monthlyValue: Number(servMonthlyValue) || 0,
      gymPassPercentage: Number(servGymPercentage) || 50,
      gymPassValue: Number(servGymValue) || 0,
      suggestedProfPass: Number(servSuggestedProfPass) || 0,
      classCountTotal: Number(servClassCountTotal) || 1,
      weeklyClasses: Number(servWeeklyClasses) || 1,
      daysOfWeek: servDaysOfWeek.trim(),
      schedules: servSchedules.trim(),
      validityDays: servValidityDays.trim(),
      startDate: servStartDate || undefined,
      endDate: servEndDate || undefined,
      notes: servNotes.trim() || undefined,
      active: servActive
    };

    if (editingServiceId) {
      updateServiceItem(editingServiceId, payload);
      showToast(`Plano "${payload.name}" atualizado na Tabela de Serviços!`);
    } else {
      addServiceItem(payload);
      showToast(`Novo plano "${payload.name}" inserido com sucesso na Tabela!`);
    }

    setIsServiceModalOpen(false);
  };

  const handleDeleteService = (id: string, name: string) => {
    setItemToDelete({ type: 'service', id, name });
  };

  // Helper when user changes Total Value in Service form
  const handleServiceTotalValueChange = (val: number) => {
    setServTotalValue(val);
    const gymShare = Number((val * (servGymPercentage / 100)).toFixed(2));
    setServGymValue(gymShare);
  };

  // Helper when user selects a service from Tabela de Serviços into the Student Enrollment Form
  const handleSelectServiceForStudent = (serviceId: string) => {
    const found = services.find(s => s.id === serviceId);
    if (!found) return;
    setFormPlanType(found.name);
    setFormTotalPlanValue(found.totalValue);
    setFormMonthlyValue(found.monthlyValue);
    setFormGymPercentage(found.gymPassPercentage || 50);
    setFormGymPassValue(found.gymPassValue);
    setFormProfPassValue(found.suggestedProfPass);
    setFormTotalHours(found.classCountTotal);
    const hourly = found.classCountTotal > 0 ? Number((found.totalValue / found.classCountTotal).toFixed(2)) : 0;
    setFormHourlyRate(hourly);
  };

  // Quick enroll from Tabela de Serviços
  const handleEnrollWithService = (service: PilatesServiceItem) => {
    setEditingId(null);
    setFormProfName(selectedProfessional || 'Dra. Léia Mar');
    setFormCustomProf('');
    setFormStudentName('');
    setFormStudentPhone('');
    setFormPlanType(service.name);
    setFormTotalPlanValue(service.totalValue);
    setFormMonthlyValue(service.monthlyValue);
    setFormGymPercentage(service.gymPassPercentage || 50);
    setFormGymPassValue(service.gymPassValue);
    setFormProfPassValue(service.suggestedProfPass);
    setFormTotalHours(service.classCountTotal);
    const hourly = service.classCountTotal > 0 ? Number((service.totalValue / service.classCountTotal).toFixed(2)) : 0;
    setFormHourlyRate(hourly);
    setFormAttendedAulas(0);
    setFormStatus('ativo');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormNotes(`Matrícula iniciada com o plano ${service.name} (${service.modality}). Horários: ${service.schedules}`);
    setIsModalOpen(true);
  };

  // ---------------------------------------------------------------------------
  // STUDENT / CLASS ENROLLMENT MODAL ACTIONS
  // ---------------------------------------------------------------------------
  const openNewRecordModal = () => {
    setEditingId(null);
    setFormProfName(selectedProfessional || professionalsList[0] || 'Dra. Léia Mar');
    setFormCustomProf('');
    setFormStudentName('');
    setFormStudentPhone('');
    if (services.length > 0) {
      handleSelectServiceForStudent(services[0].id);
    }
    setFormAttendedAulas(0);
    setFormStatus('ativo');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormNotes('');
    setIsModalOpen(true);
  };

  const openEditRecordModal = (rec: PilatesClassRecord) => {
    setEditingId(rec.id);
    if (professionalsList.includes(rec.professionalName)) {
      setFormProfName(rec.professionalName);
      setFormCustomProf('');
    } else {
      setFormProfName('outro');
      setFormCustomProf(rec.professionalName);
    }
    setFormStudentName(rec.studentName);
    setFormStudentPhone(rec.studentPhone || '');
    setFormPlanType(rec.planType);
    setFormTotalPlanValue(rec.totalPlanValue);
    setFormMonthlyValue(rec.monthlyInstallmentValue);
    setFormGymPercentage(rec.gymPassPercentage || 50);
    setFormGymPassValue(rec.gymPassValue);
    setFormProfPassValue(rec.professionalPassValue);
    setFormHourlyRate(rec.studentHourlyRate);
    setFormTotalHours(rec.totalClassHours);
    // REQUIREMENT C: set attended classes
    setFormAttendedAulas(rec.attendedHours || 0);
    setFormStatus(rec.status);
    setFormStartDate(rec.startDate);
    setFormNotes(rec.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmitClassForm = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedProf = formProfName === 'outro' ? formCustomProf.trim() : formProfName;
    if (!resolvedProf) {
      showToast('Por favor, selecione ou informe o nome do profissional.');
      return;
    }
    if (!formStudentName.trim()) {
      showToast('Por favor, informe o nome do aluno(a).');
      return;
    }

    const payload = {
      professionalName: resolvedProf,
      studentName: formStudentName.trim(),
      studentPhone: formStudentPhone.trim() || undefined,
      planType: formPlanType,
      totalPlanValue: Number(formTotalPlanValue) || 0,
      monthlyInstallmentValue: Number(formMonthlyValue) || 0,
      gymPassPercentage: Number(formGymPercentage) || 50,
      gymPassValue: Number(formGymPassValue) || 0,
      professionalPassValue: Number(formProfPassValue) || 0,
      studentHourlyRate: Number(formHourlyRate) || 0,
      weeklyClassHours: 2,
      totalClassHours: Number(formTotalHours) || 0,
      // REQUIREMENT C: Salva exatamente a quantidade de aulas realizadas
      attendedHours: Number(formAttendedAulas) || 0,
      status: formStatus,
      startDate: formStartDate,
      notes: formNotes.trim() || undefined
    };

    if (editingId) {
      updateClassRecord(editingId, payload);
      showToast('Registro do aluno(a) atualizado com sucesso!');
    } else {
      addClassRecord(payload);
      showToast('Novo aluno(a) matriculado na turma de Pilates!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteClass = (id: string, name: string) => {
    setItemToDelete({ type: 'class', id, name });
  };

  // Professional CRUD
  const handleSaveProfessional = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName.trim()) {
      showToast('Informe o nome do profissional.');
      return;
    }

    if (editingProfId) {
      updateProfessional(editingProfId, {
        name: profName.trim(),
        roleTitle: profRole.trim(),
        crefito: profCrefito.trim() || undefined,
        phone: profPhone.trim() || undefined
      });
      showToast('Profissional atualizado!');
    } else {
      addProfessional({
        name: profName.trim(),
        roleTitle: profRole.trim(),
        crefito: profCrefito.trim() || undefined,
        phone: profPhone.trim() || undefined,
        active: true
      });
      showToast('Novo profissional cadastrado com sucesso!');
    }

    setProfName('');
    setProfRole('Fisioterapeuta & Instrutora de Pilates');
    setProfCrefito('');
    setProfPhone('');
    setEditingProfId(null);
    setIsCreatingProf(false);
  };

  const startEditProf = (prof: PilatesProfessional) => {
    setEditingProfId(prof.id);
    setProfName(prof.name);
    setProfRole(prof.roleTitle || 'Fisioterapeuta & Instrutora de Pilates');
    setProfCrefito(prof.crefito || '');
    setProfPhone(prof.phone || '');
    setIsCreatingProf(true);
  };

  const handleDeleteProf = (id: string, name: string) => {
    setItemToDelete({ type: 'prof', id, name });
  };

  const confirmDeleteItem = () => {
    if (!itemToDelete) return;
    if (itemToDelete.type === 'service') {
      deleteServiceItem(itemToDelete.id);
      showToast(`Plano "${itemToDelete.name}" excluído da Tabela.`);
    } else if (itemToDelete.type === 'class') {
      deleteClassRecord(itemToDelete.id);
      showToast(`Registro de "${itemToDelete.name}" excluído com sucesso!`);
    } else if (itemToDelete.type === 'prof') {
      deleteProfessional(itemToDelete.id);
      showToast(`Profissional "${itemToDelete.name}" removido com sucesso!`);
    }
    setItemToDelete(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Printable dedicated style sheet for default printer */}
      <style>{`
        @media print {
          html, body {
            background: #FFFFFF !important;
            color: #26161B !important;
            height: auto !important;
            min-height: auto !important;
            overflow: visible !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          /* Hide everything in the page by default */
          body > * {
            visibility: hidden !important;
          }

          /* Keep root visible and reset modal container for printing */
          body > #root,
          #root {
            visibility: visible !important;
            overflow: visible !important;
          }

          div[role="dialog"] {
            position: static !important;
            inset: auto !important;
            background: transparent !important;
            backdrop-filter: none !important;
            -webkit-backdrop-filter: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            display: block !important;
            visibility: visible !important;
          }

          div[role="dialog"] > div {
            background: transparent !important;
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            width: 100% !important;
            max-width: 100% !important;
            visibility: visible !important;
          }

          div[role="dialog"] > div > div.flex-1 {
            background: transparent !important;
            padding: 0 !important;
            margin: 0 !important;
            overflow: visible !important;
            display: block !important;
            visibility: visible !important;
          }

          /* Hide toolbar, modal header, and bottom bar in print */
          .no-print,
          div[role="dialog"] > div > div:first-child,
          div[role="dialog"] > div > div:last-child {
            display: none !important;
          }

          /* Format printable document */
          #pilates-printable-document,
          #pilates-printable-document * {
            visibility: visible !important;
          }

          #pilates-printable-document {
            position: static !important;
            display: block !important;
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 8mm !important;
            background: #FFFFFF !important;
            color: #26161B !important;
            box-shadow: none !important;
            border: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            page-break-inside: auto !important;
          }
        }
      `}</style>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#26161B] text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border border-[#FCD6E0]/40 animate-slideUp">
          <CheckCircle2 className="w-5 h-5 text-[#34D399]" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* HEADER BANNER 1: ABA "AULAS DE PILATES" (SOMENTE CONTROLE E REGISTRO DE ALUNOS) */}
      {/* =================================================================== */}
      {portalSection === 'aulas' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#FCD6E0]">
              <Award className="w-3.5 h-3.5 text-[#D85072]" />
              <span>Controle de Aulas & Frequência</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
              AULAS DE PILATES — CONTROLE E REGISTRO DE ALUNOS
            </h2>
            <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
              Controle exclusivo de matrículas, registro de alunos, acompanhamento de frequência, presenças e quantidade de aulas realizadas por aluno.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportXLS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer"
              title="Baixar planilha de controle de alunos (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
              <span>Baixar XLS</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
              title="Baixar relatório de controle de alunos em PDF"
            >
              <FileText className="w-4 h-4 text-[#D85072]" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPrintPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#26161B] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
              title="Visualizar relatório de controle de alunos em tela"
            >
              <Eye className="w-4 h-4 text-[#8C3B50]" />
              <span>Relatório em Tela (Visual)</span>
            </button>

            <button
              type="button"
              onClick={openNewRecordModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Matricular Aluno</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* HEADER BANNER 2: ABA "GESTÃO FINANCEIRA" (TUDO RELACIONADO A VALORES) */}
      {/* =================================================================== */}
      {portalSection === 'financeiro' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EBF7EE] text-[#1D7A46] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#B6E3C3]">
              <DollarSign className="w-3.5 h-3.5 text-[#1D7A46]" />
              <span>Módulo de Gestão Financeira</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
              GESTÃO FINANCEIRA — VALORES, MENSALIDADES E REPASSES
            </h2>
            <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
              Controle financeiro completo de valores contratados, mensalidades vigentes, repasse automático de 50% para a academia, comissões dos profissionais e valor hora/aula.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportXLS}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer"
              title="Baixar planilha financeira (.xlsx)"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
              <span>Baixar XLS</span>
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
              title="Baixar demonstrativo financeiro em PDF"
            >
              <FileText className="w-4 h-4 text-[#D85072]" />
              <span>Baixar PDF</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPrintPreview}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#26161B] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
              title="Visualizar demonstrativo financeiro em tela"
            >
              <Eye className="w-4 h-4 text-[#8C3B50]" />
              <span>Relatório em Tela (Visual)</span>
            </button>

            <button
              type="button"
              onClick={openNewRecordModal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Lançar Contrato / Valor</span>
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA "RELATÓRIO GERAL CONSOLIDADO" (portalSection === 'relatorios'): */}
      {/* Dedicada exclusivamente ao Relatório Geral Consolidado              */}
      {/* =================================================================== */}
      {portalSection === 'relatorios' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase mb-3 border border-[#FCD6E0]">
                <FileText className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Relatório Geral Consolidado</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B] tracking-tight">
                RELATÓRIO GERAL CONSOLIDADO
              </h2>
              <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
                Visão executiva e financeira integrada da clínica com consulta analítica em tela e exportação oficial em planilhas XLS e documentos PDF.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleExportXLS}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#1D7A46]" />
                <span>Baixar XLS</span>
              </button>

              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#D85072]" />
                <span>Baixar PDF</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPrintPreview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#26161B] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
              >
                <Eye className="w-4 h-4 text-[#8C3B50]" />
                <span>Relatório em Tela (Visual)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* ABA "CADASTRO DE PROFISSIONAIS" (portalSection === 'profissionais') */}
      {/* Exibição limpa e direta na tela quando clicado no topo do portal    */}
      {/* =================================================================== */}
      {portalSection === 'profissionais' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B] flex items-center gap-2">
                <UserPlus className="w-6 h-6 text-[#D85072]" />
                <span>CADASTRO & GESTÃO DE PROFISSIONAIS</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#5B444C] mt-1">
                Cadastre, edite e gerencie os fisioterapeutas e instrutores de Pilates vinculados à clínica.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={resetProfessionalsList}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Restaurar Profissionais Padrão</span>
              </button>

              {!isCreatingProf && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfId(null);
                    setProfName('');
                    setProfRole('Fisioterapeuta & Instrutora de Pilates');
                    setProfCrefito('');
                    setProfPhone('');
                    setIsCreatingProf(true);
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Cadastrar Novo Profissional</span>
                </button>
              )}
            </div>
          </div>

          {isCreatingProf && (
            <form onSubmit={handleSaveProfessional} className="bg-white p-6 rounded-3xl border border-[#FCD6E0] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#FCD6E0] pb-3">
                <h4 className="font-serif text-lg font-bold text-[#26161B]">
                  {editingProfId ? 'Editar Profissional' : 'Cadastrar Novo Profissional'}
                </h4>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProf(false);
                    setEditingProfId(null);
                  }}
                  className="p-1.5 rounded-xl text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Nome Completo:
                  </label>
                  <input
                    type="text"
                    value={profName}
                    onChange={e => setProfName(e.target.value)}
                    placeholder="Ex: Dra. Larissa Carvalho"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Cargo / Especialidade:
                  </label>
                  <input
                    type="text"
                    value={profRole}
                    onChange={e => setProfRole(e.target.value)}
                    placeholder="Fisioterapeuta & Instrutora de Pilates"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Registro CREFITO:
                  </label>
                  <input
                    type="text"
                    value={profCrefito}
                    onChange={e => setProfCrefito(e.target.value)}
                    placeholder="Ex: 34567-F"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Telefone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={profPhone}
                    onChange={e => setProfPhone(e.target.value)}
                    placeholder="(92) 99999-9999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingProf(false);
                    setEditingProfId(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#5B444C] hover:bg-[#FFEBF0] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Salvar Profissional</span>
                </button>
              </div>
            </form>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map(p => {
              const profStudentsCount = classes.filter(c => c.professionalName === p.name).length;
              return (
                <div
                  key={p.id}
                  className="p-5 rounded-3xl bg-white border border-[#FCD6E0] flex flex-col justify-between gap-4 shadow-xs hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-2xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center font-serif font-bold text-base border border-[#FCD6E0]">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <h5 className="font-serif font-bold text-base text-[#26161B]">{p.name}</h5>
                        <p className="text-xs text-[#5B444C]">
                          {p.roleTitle || 'Fisioterapeuta & Instrutora de Pilates'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditProf(p)}
                        className="p-2 rounded-xl border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] cursor-pointer"
                        title="Editar profissional"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                      </button>
                      {professionals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProf(p.id, p.name)}
                          className="p-2 rounded-xl border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0] cursor-pointer"
                          title="Excluir profissional"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#FCD6E0]/60 flex items-center justify-between text-xs text-[#5B444C]">
                    <span>
                      {p.crefito ? `CREFITO: ${p.crefito}` : 'Equipe Clínica'}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FFF5F7] text-[#9C2744] font-bold border border-[#FCD6E0]">
                      {profStudentsCount} {profStudentsCount === 1 ? 'aluno' : 'alunos'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* KPI CARDS DA ABA "AULAS DE PILATES" (SOMENTE CONTROLE DE ALUNOS — SEM VALORES) */}
      {/* =================================================================== */}
      {portalSection === 'aulas' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B50]">
                Total de Alunos
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B]">
              {generalStats.totalStudents} {generalStats.totalStudents === 1 ? 'aluno' : 'alunos'}
            </p>
            <p className="text-xs text-[#5B444C] mt-1.5">
              <strong className="text-[#1D7A46]">{generalStats.activeStudents} ativos</strong> nas turmas de Pilates
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744]">
                Aulas Realizadas
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#9C2744]">
              {generalStats.totalAulasRealizadas} aulas
            </p>
            <p className="text-xs text-[#5B444C] mt-1.5">
              Total de presenças registradas nos planos
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1877F2]">
                Carga Horária Contratada
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EBF2FF] text-[#1877F2] flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1877F2]">
              {generalStats.totalHorasAulas} horas
            </p>
            <p className="text-xs text-[#5B444C] mt-1.5">
              Soma total de horas dos pacotes vigentes
            </p>
          </div>

          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1D7A46]">
                Corpo Técnico
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <p className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B]">
              {professionals.length} {professionals.length === 1 ? 'profissional' : 'profissionais'}
            </p>
            <p className="text-xs text-[#5B444C] mt-1.5">
              Instrutores e fisioterapeutas ativos
            </p>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* KPI CARDS DA ABA "GESTÃO FINANCEIRA" E "RELATÓRIOS -> GERAL"        */}
      {/* (TUDO RELACIONADO A VALORES, MENSALIDADES E REPASSES)               */}
      {/* =================================================================== */}
      {(portalSection === 'financeiro' || (portalSection === 'relatorios' && subView === 'geral')) && (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B50]">
                  Faturamento Contratado
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B]">
                {formatBRL(generalStats.totalContratado)}
              </p>
              <p className="text-xs text-[#5B444C] mt-1.5 flex items-center gap-1">
                <span>Mensalidades vigentes:</span>
                <strong className="text-[#26161B]">{formatBRL(generalStats.totalMensalidades)}/mês</strong>
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744]">
                  Repasse Academia (50%)
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center">
                  <Building className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#9C2744]">
                {formatBRL(generalStats.totalRepasseAcademia)}
              </p>
              <p className="text-xs text-[#5B444C] mt-1.5">
                50% do total bruto contratado
              </p>
            </div>

            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1877F2]">
                  Repasse Profissionais
                </span>
                <div className="w-9 h-9 rounded-xl bg-[#EBF2FF] text-[#1877F2] flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1877F2]">
                {formatBRL(generalStats.totalRepasseProfissionais)}
              </p>
              <p className="text-xs text-[#5B444C] mt-1.5">
                Comissões acordadas da equipe
              </p>
            </div>

            {portalSection === 'financeiro' ? (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#1D7A46]">
                    Saldo Líquido Clínica
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                </div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#1D7A46]">
                  {formatBRL(generalStats.saldoLiquidoClinica)}
                </p>
                <p className="text-xs text-[#5B444C] mt-1.5">
                  Margem após repasses academia e equipe
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#FCD6E0] shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8C3B50]">
                    Aulas Realizadas
                  </span>
                  <div className="w-9 h-9 rounded-xl bg-[#FFEBF0] text-[#8C3B50] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>
                <p className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B]">
                  {generalStats.totalAulasRealizadas} aulas
                </p>
                <p className="text-xs text-[#5B444C] mt-1.5">
                  Total de presenças registradas nos planos
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VIEW 2: RELATÓRIO INDIVIDUAL POR PROFISSIONAL                   */}
      {/* =================================================================== */}
      {portalSection === 'relatorios' && subView === 'individual' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#8C3B50] mb-2">
                Selecione o Profissional para Relatório Individual:
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {professionalsList.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedProfessional(name)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                      selectedProfessional === name
                        ? 'bg-[#9C2744] text-white shadow-xs'
                        : 'bg-[#FFFDFB] text-[#5B444C] border border-[#FCD6E0] hover:bg-[#FFEBF0]'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>{name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
              <button
                type="button"
                onClick={handleExportXLS}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#1D7A46]" />
                <span>Baixar XLS</span>
              </button>
              <button
                type="button"
                onClick={handleExportPDF}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Baixar PDF</span>
              </button>
              <button
                type="button"
                onClick={handleOpenPrintPreview}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-[#26161B] border border-[#FCD6E0] hover:bg-[#FFEBF0] cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-[#8C3B50]" />
                <span>Relatório em Tela (Visual)</span>
              </button>
            </div>
          </div>

          {/* KPI Individual */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-3xl p-5 border border-[#FCD6E0]">
              <span className="text-xs font-bold text-[#8C3B50] uppercase">Alunos Vinculados</span>
              <p className="font-serif text-2xl font-bold text-[#26161B] mt-1">
                {professionalStats.totalAlunos} alunos ({professionalStats.ativos} ativos)
              </p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-[#FCD6E0]">
              <span className="text-xs font-bold text-[#9C2744] uppercase">Faturamento Alunos</span>
              <p className="font-serif text-2xl font-bold text-[#9C2744] mt-1">
                {formatBRL(professionalStats.faturamentoProf)}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-[#FCD6E0]">
              <span className="text-xs font-bold text-[#1877F2] uppercase">Repasse deste Profissional</span>
              <p className="font-serif text-2xl font-bold text-[#1877F2] mt-1">
                {formatBRL(professionalStats.repasseProfissional)}
              </p>
            </div>
            <div className="bg-white rounded-3xl p-5 border border-[#FCD6E0]">
              <span className="text-xs font-bold text-[#8C3B50] uppercase">Aulas Realizadas</span>
              <p className="font-serif text-2xl font-bold text-[#26161B] mt-1">
                {professionalStats.aulasRealizadas} aulas
              </p>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* SUB-VIEW 3: TABELA DE SERVIÇOS & PLANOS (REQUIREMENT B)             */}
      {/* =================================================================== */}
      {(portalSection === 'servicos' || (portalSection === 'relatorios' && subView === 'servicos')) && (
        <div className="space-y-6">
          {/* Top Bar for Tabela de Serviços */}
          <div className="bg-white rounded-3xl p-6 border border-[#FCD6E0] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#26161B] flex items-center gap-2">
                <Tag className="w-5 h-5 text-[#D85072]" />
                <span>TABELA OFICIAL DE SERVIÇOS & PLANOS</span>
              </h3>
              <p className="text-xs sm:text-sm text-[#5B444C] mt-1">
                Cadastre, edite e precifique planos Mensais, Trimestrais, Semestrais, Anuais e Avulsos, com modalidades, horários e dias de atendimento.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  exportServicesToXLS(filteredServices);
                  showToast('Planilha da Tabela de Serviços (.xlsx) baixada com sucesso!');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-colors cursor-pointer"
                title="Baixar Tabela de Serviços em Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#1D7A46]" />
                <span>Baixar XLS</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  exportServicesToPDF(filteredServices);
                  showToast('Tabela de Serviços em PDF baixada com sucesso!');
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors cursor-pointer"
                title="Baixar Tabela de Serviços em PDF"
              >
                <FileText className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Baixar PDF</span>
              </button>

              <button
                type="button"
                onClick={handleOpenPrintPreview}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-[#26161B] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
                title="Visualizar Tabela de Serviços em Tela"
              >
                <Eye className="w-3.5 h-3.5 text-[#8C3B50]" />
                <span>Relatório em Tela (Visual)</span>
              </button>

              <button
                type="button"
                onClick={resetServicesList}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
                title="Restaurar tabela padrão"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Restaurar Tabela</span>
              </button>

              <button
                type="button"
                onClick={openNewServiceModal}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Inserir Novo Plano / Serviço</span>
              </button>
            </div>
          </div>

          {/* Filters for Tabela de Serviços */}
          <div className="bg-white rounded-3xl p-4 border border-[#FCD6E0] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
              {['TODOS', 'MENSAL', 'TRIMESTRAL', 'SEMESTRAL', 'ANUAL', 'AVULSO'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setServiceCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    serviceCategoryFilter === cat
                      ? 'bg-[#9C2744] text-white shadow-2xs'
                      : 'bg-[#FFF5F7] text-[#8C3B50] hover:bg-[#FFEBF0] border border-[#FCD6E0]'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-[#8C3B50] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={serviceSearchQuery}
                onChange={e => setServiceSearchQuery(e.target.value)}
                placeholder="Buscar modalidade, dias, horários..."
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-hidden focus:border-[#D85072]"
              />
            </div>
          </div>

          {/* Cards Grid of Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredServices.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-[#FCD6E0]">
                <p className="text-sm text-[#5B444C]">
                  Nenhum plano ou serviço cadastrado nesta categoria.
                </p>
                <button
                  type="button"
                  onClick={openNewServiceModal}
                  className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#D85072]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Agora</span>
                </button>
              </div>
            ) : (
              filteredServices.map(serv => {
                const badgeColor =
                  serv.planCategory === 'MENSAL'
                    ? 'bg-[#FFEBF0] text-[#9C2744] border-[#FCD6E0]'
                    : serv.planCategory === 'TRIMESTRAL'
                    ? 'bg-[#EBF2FF] text-[#1877F2] border-[#C6DCFF]'
                    : serv.planCategory === 'SEMESTRAL'
                    ? 'bg-[#EBF7EE] text-[#1D7A46] border-[#B6E3C3]'
                    : serv.planCategory === 'ANUAL'
                    ? 'bg-[#FFF9EB] text-[#B45309] border-[#FDE68A]'
                    : 'bg-purple-50 text-purple-700 border-purple-200';

                return (
                  <div
                    key={serv.id}
                    className="bg-white rounded-3xl p-5 border border-[#FCD6E0] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#D85072]/60 transition-all group"
                  >
                    <div>
                      {/* Top badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                          {serv.planCategory}
                        </span>
                        <span className="text-[11px] font-semibold text-[#8C3B50] bg-[#FFF5F7] px-2 py-0.5 rounded-md border border-[#FCD6E0]">
                          {serv.validityDays}
                        </span>
                      </div>

                      <h4 className="font-serif text-base sm:text-lg font-bold text-[#26161B] group-hover:text-[#9C2744] transition-colors">
                        {serv.name}
                      </h4>

                      <p className="text-xs text-[#5B444C] mt-1 font-medium">
                        {serv.modality}
                      </p>

                      {/* Schedule & Days */}
                      <div className="mt-3.5 pt-3 border-t border-[#FCD6E0]/60 space-y-1.5 text-xs text-[#5B444C]">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#D85072] flex-shrink-0" />
                          <span className="font-semibold text-[#26161B]">{serv.daysOfWeek}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-[#D85072] flex-shrink-0" />
                          <span>{serv.schedules}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-3.5 h-3.5 text-[#D85072] flex-shrink-0" />
                          <span>
                            <strong>{serv.classCountTotal} aulas</strong> no pacote ({serv.weeklyClasses}x/semana)
                          </span>
                        </div>
                      </div>

                      {/* Values Grid */}
                      <div className="mt-4 p-3 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#5B444C]">Valor Total:</span>
                          <span className="text-base font-bold text-[#26161B]">
                            {formatBRL(serv.totalValue)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-[#5B444C]">Mensalidade / Parcela:</span>
                          <span className="text-xs font-bold text-[#8C3B50]">
                            {formatBRL(serv.monthlyValue)}/mês
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-[#FCD6E0]/60">
                          <span className="text-[#9C2744]">Academia (50%):</span>
                          <strong className="text-[#9C2744]">{formatBRL(serv.gymPassValue)}</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#1877F2]">Repasse Profissional:</span>
                          <strong className="text-[#1877F2]">{formatBRL(serv.suggestedProfPass)}</strong>
                        </div>
                      </div>

                      {serv.notes && (
                        <p className="text-[11px] text-[#5B444C] italic mt-2.5">
                          "{serv.notes}"
                        </p>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="mt-5 pt-3 border-t border-[#FCD6E0] flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEditServiceModal(serv)}
                          className="p-2 rounded-xl border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] transition-colors"
                          title="Editar serviço"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteService(serv.id, serv.name)}
                          className="p-2 rounded-xl border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0] transition-colors"
                          title="Excluir serviço"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleEnrollWithService(serv)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors"
                        title="Matricular novo aluno neste plano"
                      >
                        <span>Matricular Aluno</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TABELA 1: ABA "AULAS DE PILATES" (SOMENTE CONTROLE E REGISTRO DOS ALUNOS — SEM VALORES) */}
      {/* =================================================================== */}
      {portalSection === 'aulas' && (
        <div className="bg-white rounded-3xl border border-[#FCD6E0] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#FCD6E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#26161B]">
                  Controle e Registro de Alunos — Aulas de Pilates
                </h3>
                <p className="text-xs text-[#5B444C]">
                  {filteredClasses.length} {filteredClasses.length === 1 ? 'aluno registrado' : 'alunos registrados'} • Controle de frequência e aulas realizadas
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C3B50] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar aluno, profissional, plano..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-hidden focus:border-[#D85072]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] font-medium"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="concluido">Concluído</option>
                <option value="trancado">Trancado</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-[#26161B]">
              <thead className="bg-[#FFF5F7] text-[#8C3B50] uppercase text-[10px] sm:text-xs font-bold tracking-wider border-b border-[#FCD6E0]">
                <tr>
                  <th className="px-4 py-3.5">Profissional</th>
                  <th className="px-4 py-3.5">Aluno(a)</th>
                  <th className="px-4 py-3.5">Plano / Modalidade</th>
                  <th className="px-4 py-3.5 text-center">Início</th>
                  <th className="px-4 py-3.5 text-center bg-[#FFEBF0] text-[#9C2744]">AULAS Realizadas</th>
                  <th className="px-4 py-3.5 text-center">Carga Horária</th>
                  <th className="px-4 py-3.5">Observações / Objetivos</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FCD6E0]/60">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-10 text-sm text-[#5B444C]">
                      Nenhum aluno encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(rec => (
                    <tr key={rec.id} className="hover:bg-[#FFFDFB] transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-[#26161B] whitespace-nowrap">
                        {rec.professionalName}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#26161B]">{rec.studentName}</div>
                        {rec.studentPhone && (
                          <a
                            href={`https://wa.me/${rec.studentPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#1D7A46] hover:underline flex items-center gap-1 mt-0.5"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{formatPhoneBR(rec.studentPhone)}</span>
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#FCD6E0] font-medium text-xs">
                          {rec.planType}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center text-xs text-[#5B444C]">
                        {rec.startDate ? new Date(`${rec.startDate}T12:00:00`).toLocaleDateString('pt-BR') : '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center bg-[#FFEBF0]/30">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0]">
                            {formatAulasRealizadas(rec.attendedHours)}
                          </span>
                          <button
                            type="button"
                            onClick={() => quickIncrementAttended(rec.id, rec.attendedHours || 0)}
                            title="Registrar +1 aula realizada"
                            className="px-1.5 py-0.5 rounded-md bg-white border border-[#FCD6E0] text-[#1D7A46] hover:bg-[#EBF7EE] text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            +1
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="font-semibold text-[#26161B]">{rec.totalClassHours}h</div>
                      </td>
                      <td className="px-4 py-3.5 text-xs text-[#5B444C] max-w-xs truncate" title={rec.notes || ''}>
                        {rec.notes || '-'}
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rec.status === 'ativo'
                              ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                              : rec.status === 'concluido'
                              ? 'bg-[#EBF2FF] text-[#1877F2] border border-[#C6DCFF]'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditRecordModal(rec)}
                            className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                            title="Editar cadastro e aulas do aluno"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(rec.id, rec.studentName)}
                            className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0] transition-colors cursor-pointer"
                            title="Excluir matrícula"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* =================================================================== */}
      {/* TABELA 2: ABA "GESTÃO FINANCEIRA" (TUDO RELACIONADO A VALORES!)     */}
      {/* =================================================================== */}
      {portalSection === 'financeiro' && (
        <div className="bg-white rounded-3xl border border-[#FCD6E0] shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#FCD6E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#26161B]">
                  Demonstrativo Financeiro de Planos, Mensalidades e Repasses
                </h3>
                <p className="text-xs text-[#5B444C]">
                  {filteredClasses.length} {filteredClasses.length === 1 ? 'contrato listado' : 'contratos listados'} • Controle de valores, repasse 50% academia e comissões
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C3B50] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar aluno, profissional, plano..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-hidden focus:border-[#D85072]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] font-medium"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="concluido">Concluído</option>
                <option value="trancado">Trancado</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-[#26161B]">
              <thead className="bg-[#FFF5F7] text-[#8C3B50] uppercase text-[10px] sm:text-xs font-bold tracking-wider border-b border-[#FCD6E0]">
                <tr>
                  <th className="px-4 py-3.5">Aluno(a)</th>
                  <th className="px-4 py-3.5">Profissional</th>
                  <th className="px-4 py-3.5">Plano Contratado</th>
                  <th className="px-4 py-3.5 text-right">Valor Total</th>
                  <th className="px-4 py-3.5 text-right">Mensalidade</th>
                  <th className="px-4 py-3.5 text-right bg-[#FFEBF0]/50 text-[#9C2744]">Repasse Academia (50%)</th>
                  <th className="px-4 py-3.5 text-right bg-[#EBF2FF]/50 text-[#1877F2]">Repasse Profissional</th>
                  <th className="px-4 py-3.5 text-right bg-[#EBF7EE]/50 text-[#1D7A46]">Saldo Clínica</th>
                  <th className="px-4 py-3.5 text-right">Valor Hora/Aula</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FCD6E0]/60">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-10 text-sm text-[#5B444C]">
                      Nenhum lançamento financeiro encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(rec => {
                    const clinicNet = (rec.totalPlanValue || 0) - (rec.gymPassValue || 0) - (rec.professionalPassValue || 0);
                    return (
                      <tr key={rec.id} className="hover:bg-[#FFFDFB] transition-colors">
                        <td className="px-4 py-3.5 font-bold text-[#26161B] whitespace-nowrap">
                          {rec.studentName}
                        </td>
                        <td className="px-4 py-3.5 font-semibold text-[#5B444C] whitespace-nowrap">
                          {rec.professionalName}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#FCD6E0] font-medium text-xs">
                            {rec.planType}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#26161B] text-right whitespace-nowrap">
                          {formatBRL(rec.totalPlanValue)}
                        </td>
                        <td className="px-4 py-3.5 text-[#5B444C] text-right whitespace-nowrap font-medium">
                          {formatBRL(rec.monthlyInstallmentValue)}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#9C2744] text-right bg-[#FFEBF0]/20 whitespace-nowrap">
                          {formatBRL(rec.gymPassValue)}
                          <span className="block text-[10px] font-normal text-[#8C3B50]">
                            (50% bruto)
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#1877F2] text-right bg-[#EBF2FF]/20 whitespace-nowrap">
                          {formatBRL(rec.professionalPassValue)}
                        </td>
                        <td className="px-4 py-3.5 font-bold text-[#1D7A46] text-right bg-[#EBF7EE]/20 whitespace-nowrap">
                          {formatBRL(clinicNet)}
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right font-medium text-[#26161B]">
                          {formatBRL(rec.studentHourlyRate)}/h
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              rec.status === 'ativo'
                                ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                                : rec.status === 'concluido'
                                ? 'bg-[#EBF2FF] text-[#1877F2] border border-[#C6DCFF]'
                                : 'bg-gray-100 text-gray-700 border border-gray-300'
                            }`}
                          >
                            {rec.status}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditRecordModal(rec)}
                              className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                              title="Editar valores e repasses"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteClass(rec.id, rec.studentName)}
                              className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0] transition-colors cursor-pointer"
                              title="Excluir registro financeiro"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredClasses.length > 0 && (
                <tfoot className="bg-[#FFF5F7] border-t-2 border-[#FCD6E0] font-bold text-[#26161B]">
                  <tr>
                    <td colSpan={3} className="px-4 py-3.5 text-right uppercase text-xs text-[#8C3B50]">
                      Totais Consolidados:
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      {formatBRL(filteredClasses.reduce((s, c) => s + (c.totalPlanValue || 0), 0))}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#8C3B50]">
                      {formatBRL(filteredClasses.reduce((s, c) => s + (c.monthlyInstallmentValue || 0), 0))}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#9C2744] bg-[#FFEBF0]/40">
                      {formatBRL(filteredClasses.reduce((s, c) => s + (c.gymPassValue || 0), 0))}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#1877F2] bg-[#EBF2FF]/40">
                      {formatBRL(filteredClasses.reduce((s, c) => s + (c.professionalPassValue || 0), 0))}
                    </td>
                    <td className="px-4 py-3.5 text-right whitespace-nowrap text-[#1D7A46] bg-[#EBF7EE]/40">
                      {formatBRL(
                        filteredClasses.reduce(
                          (s, c) => s + ((c.totalPlanValue || 0) - (c.gymPassValue || 0) - (c.professionalPassValue || 0)),
                          0
                        )
                      )}
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TABELA 3: ABA "RELATÓRIOS" (CONSOLIDADO GERAL / PROFISSIONAL / ALUNOS) */}
      {/* =================================================================== */}
      {portalSection === 'relatorios' && subView !== 'servicos' && (
        <div className="bg-white rounded-3xl border border-[#FCD6E0] shadow-sm overflow-hidden">
          {/* Table Toolbar */}
          <div className="p-4 sm:p-6 border-b border-[#FCD6E0] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#26161B]">
                  {subView === 'individual'
                    ? `Alunos Vinculados a ${selectedProfessional}`
                    : 'Registro de Matrículas e Aulas de Pilates'}
                </h3>
                <p className="text-xs text-[#5B444C]">
                  {filteredClasses.length} {filteredClasses.length === 1 ? 'aluno listado' : 'alunos listados'} • Total de repasses consolidados
                </p>
              </div>
            </div>

            {/* Search & Status filter */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-[#8C3B50] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar aluno, profissional, plano..."
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] focus:outline-hidden focus:border-[#D85072]"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full sm:w-auto px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-xs text-[#26161B] font-medium"
              >
                <option value="todos">Todos os Status</option>
                <option value="ativo">Ativo</option>
                <option value="concluido">Concluído</option>
                <option value="trancado">Trancado</option>
              </select>
            </div>
          </div>

          {/* Responsive Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm text-[#26161B]">
              <thead className="bg-[#FFF5F7] text-[#8C3B50] uppercase text-[10px] sm:text-xs font-bold tracking-wider border-b border-[#FCD6E0]">
                <tr>
                  <th className="px-4 py-3.5">Profissional</th>
                  <th className="px-4 py-3.5">Aluno(a)</th>
                  <th className="px-4 py-3.5">Tipo de Plano</th>
                  <th className="px-4 py-3.5 text-right">Valor Total</th>
                  <th className="px-4 py-3.5 text-right">Mensalidade</th>
                  <th className="px-4 py-3.5 text-right bg-[#FFEBF0]/50 text-[#9C2744]">Repasse Academia (50%)</th>
                  <th className="px-4 py-3.5 text-right bg-[#EBF2FF]/50 text-[#1877F2]">Repasse Profissional</th>
                  <th className="px-4 py-3.5 text-right">Valor Hora</th>
                  {/* REQUIREMENT C: AJUSTE DO CAMPO 'HORAS/SEMAN' POR 'AULAS' */}
                  <th className="px-4 py-3.5 text-center bg-[#FFEBF0] text-[#9C2744]">AULAS</th>
                  <th className="px-4 py-3.5 text-center">Total Horas</th>
                  <th className="px-4 py-3.5 text-center">Status</th>
                  <th className="px-4 py-3.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FCD6E0]/60">
                {filteredClasses.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="text-center py-10 text-sm text-[#5B444C]">
                      Nenhum aluno ou plano encontrado para os critérios selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredClasses.map(rec => (
                    <tr key={rec.id} className="hover:bg-[#FFFDFB] transition-colors">
                      {/* Profissional */}
                      <td className="px-4 py-3.5 font-semibold text-[#26161B] whitespace-nowrap">
                        {rec.professionalName}
                      </td>

                      {/* Aluno(a) */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <div className="font-bold text-[#26161B]">{rec.studentName}</div>
                        {rec.studentPhone && (
                          <a
                            href={`https://wa.me/${rec.studentPhone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] text-[#1D7A46] hover:underline flex items-center gap-1 mt-0.5"
                            title="Conversar no WhatsApp"
                          >
                            <MessageCircle className="w-3 h-3" />
                            <span>{formatPhoneBR(rec.studentPhone)}</span>
                          </a>
                        )}
                      </td>

                      {/* Plano */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg bg-[#FAF9F6] border border-[#FCD6E0] font-medium text-xs">
                          {rec.planType}
                        </span>
                      </td>

                      {/* Valor Total */}
                      <td className="px-4 py-3.5 font-bold text-[#26161B] text-right whitespace-nowrap">
                        {formatBRL(rec.totalPlanValue)}
                      </td>

                      {/* Mensalidade */}
                      <td className="px-4 py-3.5 text-[#5B444C] text-right whitespace-nowrap">
                        {formatBRL(rec.monthlyInstallmentValue)}
                      </td>

                      {/* Repasse Academia (50%) */}
                      <td className="px-4 py-3.5 font-bold text-[#9C2744] text-right bg-[#FFEBF0]/20 whitespace-nowrap">
                        {formatBRL(rec.gymPassValue)}
                        <span className="block text-[10px] font-normal text-[#8C3B50]">
                          (50% bruto)
                        </span>
                      </td>

                      {/* Repasse Profissional */}
                      <td className="px-4 py-3.5 font-bold text-[#1877F2] text-right bg-[#EBF2FF]/20 whitespace-nowrap">
                        {formatBRL(rec.professionalPassValue)}
                      </td>

                      {/* Valor Hora */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right font-medium text-[#26161B]">
                        {formatBRL(rec.studentHourlyRate)}/h
                      </td>

                      {/* REQUIREMENT C: COLUNA AULAS (QUANTIDADE DE AULAS REALIZADAS) */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center bg-[#FFEBF0]/30">
                        <div className="inline-flex items-center justify-center gap-1.5">
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0]">
                            {formatAulasRealizadas(rec.attendedHours)}
                          </span>
                          <button
                            type="button"
                            onClick={() => quickIncrementAttended(rec.id, rec.attendedHours || 0)}
                            title="Registrar +1 aula realizada"
                            className="px-1.5 py-0.5 rounded-md bg-white border border-[#FCD6E0] text-[#1D7A46] hover:bg-[#EBF7EE] text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                          >
                            +1
                          </button>
                        </div>
                      </td>

                      {/* Total Horas no Plano */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <div className="font-semibold text-[#26161B]">{rec.totalClassHours}h</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            rec.status === 'ativo'
                              ? 'bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]'
                              : rec.status === 'concluido'
                              ? 'bg-[#EBF2FF] text-[#1877F2] border border-[#C6DCFF]'
                              : 'bg-gray-100 text-gray-700 border border-gray-300'
                          }`}
                        >
                          {rec.status}
                        </span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3.5 whitespace-nowrap text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openEditRecordModal(rec)}
                            className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0] transition-colors"
                            title="Editar matrícula e aulas"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClass(rec.id, rec.studentName)}
                            className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0] transition-colors"
                            title="Excluir matrícula"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
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
      )}

      {/* =================================================================== */}
      {/* REQUIREMENT A: MODAL DE VISUALIZAÇÃO PRÉVIA PARA IMPRESSÃO          */}
      {/* ("mostre na tela a visualização do arquivo para impressão!")        */}
      {/* =================================================================== */}
      {isPrintPreviewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
          onClick={() => setIsPrintPreviewOpen(false)}
        >
          <div
            className="bg-[#3D232B] text-white rounded-3xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl border border-[#FCD6E0]/30 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header / Toolbar — SEM opção para IMPRIMIR, prevalecendo somente Baixar XLS e Baixar PDF */}
            <div className="p-4 sm:p-5 bg-[#2B151C] border-b border-[#FCD6E0]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#D85072]" />
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-white">
                    Visualização do Relatório em Tela
                  </h3>
                </div>
                <p className="text-xs text-rose-200/80 mt-0.5">
                  Confira a diagramação oficial do relatório em tela. Utilize as opções ao lado para Baixar XLS ou Baixar PDF.
                </p>
              </div>

              {/* Action Buttons inside Preview Toolbar: SOMENTE Baixar XLS e Baixar PDF */}
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
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Fechar visualização"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Document Paper Preview Container */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#2A141A]/50 flex justify-center">
              <div
                id="pilates-printable-document"
                ref={printableAreaRef}
                className="w-full max-w-5xl bg-white text-[#26161B] rounded-2xl shadow-2xl p-6 sm:p-8 border border-[#E5E7EB]"
                style={{ minHeight: '600px' }}
              >
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

                {/* Subtitle & Scope */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b-2 border-[#FCD6E0] gap-2">
                  <div>
                    <h2 className="font-serif text-base sm:text-lg font-bold text-[#26161B]">
                      {subView === 'servicos'
                        ? `Relatório Oficial da Tabela de Serviços & Planos (${serviceCategoryFilter})`
                        : portalSection === 'aulas'
                        ? 'Aulas de Pilates — Controle e Registro de Alunos'
                        : portalSection === 'financeiro'
                        ? 'Gestão Financeira — Demonstrativo de Valores, Mensalidades e Repasses'
                        : `Relatório de Aulas de Pilates & Repasses Financeiros — ${activeReportTitleSuffix}`}
                    </h2>
                    <p className="text-xs text-[#5B444C]">
                      {subView === 'servicos'
                        ? `Total de planos e serviços listados: ${filteredServices.length}`
                        : `Total de registros computados: ${activeReportDataset.length}`}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#FFEBF0] text-[#9C2744] border border-[#FCD6E0] w-fit">
                    {subView === 'servicos'
                      ? 'Tabela de Serviços & Planos'
                      : portalSection === 'aulas'
                      ? 'Controle de Alunos & Frequência'
                      : portalSection === 'financeiro'
                      ? 'Gestão Financeira'
                      : 'Central de Relatórios'}
                  </span>
                </div>

                {subView === 'servicos' ? (
                  <table className="w-full text-left text-[11px] border-collapse">
                    <thead>
                      <tr className="bg-[#8C3B50] text-white">
                        <th className="p-2 font-bold">Categoria</th>
                        <th className="p-2 font-bold">Plano / Serviço</th>
                        <th className="p-2 font-bold">Modalidade</th>
                        <th className="p-2 font-bold">Dias / Horários</th>
                        <th className="p-2 font-bold text-center">Aulas</th>
                        <th className="p-2 font-bold text-right">Valor Total</th>
                        <th className="p-2 font-bold text-right">Mensalidade</th>
                        <th className="p-2 font-bold text-right">Academia (50%)</th>
                        <th className="p-2 font-bold text-right">Profissional</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredServices.map((s, i) => (
                        <tr key={s.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                          <td className="p-2 border-b border-[#FCD6E0]/60 font-bold text-[#9C2744]">{s.planCategory}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{s.name}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60">{s.modality}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60">{s.daysOfWeek} • {s.schedules}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60 text-center font-bold">{s.classCountTotal} ({s.weeklyClasses}x/sem)</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold">{formatBRL(s.totalValue)}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60 text-right">{formatBRL(s.monthlyValue)}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#9C2744]">{formatBRL(s.gymPassValue)}</td>
                          <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#1877F2]">{formatBRL(s.suggestedProfPass)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : portalSection === 'aulas' ? (
                  <>
                    {/* KPI Cards on Paper — Somente Controle de Alunos */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#8C3B50] block">Total de Alunos</span>
                        <strong className="text-sm sm:text-base font-bold text-[#26161B]">
                          {filteredClasses.length} alunos
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#EBF7EE]/40 border border-[#B6E3C3]">
                        <span className="text-[10px] uppercase font-bold text-[#1D7A46] block">Alunos Ativos</span>
                        <strong className="text-sm sm:text-base font-bold text-[#1D7A46]">
                          {filteredClasses.filter(c => c.status === 'ativo').length} ativos
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FFEBF0]/30 border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#9C2744] block">Aulas Realizadas</span>
                        <strong className="text-sm sm:text-base font-bold text-[#9C2744]">
                          {filteredClasses.reduce((s, c) => s + (c.attendedHours || 0), 0)} aulas
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#EBF2FF]/40 border border-[#C6DCFF]">
                        <span className="text-[10px] uppercase font-bold text-[#1877F2] block">Carga Horária Total</span>
                        <strong className="text-sm sm:text-base font-bold text-[#1877F2]">
                          {filteredClasses.reduce((s, c) => s + (c.totalClassHours || 0), 0)} horas
                        </strong>
                      </div>
                    </div>

                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-[#8C3B50] text-white">
                          <th className="p-2 font-bold">Profissional</th>
                          <th className="p-2 font-bold">Aluno(a)</th>
                          <th className="p-2 font-bold">WhatsApp</th>
                          <th className="p-2 font-bold">Plano / Modalidade</th>
                          <th className="p-2 font-bold text-center">Início</th>
                          <th className="p-2 font-bold text-center bg-[#6B2234]">AULAS</th>
                          <th className="p-2 font-bold text-center">Carga Horária</th>
                          <th className="p-2 font-bold text-center">Status</th>
                          <th className="p-2 font-bold">Observações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClasses.map((c, i) => (
                          <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                            <td className="p-2 border-b border-[#FCD6E0]/60 font-semibold">{c.professionalName}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{c.studentName}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60">{c.studentPhone ? formatPhoneBR(c.studentPhone) : '-'}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60">{c.planType}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-center">{c.startDate || '-'}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-center font-bold text-[#9C2744] bg-[#FFEBF0]/50">
                              {formatAulasRealizadas(c.attendedHours)}
                            </td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-center font-semibold">{c.totalClassHours}h</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-center uppercase font-bold text-[9px]">
                              {c.status}
                            </td>
                            <td className="p-2 border-b border-[#FCD6E0]/60">{c.notes || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                ) : portalSection === 'financeiro' ? (
                  <>
                    {/* KPI Cards on Paper — Somente Gestão Financeira */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#8C3B50] block">Faturamento Total</span>
                        <strong className="text-sm sm:text-base font-bold text-[#26161B]">
                          {formatBRL(filteredClasses.reduce((s, c) => s + (c.totalPlanValue || 0), 0))}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FFEBF0]/30 border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#9C2744] block">Repasse Academia (50%)</span>
                        <strong className="text-sm sm:text-base font-bold text-[#9C2744]">
                          {formatBRL(filteredClasses.reduce((s, c) => s + (c.gymPassValue || 0), 0))}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#EBF2FF]/40 border border-[#C6DCFF]">
                        <span className="text-[10px] uppercase font-bold text-[#1877F2] block">Repasse Profissionais</span>
                        <strong className="text-sm sm:text-base font-bold text-[#1877F2]">
                          {formatBRL(filteredClasses.reduce((s, c) => s + (c.professionalPassValue || 0), 0))}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#EBF7EE]/40 border border-[#B6E3C3]">
                        <span className="text-[10px] uppercase font-bold text-[#1D7A46] block">Saldo Líquido Clínica</span>
                        <strong className="text-sm sm:text-base font-bold text-[#1D7A46]">
                          {formatBRL(
                            filteredClasses.reduce(
                              (s, c) => s + ((c.totalPlanValue || 0) - (c.gymPassValue || 0) - (c.professionalPassValue || 0)),
                              0
                            )
                          )}
                        </strong>
                      </div>
                    </div>

                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-[#8C3B50] text-white">
                          <th className="p-2 font-bold">Aluno(a)</th>
                          <th className="p-2 font-bold">Profissional</th>
                          <th className="p-2 font-bold">Plano Contratado</th>
                          <th className="p-2 font-bold text-right">Valor Total</th>
                          <th className="p-2 font-bold text-right">Mensalidade</th>
                          <th className="p-2 font-bold text-right">Academia (50%)</th>
                          <th className="p-2 font-bold text-right">Profissional</th>
                          <th className="p-2 font-bold text-right">Saldo Clínica</th>
                          <th className="p-2 font-bold text-right">Valor Hora</th>
                          <th className="p-2 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClasses.map((c, i) => {
                          const net = (c.totalPlanValue || 0) - (c.gymPassValue || 0) - (c.professionalPassValue || 0);
                          return (
                            <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                              <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{c.studentName}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 font-semibold">{c.professionalName}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60">{c.planType}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold">{formatBRL(c.totalPlanValue)}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-right">{formatBRL(c.monthlyInstallmentValue)}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#9C2744]">{formatBRL(c.gymPassValue)}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#1877F2]">{formatBRL(c.professionalPassValue)}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#1D7A46]">{formatBRL(net)}</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-right">{formatBRL(c.studentHourlyRate)}/h</td>
                              <td className="p-2 border-b border-[#FCD6E0]/60 text-center uppercase font-bold text-[9px]">
                                {c.status}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </>
                ) : (
                  <>
                    {/* KPI Cards on Paper (Central de Relatórios) */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                      <div className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#8C3B50] block">Faturamento Total</span>
                        <strong className="text-sm sm:text-base font-bold text-[#26161B]">
                          {formatBRL(activeReportDataset.reduce((s, c) => s + (c.totalPlanValue || 0), 0))}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FFEBF0]/30 border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#9C2744] block">Academia (50%)</span>
                        <strong className="text-sm sm:text-base font-bold text-[#9C2744]">
                          {formatBRL(activeReportDataset.reduce((s, c) => s + (c.gymPassValue || 0), 0))}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#EBF2FF]/40 border border-[#C6DCFF]">
                        <span className="text-[10px] uppercase font-bold text-[#1877F2] block">Profissionais</span>
                        <strong className="text-sm sm:text-base font-bold text-[#1877F2]">
                          {formatBRL(activeReportDataset.reduce((s, c) => s + (c.professionalPassValue || 0), 0))}
                        </strong>
                      </div>
                      <div className="p-3 rounded-xl bg-[#FFFDFB] border border-[#FCD6E0]">
                        <span className="text-[10px] uppercase font-bold text-[#8C3B50] block">Aulas Realizadas</span>
                        <strong className="text-sm sm:text-base font-bold text-[#26161B]">
                          {activeReportDataset.reduce((s, c) => s + (c.attendedHours || 0), 0)} aulas
                        </strong>
                      </div>
                    </div>

                    {/* Printed Table with REQUIREMENT C: Column "AULAS" */}
                    <table className="w-full text-left text-[11px] border-collapse">
                      <thead>
                        <tr className="bg-[#8C3B50] text-white">
                          <th className="p-2 font-bold">Profissional</th>
                          <th className="p-2 font-bold">Aluno(a)</th>
                          <th className="p-2 font-bold">WhatsApp</th>
                          <th className="p-2 font-bold">Plano</th>
                          <th className="p-2 font-bold text-right">Total</th>
                          <th className="p-2 font-bold text-right">Mensal</th>
                          <th className="p-2 font-bold text-right">Academia (50%)</th>
                          <th className="p-2 font-bold text-right">Profissional</th>
                          {/* REQUIREMENT C: AULAS */}
                          <th className="p-2 font-bold text-center bg-[#6B2234]">AULAS</th>
                          <th className="p-2 font-bold text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeReportDataset.map((c, i) => (
                          <tr key={c.id} className={i % 2 === 0 ? 'bg-white' : 'bg-[#FFF8FA]'}>
                            <td className="p-2 border-b border-[#FCD6E0]/60 font-semibold">{c.professionalName}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 font-bold">{c.studentName}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60">{c.studentPhone ? formatPhoneBR(c.studentPhone) : '-'}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60">{c.planType}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold">{formatBRL(c.totalPlanValue)}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-right">{formatBRL(c.monthlyInstallmentValue)}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#9C2744]">{formatBRL(c.gymPassValue)}</td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-right font-bold text-[#1877F2]">{formatBRL(c.professionalPassValue)}</td>
                            {/* REQUIREMENT C: Exact format (5 aulas, 3 aulas, 1 aula, 0 aula) */}
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-center font-bold text-[#9C2744] bg-[#FFEBF0]/50">
                              {formatAulasRealizadas(c.attendedHours)}
                            </td>
                            <td className="p-2 border-b border-[#FCD6E0]/60 text-center uppercase font-bold text-[9px]">
                              {c.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}

                {/* Footer of Printed Document */}
                <div className="mt-8 pt-4 border-t border-[#E5E7EB] flex flex-col sm:flex-row items-center justify-between text-[10px] text-[#5B444C] gap-2">
                  <span>Documento oficial gerado pelo Portal do Administrador • Dra. Léia Mar</span>
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
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPrintPreviewOpen(false)}
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
      {/* REQUIREMENT B: MODAL INSERIR / EDITAR SERVIÇO / PLANO               */}
      {/* =================================================================== */}
      {isServiceModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsServiceModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#FCD6E0] p-6 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#FCD6E0]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744]">
                  Tabela de Serviços & Precificação
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B]">
                  {editingServiceId ? 'Editar Plano / Serviço' : 'Inserir Novo Plano / Serviço'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsServiceModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FFEBF0] text-[#5B444C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="space-y-4">
              {/* Categoria do Plano (MENSAL, TRIMESTRAL, SEMESTRAL, ANUAL, AVULSO) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Categoria do Plano:
                  </label>
                  <select
                    value={servPlanCategory}
                    onChange={e => setServPlanCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm font-bold text-[#9C2744]"
                  >
                    <option value="MENSAL">MENSAL</option>
                    <option value="TRIMESTRAL">TRIMESTRAL</option>
                    <option value="SEMESTRAL">SEMESTRAL</option>
                    <option value="ANUAL">ANUAL</option>
                    <option value="AVULSO">AVULSO (Sessão Única / Avaliação)</option>
                    <option value="PERSONAL">PERSONAL PILATES</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Nome Comercial do Plano / Serviço:
                  </label>
                  <input
                    type="text"
                    value={servName}
                    onChange={e => setServName(e.target.value)}
                    placeholder="Ex: Pilates Aparelhos & Solo - 2x por Semana"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                    required
                  />
                </div>
              </div>

              {/* Modalidade */}
              <div>
                <label className="block text-xs font-bold text-[#26161B] mb-1">
                  Modalidade / Especialidade:
                </label>
                <input
                  type="text"
                  value={servModality}
                  onChange={e => setServModality(e.target.value)}
                  placeholder="Ex: Pilates Clínico & Aparelhos (Reabilitação e Coluna)"
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  required
                />
              </div>

              {/* Valores */}
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-3">
                <span className="text-xs font-bold text-[#8C3B50] uppercase tracking-wider block">
                  Precificação e Repasses
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Valor Total do Plano (R$):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={servTotalValue}
                      onChange={e => handleServiceTotalValueChange(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold text-[#26161B]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Valor Mensalidade (R$/mês):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={servMonthlyValue}
                      onChange={e => setServMonthlyValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold text-[#8C3B50]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#9C2744] mb-1">
                      Repasse Academia (50%):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={servGymValue}
                      onChange={e => setServGymValue(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold text-[#9C2744]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#FCD6E0]">
                  <div>
                    <label className="block text-xs font-bold text-[#1877F2] mb-1">
                      Repasse Sugerido ao Profissional (R$):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={servSuggestedProfPass}
                      onChange={e => setServSuggestedProfPass(parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#C6DCFF] bg-white text-sm font-bold text-[#1877F2]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Vigência / Validade:
                    </label>
                    <input
                      type="text"
                      value={servValidityDays}
                      onChange={e => setServValidityDays(e.target.value)}
                      placeholder="Ex: 30 dias (Mensal) / 90 dias"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Grade de Horários e Dias */}
              <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-3">
                <span className="text-xs font-bold text-[#8C3B50] uppercase tracking-wider block">
                  Grade de Aulas & Horários
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Total de Aulas no Pacote:
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={servClassCountTotal}
                      onChange={e => setServClassCountTotal(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Frequência Semanal (Aulas/Sem):
                    </label>
                    <input
                      type="number"
                      step="1"
                      value={servWeeklyClasses}
                      onChange={e => setServWeeklyClasses(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Dias da Semana Permitidos:
                    </label>
                    <input
                      type="text"
                      value={servDaysOfWeek}
                      onChange={e => setServDaysOfWeek(e.target.value)}
                      placeholder="Ex: Segunda e Quarta ou Terça e Quinta"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Horários de Atendimento:
                    </label>
                    <input
                      type="text"
                      value={servSchedules}
                      onChange={e => setServSchedules(e.target.value)}
                      placeholder="Ex: 07h às 11h | 14h às 19h"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Datas de Início e Fim */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Data de Início da Vigência:
                  </label>
                  <input
                    type="date"
                    value={servStartDate}
                    onChange={e => setServStartDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Data Término (Opcional):
                  </label>
                  <input
                    type="date"
                    value={servEndDate}
                    onChange={e => setServEndDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  />
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-xs font-bold text-[#26161B] mb-1">
                  Observações e Regras de Reposição:
                </label>
                <textarea
                  rows={2}
                  value={servNotes}
                  onChange={e => setServNotes(e.target.value)}
                  placeholder="Ex: Reposições permitidas mediante aviso prévio de 24 horas..."
                  className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                />
              </div>

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => setIsServiceModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-sm transition-all cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingServiceId ? 'Salvar Alterações' : 'Cadastrar Serviço'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CADASTRO DE PROFISSIONAIS                                    */}
      {/* =================================================================== */}
      {isProfModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsProfModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#FCD6E0] p-6 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#FCD6E0]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744]">
                  Equipe Clínica
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B]">
                  Cadastrar & Gerenciar Profissionais
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsProfModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FFEBF0] text-[#5B444C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!isCreatingProf && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingProfId(null);
                    setProfName('');
                    setProfRole('Fisioterapeuta & Instrutora de Pilates');
                    setProfCrefito('');
                    setProfPhone('');
                    setIsCreatingProf(true);
                  }}
                  className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-[#D85072] text-[#9C2744] hover:bg-[#FFEBF0] flex items-center justify-center gap-2 font-bold text-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Cadastrar Novo Profissional</span>
                </button>
              )}

              {isCreatingProf && (
                <form onSubmit={handleSaveProfessional} className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-3">
                  <h4 className="text-sm font-bold text-[#26161B]">
                    {editingProfId ? 'Editar Profissional' : 'Novo Profissional'}
                  </h4>
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Nome Completo:
                    </label>
                    <input
                      type="text"
                      value={profName}
                      onChange={e => setProfName(e.target.value)}
                      placeholder="Ex: Dra. Larissa Carvalho"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#26161B] mb-1">
                        Cargo / Função:
                      </label>
                      <input
                        type="text"
                        value={profRole}
                        onChange={e => setProfRole(e.target.value)}
                        placeholder="Fisioterapeuta e Instrutora"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#26161B] mb-1">
                        CREFITO:
                      </label>
                      <input
                        type="text"
                        value={profCrefito}
                        onChange={e => setProfCrefito(e.target.value)}
                        placeholder="Ex: 34567-F"
                        className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Telefone / WhatsApp:
                    </label>
                    <input
                      type="text"
                      value={profPhone}
                      onChange={e => setProfPhone(e.target.value)}
                      placeholder="(92) 99999-9999"
                      className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingProf(false);
                        setEditingProfId(null);
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs text-[#5B444C] hover:bg-[#FFEBF0]"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859]"
                    >
                      Salvar
                    </button>
                  </div>
                </form>
              )}

              {/* Lista dos profissionais */}
              <div className="space-y-2.5">
                {professionals.map(p => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-white border border-[#FCD6E0] flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div>
                      <h5 className="font-bold text-sm text-[#26161B]">{p.name}</h5>
                      <p className="text-xs text-[#5B444C]">
                        {p.roleTitle || 'Instrutora de Pilates'} {p.crefito && `• CREFITO: ${p.crefito}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => startEditProf(p)}
                        className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FFEBF0]"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D85072]" />
                      </button>
                      {professionals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteProf(p.id, p.name)}
                          className="p-1.5 rounded-lg border border-[#FCD6E0] text-[#9C2744] hover:bg-[#FDEDF0]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-6 border-t border-[#FCD6E0] flex items-center justify-between">
              <button
                type="button"
                onClick={resetProfessionalsList}
                className="text-xs text-[#8C3B50] hover:underline"
              >
                Restaurar Profissionais Padrão
              </button>
              <button
                type="button"
                onClick={() => setIsProfModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#D85072] text-white text-xs font-semibold hover:bg-[#BC3859]"
              >
                Concluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: MATRÍCULA / EDIÇÃO DE ALUNO (COM CAMPO 'AULAS REALIZADAS')   */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl border border-[#FCD6E0] p-6 sm:p-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#FCD6E0]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744]">
                  {portalSection === 'financeiro'
                    ? 'Gestão Financeira & Repasses'
                    : 'Controle & Registro de Alunos'}
                </span>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B]">
                  {portalSection === 'financeiro'
                    ? editingId
                      ? 'Editar Valores e Repasses do Contrato'
                      : 'Lançar Novo Contrato / Valores'
                    : editingId
                    ? 'Editar Registro do Aluno(a)'
                    : 'Cadastrar Aluno(a) na Aula de Pilates'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl hover:bg-[#FFEBF0] text-[#5B444C]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitClassForm} className="space-y-4">
              {/* Seleção do Profissional */}
              <div>
                <label className="block text-xs font-bold text-[#26161B] mb-1">
                  a) Nome do Profissional Responsável:
                </label>
                <select
                  value={formProfName}
                  onChange={e => setFormProfName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm font-semibold text-[#26161B]"
                >
                  {professionalsList.map(name => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                  <option value="outro">+ Outro Profissional...</option>
                </select>
                {formProfName === 'outro' && (
                  <input
                    type="text"
                    value={formCustomProf}
                    onChange={e => setFormCustomProf(e.target.value)}
                    placeholder="Digite o nome completo do profissional"
                    className="mt-2 w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                    required
                  />
                )}
              </div>

              {/* Dados do Aluno */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    b) Nome do Aluno(a):
                  </label>
                  <input
                    type="text"
                    value={formStudentName}
                    onChange={e => setFormStudentName(e.target.value)}
                    placeholder="Nome completo do aluno(a)"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Telefone / WhatsApp:
                  </label>
                  <input
                    type="text"
                    value={formStudentPhone}
                    onChange={e => setFormStudentPhone(e.target.value)}
                    placeholder="(92) 99999-9999"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  />
                </div>
              </div>

              {/* Carregar da Tabela de Serviços */}
              <div className="p-3.5 rounded-2xl bg-[#FFF5F7] border border-[#FCD6E0]">
                <label className="block text-xs font-bold text-[#9C2744] mb-1 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-[#D85072]" />
                  <span>c) Selecionar Plano / Modalidade:</span>
                </label>
                <select
                  onChange={e => handleSelectServiceForStudent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-white text-xs font-semibold text-[#26161B]"
                >
                  <option value="">-- Escolher um plano pré-configurado da Tabela --</option>
                  {services.map(s => (
                    <option key={s.id} value={s.id}>
                      {portalSection === 'aulas'
                        ? `[${s.planCategory}] ${s.name} (${s.classCountTotal} aulas)`
                        : `[${s.planCategory}] ${s.name} — ${formatBRL(s.totalValue)} (${s.classCountTotal} aulas)`}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={formPlanType}
                  onChange={e => setFormPlanType(e.target.value)}
                  placeholder="Ou personalize o nome do plano aqui"
                  className="mt-2 w-full px-3 py-1.5 rounded-xl border border-[#FCD6E0] bg-white text-xs"
                />
              </div>

              {/* Valores do Plano: EXIBIDO SOMENTE EM "GESTÃO FINANCEIRA" (ou Relatórios/Serviços) */}
              {portalSection !== 'aulas' && (
                <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#26161B] mb-1">
                        d) Valor Total do Plano (R$):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formTotalPlanValue}
                        onChange={e => {
                          const val = parseFloat(e.target.value) || 0;
                          setFormTotalPlanValue(val);
                          setFormGymPassValue(Number((val * 0.5).toFixed(2)));
                        }}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold text-[#26161B]"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#26161B] mb-1">
                        e) Mensalidade / Parcela (R$/mês):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formMonthlyValue}
                        onChange={e => setFormMonthlyValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm font-bold text-[#8C3B50]"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#FCD6E0]">
                    <div className="bg-[#FFEBF0]/30 p-2.5 rounded-xl border border-[#FCD6E0]">
                      <label className="block text-xs font-bold text-[#9C2744] mb-1">
                        f) Repasse Academia (50% do bruto):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formGymPassValue}
                        onChange={e => setFormGymPassValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#FCD6E0] bg-white text-sm font-bold text-[#9C2744]"
                        required
                      />
                    </div>

                    <div className="bg-[#EBF2FF]/30 p-2.5 rounded-xl border border-[#C6DCFF]">
                      <label className="block text-xs font-bold text-[#1877F2] mb-1">
                        g) Repasse para o Profissional (R$):
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formProfPassValue}
                        onChange={e => setFormProfPassValue(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-1.5 rounded-lg border border-[#C6DCFF] bg-white text-sm font-bold text-[#1877F2]"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* CAMPO "AULAS" (AULAS REALIZADAS PELO ALUNO) — Exibido em "Aulas de Pilates" (e Relatórios/Serviços) */}
              {portalSection !== 'financeiro' && (
                <div className="p-4 rounded-2xl bg-[#FFEBF0]/40 border-2 border-[#FCD6E0] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="block text-xs font-bold text-[#9C2744] uppercase tracking-wider">
                        AULAS REALIZADAS PELO ALUNO(A):
                      </label>
                      <p className="text-[11px] text-[#5B444C]">
                        Quantidade de aulas computadas e concluídas pelo aluno (ex: 5 aulas, 3 aulas, 1 aula, 0 aula).
                      </p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-white text-[#9C2744] border border-[#FCD6E0]">
                      {formatAulasRealizadas(formAttendedAulas)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormAttendedAulas(prev => Math.max(0, prev - 1))}
                      className="px-3 py-2 rounded-xl bg-white border border-[#FCD6E0] text-sm font-bold text-[#8C3B50] hover:bg-[#FFEBF0]"
                    >
                      -1 Aula
                    </button>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={formAttendedAulas}
                      onChange={e => setFormAttendedAulas(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full text-center px-3 py-2 rounded-xl border border-[#FCD6E0] bg-white text-base font-bold text-[#9C2744]"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setFormAttendedAulas(prev => prev + 1)}
                      className="px-3 py-2 rounded-xl bg-[#9C2744] text-white border border-[#9C2744] text-sm font-bold hover:bg-[#8C3B50]"
                    >
                      +1 Aula
                    </button>
                  </div>
                </div>
              )}

              {/* Carga Horária Total, Valor Hora e Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {portalSection !== 'aulas' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      h) Valor Hora Aula (R$):
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formHourlyRate}
                      onChange={e => setFormHourlyRate(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm font-semibold"
                      required
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-[#26161B] mb-1">
                      Data de Início:
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={e => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm font-semibold"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Total Horas do Plano:
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={formTotalHours}
                    onChange={e => setFormTotalHours(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Status:
                  </label>
                  <select
                    value={formStatus}
                    onChange={e => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] text-sm"
                  >
                    <option value="ativo">Ativo</option>
                    <option value="concluido">Concluído</option>
                    <option value="trancado">Trancado</option>
                  </select>
                </div>
              </div>

              {/* Observações */}
              {portalSection !== 'financeiro' && (
                <div>
                  <label className="block text-xs font-bold text-[#26161B] mb-1">
                    Observações Clínicas / Objetivos do Aluno:
                  </label>
                  <textarea
                    rows={2}
                    value={formNotes}
                    onChange={e => setFormNotes(e.target.value)}
                    placeholder="Ex: Hérnia de disco, foco em fortalecimento de core e estabilidade..."
                    className="w-full px-3.5 py-2 rounded-xl border border-[#FCD6E0] bg-white text-sm"
                  />
                </div>
              )}

              {/* Botões */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#FCD6E0]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-[#5B444C] hover:bg-[#FFEBF0]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-sm transition-all"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {portalSection === 'financeiro'
                      ? editingId
                        ? 'Salvar Valores'
                        : 'Concluir Lançamento'
                      : editingId
                      ? 'Salvar Registro'
                      : 'Concluir Matrícula'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO (ALUNO / SERVIÇO / PROFISSIONAL)   */}
      {/* =================================================================== */}
      {itemToDelete && (
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
                  Tem certeza que deseja excluir permanentemente{' '}
                  {itemToDelete.type === 'service'
                    ? 'o plano/serviço '
                    : itemToDelete.type === 'prof'
                    ? 'o profissional '
                    : 'o registro de '}
                  <strong className="text-[#9C2744]">{itemToDelete.name}</strong>?
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#FCD6E0]/70">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#5B444C] bg-white hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmDeleteItem}
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
