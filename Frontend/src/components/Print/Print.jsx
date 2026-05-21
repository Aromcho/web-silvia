'use client'

import React from 'react'
import QRCode from 'react-qr-code'
import { FaBed, FaBath, FaCar, FaRulerCombined, FaPhone, FaEnvelope } from 'react-icons/fa'
import { IoLogoWhatsapp } from 'react-icons/io'
import { formatToMoney } from '../../helpers/index.js'
import './Print.css'

const Print = React.forwardRef(function Print({ property }, ref) {
  const photos = (property?.photos || []).filter(p => !p.is_blueprint)
  const mainPhoto = photos[0]?.image || photos[0]?.thumb || ''

  const ops = property?.operations?.[0] || {}
  const price = ops?.prices?.[0] || {}
  const priceStr = price.price
    ? `${price.currency || 'USD'} ${formatToMoney(price.price)}`
    : ops.operation_type || ''

  const propertyUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property?.id}`

  const propertyType = property?.type?.name || ''
  const location = property?.location?.name || ''
  const subtitle = [propertyType, location].filter(Boolean).join(' en ')

  const stats = [
    property?.surface > 0 && {
      icon: <FaRulerCombined />,
      label: 'Sup. Total',
      value: Math.round(property.surface),
    },
    property?.roofed_surface > 0 && {
      icon: <FaRulerCombined />,
      label: 'Sup. Cub',
      value: Math.round(property.roofed_surface),
    },
    property?.suite_amount > 0 && {
      icon: <FaBed />,
      label: null,
      value: property.suite_amount,
    },
    property?.bathroom_amount > 0 && {
      icon: <FaBath />,
      label: null,
      value: property.bathroom_amount,
    },
    property?.parking_lot_amount > 0 && {
      icon: <FaCar />,
      label: null,
      value: property.parking_lot_amount,
    },
  ].filter(Boolean)

  return (
    <div className="print-root" ref={ref}>

      {/* Header: caja blanca con logo + barra verde con contacto */}
      <div className="print-header">
        <div className="print-logo-box">
          <img src="/assets/images/logo.jpg" alt="Silvia Fernández" className="print-logo" />
        </div>
        <div className="print-contact-bar">
          <span className="print-contact-item">
            <FaPhone className="print-contact-icon" /> 2255 46-3051
          </span>
          <span className="print-contact-item">
            <IoLogoWhatsapp className="print-contact-icon" /> +54 9 2255 509408
          </span>
          <span className="print-contact-item">
            <FaEnvelope className="print-contact-icon" /> braicesfernandez@gmail.com
          </span>
        </div>
      </div>

      {/* Foto principal */}
      <div className="print-image-wrap">
        {mainPhoto && <img src={mainPhoto} alt="Propiedad" className="print-main-img" />}

        {/* Overlay verde inferior ancho completo */}
        <div className="print-overlay">
          <div className="print-overlay-left">
            <div className="print-overlay-title">
              {property?.publication_title || property?.address}
            </div>
            {subtitle && (
              <div className="print-overlay-subtitle">{subtitle}</div>
            )}
            <div className="print-stats-row">
              {priceStr && <span className="print-price">{priceStr}</span>}
              {stats.map((s, i) => (
                <React.Fragment key={i}>
                  <span className="print-stat-divider">|</span>
                  <div className="print-stat">
                    {s.label && <span className="print-stat-lbl">{s.label}</span>}
                    <span className="print-stat-val">{s.value}</span>
                    <span className="print-stat-icon">{s.icon}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="print-qr-wrap">
            <QRCode value={propertyUrl} size={130} bgColor="#ffffff" fgColor="#000000" />
          </div>
        </div>
      </div>

    </div>
  )
})

export default Print
