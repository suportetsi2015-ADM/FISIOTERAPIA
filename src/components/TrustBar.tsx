import React from 'react';
import { UserCheck, Award, HeartHandshake, FileCheck2 } from 'lucide-react';
import { TRUST_ELEMENTS } from '../data/content';

const iconMap = [UserCheck, Award, HeartHandshake, FileCheck2];

export const TrustBar: React.FC = () => {
  return (
    <section id="trust-bar" className="relative z-20 -mt-6 sm:-mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-[#FAF9F6] border border-[#E8E0D5] rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-[#E8E0D5]/70">
          {TRUST_ELEMENTS.map((item, index) => {
            const IconComponent = iconMap[index % iconMap.length];
            return (
              <div
                key={item.title}
                className={`flex items-start gap-4 ${index > 0 ? 'pt-5 sm:pt-0 sm:pl-6' : ''}`}
              >
                <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#E8EDE8] border border-[#D2DED2] flex items-center justify-center text-[#4A5D4E]">
                  <IconComponent className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-[#1E2421] font-semibold text-sm sm:text-base leading-snug">
                    <span className="text-[#4A5D4E] font-bold">✓</span>
                    <h4>{item.title}</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-[#66706B] mt-1 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
