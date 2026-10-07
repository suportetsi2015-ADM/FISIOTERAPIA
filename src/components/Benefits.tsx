import React from 'react';
import { 
  ShieldCheck, 
  Sparkles, 
  RotateCw, 
  Scale, 
  Layers, 
  Eye, 
  Flame, 
  Sliders, 
  HeartPulse, 
  Smile, 
  Info 
} from 'lucide-react';
import { BENEFITS } from '../data/content';

const iconList = [
  ShieldCheck,
  RotateCw,
  Scale,
  Layers,
  Eye,
  Sparkles,
  Sliders,
  Flame,
  HeartPulse,
  Smile
];

export const Benefits: React.FC = () => {
  return (
    <section id="beneficios" className="py-20 md:py-28 bg-[#F4EFEA]/40 border-y border-[#E8E0D5]/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Benefícios Integrados
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            O que o Pilates pode proporcionar?
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            Uma abordagem equilibrada onde cada ganho físico reflete diretamente na sua autonomia,
            vitalidade e leveza para as atividades do dia a dia.
          </p>
        </div>

        {/* Benefits Grid (10 items) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
          {BENEFITS.map((benefit, idx) => {
            const IconComponent = iconList[idx % iconList.length];
            return (
              <div
                key={benefit.id}
                className="bg-[#FAF9F6] border border-[#E8E0D5] hover:border-[#B1C4B1] p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-md flex flex-col justify-start group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#E8EDE8] group-hover:bg-[#4A5D4E] group-hover:text-white text-[#4A5D4E] flex items-center justify-center mb-4 transition-colors">
                  <IconComponent className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-[#1E2421] mb-2 leading-snug">
                  {benefit.title}
                </h3>
                <p className="text-xs text-[#66706B] leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Technical Responsible Medical Disclaimer box as mandated in PRD */}
        <div className="mt-12 max-w-3xl mx-auto p-5 rounded-2xl bg-[#E8EDE8]/60 border border-[#D2DED2] flex items-start gap-3.5 text-[#37473A]">
          <Info className="w-5 h-5 flex-shrink-0 text-[#4A5D4E] mt-0.5" />
          <p className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-semibold text-[#1E2421]">Nota Técnica Ética:</strong> O Pilates não é uma promessa de cura imediata ou resultado absoluto. Pode contribuir para o gerenciamento de determinadas condições musculoesqueléticas quando integrado a uma abordagem adequada e conduzido por fisioterapeuta qualificada.
          </p>
        </div>

      </div>
    </section>
  );
};
