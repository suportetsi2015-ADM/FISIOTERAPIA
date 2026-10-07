import React, { useState } from 'react';
import { ChevronDown, HelpCircle, MessageCircle } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useFaqs } from '../data/faqStore';

export const FAQ: React.FC = () => {
  const { faqs } = useFaqs();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#FFFDFB] border-t border-[#FCD6E0]/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#D85072] uppercase mb-3 block">
            Dúvidas Frequentes
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#26161B] font-semibold tracking-tight leading-tight mb-5">
            Perguntas & Respostas da Dra. Léia Mar
          </h2>
          <p className="text-base sm:text-lg text-[#5B444C] leading-relaxed">
            Respostas claras e transparentes para que você se sinta completamente segura antes da sua primeira visita.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-300 ${
                  isOpen
                    ? 'bg-[#FFFDFB] border-[#FCD6E0] shadow-sm ring-1 ring-[#FCD6E0]/50'
                    : 'bg-white border-[#FCD6E0]/60 hover:border-[#FCD6E0]'
                }`}
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D85072] rounded-2xl cursor-pointer"
                  aria-expanded={isOpen}
                  id={`faq-btn-${index}`}
                >
                  <span className="font-serif text-lg sm:text-xl font-semibold text-[#26161B] flex items-center gap-3">
                    <HelpCircle className={`w-5 h-5 flex-shrink-0 ${isOpen ? 'text-[#D85072]' : 'text-[#8C3B50]'}`} />
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen ? 'bg-[#FFEBF0] text-[#D85072] rotate-180' : 'text-[#8C3B50]'
                    }`}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </div>
                </button>

                {isOpen && (
                  <div
                    id={`faq-content-${index}`}
                    className="px-5 pb-6 sm:px-6 sm:pb-7 text-sm sm:text-base text-[#5B444C] leading-relaxed border-t border-[#FCD6E0]/40 pt-4"
                  >
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Extra question reassurance */}
        <div className="mt-12 text-center p-6 rounded-2xl bg-white border border-[#FCD6E0] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <h4 className="font-serif text-lg font-semibold text-[#26161B]">
              Ainda ficou com alguma dúvida específica?
            </h4>
            <p className="text-xs sm:text-sm text-[#8C3B50] mt-0.5">
              Estamos disponíveis para conversar sem nenhum compromisso.
            </p>
          </div>
          <a
            href={getWhatsAppUrl("Olá! Estava lendo as dúvidas frequentes no site e gostaria de esclarecer uma pergunta.")}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-xs transition-all whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-white" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>

      </div>
    </section>
  );
};
