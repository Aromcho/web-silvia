import React from 'react'
import Link from 'next/link'
import { 
  FaHome, 
  FaBed, 
  FaBath, 
  FaMapMarkerAlt,
  FaWhatsapp
} from 'react-icons/fa'
import './PropertyCard.css'

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
              
              // Verificar si es Venta
              if (operationType && (operationType.includes('Venta') || operationType === 'Sale' || property.operations[0].operation_id === 1)) {
                return 'Venta'
              }
              
              // Verificar si es Alquiler (incluye "Alquiler" y "Alquiler temporario")
              if (operationType && (operationType.includes('Alquiler') || operationType === 'Rent' || property.operations[0].operation_id === 2)) {
                return 'Alquiler'
              }
              
              // Retornar el tipo tal cual viene de la API
              return operationType || 'Consultar'
            }
            return 'Consultar'
          })()}
        </div>
      </div>
      
      <div className="property-content">
        <h4 className="property-title">
          {propertyTitle}
        </h4>
        <p className="property-price">{getDisplayPrice()}</p>
        
        <div className="property-details">
          <span className="detail-item">
            <FaHome className="detail-icon" />
            {property.surface || 0}m²
          </span>
          
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
        </div>
        
        <p className="property-location">
          <FaMapMarkerAlt className="location-icon" />
          {property.address?.city || property.location?.name || property.location || 'Ubicación no disponible'}, {property.address?.state || ''}
        </p>
        
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