'use client'

import React, { useState } from 'react'
import { 
  FaHome, 
  FaBed, 
  FaBath, 
  FaCar,
  FaRuler,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand,
  FaShare
} from 'react-icons/fa'
import './PropertyDetail.css'

export default function PropertyDetail({ property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)

  const normalizePropertyTypeLabel = (text) => {
    if (!text || typeof text !== 'string') return text
    return text
      .replace(/\bhoteles\b/gi, 'Complejos')
      .replace(/\bhotel\b/gi, 'Complejo')
  }

  if (!property) {
    return (
      <div className="property-detail-loading">
        <div className="loading-spinner"></div>
        <p>Cargando propiedad...</p>
      </div>
    )
  }

  const photos = property.photos || []
  const operations = property.operations || []
  const mainOperation = operations[0] || {}
  const price = mainOperation.prices?.[0] || {}
  const propertyTypeName = normalizePropertyTypeLabel(property.type?.name) || 'Propiedad'
  const propertyAddress = property.address?.street_name || property.real_address || property.address || 'Dirección no disponible'

  // Navegación de imágenes
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % photos.length)
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  // Formatear precio
  const formatPrice = (priceObj) => {
    if (!priceObj.price) return 'Consultar precio'
    
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: priceObj.currency || 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(priceObj.price)
    } catch {
      return `${priceObj.currency || 'ARS'} ${priceObj.price.toLocaleString('es-AR')}`
    }
  }

  // Compartir
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: property.publication_title,
        text: `Mirá esta propiedad: ${property.publication_title}`,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('¡Enlace copiado al portapapeles!')
    }
  }

  return (
    <div className="property-detail-page">
      {/* Header con breadcrumb */}
      <div className="property-header">
        <div className="container">
          <div className="breadcrumb">
            <a href="/">Inicio</a>
            <span>/</span>
            <a href="/propiedades">Propiedades</a>
            <span>/</span>
            <span>{propertyTypeName}</span>
          </div>
        </div>
      </div>

      <div className="container property-detail-container">
        {/* Galería de imágenes */}
        <div className="property-gallery">
          {photos.length > 0 ? (
            <>
              <div className="main-image">
                <img 
                  src={photos[currentImageIndex]?.image || photos[currentImageIndex]?.thumb} 
                  alt={property.publication_title}
                  onClick={() => setShowLightbox(true)}
                />
                <button className="expand-btn" onClick={() => setShowLightbox(true)}>
                  <FaExpand />
                </button>
                {photos.length > 1 && (
                  <>
                    <button className="nav-btn prev-btn" onClick={prevImage}>
                      <FaChevronLeft />
                    </button>
                    <button className="nav-btn next-btn" onClick={nextImage}>
                      <FaChevronRight />
                    </button>
                  </>
                )}
                <div className="image-counter">
                  {currentImageIndex + 1} / {photos.length}
                </div>
              </div>
              
              {photos.length > 1 && (
                <div className="thumbnails">
                  {photos.slice(0, 6).map((photo, index) => (
                    <img
                      key={index}
                      src={photo.thumb || photo.image}
                      alt={`Imagen ${index + 1}`}
                      className={currentImageIndex === index ? 'active' : ''}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                  {photos.length > 6 && (
                    <div className="more-photos" onClick={() => setShowLightbox(true)}>
                      +{photos.length - 6} fotos
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="no-image">
              <FaHome />
              <p>Sin imágenes disponibles</p>
            </div>
          )}
        </div>

        {/* Contenido principal */}
        <div className="property-content">
          {/* Columna izquierda - Info principal */}
          <div className="main-column">
            {/* Título y precio */}
            <div className="property-title-section">
              <div className="property-badges">
                <span className="badge-operation">
                  {mainOperation.operation_type || 'Consultar'}
                </span>
                {property.is_starred_on_web && (
                  <span className="badge-featured">Destacada</span>
                )}
              </div>
              
              <h1 className="property-title">{property.publication_title || 'Propiedad'}</h1>

              <p className="property-main-address">
                <FaMapMarkerAlt />
                <span>{propertyAddress}</span>
              </p>
              
              <div className="property-location-price">
                <p className="location">
                  <FaMapMarkerAlt />
                  {property.location?.name || property.address?.city || 'Ubicación no disponible'}
                  {property.address?.state && `, ${property.address.state}`}
                </p>
                <div className="price">
                  {formatPrice(price)}
                  {price.period && <span className="period">{price.period}</span>}
                </div>
              </div>
            </div>

            {/* Características principales */}
            <div className="property-features">
              <h2>Características principales</h2>
              <div className="features-grid">
                {property.surface && (
                  <div className="feature-item">
                    <FaRuler className="feature-icon" />
                    <div>
                      <span className="feature-value">{property.surface}m²</span>
                      <span className="feature-label">Superficie total</span>
                    </div>
                  </div>
                )}
                
                {property.suite_amount > 0 && (
                  <div className="feature-item">
                    <FaBed className="feature-icon" />
                    <div>
                      <span className="feature-value">{property.suite_amount}</span>
                      <span className="feature-label">Dormitorios</span>
                    </div>
                  </div>
                )}
                
                {property.bathroom_amount > 0 && (
                  <div className="feature-item">
                    <FaBath className="feature-icon" />
                    <div>
                      <span className="feature-value">{property.bathroom_amount}</span>
                      <span className="feature-label">Baños</span>
                    </div>
                  </div>
                )}
                
                {property.parking_lot_amount > 0 && (
                  <div className="feature-item">
                    <FaCar className="feature-icon" />
                    <div>
                      <span className="feature-value">{property.parking_lot_amount}</span>
                      <span className="feature-label">Cocheras</span>
                    </div>
                  </div>
                )}
                
                {property.room_amount > 0 && (
                  <div className="feature-item">
                    <FaHome className="feature-icon" />
                    <div>
                      <span className="feature-value">{property.room_amount}</span>
                      <span className="feature-label">Ambientes</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Descripción */}
            {property.description && (
              <div className="property-description">
                <h2>Descripción</h2>
                <div 
                  className="description-text"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
              </div>
            )}

            {/* Ubicación */}
            <div className="property-location-section">
              <h2>Ubicación</h2>
              <div className="location-info">
                <FaMapMarkerAlt className="location-icon-big" />
                <div>
                  <p className="location-address">{property.address?.street_name || 'Dirección no disponible'}</p>
                  <p className="location-details">
                    {property.location?.full_location || property.location?.name || 'Ubicación no disponible'}
                  </p>
                </div>
              </div>
              
              {(property.geo_lat && property.geo_long) && (
                <div className="map-container">
                  <iframe
                    src={`https://www.google.com/maps?q=${property.geo_lat},${property.geo_long}&output=embed`}
                    width="100%"
                    height="350"
                    style={{ border: 0, borderRadius: '12px' }}
                    loading="lazy"
                  ></iframe>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Contacto */}
          <div className="sidebar-column">
            <div className="contact-card sticky">
              <h3>¿Te interesa esta propiedad?</h3>
              <p className="contact-subtitle">Contactanos para más información</p>
              
              <div className="contact-buttons">
                <a 
                  href={`https://wa.me/5491165048694?text=Hola! Me interesa la propiedad: ${property.publication_title}`}
                  className="contact-btn whatsapp-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <FaWhatsapp />
                  <span>WhatsApp</span>
                </a>
                
                <button 
                  className="contact-btn email-btn"
                  onClick={() => setShowContactForm(true)}
                >
                  <FaEnvelope />
                  <span>Email</span>
                </button>
                
                <a 
                  href="tel:+5491165048694"
                  className="contact-btn phone-btn"
                >
                  <FaPhone />
                  <span>Llamar</span>
                </a>
              </div>
              
              <button className="share-btn" onClick={handleShare}>
                <FaShare />
                Compartir propiedad
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox para galería completa */}
      {showLightbox && (
        <div className="lightbox" onClick={() => setShowLightbox(false)}>
          <button className="lightbox-close" onClick={() => setShowLightbox(false)}>
            <FaTimes />
          </button>
          <button className="lightbox-nav prev" onClick={(e) => { e.stopPropagation(); prevImage(); }}>
            <FaChevronLeft />
          </button>
          <button className="lightbox-nav next" onClick={(e) => { e.stopPropagation(); nextImage(); }}>
            <FaChevronRight />
          </button>
          <img 
            src={photos[currentImageIndex]?.image} 
            alt={property.publication_title}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightbox-counter">
            {currentImageIndex + 1} / {photos.length}
          </div>
        </div>
      )}

      {/* Formulario de contacto modal */}
      {showContactForm && (
        <div className="modal-overlay" onClick={() => setShowContactForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowContactForm(false)}>
              <FaTimes />
            </button>
            <h3>Contactar por esta propiedad</h3>
            <form className="contact-form">
              <input type="text" placeholder="Nombre" required />
              <input type="email" placeholder="Email" required />
              <input type="tel" placeholder="Teléfono" required />
              <textarea 
                placeholder="Mensaje" 
                rows="4"
                defaultValue={`Hola! Me interesa la propiedad: ${property.publication_title}`}
              ></textarea>
              <button type="submit" className="submit-btn">
                Enviar consulta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
