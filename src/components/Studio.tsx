import React, { useState } from 'react';
import { Maximize2, X, Sparkles } from 'lucide-react';
import { useStudioImages } from '../data/studioStore';
import { StudioImage } from '../types';

export const Studio: React.FC = () => {
  const images = useStudioImages();
  const [activeImage, setActiveImage] = useState<StudioImage | null>(null);

  return (
    <section id="espaco" className="py-20 md:py-28 bg-[#FAF9F6] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <span className="text-xs sm:text-sm font-semibold tracking-widest text-[#5F7161] uppercase mb-3 block">
            O Estúdio Boutique
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl text-[#1E2421] font-semibold tracking-tight leading-tight mb-5">
            Um espaço pensado para você se sentir bem.
          </h2>
          <p className="text-base sm:text-lg text-[#444E49] leading-relaxed">
            Ambiente privativo, com luz natural abundante, climatização agradável e aparelhos clássicos certificados de Pilates mantidos sob os mais rígidos padrões de conforto e higiene.
          </p>
        </div>

        {/* 2x2 Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="group relative rounded-3xl overflow-hidden bg-[#E8E0D5] border border-[#E8E0D5] aspect-[16/10] cursor-pointer shadow-xs hover:shadow-lg transition-all duration-500"
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#1E2421]/80 via-[#1E2421]/20 to-transparent opacity-70 group-hover:opacity-85 transition-opacity" />

              {/* Text content over photo */}
              <div className="absolute bottom-0 inset-x-0 p-6 sm:p-7 text-white flex items-end justify-between">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-semibold mb-1 text-white">
                    {img.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-[#E8EDE8] leading-relaxed max-w-md">
                    {img.description}
                  </p>
                </div>
                
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-[#4A5D4E] transition-colors flex-shrink-0 ml-4">
                  <Maximize2 className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Ambient amenities list */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-[#F4EFEA]/60 border border-[#E8E0D5] flex flex-wrap items-center justify-around gap-6 text-center text-xs sm:text-sm text-[#444E49]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5F7161]" />
            <span>Higienização rigorosa entre sessões</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5F7161]" />
            <span>Música ambiente relaxante em volume suave</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5F7161]" />
            <span>Espaço para café e água aromatizada</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#5F7161]" />
            <span>Privacidade total durante sua prática</span>
          </div>
        </div>

      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#1E2421]/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={() => setActiveImage(null)}
        >
          <div
            className="relative max-w-4xl w-full bg-[#FAF9F6] rounded-3xl overflow-hidden shadow-2xl border border-[#E8E0D5]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveImage(null)}
              className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/80 hover:bg-white text-[#1E2421] shadow-md transition-colors"
              aria-label="Fechar ampliação"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="aspect-[16/10] w-full bg-black">
              <img
                src={activeImage.url}
                alt={activeImage.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6 sm:p-8 bg-[#FAF9F6]">
              <h3 className="font-serif text-2xl font-semibold text-[#1E2421] mb-2">
                {activeImage.title}
              </h3>
              <p className="text-sm text-[#444E49] leading-relaxed">
                {activeImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
