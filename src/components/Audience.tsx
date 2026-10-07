import React from 'react';
import { CheckCircle, Heart, Activity, Shield, Sparkles } from 'lucide-react';
import { AUDIENCE_CARDS, getWhatsAppUrl } from '../data/content';

const iconAudience = [Sparkles, Heart, Activity, Shield, CheckCircle];

export const Audience: React.FC = () => {
  return (
    <section id="para-quem" className="py-20 md:py-28 bg-[#F4EFEA]/40 border-t border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Público & Objetivos
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            O Pilates pode acompanhar diferentes fases da sua vida.
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            Independentemente de sua experiência anterior ou idade, os exercícios são individualmente adaptados para proporcionar segurança, conforto e estímulo na medida certa.
          </p>
        </div>

        {/* Audience Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {AUDIENCE_CARDS.map((card, idx) => {
            const Icon = iconAudience[idx % iconAudience.length];
            return (
              <div
                key={card.id}
                className="bg-[#FAF9F6] border border-[#E8E0D5] hover:border-[#B1C4B1] rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-10 rounded-xl bg-[#E8EDE8] text-[#4A5D4E] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-[#E8EDE8] text-[#37473A] uppercase tracking-wider">
                      {card.badge}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#1E2421] mb-3">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#444E49] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E0D5]/60 flex items-center justify-between text-xs">
                  <span className="text-[#66706B]">Acompanhamento clínico</span>
                  <a
                    href={getWhatsAppUrl(`Olá! Gostaria de saber se o Pilates é indicado para o meu caso (${card.title}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4A5D4E] hover:text-[#37473A] font-semibold flex items-center gap-1"
                  >
                    Tirar dúvidas <span>→</span>
                  </a>
                </div>
              </div>
            );
          })}

          {/* 6th Card: Call to personalized conversation */}
          <div className="bg-gradient-to-br from-[#4A5D4E] to-[#37473A] rounded-3xl p-7 text-white flex flex-col justify-between shadow-md">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-white/20 text-white uppercase tracking-wider mb-5">
                Avaliação Individual
              </span>
              <h3 className="font-serif text-2xl font-semibold text-white mb-3">
                Não tem certeza se é para você?
              </h3>
              <p className="text-sm text-[#E8EDE8] leading-relaxed mb-6">
                Agende uma conversa e avaliação inicial. Analisaremos juntos suas necessidades específicas antes de qualquer início prático.
              </p>
            </div>

            <a
              href={getWhatsAppUrl("Olá Dra. Léia! Gostaria de tirar uma dúvida sobre se o Pilates é adequado para minha situação atual.")}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-center py-3.5 px-4 rounded-full text-sm font-semibold bg-white text-[#37473A] hover:bg-[#FAF9F6] transition-colors shadow-sm"
            >
              Conversar com a Dra. Léia
            </a>
          </div>

        </div>

      </div>
    </section>
  );
};
