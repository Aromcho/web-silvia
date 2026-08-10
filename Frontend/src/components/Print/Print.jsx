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
  const isUsd = price.currency === 'USD' || price.currency === 'Dólar Estadounidense' || !price.currency
  const priceStr = (!price.price || price.price === 1 || (price.price === 100 && isUsd))
    ? 'Consultar precio'
    : `${price.currency || 'USD'} ${formatToMoney(price.price)}`

  const propertyUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property?.id}`

  const rawPropertyType = property?.type?.name || ''
  const propertyType = rawPropertyType.toLowerCase() === 'hotel' ? 'Complejo' : rawPropertyType
  const location = property?.location?.name || ''
  const subtitle = [propertyType, location].filter(Boolean).join(' en ')

  const stats = [
    property?.surface > 0 && {
      icon: <FaRulerCombined />,
      value: `${Math.round(property.surface)} m²`,
      label: 'Sup. Total',
    },
    property?.roofed_surface > 0 && {
      icon: <FaRulerCombined />,
      value: `${Math.round(property.roofed_surface)} m²`,
      label: 'Cubiertos',
    },
    property?.parking_lot_amount > 0 && {
      icon: <FaCar />,
      value: `${property.parking_lot_amount}`,
      label: `Cochera${property.parking_lot_amount === 1 ? '' : 's'}`,
    },
    property?.suite_amount > 0 && {
      icon: <FaBed />,
      value: `${property.suite_amount}`,
      label: `Dormitorio${property.suite_amount === 1 ? '' : 's'}`,
    },
    property?.bathroom_amount > 0 && {
      icon: <FaBath />,
      value: `${property.bathroom_amount}`,
      label: `Baño${property.bathroom_amount === 1 ? '' : 's'}`,
    },
  ].filter(Boolean)

  return (
    <div className="print-root" ref={ref}>

      {/* Foto principal */}
      <div className="print-image-wrap">
        {mainPhoto && <img src={mainPhoto} alt="Propiedad" className="print-main-img" />}

        {/* Header: caja blanca con logo + barra verde transparente, sobrepuesto a la imagen */}
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

        {/* Forma verde ondulada inferior */}
        <svg
          className="print-overlay-shape"
          viewBox="0 0 1000 300"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0,300 L0,95 C160,50 300,45 430,70 C560,95 580,140 680,175 C760,200 820,190 870,165 C910,145 950,150 1000,160 L1000,300 Z"
            fill="rgba(0,129,92,0.6)"
          />
        </svg>

        <div className="print-overlay-content">
          <div className="print-overlay-title">
            {property.address}
          </div>
          {subtitle && (
            <div className="print-overlay-subtitle">{subtitle}</div>
          )}
          <div className="print-info-row">
            {priceStr && <div className="print-price">{priceStr}</div>}
            <div className="print-stats-row">
              {stats.map((s, i) => (
                <div className="print-stat" key={i}>
                  <span className="print-stat-icon">{s.icon}</span>
                  <span className="print-stat-value">{s.value}</span>
                  <span className="print-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="print-qr-card">
          <QRCode value={propertyUrl} size={110} bgColor="#ffffff" fgColor="#000000" />
        </div>
      </div>

    </div>
  )
})

export default Print
