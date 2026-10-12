import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  LogOut,
  ArrowLeft,
  Calendar,
  Clock,
  Award,
  Stethoscope,
  Eye,
  EyeOff,
  AlertCircle,
  Users,
  Tag,
  UserPlus,
  FileText,
  DollarSign,
  BarChart3,
  Bell,
  Volume2,
  Sparkles,
  Banknote
} from 'lucide-react';
import { useUserAuth } from '../data/userAuthStore';
import { AdminAulasPilatesTab } from './admin/AdminAulasPilatesTab';
import { AdminAgendaMarcacoesTab } from './admin/AdminAgendaMarcacoesTab';
import { AdminHistoricoClinicoTab } from './admin/AdminHistoricoClinicoTab';
import { AdminHorariosBloqueiosTab } from './admin/AdminHorariosBloqueiosTab';
import { AdminDashboardTab } from './admin/AdminDashboardTab';
import { AdminFolhaPagamentoTab } from './admin/AdminFolhaPagamentoTab';
import { useClinicData } from '../data/clinicStore';
import { safeStorage } from '../utils/safeStorage';
import {
  getAppointments,
  getPendingAlertAppointment,
  dismissPendingAlertAppointment,
  bookAppointment,
  startCrossDeviceAlertPolling,
  syncAppointmentsWithServer,
  PENDING_ALERT_STORAGE_KEY
} from '../data/bookingStore';
import { Appointment } from '../types';
import { alertSoundManager } from '../utils/alertSound';
import { OnlineBookingAlertModal } from './user/OnlineBookingAlertModal';

interface UserPortalProps {
  onBackToSite: () => void;
  onSwitchToAdmin?: () => void;
}

export type UserTab =
  | 'aulas'
  | 'financeiro'
  | 'dashboard'
  | 'appointments'
  | 'historico'
  | 'schedule'
  | 'servicos'
  | 'profissionais'
  | 'folha'
  | 'relatorios';

