import React, { useState } from 'react';
import {
  Palette,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  CheckCircle2,
  Sliders,
  ExternalLink,
  Eye,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  useThemePalette,
  ThemePalette,
  THEME_PRESETS,
  DEFAULT_THEME_PALETTE
} from '../../data/themeStore';

export const AdminPaletaCoresTab: React.FC = () => {
  const { theme, setTheme, resetTheme, presets } = useThemePalette();
  const [currentPalette, setCurrentPalette] = useState<ThemePalette>(theme);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSelectPreset = (preset: ThemePalette) => {
    setCurrentPalette({ ...preset });
    setTheme(preset);
    showToast(`Paleta "${preset.name}" aplicada com sucesso em tempo real!`);
  };

  const handleColorChange = (key: keyof ThemePalette, value: string) => {
    const updated = {
      ...currentPalette,
      [key]: value
    };
    setCurrentPalette(updated);
    setTheme(updated);
  };

  const handleReset = () => {
    resetTheme();
    setCurrentPalette(DEFAULT_THEME_PALETTE);
    showToast('Paleta restaurada para o padrão oficial Boutique Rose & Ameixa!');
  };

  const handleManualSave = () => {
    setTheme(currentPalette);
    showToast('Configuração de cores gravada definitivamente no servidor global!');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Info */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FFEBF0] text-[#9C2744] text-xs font-bold uppercase tracking-wider mb-2 border border-[#FCD6E0]">
              <Palette className="w-3.5 h-3.5 text-[#D85072]" />
              <span>Design System • Layout & Identidade Visual</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#26161B]">
              Paleta de Cores & Layout da One Page
            </h2>
            <p className="text-xs sm:text-sm text-[#5B444C] mt-1 max-w-2xl">
              Altere instantaneamente as cores de toda a plataforma pública (One Page): botões, gradientes, títulos, fundos, bordas e rodapé. Qualquer alteração reflete imediatamente em todos os navegadores e celulares.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#FCD6E0] bg-[#FFFDFB] hover:bg-[#FFEBF0] text-[#9C2744] text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-2xs"
              title="Restaurar paleta padrão da Dra. Léia Mar"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restaurar Padrão</span>
            </button>

            <button
              type="button"
              onClick={handleManualSave}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] text-white text-xs sm:text-sm font-bold transition-all shadow-md active:scale-[0.99] cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Cores</span>
            </button>
          </div>
        </div>
      </div>

      {toastMessage && (
        <div className="p-4 rounded-2xl bg-[#EBF7EE] border border-[#B6E3C3] text-xs sm:text-sm font-semibold text-[#1D7A46] flex items-center gap-2.5 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#1D7A46]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* SEÇÃO 1: PALETAS TEMÁTICAS PRONTAS (1 CLIQUE) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
            Paletas Prontas Harmonizadas
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B] mt-2">
            Escolha uma Paleta Pré-configurada com 1 Clique
          </h3>
          <p className="text-xs sm:text-sm text-[#5B444C] mt-1">
            Cada paleta foi calibrada com contraste de leitura ideal e psicologia das cores voltada para fisioterapia e pilates boutique.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {presets.map((preset) => {
            const isSelected = currentPalette.id === preset.id || currentPalette.primary === preset.primary;
            return (
              <div
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#D85072] bg-[#FFF9F9] shadow-md ring-2 ring-[#D85072]/20'
                    : 'border-[#FCD6E0]/80 bg-[#FFFDFB] hover:border-[#D85072]/50 hover:bg-[#FFF5F7]'
                }`}
              >
                <div>
                  {/* Badges de Cores */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <span
                      className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: preset.primary }}
                      title={`Cor Primária: ${preset.primary}`}
                    />
                    <span
                      className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: preset.accent }}
                      title={`Acento: ${preset.accent}`}
                    />
                    <span
                      className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: preset.pageBg }}
                      title={`Fundo: ${preset.pageBg}`}
                    />
                    <span
                      className="w-7 h-7 rounded-full shadow-inner border border-black/10 flex-shrink-0"
                      style={{ backgroundColor: preset.footerBg }}
                      title={`Rodapé: ${preset.footerBg}`}
                    />

                    {isSelected && (
                      <span className="ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#1D7A46] text-white shadow-2xs">
                        <Check className="w-3 h-3" />
                        <span>Ativa</span>
                      </span>
                    )}
                  </div>

                  <h4 className="font-serif text-base font-bold text-[#26161B]">
                    {preset.name}
                  </h4>
                  <p className="text-xs text-[#5B444C] mt-1 leading-relaxed">
                    {preset.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-[#FCD6E0]/50 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#8C3B50]">
                    {preset.primary} • {preset.accent}
                  </span>
                  <span className={`font-semibold text-xs ${isSelected ? 'text-[#D85072]' : 'text-[#8C3B50]'}`}>
                    {isSelected ? 'Em uso' : 'Clique para aplicar'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SEÇÃO 2: CUSTOMIZAÇÃO MANUAL DETALHADA DE CORES */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
            Ajuste Fino de Cada Cor
          </span>
          <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B] mt-2">
            Personalização de Códigos Hexadecimais
          </h3>
          <p className="text-xs sm:text-sm text-[#5B444C] mt-1">
            Clique no círculo de cor ou digite o código HEX para ajustar individualmente qualquer elemento visual.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* 1. Cor Primária */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              1. Cor Primária (Botões & Ações)
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Botões de agendamento automático, ícones principais e destaques.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.primary}
                onChange={(e) => handleColorChange('primary', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 2. Cor de Acento */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              2. Cor de Acento (Títulos & Badges)
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Segunda cor do degradê, títulos destacados e bordas de foco.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.accent}
                onChange={(e) => handleColorChange('accent', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 3. Fundo Principal da One Page */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              3. Fundo Geral da One Page
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Plano de fundo contínuo da página pública (off-white, areia, gelo).
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.pageBg}
                onChange={(e) => handleColorChange('pageBg', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.pageBg}
                onChange={(e) => handleColorChange('pageBg', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 4. Fundo Intermediário / Seções Alternadas */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              4. Fundo Suave das Seções
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Fundo sutil aplicado no Hero, Sobre e blocos de depoimentos.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.pageBgGradientMid}
                onChange={(e) => handleColorChange('pageBgGradientMid', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.pageBgGradientMid}
                onChange={(e) => handleColorChange('pageBgGradientMid', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 5. Cor do Texto Escuro (Títulos) */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              5. Títulos Principais (Texto Escuro)
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Cor nobre para títulos Cormorant Garamond e nomes de destaque.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.textDark}
                onChange={(e) => handleColorChange('textDark', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.textDark}
                onChange={(e) => handleColorChange('textDark', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 6. Cor do Texto Suave (Parágrafos) */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              6. Textos Secundários (Parágrafos)
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Cor suave para parágrafos explicativos e legendas.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.textMuted}
                onChange={(e) => handleColorChange('textMuted', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.textMuted}
                onChange={(e) => handleColorChange('textMuted', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 7. Cor das Bordas */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              7. Bordas e Delimitadores
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Linhas finas que emolduram cartões e separadores de seção.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.borderLight}
                onChange={(e) => handleColorChange('borderLight', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.borderLight}
                onChange={(e) => handleColorChange('borderLight', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 8. Fundo de Badges e Pílulas */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              8. Fundo de Etiquetas & Pílulas
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Fundo sutil atrás de pequenos títulos e tags em destaque.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.badgeBg}
                onChange={(e) => handleColorChange('badgeBg', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.badgeBg}
                onChange={(e) => handleColorChange('badgeBg', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>

          {/* 9. Cor do Rodapé */}
          <div className="p-4 rounded-2xl bg-[#FFFDFB] border border-[#FCD6E0] space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#26161B]">
              9. Fundo Escuro do Rodapé
            </label>
            <p className="text-[11px] text-[#5B444C]">
              Cor sóbria e elegante da base institucional da plataforma.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <input
                type="color"
                value={currentPalette.footerBg}
                onChange={(e) => handleColorChange('footerBg', e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-[#FCD6E0] p-0.5 bg-white"
              />
              <input
                type="text"
                value={currentPalette.footerBg}
                onChange={(e) => handleColorChange('footerBg', e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl border border-[#FCD6E0] font-mono text-xs text-[#26161B] uppercase bg-white focus:outline-none focus:ring-2 focus:ring-[#D85072]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SEÇÃO 3: PREVIEW INTERATIVO DA PALETA SELECIONADA */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#FCD6E0] shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#9C2744] bg-[#FFEBF0] px-3 py-1 rounded-full border border-[#FCD6E0]">
              Demonstração ao Vivo
            </span>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#26161B] mt-2">
              Prévia Visual dos Elementos com a Paleta Atual
            </h3>
          </div>

          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FFFDFB] hover:bg-[#FFEBF0] border border-[#FCD6E0] text-xs font-bold text-[#26161B] hover:text-[#D85072] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver no Site Público</span>
          </a>
        </div>

        {/* Mock Container */}
        <div
          className="p-6 sm:p-8 rounded-2xl border transition-colors space-y-6"
          style={{
            backgroundColor: currentPalette.pageBg,
            borderColor: currentPalette.borderLight
          }}
        >
          {/* Badge de exemplo */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <span
              className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold tracking-widest uppercase border"
              style={{
                backgroundColor: currentPalette.badgeBg,
                color: currentPalette.accent,
                borderColor: currentPalette.borderLight
              }}
            >
              <Sparkles className="w-3.5 h-3.5" style={{ color: currentPalette.primary }} />
              <span>PILATES • FISIOTERAPIA • MANAUS</span>
            </span>

            <span className="text-xs font-medium" style={{ color: currentPalette.textAccent }}>
              Prévia fiel aos componentes da One Page
            </span>
          </div>

          {/* Título de Exemplo */}
          <div>
            <h4
              className="font-serif text-2xl sm:text-3xl font-semibold tracking-tight"
              style={{ color: currentPalette.textDark }}
            >
              Seu corpo em movimento.{' '}
              <span className="italic font-normal" style={{ color: currentPalette.primary }}>
                Sua vida com mais leveza.
              </span>
            </h4>
            <p className="text-xs sm:text-sm mt-2 max-w-xl" style={{ color: currentPalette.textMuted }}>
              Pilates privativo e personalizado conduzido pela Dra. Léia Mar na Cidade Nova, Manaus.
            </p>
          </div>

          {/* Botões CTA de Exemplo */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              type="button"
              className="px-6 py-3 rounded-full text-xs sm:text-sm font-semibold text-white shadow-md flex items-center gap-2 transition-transform hover:scale-102"
              style={{
                backgroundImage: `linear-gradient(to right, ${currentPalette.primary}, ${currentPalette.accent})`
              }}
            >
              <span>Agendamento Automático</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              className="px-5 py-3 rounded-full text-xs sm:text-sm font-medium border transition-colors"
              style={{
                backgroundColor: currentPalette.cardBg,
                color: currentPalette.accent,
                borderColor: currentPalette.borderLight
              }}
            >
              <span>Falar no WhatsApp</span>
            </button>
          </div>

          {/* Cartão de Exemplo */}
          <div
            className="p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              backgroundColor: currentPalette.pageBgGradientMid,
              borderColor: currentPalette.borderLight
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-serif font-bold text-sm text-white"
                style={{ backgroundColor: currentPalette.primary }}
              >
                LM
              </div>
              <div>
                <strong className="block text-xs font-bold" style={{ color: currentPalette.textDark }}>
                  Espaço Boutique & Aparelhos Clássicos
                </strong>
                <span className="text-[11px]" style={{ color: currentPalette.textMuted }}>
                  Cadillac, Reformer, Wunda Chair e Ladder Barrel
                </span>
              </div>
            </div>

            <span
              className="px-3 py-1 rounded-full text-[10px] font-bold"
              style={{
                backgroundColor: currentPalette.badgeBg,
                color: currentPalette.accent
              }}
            >
              100% Personalizado
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
