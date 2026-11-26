// Páginas por zona (SEO): «Casas en venta en Mar Azul», «Alquiler temporario en Mar de las Pampas», etc.
// Se arman en el servidor (Google ve las propiedades en el HTML) y apuntan a las búsquedas reales.
import { unstable_cache } from 'next/cache'
import { getCoverPhoto } from './index.js'

export const SITE = 'https://www.silviafernandezpropiedades.com.ar'
export const LANDING_PAGE_SIZE = 24
const API = process.env.PROPERTY_API_INTERNAL_URL || 'http://localhost:3001/api/property'

export const ZONES = {
  'mar-azul': {
    name: 'Mar Azul',
    barrio: 'Mar Azul',
    intro:
      'Mar Azul es la localidad más al sur del partido de Villa Gesell: calles de arena, bosque de pinos que llega casi hasta la playa y un ritmo tranquilo todo el año. Nuestra oficina central está en Calle 34 y Mar del Plata, en pleno centro de Mar Azul.',
  },
  'mar-de-las-pampas': {
    name: 'Mar de las Pampas',
    barrio: 'Mar de las Pampas',
    intro:
      'Mar de las Pampas combina bosque, calles de arena y un centro con paseos gastronómicos y de diseño, a pocas cuadras del mar. Nuestra sucursal boutique está en Av. del Plata y Uritorco, en el centro de Mar de las Pampas.',
  },
  'las-gaviotas': {
    name: 'Las Gaviotas',
    barrio: 'Gaviotas',
    intro:
      'Las Gaviotas está entre Mar de las Pampas y Mar Azul: un barrio residencial y tranquilo, rodeado de bosque, cerca del mar y a minutos de los centros de las dos localidades.',
  },
  'villa-gesell': {
    name: 'Villa Gesell',
    barrio: 'Villa Gesell',
    intro:
      'Villa Gesell es la ciudad cabecera del partido, con servicios todo el año y la vida comercial más activa de la zona, a pocos minutos de Mar de las Pampas y Mar Azul.',
  },
}

export const LANDING_TYPES = {
  venta: {
    path: '/venta',
    h1: (zone) => `Propiedades en venta en ${zone}`,
    title: (zone, s) => `Propiedades en venta en ${zone}${s?.minPrice ? ` desde ${money(s.minPrice)}` : ''}`,
    sale: true,
    short: 'Propiedades en venta',
    parent: { href: '/propiedades', label: 'Propiedades' },
    lead: 'Casas, departamentos, lotes y complejos en venta, con fotos, precio y ubicación. Te asesoramos en toda la operación, desde la visita hasta la escritura.',
    filters: { operation_type: ['Venta'] },
  },
  'casas-en-venta': {
    path: '/casas-en-venta',
    h1: (zone) => `Casas en venta en ${zone}`,
    title: (zone, s) => `Casas en venta en ${zone}${s?.minPrice ? ` desde ${money(s.minPrice)}` : ''}`,
    sale: true,
    noun: 'las casas',
    short: 'Casas en venta',
    parent: { href: '/propiedades', label: 'Propiedades' },
    lead: 'Casas en venta para vivir todo el año, para tus vacaciones o como inversión de renta. Consultá por cualquiera y coordinamos la visita.',
    filters: { operation_type: ['Venta'], property_type: ['Casa', 'Casas'] },
  },
  'lotes-terrenos': {
    path: '/lotes-terrenos',
    h1: (zone) => `Lotes y terrenos en ${zone}`,
    title: (zone, s) => `Lotes y terrenos en venta en ${zone}${s?.minPrice ? ` desde ${money(s.minPrice)}` : ''}`,
    sale: true,
    noun: 'los lotes',
    short: 'Lotes y terrenos',
    parent: { href: '/propiedades?type=Terreno', label: 'Lotes y terrenos' },
    lead: 'Lotes y terrenos para construir tu casa o invertir, con medidas, ubicación y distancia al mar. Te ayudamos a evaluar cada lote antes de comprar.',
    filters: { property_type: ['Terreno', 'Terrenos', 'Lote', 'Lotes'] },
  },
  'alquiler-temporario': {
    path: '/alquiler-temporario',
    h1: (zone) => `Alquiler temporario en ${zone}`,
    title: (zone, s) => `Alquiler temporario en ${zone}${s?.total ? `: ${s.total} casas, cabañas y deptos` : ': casas, cabañas y deptos'}`,
    tempRental: true,
    short: 'Alquiler temporario',
    parent: { href: '/propiedades?operation=alquiler', label: 'Alquileres' },
    lead: 'Casas y cabañas en alquiler temporario para tus vacaciones, con capacidad, distancia al mar y si aceptan mascotas. Consultá disponibilidad por WhatsApp.',
    filters: { operation_type: ['Alquiler temporal', 'Alquiler Temporario', 'Alquiler temporario'] },
  },
  'departamentos-en-venta': {
    path: '/departamentos-en-venta',
    h1: (zone) => `Departamentos en venta en ${zone}`,
    title: (zone, s) => `Departamentos en venta en ${zone}${s?.minPrice ? ` desde ${money(s.minPrice)}` : ''}`,
    sale: true,
    noun: 'los departamentos',
    short: 'Departamentos en venta',
    parent: { href: '/propiedades', label: 'Propiedades' },
    lead: 'Departamentos y dúplex en venta, para vivir, para tus vacaciones o para alquilar en temporada. Consultá por cualquiera y coordinamos la visita.',
    filters: { operation_type: ['Venta'], property_type: ['Departamento', 'Departamentos'] },
  },
  'alquiler-anual': {
    path: '/alquiler-anual',
    h1: (zone) => `Alquiler anual en ${zone}`,
    title: (zone) => `Alquiler anual en ${zone}: casas y departamentos`,
    short: 'Alquiler anual',
    parent: { href: '/propiedades?operation=alquiler', label: 'Alquileres' },
    lead: 'Casas, departamentos y locales en alquiler anual para vivir o trabajar todo el año. Consultá requisitos y disponibilidad por WhatsApp.',
    filters: { operation_type: ['Alquiler anual'] },
  },
}

