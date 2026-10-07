import React from 'react';
import { Award, GraduationCap, FileCheck, Stethoscope, Sparkles, MapPin, Heart } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useOfficialPhotos } from '../data/photoStore';
import { useClinicData } from '../data/clinicStore';

export const AboutProfessional: React.FC = () => {
  const { portrait } = useOfficialPhotos();
  const clinic = useClinicData();

  return (
    <section id="sobre" className="py-20 md:py-28 bg-[#FFFDFB] relative overflow-hidden border-t border-[#FCD6E0]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
          
          {/* Left Column: Portrait & Studio Photo Card */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md">
              
              {/* Subtle cheerful background frame border */}
              <div className="absolute -inset-2.5 rounded-[32px] border border-[#FCD6E0] bg-[#FFEBF0]/70 -rotate-2 -z-10 shadow-sm" />
              
              {/* Photo Frame - Clean and pure without obstructing banners */}
              <div className="relative rounded-[28px] overflow-hidden shadow-xl border border-[#FCD6E0] aspect-[4/5] group bg-[#FFFDFB]">
                <img
                  src={portrait}
                  alt={`${clinic.name} - Fisioterapeuta Especialista em Pilates em Manaus`}
                  className="w-full h-full object-cover object-[center_15%] group-hover:scale-105 transition-transform duration-700 ease-out"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </div>

            </div>
          </div>

          {/* Right Column: Bio & Technical Authority */}
          <div className="lg:col-span-7 flex flex-col items-start text-left">
            
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-semibold tracking-wider uppercase mb-4 border border-[#FCD6E0]">
              <Sparkles className="w-3.5 h-3.5 text-[#D85072]" />
              <span>{clinic.aboutTag || "SOBRE A FISIOTERAPEUTA"}</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#26161B] font-semibold tracking-tight mb-2">
              {clinic.name}
            </h2>

            <p className="text-sm sm:text-base font-semibold text-[#D85072] mb-3">
              {clinic.role} • CREFITO {clinic.crefito}
            </p>

            <p className="text-xs sm:text-sm font-medium text-[#8C3B50] mb-6 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-[#D85072]" />
              {clinic.address} - {clinic.neighborhood} ({clinic.landmarks}), {clinic.cityState}
            </p>

            {/* Philosophy quote */}
            <div className="p-6 rounded-2xl bg-[#FFF5F5] border-l-4 border-[#D85072] mb-8 shadow-2xs">
              <p className="font-serif italic text-lg sm:text-xl text-[#26161B] leading-relaxed mb-3">
                {clinic.aboutQuote || "“Meu propósito é ajudar cada mulher a se movimentar com liberdade, sem dor, desenvolvendo força profunda e autoestima em cada respiração.”"}
              </p>
              <p className="text-sm text-[#5B444C] leading-relaxed">
                {clinic.aboutPhilosophy || "Acredito no Pilates como uma experiência de transformação e autocuidado. Fugindo do ambiente barulhento de academias comuns, ofereço um atendimento 100% individualizado, com comandos precisos, correção biomecânica e acolhimento humano."}
              </p>
            </div>

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full mb-8">
              {(clinic.aboutCredentials || []).map((cred, idx) => {
                const icons = [GraduationCap, Award, FileCheck, Stethoscope];
                const IconComponent = icons[idx % icons.length] || Award;
                return (
                  <div key={cred.id || idx} className="p-4 rounded-xl bg-white border border-[#FCD6E0] flex items-start gap-3 shadow-2xs">
                    <IconComponent className="w-5 h-5 text-[#D85072] flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-semibold text-[#26161B]">{cred.title}</h4>
                      <p className="text-xs text-[#5B444C] mt-0.5">{cred.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTA action */}
            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#agendamento"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-md transition-all active:scale-95"
              >
                <span>Agendar Avaliação com a Dra. Léia</span>
              </a>

              <a
                href={getWhatsAppUrl("Olá Dra. Léia! Gostaria de conversar sobre as sessões de Pilates no seu estúdio na Cidade Nova.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-full text-xs sm:text-sm font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] border border-[#FCD6E0] transition-colors"
              >
                <span>Conversar no WhatsApp: {clinic.phoneDisplay}</span>
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};

