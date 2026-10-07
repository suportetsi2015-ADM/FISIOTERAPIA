import React, { useState } from 'react';
import { X, Send, Calendar, CheckCircle2, Shield, Bell, MessageCircle } from 'lucide-react';
import { CLINIC_INFO, getWhatsAppUrl } from '../data/content';
import { BookingFormData } from '../types';
import { bookAppointment } from '../data/bookingStore';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    phone: '',
    email: '',
    interest: 'Pilates Personalizado',
    preferredTime: 'Manhã',
    acceptedPrivacy: true,
  });

  const [submitted, setSubmitted] = useState(false);
  const [whatsAppMsg, setWhatsAppMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim() || !formData.acceptedPrivacy) {
      return;
    }

    // Prepare customized message for WhatsApp
    const message = `Olá Dra. Léia! Meu nome é ${formData.name}. Gostaria de agendar uma avaliação de Pilates.
• Meu WhatsApp: ${formData.phone}
${formData.email ? `• E-mail: ${formData.email}\n` : ''}• Interesse principal: ${formData.interest}
• Preferência de horário: ${formData.preferredTime}`;

    setWhatsAppMsg(message);

    // Registra agendamento no sistema para disparar o alerta online com som contínuo na plataforma
    try {
      const today = new Date();
      const dateStr = today.toISOString().split('T')[0];
      const slot = formData.preferredTime.includes('Tarde') ? '15:00' : '09:00';
      bookAppointment({
        patientName: formData.name,
        patientPhone: formData.phone,
        patientEmail: formData.email,
        date: dateStr,
        timeSlot: slot,
        service: formData.interest,
        notes: `Solicitado via formulário rápido. Turno preferido: ${formData.preferredTime}`,
        status: 'pendente'
      });
    } catch (e) {
      console.error(e);
    }

    setSubmitted(true);
  };

  const handleCloseModal = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-[#1E2421]/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      onClick={handleCloseModal}
    >
      <div
        className="relative max-w-lg w-full bg-[#FAF9F6] rounded-3xl shadow-2xl border border-[#E8E0D5] p-6 sm:p-8 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={handleCloseModal}
          className="absolute top-5 right-5 p-2 rounded-full text-[#66706B] hover:text-[#1E2421] hover:bg-[#E8EDE8] transition-colors"
          aria-label="Fechar janela"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-6 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[#E8EDE8] text-[#4A5D4E] flex items-center justify-center mb-4 shadow-xs">
              <CheckCircle2 className="w-9 h-9 text-[#3A6B48]" />
            </div>
            <h3 className="font-serif text-2xl font-semibold text-[#1E2421] mb-2">
              Solicitação Registrada!
            </h3>
            <p className="text-sm text-[#444E49] max-w-xs mb-5">
              Obrigado, <strong>{formData.name}</strong>! Seus dados foram recebidos com sucesso.
            </p>

            {/* Aviso de Alerta Emitido na Plataforma */}
            <div className="bg-[#EBF7EE] border border-[#B6E3C3] rounded-2xl p-4 text-left mb-6 w-full text-xs text-[#1D7A46]">
              <div className="flex items-start gap-2.5">
                <Bell className="w-4 h-4 text-[#1D7A46] mt-0.5 flex-shrink-0 animate-bounce" />
                <div>
                  <p className="font-bold text-[#14532D]">
                    ✓ Alerta Sonoro Ativado na Plataforma!
                  </p>
                  <p className="text-[#2C6E49] mt-0.5">
                    A recepção da Dra. Léia Mar já foi notificada em tempo real (alerta com som contínuo disparado em até 2,5 segundos).
                  </p>
                  <p className="text-[11px] text-[#3B6C4F] mt-1.5 bg-white/80 p-2 rounded-lg border border-[#B6E3C3]">
                    📌 O envio da mensagem pelo WhatsApp abaixo é <strong>100% opcional</strong>. O alerta na plataforma <strong>não depende</strong> do seu envio e já está funcionando!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <a
                href={getWhatsAppUrl(whatsAppMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-md transition-all text-center"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Comprovante via WhatsApp (Opcional)</span>
              </a>

              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-3 rounded-full text-xs font-semibold text-[#5B444C] bg-[#EFE9DF] hover:bg-[#E5DDCF] transition-colors"
              >
                Concluir e Fechar
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#5F7161] mb-1">
              <Calendar className="w-4 h-4" />
              <span>Agendamento de Avaliação</span>
            </div>

            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#1E2421] mb-2">
              Vamos cuidar do seu movimento?
            </h3>

            <p className="text-xs sm:text-sm text-[#444E49] mb-6 leading-relaxed">
              Preencha abaixo para adiantar suas preferências e falarmos diretamente sobre os horários disponíveis.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#1E2421] uppercase tracking-wider mb-1.5">
                  Seu Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Silva"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBF] text-sm text-[#1E2421] placeholder-[#838E88] focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2421] uppercase tracking-wider mb-1.5">
                    WhatsApp (com DDD) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="(11) 99999-9999"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBF] text-sm text-[#1E2421] placeholder-[#838E88] focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2421] uppercase tracking-wider mb-1.5">
                    E-mail (opcional)
                  </label>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBF] text-sm text-[#1E2421] placeholder-[#838E88] focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#1E2421] uppercase tracking-wider mb-1.5">
                    Seu Objetivo Principal
                  </label>
                  <select
                    value={formData.interest}
                    onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBF] text-sm text-[#1E2421] focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  >
                    <option value="Pilates Personalizado">Pilates Personalizado</option>
                    <option value="Fortalecimento & Postura">Fortalecimento & Postura</option>
                    <option value="Alívio de Tensões/Mobilidade">Alívio de Tensões / Mobilidade</option>
                    <option value="Reabilitação do Movimento">Reabilitação do Movimento</option>
                    <option value="Iniciante / Primeira Vez">Iniciante / Primeira Vez</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#1E2421] uppercase tracking-wider mb-1.5">
                    Melhor Turno para Atendimento
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#D8CEBF] text-sm text-[#1E2421] focus:outline-none focus:ring-2 focus:ring-[#5F7161]"
                  >
                    <option value="Manhã (07h às 12h)">Manhã (07h às 12h)</option>
                    <option value="Tarde (13h às 17h)">Tarde (13h às 17h)</option>
                    <option value="Fim de tarde (17h às 19h)">Fim de tarde (17h às 19h)</option>
                    <option value="Sábado (08h às 12h)">Sábado (08h às 12h)</option>
                  </select>
                </div>
              </div>

              {/* LGPD Consent */}
              <div className="pt-2 flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="privacy-consent"
                  checked={formData.acceptedPrivacy}
                  onChange={(e) => setFormData({ ...formData, acceptedPrivacy: e.target.checked })}
                  required
                  className="mt-1 h-4 w-4 rounded-sm text-[#4A5D4E] focus:ring-[#5F7161] border-[#D8CEBF]"
                />
                <label htmlFor="privacy-consent" className="text-xs text-[#66706B] leading-relaxed">
                  Ao enviar seus dados, você concorda com o tratamento das informações para contato e agendamento, conforme a nossa Política de Privacidade (LGPD).
                </label>
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-full font-semibold text-white bg-[#4A5D4E] hover:bg-[#37473A] transition-all shadow-md flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Continuar no WhatsApp</span>
                </button>
              </div>

              <p className="text-[11px] text-center text-[#838E88] flex items-center justify-center gap-1.5 pt-1">
                <Shield className="w-3.5 h-3.5 text-[#5F7161]" />
                Seus dados não serão compartilhados com terceiros.
              </p>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
