'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { getProperties, autocompleteProperties } from '../../services/propertyService'
import PropertyCard from '../PropertyCard/PropertyCard'
import GuestsFilter, { MAX_GUESTS, guestsText } from '../GuestsFilter/GuestsFilter'
import {
  getListSnapshot,
  isPropertyCardClick,
  restoreWindowScroll,
  saveListSnapshot,
  slimPropertiesForSnapshot,
  useIsomorphicLayoutEffect,
} from '../../helpers/listRestore'
import { 
  FaHome, 
  FaBuilding, 
  FaStore, 
  FaMapMarkerAlt, 
  FaTh,
  FaList
} from 'react-icons/fa'
import './PropertiesSearchNew.css'

const PAGE_SIZE = 12
const FILTER_DEBOUNCE_MS = 250
const SEARCH_CACHE_KEY_PREFIX = 'silvia-search-properties-cache-v2'
const CACHE_TTL_MS = 60 * 1000 // 1 minuto

let cachedSearchResults = null

const OPERATION_QUERY_MAP = {
  venta: ['Venta', 'Sale'],
  alquiler: ['Alquiler', 'Rent', 'Alquiler temporal', 'Alquiler Temporario'],
  alquiler_temporal: ['Alquiler', 'Alquiler temporal', 'Alquiler Temporario', 'Temporary Rent'],
}

const PROPERTY_TYPE_QUERY_MAP = {
  Casa: ['Casa', 'Casas', 'House'],
  Departamento: ['Departamento', 'Departamentos', 'Apartment', 'Flat'],
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
  if (sort === 'price_asc') return 'price_asc'
  if (sort === 'price_desc') return 'price_desc'
  return 'recent'
}

const safeStorageGet = (key) => {
  if (typeof window === 'undefined') return null

  try {
    return window.sessionStorage.getItem(key)
  } catch (error) {
    console.warn('No se pudo leer el cache de busqueda:', error)
    return null
  }
}

const safeStorageSet = (key, value) => {
  if (typeof window === 'undefined') return

  try {
    window.sessionStorage.setItem(key, value)
  } catch (error) {
    console.warn('No se pudo guardar el cache de busqueda:', error)
  }
}

const buildSearchCacheKey = (filtersSnapshot) => {
  return `${SEARCH_CACHE_KEY_PREFIX}:${JSON.stringify({
    operation: filtersSnapshot.operation || '',
    type: filtersSnapshot.type || '',
    location: filtersSnapshot.location || '',
    sort: filtersSnapshot.sort || 'recent',
    guests: filtersSnapshot.guests || 0,
  })}`
}

const isCacheExpired = (entry) => {
  if (!entry?.timestamp) return true
  return Date.now() - entry.timestamp > CACHE_TTL_MS
}

const readSearchCache = (cacheKey) => {
  const memEntry = cachedSearchResults?.[cacheKey]
  if (memEntry && !isCacheExpired(memEntry)) {
    return memEntry
  }

  const rawValue = safeStorageGet(cacheKey)
  if (!rawValue) return null

  try {
    const parsedValue = JSON.parse(rawValue)
    if (isCacheExpired(parsedValue)) return null
    cachedSearchResults = cachedSearchResults || {}
    cachedSearchResults[cacheKey] = parsedValue
    return parsedValue
  } catch (error) {
    console.warn('No se pudo parsear el cache de busqueda:', error)
    return null
  }
}

const SORT_OPTIONS = ['recent', 'price_desc', 'price_asc']

// Filtros a partir de la URL (?operation=alquiler&type=Casa&location=...&personas=4&orden=price_asc)
const filtersFromParams = (params) => {
  const operation = params.get('operation') || 'venta'
  const sort = params.get('orden')
  return {
    operation,
    type: params.get('type') || '',
    location: params.get('location') || '',
    sort: SORT_OPTIONS.includes(sort) ? sort : 'recent',
    // Cantidad de personas: solo aplica con la operación "alquiler"
    guests: operation === 'alquiler' ? Math.min(parseInt(params.get('personas'), 10) || 0, MAX_GUESTS) : 0,
  }
}

