import React from 'react';
import { ArrowDown, ClipboardList, Target, PlayCircle, TrendingUp } from 'lucide-react';
import { METHOD_STEPS } from '../data/content';

const stepIcons = [ClipboardList, Target, PlayCircle, TrendingUp];

export const Method: React.FC = () => {
  return (
    <section id="metodo" className="py-20 md:py-28 bg-[#FAF9F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Jornada do Cuidado
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            Como funciona o nosso método de atendimento
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            Uma trajetória clara, estruturada e respeitosa dividida em quatro etapas contínuas para você evoluir com total segurança.
          </p>
        </div>

        {/* 4 Steps Journey */}
        <div className="relative">
          
          {/* Connector line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-10 right-10 h-0.5 bg-[#E8E0D5] -translate-y-8 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
            {METHOD_STEPS.map((step, idx) => {
              const StepIcon = stepIcons[idx % stepIcons.length];
              return (
                <div
                  key={step.step}
                  className="bg-[#FAF9F6] border border-[#E8E0D5] hover:border-[#B1C4B1] rounded-3xl p-7 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 group"
                >
                  <div>
                    {/* Step number badge & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-serif text-3xl font-bold text-[#4A5D4E] group-hover:scale-110 transition-transform">
                        {step.step}
                      </span>
                      <div className="w-11 h-11 rounded-2xl bg-[#E8EDE8] group-hover:bg-[#4A5D4E] group-hover:text-white text-[#4A5D4E] flex items-center justify-center transition-colors">
                        <StepIcon className="w-5 h-5" />
                      </div>
                    </div>

                    <p className="text-xs font-semibold uppercase tracking-wider text-[#5F7161] mb-1">
                      {step.subtitle}
                    </p>
                    <h3 className="font-serif text-2xl font-semibold text-[#1E2421] mb-3">
                      {step.name}
                    </h3>

                    <p className="text-sm text-[#444E49] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Flow arrow indicator */}
                  <div className="mt-8 pt-4 border-t border-[#E8E0D5]/60 flex items-center justify-between text-xs text-[#838E88]">
                    <span>Etapa {step.step} de 04</span>
                    {idx < 3 && (
                      <span className="text-[#4A5D4E] lg:hidden flex items-center gap-1 font-medium">
                        Próxima etapa <ArrowDown className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>

      </div>
    </section>
  );
};
