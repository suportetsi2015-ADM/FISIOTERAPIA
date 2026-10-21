import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { TrustBar } from './components/TrustBar';
import { BookingSection } from './components/BookingSection';
import { PilatesIntro } from './components/PilatesIntro';
import { Benefits } from './components/Benefits';
import { AboutProfessional } from './components/AboutProfessional';
import { Differential } from './components/Differential';
import { Method } from './components/Method';
import { Audience } from './components/Audience';
import { Studio } from './components/Studio';
import { Experience } from './components/Experience';
import { Testimonials } from './components/Testimonials';
import { FAQ } from './components/FAQ';
import { FinalCTA } from './components/FinalCTA';
import { Location } from './components/Location';
import { Footer } from './components/Footer';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { BookingModal } from './components/BookingModal';
import { AdminPortal } from './components/AdminPortal';
import { UserPortal } from './components/UserPortal';
import { Lock, ShieldCheck, Users, X, ArrowRight } from 'lucide-react';

export type PortalType = 'admin' | 'usuario' | null;

function checkActivePortalRoute(): PortalType {
  if (typeof window === 'undefined') return null;
  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();
  const search = new URLSearchParams(window.location.search);

  // Check User Portal first
  if (
    path.startsWith('/usuario') ||
    path === '/user' ||
    hash === '#usuario' ||
    hash.startsWith('#/usuario') ||
    hash === '#user' ||
    hash.startsWith('#/user') ||
    search.get('portal') === 'usuario' ||
    search.get('portal') === 'user' ||
    search.get('view') === 'usuario' ||
    search.get('view') === 'user' ||
    search.has('usuario') ||
    search.has('user')
  ) {
    return 'usuario';
  }

  // Check Admin Portal
  if (
    path === '/admin' ||
    path.startsWith('/admin/') ||
    path === '/admin.html' ||
    path === '/painel' ||
    path.startsWith('/painel/') ||
    path.includes('admin') ||
    path.includes('painel') ||
    hash === '#admin' ||
    hash.startsWith('#/admin') ||
    hash === '#painel' ||
    hash.startsWith('#/painel') ||
    hash.includes('admin') ||
    hash.includes('painel') ||
    hash.includes('login') ||
    search.get('view') === 'admin' ||
    search.get('admin') === 'true' ||
    search.get('admin') === 'login' ||
    search.get('admin') === '1' ||
    search.get('login') === '1' ||
    search.get('portal') === 'admin' ||
    search.has('admin') ||
    search.has('painel') ||
    search.get('painel') === 'true'
  ) {
    return 'admin';
  }

  return null;
}

