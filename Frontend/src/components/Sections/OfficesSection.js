'use client'

// «Nuestras Oficinas»: una sola sección para el home y Nosotros (misma tarjeta, mismas fotos).
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { FaMapMarkerAlt } from 'react-icons/fa'
import './OfficesSection.css'

const OFFICES = [
  {
    key: 'central',
    title: 'Central',
    location: 'Calle 34 y Mar del Plata - Mar Azul',
    description: 'En el centro de Mar Azul. ¡Vení a conocerla!',
    image: '/assets/images/oficinas/central-portada.webp',
    homeImage: '/assets/images/oficina-central.png',
    mapsUrl: 'https://maps.app.goo.gl/nRSsuL4ouVaqjUVd8',
    mapsEmbedUrl: 'https://www.google.com/maps?q=Calle+34,+Mar+del+Plata,+Mar+Azul&output=embed',
    photos: [
      { src: '/assets/images/oficinas/central-1.webp', alt: 'Frente de la oficina Central en Mar Azul' },
      { src: '/assets/images/oficinas/central-2.webp', alt: 'Vidriera de la oficina Central en Mar Azul' },
      { src: '/assets/images/oficinas/central-3.webp', alt: 'Lateral de la oficina Central en Mar Azul' },
    ],
  },
  {
    key: 'boutique',
    title: 'Sucursal boutique',
    location: 'Av del Plata y Uritorco - Mar de las Pampas',
    description: 'Te esperamos para asesorarte de forma personalizada.',
    image: '/assets/images/oficinas/boutique-portada.webp',
    mapsUrl: 'https://maps.app.goo.gl/F7tXnRHV1xBVK3qq6',
    mapsEmbedUrl: 'https://www.google.com/maps?q=-37.3187797,-57.0311899&output=embed',
    photos: [
      { src: '/assets/images/oficinas/boutique-1.webp', alt: 'Esquina e ingreso de la sucursal boutique en Mar de las Pampas' },
      { src: '/assets/images/oficinas/boutique-2.webp', alt: 'Vidriera de la sucursal boutique en Mar de las Pampas' },
      { src: '/assets/images/oficinas/boutique-3.webp', alt: 'Lateral de la sucursal boutique en Mar de las Pampas' },
    ],
  },
]

// gallery: en Nosotros se muestran las fotos de cada oficina; en el home va la tarjeta sola, con su foto de siempre
export default function OfficesSection({ gallery = false }) {
  const [openPhoto, setOpenPhoto] = useState(null)
  // El mapa de Google recién se carga la primera vez que se pasa el mouse por la tarjeta
  const [mapsLoaded, setMapsLoaded] = useState({})

  useEffect(() => {
    if (!openPhoto) return
    const closeOnEsc = (event) => { if (event.key === 'Escape') setOpenPhoto(null) }
    window.addEventListener('keydown', closeOnEsc)
    return () => window.removeEventListener('keydown', closeOnEsc)
  }, [openPhoto])

  const loadMap = (key) => setMapsLoaded((current) => (current[key] ? current : { ...current, [key]: true }))

  return (
    <section className="sf-section" aria-labelledby="offices-title">
      <div className="container">
        <header className="sf-head">
          <h2 className="sf-title" id="offices-title">Nuestras <span className="sf-accent">Oficinas</span></h2>
        </header>

        <div className="sf-offices-grid">
          {OFFICES.map((office) => (
            <article key={office.key} className="sf-card sf-office-card" onMouseEnter={() => loadMap(office.key)}>
              <div className="sf-office-media">
                <img
                  src={gallery ? office.image : (office.homeImage || office.image)}
                  alt={`Oficina ${office.title} de Silvia Fernández Propiedades`}
                  loading="lazy"
                />
                <div className="sf-office-map" aria-hidden="true">
                  {mapsLoaded[office.key] && (
                    <iframe src={office.mapsEmbedUrl} title={`Mapa de la oficina ${office.title}`} tabIndex={-1}></iframe>
                  )}
                </div>
              </div>
              <div className="sf-office-body">
                <h3>{office.title}</h3>
                <div className="sf-office-row">
                  <p className="sf-office-location"><FaMapMarkerAlt aria-hidden="true" /> {office.location}</p>
                  <a className="sf-office-btn" href={office.mapsUrl} target="_blank" rel="noopener noreferrer">
                    Cómo llegar
                  </a>
                </div>
                <p className="sf-office-text">{office.description}</p>
                {gallery && (
                  <div className="sf-office-gallery">
                    {office.photos.map((photo) => (
                      <button
                        key={photo.src}
                        type="button"
                        className="sf-office-thumb"
                        onClick={() => setOpenPhoto(photo)}
                        aria-label={`Ver foto: ${photo.alt}`}
                      >
                        <img src={photo.src} alt={photo.alt} loading="lazy" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>

      {openPhoto && createPortal(
        <div className="sf-lightbox" role="dialog" aria-modal="true" aria-label={openPhoto.alt} onClick={() => setOpenPhoto(null)}>
          <button type="button" className="sf-lightbox-close" aria-label="Cerrar">×</button>
          <img src={openPhoto.src} alt={openPhoto.alt} onClick={(event) => event.stopPropagation()} />
        </div>,
        document.body
      )}
    </section>
  )
}
