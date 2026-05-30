import React from 'react'
import Link from 'next/link'
import {
  FaHome,
  FaBed,
  FaBath,
  FaCar,
  FaMapMarkerAlt,
  FaWhatsapp
} from 'react-icons/fa'
import './PropertyCard.css'

const isCreditEligible = (property) => {
  const normalize = (value) => {
    if (value === null || value === undefined) return ''
    return String(value).toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()
  }
  const text = normalize(property.credit_eligible)
  if (!text) return false
  const truthyValues = new Set(['true', '1', 'si', 'yes', 'y', 'apto', 'acepta', 'eligible', 'apto credito', 'apto credito hipotecario'])
  if (truthyValues.has(text) || text.startsWith('apto')) return true
  const collections = [property.tags, property.custom_tags].filter(Array.isArray)
  return collections.some((items) =>
    items.some((item) => {
      const t = normalize(item?.name || item?.label || item?.value || item)
      return t.includes('apto credito') || t.includes('credit eligible')
    })
  )
}

export default function PropertyCard({ property, formatPrice }) {
  const normalizePropertyTypeLabel = (text) => {
    if (!text || typeof text !== 'string') return text
    return text
      .replace(/\bhoteles\b/gi, 'Complejos')
      .replace(/\bhotel\b/gi, 'Complejo')
  }

  const getDisplayPrice = () => {
    // Verificar si es alquiler
    if (property.operations && property.operations.length > 0) {
      const operationType = property.operations[0].operation_type
      if (operationType && (operationType.includes('Alquiler') || operationType === 'Rent')) {
        return 'Consultar precio'
      }
    }
    return formatPrice(property)
  }

  const propertyTitle = normalizePropertyTypeLabel(
    property.address?.street_name || property.real_address || property.address || property.publication_title || property.title || 'Propiedad'
  )

  return (
    <Link href={`/propiedad/${property.id}`} className="modern-property-card">
      <div className="property-image">
        <img 
          src={
            property.photos?.[0]?.image || 
            property.photos?.[0]?.thumb || 
            property.images?.[0] || 
            'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen'
          } 
          alt={propertyTitle}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen';
          }}
        />
        <div className="property-badge">
          {(() => {
            if (property.operations && property.operations.length > 0) {
              const operationType = property.operations[0].operation_type

              if (operationType && (operationType.includes('Venta') || operationType === 'Sale' || property.operations[0].operation_id === 1)) {
                return 'Venta'
              }

              if (operationType && (operationType.includes('Alquiler') || operationType === 'Rent' || property.operations[0].operation_id === 2)) {
                return 'Alquiler'
              }

              return operationType || 'Consultar'
            }
            return 'Consultar'
          })()}
        </div>
        {isCreditEligible(property) && (
          <div className="credit-badge">Apto crédito</div>
        )}
        {property.status && property.status !== 'disponible' && (
          <div className={`status-ribbon ${property.status}`}>
            {property.status === 'vendida' ? 'VENDIDO' : 'RESERVADO'}
          </div>
        )}
      </div>
      
      <div className="property-content">
        <h4 className="property-title">
          {propertyTitle}
        </h4>
        <p className="property-price">{getDisplayPrice()}</p>
        
        <div className="property-details">
          {property.surface > 0 && (
            <span className="detail-item">
              <FaHome className="detail-icon" />
              {property.surface}m² tot.
            </span>
          )}
          {property.roofed_surface > 0 && (
            <span className="detail-item">
              <FaHome className="detail-icon" />
              {property.roofed_surface}m² cub.
            </span>
          )}
          
          {(property.suite_amount || property.bedrooms) > 0 && (
            <span className="detail-item">
              <FaBed className="detail-icon" />
              {property.suite_amount || property.bedrooms} dorm.
            </span>
          )}
          
          {(property.bathroom_amount || property.bathrooms) > 0 && (
            <span className="detail-item">
              <FaBath className="detail-icon" />
              {property.bathroom_amount || property.bathrooms} baños
            </span>
          )}

          {property.parking_lot_amount > 0 && (
            <span className="detail-item">
              <FaCar className="detail-icon" />
              {property.parking_lot_amount} {property.parking_lot_amount === 1 ? 'cochera' : 'cocheras'}
            </span>
          )}
        </div>
        
        <p className="property-location">
          <FaMapMarkerAlt className="location-icon" />
          {property.address?.city || property.location?.name || property.location || 'Ubicación no disponible'}, {property.address?.state || ''}
        </p>
        <p className="property-id">ID #{property.id}</p>
        
        <div className="property-actions">
          <button className="btn-view">
            <span>Ver Detalles</span>
            <span className="btn-arrow">→</span>
          </button>
          <button 
            className="btn-contact"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              const propertyUrl = `https://www.silviafernandezpropiedades.com.ar/propiedad/${property.id}`
              const messageText = `Hola, me interesa esta propiedad: ${propertyTitle}`
              window.open(`https://wa.me/5492255626092?text=${encodeURIComponent(`${messageText}\n\n${propertyUrl}`)}`, '_blank')
            }}
          >
            <FaWhatsapp />
            <span>Contactar</span>
          </button>
        </div>
      </div>
    </Link>
  )
}