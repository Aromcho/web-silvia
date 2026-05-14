'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { FaBed, FaBath, FaCar, FaRulerCombined, FaPhone, FaEnvelope } from 'react-icons/fa'
import { IoLogoWhatsapp } from 'react-icons/io'
import './PropertyPrint.css'

const PropertyPrint = React.forwardRef(function PropertyPrint({ property }, ref) {
  const photos = (property?.photos || []).filter(p => !p.is_blueprint)
  const mainPhoto = photos[0]?.image || photos[0]?.thumb || ''

  const ops = property?.operations?.[0] || {}
  const price = ops?.prices?.[0] || {}
  const priceStr = price.price
    ? `${price.currency || 'USD'} ${Number(price.price).toLocaleString('es-AR')}`
    : ops.operation_type || ''

  const propertyUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property?.id}`

  const stats = [
    property?.surface > 0 && { icon: <FaRulerCombined />, label: 'Sup. Total', value: `${Math.round(property.surface)} m²` },
    property?.roofed_surface > 0 && { icon: <FaRulerCombined />, label: 'Sup. Cub.', value: `${Math.round(property.roofed_surface)} m²` },
    property?.suite_amount > 0 && { icon: <FaBed />, label: 'Dorm.', value: property.suite_amount },
    property?.bathroom_amount > 0 && { icon: <FaBath />, label: 'Baños', value: property.bathroom_amount },
    property?.parking_lot_amount > 0 && { icon: <FaCar />, label: 'Cochera', value: property.parking_lot_amount },
  ].filter(Boolean)

  return (
    <div className="pp-root" ref={ref} id="pp-root">
      {/* Header */}
      <div className="pp-header">
        <img src="/assets/images/logo.jpg" alt="Silvia Fernández" className="pp-logo" />
        <div className="pp-header-info">
          <span className="pp-header-title">{property?.publication_title}</span>
          <span className="pp-header-address">{property?.address}</span>
        </div>
      </div>

      {/* Main image + overlay */}
      <div className="pp-image-wrap">
        {mainPhoto && <img src={mainPhoto} alt="Propiedad" className="pp-main-img" />}

        {/* Overlay verde con precio y datos */}
        <div className="pp-overlay">
          <div className="pp-overlay-price">{priceStr}</div>
          <div className="pp-overlay-stats">
            {stats.map((s, i) => (
              <div key={i} className="pp-stat">
                {s.icon}
                <span className="pp-stat-val">{s.value}</span>
                <span className="pp-stat-lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* QR */}
        <div className="pp-qr">
          <QRCode value={propertyUrl} size={110} />
          <span className="pp-qr-label">Ver online</span>
        </div>
      </div>

      {/* Footer con contacto */}
      <div className="pp-footer">
        <div className="pp-contact-item"><FaPhone /> 2255 46-3051</div>
        <div className="pp-contact-item"><IoLogoWhatsapp /> +54 9 2255 509408</div>
        <div className="pp-contact-item"><FaEnvelope /> braicesfernandez@gmail.com</div>
        <div className="pp-contact-item pp-url">{propertyUrl}</div>
      </div>
    </div>
  )
})

export default PropertyPrint
