'use client';
import './page.css';

export default function NosotrosPage() {
  return (
    <div className="nosotros-page">
      <div className="page-hero">
        <div className="container">
          <h1>Sobre Nosotros</h1>
          <p>Conocé más sobre Silvia Fernández Propiedades</p>
        </div>
      </div>
      
      <div className="nosotros-content">
        <div className="container">
          <section className="about-section">
            <div className="about-grid">
              <div className="about-image">
                <img src="/assets/images/about-us.jpg" alt="Silvia Fernández" />
              </div>
              <div className="about-text">
                <h2>Silvia Fernandez Inmobiliaria, una <span className="underline">Historia</span> de éxito</h2>
                <p>
                  Silvia Fernandez Inmobiliaria es sinónimo de compromiso, excelencia y confianza en el mercado inmobiliario. 
                  Hemos logrado conectar a innumerables familias y empresas con la propiedad ideal, brindando un servicio 
                  transparente y personalizado.
                </p>
                <p>
                  Nuestra pasión por el sector nos impulsa a innovar constantemente, ofreciendo un asesoramiento integral 
                  basado en un profundo conocimiento del mercado. Cada operación es gestionada con profesionalismo y dedicación, 
                  asegurando que cada cliente reciba la atención que merece.
                </p>
                <p>
                  En Silvia Fernandez Inmobiliaria, no solo vendemos propiedades, creamos hogares, oportunidades y futuros. 
                  Nuestra reputación se construye sobre valores sólidos: integridad, compromiso y una atención cercana que 
                  marca la diferencia en cada transacción.
                </p>
                <p>
                  Si buscas un equipo confiable, apasionado y altamente capacitado para guiarte en tu próxima inversión 
                  inmobiliaria, Silvia Fernandez Inmobiliaria es tu mejor elección. Descubre la experiencia de trabajar 
                  con expertos que ponen tu bienestar en el centro de todo.
                </p>
              </div>
            </div>
          </section>

          <section className="values-section">
            <h2>Nuestros Valores</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">🎯</div>
                <h3>Profesionalismo</h3>
                <p>Trabajamos con los más altos estándares de calidad y ética profesional.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Confianza</h3>
                <p>Construimos relaciones duraderas basadas en la transparencia y honestidad.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">⭐</div>
                <h3>Excelencia</h3>
                <p>Buscamos la excelencia en cada operación y servicio que brindamos.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">💼</div>
                <h3>Experiencia</h3>
                <p>Años de trayectoria nos respaldan en el mercado inmobiliario.</p>
              </div>
            </div>
          </section>

          <section className="testimonials-section">
            <h2>Lo que dicen nuestros clientes</h2>
            <div className="testimonials-grid">
              <div className="testimonial-card">
                <div className="testimonial-rating">⭐⭐⭐⭐</div>
                <p className="testimonial-text">
                  "Agradecidos infinitamente a Silvia, por su amabilidad, cordialidad, siempre bien dispuesta a responder 
                  todas las inquietudes y haber podido cumplir nuestro sueño en Mar Azul, con el acompañamiento de Silvia 
                  y su equipo de trabajo, lo pudimos lograr, nos dieron mucha tranquilidad y confianza. Super recomendable."
                </p>
                <div className="testimonial-author">
                  <strong>Duby Alfonso</strong>
                  <img src="/images/google_logo.png" alt="Google" className="testimonial-logo" />
                </div>
              </div>
              <div className="testimonial-card">
                <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
                <p className="testimonial-text">
                  "Excelente equipo de profesionales, con Silvia a la cabeza, nos sentimos acompañados y lograron los 
                  objetivos buscados. Capaces, comprometidos y buena gente. Super recomendables a la hora de hacer 
                  cualquier tipo de transacción sea administración, alquiler o venta."
                </p>
                <div className="testimonial-author">
                  <strong>Valeria Deferrari</strong>
                  <img src="/images/google_logo.png" alt="Google" className="testimonial-logo" />
                </div>
              </div>
            </div>
          </section>

          <section className="offices-section">
            <h2>Nuestras <span className="underline">Oficinas</span></h2>
            <div className="offices-grid">
              <div className="office-card">
                <div className="office-image" style={{backgroundImage: 'url(/assets/images/oficina-central.png)'}}></div>
                <div className="office-info">
                  <h3>Central</h3>
                  <div className="office-location-row">
                    <p className="office-location">📍 Calle 34, Mar del Plata & Mar Azul</p>
                    <a
                      className="office-map-btn"
                      href="https://maps.app.goo.gl/nRSsuL4ouVaqjUVd8"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cómo llegar
                    </a>
                  </div>
                  <p>En el centro Mar Azul ¡Vení a conocerla!</p>
                </div>
              </div>
              <div className="office-card">
                <div className="office-image" style={{backgroundImage: 'url(/assets/images/oficina-sucursal.jpg)'}}></div>
                <div className="office-info">
                  <h3>Sucursal</h3>
                  <div className="office-location-row">
                    <p className="office-location">📍 Av del Plata y Uritorco - Mar de las Pampas</p>
                    <a
                      className="office-map-btn"
                      href="https://maps.app.goo.gl/F7tXnRHV1xBVK3qq6"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Cómo llegar
                    </a>
                  </div>
                  <p>Te esperamos para asesorarte de forma personalizada.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="contact-section">
            <h2>¿Tenés alguna consulta?</h2>
            <p>Estamos para ayudarte en lo que necesites</p>
            <div className="contact-info">
              <div className="contact-item">
                <span className="icon">📞</span>
                <div>
                  <strong>Teléfono</strong>
                  <p>+54 2255 626092</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">📧</span>
                <div>
                  <strong>Email</strong>
                  <p>info@silviafernandez.com.ar</p>
                </div>
              </div>
              <div className="contact-item">
                <span className="icon">📍</span>
                <div>
                  <strong>Dirección</strong>
                  <p>Villa Gesell, Buenos Aires</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
