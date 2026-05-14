'use client'

import React, { useEffect, useRef, useState } from 'react'
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
  FaShare,
  FaPrint
} from 'react-icons/fa'
import './PropertyDetail.css'

export default function PropertyDetail({ property }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showLightbox, setShowLightbox] = useState(false)
  const [showContactForm, setShowContactForm] = useState(false)
  const [sidebarMode, setSidebarMode] = useState('relative') // 'relative' | 'fixed' | 'bottom'
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [contactStatus, setContactStatus] = useState('idle')
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
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
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
      label: 'Sup. total'
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
    {
      key: 'credit',
      icon: FaUniversity,
      value: isCreditEligible ? 'Sí' : 'No',
      label: 'Crédito',
      negative: !isCreditEligible
    },
    {
      key: 'pets',
      icon: FaPaw,
      value: acceptsPets ? 'Sí' : 'No',
      label: 'Mascotas',
      negative: !acceptsPets
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
    if (isRentalOperation) return 'Consultar precio'

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

  const handlePrint = () => {
    const ops    = property?.operations?.[0] || {}
    const price  = ops?.prices?.[0] || {}
    const photos = (property?.photos || []).filter(p => !p.is_blueprint)
    const mainPhoto = photos[0]?.image || photos[0]?.thumb || ''
    const priceStr  = price.price
      ? `${price.currency || 'USD'} ${Number(price.price).toLocaleString('es-AR')}`
      : ops.operation_type || ''
    const propUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property?.id}`
    const logoUrl = window.location.origin + '/assets/images/logo.jpg'

    const stats = [
      property?.surface         > 0 && `<div class="st"><span class="stv">${Math.round(property.surface)} m²</span><span class="stl">Sup. Total</span></div>`,
      property?.roofed_surface  > 0 && `<div class="st"><span class="stv">${Math.round(property.roofed_surface)} m²</span><span class="stl">Sup. Cub.</span></div>`,
      property?.suite_amount    > 0 && `<div class="st"><span class="stv">${property.suite_amount}</span><span class="stl">Dorm.</span></div>`,
      property?.bathroom_amount > 0 && `<div class="st"><span class="stv">${property.bathroom_amount}</span><span class="stl">Baños</span></div>`,
      property?.parking_lot_amount > 0 && `<div class="st"><span class="stv">${property.parking_lot_amount}</span><span class="stl">Cochera</span></div>`,
    ].filter(Boolean).join('')

    const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8"/>
  <title>${property?.publication_title || 'Propiedad'}</title>
  <style>
    * { margin:0; padding:0; box-sizing:border-box; }
    @page { size: A4 landscape; margin: 0; }
    body { font-family: Inter, Arial, sans-serif; width:100%; height:100vh; display:flex; flex-direction:column; background:#fff; }

    .hdr { display:flex; align-items:center; gap:1.2rem; padding:12px 24px; border-bottom:3px solid #00815c; flex-shrink:0; }
    .hdr img { width:80px; height:auto; }
    .hdr-title { font-size:.95rem; font-weight:700; color:#1e293b; }
    .hdr-addr  { font-size:.75rem; color:#64748b; margin-top:2px; }

    .img-wrap { flex:1; position:relative; overflow:hidden; min-height:0; }
    .img-wrap img { width:100%; height:100%; object-fit:cover; display:block; }

    .overlay { position:absolute; bottom:0; left:0; width:52%; background:rgba(0,129,92,.88); padding:14px 20px; border-radius:0 14px 0 0; color:#fff; }
    .ov-price { font-size:1.5rem; font-weight:800; margin-bottom:8px; }
    .ov-stats { display:flex; gap:16px; flex-wrap:wrap; }
    .st  { display:flex; flex-direction:column; align-items:center; }
    .stv { font-weight:700; font-size:.82rem; }
    .stl { font-size:.62rem; opacity:.85; }

    .qr-box { position:absolute; bottom:10px; right:14px; background:#fff; padding:8px; border-radius:10px; display:flex; flex-direction:column; align-items:center; gap:3px; box-shadow:0 2px 10px rgba(0,0,0,.2); }
    .qr-box img { width:110px; height:110px; }
    .qr-lbl { font-size:.6rem; color:#64748b; font-weight:600; }

    .ftr { display:flex; align-items:center; justify-content:space-around; padding:8px 24px; background:#1e293b; color:#fff; gap:.75rem; flex-wrap:wrap; flex-shrink:0; }
    .fc  { font-size:.72rem; }
    .fu  { font-size:.62rem; color:#94a3b8; }
  </style>
</head>
<body>
  <div class="hdr">
    <img src="${logoUrl}" alt="Silvia Fernández"/>
    <div>
      <div class="hdr-title">${property?.publication_title || ''}</div>
      <div class="hdr-addr">${property?.address || ''}</div>
    </div>
  </div>

  <div class="img-wrap">
    ${mainPhoto ? `<img src="${mainPhoto}" alt="Propiedad"/>` : '<div style="background:#e2e8f0;width:100%;height:100%"></div>'}
    <div class="overlay">
      <div class="ov-price">${priceStr}</div>
      <div class="ov-stats">${stats}</div>
    </div>
    <div class="qr-box">
      <img src="https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(propUrl)}" alt="QR"/>
      <span class="qr-lbl">Ver online</span>
    </div>
  </div>

  <div class="ftr">
    <span class="fc">📞 2255 46-3051</span>
    <span class="fc">💬 +54 9 2255 509408</span>
    <span class="fc">✉ braicesfernandez@gmail.com</span>
    <span class="fu">${propUrl}</span>
  </div>
</body>
</html>`

    const pw = window.open('', '_blank', 'width=1200,height=800')
    if (!pw) return
    pw.document.write(html)
    pw.document.close()
    pw.focus()
    setTimeout(() => { pw.print(); pw.close() }, 600)
  }

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
            {photos.length > 0 ? (
              <>
                <div className="main-image">
                  <img
                    src={
                      photos[currentImageIndex]?.image ||
                      photos[currentImageIndex]?.thumb
                    }
                    alt={property.publication_title}
                    onClick={() => setShowLightbox(true)}
                  />
                  <button
                    className="expand-btn"
                    onClick={() => setShowLightbox(true)}
                  >
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
                        className={currentImageIndex === index ? "active" : ""}
                        onClick={() => setCurrentImageIndex(index)}
                      />
                    ))}
                    {photos.length > 5 && (
                      <div
                        className="more-photos"
                        onClick={() => setShowLightbox(true)}
                      >
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
            {property.description && (
              <div className="property-description">
                <h2>Descripción</h2>
                <div
                  className="description-text"
                  dangerouslySetInnerHTML={{ __html: property.description }}
                />
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

            <button className="share-btn print-btn" onClick={handlePrint}>
              <FaPrint />
              Imprimir / PDF
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
              prevImage();
            }}
          >
            <FaChevronLeft />
          </button>
          <button
            className="lightbox-nav next"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
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
    </div>
  );
}