export const UserPortal: React.FC<UserPortalProps> = ({ onBackToSite, onSwitchToAdmin }) => {
  const clinic = useClinicData();
  const { isAuthenticated, login, logout } = useUserAuth();

  // Login form state
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Active User Tab
  const [activeTab, setActiveTab] = useState<UserTab>('aulas');

  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());
  const pendingCount = appointments.filter(a => a.status === 'pendente').length;

  // Alerta centralizado com som contínuo no Portal do Usuário (SÓ ativa em novo agendamento real)
  const [alertAppointment, setAlertAppointment] = useState<Appointment | null>(null);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const isAlertModalOpenRef = useRef(false);
  isAlertModalOpenRef.current = isAlertModalOpen;

  // Estados de oscilação clicados pelo usuário conforme Tela 21
  const [hasClickedOnlineAlert, setHasClickedOnlineAlert] = useState(false);

  // Monitora agendamentos em tempo real via servidor (recebe alertas de celulares, tablets e outros computadores)
  // Ativo enquanto o Portal do Usuário estiver aberto
  useEffect(() => {
    // Limpa alertas legados de demonstração para evitar qualquer toque involuntário
    try {
      safeStorage.removeItem('dra_leia_pending_alert_apt_id_v1');
      safeStorage.removeItem('dra_leia_pending_alert_apt_id_v2');
    } catch (_) {}

    // Sincroniza imediatamente com o servidor para carregar novos agendamentos feitos externamente
    syncAppointmentsWithServer().then((serverApts) => {
      setAppointments(serverApts);
      const pending = serverApts.find(a => a.status === 'pendente');
      if (pending && !isAlertModalOpenRef.current) {
        setAlertAppointment(pending);
      }
    }).catch(() => {});

    // Ouvinte em tempo real local (mesma aba)
    const handleNewBooking = (e: Event) => {
      const customEvt = e as CustomEvent<Appointment>;
      if (customEvt.detail) {
        setAppointments(getAppointments());
        setHasClickedOnlineAlert(false);
        if (!isAlertModalOpenRef.current) {
          setAlertAppointment(customEvt.detail);
          setIsAlertModalOpen(true);
        }
      }
    };

    // Ouvinte entre abas: SÓ ativa se um novo agendamento real for gravado em outra aba
    const handleStorageChange = (e: StorageEvent) => {
      const fresh = getAppointments();
      setAppointments(fresh);
      if (e.key === PENDING_ALERT_STORAGE_KEY && e.newValue) {
        const pending = getPendingAlertAppointment() || fresh.find(a => a.status === 'pendente');
        if (pending && !isAlertModalOpenRef.current) {
          setAlertAppointment(pending);
          setIsAlertModalOpen(true);
          setHasClickedOnlineAlert(false);
        }
      }
    };

    // Ouvinte de sincronização de agendamentos com o servidor
    const handleAppointmentsSynced = (e: Event) => {
      const customEvt = e as CustomEvent<Appointment[]>;
      if (Array.isArray(customEvt.detail)) {
        setAppointments(customEvt.detail);
      } else {
        setAppointments(getAppointments());
      }
    };

    // Ouvinte de alerta silenciado
    const handleAlertSilenced = () => {
      // Para o som contínuo caso tenha sido silenciado
      alertSoundManager.stopContinuousAlert();
      // NUNCA fecha o modal automaticamente! A tela de confirmação e notificação
      // deve permanecer parada na página (Portal do Usuário) para que a equipe
      // possa notificar o novo paciente/aluno(a) sem interrupção.
      setAppointments(getAppointments());
    };

    window.addEventListener('new-online-booking', handleNewBooking);
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('appointments-synced', handleAppointmentsSynced);
    window.addEventListener('alert-silenced', handleAlertSilenced);

    // Inicia monitoramento ativo do servidor para capturar cadastros vindos de celulares e outros dispositivos externos
    const stopCrossDevicePolling = startCrossDeviceAlertPolling((serverApt) => {
      setAppointments(getAppointments());
      setHasClickedOnlineAlert(false);
      if (!isAlertModalOpenRef.current) {
        setAlertAppointment(serverApt);
        setIsAlertModalOpen(true);
      }
    });

    return () => {
      stopCrossDevicePolling();
      window.removeEventListener('new-online-booking', handleNewBooking);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('appointments-synced', handleAppointmentsSynced);
      window.removeEventListener('alert-silenced', handleAlertSilenced);
    };
  }, [isAuthenticated]);

  // Função para simular/testar o alerta sonoro e visual a qualquer momento no Portal do Usuário
  // Ação robusta ao clicar no botão Alerta Online
  const handleOpenOnlineAlert = async () => {
    setHasClickedOnlineAlert(true);
    let freshApts = getAppointments();
    try {
      const serverApts = await syncAppointmentsWithServer();
      if (Array.isArray(serverApts) && serverApts.length > 0) {
        freshApts = serverApts;
      }
    } catch (_) {}
    setAppointments(freshApts);

    const pending = getPendingAlertAppointment() || freshApts.find(a => a.status === 'pendente');
    if (pending) {
      setAlertAppointment(pending);
      setIsAlertModalOpen(true);
    } else {
      // Se não há pendências no momento, abre o último agendamento recebido para visualização
      const latest = freshApts[0] || null;
      if (latest) {
        setAlertAppointment(latest);
        setIsAlertModalOpen(true);
      }
    }
  };

  const handleSimulateOnlineBooking = () => {
    const samplePatients = [
      { name: 'Mariana Frota Ribeiro', phone: '(92) 99182-3344', service: 'Pilates Personalizado', notes: 'Dores crônicas na cervical e ombros por trabalho remoto.' },
      { name: 'Rodrigo Albuquerque Paiva', phone: '(92) 98411-9022', service: 'Avaliação Fisioterapêutica & Pilates', notes: 'Indicação médica ortopédica para fortalecimento de coluna.' },
      { name: 'Beatriz Vasconcelos de Oliveira', phone: '(92) 99344-8822', service: 'Reabilitação do Movimento & Coluna', notes: 'Hérnia de disco L5-S1, precisa de reabilitação postural.' },
      { name: 'Carlos Eduardo Nogueira', phone: '(92) 98210-5567', service: 'Pilates para Terceira Idade', notes: 'Foco em equilíbrio, estabilidade e ganho de massa muscular.' }
    ];
    const picked = samplePatients[Math.floor(Math.random() * samplePatients.length)];

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateStr = tomorrow.toISOString().split('T')[0];
    const hours = ['08:00', '09:00', '10:00', '14:00', '15:00', '16:00', '17:00'];
    const timeSlot = hours[Math.floor(Math.random() * hours.length)];

    const newApt = bookAppointment({
      patientName: picked.name,
      patientPhone: picked.phone,
      patientEmail: `${picked.name.toLowerCase().split(' ')[0]}@gmail.com`,
      date: dateStr,
      timeSlot,
      service: picked.service,
      notes: picked.notes,
      status: 'pendente'
    });

    setAlertAppointment(newApt);
    setIsAlertModalOpen(true);
    setAppointments(getAppointments());
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!passwordInput) {
      setLoginError('Por favor, digite sua senha de acesso.');
      return;
    }
    const success = login(passwordInput);
    if (success) {
      setPasswordInput('');
    } else {
      setLoginError('Senha incorreta. Verifique suas credenciais de acesso.');
    }
  };

  // IF NOT AUTHENTICATED: Show professional login screen for User Portal
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#211317] flex flex-col justify-center items-center p-4 selection:bg-[#D85072] selection:text-white">
        <div className="w-full max-w-md bg-[#FFFDFB] rounded-[28px] shadow-2xl border border-[#FCD6E0] p-8 sm:p-10 relative overflow-hidden">
          {/* Top accent banner */}
          <div className="absolute top-0 left-0 right-0 h-2.5 bg-gradient-to-r from-[#D85072] via-[#BC3859] to-[#9C2744]" />

          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-[#FFEBF0] text-[#D85072] mx-auto flex items-center justify-center shadow-inner mb-4 border border-[#FCD6E0]">
              <Users className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#26161B] tracking-tight">
              Portal do Usuário
            </h1>
            <p className="text-xs text-[#8C3B50] font-semibold uppercase tracking-wider mt-1">
              Corpo Técnico • Instrutores & Fisioterapia
            </p>
            <p className="text-sm text-[#5B444C] mt-2">
              Aulas de Pilates, Gestão Financeira, Folha de Pagamento, Dashboard com Gráficos, Agenda & Marcações, Histórico Clínico, Horário & Bloqueios da Agenda, Tabela de Serviços e Planos, Cadastro de Profissionais e Relatórios.
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
                Senha de Acesso
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
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C3B50] hover:text-[#26161B] p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] text-white font-semibold text-sm hover:from-[#BC3859] hover:to-[#9C2744] transition-all shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar no Portal do Usuário</span>
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#FCD6E0]/60 text-center">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#8C3B50] hover:text-[#26161B] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Retornar ao Site Público (One Page)</span>
            </button>
          </div>
        </div>

        {/* Alerta Online enquanto o Portal do Usuário estiver aberto */}
        <OnlineBookingAlertModal
          isOpen={isAlertModalOpen}
          appointment={alertAppointment}
          onClose={() => {
            setIsAlertModalOpen(false);
            const closedId = alertAppointment?.id;
            if (closedId) {
              dismissPendingAlertAppointment(closedId);
            }
            const fresh = getAppointments();
            setAppointments(fresh);
            const nextPending = fresh.find(a => a.status === 'pendente' && a.id !== closedId);
            if (nextPending) {
              setTimeout(() => {
                setAlertAppointment(nextPending);
                setIsAlertModalOpen(true);
              }, 300);
            }
          }}
          onConfirmed={(updatedApt) => {
            setAlertAppointment(updatedApt);
            setAppointments(getAppointments());
          }}
        />
      </div>
    );
  }

  // AUTHENTICATED: User Portal with all required options
  return (
    <div className="min-h-screen bg-[#FFFDFB] text-[#26161B] flex flex-col selection:bg-[#D85072] selection:text-white">
      {/* Top User Navigation Bar */}
      <header className="bg-white border-b border-[#FCD6E0] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* User Brand */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] border border-[#FCD6E0] flex items-center justify-center text-[#D85072] font-serif font-bold text-base shadow-xs">
                LM
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-lg sm:text-xl font-bold text-[#26161B] tracking-tight">
                    Portal do Usuário
                  </h1>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]">
                    Perfil Operacional
                  </span>
                </div>
                <p className="text-xs text-[#8C3B50] hidden sm:block">
                  Dra. Léia Mar • Studio de Fisioterapia & Pilates
                </p>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Botão de Alerta Online Oficial: SEMPRE visível e 100% operacional */}
              <button
                type="button"
                onClick={handleOpenOnlineAlert}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer ${
                  pendingCount > 0
                    ? `text-white bg-[#DC2626] hover:bg-[#B91C1C] ${!hasClickedOnlineAlert ? 'animate-oscillate-red' : ''}`
                    : 'text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0]'
                }`}
                title="Alerta Online de novos agendamentos recebidos em tempo real"
              >
                <Bell className={`w-3.5 h-3.5 ${pendingCount > 0 ? 'text-white' : 'text-[#D85072]'}`} />
                <span>
                  Alerta Online{pendingCount > 0 ? ` (${pendingCount})` : ' (0)'}
                </span>
                {pendingCount > 0 && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                )}
              </button>

              {/* Botão de Simulação / Teste do Alerta para fins de validação */}
              <button
                type="button"
                onClick={handleSimulateOnlineBooking}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold text-[#8C3B50] bg-[#FFF9F7] hover:bg-[#FFEBF0] border border-[#FCD6E0] transition-colors cursor-pointer shadow-2xs"
                title="Simular chegada de novo agendamento online com som contínuo"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#D85072]" />
                <span className="hidden lg:inline">Testar Alerta Sonoro</span>
                <span className="lg:hidden">Testar Som</span>
              </button>

              <button
                type="button"
                onClick={onBackToSite}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#8C3B50] hover:text-[#26161B] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                title="Voltar ao site público"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Voltar ao Site</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-[#9C2744] bg-[#FDEDF0] hover:bg-[#FCD6E0] transition-colors border border-[#FCD6E0] cursor-pointer"
                title="Encerrar sessão no Portal do Usuário"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair</span>
              </button>
            </div>
          </div>

          {/* User Portal Tabs: ALL REQUIRED FUNCTIONS */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 py-2.5 border-t border-[#FCD6E0]/60">
            {/* 1. Aulas de Pilates (Somente Controle e Registro dos Alunos) */}
            <button
              onClick={() => setActiveTab('aulas')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'aulas'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Aulas de Pilates</span>
            </button>

            {/* 2. Gestão Financeira (Tudo Relacionado a Valores) */}
            <button
              onClick={() => setActiveTab('financeiro')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'financeiro'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Gestão Financeira</span>
            </button>

            {/* 3. DASHBOARD (Inteligência & Gráficos PowerBI) */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'dashboard'
                  ? 'bg-[#9C2744] text-white shadow-xs font-bold'
                  : 'text-[#9C2744] bg-[#FFEBF0]/70 hover:bg-[#FFEBF0] border border-[#FCD6E0]'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>DASHBOARD</span>
            </button>

            {/* 4. Agenda & Marcações - Cor padrão da plataforma com contador de novos cadastros */}
            <button
              onClick={() => setActiveTab('appointments')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'appointments'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Agenda & Marcações</span>
              {pendingCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center font-bold ${
                  activeTab === 'appointments'
                    ? 'bg-white text-[#D85072]'
                    : 'bg-[#D85072] text-white'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>

            {/* 5. Histórico Clínico */}
            <button
              onClick={() => setActiveTab('historico')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'historico'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Histórico Clínico</span>
            </button>

            {/* 6. Horário & Bloqueios da Agenda */}
            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'schedule'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Horário & Bloqueios da Agenda</span>
            </button>

            {/* 7. Tabela de Serviços e Planos */}
            <button
              onClick={() => setActiveTab('servicos')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'servicos'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>Tabela de Serviços e Planos</span>
            </button>

            {/* 8. Cadastro de Profissionais */}
            <button
              onClick={() => setActiveTab('profissionais')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'profissionais'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Cadastro de Profissionais</span>
            </button>

            {/* 9. Folha de Pagamento */}
            <button
              onClick={() => setActiveTab('folha')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'folha'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <Banknote className="w-4 h-4" />
              <span>Folha de Pagamento</span>
            </button>

            {/* 10. Relatório Geral Consolidado conforme Tela 22 */}
            <button
              onClick={() => setActiveTab('relatorios')}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                activeTab === 'relatorios'
                  ? 'bg-[#D85072] text-white shadow-xs font-bold'
                  : 'text-[#5B444C] hover:bg-[#FFEBF0] hover:text-[#9C2744]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Relatório Geral Consolidado</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Tab Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* TABS 1, 2, 6, 7, 8: AULAS DE PILATES, GESTÃO FINANCEIRA, TABELA DE SERVIÇOS, CADASTRO DE PROFISSIONAIS E RELATÓRIOS */}
        {(activeTab === 'aulas' ||
          activeTab === 'financeiro' ||
          activeTab === 'servicos' ||
          activeTab === 'profissionais' ||
          activeTab === 'relatorios') && (
          <AdminAulasPilatesTab
            portalSection={activeTab}
            initialSubView={activeTab === 'servicos' ? 'servicos' : 'geral'}
          />
        )}

        {/* TAB DASHBOARD: INTELIGÊNCIA & GRÁFICOS POWERBI */}
        {activeTab === 'dashboard' && (
          <AdminDashboardTab isUserPortal={true} />
        )}

        {/* TAB 2: AGENDA & MARCAÇÕES */}
        {activeTab === 'appointments' && (
          <AdminAgendaMarcacoesTab isUserPortal={true} />
        )}

        {/* TAB 3: HISTÓRICO CLÍNICO */}
        {activeTab === 'historico' && (
          <AdminHistoricoClinicoTab />
        )}

        {/* TAB 4: HORÁRIOS & BLOQUEIOS */}
        {activeTab === 'schedule' && (
          <AdminHorariosBloqueiosTab isUserPortal={true} />
        )}

        {/* TAB 5: FOLHA DE PAGAMENTO (COLETA E CONSOLIDAÇÃO DE DIAS, AULAS, HORAS E VALORES DOS INSTRUTORES) */}
        {activeTab === 'folha' && (
          <AdminFolhaPagamentoTab isUserPortal={true} />
        )}
      </main>

      {/* Footer Note */}
      <footer className="bg-white border-t border-[#FCD6E0] py-4 text-center text-xs text-[#8C3B50]">
        <span>Portal do Usuário • {clinic.name} • CREFITO {clinic.crefito} • Sistema Restrito em Conformidade com a LGPD</span>
      </footer>

      {/* MODAL OFICIAL DE ALERTA ONLINE DO PORTAL DO USUÁRIO */}
      <OnlineBookingAlertModal
        isOpen={isAlertModalOpen}
        appointment={alertAppointment}
        onClose={() => {
          setIsAlertModalOpen(false);
          const closedId = alertAppointment?.id;
          if (closedId) {
            dismissPendingAlertAppointment(closedId);
          }
          const fresh = getAppointments();
          setAppointments(fresh);
          const nextPending = fresh.find(a => a.status === 'pendente' && a.id !== closedId);
          if (nextPending) {
            setTimeout(() => {
              setAlertAppointment(nextPending);
              setIsAlertModalOpen(true);
            }, 300);
          }
        }}
        onConfirmed={(updatedApt) => {
          setAlertAppointment(updatedApt);
          setAppointments(getAppointments());
        }}
      />
    </div>
  );
};
