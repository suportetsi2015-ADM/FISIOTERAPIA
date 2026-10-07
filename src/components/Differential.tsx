import React from 'react';
import { Check, Minus } from 'lucide-react';
import { COMPARISON_ROWS } from '../data/content';

export const Differential: React.FC = () => {
  return (
    <section id="diferencial" className="py-20 md:py-28 bg-[#F4EFEA]/50 border-t border-[#E8E0D5]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Diferencial Clínico
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            Por que fazer Pilates com uma fisioterapeuta?
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            A união entre a ciência da fisioterapia e a precisão do método Pilates oferece uma experiência segura, onde cada exercício respeita as particularidades anatômicas do seu corpo.
          </p>
        </div>

        {/* Comparison Table / Card Container */}
        <div className="max-w-4xl mx-auto bg-[#FAF9F6] border border-[#E8E0D5] rounded-3xl shadow-sm overflow-hidden">
          
          {/* Header of the Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-12 bg-[#E8EDE8]/70 border-b border-[#E8E0D5] p-5 sm:p-6 text-sm font-semibold">
            <div className="hidden md:block md:col-span-4 text-[#66706B] uppercase tracking-wider text-xs">
              Critério
            </div>
            <div className="md:col-span-4 text-[#838E88] text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2 md:mb-0">
              <span className="inline-block w-2 h-2 rounded-full bg-[#C4B7A4]"></span>
              Pilates Convencional em Grupo
            </div>
            <div className="md:col-span-4 text-[#37473A] text-xs uppercase tracking-wider font-bold flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[#4A5D4E]"></span>
              Com Abordagem Fisioterapêutica
            </div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-[#E8E0D5]/70">
            {COMPARISON_ROWS.map((row) => (
              <div
                key={row.criterion}
                className="grid grid-cols-1 md:grid-cols-12 p-5 sm:p-6 items-center gap-3 md:gap-4 hover:bg-[#F4EFEA]/30 transition-colors"
              >
                {/* Criterion label on mobile */}
                <div className="md:col-span-4 font-medium text-sm text-[#1E2421] flex items-center">
                  <span>{row.criterion}</span>
                </div>

                {/* Conventional side */}
                <div className="md:col-span-4 flex items-start gap-2.5 text-xs sm:text-sm text-[#66706B] bg-[#F4EFEA]/40 md:bg-transparent p-3 md:p-0 rounded-xl">
                  <Minus className="w-4 h-4 text-[#838E88] flex-shrink-0 mt-0.5" />
                  <span>{row.conventional}</span>
                </div>

                {/* Physio side (Highlighted) */}
                <div className="md:col-span-4 flex items-start gap-2.5 text-xs sm:text-sm font-semibold text-[#37473A] bg-[#E8EDE8]/50 p-3.5 rounded-xl border border-[#D2DED2]/60">
                  <Check className="w-4 h-4 text-[#4A5D4E] flex-shrink-0 mt-0.5" />
                  <span>{row.physio}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom notice */}
          <div className="p-4 sm:p-5 bg-[#FAF9F6] border-t border-[#E8E0D5] text-center text-xs text-[#838E88]">
            Nosso compromisso é proporcionar o ambiente ideal para quem busca atenção exclusiva, precisão técnica e cuidado preventivo contínuo.
          </div>

        </div>

      </div>
    </section>
  );
};
