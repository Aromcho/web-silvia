'use client';
import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import { normalizeOperation } from '../../helpers/searchFilters';
import './Header.css';

// Un solo buscador: Lotes, Alquileres y Complejos abren /propiedades con su filtro puesto
const NAV_LINKS = [
  { href: '/propiedades', label: 'Propiedades', search: 'propiedades' },
  { href: '/propiedades?type=Terreno', label: 'Lotes - Terrenos', search: 'lotes' },
  { href: '/propiedades?operation=temporario', label: 'Alquileres', search: 'alquileres' },
  { href: '/propiedades?type=Complejo', label: 'Complejos', search: 'complejos' },
  { href: '/videos', label: 'Videos' },
  { href: '/nosotros', label: 'Nosotros' },
];

// A qué entrada del menú corresponde la búsqueda que se está viendo
const searchSection = (search) => {
  const params = new URLSearchParams(search);
  const type = params.get('type') || '';
  if (type === 'Terreno') return 'lotes';
  if (type === 'Complejo') return 'complejos';
  return normalizeOperation(params.get('operation')) === 'venta' ? 'propiedades' : 'alquileres';
};

// Las páginas por zona marcan la misma entrada que su búsqueda
const LANDING_SECTION = {
  venta: 'propiedades',
  'casas-en-venta': 'propiedades',
  'departamentos-en-venta': 'propiedades',
  'lotes-terrenos': 'lotes',
  'alquiler-temporario': 'alquileres',
  'alquiler-anual': 'alquileres',
};

// Avisa los filtros de la URL al header. Va aparte y dentro de un Suspense porque useSearchParams
// obligaría a renderizar todo el header en el navegador en las páginas estáticas.
function SearchParamsWatcher({ onChange }) {
  const search = useSearchParams().toString();
  useEffect(() => {
    onChange(search);
  }, [search, onChange]);
  return null;
}

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // Filtros de la URL (null hasta leerlos en el navegador)
  const [search, setSearch] = useState(null);

  const pathname = usePathname() || '/';

  // El buscador reescribe la URL al tocar un filtro: el menú se entera por este evento
  useEffect(() => {
    const sync = () => setSearch(window.location.search.replace(/^\?/, ''));
    window.addEventListener('sf:search-filters', sync);
    return () => window.removeEventListener('sf:search-filters', sync);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  const closeMenu = () => setIsMenuOpen(false);

  const openChat = () => {
    setIsMenuOpen(false);
    setIsChatOpen(true);
  };

  // El menú se cierra solo al cambiar de página
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Con el menú abierto: Escape lo cierra y la página de atrás no scrollea
  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') setIsMenuOpen(false);
    };
    const root = document.documentElement;
    const previousOverflow = root.style.overflow;
    root.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      root.style.overflow = previousOverflow;
    };
  }, [isMenuOpen]);

  // Entrada marcada: en el buscador depende de los filtros; en una página por zona, de su tipo
  const activeSection = pathname === '/propiedades'
    ? (search === null ? null : searchSection(search))
    : LANDING_SECTION[pathname.split('/')[1]] || null;
  const isActive = (link) => (
    link.search
      ? link.search === activeSection
      : pathname === link.href || pathname.startsWith(`${link.href}/`)
  );
  const linkClass = (link, base = '') => `${base}${isActive(link) ? ' active' : ''}`.trim();

  return (
    <>
    <Suspense fallback={null}>
      <SearchParamsWatcher onChange={setSearch} />
    </Suspense>
    <div
      className={`mobile-menu-backdrop ${isMenuOpen ? 'is-open' : ''}`}
      onClick={closeMenu}
      aria-hidden="true"
    />
    <header className="header">
      <div className="container-hero">
        <div className="header-content">
          {/* Logo */}
          <Link href="/" className="logo">
            <Image
              src="/assets/images/logo.jpg"
              alt="Silvia Fernández - Inmobiliaria"
              width={180}
              height={60}
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              {NAV_LINKS.map((link) => (
                <li className="nav-item" key={link.href}>
                  <Link
                    href={link.href}
                    className={linkClass(link, 'nav-link')}
                    aria-current={isActive(link) ? 'page' : undefined}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* CTA Button */}
          <div className="header-cta">
            <button 
              onClick={() => setIsChatOpen(true)} 
              className="btn btn-primary"
            >
              Consultar Ahora
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`}
            onClick={toggleMenu}
            aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isMenuOpen}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${isMenuOpen ? 'mobile-menu-open' : ''}`}>
          <ul className="mobile-nav-list">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={closeMenu}
                  className={linkClass(link)}
                  aria-current={isActive(link) ? 'page' : undefined}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mobile-menu-cta">
            <button type="button" onClick={openChat} className="btn btn-primary">
              Consultar Ahora
            </button>
          </div>
        </div>
      </div>
      
      {/* WhatsApp Chat Modal */}
      <WhatsAppChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
    </>
  );
};

export default Header;