// Escribe los filtros aplicados en la URL actual (sin agregar entradas al historial)
const writeFiltersToUrl = (filtersSnapshot) => {
  const url = new URL(window.location.href)
  const setParam = (key, value) => {
    if (value) url.searchParams.set(key, value)
    else url.searchParams.delete(key)
  }

  setParam('operation', filtersSnapshot.operation)
  setParam('type', filtersSnapshot.type)
  setParam('location', filtersSnapshot.location.trim())
  setParam('personas', filtersSnapshot.operation === 'alquiler' && filtersSnapshot.guests > 0 ? String(filtersSnapshot.guests) : '')
  setParam('orden', filtersSnapshot.sort !== 'recent' ? filtersSnapshot.sort : '')

  const nextSearch = url.searchParams.toString()
  if (url.search !== window.location.search) {
    window.history.replaceState(null, '', url)
  }
  return nextSearch
}

const writeSearchCache = (cacheKey, value) => {
  const entry = { ...value, timestamp: Date.now() }
  cachedSearchResults = cachedSearchResults || {}
  cachedSearchResults[cacheKey] = entry
  safeStorageSet(cacheKey, JSON.stringify(entry))
}

export default function PropertiesSearchNew() {
  const searchParams = useSearchParams()
  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  // Los filtros viven en la URL: al volver atrás desde una ficha se recuperan (antes volvía a "Comprar")
  const [filters, setFilters] = useState(() => filtersFromParams(searchParams))
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [viewMode, setViewMode] = useState('grid')
  const [suggestions, setSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const suggestionsRef = useRef(null)
  const loadMoreRef = useRef(null)
  const requestIdRef = useRef(0)
  const cacheKeyRef = useRef(buildSearchCacheKey(filters))
  // Último query string que escribimos nosotros (o con el que se entró). Si la URL pasa a otro
  // (ej. "Propiedades" del header estando en /propiedades?operation=alquiler), se adoptan esos filtros.
  const lastSearchRef = useRef(null)
  const appliedFiltersRef = useRef(appliedFilters)
  appliedFiltersRef.current = appliedFilters
  const isFirstUrlSyncRef = useRef(true)
  // Clave de filtros restaurada desde la foto de "volver atrás": mientras coincida, no se recarga
  const restoredKeyRef = useRef(null)
  const [pendingScrollY, setPendingScrollY] = useState(null)
  // Al restaurar no se repite la animación de entrada (con delays de hasta varios segundos por card)
  const [skipEnterAnimation, setSkipEnterAnimation] = useState(false)

  // Volver atrás desde una ficha: se arma el listado desde la foto antes del primer pintado
  useIsomorphicLayoutEffect(() => {
    const cacheKey = buildSearchCacheKey(appliedFilters)
    const snapshot = getListSnapshot(cacheKey)
    if (!snapshot) return

    restoredKeyRef.current = cacheKey
    setProperties(snapshot.properties || [])
    setTotalCount(snapshot.totalCount || 0)
    setPage(snapshot.page || 0)
    setHasMore(Boolean(snapshot.hasMore))
    if (snapshot.viewMode === 'list' || snapshot.viewMode === 'grid') setViewMode(snapshot.viewMode)
    setSkipEnterAnimation(true)
    setLoading(false)
    setLoadingMore(false)
    setPendingScrollY(snapshot.scrollY)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (pendingScrollY === null) return
    restoreWindowScroll(pendingScrollY)
    setPendingScrollY(null)
  }, [pendingScrollY])

  // Filtros aplicados -> URL (replaceState: cambiar filtros no agrega pasos al botón atrás).
  // En el montaje no se escribe: los filtros salen de la URL, que ya está bien.
  useEffect(() => {
    if (isFirstUrlSyncRef.current) {
      isFirstUrlSyncRef.current = false
      lastSearchRef.current = searchParams.toString()
      return
    }
    lastSearchRef.current = writeFiltersToUrl(appliedFilters)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters])

  // La URL cambió desde afuera estando en /propiedades (ej. "Propiedades" del header): adoptarla
  useEffect(() => {
    const currentSearch = searchParams.toString()
    if (lastSearchRef.current === null || currentSearch === lastSearchRef.current) return

    lastSearchRef.current = currentSearch
    const next = filtersFromParams(searchParams)
    if (buildSearchCacheKey(next) === buildSearchCacheKey(appliedFiltersRef.current)) return
    setFilters(next)
    setAppliedFilters(next)
  }, [searchParams])

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

    if (filtersSnapshot.operation === 'alquiler' && filtersSnapshot.guests > 0) {
      apiFilters.minGuests = filtersSnapshot.guests
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
          const deduped = dedupeProperties(merged)

          writeSearchCache(cacheKeyRef.current, {
            properties: deduped,
            totalCount: total,
            page: pageToLoad,
            hasMore: nextProperties.length === PAGE_SIZE && (pageToLoad + 1) * PAGE_SIZE < total,
          })

          return deduped
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
    const cacheKey = buildSearchCacheKey(appliedFilters)
    cacheKeyRef.current = cacheKey

    if (restoredKeyRef.current === cacheKey) {
      return undefined
    }
    restoredKeyRef.current = null
    setSkipEnterAnimation(false)

    const cachedData = readSearchCache(cacheKey)
    if (cachedData) {
      setProperties(cachedData.properties || [])
      setTotalCount(cachedData.totalCount || 0)
      setPage(cachedData.page || 0)
      setHasMore(Boolean(cachedData.hasMore))
      setLoading(false)
      setLoadingMore(false)
      return undefined
    }

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
      [key]: value,
      // El filtro de personas no aplica a venta: se limpia al cambiar de operación
      ...(key === 'operation' && value !== 'alquiler' ? { guests: 0 } : {})
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

  const handleResultsClickCapture = (event) => {
    if (!isPropertyCardClick(event)) return
    saveListSnapshot({
      listKey: cacheKeyRef.current,
      properties: slimPropertiesForSnapshot(properties),
      totalCount,
      page,
      hasMore,
      viewMode,
    })
  }

  const renderSkeletonGrid = (count = 6) => (
    <div className="loading-grid search-loading-grid">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="property-skeleton">
          <div className="skeleton-image"></div>
          <div className="skeleton-content">
            <div className="skeleton-title"></div>
            <div className="skeleton-price"></div>
            <div className="skeleton-details"></div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className="search-page">

      <div className="search-container">
        {/* Filtros modernos */}
        <div className="filters-section">
          <h2 className="filters-title">Encontrá tu propiedad ideal</h2>
          
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

          {/* Cantidad de personas — solo para alquiler */}
          {filters.operation === 'alquiler' && (
            <div className="guests-filter-row">
              <GuestsFilter value={filters.guests} onChange={(n) => handleFilterChange('guests', n)} />
              {filters.guests > 0 && (
                <p className="guests-filter-hint">
                  Mostrando alquileres temporarios con capacidad para {guestsText(filters.guests)} o más.
                </p>
              )}
            </div>
          )}

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

          {/* Select para tipos de propiedad - Solo visible en mobile */}
          <div className="property-types-mobile">
            <select 
              className="property-type-select"
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">Todos los tipos</option>
              <option value="Casa">Casa</option>
              <option value="Departamento">Departamento</option>
              <option value="Terreno">Terreno</option>
              <option value="Local">Local</option>
              <option value="Complejo">Complejo</option>
            </select>
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
        <div className="results-section" onClickCapture={handleResultsClickCapture}>
          <div className="results-header">
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
            renderSkeletonGrid(6)
          ) : (
            <>
              <div className={`properties-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
                {properties.length > 0 ? (
                  properties.map((property, index) => (
                    <div 
                      key={property.id || index}
                      style={skipEnterAnimation ? undefined : {
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <PropertyCard property={property} />
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
                      {filters.operation === 'alquiler' && filters.guests > 0
                        ? `No encontramos alquileres para ${guestsText(filters.guests)} o más`
                        : 'No se encontraron propiedades con los filtros seleccionados'}
                    </p>
                    <p>Intenta ajustar los filtros para obtener más resultados</p>
                    {filters.operation === 'alquiler' && filters.guests > 0 && (
                      <button type="button" className="guests-filter-reset" onClick={() => handleFilterChange('guests', 0)}>
                        Quitar filtro de personas
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div ref={loadMoreRef} className="infinite-scroll-sentinel" aria-hidden="true" />

              {loadingMore && (
                <div className="loading-more-state">
                  {renderSkeletonGrid(3)}
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