const money = (n) => `USD ${Math.round(n).toLocaleString('es-AR')}`

export const ZONE_SLUGS = Object.keys(ZONES)
export const LANDING_TYPE_SLUGS = Object.keys(LANDING_TYPES)

export const landingPath = (typeKey, zoneKey, page = 1) =>
  `${LANDING_TYPES[typeKey].path}/${zoneKey}${page > 1 ? `?pagina=${page}` : ''}`

// La card solo necesita la portada: se mandan menos datos al navegador
const slimForCard = (property) => {
  const slim = { ...property }
  ;['description', 'rich_description', 'branch', 'producer'].forEach((field) => { delete slim[field] })
  const cover = getCoverPhoto(property)
  slim.photos = cover ? [{ image: cover, is_front_cover: true }] : []
  return slim
}

export async function fetchLanding(typeKey, zoneKey, { page = 1, limit = LANDING_PAGE_SIZE } = {}) {
  const type = LANDING_TYPES[typeKey]
  const zone = ZONES[zoneKey]
  if (!type || !zone) return { total: 0, items: [] }

  const qs = new URLSearchParams()
  Object.entries(type.filters).forEach(([key, values]) => values.forEach((value) => qs.append(key, value)))
  qs.set('barrio', zone.barrio)
  qs.set('limit', String(limit))
  qs.set('offset', String((page - 1) * limit))
  qs.set('order', 'DESC')

  const res = await fetch(`${API}/properties?${qs.toString()}`, { next: { revalidate: 600 } })
  if (!res.ok) throw new Error(`API ${res.status}`)
  const data = await res.json()
  return {
    total: Number(data?.meta?.total_count) || 0,
    items: (Array.isArray(data?.objects) ? data.objects : []).map(slimForCard),
  }
}

export const parsePage = (raw) => {
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 1 ? n : 1
}

// ---------- Datos reales de cada búsqueda (precios, dormitorios, capacidad, mar) ----------
// Se calculan con todas las propiedades de la zona y se guardan 10 minutos. Alimentan el título
// («desde USD …»), el resumen y las preguntas frecuentes, así cada página tiene contenido propio.

const seaMeters = (raw) => {
  const t = String(raw ?? '').toLowerCase().trim()
  if (!t) return null
  const cuadras = t.match(/(\d+(?:[.,]\d+)?)\s*cuadra/)
  if (cuadras) return Math.round(parseFloat(cuadras[1].replace(',', '.')) * 100)
  const m = t.match(/^(\d+(?:[.,]\d+)?)\s*(m|mts?|metros?)?\.?$/)
  return m ? Math.round(parseFloat(m[1].replace(',', '.'))) : null
}

