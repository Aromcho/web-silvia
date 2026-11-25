import { FaBullseye, FaHandshake, FaStar, FaBriefcase } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import Offices from '../../components/Sections/OfficesSection';
import Contact from '../../components/Sections/ContactSection';
import '../lotes-terrenos/page.css';
import './nosotros.css';

const VALORES = [
  { icon: FaBullseye, title: 'Profesionalismo', text: 'Trabajamos con los más altos estándares de calidad y ética profesional.' },
  { icon: FaHandshake, title: 'Confianza', text: 'Construimos relaciones duraderas basadas en la transparencia y honestidad.' },
  { icon: FaStar, title: 'Excelencia', text: 'Buscamos la excelencia en cada operación y servicio que brindamos.' },
  { icon: FaBriefcase, title: 'Experiencia', text: 'Años de trayectoria nos respaldan en el mercado inmobiliario.' },
];

const RESENAS = [
  {
    stars: 4,
    author: 'Duby Alfonso',
    text: 'Agradecidos infinitamente a Silvia, por su amabilidad, cordialidad, siempre bien dispuesta a responder todas las inquietudes y haber podido cumplir nuestro sueño en Mar Azul, con el acompañamiento de Silvia y su equipo de trabajo, lo pudimos lograr, nos dieron mucha tranquilidad y confianza. Super recomendable.',
  },
  {
    stars: 5,
    author: 'Valeria Deferrari',
    text: 'Excelente equipo de profesionales, con Silvia a la cabeza, nos sentimos acompañados y lograron los objetivos buscados. Capaces, comprometidos y buena gente. Super recomendables a la hora de hacer cualquier tipo de transacción sea administración, alquiler o venta.',
  },
];

const EQUIPO = [
  { nombre: 'Valentin', foto: '/assets/images/equipo/valentin.png' },
  { nombre: 'Fabiana', foto: '/assets/images/equipo/fabiana.png' },
  { nombre: 'Cecilia', foto: '/assets/images/equipo/cecilia.png' },
  { nombre: 'Paul', foto: '/assets/images/equipo/paul.png' },
  { nombre: 'Pablo', foto: '/assets/images/equipo/pablo.png' },
  { nombre: 'Arom', foto: '/assets/images/equipo/arom.png' },
];

export default function NosotrosPage() {
  return (
    <div className="nosotros-page">
      <div className="page-hero">
        <div className="container">
          <h1>Sobre Nosotros</h1>
          <p>Conocé más sobre Silvia Fernández Propiedades</p>
        </div>
      </div>
      
      <section className="sf-section" aria-labelledby="nos-team-title">
        <div className="container">
          <header className="sf-head">
            <h2 className="sf-title" id="nos-team-title">Nuestro <span className="sf-accent">Equipo</span></h2>
            <p className="sf-subtitle">Las personas que te acompañan en cada paso</p>
          </header>
          <div className="nos-team">
            {EQUIPO.map((m) => (
              <div className="nos-member" key={m.nombre}>
                <div className="nos-member-photo">
                  <img src={m.foto} alt={m.nombre} />
                </div>
                <h3>{m.nombre}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sf-section sf-section--tint" aria-labelledby="nos-about-title">
        <div className="container nos-about">
          <div className="nos-about-image">
            <img src="/assets/images/image.png" alt="Silvia Fernández en la oficina" />
          </div>
          <div className="nos-about-text">
            <h2 className="sf-title" id="nos-about-title">Silvia Fernández Inmobiliaria, una historia de éxito</h2>
            <p>
              Silvia Fernández Inmobiliaria es sinónimo de compromiso, excelencia y confianza en el mercado inmobiliario.
              Hemos logrado conectar a innumerables familias y empresas con la propiedad ideal, brindando un servicio
              transparente y personalizado.
            </p>
            <p>
              Nuestra pasión por el sector nos impulsa a innovar constantemente, ofreciendo un asesoramiento integral
              basado en un profundo conocimiento del mercado. Cada operación es gestionada con profesionalismo y dedicación,
              asegurando que cada cliente reciba la atención que merece.
            </p>
            <p>
              En Silvia Fernández Inmobiliaria, no solo vendemos propiedades, creamos hogares, oportunidades y futuros.
              Nuestra reputación se construye sobre valores sólidos: integridad, compromiso y una atención cercana que
              marca la diferencia en cada transacción.
            </p>
            <p>
              Si buscás un equipo confiable, apasionado y altamente capacitado para guiarte en tu próxima inversión
              inmobiliaria, Silvia Fernández Inmobiliaria es tu mejor elección. Descubrí la experiencia de trabajar
              con expertos que ponen tu bienestar en el centro de todo.
            </p>
          </div>
        </div>
      </section>

      <section className="sf-section" aria-labelledby="nos-values-title">
        <div className="container">
          <header className="sf-head">
            <h2 className="sf-title" id="nos-values-title">Nuestros <span className="sf-accent">Valores</span></h2>
          </header>
          <div className="nos-values">
            {VALORES.map((valor) => (
              <div className="sf-card nos-value" key={valor.title}>
                <div className="nos-value-icon"><valor.icon aria-hidden="true" /></div>
                <h3>{valor.title}</h3>
                <p>{valor.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="sf-section sf-section--tint" aria-labelledby="nos-reviews-title">
        <div className="container">
          <header className="sf-head">
            <h2 className="sf-title" id="nos-reviews-title">Lo que dicen nuestros <span className="sf-accent">clientes</span></h2>
          </header>
          <div className="nos-reviews">
            {RESENAS.map((resena) => (
              <figure className="sf-card nos-review" key={resena.author}>
                <div className="nos-review-stars" role="img" aria-label={`${resena.stars} de 5 estrellas`}>
                  {Array.from({ length: resena.stars }, (_, i) => <FaStar key={i} aria-hidden="true" />)}
                </div>
                <blockquote className="nos-review-text">“{resena.text}”</blockquote>
                <figcaption className="nos-review-author">
                  <strong>{resena.author}</strong>
                  <span className="nos-review-source"><FcGoogle aria-hidden="true" /> Google</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <Offices />
      <Contact />
    </div>
  );
}
