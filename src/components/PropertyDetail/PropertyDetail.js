'use client'

import React, { useState } from 'react'
import { 
  FaHome, 
  FaBed, 
  FaBath, 
  FaCar,
  FaRuler,
  FaUniversity,
  FaPaw,
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
  const whatsappNumber = '5492216006474'
  const propertyPublicUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property.id}`
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hola, vi esta propiedad en su web: ${propertyPublicUrl} ¿Me pasás información por favor?`)}`

  const normalizeText = (value) => {
    if (value === null || value === undefined) return ''
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
  }

  const parsePositiveNumber = (value) => {
    if (value === null || value === undefined || value === '') return null

    const parsed = Number(value)
    if (!Number.isFinite(parsed) || parsed <= 0) return null

    return parsed
  }

  const getFirstPositiveNumber = (...values) => {
    for (const value of values) {
      const parsed = parsePositiveNumber(value)
      if (parsed !== null) return parsed
    }
    return null
  }

  const parseBooleanValue = (value) => {
    if (typeof value === 'boolean') return value
    if (typeof value === 'number') return value > 0

    const text = normalizeText(value)
    if (!text) return false

    const truthyValues = new Set(['true', '1', 'si', 'yes', 'y', 'apto', 'acepta', 'eligible'])
    return truthyValues.has(text)
  }

  const getBooleanFromKeys = (source, keys) => {
    for (const key of keys) {
      if (source?.[key] !== undefined && source?.[key] !== null) {
        return parseBooleanValue(source[key])
      }
    }
    return false
  }

  const hasKeywordInCollections = (collections, keywords) => {
    const normalizedKeywords = keywords.map(normalizeText)

    return collections
      .filter(Array.isArray)
      .some((items) =>
        items.some((item) => {
          const itemText = normalizeText(item?.name || item?.label || item?.value || item)
          return normalizedKeywords.some((keyword) => itemText.includes(keyword))
        })
      )
  }

  const formatSurface = (value) =>
    new Intl.NumberFormat('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)

  const surface = getFirstPositiveNumber(
    property.surface,
    property.total_surface,
    property.total_surface_m2,
    property.roofed_surface,
    property.roofed_surface_m2
  )

  const bedrooms = getFirstPositiveNumber(property.suite_amount, property.bedrooms)
  const bathrooms = getFirstPositiveNumber(property.bathroom_amount, property.bathrooms)
  const parking = getFirstPositiveNumber(property.parking_lot_amount, property.garage_amount, property.garages)
  const rooms = getFirstPositiveNumber(property.room_amount, property.rooms)

  const isCreditEligible =
    getBooleanFromKeys(property, ['apto_credito', 'apto_credit', 'aptoCredito', 'credit_approved', 'is_credit', 'credit_eligible']) ||
    hasKeywordInCollections([property.tags, property.custom_tags, property.features, property.amenities], ['apto credito', 'apto credito hipotecario', 'credit eligible'])

  const acceptsPets =
    getBooleanFromKeys(property, ['acepta_mascotas', 'aceptaMascotas', 'pets_allowed', 'accept_pets']) ||
    hasKeywordInCollections([property.tags, property.custom_tags, property.features, property.amenities], ['acepta mascotas', 'mascotas', 'pets allowed', 'pet friendly'])

  const mainFeatures = [
    surface && {
      key: 'surface',
      icon: FaRuler,
      value: `${formatSurface(surface)}m²`,
      label: 'Superficie total'
    },
    bedrooms && {
      key: 'bedrooms',
      icon: FaBed,
      value: bedrooms,
      label: 'Dormitorios'
    },
    bathrooms && {
      key: 'bathrooms',
      icon: FaBath,
      value: bathrooms,
      label: 'Baños'
    },
    parking && {
      key: 'parking',
      icon: FaCar,
      value: parking,
      label: 'Cocheras'
    },
    rooms && {
      key: 'rooms',
      icon: FaHome,
      value: rooms,
      label: 'Ambientes'
    },
    isCreditEligible && {
      key: 'credit',
      icon: FaUniversity,
      value: 'Sí',
      label: 'Apto crédito'
    },
    acceptsPets && {
      key: 'pets',
      icon: FaPaw,
      value: 'Sí',
      label: 'Acepta mascotas'
    }
  ].filter(Boolean)

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
                  {photos.slice(0, 5).map((photo, index) => (
                    <img
                      key={index}
                      src={photo.thumb || photo.image}
                      alt={`Imagen ${index + 1}`}
                      className={currentImageIndex === index ? 'active' : ''}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                  {photos.length > 5 && (
                    <div className="more-photos" onClick={() => setShowLightbox(true)}>
                      +{photos.length - 5} fotos
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

              <div className="property-title-layout">
                <p className="location">
                  <FaMapMarkerAlt />
                  {property.location?.name || property.address?.city || 'Ubicación no disponible'}
                  {property.address?.state && `, ${property.address.state}`}
                </p>

                <div className="price-block">
                  <div className="price">
                    {formatPrice(price)}
                    {price.period && <span className="period">{price.period}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Características principales */}
            {mainFeatures.length > 0 && (
              <div className="property-features">
                <h2>Características principales</h2>
                <div className="features-grid">
                  {mainFeatures.map((feature) => {
                    const Icon = feature.icon

                    return (
                      <div className="feature-item" key={feature.key}>
                        <Icon className="feature-icon" />
                        <div>
                          <span className="feature-value">{feature.value}</span>
                          <span className="feature-label">{feature.label}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

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
                  href={whatsappHref}
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
