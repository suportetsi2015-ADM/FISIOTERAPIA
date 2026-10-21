import React, { useState, useRef, useEffect } from 'react';
import {
  Lock,
  LogOut,
  ExternalLink,
  Camera,
  Upload,
  RotateCcw,
  CheckCircle2,
  Calendar,
  Clock,
  Clock3,
  FileText,
  Trash2,
  Search,
  Check,
  Ban,
  Save,
  Plus,
  AlertCircle,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Edit3,
  Building,
  Phone,
  MapPin,
  Sparkles,
  Heart,
  ShieldCheck,
  CheckCircle,
  MessageCircle,
  KeyRound,
  ArrowLeft,
  HelpCircle,
  Share2,
  Award,
  Stethoscope,
  Tag,
  Users,
  UserPlus,
  DollarSign,
  BarChart3,
  Banknote,
  Sliders,
  Palette
} from 'lucide-react';
import { useAdminAuth } from '../data/adminAuthStore';
import { setUserPassword } from '../data/userAuthStore';
import { useOfficialPhotos, processImageFile, saveOfficialPhoto, resetOfficialPhotos } from '../data/photoStore';
import {
  getStoredClinicData,
  saveStoredClinicData,
  resetStoredClinicData,
  ClinicData
} from '../data/clinicStore';
import {
  getScheduleConfig,
  saveScheduleConfig,
  getAppointments,
  updateAppointmentStatus,
  deleteAppointment,
  exportAppointmentsToXLS,
  exportAppointmentsToPDF,
  startCrossDeviceAlertPolling
} from '../data/bookingStore';
import { Appointment, ScheduleConfig, AppointmentStatus } from '../types';
import { AdminInicioTab } from './admin/AdminInicioTab';
import { AdminSobreTab } from './admin/AdminSobreTab';
import { AdminEspacoTab } from './admin/AdminEspacoTab';
import { AdminLocalizacaoTab } from './admin/AdminLocalizacaoTab';
import { AdminFaqTab } from './admin/AdminFaqTab';
import { AdminCabecalhoTab } from './admin/AdminCabecalhoTab';
import { AdminRodapeTab } from './admin/AdminRodapeTab';
import { AdminPaletaCoresTab } from './admin/AdminPaletaCoresTab';
import { AdminOfficialPhotoSyncModal } from './admin/AdminOfficialPhotoSyncModal';

interface AdminPortalProps {
  onBackToSite: () => void;
}

export type AdminTab =
  | 'inicio'
  | 'cabecalho'
  | 'sobre'
  | 'espaco'
  | 'localizacao'
  | 'faq'
  | 'rodape'
  | 'paleta'
  | 'security';

