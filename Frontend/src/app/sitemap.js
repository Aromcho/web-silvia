// Sitemap con las secciones y TODAS las fichas disponibles (W6). Se rearma cada hora.
export const revalidate = 3600

const baseUrl = 'https://www.silviafernandezpropiedades.com.ar'
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
    { url: `${baseUrl}/alquiler-temporario`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/lotes-terrenos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/complejos`, lastModified: now, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${baseUrl}/videos`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${baseUrl}/mapa`, lastModified: now, changeFrequency: 'weekly', priority: 0.5 },
    { url: `${baseUrl}/nosotros`, lastModified: now, changeFrequency: 'monthly', priority: 0.4 },
  ]
  return [...sections, ...(await propertyEntries())]
}