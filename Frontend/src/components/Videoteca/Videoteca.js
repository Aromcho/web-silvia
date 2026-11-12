'use client'

// Videoteca (/videos): todas las propiedades con video en un solo lugar. Sirve a los clientes para
// recorrer en video y al equipo para mandar el video correcto por WhatsApp en dos toques.
// Los videos se cargan una sola vez en el CRM (YouTube, reel de Instagram o MP4).

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { FaPlay, FaWhatsapp, FaLink, FaCheck, FaSearch, FaMapMarkerAlt } from 'react-icons/fa'
import { getPropertiesWithVideos } from '../../services/propertyService'
import '../../app/lotes-terrenos/page.css'
import {
  formatOperationPrice,
  formatPropertyLocation,
  formatDistanceToSea,
  getCoverPhoto,
  getPropertyVideos,
  tidyPlaceName,
  VIDEO_KIND_LABEL,
} from '../../helpers/index.js'
import './Videoteca.css'

const SITE = 'https://www.silviafernandezpropiedades.com.ar'

const TABS = [
  { key: 'todas', label: 'Todas' },
  { key: 'venta', label: 'Venta' },
  { key: 'temporario', label: 'Temporario' },
  { key: 'anual', label: 'Alquiler anual' },
]

const norm = (value) => String(value ?? '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '').trim()

const operationKind = (op) => {
  const t = norm(op?.operation_type)
  if (t.includes('temporar') || t.includes('temporal')) return 'temporario'
  if (t.includes('alquiler') || t === 'rent') return 'anual'
  if (t.includes('venta') || t === 'sale') return 'venta'
  return ''
}

const kindsOf = (property) => new Set((property.operations || []).map(operationKind).filter(Boolean))

const priceFor = (property, tab) => {
  const ops = property.operations || []
  const op = (tab !== 'todas' && ops.find((o) => operationKind(o) === tab)) || ops[0]
  return formatOperationPrice(op)
}

const placeOf = (property) => tidyPlaceName(property?.location?.name || property?.address?.city || '')

export default function Videoteca() {
  const [state, setState] = useState({ loading: true, error: false, items: [] })
  const [tab, setTab] = useState('todas')
  const [place, setPlace] = useState('')
  const [query, setQuery] = useState('')
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    let cancelled = false
    getPropertiesWithVideos()
      .then((data) => {
        if (cancelled) return
        const items = (Array.isArray(data) ? data : [])
          .map((property) => ({ property, videos: getPropertyVideos(property), kinds: kindsOf(property) }))
          .filter((item) => item.videos.length > 0)
        setState({ loading: false, error: false, items })
      })
      .catch(() => { if (!cancelled) setState({ loading: false, error: true, items: [] }) })
    return () => { cancelled = true }
  }, [])

  const counts = useMemo(() => {
    const c = { todas: state.items.length, venta: 0, temporario: 0, anual: 0 }
    state.items.forEach(({ kinds }) => kinds.forEach((k) => { c[k] += 1 }))
    return c
  }, [state.items])

  const places = useMemo(() => {
    const map = new Map()
    state.items.forEach(({ property, kinds }) => {
      if (tab !== 'todas' && !kinds.has(tab)) return
      const p = placeOf(property)
      if (p) map.set(p, (map.get(p) || 0) + 1)
    })
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [state.items, tab])

  const visible = useMemo(() => {
    const q = norm(query).replace(/^#/, '')
    return state.items.filter(({ property, kinds }) => {
      if (tab !== 'todas' && !kinds.has(tab)) return false
      if (place && placeOf(property) !== place) return false
      if (!q) return true
      if (/^\d+$/.test(q)) return String(property.id).includes(q)
      return norm(`${property.publication_title} ${placeOf(property)} ${property.type?.name}`).includes(q)
    })
  }, [state.items, tab, place, query])

  useEffect(() => {
    if (place && !places.some(([p]) => p === place)) setPlace('')
  }, [places, place])

  const shortLink = (id) => `${SITE}/v/${id}`

  const copyLink = async (id) => {
    const url = shortLink(id)
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = url
      document.body.appendChild(ta)
      ta.select()
      try { document.execCommand('copy') } catch { /* sin portapapeles */ }
      ta.remove()
    }
    setCopiedId(id)
    setTimeout(() => setCopiedId((current) => (current === id ? null : current)), 1800)
  }

  const whatsappHref = (property) => {
    const title = property.publication_title || 'esta propiedad'
    const text = `Te paso el video de ${title} 🎥\n${shortLink(property.id)}`
    return `https://wa.me/?text=${encodeURIComponent(text)}`
  }

  return (
    <main className="vt-page">
      <div className="page-hero">
        <div className="container">
          <h1>Videos de propiedades</h1>
          <p>Recorré las propiedades en video antes de visitarlas</p>
        </div>
      </div>

      <section className="vt-container vt-body">
        <div className="vt-toolbar">
          <div className="vt-tabs" role="tablist" aria-label="Tipo de operación">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`vt-tab${tab === t.key ? ' is-active' : ''}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                <span className="vt-tab-count">{counts[t.key] || 0}</span>
              </button>
            ))}
          </div>
          <div className="vt-filters">
            <label className="vt-field">
              <FaMapMarkerAlt aria-hidden="true" />
              <select value={place} onChange={(ev) => setPlace(ev.target.value)} aria-label="Zona">
                <option value="">Todas las zonas</option>
                {places.map(([p, n]) => (
                  <option key={p} value={p}>{p} ({n})</option>
                ))}
              </select>
            </label>
            <label className="vt-field vt-field--search">
              <FaSearch aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(ev) => setQuery(ev.target.value)}
                placeholder="Buscar por ID o nombre"
                aria-label="Buscar por ID o nombre"
                inputMode="search"
              />
            </label>
          </div>
        </div>

        {state.loading ? (
          <div className="vt-grid" aria-busy="true">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="vt-card vt-card--skeleton" aria-hidden="true">
                <div className="vt-thumb" />
                <div className="vt-info">
                  <div className="vt-skel-line" />
                  <div className="vt-skel-line vt-skel-line--short" />
                </div>
              </div>
            ))}
          </div>
        ) : state.error ? (
          <p className="vt-empty">No pudimos cargar los videos. Probá de nuevo en un rato.</p>
        ) : visible.length === 0 ? (
          <p className="vt-empty">
            {query || place ? 'No hay videos con esos filtros.' : 'Todavía no hay videos en esta sección.'}
          </p>
        ) : (
          <>
            <p className="vt-results">
              {visible.length} {visible.length === 1 ? 'propiedad' : 'propiedades'} con video
            </p>
            <div className="vt-grid">
              {visible.map(({ property, videos }) => {
                const cover = getCoverPhoto(property) || '/assets/images/logo.jpg'
                const first = videos[0]
                const sea = formatDistanceToSea(property.distanciaMar)
                const href = `/propiedad/${property.id}?video=1`
                return (
                  <article key={property.id} className="vt-card">
                    <Link href={href} className="vt-thumb" aria-label={`Ver el video de ${property.publication_title || `la propiedad #${property.id}`}`}>
                      <img
                        src={first.thumb || cover}
                        alt=""
                        loading="lazy"
                        onError={(ev) => { if (!ev.currentTarget.src.endsWith(cover)) ev.currentTarget.src = cover }}
                      />
                      <span className="vt-play"><FaPlay /></span>
                      <span className={`vt-badge vt-badge--${first.kind}`}>{VIDEO_KIND_LABEL[first.kind]}</span>
                      {videos.length > 1 && <span className="vt-badge vt-badge--count">{videos.length} videos</span>}
                    </Link>
                    <div className="vt-info">
                      <div className="vt-meta">
                        <span className="vt-id">#{property.id}</span>
                        <span className="vt-place">{formatPropertyLocation(property)}</span>
                      </div>
                      <h2 className="vt-name">
                        <Link href={href}>{property.publication_title || property.type?.name || 'Propiedad'}</Link>
                      </h2>
                      <div className="vt-facts">
                        <span className="vt-price">{priceFor(property, tab)}</span>
                        {sea && <span className="vt-sea">{sea} del mar</span>}
                      </div>
                      <div className="vt-actions">
                        <a
                          className="vt-btn vt-btn--whatsapp"
                          href={whatsappHref(property)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <FaWhatsapp aria-hidden="true" /> Enviar
                        </a>
                        <button type="button" className="vt-btn vt-btn--ghost" onClick={() => copyLink(property.id)}>
                          {copiedId === property.id ? <FaCheck aria-hidden="true" /> : <FaLink aria-hidden="true" />}
                          {copiedId === property.id ? '¡Copiado!' : 'Copiar link'}
                        </button>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </section>
    </main>
  )
}
