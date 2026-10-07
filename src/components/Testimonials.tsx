import React from 'react';
import { Quote, Star } from 'lucide-react';
import { TESTIMONIALS } from '../data/content';

export const Testimonials: React.FC = () => {
  return (
    <section id="depoimentos" className="py-20 md:py-28 bg-[#FAF9F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            Histórias de Confiança
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            O que dizem nossas alunas e pacientes
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            Relatos verdadeiros sobre consistência, alívio de tensões do cotidiano e a retomada da liberdade de movimento.
          </p>
        </div>

        {/* Testimonials Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((dep) => (
            <div
              key={dep.id}
              className="bg-[#F4EFEA]/50 border border-[#E8E0D5] rounded-3xl p-8 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-300 relative group"
            >
              <div>
                {/* 5 gentle stars */}
                <div className="flex items-center gap-1 text-[#C5A880] mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#C5A880]" />
                  ))}
                </div>

                <Quote className="w-8 h-8 text-[#5F7161]/30 mb-3" />

                <p className="font-serif italic text-base sm:text-lg text-[#2D3531] leading-relaxed mb-6">
                  “{dep.quote}”
                </p>
              </div>

              <div className="pt-5 border-t border-[#E8E0D5]/70 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-lg font-semibold text-[#1E2421]">
                    {dep.author}
                  </h4>
                  <p className="text-xs text-[#66706B]">
                    {dep.role} • {dep.timePracticing}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-[#E8EDE8] text-[#4A5D4E] flex items-center justify-center text-xs font-bold font-serif">
                  {dep.author.charAt(0)}
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
