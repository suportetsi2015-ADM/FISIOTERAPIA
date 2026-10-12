import React, { useState, useEffect } from 'react';
import { Menu, X, Phone, Calendar } from 'lucide-react';
import { getWhatsAppUrl } from '../data/content';
import { useClinicData } from '../data/clinicStore';

interface HeaderProps {
  onOpenBookingModal: () => void;
  onOpenAdmin?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenBookingModal }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const clinic = useClinicData();

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

  const navItems = [
    { label: 'Início', href: '/' },
    { label: 'Agendamento', href: '#agendamento' },
    { label: 'Pilates', href: '#pilates' },
    { label: 'Benefícios', href: '#beneficios' },
    { label: 'Sobre', href: '#sobre' },
    { label: 'Método', href: '#metodo' },
    { label: 'Espaço', href: '#espaco' },
    { label: 'Depoimentos', href: '#depoimentos' },
    { label: 'Localização', href: '#localizacao' },
  ];

  return (
    <header
      id="main-header"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-xs border-b border-[#FCD6E0]/80 py-3.5'
          : 'bg-[#FFFDFB]/85 backdrop-blur-xs border-b border-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Oficial Transparente e Nome da Marca */}
          <a
            href="/"
            onClick={handleScrollToTop}
            id="brand-logo-link"
            className="group flex items-center gap-3 sm:gap-3.5 focus:outline-none rounded-sm"
          >
            <img
              src="/images/logo_transparente.png"
              alt="Logo Oficial Dra. Léia Mar"
              className="w-12 h-12 sm:w-14 sm:h-14 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col items-start">
              <span className="font-serif text-2xl sm:text-[1.65rem] tracking-tight font-semibold text-[#26161B] group-hover:text-[#D85072] transition-colors leading-none">
                {clinic.name}
              </span>
              <span className="text-[11px] sm:text-xs font-medium tracking-wider uppercase text-[#8C3B50] mt-1">
                Fisioterapia & Pilates
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav id="desktop-navigation" className="hidden xl:flex items-center gap-6" aria-label="Navegação Principal">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={item.href === '/' ? handleScrollToTop : undefined}
                className="text-xs sm:text-sm font-medium text-[#5B444C] hover:text-[#D85072] transition-colors relative py-1 focus:outline-none"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
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
          className="xl:hidden fixed inset-x-0 top-full bg-white border-b border-[#FCD6E0] shadow-xl px-6 py-6 transition-all"
        >
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  setMobileMenuOpen(false);
                  if (item.href === '/') {
                    handleScrollToTop(e);
                  }
                }}
                className="text-sm font-medium text-[#26161B] hover:text-[#D85072] py-1.5 border-b border-[#F2E7E1] flex items-center justify-between"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[#A8928B]">›</span>
              </a>
            ))}

            <div className="pt-3 flex flex-col gap-2.5">
              <a
                href="#agendamento"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-3 px-4 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#D85072] to-[#BC3859] shadow-xs flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Agendamento</span>
              </a>

              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-full text-xs font-semibold text-[#26161B] bg-[#FFFDFB] border border-[#E4D3CA] flex items-center justify-center gap-2"
              >
                <Phone className="w-3.5 h-3.5 text-[#D85072]" />
                <span>WhatsApp: {clinic.phoneDisplay}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