export const AdminPortal: React.FC<AdminPortalProps> = ({ onBackToSite }) => {
  const { isAuthenticated, login, logout, changePassword } = useAdminAuth();

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin tabs
  const [activeTab, setActiveTab] = useState<AdminTab>('inicio');

  // Photo management state
  const photos = useOfficialPhotos();
  const portraitFileRef = useRef<HTMLInputElement>(null);
  const heroFileRef = useRef<HTMLInputElement>(null);
  const [photoToast, setPhotoToast] = useState<string | null>(null);
  const [isUploadingPortrait, setIsUploadingPortrait] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  // Clinic data state
  const [clinicForm, setClinicForm] = useState<ClinicData>(getStoredClinicData());
  const [contentSavedToast, setContentSavedToast] = useState(false);

  // Appointments state
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  // Sincronização e monitoramento contínuo em tempo real via servidor para múltiplos aparelhos
  useEffect(() => {
    if (!isAuthenticated) return;
    const handleUpdate = () => {
      setAppointments(getAppointments());
    };
    window.addEventListener('appointments-synced', handleUpdate);
    window.addEventListener('new-online-booking', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    const stopPolling = startCrossDeviceAlertPolling();
    return () => {
      stopPolling();
      window.removeEventListener('appointments-synced', handleUpdate);
      window.removeEventListener('new-online-booking', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [isAuthenticated]);

  // Sincroniza dados da clínica em tempo real caso alterados de outro dispositivo
  useEffect(() => {
    const handleClinicSync = () => {
      setClinicForm(getStoredClinicData());
    };
    window.addEventListener('dra_leia_clinic_data_changed', handleClinicSync);
    window.addEventListener('admin-sync-clinic_data', handleClinicSync);
    return () => {
      window.removeEventListener('dra_leia_clinic_data_changed', handleClinicSync);
      window.removeEventListener('admin-sync-clinic_data', handleClinicSync);
    };
  }, []);

  // Schedule config state
  const [scheduleConfig, setScheduleConfigState] = useState<ScheduleConfig>(getScheduleConfig());

  // Sincroniza configurações da agenda em tempo real
  useEffect(() => {
    const handleScheduleSync = () => {
      setScheduleConfigState(getScheduleConfig());
    };
    window.addEventListener('admin-sync-schedule_config', handleScheduleSync);
    return () => {
      window.removeEventListener('admin-sync-schedule_config', handleScheduleSync);
    };
  }, []);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [blockDateInput, setBlockDateInput] = useState('');
  const [scheduleToast, setScheduleToast] = useState(false);

  // Modal para sincronização definitiva das fotos oficiais no servidor global
  const [photoSyncModalOpen, setPhotoSyncModalOpen] = useState(false);

  // Security tab state
  const [newPassInput, setNewPassInput] = useState('');
  const [confirmPassInput, setConfirmPassInput] = useState('');
  const [newUserPassInput, setNewUserPassInput] = useState('');
  const [confirmUserPassInput, setConfirmUserPassInput] = useState('');
  const [securityToast, setSecurityToast] = useState('');
  const [securityError, setSecurityError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!passwordInput) {
      setLoginError('Por favor, informe a senha de acesso.');
      return;
    }
    const success = login(passwordInput);
    if (success) {
      setPasswordInput('');
    } else {
      setLoginError('Senha incorreta. Verifique suas credenciais de acesso.');
    }
  };

  // Handlers for Photo upload (100% verbatim / no modification)
  const handleUploadPhoto = async (type: 'portrait' | 'studioHero', file: File) => {
    try {
      if (type === 'portrait') setIsUploadingPortrait(true);
      else setIsUploadingHero(true);

      const dataUrl = await processImageFile(file);
      saveOfficialPhoto(type, dataUrl);
      setPhotoToast(
        type === 'portrait'
          ? 'Foto da Dra. Léia Mar atualizada com 100% de fidelidade (original sem modificações)!'
          : 'Foto do Estúdio atualizada com 100% de fidelidade!'
      );
      setTimeout(() => setPhotoToast(null), 4500);
    } catch (err) {
      setPhotoToast(err instanceof Error ? err.message : 'Erro ao processar imagem');
      setTimeout(() => setPhotoToast(null), 4500);
    } finally {
      if (type === 'portrait') setIsUploadingPortrait(false);
      else setIsUploadingHero(false);
    }
  };

  // Handler for saving clinic content
  const handleSaveClinicContent = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredClinicData(clinicForm);
    setContentSavedToast(true);
    setTimeout(() => setContentSavedToast(false), 3500);
  };

  const handleResetClinicContent = () => {
    resetStoredClinicData();
    setClinicForm(getStoredClinicData());
    setContentSavedToast(true);
    setTimeout(() => setContentSavedToast(false), 3500);
  };

  // Appointment actions
  const handleStatusChange = (id: string, status: AppointmentStatus) => {
    const updated = updateAppointmentStatus(id, status);
    setAppointments([...updated]);
  };

  const handleDeleteAppointment = (id: string) => {
    const updated = deleteAppointment(id);
    setAppointments([...updated]);
  };

  // Schedule config actions
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
    const updatedSlots = scheduleConfig.availableSlots.filter((s: string) => s !== slot);
    setScheduleConfigState({
      ...scheduleConfig,
      availableSlots: updatedSlots
    });
  };

  const handleAddBlockedDate = () => {
    if (!blockDateInput) return;
    const currentBlocks = scheduleConfig.blockedDates || [];
    if (currentBlocks.includes(blockDateInput)) {
      return;
    }
    setScheduleConfigState({
      ...scheduleConfig,
      blockedDates: [...currentBlocks, blockDateInput].sort()
    });
    setBlockDateInput('');
  };

  const handleRemoveBlockedDate = (dateStr: string) => {
    setScheduleConfigState({
      ...scheduleConfig,
      blockedDates: (scheduleConfig.blockedDates || []).filter((d: string) => d !== dateStr)
    });
  };

  const handleSaveScheduleConfig = () => {
    saveScheduleConfig(scheduleConfig);
    setScheduleToast(true);
    setTimeout(() => setScheduleToast(false), 3500);
  };

  // Security password change (Admin)
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityToast('');
    if (newPassInput.length < 4) {
      setSecurityError('A nova senha deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newPassInput !== confirmPassInput) {
      setSecurityError('As duas senhas digitadas não coincidem.');
      return;
    }
    try {
      changePassword(newPassInput);
      setSecurityToast('Senha do Administrador alterada com sucesso! Utilize-a em seu próximo acesso.');
      setNewPassInput('');
      setConfirmPassInput('');
    } catch (err) {
      setSecurityError(err instanceof Error ? err.message : 'Erro ao alterar senha');
    }
  };

  // Security password change (User)
  const handleChangeUserPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecurityToast('');
    if (newUserPassInput.length < 4) {
      setSecurityError('A nova senha do usuário deve ter no mínimo 4 caracteres.');
      return;
    }
    if (newUserPassInput !== confirmUserPassInput) {
      setSecurityError('As duas senhas do usuário digitadas não coincidem.');
      return;
    }
    try {
      setUserPassword(newUserPassInput);
      setSecurityToast('Senha do Usuário alterada com sucesso! Utilize-a no próximo acesso ao Portal do Usuário.');
      setNewUserPassInput('');
      setConfirmUserPassInput('');
    } catch (err) {
      setSecurityError(err instanceof Error ? err.message : 'Erro ao alterar senha do usuário');
    }
  };

  // Filtered appointments
  const filteredAppointments = appointments.filter(apt => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientPhone.includes(searchQuery) ||
      apt.service.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || apt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAppointments = appointments.length;
  const pendingCount = appointments.filter(a => a.status === 'pendente').length;
  const confirmedCount = appointments.filter(a => a.status === 'confirmado').length;

  // IF NOT AUTHENTICATED: Show professional login screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#211317] flex flex-col justify-center items-center p-4 selection:bg-[#D85072] selection:text-white">
        <div className="w-full max-w-md bg-[#FFFDFB] rounded-[28px] shadow-2xl border border-[#FCD6E0] p-8 sm:p-10 relative overflow-hidden">
          {/* Top accent banner */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#D85072] via-[#BC3859] to-[#9C2744]" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FFEBF0] text-[#D85072] mx-auto flex items-center justify-center shadow-inner mb-4 border border-[#FCD6E0]">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#26161B] tracking-tight">
              Acesso do Administrador
            </h1>
            <p className="text-xs text-[#8C3B50] font-semibold uppercase tracking-wider mt-1">
              GESTÃO DE CONTROLE
            </p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDF0] border border-[#FCD6E0] text-xs font-semibold text-[#9C2744] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-[#26161B] uppercase tracking-wider mb-2">
                Senha de Administrador
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder=""
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl border border-[#FCD6E0] bg-white text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072] focus:border-transparent transition-all pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C3B50] hover:text-[#26161B] p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar no Painel Administrativo</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#FCD6E0]/60 text-center">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C3B50] hover:text-[#26161B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retornar ao Site Público (One Page)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // AUTHENTICATED: Full Administrator Portal
  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#26161B] flex flex-col selection:bg-[#D85072] selection:text-white">
      {/* Top Admin Navigation Bar */}
      <header className="bg-white border-b border-[#FCD6E0] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Admin Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] border border-[#FCD6E0] flex items-center justify-center text-[#D85072] font-serif font-bold text-base shadow-xs">
                LM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-bold text-[#26161B] leading-none">
                    Portal do Administrador
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#EBF7EE] border border-[#B6E3C3] text-[#1D7A46] text-[10px] font-bold uppercase tracking-wider">
                    Acesso Externo
                  </span>
                </div>
                <p className="text-xs text-[#8C3B50] mt-0.5">
                  Dra. Léia Mar • Gestão Individual & Privada
                </p>
              </div>
            </div>

            {/* Quick Actions & Logout */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setPhotoSyncModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-[#D85072] to-[#9C2744] hover:from-[#BC3859] hover:to-[#7E1D34] shadow-sm transition-all cursor-pointer"
                title="Substituir e gravar definitivamente as fotos 100% originais da Dra. Léia Mar no servidor global"
              >
                <Upload className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Fotos Oficiais (Servidor)</span>
                <span className="md:hidden">Fotos</span>
              </button>


              <button
                onClick={onBackToSite}
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#26161B] bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors"
                title="Abrir a One Page pública para conferir o visual"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#D85072]" />
                <span>Ver One Page</span>
              </button>

              <button
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-[#9C2744] bg-[#FDEDF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors"
                title="Encerrar sessão de administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 border-t border-[#FCD6E0]/60 py-2.5">
            <button
              onClick={() => setActiveTab('inicio')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'inicio'
                  ? 'bg-[#D85072] text-white shadow-xs'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => setActiveTab('cabecalho')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'cabecalho'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>Cabeçalho & Logo</span>
            </button>

            <button
              onClick={() => setActiveTab('sobre')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'sobre'
                  ? 'bg-[#D85072] text-white shadow-xs'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span>Sobre a Dra.</span>
            </button>

            <button
              onClick={() => setActiveTab('espaco')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'espaco'
                  ? 'bg-[#D85072] text-white shadow-xs'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>Espaço</span>
            </button>

            <button
              onClick={() => setActiveTab('localizacao')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'localizacao'
                  ? 'bg-[#D85072] text-white shadow-xs'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>Localização</span>
            </button>

            <button
              onClick={() => setActiveTab('faq')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-[#D85072] text-white shadow-xs'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Perguntas & Respostas</span>
            </button>

            <button
              onClick={() => setActiveTab('rodape')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'rodape'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Rodapé & Logo</span>
            </button>

            <button
              onClick={() => setActiveTab('paleta')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === 'paleta'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Palette className="w-4 h-4" />
              <span>Paleta de Cores (Layout)</span>
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                activeTab === 'security'
                  ? 'bg-[#D85072] text-white shadow-xs'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <KeyRound className="w-4 h-4" />
              <span>Segurança & Senha</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        
        {/* =================================================================== */}
        {/* TAB 1: ABA INÍCIO                                                  */}
        {/* =================================================================== */}
        {activeTab === 'inicio' && (
          <AdminInicioTab
            clinicForm={clinicForm}
            setClinicForm={setClinicForm}
            onSaved={() => setContentSavedToast(true)}
          />
        )}

        {/* =================================================================== */}
        {/* TAB 2: ABA SOBRE A DRA. LÉIA MAR                                   */}
        {/* =================================================================== */}
        {activeTab === 'sobre' && (
          <AdminSobreTab
            clinicForm={clinicForm}
            setClinicForm={setClinicForm}
            onSaved={() => setContentSavedToast(true)}
          />
        )}

        {/* =================================================================== */}
        {/* TAB 3: ABA ESPAÇO (PROCEDIMENTOS)                                  */}
        {/* =================================================================== */}
        {activeTab === 'espaco' && (
          <AdminEspacoTab />
        )}

        {/* =================================================================== */}
        {/* TAB 4: ABA LOCALIZAÇÃO                                             */}
        {/* =================================================================== */}
        {activeTab === 'localizacao' && (
          <AdminLocalizacaoTab
            clinicForm={clinicForm}
            setClinicForm={setClinicForm}
            onSaved={() => setContentSavedToast(true)}
          />
        )}


        {/* =================================================================== */}
        {/* TAB 6: ABA PERGUNTAS & RESPOSTAS (FAQ DA DRA. LÉIA MAR)             */}
        {/* =================================================================== */}
        {activeTab === 'faq' && (
          <AdminFaqTab />
        )}

        {/* =================================================================== */}
        {/* TAB CABEÇALHO & LOGO (INSERIR, ALTERAR, MODIFICAR, EDITAR, EXCLUIR) */}
        {/* =================================================================== */}
        {activeTab === 'cabecalho' && (
          <AdminCabecalhoTab />
        )}

        {/* =================================================================== */}
        {/* TAB 7: ABA RODAPÉ & LOGO (TEXTOS, REDES SOCIAIS E LINKS)            */}
        {/* =================================================================== */}
        {activeTab === 'rodape' && (
          <AdminRodapeTab />
        )}

        {/* =================================================================== */}
        {/* TAB 8: PALETA DE CORES & LAYOUT COMPLETO DA ONE PAGE               */}
        {/* =================================================================== */}
        {activeTab === 'paleta' && (
          <AdminPaletaCoresTab />
        )}

        {/* =================================================================== */}
        {/* TAB 5: SEGURANÇA & SENHA DE ACESSO INDIVIDUAL                      */}
        {/* =================================================================== */}
        {activeTab === 'security' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#26161B]">
                Segurança e Acesso Individual do Administrador
              </h2>
              <p className="text-sm text-[#5B444C] mt-1 max-w-2xl">
                Altere a sua senha de acesso a este portal externo. Certifique-se de guardar sua nova senha em local seguro.
              </p>
            </div>

            {securityToast && (
              <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{securityToast}</span>
              </div>
            )}

            {securityError && (
              <div className="p-4 rounded-2xl bg-[#FDEDF0] border border-[#FCD6E0] text-xs sm:text-sm font-semibold text-[#9C2744] flex items-center gap-2.5 shadow-sm animate-in fade-in duration-200">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{securityError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <form onSubmit={handleChangePasswordSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#26161B]">
                  Alterar Senha do Administrador
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newPassInput}
                    onChange={(e) => setNewPassInput(e.target.value)}
                    placeholder="Mínimo de 4 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-2">
                    Confirme a Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmPassInput}
                    onChange={(e) => setConfirmPassInput(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Salvar Nova Senha</span>
                </button>
              </form>

              <form onSubmit={handleChangeUserPasswordSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-5">
                <h3 className="font-serif text-lg font-bold text-[#26161B]">
                  Alterar Senha do Usuário
                </h3>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-2">
                    Nova Senha
                  </label>
                  <input
                    type="password"
                    value={newUserPassInput}
                    onChange={(e) => setNewUserPassInput(e.target.value)}
                    placeholder="Mínimo de 4 caracteres"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#26161B] mb-2">
                    Confirme a Nova Senha
                  </label>
                  <input
                    type="password"
                    value={confirmUserPassInput}
                    onChange={(e) => setConfirmUserPassInput(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#FCD6E0] text-sm text-[#26161B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-xs sm:text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Salvar Nova Senha</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>

      {/* Modal de sincronização definitiva das fotos oficiais no servidor */}
      <AdminOfficialPhotoSyncModal
        isOpen={photoSyncModalOpen}
        onClose={() => setPhotoSyncModalOpen(false)}
      />
    </div>
  );
};
