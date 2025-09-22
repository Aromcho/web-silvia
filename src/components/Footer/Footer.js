'use client';
import Image from 'next/image';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="container">
          <div className="footer-grid">
            {/* Logo y descripción */}
            <div className="footer-section">
              <div className="footer-logo">
                <Image
                  src="/assets/images/logo.jpg"
                  alt="Silvia Fernández - Inmobiliaria"
                  width={200}
                  height={67}
                />
              </div>
              <p className="footer-description">
                Más de 15 años de experiencia en el mercado inmobiliario de Mar de las Pampas. 
                Te acompañamos en cada paso para encontrar la propiedad perfecta.
              </p>
              <div className="footer-social">
                <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="currentColor" strokeWidth="2"/>
                    <path d="m16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="currentColor" strokeWidth="2"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </a>
                <a href="https://wa.me/5491234567890" target="_blank" rel="noopener noreferrer" className="social-link">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div className="footer-section">
              <h3 className="footer-title">Enlaces Rápidos</h3>
              <ul className="footer-links">
                <li><a href="/">Inicio</a></li>
                <li><a href="/about">Nosotros</a></li>
                <li><a href="/#propiedades">Propiedades</a></li>
                <li><a href="/#servicios">Servicios</a></li>
                <li><a href="/#contacto">Contacto</a></li>
              </ul>
            </div>

            {/* Servicios */}
            <div className="footer-section">
              <h3 className="footer-title">Servicios</h3>
              <ul className="footer-links">
                <li><a href="/#propiedades">Venta de Propiedades</a></li>
                <li><a href="/#propiedades">Alquiler</a></li>
                <li><a href="/#propiedades">Tasaciones</a></li>
                <li><a href="/#servicios">Asesoramiento</a></li>
                <li><a href="/#servicios">Inversiones</a></li>
              </ul>
            </div>

            {/* Contacto */}
            <div className="footer-section">
              <h3 className="footer-title">Contacto</h3>
              <div className="contact-info">
                <div className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="currentColor" strokeWidth="2"/>
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>Mar de las Pampas, Buenos Aires</span>
                </div>
                <div className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                       <span>Ventas: +54 9 2255 62-6092</span>

                </div>
                <div className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                      <span>Alquileres: +54 9 2255 62-2841</span>
                </div>
                <div className="contact-item">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="2"/>
                    <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                  <span>braicesfernandez@gmail.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; {currentYear} Silvia Fernández Inmobiliaria. Todos los derechos reservados.</p>
            <div className="footer-bottom-links">
              <a href="#privacy">Política de Privacidad</a>
              <a href="#terms">Términos y Condiciones</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;