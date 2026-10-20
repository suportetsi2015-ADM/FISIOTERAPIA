import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useClinicData } from '../data/clinicStore';
import { useHeaderData } from '../data/headerStore';

interface HeaderProps {
  onOpenBookingModal: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBookingModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clinic = useClinicData();
  const { config: header } = useHeaderData();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (window.location.hash) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  };

  const handleCtaClick = (e: React.MouseEvent) => {
    if (header.ctaButtonAction === 'booking_modal') {
      e.preventDefault();
      onOpenBookingModal();
    } else if (header.ctaButtonAction === 'whatsapp') {
      e.preventDefault();
      const raw = header.whatsAppPhoneRaw || clinic.phoneRaw || '5592986201641';
      window.open(`https://wa.me/${raw}?text=${encodeURIComponent(clinic.defaultWhatsAppMessage || 'Olá, gostaria de agendar uma sessão de Pilates.')}`, '_blank');
    }
    // If 'scroll_agendamento', default link behavior takes over to #agendamento
  };

  const activeNavItems = header.navItems.filter(item => item.active !== false);

  // Styling based on headerStyle
  const getHeaderContainerClass = () => {
    if (header.headerStyle === 'solid') {
      return isScrolled
        ? 'bg-white shadow-md border-b border-[#FCD6E0] py-3'
        : 'bg-[#FFFDFB] border-b border-[#FCD6E0]/60 py-4 sm:py-4.5';
    }
    if (header.headerStyle === 'bordered') {
      return isScrolled
        ? 'bg-white/95 backdrop-blur-md shadow-xs border-b-2 border-[#D85072]/30 py-3.5'
        : 'bg-[#FFFDFB]/90 backdrop-blur-xs border-b border-[#D85072]/20 py-4 sm:py-5';
    }
    // Default 'glass'
    return isScrolled
      ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#FCD6E0]/80 py-3.5'
      : 'bg-[#FFFDFB]/85 backdrop-blur-xs border-b border-transparent py-4 sm:py-5';
  };

  const getLogoStyle = () => {
    const height = header.logoHeight || 52;
    return {
      height: `${height}px`,
      width: 'auto',
      maxHeight: `${height}px`
    };
  };

  const getLogoWrapperClass = () => {
    let classes = 'flex items-center justify-center shrink-0 transition-transform group-hover:scale-105';
    if (header.logoBackground === 'white') {
      classes += ' bg-white p-1 shadow-xs';
    }
    if (header.logoShape === 'circular') {
      classes += ' rounded-full overflow-hidden';
    } else if (header.logoShape === 'rounded') {
      classes += ' rounded-xl overflow-hidden';
    }
    return classes;
  };

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${getHeaderContainerClass()}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo Oficial e Nome da Marca */}
          <a
            href="/"
            onClick={handleScrollToTop}
            id="brand-logo-link"
            className="group flex items-center gap-3 sm:gap-3.5 focus:outline-none rounded-sm shrink-0"
          >
            {header.showLogo && header.logoUrl && (
              <div className={getLogoWrapperClass()}>
                <img
                  src={header.logoUrl}
                  alt={header.brandTitle || clinic.name}
                  style={getLogoStyle()}
                  className="object-contain"
                />
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="font-serif text-2xl sm:text-[1.65rem] tracking-tight font-semibold text-[#26161B] group-hover:text-[#D85072] transition-colors leading-none">
                {header.brandTitle || clinic.name}
              </span>
              {header.showSubtitle && (
                <span className="text-[11px] sm:text-xs font-medium tracking-wider uppercase text-[#8C3B50] mt-1">
                  {header.brandSubtitle || 'Fisioterapia & Pilates'}
                </span>
              )}
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav id="desktop-navigation" className="hidden xl:flex items-center gap-5 2xl:gap-6" aria-label="Navegação Principal">
            {activeNavItems.map((item) => (
              <a
                key={item.id || item.label}
                href={item.href}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={item.href === '/' ? handleScrollToTop : undefined}
                className="text-xs sm:text-sm font-medium text-[#5B444C] hover:text-[#D85072] transition-colors relative py-1 focus:outline-none whitespace-nowrap"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Action Buttons (CTA & WhatsApp) */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {header.showWhatsAppButton && (
              <a
                href={getWhatsAppUrl(header.whatsAppPhoneRaw)}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden 2xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] hover:bg-[#D5EEDC] border border-[#B6E3C3] transition-all hover:scale-102"
                title="Atendimento via WhatsApp"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{header.whatsAppText || 'WhatsApp'}</span>
              </a>
            )}

            {header.showCtaButton && (
              <a
                href="#agendamento"
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-4 py-2 sm:px-4.5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] hover:from-[#BC3859] hover:to-[#9C2744] shadow-xs hover:shadow-md transition-all hover:scale-102 cursor-pointer"
              >
                <Calendar className="w-4 h-4" />
                <span>{header.ctaButtonText || 'Agendar Sessão'}</span>
              </a>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            {header.showCtaButton && (
              <button
                type="button"
                onClick={onOpenBookingModal}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-white bg-[#D85072] hover:bg-[#BC3859] shadow-xs cursor-pointer sm:hidden"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Agendar</span>
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              id="mobile-menu-toggle"
              type="button"
              className="p-2.5 rounded-md text-[#26161B] hover:bg-[#FFEBF0] focus:outline-none cursor-pointer"
              aria-expanded={mobileMenuOpen}
              aria-label="Abrir menu de navegação"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#26161B]" /> : <Menu className="w-6 h-6 text-[#26161B]" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-drawer"
          className="xl:hidden fixed inset-x-0 top-full bg-white border-b border-[#FCD6E0] shadow-xl px-6 py-6 transition-all max-h-[85vh] overflow-y-auto"
        >
          <div className="flex flex-col space-y-3">
            {activeNavItems.map((item) => (
              <a
                key={item.id || item.label}
                href={item.href}
                target={item.openInNewTab ? '_blank' : undefined}
                rel={item.openInNewTab ? 'noopener noreferrer' : undefined}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.href === '/') {
                    handleScrollToTop(e);
                  }
                }}
                className="text-sm font-medium text-[#26161B] hover:text-[#D85072] py-2 border-b border-[#F2E7E1] flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[#A8928B]">›</span>
              </a>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              {header.showCtaButton && (
                <a
                  href="#agendamento"
                  onClick={(e) => {
                    setMobileMenuOpen(false);
                    handleCtaClick(e);
                  }}
                  className="w-full text-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>{header.ctaButtonText || 'Agendar Sessão'}</span>
                </a>
              )}

              {header.showWhatsAppButton && (
                <a
                  href={getWhatsAppUrl(header.whatsAppPhoneRaw)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-full text-xs font-semibold text-[#1D7A46] bg-[#EBF7EE] border border-[#B6E3C3] flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{header.whatsAppText || 'WhatsApp'}: {header.whatsAppPhoneDisplay || clinic.phoneDisplay}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
