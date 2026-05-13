import './Offices.css'

const offices = [
  {
    title: 'Central',
    location: '📍 Calle 34, Mar del Plata & Mar Azul',
    description: 'En el centro Mar Azul ¡Vení a conocerla!',
    image: '/assets/images/oficina-central.png',
    mapsUrl: 'https://maps.app.goo.gl/nRSsuL4ouVaqjUVd8',
    mapsEmbedUrl: 'https://www.google.com/maps?q=Calle+34,+Mar+del+Plata,+Mar+Azul&output=embed'
  },
  {
    title: 'Sucursal boutique',
    location: '📍 Av del Plata y Uritorco - Mar de las Pampas',
    description: 'Te esperamos para asesorarte de forma personalizada.',
    image: '/assets/images/oficina-sucursal.jpg',
    mapsUrl: 'https://www.google.com/maps/place/Inmobiliaria+Boutique+Silvia+Fernandez/@-37.3185607,-57.0311521,17.5z/data=!4m14!1m7!3m6!1s0x959b5dc0e2dea667:0x128af3960458a77c!2sNewen+Casa+de+Comidas!8m2!3d-37.3184808!4d-57.0310427!16s%2Fg%2F11bwbx739q!3m5!1s0x959b5db2816d3011:0xc75db104f8ca4400!8m2!3d-37.3187797!4d-57.0311899!16s%2Fg%2F11zj317vf9?hl=es-419&entry=ttu&g_ep=EgoyMDI2MDQyOS4wIKXMDSoASAFQAw%3D%3D',
    mapsEmbedUrl: 'https://www.google.com/maps?q=-37.3187797,-57.0311899&output=embed'
  }
]

export default function Offices() {
  return (
    <section className="offices-section home-offices-section" aria-labelledby="home-offices-title">
      <div className="container">
        <h2 id="home-offices-title">Nuestras <span className="underline">Oficinas</span></h2>

        <div className="offices-grid">
          {offices.map((office) => (
            <article key={office.title} className="office-card">
              <div className="office-image" style={{ backgroundImage: `url(${office.image})` }}></div>
              <div className="office-map-preview" aria-hidden="true">
                <iframe
                  src={office.mapsEmbedUrl}
                  title={`${office.title} - mapa`}
                  loading="lazy"
                ></iframe>
              </div>
              <div className="office-info">
                <h3>{office.title}</h3>
                <div className="office-location-row">
                  <p className="office-location">{office.location}</p>
                  <a className="office-map-btn" href={office.mapsUrl} target="_blank" rel="noopener noreferrer">
                    Cómo llegar
                  </a>
                </div>
                <p>{office.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}