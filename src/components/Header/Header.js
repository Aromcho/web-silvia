'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import WhatsAppChat from '../WhatsAppChat/WhatsAppChat';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container-hero">
        <div className="header-content">
          {/* Logo */}
          <div className="logo">
            <Image
              src="/assets/images/logo.jpg"
              alt="Silvia Fernández - Inmobiliaria"
              width={180}
              height={60}
              priority
            />
          </div>

          {/* Desktop Navigation */}
          <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
            <ul className="nav-list">
              <li className="nav-item">
                <Link href="/" className="nav-link">Inicio</Link>
              </li>
              <li className="nav-item">
                <Link href="/propiedades" className="nav-link">Propiedades</Link>
              </li>
              <li className="nav-item">
                <Link href="/lotes-terrenos" className="nav-link">Lotes - Terrenos</Link>
              </li>
              <li className="nav-item">
                <Link href="/alquiler-temporario" className="nav-link">Alquiler Temporario</Link>
              </li>
              <li className="nav-item">
                <Link href="/complejos" className="nav-link">Complejos</Link>
              </li>
              <li className="nav-item">
                <Link href="/nosotros" className="nav-link">Nosotros</Link>
              </li>
              <li className="nav-item">
                <Link href="/mapa" className="nav-link">Mapa</Link>
              </li>
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
            <li><Link href="/" onClick={toggleMenu}>Inicio</Link></li>
            <li><Link href="/propiedades" onClick={toggleMenu}>Propiedades</Link></li>
            <li><Link href="/lotes-terrenos" onClick={toggleMenu}>Lotes - Terrenos</Link></li>
            <li><Link href="/alquiler-temporario" onClick={toggleMenu}>Alquiler Temporario</Link></li>
            <li><Link href="/complejos" onClick={toggleMenu}>Complejos</Link></li>
            <li><Link href="/nosotros" onClick={toggleMenu}>Nosotros</Link></li>
            <li><Link href="/mapa" onClick={toggleMenu}>Mapa</Link></li>
          </ul>
        </div>
      </div>
      
      {/* WhatsApp Chat Modal */}
      <WhatsAppChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
};

export default Header;