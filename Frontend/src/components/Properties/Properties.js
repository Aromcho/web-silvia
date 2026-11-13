'use client'

import React, { useEffect, useRef, useState } from 'react'
import { FaChevronLeft, FaChevronRight, FaStar } from 'react-icons/fa'
import { getProperties } from '../../services/propertyService'
import PropertyCard from '../PropertyCard/PropertyCard'
import {
  getListSnapshot,
  isPropertyCardClick,
  restoreWindowScroll,
  saveListSnapshot,
  setScrollLeftInstant,
  slimPropertiesForSnapshot,
  useIsomorphicLayoutEffect,
} from '../../helpers/listRestore'
import './Properties.css'

const HOME_PROPERTIES_CACHE_KEY = 'silvia-home-properties-cache-v2'
const CACHE_TTL_MS = 60 * 1000 // 1 minuto
let cachedSectionsData = null

const isCacheExpired = (entry) => {
  if (!entry?.timestamp) return true
  return Date.now() - entry.timestamp > CACHE_TTL_MS
}

const readCachedSectionsData = () => {
  if (cachedSectionsData && !isCacheExpired(cachedSectionsData)) {
    return cachedSectionsData
  }

  if (typeof window === 'undefined') {
    return null
  }

  try {
    const rawValue = window.sessionStorage.getItem(HOME_PROPERTIES_CACHE_KEY)
    if (!rawValue) {
      return null
    }

    const parsed = JSON.parse(rawValue)
    if (isCacheExpired(parsed)) return null
    cachedSectionsData = parsed
    return cachedSectionsData
  } catch (error) {
    console.warn('No se pudo leer el cache de propiedades del home:', error)
    return null
  }
}

const writeCachedSectionsData = (sectionsData) => {
  const entry = { ...sectionsData, timestamp: Date.now() }
  cachedSectionsData = entry

  if (typeof window === 'undefined') {
    return
  }

  try {
    window.sessionStorage.setItem(HOME_PROPERTIES_CACHE_KEY, JSON.stringify(entry))
  } catch (error) {
    console.warn('No se pudo guardar el cache de propiedades del home:', error)
  }
}