const typeLabel = (name) => {
  const t = String(name || '').toLowerCase()
  if (/terreno|lote|campo/.test(t)) return 'lotes'
  if (/depart|ph|duplex|dúplex/.test(t)) return 'departamentos'
  if (/complejo|hotel|caba/.test(t)) return 'complejos'
  if (/local|oficina/.test(t)) return 'locales'
  if (/casa|chalet/.test(t)) return 'casas'
  return null
}

function computeStats(items) {
  const prices = []
  const types = {}
  const dorms = {}
  let pets = 0
  let nearSea = 0
  let minGuests = null
  let maxGuests = null
  for (const p of items) {
    const sale = (p.operations || []).find((op) => /venta|sale/i.test(op?.operation_type || ''))
    const price = sale?.prices?.[0]
    if (price && String(price.currency || 'USD').toUpperCase() === 'USD' && Number(price.price) >= 5000) prices.push(Number(price.price))
    const label = typeLabel(p.type?.name)
    if (label) types[label] = (types[label] || 0) + 1
    const d = Number(p.suite_amount) || 0
    if (d > 0) { const k = d >= 4 ? '4+' : String(d); dorms[k] = (dorms[k] || 0) + 1 }
    if (p.aptoMascotas === true) pets += 1
    const sea = seaMeters(p.distanciaMar)
    if (sea !== null && sea <= 500) nearSea += 1
    const g = Number(p.guests_capacity) || 0
    if (g > 0) { minGuests = minGuests === null ? g : Math.min(minGuests, g); maxGuests = maxGuests === null ? g : Math.max(maxGuests, g) }
  }
  prices.sort((a, b) => a - b)
  return {
    total: items.length,
    minPrice: prices[0] || null,
    maxPrice: prices[prices.length - 1] || null,
    medianPrice: prices.length ? prices[Math.floor(prices.length / 2)] : null,
    types,
    dorms,
    pets,
    nearSea,
    minGuests,
    maxGuests,
  }
}

export function getLandingStats(typeKey, zoneKey) {
  return unstable_cache(
    async () => {
      const type = LANDING_TYPES[typeKey]
      const zone = ZONES[zoneKey]
      if (!type || !zone) return null
      const qs = new URLSearchParams()
      Object.entries(type.filters).forEach(([key, values]) => values.forEach((value) => qs.append(key, value)))
      qs.set('barrio', zone.barrio)
      qs.set('limit', '500')
      qs.set('offset', '0')
      const res = await fetch(`${API}/properties?${qs.toString()}`, { cache: 'no-store' })
      if (!res.ok) return null
      const data = await res.json()
      return computeStats(Array.isArray(data?.objects) ? data.objects : [])
    },
    ['landing-stats-v1', typeKey, zoneKey],
    { revalidate: 600 }
  )()
}

const joinList = (parts) => (parts.length <= 1 ? parts.join('') : `${parts.slice(0, -1).join(', ')} y ${parts[parts.length - 1]}`)

