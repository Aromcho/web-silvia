'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import tokkoService from '../../services/tokkoService'
import './Properties.css'

export default function Properties() {
  const [sectionsData, setSectionsData] = useState({
    destacadas: [],
    'alquiler-temporario': [],
    casas: [],
    departamentos: [],
    terrenos: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchAllProperties = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching properties from Tokko API...')
        
        // Cargar todas las secciones en paralelo
        const [destacadas, alquilerTemp, casas, departamentos, terrenos] = await Promise.all([
          getPropertiesByType('destacadas'),
          getPropertiesByType('alquiler-temporario'),
          getPropertiesByType('casas'),
          getPropertiesByType('departamentos'),
          getPropertiesByType('terrenos')
        ])

        console.log('Properties loaded:', {
          destacadas: destacadas.length,
          alquilerTemp: alquilerTemp.length,
          casas: casas.length,
          departamentos: departamentos.length,
          terrenos: terrenos.length
        })

        setSectionsData({
          destacadas,
          'alquiler-temporario': alquilerTemp,
          casas,
          departamentos,
          terrenos
        })
      } catch (err) {
        console.error('Error fetching properties:', err)
        setError(`Error al cargar las propiedades: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    fetchAllProperties()
  }, [])

  // Función para obtener propiedades por tipo
  const getPropertiesByType = async (type) => {
    try {
      console.log(`Fetching properties for type: ${type}`)
      let result = []
      
      switch (type) {
        case 'destacadas':
          result = await tokkoService.getFeaturedProperties(6);
          break;
        case 'alquiler-temporario':
          result = await tokkoService.getPropertiesByOperation(2, 6);
          break;
        case 'casas':
          result = await tokkoService.getPropertiesByType('Casa', 6);
          break;
        case 'departamentos':
          result = await tokkoService.getPropertiesByType('Departamento', 6);
          break;
        case 'terrenos':
          result = await tokkoService.getPropertiesByType('Terreno', 6);
          break;
        default:
          result = [];
      }
      
      console.log(`${type} properties fetched:`, result.length, result)
      return result
    } catch (error) {
      console.error(`Error fetching properties for type ${type}:`, error);
      throw error
    }
  }

  // Función para formatear precio
  const formatPrice = (property) => {
    if (!property) return 'Consultar precio'
    
    // Manejar estructura de Tokko API
    let price = null
    let currency = 'ARS'
    
    if (property.operations && property.operations.length > 0) {
      const operation = property.operations[0]
      if (operation.prices && operation.prices.length > 0) {
        price = operation.prices[0].price
        currency = operation.prices[0].currency
      }
    } else {
      price = property.price || property.total_price
      currency = property.currency?.name || property.currency || 'ARS'
    }
    
    if (!price) return 'Consultar precio'
    
    try {
      // Mapear códigos de moneda de Tokko
      const currencyMap = {
        'Peso Argentino': 'ARS',
        'USD': 'USD',
        'Dólar Estadounidense': 'USD',
        'ARS': 'ARS'
      }
      
      const mappedCurrency = currencyMap[currency] || currency
      
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: mappedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price)
    } catch (error) {
      return `${currency} ${price.toLocaleString()}`
    }
  }

  // Función para obtener la imagen principal
  const getMainImage = (property) => {
    // Tokko API structure
    if (property.photos && property.photos.length > 0) {
      return property.photos[0].image || property.photos[0].thumb
    }
    
    // Fallback para otros formatos
    if (property.images && property.images.length > 0) {
      return property.images[0]
    }
    
    return 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen'
  }

  // Componente de tarjeta de propiedad
  const PropertyCard = ({ property }) => (
    <div className="property-card">
      <div className="property-image">
        <img 
          src={getMainImage(property)} 
          alt={property.publication_title || property.title || property.address?.street_name || 'Propiedad'}
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen'
          }}
        />
        {property.is_starred_on_web && (
          <div className="property-badge">Destacada</div>
        )}
        <div className="property-type-badge">
          {property.operations && property.operations.length > 0 
            ? (property.operations[0].operation_type === 'Sale' || property.operations[0].operation_id === 1 ? 'Venta' : 'Alquiler')
            : (property.operation?.operation_type === 1 ? 'Venta' : 'Alquiler')
          }
        </div>
      </div>
      <div className="property-info">
        <h3 className="property-title">
          {property.publication_title || property.title || property.address?.street_name || 'Propiedad'}
        </h3>
        <p className="property-price">
          {formatPrice(property)}
        </p>
        <p className="property-location">
          📍 {property.address?.city || property.location?.name || property.location || 'Ubicación no disponible'}, {property.address?.state || ''}
        </p>
        <div className="property-details">
          {property.surface && (
            <span className="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {property.surface}m²
            </span>
          )}
          {property.suite_amount && (
            <span className="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {property.suite_amount} dorm.
            </span>
          )}
          {property.bathroom_amount && (
            <span className="detail-item">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
              </svg>
              {property.bathroom_amount} baños
            </span>
          )}
        </div>
        <div className="property-actions">
          <button className="btn-view">Ver Detalles</button>
          <button className="btn-contact">Contactar</button>
        </div>
      </div>
    </div>
  )

  // Componente de sección con scroll horizontal
  const PropertySection = ({ title, type, properties }) => {
    if (!properties || properties.length === 0) return null

    return (
      <div className="property-section">
        <div className="section-header">
          <h2 className="section-title">{title}</h2>
          <Link href="/propiedades" className="view-all-link">
            Ver todas <span className="arrow">→</span>
          </Link>
        </div>
        <div className="properties-scroll-container">
          <div className="properties-grid">
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <section className="properties-section">
        <div className="container">
          <div className="loading-state">
            <div className="skeleton-loader">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-card">
                  <div className="skeleton-image"></div>
                  <div className="skeleton-content">
                    <div className="skeleton-line"></div>
                    <div className="skeleton-line short"></div>
                    <div className="skeleton-line"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="properties-section">
        <div className="container">
          <div className="error-state">
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>
              Intentar nuevamente
            </button>
          </div>
        </div>
      </section>
    )
  }

  const sections = [
    {
      title: 'Propiedades Destacadas',
      type: 'destacadas',
      properties: sectionsData.destacadas
    },
    {
      title: 'Alquiler Temporario',
      type: 'alquiler-temporario',
      properties: sectionsData['alquiler-temporario']
    },
    {
      title: 'Casas',
      type: 'casas',
      properties: sectionsData.casas
    },
    {
      title: 'Departamentos',
      type: 'departamentos',
      properties: sectionsData.departamentos
    },
    {
      title: 'Terrenos',
      type: 'terrenos',
      properties: sectionsData.terrenos
    }
  ]

  return (
    <section className="properties-section">
      <div className="container">
        {sections.map((section, index) => (
          <PropertySection
            key={index}
            title={section.title}
            type={section.type}
            properties={section.properties}
          />
        ))}
      </div>
    </section>
  )
}