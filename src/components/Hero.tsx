import React from 'react';
import { ArrowRight, CheckCircle2, Sparkles, Calendar, Heart } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useOfficialPhotos } from '../data/photoStore';
import { useClinicData } from '../data/clinicStore';

interface HeroProps {
  onOpenBookingModal: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenBookingModal }) => {
  const { studioHero } = useOfficialPhotos();
  const clinic = useClinicData();
  return (
    <section
      id="hero"
      className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-gradient-to-b from-[#FFFDFB] via-[#FFF5F5] to-[#FFFDFB]"
    >
      {/* Subtle organic cheerful feminine ambient accents */}
      <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#FFEBF0]/70 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-40 right-10 w-[350px] h-[350px] bg-[#FDF6F0]/80 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left / Text Column (7 cols on lg) */}
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10">
            
            {/* Small uppercase eyebrow badge */}
            <div
              id="hero-eyebrow"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEBF0] border border-[#FCD6E0] text-[#9C2744] text-xs font-semibold tracking-widest uppercase mb-6 shadow-2xs"
            >
              <Heart className="w-3.5 h-3.5 text-[#D85072]" />
              <span>{clinic.heroEyebrow || "PILATES • FISIOTERAPIA • MANAUS-AM"}</span>
            </div>

            {/* Headline */}
            <h1
              id="hero-headline"
              className="font-serif text-4xl sm:text-5xl md:text-6xl lg:text-[4rem] leading-[1.12] text-[#26161B] font-semibold tracking-tight mb-6"
            >
              {clinic.heroTitle || "Seu corpo em movimento."}{' '}
              <span className="italic font-normal text-[#D85072] block sm:inline">
                {clinic.heroHighlight || "Sua vida com mais alegria e leveza."}
              </span>
            </h1>

            {/* Subtext */}
            <p
              id="hero-description"
              className="text-base sm:text-lg md:text-xl text-[#5B444C] leading-relaxed max-w-2xl mb-8 font-normal"
            >
              {clinic.heroDescription || (
                <>
                  Pilates privativo e personalizado conduzido pela <strong>{clinic.name}</strong> na Cidade Nova, Manaus. Desenvolva força profunda, flexibilidade, postura e liberdade sem dor em um ambiente acolhedor.
                </>
              )}
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 w-full sm:w-auto mb-10">
              <a
                href="#agendamento"
                id="hero-cta-primary"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full text-base font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-md hover:shadow-lg transition-all active:scale-[0.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#D85072]"
              >
                <Calendar className="w-4 h-4" />
                <span>{clinic.heroCta1Text || "Agendamento Automático"}</span>
                <ArrowRight className="w-4 h-4" />
              </a>

              <a
                href={getWhatsAppUrl("Olá Dra. Léia! Gostaria de agendar uma avaliação de Pilates no seu estúdio na Cidade Nova.")}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-cta-secondary"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-base font-medium text-[#9C2744] bg-[#FFFDFB] border border-[#FCD6E0] hover:bg-[#FFEBF0] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D85072]"
              >
                <span>{clinic.heroCta2Text || "Falar no WhatsApp"}</span>
              </a>
            </div>

            {/* Mini reassurance line */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#7A2134] pt-2 border-t border-[#FCD6E0]/60 w-full">
              {clinic.heroReassurance1 && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D85072]" />
                  {clinic.heroReassurance1}
                </span>
              )}
              {clinic.heroReassurance2 && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D85072]" />
                  {clinic.heroReassurance2}
                </span>
              )}
              {clinic.heroReassurance3 && (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D85072]" />
                  {clinic.heroReassurance3}
                </span>
              )}
            </div>

          </div>

          {/* Right / Imagery Column (5 cols on lg) */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Decorative Cheerful Rose Frame */}
              <div className="absolute -inset-2.5 rounded-[30px] bg-gradient-to-tr from-[#FFEBF0] via-[#FCD6E0] to-[#FDF6F0] -rotate-1 opacity-90 -z-10 shadow-sm" />
              
              {/* Main Photo Card - Pure and clean, without banners or obstructing overlays */}
              <div
                id="hero-image-container"
                className="relative rounded-[24px] overflow-hidden shadow-xl border border-[#FCD6E0] bg-[#FFFDFB] aspect-[4/5] group"
              >
                <img
                  src={studioHero}
                  alt={`${clinic.name} no estúdio de Pilates`}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

