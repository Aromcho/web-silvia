'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import tokkoService from '../../services/tokkoService'
import PropertyCard from '../PropertyCard/PropertyCard'
import { 
  FaHome, 
  FaBuilding, 
  FaStore, 
  FaMapMarkerAlt, 
  FaTh,
  FaList
} from 'react-icons/fa'
import './PropertiesSearchNew.css'

export default function PropertiesSearchNew() {
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    operation: 'alquiler',
    type: '',
    sort: 'price_desc'
  })
  const [viewMode, setViewMode] = useState('grid')

  // Note: carousel removed — hero simplified to a static banner

  // Cargar propiedades
  useEffect(() => {
    loadProperties()
  }, [filters])

  const loadProperties = async () => {
    setLoading(true)
    try {
      console.log('🔍 Loading properties with filters:', filters)
      
      const apiFilters = {
        limit: 20,
        offset: 0
      }

      // Tipo de operación
      if (filters.operation) {
        const operationMapping = {
          'venta': 1,
          'alquiler': 2,
          'alquiler_temporal': 2
        }
        
        if (operationMapping[filters.operation]) {
          apiFilters.operation_type = operationMapping[filters.operation]
          console.log('📋 Applied operation filter:', filters.operation, '→', apiFilters.operation_type)
        }
      }

      // Tipo de propiedad
      if (filters.type) {
        const typeMapping = {
          'casa': 3,
          'departamento': 2,
          'ph': 3,
          'terreno': 1,
          'local': 7,
          'complejo': 8
        }
        
        if (typeMapping[filters.type]) {
          apiFilters.property_type = typeMapping[filters.type]
          console.log('🏠 Applied type filter:', filters.type, '→', apiFilters.property_type)
        }
      }

      // Ordenamiento
      if (filters.sort) {
        switch(filters.sort) {
          case 'price_asc':
            // API básica sin order_by para evitar errores
            break
          case 'price_desc':
            // API básica sin order_by para evitar errores
            break
        }
      }

      console.log('📡 Final API filters:', apiFilters)
      const apiProperties = await tokkoService.getProperties(apiFilters)
      
      // Aplicar ordenamiento local si es necesario
      let sortedProperties = [...apiProperties]
      if (filters.sort === 'price_asc') {
        sortedProperties.sort((a, b) => {
          const priceA = a.operations?.[0]?.prices?.[0]?.price || 0
          const priceB = b.operations?.[0]?.prices?.[0]?.price || 0
          return priceA - priceB
        })
      } else if (filters.sort === 'price_desc') {
        sortedProperties.sort((a, b) => {
          const priceA = a.operations?.[0]?.prices?.[0]?.price || 0
          const priceB = b.operations?.[0]?.prices?.[0]?.price || 0
          return priceB - priceA
        })
      }
      
      console.log('✅ Properties loaded:', sortedProperties.length)
      setProperties(sortedProperties)
    } catch (error) {
      console.error('❌ Error loading properties:', error)
      setProperties([])
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const formatPrice = (property) => {
    if (!property) return 'Consultar precio'
    
    let price = null
    let currency = 'ARS'
    
    if (property.operations && property.operations.length > 0) {
      const operation = property.operations[0]
      if (operation.prices && operation.prices.length > 0) {
        price = operation.prices[0].price
        currency = operation.prices[0].currency
      }
    }
    
    if (!price) return 'Consultar precio'
    
    const formattedPrice = new Intl.NumberFormat('es-AR').format(price)
    return `${currency === 'USD' ? 'USD' : '$'} ${formattedPrice}`
  }

  return (
    <div className="search-page">

      <div className="search-container">
        {/* Filtros modernos */}
        <div className="filters-section">
          <h2 className="filters-title">Encuentra tu propiedad ideal</h2>
          
          {/* Filtros de operación */}
          <div className="operation-filters">
            <button 
              className={`operation-btn ${filters.operation === 'venta' ? 'active' : ''}`}
              onClick={() => handleFilterChange('operation', 'venta')}
            >
              <FaHome className="operation-icon" />
              Comprar
            </button>
            <button 
              className={`operation-btn ${filters.operation === 'alquiler' ? 'active' : ''}`}
              onClick={() => handleFilterChange('operation', 'alquiler')}
            >
              <FaHome className="operation-icon" />
              Alquilar
            </button>
          </div>

          {/* Tipos de propiedad */}
          <div className="property-types">
            <button 
              className={`property-type-btn ${filters.type === 'casa' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'casa' ? '' : 'casa')}
            >
              <FaHome className="property-type-icon" />
              <span className="property-type-label">Casa</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'departamento' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'departamento' ? '' : 'departamento')}
            >
              <FaBuilding className="property-type-icon" />
              <span className="property-type-label">Departamento</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'ph' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'ph' ? '' : 'ph')}
            >
              <FaHome className="property-type-icon" />
              <span className="property-type-label">PH</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'terreno' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'terreno' ? '' : 'terreno')}
            >
              <FaMapMarkerAlt className="property-type-icon" />
              <span className="property-type-label">Terrenos</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'local' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'local' ? '' : 'local')}
            >
              <FaStore className="property-type-icon" />
              <span className="property-type-label">Locales</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'complejo' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'complejo' ? '' : 'complejo')}
            >
              <FaBuilding className="property-type-icon" />
              <span className="property-type-label">Complejos</span>
            </button>
          </div>

          {/* Filtro de orden */}
          <div className="sort-filter">
            <label className="sort-label">Ordenar por:</label>
            <select 
              className="sort-select"
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="price_desc">Mayor a menor precio</option>
              <option value="price_asc">Menor a mayor precio</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="results-section">
          <div className="results-header">
            <div className="results-count">
              {loading ? 'Buscando...' : `${properties.length} propiedades encontradas`}
            </div>
            <div className="view-toggle">
              <button 
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                <FaTh />
              </button>
              <button 
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <FaList />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <div className={`properties-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {properties.length > 0 ? (
                properties.map((property, index) => (
                  <div 
                    key={property.id || index}
                    style={{
                      animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                    }}
                  >
                    <PropertyCard 
                      property={property} 
                      formatPrice={formatPrice}
                    />
                  </div>
                ))
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '3rem',
                  gridColumn: '1 / -1',
                  color: '#64748b'
                }}>
                  <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>
                    No se encontraron propiedades con los filtros seleccionados
                  </p>
                  <p>Intenta ajustar los filtros para obtener más resultados</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}