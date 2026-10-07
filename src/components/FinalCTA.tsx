import React from 'react';
import { ArrowUpRight, Calendar, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';

interface FinalCTAProps {
  onOpenBookingModal: () => void;
}

export const FinalCTA: React.FC<FinalCTAProps> = ({ onOpenBookingModal }) => {
  return (
    <section id="cta-final" className="py-20 md:py-28 bg-[#FAF9F6] relative overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Visual Card Container */}
        <div className="relative rounded-[32px] overflow-hidden bg-gradient-to-br from-[#37473A] via-[#4A5D4E] to-[#2D3531] p-8 sm:p-14 md:p-16 text-center text-white shadow-xl">
          
          {/* Ambient subtle lighting */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#C5A880]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-[#E8EDE8] text-xs font-semibold tracking-wider uppercase mb-6">
              <Calendar className="w-3.5 h-3.5 text-[#D2B78E]" />
              <span>Avaliação Presencial Individualizada</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-white font-semibold tracking-tight leading-tight mb-6">
              Vamos começar a cuidar do seu movimento?
            </h2>

            <p className="text-base sm:text-lg text-[#E8EDE8] leading-relaxed mb-10 font-light">
              Agende uma avaliação e descubra como o Pilates pode fazer parte da sua rotina de forma personalizada, segura e acolhedora.
            </p>

            <div className="flex items-center justify-center mb-6">
              <button
                type="button"
                onClick={onOpenBookingModal}
                id="final-cta-agendar-agora-btn"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-10 py-4 sm:py-4.5 rounded-full text-base sm:text-lg font-bold tracking-wide text-[#26161B] bg-gradient-to-r from-[#FFFFFF] via-[#FFF5F7] to-[#FFEBF0] hover:from-[#FFEBF0] hover:to-[#FCD6E0] shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] border border-white/40 cursor-pointer group"
              >
                <Calendar className="w-5 h-5 text-[#D85072] group-hover:scale-110 transition-transform" />
                <span className="text-[#26161B] font-bold">AGENDAR AGORA!</span>
                <ArrowUpRight className="w-5 h-5 text-[#D85072] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>

            <p className="text-xs text-[#E8EDE8]/80 font-normal">
              • Atendimento com horário previamente agendado. Vagas limitadas por turno para garantir exclusividade.
            </p>

          </div>
        </div>

      </div>
    </section>
  );
};
