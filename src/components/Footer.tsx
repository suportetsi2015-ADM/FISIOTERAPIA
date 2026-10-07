import React, { useState } from 'react';
import {
  Instagram,
  MessageCircle,
  MapPin,
  X,
  Heart,
  Calendar,
  Facebook,
  Youtube,
  Linkedin,
  Globe,
  Lock
} from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useClinicData } from '../data/clinicStore';
import { useFooterData, SocialLinkItem } from '../data/footerStore';

interface FooterProps {
  onOpenAdmin?: () => void;
  onOpenPortals?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, onOpenPortals }) => {
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const clinic = useClinicData();
  const { config: footer } = useFooterData();

  const handleLockClick = () => {
    if (onOpenPortals) {
      onOpenPortals();
    } else if (onOpenAdmin) {
      onOpenAdmin();
    }
  };

  const renderSocialIcon = (item: SocialLinkItem) => {
    if (item.customIconUrl) {
      return (
        <img
          src={item.customIconUrl}
          alt={item.label}
          className="w-5 h-5 object-contain rounded-full"
        />
      );
    }
    switch (item.platform) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5" />;
      case 'instagram':
        return <Instagram className="w-5 h-5" />;
      case 'facebook':
        return <Facebook className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5" />;
      case 'maps':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <footer id="main-footer" className="bg-[#211317] text-[#F9ECEF] pt-16 pb-12 border-t border-[#4A2430]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 pb-12 border-b border-white/10">
          
          {/* Col 1: Brand & Credentials (5 cols) */}
          <div className="lg:col-span-5">
            <h3 className="font-serif text-2xl sm:text-3xl text-white font-semibold mb-2">
              {footer.brandTitle || clinic.name}
            </h3>
            <p className="text-xs uppercase tracking-widest text-[#FFB3C6] font-semibold mb-4">
              {footer.brandSubtitle || `Fisioterapia & Pilates • CREFITO ${clinic.crefito}`}
            </p>
            <p className="text-sm text-[#DFBAC6] leading-relaxed max-w-md mb-6 font-light">
              {footer.brandDescription ||
                'Pilates personalizado com olhar fisioterapêutico especializado em Manaus. Atendimento exclusivo, acolhedor e individualizado para saúde da coluna, reabilitação, força profunda e qualidade de vida.'}
            </p>
            
            {/* Dynamic Social Icons & Links */}
            <div className="flex flex-wrap items-center gap-3">
              {footer.socialLinks.filter(s => s.active !== false).map(soc => (
                <a
                  key={soc.id}
                  href={soc.url}
                  target={soc.url.startsWith('#') ? undefined : '_blank'}
                  rel={soc.url.startsWith('#') ? undefined : 'noopener noreferrer'}
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-[#D85072] flex items-center justify-center text-white transition-all hover:scale-105 shadow-xs"
                  aria-label={soc.label}
                  title={soc.label}
                >
                  {renderSocialIcon(soc)}
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Navigation Shortcuts (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#FFB3C6] mb-4">
              {footer.navTitle || 'Navegação'}
            </h4>
            <ul className="space-y-2.5 text-sm text-[#DFBAC6] font-light">
              <li>
                <a
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    if (window.location.hash) {
                      window.history.replaceState(null, '', window.location.pathname + window.location.search);
                    }
                  }}
                  className="hover:text-white transition-colors"
                >
                  Início
                </a>
              </li>
              <li>
                <a href="#agendamento" className="hover:text-[#FF8DA7] transition-colors font-medium flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-[#D85072]" />
                  <span>Agendamento Online</span>
                </a>
              </li>
              <li>
                <a href="#pilates" className="hover:text-white transition-colors">Pilates com Propósito</a>
              </li>
              <li>
                <a href="#beneficios" className="hover:text-white transition-colors">Benefícios</a>
              </li>
              <li>
                <a href="#sobre" className="hover:text-white transition-colors">Sobre a Dra. Léia</a>
              </li>
              <li>
                <a href="#metodo" className="hover:text-white transition-colors">Método & Fases</a>
              </li>
              <li>
                <a href="#espaco" className="hover:text-white transition-colors">Nosso Estúdio</a>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition-colors">Dúvidas Frequentes</a>
              </li>
              <li>
                <a href="#localizacao" className="hover:text-white transition-colors">Localização em Manaus</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Studio details (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-[#FFB3C6] mb-4">
              {footer.contactTitle || 'Estúdio & Contato'}
            </h4>
            <div className="space-y-3 text-sm text-[#DFBAC6] font-light">
              <p>
                <strong className="font-semibold text-white">Endereço:</strong> {clinic.address}
              </p>
              <p>
                <strong className="font-semibold text-white">Referência:</strong> {clinic.landmarks}
              </p>
              <p>
                <strong className="font-semibold text-white">Bairro:</strong> {clinic.neighborhood} — {clinic.cityState}
              </p>
              <p>
                <strong className="font-semibold text-white">WhatsApp:</strong> {clinic.phoneDisplay}
              </p>
            </div>
          </div>

        </div>

        {/* Bottom copyright & legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-[#A8828F] gap-4">
          <p>{footer.copyrightText || `© 2026 ${clinic.name} — Todos os direitos reservados. CREFITO ${clinic.crefito}.`}</p>

          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Política de Privacidade
            </button>
            <button
              onClick={() => setTermsModalOpen(true)}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Termos de Uso
            </button>

            {/* Ícone do cadeado remanejado: rodapé, no canto inferior direito, discreto e isolado */}
            {(onOpenAdmin || onOpenPortals) && (
              <button
                type="button"
                onClick={handleLockClick}
                id="footer-admin-lock-btn"
                title="Acesso aos Portais"
                aria-label="Acesso aos Portais"
                className="opacity-30 hover:opacity-100 p-1 text-[#DFBAC6] hover:text-white transition-opacity cursor-pointer rounded ml-1"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

      </div>

      {/* Privacy Policy Modal */}
      {privacyModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPrivacyModalOpen(false)}
        >
          <div
            className="bg-[#FFFDFB] text-[#26161B] max-w-2xl w-full rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto border border-[#FCD6E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#FCD6E0]">
              <h3 className="font-serif text-2xl font-semibold text-[#26161B]">
                {footer.privacyTitle || 'Política de Privacidade (LGPD)'}
              </h3>
              <button
                onClick={() => setPrivacyModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#FFEBF0]"
              >
                <X className="w-5 h-5 text-[#8C3B50]" />
              </button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-[#5B444C] leading-relaxed whitespace-pre-line">
              {footer.privacyText}
            </div>
          </div>
        </div>
      )}

      {/* Terms of Use Modal */}
      {termsModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setTermsModalOpen(false)}
        >
          <div
            className="bg-[#FFFDFB] text-[#26161B] max-w-2xl w-full rounded-3xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto border border-[#FCD6E0]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#FCD6E0]">
              <h3 className="font-serif text-2xl font-semibold text-[#26161B]">
                {footer.termsTitle || 'Termos de Uso'}
              </h3>
              <button
                onClick={() => setTermsModalOpen(false)}
                className="p-1 rounded-full hover:bg-[#FFEBF0]"
              >
                <X className="w-5 h-5 text-[#8C3B50]" />
              </button>
            </div>
            <div className="space-y-4 text-xs sm:text-sm text-[#5B444C] leading-relaxed whitespace-pre-line">
              {footer.termsText}
            </div>
          </div>
        </div>
      )}

    </footer>
  );
};
