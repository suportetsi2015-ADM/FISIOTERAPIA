import React from 'react';
import { Eye, ShieldCheck, TrendingUp, Heart } from 'lucide-react';
import { EXPERIENCE_CARDS } from '../data/content';

const expIcons = [Eye, ShieldCheck, TrendingUp, Heart];

export const Experience: React.FC = () => {
  return (
    <section id="experiencia" className="py-20 md:py-28 bg-[#F4EFEA]/50 border-t border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Cuidado Humano & Acolhedor
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            Aqui, você não é apenas mais uma pessoa na sala.
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            O atendimento é pensado para que você tenha atenção, orientação e acompanhamento contínuo durante toda a sua evolução.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {EXPERIENCE_CARDS.map((card, idx) => {
            const Icon = expIcons[idx % expIcons.length];
            return (
              <div
                key={card.title}
                className="bg-[#FAF9F6] border border-[#E8E0D5] hover:border-[#B1C4B1] rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-[#E8EDE8] text-[#4A5D4E] flex items-center justify-center mb-6">
                    <Icon className="w-6 h-6" />
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#1E2421] mb-3">
                    {card.title}
                  </h3>

                  <p className="text-sm text-[#444E49] leading-relaxed">
                    {card.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E0D5]/60 text-xs font-semibold text-[#5F7161]">
                  <span>Respeito ao seu ritmo</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