export default function App() {
  const [activePortal, setActivePortal] = useState<PortalType>(checkActivePortalRoute);
  const [portalChoiceModalOpen, setPortalChoiceModalOpen] = useState(false);
  const [bookingModalOpen, setBookingModalOpen] = useState(false);

  const handleSelectPortal = (portal: 'admin' | 'usuario') => {
    setPortalChoiceModalOpen(false);
    if (typeof window !== 'undefined') {
      window.location.hash = portal === 'admin' ? '#admin' : '#usuario';
    }
    setActivePortal(portal);
  };

  // Ícone de cadeado agora abre EXCLUSIVAMENTE o Painel do Usuário
  const handleOpenPortalSelector = () => {
    handleSelectPortal('usuario');
  };

  useEffect(() => {
    // If the site is opened with a trailing '#' (e.g. https://leiamarpilates.online/#),
    // cleanly normalize the URL to https://leiamarpilates.online/ without reloading
    if (typeof window !== 'undefined') {
      if (
        window.location.hash === '#' ||
        window.location.hash === '#/' ||
        window.location.href.endsWith('#') ||
        window.location.href.endsWith('/#')
      ) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }

    const handleLocationChange = () => {
      // Also clean up any accidental trailing lone '#' on navigation
      if (typeof window !== 'undefined') {
        if (
          window.location.hash === '#' ||
          window.location.hash === '#/' ||
          window.location.href.endsWith('#') ||
          window.location.href.endsWith('/#')
        ) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        }
      }
      setActivePortal(checkActivePortalRoute());
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Discreet emergency shortcut Ctrl + Shift + A for administrator
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleSelectPortal('admin');
      }
      // Discreet emergency shortcut Ctrl + Shift + U for user
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        handleSelectPortal('usuario');
      }
    };

    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('open-admin', () => handleSelectPortal('admin'));
    window.addEventListener('open-user-portal', () => handleSelectPortal('usuario'));

    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('open-admin', () => handleSelectPortal('admin'));
      window.removeEventListener('open-user-portal', () => handleSelectPortal('usuario'));
    };
  }, []);

  const handleReturnToSite = () => {
    if (typeof window !== 'undefined') {
      if (
        window.location.pathname.startsWith('/admin') ||
        window.location.pathname.startsWith('/painel') ||
        window.location.pathname.startsWith('/usuario') ||
        window.location.pathname.includes('admin.html')
      ) {
        window.history.pushState(null, '', '/');
      }

      // Cleanly remove hash without leaving a trailing '#' in browser URL
      if (window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }

      const url = new URL(window.location.href);
      ['admin', 'view', 'painel', 'portal', 'usuario', 'user'].forEach(key => url.searchParams.delete(key));
      const cleanHash = url.hash && url.hash !== '#' ? url.hash : '';
      window.history.pushState(null, '', url.pathname + (url.search || '') + cleanHash);
    }
    setActivePortal(null);
  };

  const handleOpenBooking = () => {
    const bookingEl = document.getElementById('agendamento');
    if (bookingEl) {
      bookingEl.scrollIntoView({ behavior: 'smooth' });
    } else {
      setBookingModalOpen(true);
    }
  };

  const handleCloseBooking = () => {
    setBookingModalOpen(false);
  };

  return (
    <>
      {activePortal === 'admin' ? (
        <AdminPortal onBackToSite={handleReturnToSite} />
      ) : activePortal === 'usuario' ? (
        <UserPortal onBackToSite={handleReturnToSite} />
      ) : (
        <div id="landing-page-root" className="min-h-screen flex flex-col bg-[#FFFDFB] text-[#26161B] antialiased selection:bg-[#FFEBF0] selection:text-[#9C2744]">
      {/* 1. Header (Clean public navigation) */}
      <Header onOpenBookingModal={handleOpenBooking} onOpenAdmin={handleOpenPortalSelector} />

      {/* Main Content Sections */}
      <main id="main-content" className="flex-grow">
        {/* 2. Hero */}
        <Hero onOpenBookingModal={handleOpenBooking} />

        {/* 3. Microelementos de Autoridade (TrustBar) */}
        <TrustBar />

        {/* 4. Sistema de Agendamento Automático com Seleção de Dias & Horários */}
        <BookingSection />

        {/* 5. Seção — Pilates com Propósito */}
        <PilatesIntro />

        {/* 6. Seção — Benefícios */}
        <Benefits />

        {/* 7. Seção — Sobre a Fisioterapeuta Dra. Léia Mar (100% foto oficial original) */}
        <AboutProfessional />

        {/* 8. Seção — Diferencial (Comparação visual) */}
        <Differential />

        {/* 9. Seção — Método de Atendimento (Jornada em 4 Etapas) */}
        <Method />

        {/* 10. Seção — Para Quem É? */}
        <Audience />

        {/* 11. Seção — O Espaço Boutique */}
        <Studio />

        {/* 12. Seção — Experiência do Atendimento */}
        <Experience />

        {/* 13. Seção — Depoimentos */}
        <Testimonials />

        {/* 14. Seção — FAQ Accordion */}
        <FAQ />

        {/* 15. Seção — CTA Final */}
        <FinalCTA onOpenBookingModal={handleOpenBooking} />

        {/* 16. Seção — Localização e Mapa Manaus */}
        <Location />
      </main>

      {/* 17. Footer com cadeado que abre o menu dos 2 portais */}
      <Footer
        onOpenAdmin={handleOpenPortalSelector}
        onOpenPortals={handleOpenPortalSelector}
      />

      {/* 18. Persistent Floating WhatsApp Button (Bottom Right) */}
      <FloatingWhatsApp />

      {/* 19. Quick Booking / Inquiry Modal */}
      <BookingModal isOpen={bookingModalOpen} onClose={handleCloseBooking} />
    </div>
  )}
</>
  );
}
