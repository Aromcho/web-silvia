'use client';
import { useState } from 'react';
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
                <a href="/" className="nav-link">Inicio</a>
              </li>
              <li className="nav-item">
                <a href="/propiedades" className="nav-link">Propiedades</a>
              </li>
              <li className="nav-item">
                <a href="/lotes-terrenos" className="nav-link">Lotes - Terrenos</a>
              </li>
              <li className="nav-item">
                <a href="/alquiler-temporario" className="nav-link">Alquiler Temporario</a>
              </li>
              <li className="nav-item">
                <a href="/complejos" className="nav-link">Complejos</a>
              </li>
              <li className="nav-item">
                <a href="/nosotros" className="nav-link">Nosotros</a>
              </li>
              <li className="nav-item">
                <a href="/mapa" className="nav-link">Mapa</a>
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
            <li><a href="/" onClick={toggleMenu}>Inicio</a></li>
            <li><a href="/propiedades" onClick={toggleMenu}>Propiedades</a></li>
            <li><a href="/lotes-terrenos" onClick={toggleMenu}>Lotes - Terrenos</a></li>
            <li><a href="/alquiler-temporario" onClick={toggleMenu}>Alquiler Temporario</a></li>
            <li><a href="/complejos" onClick={toggleMenu}>Complejos</a></li>
            <li><a href="/nosotros" onClick={toggleMenu}>Nosotros</a></li>
            <li><a href="/mapa" onClick={toggleMenu}>Mapa</a></li>
          </ul>
        </div>
      </div>
      
      {/* WhatsApp Chat Modal */}
      <WhatsAppChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </header>
  );
};

export default Header;