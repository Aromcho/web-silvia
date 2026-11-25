// SEO de las fichas (W6): descripción real (no una plantilla), precio y zona en el título que ve
// Google, y datos estructurados (schema.org) de la propiedad y de la inmobiliaria.
import { getCoverPhoto, tidyPlaceName, formatPropertyPrice, CONSULTAR_PRECIO, formatDistanceToSea } from './index.js'

const SITE = 'https://www.silviafernandezpropiedades.com.ar'

const stripHtml = (v) => String(v || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&[a-z]+;/g, ' ').replace(/\s+/g, ' ').trim()

function clip(text, max) {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ') > 80 ? cut.lastIndexOf(' ') : max).replace(/[,.;:\s]+$/, '')}…`
}

const operationWord = (property) => {
  const t = String(property?.operations?.[0]?.operation_type || '').toLowerCase()
  if (t.includes('tempor')) return 'Alquiler temporario'
  if (t.includes('alquiler')) return 'Alquiler'
  if (t.includes('venta')) return 'Venta'
  return ''
}

export function buildSearchTitle(property) {
  if (!property) return ''
  const rawType = String(property.type?.name || '').trim()
  const type = /terreno|lote/i.test(rawType) ? 'Lote' : /hotel|complejo/i.test(rawType) ? 'Complejo' : tidyPlaceName(rawType) || 'Propiedad'
  const ops = (property.operations || []).map((op) => String(op?.operation_type || '').toLowerCase())
  const hasSale = ops.some((t) => t.includes('venta') || t === 'sale')
  const hasTemp = ops.some((t) => t.includes('tempor'))
  const hasRent = ops.some((t) => (t.includes('alquiler') || t === 'rent') && !t.includes('tempor'))
  const opPhrase = hasSale && hasTemp ? 'en venta y alquiler temporario'
    : hasSale && hasRent ? 'en venta y alquiler'
    : hasSale ? 'en venta'
    : hasTemp ? 'en alquiler temporario'
    : hasRent ? 'en alquiler'
    : ''
  const place = tidyPlaceName(property.location?.name || property.address?.city)
  const base = [type, opPhrase, place ? `en ${place}` : ''].filter(Boolean).join(' ')

  const facts = []
  const dorms = Number(property.suite_amount) || 0
  const land = Number(property.total_surface || property.surface) || 0
  if (type === 'Lote' && land > 0) facts.push(`${Math.round(land)} m²`)
  else if (dorms > 0) facts.push(`${dorms} dorm.`)
  if (hasTemp && property.guests_capacity_label) facts.push(String(property.guests_capacity_label).toLowerCase())
  const sea = formatDistanceToSea(property.distanciaMar)
  if (sea) facts.push(`${sea} del mar`)
  if (hasSale) {
    const price = formatPropertyPrice(property)
    if (price && price !== CONSULTAR_PRECIO && /venta|sale/i.test(property.operations?.[0]?.operation_type || '')) facts.push(price)
  }
  return `${base}${facts.length ? ` · ${facts.slice(0, 3).join(' · ')}` : ''}`
}