// Fuera de Properties: si se define adentro, cada render crea un componente nuevo y React
// remonta los carruseles (se pierde su scroll horizontal).
const PropertySection = ({ title, type, properties, featured = false, onScroll, registerScroller }) => {
  if (!properties || properties.length === 0) return null

  return (
    <div className={`property-section${featured ? ' property-section--featured' : ''}`}>
      <div className="section-surface">
        {featured && (
          <div className="featured-stars" aria-label="Selección destacada con cinco estrellas">
            {[...Array(5)].map((_, index) => (
              <FaStar key={index} />
            ))}
          </div>
        )}

        <div className="section-header">
          <div className="section-heading">
            <h2 className="section-title">{title}</h2>
          </div>
        </div>

        <div className={`carousel-shell${featured ? ' carousel-shell--featured' : ''}`}>
          {!featured && (
            <>
              <button
                type="button"
                className="carousel-arrow carousel-arrow--left"
                onClick={() => onScroll(type, 'prev')}
                aria-label={`Ver propiedades anteriores de ${title}`}
              >
                <FaChevronLeft />
              </button>
              <button
                type="button"
                className="carousel-arrow carousel-arrow--right"
                onClick={() => onScroll(type, 'next')}
                aria-label={`Ver siguientes propiedades de ${title}`}
              >
                <FaChevronRight />
              </button>
            </>
          )}

          <div className={`properties-scroll-container${featured ? ' featured-carousel' : ''}`} ref={(node) => registerScroller(type, node)}>
            <div className={`properties-grid${featured ? ' featured-track' : ''}`}>
              <div className="properties-group">
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
              {featured && (
                <div className="properties-group" aria-hidden="true">
                  {properties.map((property) => (
                    <PropertyCard key={`${property.id}-clone`} property={property} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Properties() {
  const sectionScrollerRefs = useRef({})
  const [sectionsData, setSectionsData] = useState({
    destacadas: [],
    'alquiler-temporario': [],
    casas: [],
    departamentos: [],
    terrenos: []
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  // Volver atrás desde una ficha: scroll vertical y de cada carrusel a restaurar después de pintar
  const restoredRef = useRef(false)
  const [pendingScroll, setPendingScroll] = useState(null)

  useIsomorphicLayoutEffect(() => {
    const snapshot = getListSnapshot(HOME_PROPERTIES_CACHE_KEY)
    if (!snapshot?.sectionsData) return

    restoredRef.current = true
    setSectionsData(snapshot.sectionsData)
    setError(null)
    setLoading(false)
    setPendingScroll({ y: snapshot.scrollY, carousels: snapshot.carousels || {} })
  }, [])

  useIsomorphicLayoutEffect(() => {
    if (!pendingScroll) return
    Object.entries(pendingScroll.carousels).forEach(([type, left]) => {
      setScrollLeftInstant(sectionScrollerRefs.current[type], left)
    })
    restoreWindowScroll(pendingScroll.y)
    setPendingScroll(null)
  }, [pendingScroll])

  useEffect(() => {
    if (restoredRef.current) return undefined

    const cachedData = readCachedSectionsData()

    if (cachedData) {
      setSectionsData(cachedData)
      setLoading(false)
      return undefined
    }

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

        writeCachedSectionsData({
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

      if (type === 'destacadas') {
        return await fetchAllStarred()
      }

      let apiFilters = {
        limit: 6,
        offset: 0,
        order: 'DESC'
      }

      switch (type) {
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

  const fetchAllStarred = async () => {
    const PAGE_SIZE = 100
    const first = await getProperties({ is_starred: true, limit: PAGE_SIZE, offset: 0, order: 'DESC' })
    const all = first.objects || []
    const total = first.meta?.total_count || all.length

    let offset = PAGE_SIZE
    while (all.length < total) {
      const batch = await getProperties({ is_starred: true, limit: PAGE_SIZE, offset, order: 'DESC' })
      const items = batch.objects || []
      if (items.length === 0) break
      all.push(...items)
      offset += PAGE_SIZE
    }

    console.log(`destacadas total fetched: ${all.length} / ${total}`)
    return all
  }

  const registerScroller = (type, node) => {
    if (node) {
      sectionScrollerRefs.current[type] = node
    }
  }

  // Al tocar una card se guarda la foto de la home (secciones cargadas + scroll de cada carrusel)
  const handleClickCapture = (event) => {
    if (!isPropertyCardClick(event)) return

    const carousels = {}
    Object.entries(sectionScrollerRefs.current).forEach(([type, node]) => {
      if (node && node.scrollLeft > 0) carousels[type] = node.scrollLeft
    })
    const slimSections = Object.fromEntries(
      Object.entries(sectionsData).map(([type, list]) => [type, Array.isArray(list) ? slimPropertiesForSnapshot(list) : list])
    )
    saveListSnapshot({ listKey: HOME_PROPERTIES_CACHE_KEY, sectionsData: slimSections, carousels })
  }

  const scrollSection = (type, direction = 'next') => {
    const container = sectionScrollerRefs.current[type]

    if (!container) {
      return
    }

    const firstCard = container.querySelector('.modern-property-card')
    const cardWidth = firstCard ? firstCard.getBoundingClientRect().width : 359
    const computedGap = 16

    const scrollAmount = cardWidth + computedGap
    const offset = direction === 'prev' ? -scrollAmount : scrollAmount

    container.scrollBy({
      left: offset,
      behavior: 'smooth'
    })
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
      title: 'Nuestra selección',
      type: 'destacadas',
      properties: sectionsData.destacadas,
      featured: true
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
    <section className="properties-section" onClickCapture={handleClickCapture}>
      <div className="container">
        {sections.map((section) => (
          <PropertySection
            key={section.type}
            title={section.title}
            type={section.type}
            properties={section.properties}
            featured={section.featured}
            onScroll={scrollSection}
            registerScroller={registerScroller}
          />
        ))}
      </div>
    </section>
  )
}