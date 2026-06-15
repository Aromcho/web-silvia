'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  FaHome,
  FaBed,
  FaBath,
  FaCar,
  FaRuler,
  FaArrowsAltH,
  FaArrowsAltV,
  FaUniversity,
  FaDollarSign,
  FaPaw,
  FaMapMarkerAlt,
  FaWhatsapp,
  FaEnvelope,
  FaPhone,
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
  FaExpand,
  FaShare,
  FaPrint,
  FaCopy,
  FaPlay
} from 'react-icons/fa'
import { FaWandMagicSparkles } from 'react-icons/fa6'
import Print from '../Print/Print'
import './PropertyDetail.css'

export default function PropertyDetail({ property }) {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showAIModal, setShowAIModal] = useState(false)
  const [aiLightboxIndex, setAiLightboxIndex] = useState(null)
  const [showContactForm, setShowContactForm] = useState(false)
  const [sidebarMode, setSidebarMode] = useState('relative') // 'relative' | 'fixed' | 'bottom'
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactStatus, setContactStatus] = useState('idle')
  const [idCopied, setIdCopied] = useState(false)
  const sidebarRef = useRef(null)
  const sidebarTopRef = useRef(0)

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
  const propertyPublicUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property.id}`
  const whatsappNumber = '5492216006474'
  const whatsappMessage = `Hola, consulto por esta propiedad: ${property.publication_title || propertyTypeName}\n\n${propertyPublicUrl}`
  const whatsappHref = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`

  const normalizeText = (value) => {
    if (value === null || value === undefined) return ''
    return String(value)
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .trim()
  }

  // Fotos "PF" (Proyección a Futuro): remodelaciones con IA, no van en la galería normal
  const isAIRemodelPhoto = (photo) => normalizeText(photo?.description) === 'pf'
  const galleryPhotos = photos.filter((photo) => !isAIRemodelPhoto(photo))
  const aiRemodelPhotos = photos.filter(isAIRemodelPhoto)

  // Video de YouTube de la propiedad (si tiene)
  const getYoutubeVideoId = (video) => {
    if (!video) return null
    if (video.video_id) return video.video_id

    const url = video.url || video.player_url || ''
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{6,})/)
    return match ? match[1] : null
  }

  const youtubeVideoId = getYoutubeVideoId(property.videos?.[0])
  const hasVideo = Boolean(youtubeVideoId)

  // Secuencia de medios del carrusel principal: el video (si hay) ocupa la 2da posición
  const mediaItems = galleryPhotos.map((photo, index) => ({ type: 'photo', photo, index }))
  if (hasVideo) {
    mediaItems.splice(1, 0, { type: 'video' })
  }
  const currentMediaItem = mediaItems[currentMediaIndex] || mediaItems[0]
  const thumbnailItems = mediaItems.slice(0, 5)
  const remainingMediaCount = mediaItems.length - thumbnailItems.length

  const operationType = normalizeText(mainOperation.operation_type)
  const isRentalOperation =
    operationType.includes('alquiler') || operationType === 'rent' || mainOperation.operation_id === 2

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

    const truthyValues = new Set(['true', '1', 'si', 'yes', 'y', 'apto', 'acepta', 'eligible', 'apto credito', 'apto credito hipotecario'])
    return truthyValues.has(text) || text.startsWith('apto')
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)

  const surface = getFirstPositiveNumber(
    property.surface,
    property.total_surface,
    property.total_surface_m2
  )

  const roofedSurface = getFirstPositiveNumber(
    property.roofed_surface,
    property.roofed_surface_m2
  )

  const bedrooms = getFirstPositiveNumber(property.suite_amount, property.bedrooms)
  const bathrooms = getFirstPositiveNumber(property.bathroom_amount, property.bathrooms)
  const parking = getFirstPositiveNumber(property.parking_lot_amount, property.garage_amount, property.garages)
  const rooms = getFirstPositiveNumber(property.room_amount, property.rooms)
  const frontMeasure = getFirstPositiveNumber(property.front_measure, property.front, property.lot_frontage)
  const depthMeasure = getFirstPositiveNumber(property.depth_measure, property.depth, property.lot_depth)

  const isCreditEligible =
    getBooleanFromKeys(property, ['apto_credito', 'apto_credit', 'aptoCredito', 'credit_approved', 'is_credit', 'credit_eligible']) ||
    hasKeywordInCollections([property.tags, property.custom_tags, property.features, property.amenities], ['apto credito', 'apto credito hipotecario', 'credit eligible'])

  const isFinancingEligible =
    getBooleanFromKeys(property, ['apto_financiacion', 'financiacion', 'financing', 'apto_financing', 'financing_eligible']) ||
    hasKeywordInCollections([property.tags, property.custom_tags, property.features, property.amenities], ['apto financiacion', 'financiacion', 'financing']) ||
    property.extra_attributes?.some(attr => attr.name?.toLowerCase() === 'financiacion' && attr.value === 'true')

  const acceptsPets =
    getBooleanFromKeys(property, ['acepta_mascotas', 'aceptaMascotas', 'pets_allowed', 'accept_pets']) ||
    hasKeywordInCollections([property.tags, property.custom_tags, property.features, property.amenities], ['acepta mascotas', 'mascotas', 'pets allowed', 'pet friendly'])

  const mainFeatures = [
    surface && {
      key: 'surface',
      icon: FaRuler,
      value: `${formatSurface(surface)}m²`,
      label: 'Sup. total'
    },
    roofedSurface && {
      key: 'roofed_surface',
      icon: FaRuler,
      value: `${formatSurface(roofedSurface)}m²`,
      label: 'Sup. cub'
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
    frontMeasure && {
      key: 'front_measure',
      icon: FaArrowsAltH,
      value: `${formatSurface(frontMeasure)}m`,
      label: 'Frente'
    },
    depthMeasure && {
      key: 'depth_measure',
      icon: FaArrowsAltV,
      value: `${formatSurface(depthMeasure)}m`,
      label: 'Fondo'
    },
    isCreditEligible && {
      key: 'credit',
      icon: FaUniversity,
      value: 'Sí',
      label: 'Crédito',
    },
    isFinancingEligible && {
      key: 'financing',
      icon: FaDollarSign,
      value: 'Sí',
      label: 'Financiación',
    },
    acceptsPets && {
      key: 'pets',
      icon: FaPaw,
      value: 'Sí',
      label: 'Mascotas',
    }
  ].filter(Boolean)

  // Navegación del carrusel principal (fotos + video)
  const nextMedia = () => {
    setCurrentMediaIndex((prev) => (prev + 1) % mediaItems.length)
  }

  const prevMedia = () => {
    setCurrentMediaIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)
  }

  // Navegación de imágenes en el lightbox de pantalla completa
  const nextLightboxImage = () => {
    setLightboxIndex((prev) => (prev + 1) % galleryPhotos.length)
  }

  const prevLightboxImage = () => {
    setLightboxIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length)
  }

  // Navegación de imágenes en el modal "Remodelar con IA"
  const nextAIImage = () => {
    setAiLightboxIndex((prev) => (prev + 1) % aiRemodelPhotos.length)
  }

  const prevAIImage = () => {
    setAiLightboxIndex((prev) => (prev - 1 + aiRemodelPhotos.length) % aiRemodelPhotos.length)
  }

  // Formatear precio
  const formatPrice = (priceObj) => {
    if (isRentalOperation) return 'Consultar precio'

    if (!priceObj.price || priceObj.price === 1) return 'Consultar precio'
    
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: priceObj.currency || 'ARS',
        currencyDisplay: 'code',
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

  useEffect(() => {
    const handleResize = () => {
      sidebarTopRef.current = 0
      updateSidebarState()
    }

    const updateSidebarState = () => {
      if (!sidebarRef.current || window.innerWidth <= 1024) {
        setSidebarMode('relative')
        return
      }

      if (!sidebarTopRef.current) {
        sidebarTopRef.current = sidebarRef.current.getBoundingClientRect().top + window.scrollY
      }

      const FIXED_TOP = 104 // 6.5rem en px
      const activationPoint = sidebarTopRef.current - FIXED_TOP
      const sidebarH = sidebarRef.current.offsetHeight

      const footer = document.querySelector('footer')
      const footerTop = footer
        ? footer.getBoundingClientRect().top + window.scrollY
        : document.body.scrollHeight

      // Punto donde el fondo del sidebar fijo tocaría el footer
      const bottomThreshold = footerTop - sidebarH - FIXED_TOP - 24

      if (window.scrollY < activationPoint) {
        setSidebarMode('relative')
      } else if (window.scrollY >= bottomThreshold) {
        setSidebarMode('bottom')
      } else {
        setSidebarMode('fixed')
      }
    }

    updateSidebarState()
    window.addEventListener('scroll', updateSidebarState, { passive: true })
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('scroll', updateSidebarState)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleContactChange = (e) => {
    const { name, value } = e.target
    setContactForm((prev) => ({ ...prev, [name]: value }))
  }

  const handlePrint = () => window.print()

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    setContactStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...contactForm,
          propertyTitle: property.publication_title || propertyTypeName,
          propertyUrl: propertyPublicUrl,
        }),
      })
      if (!res.ok) throw new Error()
      setContactStatus('success')
      setContactForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setContactStatus('error')
    }
  }

  // Contenido reutilizable del título (dirección + precio)
  const titleBlock = (
    <div className="direction-price">
      <p className="property-main-address">
        <FaMapMarkerAlt className="address-pin-icon" />
        <span>
          {property.location?.name || property.address?.city || "Ubicación no disponible"}
          {property.address?.state && `, ${property.address.state}`},{" "}
          {propertyAddress}
        </span>
      </p>
      <div className="property-price-row">
        <div className={`price ${isRentalOperation ? "price-consult" : ""}`}>
          <span className="operation-label">{mainOperation.operation_type || "Consultar"}</span>
          <span className="price-value">{formatPrice(price)}</span>
          {!isRentalOperation && price.period && (
            <span className="period">{price.period}</span>
          )}
        </div>
        {property.is_starred_on_web && (
          <span className="badge-featured">Destacada</span>
        )}
        <button className="print-icon-btn" onClick={handlePrint} title="Imprimir / PDF">
          <FaPrint />
        </button>
      </div>
      {property.status && property.status !== 'disponible' && (
        <div className={`detail-status-ribbon ${property.status}`}>
          {property.status === 'vendida' ? 'VENDIDO' : 'RESERVADO'}
        </div>
      )}
    </div>
  );

  // Features reutilizables
  const featuresBlock = mainFeatures.length > 0 && (
    <div className="property-features">
      <h2>Características</h2>
      <div className="features-grid">
        {mainFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <div className={`feature-item${feature.negative ? ' feature-item--negative' : ''}`} key={feature.key}>
              <Icon className="feature-icon" />
              <div>
                <span className="feature-value">{feature.value}</span>
                <span className="feature-label">{feature.label}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="property-detail-page">

      {/* ── DESKTOP: título full-width encima del grid ── */}
      <div className="property-title-section title-desktop">
        {titleBlock}
      </div>

      <div className="container property-detail-container">
        <div className="left-column">
          {/* Galería */}
          <div className="property-gallery">
            {mediaItems.length > 0 ? (
              <>
                <div className="main-image">
                  {currentMediaItem.type === 'video' ? (
                    <iframe
                      className="main-video-frame"
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=1`}
                      title={property.publication_title || 'Video de la propiedad'}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    <img
                      src={
                        galleryPhotos[currentMediaItem.index]?.image ||
                        galleryPhotos[currentMediaItem.index]?.thumb
                      }
                      alt={property.publication_title}
                      onClick={() => {
                        setLightboxIndex(currentMediaItem.index)
                        setShowLightbox(true)
                      }}
                    />
                  )}
                  {currentMediaItem.type === 'photo' && (
                    <button
                      className="expand-btn"
                      onClick={() => {
                        setLightboxIndex(currentMediaItem.index)
                        setShowLightbox(true)
                      }}
                    >
                      <FaExpand />
                    </button>
                  )}
                  {mediaItems.length > 1 && (
                    <>
                      <button className="nav-btn prev-btn" onClick={prevMedia}>
                        <FaChevronLeft />
                      </button>
                      <button className="nav-btn next-btn" onClick={nextMedia}>
                        <FaChevronRight />
                      </button>
                    </>
                  )}
                  <div className="image-counter">
                    {currentMediaIndex + 1} / {mediaItems.length}
                  </div>
                  {aiRemodelPhotos.length > 0 && (
                    <button
                      className="ai-remodel-btn"
                      onClick={() => setShowAIModal(true)}
                    >
                      <span>Remodelar con IA</span>
                      <FaWandMagicSparkles />
                    </button>
                  )}
                </div>

                {mediaItems.length > 1 && (
                  <div className="thumbnails">
                    {thumbnailItems.map((item, index) =>
                      item.type === 'video' ? (
                        <div
                          key="video-thumb"
                          className={`video-thumb${currentMediaIndex === index ? " active" : ""}`}
                          onClick={() => setCurrentMediaIndex(index)}
                        >
                          <img
                            src={`https://img.youtube.com/vi/${youtubeVideoId}/hqdefault.jpg`}
                            alt="Video de la propiedad"
                          />
                          <span className="play-icon">
                            <FaPlay />
                          </span>
                        </div>
                      ) : (
                        <img
                          key={item.index}
                          src={item.photo.thumb || item.photo.image}
                          alt={`Imagen ${item.index + 1}`}
                          className={currentMediaIndex === index ? "active" : ""}
                          onClick={() => setCurrentMediaIndex(index)}
                        />
                      )
                    )}
                    {remainingMediaCount > 0 && (
                      <div
                        className="more-photos"
                        onClick={() => {
                          setLightboxIndex(currentMediaItem.type === 'photo' ? currentMediaItem.index : 0)
                          setShowLightbox(true)
                        }}
                      >
                        +{remainingMediaCount} fotos
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div className="no-image">
                <FaHome />
                <p>Sin imágenes disponibles</p>
                {aiRemodelPhotos.length > 0 && (
                  <button
                    className="ai-remodel-btn"
                    onClick={() => setShowAIModal(true)}
                  >
                    <span>Remodelar con IA</span>
                    <FaWandMagicSparkles />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── MOBILE ONLY: título debajo de la galería ── */}
          <div className="property-title-section title-mobile">
            {titleBlock}
          </div>

          {/* ── MOBILE ONLY: características debajo del título ── */}
          <div className="features-mobile-slot">
            {featuresBlock}
          </div>

          {/* Contenido principal: mapa y descripción */}
          <div className="main-column">
            <div className="property-location-section">
              <div className="location-info">
                <FaMapMarkerAlt className="location-icon-big" />
                <div>
                  <p className="location-address">{propertyAddress}</p>
                  <p className="location-details">
                    {property.location?.full_location ||
                      property.location?.name ||
                      "Ubicación no disponible"}
                  </p>
                </div>
              </div>
              {property.geo_lat && property.geo_long && (
                <div className="map-container">
                  <iframe
                    src={`https://www.google.com/maps?q=${property.geo_lat},${property.geo_long}&output=embed`}
                    width="100%"
                    height="350"
                    style={{ border: 0, borderRadius: "12px" }}
                    loading="lazy"
                  ></iframe>
                </div>
              )}
            </div>
            <button
              className={`mobile-id-copy-btn${idCopied ? ' copied' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(String(property.id))
                setIdCopied(true)
                setTimeout(() => setIdCopied(false), 1500)
              }}
            >
              <FaCopy />
              {idCopied ? '¡ID copiado!' : `ID #${property.id}`}
            </button>

            {property.description && (
              <div className="property-description">
                <h2>Descripción</h2>
                <div
                  className="description-text"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
                <a
                  href={`https://www.tokkobroker.com/property/${property.id}/`}
                  className="tokko-link-btn"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver en Tokko
                </a>
              </div>
            )}
          </div>
        </div>

        {/* ── DESKTOP: sidebar con contacto + características ── */}
        <div
          ref={sidebarRef}
          className={`sidebar-column sidebar-${sidebarMode}`}
        >
          <div className="contact-card">
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

              <a href="tel:+5492216006474" className="contact-btn phone-btn">
                <FaPhone />
                <span>Llamar</span>
              </a>
            </div>

            <button className="share-btn" onClick={handleShare}>
              <FaShare />
              Compartir propiedad
            </button>

            <button
              className={`property-id-btn${idCopied ? ' copied' : ''}`}
              onClick={() => {
                navigator.clipboard.writeText(String(property.id))
                setIdCopied(true)
                setTimeout(() => setIdCopied(false), 1500)
              }}
              title="Copiar ID"
            >
              {idCopied ? '¡ID copiado!' : `ID #${property.id}`}
            </button>
          </div>


          {/* ── DESKTOP ONLY: características en sidebar ── */}
          {featuresBlock}
        </div>
      </div>

      {/* Barra de contacto fija en mobile (tabbar inferior) */}
      <div className="mobile-contact-bar">
        <a
          href={whatsappHref}
          className="mobile-bar-btn whatsapp-bar-btn"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp />
          <span>WhatsApp</span>
        </a>
        <button
          className="mobile-bar-btn email-bar-btn"
          onClick={() => setShowContactForm(true)}
        >
          <FaEnvelope />
          <span>Email</span>
        </button>
        <a href="tel:+5492216006474" className="mobile-bar-btn phone-bar-btn">
          <FaPhone />
          <span>Llamar</span>
        </a>
        <button className="mobile-bar-btn share-bar-btn" onClick={handleShare}>
          <FaShare />
          <span>Compartir</span>
        </button>
      </div>

      {/* Lightbox para galería completa */}
      {showLightbox && (
        <div className="lightbox" onClick={() => setShowLightbox(false)}>
          <button
            className="lightbox-close"
            onClick={() => setShowLightbox(false)}
          >
            <FaTimes />
          </button>
          <button
            className="lightbox-nav prev"
            onClick={(e) => {
              e.stopPropagation();
              prevLightboxImage();
            }}
          >
            <FaChevronLeft />
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              nextLightboxImage();
            }}
          >
            <FaChevronRight />
          </button>
          <img
            src={galleryPhotos[lightboxIndex]?.image}
            alt={property.publication_title}
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightbox-counter">
            {lightboxIndex + 1} / {galleryPhotos.length}
          </div>
        </div>
      )}

      {/* Formulario de contacto modal */}
      {showContactForm && (
        <div
          className="modal-overlay"
          onClick={() => setShowContactForm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowContactForm(false)}
            >
              <FaTimes />
            </button>
            <h3>Contactar por esta propiedad</h3>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <input
                type="text"
                name="name"
                placeholder="Nombre *"
                value={contactForm.name}
                onChange={handleContactChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email *"
                value={contactForm.email}
                onChange={handleContactChange}
                required
              />
              <input
                type="tel"
                name="phone"
                placeholder="Teléfono *"
                value={contactForm.phone}
                onChange={handleContactChange}
                required
              />
              <textarea
                name="message"
                placeholder="Mensaje (opcional)"
                rows="4"
                value={contactForm.message}
                onChange={handleContactChange}
              />
              <button type="submit" className="submit-btn" disabled={contactStatus === 'loading'}>
                {contactStatus === 'loading' ? 'Enviando...' : 'Enviar consulta'}
              </button>
              {contactStatus === 'success' && (
                <p style={{ color: '#1a6b45', fontWeight: 600, marginTop: '0.5rem' }}>
                  ¡Consulta enviada! Te contactaremos pronto.
                </p>
              )}
              {contactStatus === 'error' && (
                <p style={{ color: '#dc2626', marginTop: '0.5rem' }}>
                  Error al enviar. Por favor intentá de nuevo.
                </p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Modal "Remodelar con IA" — proyección a futuro */}
      {showAIModal && (
        <div
          className="ai-modal-overlay"
          onClick={() => setShowAIModal(false)}
        >
          <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowAIModal(false)}
            >
              <FaTimes />
            </button>
            <h3>
              <FaWandMagicSparkles className="ai-modal-icon" />
              Remodelación con IA
            </h3>
            <p className="ai-modal-subtitle">
              Así se vería esta propiedad remodelada: una proyección a futuro generada con inteligencia artificial.
            </p>
            <div className="ai-modal-grid">
              {aiRemodelPhotos.map((photo, index) => (
                <img
                  key={index}
                  src={photo.image || photo.thumb}
                  alt={`Proyección a futuro ${index + 1}`}
                  onClick={() => setAiLightboxIndex(index)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox para las imágenes de "Remodelar con IA" */}
      {aiLightboxIndex !== null && (
        <div className="lightbox" onClick={() => setAiLightboxIndex(null)}>
          <button
            className="lightbox-close"
            onClick={() => setAiLightboxIndex(null)}
          >
            <FaTimes />
          </button>
          {aiRemodelPhotos.length > 1 && (
            <>
              <button
                className="lightbox-nav prev"
                onClick={(e) => {
                  e.stopPropagation();
                  prevAIImage();
                }}
              >
                <FaChevronLeft />
              </button>
              <button
                className="lightbox-nav next"
                onClick={(e) => {
                  e.stopPropagation();
                  nextAIImage();
                }}
              >
                <FaChevronRight />
              </button>
            </>
          )}
          <img
            src={aiRemodelPhotos[aiLightboxIndex]?.image}
            alt="Proyección a futuro"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="lightbox-counter">
            {aiLightboxIndex + 1} / {aiRemodelPhotos.length}
          </div>
        </div>
      )}

      {/* Componente de impresión — oculto en pantalla, visible al imprimir */}
      <div className="pp-print-wrapper">
        <Print property={property} />
      </div>

    </div>
  );
}
