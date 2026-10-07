import React from 'react';
import { MapPin, Navigation, Clock, Car, Phone, Compass, Heart } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useClinicData } from '../data/clinicStore';

export const Location: React.FC = () => {
  const clinic = useClinicData();

  const directionsUrl = clinic.googleMapsDirectionsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${clinic.address}, ${clinic.neighborhood}, ${clinic.cityState}`
  )}`;

  const embedUrl = clinic.googleMapsEmbedUrl || `https://maps.google.com/maps?q=${encodeURIComponent(
    `${clinic.address}, ${clinic.neighborhood} ${clinic.cityState}`
  )}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="localizacao" className="py-20 md:py-28 bg-[#FFF9F7] border-t border-[#FCD6E0]/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FFEBF0] border border-[#FCD6E0] text-[#9C2744] text-xs font-semibold tracking-widest uppercase mb-4">
            <Heart className="w-3.5 h-3.5 text-[#D85072]" />
            <span>LOCALIZAÇÃO EM MANAUS</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#26161B] font-semibold tracking-tight leading-tight mb-5">
            Onde Estamos
          </h2>
          <p className="text-base sm:text-lg text-[#5B444C] leading-relaxed">
            Um estúdio acolhedor e climatizado na Cidade Nova, concebido para proporcionar tranquilidade, fácil acesso e conforto em cada sessão com a Dra. Léia Mar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Information Column (5 cols) */}
          <div className="lg:col-span-5 bg-white border border-[#FCD6E0] rounded-3xl p-7 sm:p-8 flex flex-col justify-between shadow-xs">
            <div className="space-y-6">
              
              {/* Address */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center flex-shrink-0 mt-1">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C3B50] mb-1">
                    Endereço Completo
                  </h4>
                  <p className="text-base font-semibold text-[#26161B] leading-snug">
                    {clinic.address}
                  </p>
                  <p className="text-sm font-medium text-[#D85072] mt-0.5">
                    ({clinic.landmarks})
                  </p>
                  <p className="text-sm text-[#5B444C] mt-0.5">
                    {clinic.neighborhood} • {clinic.cityState}
                  </p>
                  <p className="text-xs text-[#8C3B50] mt-0.5">
                    CEP: {clinic.cep}
                  </p>
                </div>
              </div>

              {/* Landmarks */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center flex-shrink-0 mt-1">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C3B50] mb-1">
                    Ponto de Referência
                  </h4>
                  <p className="text-sm text-[#5B444C] leading-relaxed">
                    Localizado nos <strong>Altos da Academia NEW FIT</strong>, na movimentada e acessível Av. Noel Nutels na Cidade Nova.
                  </p>
                </div>
              </div>

              {/* Parking */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center flex-shrink-0 mt-1">
                  <Car className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C3B50] mb-1">
                    Estacionamento & Chegada
                  </h4>
                  <p className="text-sm text-[#5B444C] leading-relaxed">
                    {clinic.parkingInfo}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-[#FFEBF0] text-[#D85072] flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C3B50] mb-1">
                    Horário de Atendimento
                  </h4>
                  <div className="space-y-1">
                    {clinic.hours.map((h) => (
                      <p key={h.days} className="text-xs sm:text-sm text-[#5B444C]">
                        <strong className="font-medium text-[#26161B]">{h.days}:</strong> {h.time}
                      </p>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Action buttons */}
            <div className="pt-6 mt-6 border-t border-[#F2E7E1] flex flex-col sm:flex-row gap-3">
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] transition-colors shadow-xs"
              >
                <Navigation className="w-4 h-4" />
                <span>Como Chegar (Google Maps)</span>
              </a>

              <a
                href={getWhatsAppUrl("Olá Dra. Léia! Gostaria de tirar dúvidas sobre a localização e como chegar ao estúdio.")}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-full text-xs sm:text-sm font-semibold text-[#9C2744] bg-[#FFEBF0] hover:bg-[#FCD6E0] transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span>{clinic.phoneDisplay}</span>
              </a>
            </div>

          </div>

          {/* Interactive Map Embed (7 cols) */}
          <div className="lg:col-span-7 bg-white border border-[#FCD6E0] rounded-3xl overflow-hidden shadow-xs min-h-[360px] relative">
            <iframe
              title="Localização do Estúdio de Pilates Dra. Léia Mar em Manaus"
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '380px' }}
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full rounded-3xl"
            />
          </div>

        </div>

      </div>
    </section>
  );
};

