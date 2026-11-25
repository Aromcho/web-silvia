'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import './Header.css';

const NAV_LINKS = [
  { href: '/propiedades', label: 'Propiedades' },
  { href: '/lotes-terrenos', label: 'Lotes - Terrenos' },
  { href: '/alquiler-temporario', label: 'Alquileres' },
  { href: '/complejos', label: 'Complejos' },
  { href: '/videos', label: 'Videos' },
  { href: '/nosotros', label: 'Nosotros' },
];

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const pathname = usePathname() || '/';

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

  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);
  const linkClass = (href, base = '') => `${base}${isActive(href) ? ' active' : ''}`.trim();

  return (
    <>
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
                    className={linkClass(link.href, 'nav-link')}
                    aria-current={isActive(link.href) ? 'page' : undefined}
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
            aria-label="Toggle menu"
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
                  className={linkClass(link.href)}
                  aria-current={isActive(link.href) ? 'page' : undefined}
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