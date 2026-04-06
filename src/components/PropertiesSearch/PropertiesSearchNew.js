'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getProperties, autocompleteProperties } from '../../services/propertyService'
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

const PAGE_SIZE = 24
const FILTER_DEBOUNCE_MS = 250

const OPERATION_QUERY_MAP = {
  venta: ['Venta', 'Sale'],
  alquiler: ['Alquiler', 'Rent', 'Alquiler temporal', 'Alquiler Temporario'],
  alquiler_temporal: ['Alquiler', 'Alquiler temporal', 'Alquiler Temporario', 'Temporary Rent'],
}

const PROPERTY_TYPE_QUERY_MAP = {
  Casa: ['Casa', 'Casas', 'House'],
  Departamento: ['Departamento', 'Departamentos', 'Apartment', 'Flat'],
  PH: ['PH'],
  Terreno: ['Terreno', 'Terrenos', 'Lote', 'Lotes', 'Campo'],
  Local: ['Local', 'Locales', 'Local Comercial'],
  Complejo: ['Complejo', 'Complejos', 'Hotel', 'Hoteles', 'Hotelero', 'Apart Hotel', 'Emprendimiento'],
}

const dedupeProperties = (items) => {
  const seen = new Set()
  return items.filter((item) => {
    const key = item?.id ?? item?._id
    if (key === undefined || key === null) {
      return true
    }

    if (seen.has(key)) {
      return false
    }

    seen.add(key)
    return true
  })
}

const getOperationQueryValues = (operation) => {
  return OPERATION_QUERY_MAP[operation] || []
}

const getPropertyTypeQueryValues = (type) => {
  if (!type) return []
  return PROPERTY_TYPE_QUERY_MAP[type] || [type]
}

const normalizeSortOrder = (sort) => {
  if (sort === 'price_asc') return 'ASC'
  if (sort === 'price_desc') return 'DESC'
  return 'DESC'
}

