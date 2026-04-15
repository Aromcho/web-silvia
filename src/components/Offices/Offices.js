import './Offices.css'

const offices = [
  {
    title: 'Central',
    location: '📍 Calle 34, Mar del Plata & Mar Azul',
    description: 'En el centro Mar Azul ¡Vení a conocerla!',
    image: '/assets/images/oficina-central.png',
    mapsUrl: 'https://maps.app.goo.gl/nRSsuL4ouVaqjUVd8'
  },
  {
    title: 'Sucursal',
    location: '📍 Av del Plata y Uritorco - Mar de las Pampas',
    description: 'Te esperamos para asesorarte de forma personalizada.',
    image: '/assets/images/oficina-sucursal.jpg',
    mapsUrl: 'https://maps.app.goo.gl/F7tXnRHV1xBVK3qq6'
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