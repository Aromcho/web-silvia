'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { getProperties } from '../../services/propertyService'
import PropertyCard from '../PropertyCard/PropertyCard'
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
      console.log(`🔍 Fetching properties for type: ${type}`)
      let apiFilters = {
        limit: 6,
        offset: 0,
        order: 'DESC'
      }
      
      switch (type) {
        case 'destacadas':
          apiFilters.is_starred = true
          apiFilters.limit = 8
          break;
        case 'alquiler-temporario':
          apiFilters.operation_type = ['Alquiler']
          break;
        case 'casas':
          apiFilters.property_type = ['Casa']
          break;
        case 'departamentos':
          apiFilters.property_type = ['Departamento']
          break;
        case 'terrenos':
          apiFilters.property_type = ['Terreno']
          break;
        default:
          break;
      }
      
      console.log(`📡 API filters for ${type}:`, apiFilters)
      const response = await getProperties(apiFilters)
      const result = response.objects || []
      
      console.log(`${type} properties fetched:`, result.length)
      return result
    } catch (error) {
      console.error(`Error fetching properties for type ${type}:`, error);
      return []
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
              <PropertyCard key={property.id} property={property} formatPrice={formatPrice} />
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