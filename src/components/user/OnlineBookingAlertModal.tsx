import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Clock,
  Phone,
  User,
  Volume2,
  VolumeX,
  MessageCircle,
  Mail,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Info,
  Sparkles,
  HelpCircle,
  FileCheck,
  X
} from 'lucide-react';
import { Appointment } from '../../types';
import { alertSoundManager } from '../../utils/alertSound';
import { updateAppointmentStatus, dismissPendingAlertAppointment } from '../../data/bookingStore';
import { CLINIC_INFO } from '../../data/content';
import { formatPhoneBR } from '../../utils/phoneFormatter';

interface OnlineBookingAlertModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmed?: (updatedApt: Appointment) => void;
}

export const OnlineBookingAlertModal: React.FC<OnlineBookingAlertModalProps> = ({
  appointment,
  isOpen,
  onClose,
  onConfirmed
}) => {
  const [isSoundMuted, setIsSoundMuted] = useState(false);
  const [isConfirmedView, setIsConfirmedView] = useState(() => appointment?.status === 'confirmado');
  const [copiedText, setCopiedText] = useState(false);
  const [autoOpenWhatsAppTriggered, setAutoOpenWhatsAppTriggered] = useState(false);

  // Sincroniza visualização confirmada se o agendamento já estiver confirmado
  useEffect(() => {
    if (appointment?.status === 'confirmado') {
      setIsConfirmedView(true);
    }
  }, [appointment?.id, appointment?.status]);

  // Inicia e encerra o som contínuo baseado no estado do modal (apenas para agendamentos pendentes)
  useEffect(() => {
    if (isOpen && appointment && !isConfirmedView && appointment.status === 'pendente') {
      if (!isSoundMuted) {
        alertSoundManager.startContinuousAlert();
      }
    } else {
      alertSoundManager.stopContinuousAlert();
    }

    return () => {
      alertSoundManager.stopContinuousAlert();
    };
  }, [isOpen, appointment, isConfirmedView, isSoundMuted]);

  // Se o modal fechar, reseta visualizações internas
  useEffect(() => {
    if (!isOpen) {
      setIsConfirmedView(false);
      setCopiedText(false);
      setAutoOpenWhatsAppTriggered(false);
    }
  }, [isOpen]);

  if (!isOpen || !appointment) return null;

  // Formatação de data em PT-BR legível
  const formatDateBR = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const [year, month, day] = parts;
        const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
        const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
        const dayOfWeek = dayNames[d.getDay()] || '';
        return `${day}/${month}/${year} (${dayOfWeek})`;
      }
    } catch (e) {}
    return dateStr;
  };

  // Limpa o telefone para link internacional WhatsApp
  const cleanPhoneForWhatsApp = (rawPhone: string) => {
    const numbersOnly = rawPhone.replace(/\D/g, '');
    if (numbersOnly.length === 10 || numbersOnly.length === 11) {
      return `55${numbersOnly}`;
    }
    return numbersOnly;
  };

  // Mensagem formal, acolhedora e profissional de confirmação automática
  const confirmationMessage = `*CONFIRMAÇÃO DE AGENDAMENTO • ${CLINIC_INFO.name.toUpperCase()}* 🌸

Olá, *${appointment.patientName}*! Tudo bem?

Confirmamos com muita alegria o seu agendamento no nosso estúdio! Seguem os dados da sua sessão:

📅 *Data:* ${formatDateBR(appointment.date)}
⏰ *Horário:* ${appointment.timeSlot}h
🩺 *Serviço:* ${appointment.service}
👩‍⚕️ *Profissional:* Dra. Léia Mar (Fisioterapeuta • ${CLINIC_INFO.crefito})
📍 *Local:* ${CLINIC_INFO.address}

💡 *Recomendações importantes para o seu dia:*
1. Venha com roupas confortáveis e leves que facilitem o movimento;
2. Por favor, chegue com 5 a 10 minutos de antecedência;
3. Se possuir exames recentes de imagem (ressonâncias, raio-X), pode trazê-los na consulta.

Qualquer dúvida ou necessidade de reagendamento, basta nos responder por aqui. Estamos ansiosos para recebê-lo(a)!`;

  const whatsAppPhoneClean = cleanPhoneForWhatsApp(appointment.patientPhone);
  const whatsAppUrl = `https://api.whatsapp.com/send?phone=${whatsAppPhoneClean}&text=${encodeURIComponent(confirmationMessage)}`;

  // Ação ao clicar em "Confirmar Agendamento"
  const handleConfirmAppointment = () => {
    // 1. Interrompe som contínuo e toca carrilhão de sucesso
    alertSoundManager.stopContinuousAlert();
    alertSoundManager.playSuccessChime();

    // 2. Muda imediatamente para o quadro de notificação automática online (permanece na tela)
    setIsConfirmedView(true);

    // 3. Atualiza status no banco e localstorage para confirmado
    updateAppointmentStatus(appointment.id, 'confirmado');
    dismissPendingAlertAppointment(appointment.id);

    const updated = { ...appointment, status: 'confirmado' as const };
    if (onConfirmed) {
      onConfirmed(updated);
    }
  };

  const handleCopyMessage = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(confirmationMessage);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 3000);
    }
  };

  const handleSendWhatsAppNotification = () => {
    window.open(whatsAppUrl, '_blank');
    setAutoOpenWhatsAppTriggered(true);
  };

  const handleDismissLater = () => {
    alertSoundManager.stopContinuousAlert();
    dismissPendingAlertAppointment(appointment.id);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#14080B]/70 backdrop-blur-xs animate-fade-in"
    >
      {/* Quadro de Alerta Centralizado */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-[#D85072]/40 overflow-hidden text-[#26161B] animate-scale-in">
        {/* Faixa Superior com Gradiente e Efeito Pulsante de Alerta */}
        <div className="h-3 w-full bg-gradient-to-r from-[#D85072] via-[#BC3859] to-[#9C2744] relative overflow-hidden">
          <div className="absolute inset-0 bg-white/30 animate-pulse" />
        </div>

        {/* ======================= TELA 1: QUADRO DE ALERTA COM SOM CONTÍNUO ======================= */}
        {!isConfirmedView ? (
          <div className="p-5 sm:p-6">
            {/* Header do Alerta com Efeito Sonoro */}
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-[#FDEDF0] border border-[#FCD6E0] flex items-center justify-center text-[#D85072] shadow-sm">
                    <Bell className="w-6 h-6 animate-bounce text-[#D85072]" />
                  </div>
                  {/* Ping de pulso visual sincronizado com o som */}
                  {!isSoundMuted && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D85072] opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-[#D85072]"></span>
                    </span>
                  )}
                </div>
                <div>
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FDEDF0] text-[#9C2744] border border-[#FCD6E0] mb-0.5">
                    Novo Agendamento Online
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#26161B] leading-tight">
                    Solicitação Recebida!
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Botão de Controle de Som */}
                <button
                  type="button"
                  onClick={() => {
                    if (isSoundMuted) {
                      setIsSoundMuted(false);
                      alertSoundManager.startContinuousAlert();
                    } else {
                      setIsSoundMuted(true);
                      alertSoundManager.stopContinuousAlert();
                    }
                  }}
                  className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    isSoundMuted
                      ? 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                      : 'bg-[#FFEBF0] border-[#FCD6E0] text-[#D85072] hover:bg-[#FCD6E0]'
                  }`}
                  title={isSoundMuted ? 'Ativar som contínuo' : 'Pausar som contínuo'}
                >
                  {isSoundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 animate-pulse" />}
                </button>

                {/* Botão Fechar Modal */}
                <button
                  type="button"
                  onClick={handleDismissLater}
                  className="p-2 rounded-xl border border-[#FCD6E0]/60 bg-white hover:bg-[#FFEBF0] text-[#8C3B50] hover:text-[#9C2744] transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Aviso Textual em Destaque */}
            <div className="mb-4 p-3 rounded-2xl bg-[#FFF9F7] border border-[#FCD6E0] text-xs text-[#5B444C] leading-relaxed">
              <span className="font-bold text-[#9C2744]">Atenção:</span> Um aluno(a) e/ou novo paciente acabou de realizar um agendamento online na plataforma. O alerta sonoro permanecerá ativo até a confirmação!
            </div>

            {/* Cartão de Informações Obrigatórias (Nome, Contato, Data e Hora) */}
            <div className="space-y-2.5 bg-[#FFFDFB] rounded-2xl border border-[#FCD6E0] p-4 shadow-2xs mb-5">
              {/* 1. Nome da Pessoa */}
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                    Aluno(a) / Novo Paciente
                  </span>
                  <p className="text-sm sm:text-base font-bold text-[#26161B] truncate">
                    {appointment.patientName}
                  </p>
                </div>
              </div>

              {/* 2. Contato */}
              <div className="flex items-start gap-3 pt-2 border-t border-[#FCD6E0]/50">
                <div className="w-8 h-8 rounded-xl bg-[#EBF7EE] text-[#1D7A46] flex items-center justify-center shrink-0 mt-0.5">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                    Contato WhatsApp / Telefone
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[#1D7A46]">
                      {formatPhoneBR(appointment.patientPhone)}
                    </span>
                    {appointment.patientPhone && (
                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(appointment.patientPhone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-[#1D7A46] hover:underline font-bold"
                      >
                        <MessageCircle className="w-3 h-3" />
                        Conversar
                      </a>
                    )}
                  </div>
                  {appointment.patientEmail && (
                    <span className="text-xs text-[#5B444C] block mt-0.5 truncate">
                      {appointment.patientEmail}
                    </span>
                  )}
                </div>
              </div>

              {/* 3. Data e Hora Agendada */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#FCD6E0]/50">
                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FFEBF0] text-[#9C2744] flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                      Data
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#26161B]">
                      {formatDateBR(appointment.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#FDEDF0] text-[#D85072] flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                      Horário
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#9C2744]">
                      {appointment.timeSlot}h
                    </span>
                  </div>
                </div>
              </div>

              {/* Serviço Solicitado */}
              <div className="pt-2 border-t border-[#FCD6E0]/50">
                <span className="text-[10px] font-bold text-[#8C3B50] uppercase tracking-wider block">
                  Serviço Solicitado
                </span>
                <span className="text-xs font-semibold text-[#5B444C]">
                  {appointment.service}
                </span>
                {appointment.notes && (
                  <p className="text-[11px] text-[#8C3B50] italic mt-1 bg-[#FFF9F7] p-2 rounded-lg border border-[#FCD6E0]/40">
                    "{appointment.notes}"
                  </p>
                )}
              </div>
            </div>

            {/* Ações: CONFIRMAR AGENDAMENTO (Interrompe som e gera notificação online) */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmAppointment}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#1D7A46] to-[#156035] hover:from-[#156035] hover:to-[#0F4928] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.99] cursor-pointer"
              >
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span>Confirmar Agendamento</span>
              </button>

              <button
                type="button"
                onClick={handleDismissLater}
                className="w-full py-2 px-3 text-xs font-semibold text-[#8C3B50] hover:text-[#26161B] hover:bg-[#FFEBF0] rounded-xl transition-colors cursor-pointer text-center"
              >
                Lembrar mais tarde (Manter Pendente)
              </button>
            </div>
          </div>
        ) : (
          /* ======================= TELA 2: NOTIFICAÇÃO AUTOMÁTICA ONLINE AO CLIENTE ======================= */
          <div className="p-5 sm:p-6 animate-fade-in">
            {/* Header de Sucesso com Botão de Fechar */}
            <div className="relative text-center mb-4">
              <button
                type="button"
                onClick={onClose}
                className="absolute right-0 top-0 p-1.5 rounded-xl text-gray-400 hover:text-[#9C2744] hover:bg-[#FFEBF0] transition-colors cursor-pointer"
                title="Fechar notificação"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3] mx-auto flex items-center justify-center mb-2 shadow-xs">
                <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#1D7A46]">
                Agendamento Confirmado com Sucesso!
              </h3>
            </div>

            {/* Resumo da Notificação Online para o Cliente */}
            <div className="bg-[#FFFDFB] rounded-2xl border border-[#FCD6E0] p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-[#26161B] flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-[#1D7A46]" />
                  Notificação Automática Online
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-[#EBF7EE] text-[#1D7A46] border border-[#B6E3C3]">
                  100% Sem Custo
                </span>
              </div>
              <p className="text-xs text-[#5B444C] leading-relaxed mb-3">
                Para avisar <strong>{appointment.patientName}</strong> imediatamente, utilize uma das opções gratuitas abaixo:
              </p>

              {/* Botão de Disparo Direto no WhatsApp (Solução Recomendada Sem Custo) */}
              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setAutoOpenWhatsAppTriggered(true)}
                className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99] mb-2.5 cursor-pointer no-underline"
              >
                <MessageCircle className="w-4 h-4 text-white" />
                <span>
                  {autoOpenWhatsAppTriggered ? 'Reenviar WhatsApp para o Cliente' : 'Enviar WhatsApp de Confirmação Agora'}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/80" />
              </a>

              {/* Botão Copiar Texto Completo de Confirmação */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyMessage}
                  className="py-2 px-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFF9F7] hover:bg-[#FFEBF0] text-xs font-bold text-[#8C3B50] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedText ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-[#1D7A46]" />
                      <span className="text-[#1D7A46]">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Mensagem</span>
                    </>
                  )}
                </button>

                {appointment.patientEmail && (
                  <a
                    href={`mailto:${appointment.patientEmail}?subject=${encodeURIComponent(`Confirmação de Agendamento • ${CLINIC_INFO.name}`)}&body=${encodeURIComponent(confirmationMessage)}`}
                    className="py-2 px-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFF9F7] hover:bg-[#FFEBF0] text-xs font-bold text-[#8C3B50] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Disparar E-mail</span>
                  </a>
                )}
              </div>
            </div>

            {/* Botão de Fechar Modal */}
            <button
              type="button"
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-xl bg-[#26161B] hover:bg-[#3D252D] text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              Concluir & Fechar Aviso
            </button>
            <p className="text-[11px] text-[#8C3B50] text-center mt-2 font-medium">
              Esta tela permanece no Portal do Usuário para notificar o paciente. Clique em Concluir quando finalizar.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
