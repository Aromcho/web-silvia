'use client';
import { useState } from 'react';
import Image from 'next/image';
import './Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="header">
      <div className="container">
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
                <a href="/about" className="nav-link">Nosotros</a>
              </li>
              <li className="nav-item">
                <a href="/#propiedades" className="nav-link">Propiedades</a>
              </li>
              <li className="nav-item">
                <a href="/#servicios" className="nav-link">Servicios</a>
              </li>
              <li className="nav-item">
                <a href="/#contacto" className="nav-link">Contacto</a>
              </li>
            </ul>
          </nav>

          {/* CTA Button */}
          <div className="header-cta">
            <a href="#contacto" className="btn btn-primary">
              Consultar Ahora
            </a>
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
            <li><a href="/about" onClick={toggleMenu}>Nosotros</a></li>
            <li><a href="/#propiedades" onClick={toggleMenu}>Propiedades</a></li>
            <li><a href="/#servicios" onClick={toggleMenu}>Servicios</a></li>
            <li><a href="/#contacto" onClick={toggleMenu}>Contacto</a></li>
          </ul>
          <div className="mobile-cta">
            <a href="/#contacto" className="btn btn-primary" onClick={toggleMenu}>
              Consultar Ahora
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;