import React from 'react';
import { Activity, Dumbbell, Compass, SunDim } from 'lucide-react';
import { PURPOSE_PILLARS } from '../data/content';

const iconMap = [Activity, Dumbbell, Compass, SunDim];

export const PilatesIntro: React.FC = () => {
  return (
    <section id="pilates" className="py-20 md:py-28 bg-[#FAF9F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Pilates com Propósito
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-6">
            Cada corpo tem uma história.{' '}
            <span className="italic text-[#4A5D4E] font-normal block sm:inline">
              Seu Pilates também deve ser único.
            </span>
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            O Pilates pode fazer parte de diferentes momentos da vida. Por isso, cada atendimento
            começa entendendo suas necessidades, objetivos e características individuais. Sem fórmulas prontas ou receitas genéricas.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {PURPOSE_PILLARS.map((pillar, index) => {
            const Icon = iconMap[index % iconMap.length];
            return (
              <div
                key={pillar.id}
                className="group relative bg-[#F4EFEA]/60 hover:bg-[#FAF9F6] border border-[#E8E0D5] hover:border-[#B1C4B1] rounded-2xl p-7 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF9F6] group-hover:bg-[#E8EDE8] border border-[#E8E0D5] group-hover:border-[#D2DED2] flex items-center justify-center text-[#4A5D4E] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-serif text-2xl font-bold text-[#D8CEBF] group-hover:text-[#5F7161] transition-colors">
                      {pillar.tag}
                    </span>
                  </div>

                  <h3 className="font-serif text-xl font-semibold text-[#1E2421] mb-2 group-hover:text-[#37473A] transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs font-medium text-[#5F7161] tracking-wide uppercase mb-3">
                    {pillar.subtitle}
                  </p>
                  <p className="text-sm text-[#444E49] leading-relaxed">
                    {pillar.description}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E0D5]/60 flex items-center text-xs font-semibold text-[#4A5D4E]">
                  <span>Foco fisioterapêutico</span>
                  <span className="ml-1 opacity-60">→</span>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