export default function PropertiesSearchNew() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [filters, setFilters] = useState({
    operation: searchParams.get('operation') || 'alquiler',
    type: searchParams.get('type') || '',
    location: searchParams.get('location') || '',
    sort: 'recent'
  })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [viewMode, setViewMode] = useState('grid')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const suggestionsRef = useRef(null)
  const loadMoreRef = useRef(null)
  const requestIdRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => {
      setAppliedFilters(filters)
    }, FILTER_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [filters])

  const buildApiFilters = (filtersSnapshot, pageToLoad) => {
    const apiFilters = {
      limit: PAGE_SIZE,
      offset: pageToLoad * PAGE_SIZE,
      order: normalizeSortOrder(filtersSnapshot.sort)
    }

    const operationValues = getOperationQueryValues(filtersSnapshot.operation)
    if (operationValues.length > 0) {
      apiFilters.operation_type = operationValues
    }

    const propertyTypeValues = getPropertyTypeQueryValues(filtersSnapshot.type)
    if (propertyTypeValues.length > 0) {
      apiFilters.property_type = propertyTypeValues
    }

    if (filtersSnapshot.location) {
      apiFilters.searchQuery = filtersSnapshot.location.trim()
    }

    return apiFilters
  }

  const loadProperties = async ({ pageToLoad = 0, replace = false, filtersSnapshot = appliedFilters } = {}) => {
    const requestId = ++requestIdRef.current

    if (pageToLoad === 0) {
      setLoading(true)
    } else {
      setLoadingMore(true)
    }

    try {
      const apiFilters = buildApiFilters(filtersSnapshot, pageToLoad)
      const result = await getProperties(apiFilters)

      if (requestId !== requestIdRef.current) {
        return
      }

      const nextProperties = result.objects || []
      const total = result.meta?.total_count || 0

      setTotalCount(total)
      setPage(pageToLoad)
      setHasMore(nextProperties.length === PAGE_SIZE && (pageToLoad + 1) * PAGE_SIZE < total)

      setProperties((previous) => {
        const merged = replace ? nextProperties : [...previous, ...nextProperties]
        return dedupeProperties(merged)
      })
    } catch (error) {
      if (requestId === requestIdRef.current) {
        console.error('❌ Error loading properties:', error)
        if (pageToLoad === 0) {
          setProperties([])
          setTotalCount(0)
        }
        setHasMore(false)
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }

  useEffect(() => {
    setProperties([])
    setTotalCount(0)
    setPage(0)
    setHasMore(true)
    loadProperties({ pageToLoad: 0, replace: true, filtersSnapshot: appliedFilters })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters])

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasMore) {
      return undefined
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries

        if (entry.isIntersecting && !loading && !loadingMore && hasMore) {
          loadProperties({ pageToLoad: page + 1, replace: false, filtersSnapshot: appliedFilters })
        }
      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0.1,
      }
    )

    observer.observe(loadMoreRef.current)

    return () => observer.disconnect()
  }, [appliedFilters, hasMore, loading, loadingMore, page])

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))

    // Autocompletado para ubicación
    if (key === 'location' && value.length > 2) {
      handleAutocomplete(value)
    } else if (key === 'location') {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleAutocomplete = async (query) => {
    try {
      const results = await autocompleteProperties(query)
      setSuggestions(results)
      setShowSuggestions(results.length > 0)
    } catch (error) {
      console.error('Error en autocompletado:', error)
      setSuggestions([])
    }
  }

  const selectSuggestion = (suggestion) => {
    setFilters(prev => ({
      ...prev,
      location: suggestion.value
    }))
    setSuggestions([])
    setShowSuggestions(false)
  }

  // Cerrar sugerencias al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
    
    try {
      const formattedPrice = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price)
      return formattedPrice
    } catch (error) {
      return `${currency} ${price.toLocaleString('es-AR')}`
    }
  }

  return (
    <div className="search-page">

      <div className="search-container">
        {/* Filtros modernos */}
        <div className="filters-section">
          <h2 className="filters-title">Encuentra tu propiedad ideal</h2>
          
          {/* Filtros de operación y ubicación */}
          <div className="operation-and-location">
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

            {/* Input de ubicación con autocompletado */}
            <div className="location-search" ref={suggestionsRef}>
              <div className="location-input-wrapper">
                <FaMapMarkerAlt className="location-input-icon" />
                <input
                  type="text"
                  className="location-input"
                  placeholder="Buscar ubicación..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  autoComplete="off"
                />
                {filters.location && (
                  <button 
                    className="clear-location-btn"
                    onClick={() => handleFilterChange('location', '')}
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <ul className="location-suggestions">
                  {suggestions.map((suggestion, index) => (
                    <li 
                      key={index}
                      onClick={() => selectSuggestion(suggestion)}
                      className="location-suggestion-item"
                    >
                      <FaMapMarkerAlt className="suggestion-icon" />
                      <div className="suggestion-content">
                        <strong>{suggestion.value}</strong>
                        {suggestion.secundvalue && (
                          <small>{suggestion.secundvalue}</small>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Tipos de propiedad */}
          <div className="property-types">
            <button 
              className={`property-type-btn ${filters.type === 'Casa' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'Casa' ? '' : 'Casa')}
            >
              <FaHome className="property-type-icon" />
              <span className="property-type-label">Casa</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'Departamento' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'Departamento' ? '' : 'Departamento')}
            >
              <FaBuilding className="property-type-icon" />
              <span className="property-type-label">Departamento</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'PH' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'PH' ? '' : 'PH')}
            >
              <FaHome className="property-type-icon" />
              <span className="property-type-label">PH</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'Terreno' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'Terreno' ? '' : 'Terreno')}
            >
              <FaMapMarkerAlt className="property-type-icon" />
              <span className="property-type-label">Terrenos</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'Local' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'Local' ? '' : 'Local')}
            >
              <FaStore className="property-type-icon" />
              <span className="property-type-label">Locales</span>
            </button>
            <button 
              className={`property-type-btn ${filters.type === 'Complejo' ? 'active' : ''}`}
              onClick={() => handleFilterChange('type', filters.type === 'Complejo' ? '' : 'Complejo')}
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
              <option value="recent">Más recientes</option>
              <option value="price_desc">Mayor a menor precio</option>
              <option value="price_asc">Menor a mayor precio</option>
            </select>
          </div>
        </div>

        {/* Resultados */}
        <div className="results-section">
          <div className="results-header">
            <div className="results-count">
              {loading && properties.length === 0
                ? 'Buscando...'
                : `${properties.length} de ${totalCount} propiedades encontradas`}
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

          {loading && properties.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
            </div>
          ) : (
            <>
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

              <div ref={loadMoreRef} className="infinite-scroll-sentinel" aria-hidden="true" />

              {loadingMore && (
                <div className="loading-more-state">
                  <div className="loading-spinner loading-spinner-small"></div>
                  <p>Cargando más propiedades...</p>
                </div>
              )}

              {!hasMore && properties.length > 0 && (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '1rem 0 0',
                  color: '#64748b'
                }}>
                  <p>No hay mas propiedades para cargar</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}