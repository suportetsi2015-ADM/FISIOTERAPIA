import React, { useState, useEffect } from 'react';
import { Calendar, Clock, CheckCircle2, User, Phone, Sparkles, MessageCircle, ArrowRight, ShieldCheck, Heart, Bell } from 'lucide-react';
import { CLINIC_INFO, getWhatsAppUrl } from '../data/content';
import {
  getScheduleConfig,
  getAppointments,
  getAvailableSlotsForDate,
  bookAppointment
} from '../data/bookingStore';
import { Appointment, ScheduleConfig } from '../types';

export const BookingSection: React.FC = () => {
  const [config, setConfig] = useState<ScheduleConfig>(getScheduleConfig());
  const [appointments, setAppointments] = useState<Appointment[]>(getAppointments());

  // Form State
  const [selectedService, setSelectedService] = useState('Avaliação Fisioterapêutica & Pilates');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientNotes, setPatientNotes] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(true);

  // Status
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmedAppointment, setConfirmedAppointment] = useState<Appointment | null>(null);

  // Generate the next 14 bookable days
  const [availableDays, setAvailableDays] = useState<
    Array<{ dateStr: string; dayOfWeekName: string; dayNum: string; monthName: string; isAvailable: boolean }>
  >([]);

  useEffect(() => {
    // Reload config and appointments
    const cfg = getScheduleConfig();
    const apts = getAppointments();
    setConfig(cfg);
    setAppointments(apts);

    const daysList = [];
    const today = new Date();
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

    for (let i = 0; i < 14; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      const dayOfWeek = d.getDay();

      const isDayActive = cfg.activeDays.includes(dayOfWeek) && !cfg.blockedDates.includes(dateStr);

      daysList.push({
        dateStr,
        dayOfWeekName: dayNames[dayOfWeek],
        dayNum: day,
        monthName: monthNames[d.getMonth()],
        isAvailable: isDayActive
      });
    }

    setAvailableDays(daysList);

    // Auto-select first available day
    const firstValid = daysList.find((d) => d.isAvailable);
    if (firstValid && !selectedDate) {
      setSelectedDate(firstValid.dateStr);
    }
  }, []);

  // Compute available slots for currently selected date
  const availableSlots = selectedDate
    ? getAvailableSlotsForDate(selectedDate, config, appointments)
    : [];

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !patientPhone.trim() || !selectedDate || !selectedSlot) {
      return;
    }

    const newApt = bookAppointment({
      patientName,
      patientPhone,
      patientEmail,
      date: selectedDate,
      timeSlot: selectedSlot,
      service: selectedService,
      notes: patientNotes
    });

    setConfirmedAppointment(newApt);
    setIsSuccess(true);
    setAppointments(getAppointments());
  };

  const handleReset = () => {
    setIsSuccess(false);
    setConfirmedAppointment(null);
    setSelectedSlot('');
    setPatientName('');
    setPatientPhone('');
    setPatientEmail('');
    setPatientNotes('');
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <section id="agendamento" className="py-20 md:py-28 bg-[#FFF9F7] relative overflow-hidden border-t border-[#FCD6E0]/60">
      {/* Delicate feminine ambient glow */}
      <div className="absolute -top-24 right-0 w-96 h-96 bg-[#FFEBF0] rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#FDF6F0] rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEBF0] border border-[#FCD6E0] text-[#9C2744] text-xs font-semibold tracking-widest uppercase mb-4">
            <Heart className="w-3.5 h-3.5 text-[#D85072]" />
            <span>AGENDAMENTO ONLINE AUTOMÁTICO</span>
          </div>
          
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#26161B] font-semibold tracking-tight leading-tight mb-4">
            Reserve seu Horário com a Dra. Léia Mar
          </h2>
          
          <p className="text-base sm:text-lg text-[#5B444C] leading-relaxed">
            Selecione o objetivo da sua sessão, a data e o horário mais conveniente. Sua vaga é reservada em tempo real com confirmação imediata.
          </p>

          <div className="mt-4 flex items-center justify-center">
            <span className="text-xs text-[#8C3B50] font-medium bg-white/80 px-3 py-1 rounded-full border border-[#FCD6E0]">
              📍 Cidade Nova • Manaus-AM (Altos da New Fit)
            </span>
          </div>
        </div>

        {/* Booking Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#FCD6E0]/80 overflow-hidden">
          
          {isSuccess && confirmedAppointment ? (
            /* Success State */
            <div className="p-8 sm:p-14 text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 rounded-full bg-[#FFEBF0] text-[#D85072] flex items-center justify-center mx-auto mb-6 shadow-sm">
                <CheckCircle2 className="w-10 h-10 text-[#BC3859]" />
              </div>

              <span className="inline-block px-3 py-1 rounded-full bg-[#F4F9F6] text-[#3E6B51] text-xs font-bold uppercase tracking-wider mb-3">
                Agendamento Confirmado • Código {confirmedAppointment.id}
              </span>

              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#26161B] mb-3">
                Parabéns, {confirmedAppointment.patientName}!
              </h3>

              <p className="text-sm sm:text-base text-[#5B444C] leading-relaxed mb-8">
                Seu horário para <strong>{confirmedAppointment.service}</strong> foi registrado com sucesso para o dia{' '}
                <strong className="text-[#9C2744]">{formatDisplayDate(confirmedAppointment.date)}</strong> às{' '}
                <strong className="text-[#9C2744]">{confirmedAppointment.timeSlot}</strong> no estúdio da Dra. Léia Mar.
              </p>

              {/* Summary Card */}
              <div className="bg-[#FFFDFB] border border-[#FCD6E0] rounded-2xl p-6 text-left mb-6 shadow-xs space-y-2.5 text-xs sm:text-sm text-[#3E2931]">
                <div className="flex justify-between border-b border-[#F2E7E1] pb-2">
                  <span className="text-[#7A2134] font-medium">Local:</span>
                  <span className="font-semibold text-right">{CLINIC_INFO.address} - {CLINIC_INFO.landmarks}</span>
                </div>
                <div className="flex justify-between border-b border-[#F2E7E1] pb-2">
                  <span className="text-[#7A2134] font-medium">Fisioterapeuta:</span>
                  <span className="font-semibold">Dra. Léia Mar (CREFITO {CLINIC_INFO.crefito})</span>
                </div>
                <div className="flex justify-between border-b border-[#F2E7E1] pb-2">
                  <span className="text-[#7A2134] font-medium">WhatsApp do Estúdio:</span>
                  <span className="font-semibold">{CLINIC_INFO.phoneDisplay}</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-[#7A2134] font-medium">Seu Telefone:</span>
                  <span className="font-semibold">{confirmedAppointment.patientPhone}</span>
                </div>
              </div>

              {/* Quadro Informativo: Alerta Emitido em Tempo Real na Plataforma */}
              <div className="bg-[#EBF7EE] border border-[#B6E3C3] rounded-2xl p-5 text-left mb-8 shadow-xs text-xs sm:text-sm text-[#1D7A46]">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#D1F0DB] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell className="w-4 h-4 text-[#1D7A46] animate-bounce" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[#14532D] text-sm">
                      ✓ Alerta em Tempo Real Disparado na Plataforma da Clínica!
                    </p>
                    <p className="text-[#2C6E49] leading-relaxed">
                      Seu cadastro foi transmitido e o <strong>alerta sonoro contínuo já está tocando na plataforma</strong> da recepção da Dra. Léia Mar (acionamento automático em até 2,5 segundos).
                    </p>
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white/85 border border-[#B6E3C3] text-[11px] text-[#2C6E49] leading-relaxed">
                      📌 <strong>Aviso Importante:</strong> O envio do comprovante abaixo via WhatsApp é <strong>100% opcional</strong> para seu acompanhamento pessoal. <strong>O alerta na plataforma NÃO depende do envio da mensagem no WhatsApp</strong> para tocar e ser visualizado pela equipe!
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <a
                  href={getWhatsAppUrl(
                    `Olá Dra. Léia! Acabei de realizar meu agendamento automático pelo site (Código: ${confirmedAppointment.id}).\n• Nome: ${confirmedAppointment.patientName}\n• Data: ${formatDisplayDate(confirmedAppointment.date)}\n• Horário: ${confirmedAppointment.timeSlot}\n• Serviço: ${confirmedAppointment.service}\nAguardo a confirmação da nossa sessão!`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-md transition-all active:scale-95 text-center"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Enviar Comprovante via WhatsApp (Opcional)</span>
                </a>

                <button
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-4 rounded-full text-xs font-semibold text-[#5B444C] bg-[#FAF4F0] hover:bg-[#F2E7E1] transition-colors"
                >
                  Novo Agendamento
                </button>
              </div>
            </div>
          ) : (
            /* Interactive Booking Form */
            <form onSubmit={handleBookingSubmit} className="p-6 sm:p-10 lg:p-12 space-y-10">
              
              {/* STEP 1: Service */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-full bg-[#FFEBF0] text-[#D85072] text-xs font-bold flex items-center justify-center">
                    1
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#26161B]">
                    Escolha o Tipo de Atendimento
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { title: 'Avaliação Fisioterapêutica & Pilates', desc: 'Anamnese completa, testes posturais e primeira vivência' },
                    { title: 'Pilates Personalizado', desc: 'Fortalecimento, tônus e consciência corporal individual' },
                    { title: 'Alívio de Dores & Reabilitação', desc: 'Foco em coluna, hérnia de disco e mobilidade articular' },
                    { title: 'Melhora Postural & Mobilidade', desc: 'Para quem passa muitas horas sentada ou em tensão' },
                    { title: 'Pilates na Terceira Idade', desc: 'Equilíbrio, autonomia e proteção das articulações' },
                    { title: 'Iniciante / Primeira Vez', desc: 'Introdução suave e respeitosa aos aparelhos' }
                  ].map((srv) => {
                    const isSelected = selectedService === srv.title;
                    return (
                      <button
                        type="button"
                        key={srv.title}
                        onClick={() => setSelectedService(srv.title)}
                        className={`p-4 rounded-2xl text-left border transition-all ${
                          isSelected
                            ? 'border-[#D85072] bg-[#FFEBF0]/70 shadow-xs'
                            : 'border-[#F2E7E1] bg-white hover:border-[#FCD6E0] hover:bg-[#FFF9F7]'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${isSelected ? 'text-[#9C2744]' : 'text-[#26161B]'}`}>
                            {srv.title}
                          </span>
                          {isSelected && <Sparkles className="w-4 h-4 text-[#D85072]" />}
                        </div>
                        <p className="text-xs text-[#5B444C] leading-snug">{srv.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 2: Date Selector */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFEBF0] text-[#D85072] text-xs font-bold flex items-center justify-center">
                      2
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#26161B]">
                      Selecione o Dia
                    </h3>
                  </div>
                  <span className="text-xs text-[#7A2134]">Próximos 14 dias disponíveis</span>
                </div>

                {/* Days Horizontal Carousel / Grid */}
                <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {availableDays.map((d) => {
                    const isSelected = selectedDate === d.dateStr;
                    return (
                      <button
                        type="button"
                        key={d.dateStr}
                        disabled={!d.isAvailable}
                        onClick={() => {
                          setSelectedDate(d.dateStr);
                          setSelectedSlot(''); // Reset slot on date change
                        }}
                        className={`flex-shrink-0 w-20 py-3.5 px-2 rounded-2xl text-center border transition-all ${
                          !d.isAvailable
                            ? 'opacity-35 bg-gray-50 border-gray-200 cursor-not-allowed'
                            : isSelected
                            ? 'bg-[#D85072] border-[#D85072] text-white shadow-md scale-105'
                            : 'bg-[#FFFDFB] border-[#F2E7E1] hover:border-[#FCD6E0] text-[#26161B] hover:bg-[#FFEBF0]/40'
                        }`}
                      >
                        <p className={`text-[11px] font-semibold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-[#8C3B50]'}`}>
                          {d.dayOfWeekName}
                        </p>
                        <p className="text-xl font-bold my-0.5">{d.dayNum}</p>
                        <p className={`text-[10px] uppercase ${isSelected ? 'text-white/90' : 'text-[#7A2134]'}`}>
                          {d.monthName}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 3: Time Slot */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFEBF0] text-[#D85072] text-xs font-bold flex items-center justify-center">
                      3
                    </span>
                    <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#26161B]">
                      Escolha o Horário
                    </h3>
                  </div>
                  {selectedDate && (
                    <span className="text-xs text-[#7A2134]">
                      Horários para {formatDisplayDate(selectedDate)}
                    </span>
                  )}
                </div>

                {availableSlots.length > 0 ? (
                  <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-6 gap-2.5">
                    {availableSlots.map((slot) => {
                      const isSelected = selectedSlot === slot;
                      return (
                        <button
                          type="button"
                          key={slot}
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-3 px-3 rounded-xl text-center font-semibold text-sm border transition-all flex items-center justify-center gap-1.5 ${
                            isSelected
                              ? 'bg-[#D85072] border-[#D85072] text-white shadow-md'
                              : 'bg-white border-[#F2E7E1] text-[#26161B] hover:border-[#FCD6E0] hover:bg-[#FFEBF0]/50'
                          }`}
                        >
                          <Clock className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-[#D85072]'}`} />
                          <span>{slot}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-6 rounded-2xl bg-[#FFF9F7] border border-[#FCD6E0] text-center text-xs sm:text-sm text-[#7A2134]">
                    Não há horários disponíveis para a data selecionada ou o dia já está preenchido. Por favor, escolha outro dia ou entre em contato pelo WhatsApp.
                  </div>
                )}
              </div>

              {/* STEP 4: Patient Info */}
              <div className="border-t border-[#F2E7E1] pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="w-6 h-6 rounded-full bg-[#FFEBF0] text-[#D85072] text-xs font-bold flex items-center justify-center">
                    4
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-semibold text-[#26161B]">
                    Seus Dados para Confirmação
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2931] uppercase tracking-wider mb-1.5">
                      Seu Nome Completo *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#8C3B50] absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Mariana Castro"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E4D3CA] text-sm text-[#26161B] placeholder-[#A8928B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3E2931] uppercase tracking-wider mb-1.5">
                      WhatsApp com DDD *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#8C3B50] absolute left-3.5 top-3.5 pointer-events-none" />
                      <input
                        type="tel"
                        required
                        placeholder="(92) 99999-9999"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-[#E4D3CA] text-sm text-[#26161B] placeholder-[#A8928B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2931] uppercase tracking-wider mb-1.5">
                      E-mail (opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="seu@email.com"
                      value={patientEmail}
                      onChange={(e) => setPatientEmail(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4D3CA] text-sm text-[#26161B] placeholder-[#A8928B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#3E2931] uppercase tracking-wider mb-1.5">
                      Alguma queixa ou dor específica?
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: dor na lombar, hérnia, tensão no pescoço..."
                      value={patientNotes}
                      onChange={(e) => setPatientNotes(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl bg-white border border-[#E4D3CA] text-sm text-[#26161B] placeholder-[#A8928B] focus:outline-none focus:ring-2 focus:ring-[#D85072]"
                    />
                  </div>
                </div>

                {/* Consent */}
                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="booking-privacy"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    required
                    className="mt-1 h-4 w-4 rounded-sm text-[#D85072] focus:ring-[#D85072] border-[#E4D3CA]"
                  />
                  <label htmlFor="booking-privacy" className="text-xs text-[#5B444C] leading-relaxed">
                    Concordo em fornecer meus dados para o agendamento e contato direto da Dra. Léia Mar, conforme a Política de Privacidade (LGPD).
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={!selectedDate || !selectedSlot || !patientName || !patientPhone}
                  className="w-full py-4 px-8 rounded-full font-semibold text-white bg-gradient-to-r from-[#D85072] via-[#BC3859] to-[#9C2744] hover:opacity-95 transition-all shadow-lg hover:shadow-xl active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-base"
                >
                  <Calendar className="w-5 h-5" />
                  <span>
                    Confirmar Agendamento para {formatDisplayDate(selectedDate)} às {selectedSlot || '--:--'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <p className="text-[11px] text-center text-[#8C3B50] flex items-center justify-center gap-1.5 mt-3">
                  <ShieldCheck className="w-4 h-4 text-[#D85072]" />
                  Atendimento privativo individual • Sem salas lotadas • Confirmação instantânea
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </section>
  );
};