// Resumen en una o dos oraciones con los números de hoy
export function buildSummary(typeKey, zoneName, s) {
  if (!s || !s.total) return ''
  const type = LANDING_TYPES[typeKey]
  const out = []
  if (type.tempRental) {
    out.push(`Hoy tenemos ${s.total} ${s.total === 1 ? 'propiedad' : 'propiedades'} en alquiler temporario en ${zoneName}`)
    if (s.minGuests && s.maxGuests) out[0] += s.minGuests === s.maxGuests ? `, para ${s.maxGuests} personas` : `, de ${s.minGuests} a ${s.maxGuests} personas`
    out[0] += '.'
    const extra = []
    if (s.nearSea) extra.push(`${s.nearSea} a menos de 500 m del mar`)
    if (s.pets) extra.push(`${s.pets} que aceptan mascotas`)
    if (extra.length) out.push(`${joinList(extra).charAt(0).toUpperCase()}${joinList(extra).slice(1)}.`)
  } else {
    out.push(`Hoy tenemos ${s.total} ${s.total === 1 ? 'opción' : 'opciones'} de ${type.short.toLowerCase()} en ${zoneName}`)
    if (type.sale && s.minPrice) out[0] += s.minPrice === s.maxPrice ? ` a ${money(s.minPrice)}` : `, con precios de ${money(s.minPrice)} a ${money(s.maxPrice)}`
    out[0] += '.'
    const typeParts = Object.entries(s.types).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${v} ${k}`)
    if (typeKey === 'venta' && typeParts.length > 1) out.push(`Entre ellas hay ${joinList(typeParts.slice(0, 4))}.`)
    if (s.nearSea) out.push(`${s.nearSea} ${s.nearSea === 1 ? 'está' : 'están'} a menos de 500 m del mar.`)
  }
  return out.join(' ')
}

// Preguntas frecuentes con datos reales (solo las que se pueden responder con lo publicado)
export function buildFaq(typeKey, zoneName, s) {
  const type = LANDING_TYPES[typeKey]
  const faq = []
  const contacto = 'Escribinos por WhatsApp al +54 9 2255 50-9408 o pasá por nuestras oficinas en Mar Azul (Calle 34 y Mar del Plata) o Mar de las Pampas (Av. del Plata y Uritorco).'
  if (!s || !s.total) {
    faq.push({ q: `¿Tienen ${type.short.toLowerCase()} en ${zoneName}?`, a: `En este momento no hay publicadas, pero muchas propiedades nos llegan antes de publicarse. ${contacto}` })
    return faq
  }
  if (type.tempRental) {
    faq.push({
      q: `¿Cuántas casas hay en alquiler temporario en ${zoneName}?`,
      a: `Hoy tenemos ${s.total} ${s.total === 1 ? 'propiedad publicada' : 'propiedades publicadas'} en ${zoneName}${s.minGuests && s.maxGuests ? `, con capacidad de ${s.minGuests} a ${s.maxGuests} personas` : ''}. Las vas a ver en esta página con fotos, ubicación y distancia al mar.`,
    })
    if (s.pets) faq.push({ q: `¿Hay alquileres que acepten mascotas en ${zoneName}?`, a: `Sí: ${s.pets} de las propiedades publicadas aceptan mascotas. Lo vas a ver marcado como «Apto mascota» en cada una.` })
    if (s.nearSea) faq.push({ q: `¿Hay casas cerca del mar en ${zoneName}?`, a: `Sí: ${s.nearSea} de las propiedades publicadas están a menos de 500 metros del mar. La distancia figura en cada ficha.` })
    faq.push({ q: `¿Cómo reservo un alquiler temporario en ${zoneName}?`, a: `Elegí la propiedad y consultanos con las fechas y la cantidad de personas: te confirmamos disponibilidad y precio para esa temporada. ${contacto}` })
  } else if (type.sale) {
    if (s.minPrice) {
      faq.push({
        q: `¿Qué precios tienen ${type.noun || 'las propiedades'} en venta en ${zoneName}?`,
        a: `Entre las publicadas hoy, los precios van de ${money(s.minPrice)} a ${money(s.maxPrice)}${s.medianPrice ? `, con un valor medio de ${money(s.medianPrice)}` : ''}. Algunas tienen precio a consultar.`,
      })
    }
    const d = Object.entries(s.dorms).sort()
    if (typeKey !== 'lotes-terrenos' && d.length) {
      faq.push({ q: `¿De cuántos dormitorios hay opciones?`, a: `Hay ${joinList(d.map(([k, v]) => `${v} de ${k === '4+' ? '4 o más' : k} ${k === '1' ? 'dormitorio' : 'dormitorios'}`))}.` })
    }
    faq.push({ q: `¿Hacen tasaciones en ${zoneName}?`, a: `Sí, tasamos casas, departamentos y lotes en ${zoneName} y alrededores. ${contacto}` })
    faq.push({ q: `¿Cómo coordino una visita?`, a: `Consultanos por la propiedad que te interesa y coordinamos la visita en el día y horario que te quede cómodo. ${contacto}` })
  } else {
    faq.push({ q: `¿Qué piden para alquilar todo el año en ${zoneName}?`, a: `Los requisitos dependen de cada propiedad y propietario. Consultanos por la que te interesa y te pasamos el detalle. ${contacto}` })
  }
  return faq
}