export function buildPropertyMetadata(property) {
  const title = stripHtml(property?.publication_title) || property?.type?.name || 'Propiedad'
  const place = tidyPlaceName(property?.location?.name || property?.address?.city) || 'Mar de las Pampas'
  const price = formatPropertyPrice(property)
  const sea = formatDistanceToSea(property?.distanciaMar)
  const facts = [
    operationWord(property),
    place,
    price && price !== CONSULTAR_PRECIO ? price : '',
    sea ? `${sea} del mar` : '',
  ].filter(Boolean).join(' · ')
  const body = stripHtml(property?.description || property?.rich_description)
  const description = clip(body ? `${facts}. ${body}` : `${facts}. Consultá esta propiedad con Silvia Fernández Inmobiliaria.`, 158)
  const cover = getCoverPhoto(property)
  const url = `/propiedad/${property?.id || ''}`
  // La localidad va en el título que ve Google (si la publicación no la menciona ya)
  const realPlace = tidyPlaceName(property?.location?.name || property?.address?.city)
  const norm = (v) => String(v || '').toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')
  const titleWithPlace = realPlace && !norm(title).includes(norm(realPlace)) ? `${title} en ${realPlace}` : title
  // Título para Google armado con los datos, como busca la gente: «Casa en alquiler temporario en
  // Mar Azul · 3 dorm. · 200 m del mar». Los títulos cargados («VENTA CASA EN MAR AZUL») se repiten
  // entre fichas y no dicen dormitorios, precio ni distancia al mar.
  const fullTitle = `${buildSearchTitle(property) || titleWithPlace} | Silvia Fernández`

  return {
    title: fullTitle,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: fullTitle,
      description,
      url,
      type: 'website',
      locale: 'es_AR',
      siteName: 'Silvia Fernández Propiedades',
      ...(cover && { images: [{ url: cover, alt: title }] }),
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      ...(cover && { images: [cover] }),
    },
  }
}

// RealEstateListing con la oferta (precio y moneda si no es «a consultar»), la dirección y el mapa
export function buildPropertyJsonLd(property) {
  if (!property) return null
  const title = stripHtml(property.publication_title) || property.type?.name || 'Propiedad'
  const place = tidyPlaceName(property.location?.name || property.address?.city)
  const op = property.operations?.[0]
  const priceObj = op?.prices?.[0]
  const priceText = formatPropertyPrice(property)
  const photos = (property.photos || [])
    .filter((p) => p && String(p.description || '').trim().toLowerCase() !== 'pf' && !p.is_blueprint)
    .map((p) => p.image || p.original || p.thumb)
    .filter(Boolean)
    .slice(0, 8)
  const lat = Number(property.geo_lat)
  const lng = Number(property.geo_long)

  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: title,
    url: `${SITE}/propiedad/${property.id}`,
    description: clip(stripHtml(property.description || property.rich_description) || title, 500),
    image: photos,
    datePosted: property.createdAt || undefined,
    dateModified: property.updatedAt || undefined,
    provider: {
      '@type': 'RealEstateAgent',
      name: 'Silvia Fernández Propiedades',
      url: SITE,
      telephone: '+54 9 2255 50-9408',
      areaServed: ['Mar de las Pampas', 'Mar Azul', 'Las Gaviotas', 'Villa Gesell'],
    },
    about: {
      '@type': /terreno|lote/i.test(property.type?.name || '') ? 'Landform' : 'Accommodation',
      name: title,
      ...(property.room_amount ? { numberOfRooms: property.room_amount } : {}),
      ...(property.total_surface ? { floorSize: { '@type': 'QuantitativeValue', value: Number(property.total_surface) || undefined, unitCode: 'MTK' } } : {}),
      address: {
        '@type': 'PostalAddress',
        streetAddress: typeof property.address === 'string' ? property.address : undefined,
        addressLocality: place || undefined,
        addressRegion: 'Buenos Aires',
        addressCountry: 'AR',
      },
      ...(Number.isFinite(lat) && lat !== 0 && Number.isFinite(lng) && lng !== 0
        ? { geo: { '@type': 'GeoCoordinates', latitude: lat, longitude: lng } }
        : {}),
    },
  }
  if (priceObj?.price && priceText !== CONSULTAR_PRECIO) {
    data.offers = {
      '@type': 'Offer',
      price: priceObj.price,
      priceCurrency: String(priceObj.currency || 'USD').toUpperCase() === 'ARS' ? 'ARS' : 'USD',
      availability: 'https://schema.org/InStock',
      businessFunction: /alquiler/i.test(op?.operation_type || '') ? 'http://purl.org/goodrelations/v1#LeaseOut' : 'http://purl.org/goodrelations/v1#Sell',
    }
  }
  return data
}
