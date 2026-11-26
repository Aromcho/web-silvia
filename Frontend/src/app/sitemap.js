// Sitemap con las secciones, las páginas por zona con resultados y TODAS las fichas disponibles (W6).
// Se rearma cada hora.
import { ZONE_SLUGS, LANDING_TYPE_SLUGS, fetchLanding, landingPath } from '../helpers/landings.js'

export const revalidate = 3600

const baseUrl = 'https://www.silviafernandezpropiedades.com.ar'

// Solo las combinaciones tipo + zona que tienen propiedades (las vacías no se indexan)
async function landingEntries() {
  const combos = LANDING_TYPE_SLUGS.flatMap((typeKey) => ZONE_SLUGS.map((zoneKey) => ({ typeKey, zoneKey })))
  const results = await Promise.all(
    combos.map(async ({ typeKey, zoneKey }) => {
      try {
        const { total } = await fetchLanding(typeKey, zoneKey, { limit: 1 })
        return total > 0 ? { typeKey, zoneKey } : null
      } catch {
        return null
      }
    })
  )
  const now = new Date()
  return results.filter(Boolean).map(({ typeKey, zoneKey }) => ({
    url: `${baseUrl}${landingPath(typeKey, zoneKey)}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.85,
  }))
}
const API = process.env.PROPERTY_API_INTERNAL_URL || 'http://localhost:3001/api/property'

async function propertyEntries() {
  try {
    const res = await fetch(`${API}/sitemap`, { next: { revalidate: 3600 } })
    if (!res.ok) return []
    const list = await res.json()
    return (Array.isArray(list) ? list : []).map((p) => ({
      url: `${baseUrl}/propiedad/${p.id}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    }))
  } catch {
    return []
  }
}

export default async function sitemap() {
  const now = new Date()
  const sections = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/propiedades`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    // Alquileres, lotes y complejos son el mismo buscador con su filtro (las URLs viejas redirigen acá)
    { url: `${baseUrl}/propiedades?operation=temporario`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/propiedades?type=Terreno`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/propiedades?type=Complejo`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/videos`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]
  const [landings, properties] = await Promise.all([landingEntries(), propertyEntries()])
  return [...sections, ...landings, ...properties]
}