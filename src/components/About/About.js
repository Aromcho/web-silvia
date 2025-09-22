import Image from 'next/image';
import './About.css';

const About = () => {
  return (
    <section id="nosotros" className="about section">
      <div className="container">
        <div className="about-content">
          {/* About Header */}
          <div className="about-header">
            <h2 className="section-title">
              Quién es <span className="text-primary">Silvia Fernández</span>
            </h2>
            <p className="section-subtitle">
              Más de 8 años transformando sueños en realidad en el mercado inmobiliario
            </p>
          </div>

          <div className="about-grid">
            {/* About Text */}
            <div className="about-text">
              <div className="about-description">
                <p>
                  Silvia Fernandez Inmobiliaria es sinónimo de compromiso, excelencia y confianza en el mercado inmobiliario. Hemos logrado conectar a innumerables familias y empresas con la propiedad ideal, brindando un servicio transparente y personalizado.
                </p>
                <p>
                  Nuestra pasión por el sector nos impulsa a innovar constantemente, ofreciendo un asesoramiento integral basado en un profundo conocimiento del mercado. Cada operación es gestionada con profesionalismo y dedicación, asegurando que cada cliente reciba la atención que merece.
                </p>
                <p>
                  En Silvia Fernandez Inmobiliaria, no solo vendemos propiedades, creamos hogares, oportunidades y futuros. Nuestra reputación se construye sobre valores sólidos: integridad, compromiso y una atención cercana que marca la diferencia en cada transacción.
                </p>
                <p>
                  Si buscas un equipo confiable, apasionado y altamente capacitado para guiarte en tu próxima inversión inmobiliaria, Silvia Fernandez Inmobiliaria es tu mejor elección. Descubre la experiencia de trabajar con expertos que ponen tu bienestar en el centro de todo.
                </p>
              </div>

              {/* Experience Stats */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">15+</div>
                  <div className="stat-label">Años de Experiencia</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Familias Satisfechas</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">95%</div>
                  <div className="stat-label">Clientes Recomiendan</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Atención Personalizada</div>
                </div>
              </div>

            </div>

            {/* About Image & Testimonial */}
            <div className="about-visual">
              <div className="about-image">
                <Image
                  src="/assets/images/silvia-fernandez.jpg"
                  alt="Silvia Fernández - Corredora Inmobiliaria"
                  width={400}
                  height={500}
                  className="profile-image"
                />
                <div className="image-overlay">
                  <div className="overlay-content">
                    <p className="testimonial">
                      "Mi compromiso es hacer que cada transacción sea 
                      transparente, eficiente y exitosa para mis clientes."
                    </p>
                    <cite>- Silvia Fernández</cite>
                  </div>
                </div>
              </div>

              {/* Office Info */}
              <div className="office-info">
                <h4>Nuestras Oficinas</h4>
                <div className="office-grid">
                  <div className="office-card">
                    <div className="office-image">
                      <Image
                        src="/assets/images/oficina-central.png"
                        alt="Oficina Central"
                        width={300}
                        height={200}
                      />
                    </div>
                    <div className="office-details">
                      <h5>Central</h5>
                      <p>Calle 34 y Mar del Plata - Mar Azul</p>
                      <p>Lun-Vie: 10:00-18:00</p>
                    </div>
                  </div>
                  <div className="office-card">
                    <div className="office-image">
                      <Image
                        src="/assets/images/oficina-sucursal.jpg"
                        alt="Sucursal Norte"
                        width={300}
                        height={200}
                      />
                    </div>
                    <div className="office-details">
                      <h5>Sucursal</h5>
                      <p>Av del Plata y Uritorco - Mar de las Pampas</p>
                      <p>Lun-Sab: 10:00-18:00</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Values Section */}
          <div className="values-section">
            <h3>Nuestros Valores</h3>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4>Confianza</h4>
                <p>Construimos relaciones sólidas basadas en la transparencia y honestidad en cada transacción.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M13 10V3L4 14H11V21L20 10H13Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4>Eficiencia</h4>
                <p>Optimizamos cada proceso para brindar resultados rápidos y efectivos a nuestros clientes.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M20.84 4.61A5.5 5.5 0 0 0 16 2C13.5 2 12 3.5 12 6C12 3.5 10.5 2 8 2A5.5 5.5 0 0 0 3.16 4.61C2.42 5.35 2 6.36 2 7.44C2 8.52 2.42 9.53 3.16 10.27L12 19L20.84 10.27C21.58 9.53 22 8.52 22 7.44C22 6.36 21.58 5.35 20.84 4.61Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4>Compromiso</h4>
                <p>Nos dedicamos completamente a hacer realidad los sueños inmobiliarios de cada cliente.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path 
                      d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88M13 7C13 9.20914 11.2091 11 9 11C6.79086 11 5 9.20914 5 7C5 4.79086 6.79086 3 9 3C11.2091 3 13 4.79086 13 7Z" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <h4>Personalización</h4>
                <p>Cada cliente es único, por eso adaptamos nuestros servicios a sus necesidades específicas.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;