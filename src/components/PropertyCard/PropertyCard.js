import React from 'react'
import { 
  FaHome, 
  FaBed, 
  FaBath, 
  FaMapMarkerAlt,
  FaEye,
  FaWhatsapp
} from 'react-icons/fa'
import './PropertyCard.css'

export default function PropertyCard({ property, formatPrice }) {
  return (
    <div className="modern-property-card">
      <div className="property-image">
        <img 
          src={
            property.photos?.[0]?.image || 
            property.photos?.[0]?.thumb || 
            property.images?.[0] || 
            'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen'
          } 
          alt={property.publication_title || property.title || property.address?.street_name || 'Propiedad'}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen';
          }}
        />
        <div className="property-badge">
          {property.operations && property.operations.length > 0 
            ? (property.operations[0].operation_type === 'Sale' || property.operations[0].operation_id === 1 ? 'Venta' : 'Alquiler')
            : (property.operation?.operation_type === 1 || property.operation === 'venta' ? 'Venta' : 'Alquiler')
          }
        </div>
        <div className="property-overlay">
          <button className="quick-view-btn">
            <FaEye /> Vista rápida
          </button>
        </div>
      </div>
      
      <div className="property-content">
        <h4 className="property-title">
          {property.publication_title || property.title || property.address?.street_name || 'Propiedad'}
        </h4>
        <p className="property-price">{formatPrice(property)}</p>
        
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
          <button className="btn-contact">
            <FaWhatsapp />
            <span>Contactar</span>
          </button>
        </div>
      </div>
    </div>
  )
}