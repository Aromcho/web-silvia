'use client'

import { useEffect, useState, useRef } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import './mapa.css'

const MapView = dynamic(() => import('./MapView'), { ssr: false })

const API_BASE = 'https://www.silviafernandezpropiedades.com.ar/api'

const FILTERS = [
  { value: 'all',          label: 'Todas' },
  { value: 'Casa',         label: 'Casas' },
  { value: 'Terreno',      label: 'Terrenos' },
  { value: 'Departamento', label: 'Departamentos' },
  { value: 'Hotel',        label: 'Complejos' },
]

export default function MapaClient({ initialLocations = [] }) {
  const [locations, setLocations] = useState(initialLocations)
  const [loadingMarkers, setLoadingMarkers] = useState(false)
  const [filter, setFilter] = useState('all')
  const [activeId, setActiveId] = useState(null)
  const activeItemRef = useRef(null)

  // Solo fetchea cuando el usuario cambia el filtro (no en la carga inicial)
  useEffect(() => {
    if (filter === 'all') {
      setLocations(initialLocations)
      return
    }

    let cancelled = false
    setLoadingMarkers(true)

    fetch(`${API_BASE}/locations?property_type=${filter}`)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setLocations(Array.isArray(data) ? data : [])
      })
      .catch(() => { if (!cancelled) setLocations([]) })
      .finally(() => { if (!cancelled) setLoadingMarkers(false) })

    return () => { cancelled = true }
  }, [filter])

  useEffect(() => {
    if (activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [activeId])

  return (
    <div className="mapa-page">
      <div className="mapa-header">
        <div className="container">
          <h1>Mapa de Propiedades</h1>
          <p>Explorá todas nuestras propiedades en Mar Azul y alrededores</p>
          <div className="mapa-filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-btn${filter === f.value ? ' active' : ''}`}
                onClick={() => { setFilter(f.value); setActiveId(null) }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mapa-body container">
        <div className="mapa-layout">

          <aside className="mapa-sidebar">
            <p className="sidebar-count">
              {loadingMarkers
                ? 'Cargando…'
                : `${locations.length} ${locations.length === 1 ? 'propiedad' : 'propiedades'}`}
            </p>
            <div className="sidebar-list">
              {loadingMarkers ? (
                <div className="sidebar-skeleton">
                  {[...Array(6)].map((_, i) => <div key={i} className="skeleton-item" />)}
                </div>
              ) : locations.length === 0 ? (
                <p className="sidebar-empty">No hay propiedades para este filtro.</p>
              ) : (
                locations.map((loc) => (
                  <div
                    key={loc.id}
                    ref={activeId === loc.id ? activeItemRef : null}
                    className={`sidebar-item${activeId === loc.id ? ' active' : ''}`}
                    onClick={() => setActiveId(loc.id)}
                  >
                    {loc.photo && (
                      <img src={loc.photo} alt={loc.address} className="sidebar-img" loading="lazy" />
                    )}
                    <div className="sidebar-info">
                      <p className="sidebar-name">{loc.name}</p>
                      <p className="sidebar-address">{loc.address}</p>
                      <Link href={`/propiedad/${loc.id}`} className="sidebar-link">
                        Ver detalles →
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>

          <div className="mapa-map">
            <MapView
              locations={locations}
              activeId={activeId}
              onMarkerClick={setActiveId}
            />
            {loadingMarkers && (
              <div className="map-markers-loading">
                <div className="mapa-spinner" />
                <span>Cargando marcadores…</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
