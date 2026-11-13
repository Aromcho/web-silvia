import { useEffect, useLayoutEffect } from 'react'
import { getCoverPhoto } from './index.js'

// Restauración de listados al volver atrás desde una ficha.
//
// Al tocar una propiedad en un listado se guarda una "foto" (propiedades cargadas, página,
// scroll, etc.) con la URL del listado como clave. Si después se vuelve con atrás/adelante
// del navegador, el listado se arma desde esa foto en vez de recargar desde la página 1,
// y la página vuelve al mismo lugar. Si se entra al listado desde un link (menú, hero, etc.)
// la foto se ignora y el listado arranca de cero como siempre.
//
// Es independiente del caché de 60 s de cada listado (ese es solo para frescura de datos).

const STORAGE_KEY = 'silvia-list-snapshots-v1'
const SNAPSHOT_TTL_MS = 30 * 60 * 1000 // 30 minutos
const MAX_SNAPSHOTS = 3
// Ventana para considerar que el listado se montó por un atrás/adelante (popstate)
const HISTORY_TRAVERSAL_WINDOW_MS = 2000

let lastHistoryTraversalAt = 0

if (typeof window !== 'undefined') {
  window.addEventListener('popstate', () => {
    lastHistoryTraversalAt = Date.now()
  })

  // Carga completa de la página desde atrás/adelante (sin bfcache)
  try {
    const [navigationEntry] = window.performance.getEntriesByType('navigation')
    if (navigationEntry?.type === 'back_forward') {
      lastHistoryTraversalAt = Date.now()
    }
  } catch {
    // Navegadores sin Navigation Timing: solo se usa popstate
  }
}

// useLayoutEffect en el cliente (restaura antes de pintar), useEffect en el servidor (evita el warning de SSR)
export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

const isHistoryTraversal = () => Date.now() - lastHistoryTraversalAt < HISTORY_TRAVERSAL_WINDOW_MS

const getCurrentListUrl = () => `${window.location.pathname}${window.location.search}`

const readAll = () => {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

const writeAll = (snapshots) => {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshots))
    return true
  } catch {
    return false
  }
}

// Campos pesados que la card no usa (las fotos son ~75 % del peso de cada propiedad)
const FIELDS_NOT_USED_BY_CARD = ['description', 'rich_description', 'branch', 'producer']

/**
 * Versión liviana de las propiedades para la foto: lo que necesita PropertyCard, con la
 * portada como única foto (getCoverPhoto devuelve la misma imagen que con todas las fotos).
 */
export const slimPropertiesForSnapshot = (properties) => (Array.isArray(properties) ? properties : []).map((property) => {
  const slim = { ...property }
  FIELDS_NOT_USED_BY_CARD.forEach((field) => { delete slim[field] })
  const cover = getCoverPhoto(property)
  slim.photos = cover ? [{ image: cover, is_front_cover: true }] : []
  return slim
})

/**
 * Guarda la foto del listado actual. `data` debe incluir `listKey` (la clave de filtros del
 * listado) para no restaurar una foto que no corresponde a los filtros que se están mostrando.
 */
export const saveListSnapshot = (data) => {
  if (typeof window === 'undefined') return

  const url = getCurrentListUrl()
  const entry = { ...data, scrollY: window.scrollY, savedAt: Date.now() }

  // Se guardan las últimas MAX_SNAPSHOTS fotos (una por URL)
  const kept = Object.entries(readAll())
    .filter(([key, value]) => key !== url && Date.now() - (value?.savedAt || 0) < SNAPSHOT_TTL_MS)
    .sort(([, a], [, b]) => b.savedAt - a.savedAt)
    .slice(0, MAX_SNAPSHOTS - 1)

  const snapshots = Object.fromEntries([[url, entry], ...kept])
  // Si sessionStorage está lleno, se guarda solo la foto actual
  if (!writeAll(snapshots)) writeAll({ [url]: entry })
}

/**
 * Devuelve la foto del listado actual solo si se llegó con atrás/adelante, la foto es
 * reciente y corresponde a los mismos filtros (`listKey`). En cualquier otro caso, null.
 */
export const getListSnapshot = (listKey) => {
  if (typeof window === 'undefined' || !isHistoryTraversal()) return null

  const entry = readAll()[getCurrentListUrl()]
  if (!entry || entry.listKey !== listKey) return null
  if (Date.now() - (entry.savedAt || 0) > SNAPSHOT_TTL_MS) return null

  return entry
}

/**
 * Lleva la página al scroll guardado. Se reaplica en los dos frames siguientes por si el
 * navegador intenta restaurar su propia posición (calculada con la página todavía corta).
 */
export const restoreWindowScroll = (y) => {
  if (typeof window === 'undefined' || !Number.isFinite(y)) return

  const apply = () => window.scrollTo(0, y)
  apply()
  window.requestAnimationFrame(() => {
    apply()
    window.requestAnimationFrame(apply)
  })
}

/** Scroll horizontal sin animación (los carruseles tienen scroll-behavior: smooth). */
export const setScrollLeftInstant = (element, left) => {
  if (!element || !Number.isFinite(left)) return

  try {
    element.scrollTo({ left, behavior: 'instant' })
  } catch {
    element.scrollLeft = left
  }
}

/** true si el click fue sobre una card de propiedad (o algo adentro de ella). */
export const isPropertyCardClick = (event) => Boolean(event.target?.closest?.('a.modern-property-card'))
