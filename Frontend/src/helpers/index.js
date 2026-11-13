export const formatToMoney = (price) => {
  if (!price) return ''
  return Number(price).toLocaleString('es-AR')
}

// Decide si el precio de una operación se muestra como "Consultar precio".
// - Alquiler temporario: siempre "Consultar precio" (no lo controla el interruptor del CRM).
// - Venta / Alquiler: manda el interruptor "Mostrar precio en la web" del CRM (op.show_price).
//   Si nunca se tocó (undefined), se mantiene el comportamiento de siempre: venta muestra el
//   precio y alquiler muestra "Consultar precio".
export const isOperationPriceHidden = (op) => {
  const type = (op?.operation_type || '').toLowerCase()
  if (type.includes('temporari') || type.includes('temporal')) return true
  if (typeof op?.show_price === 'boolean') return !op.show_price
  return type.includes('alquiler') || type === 'rent' || op?.operation_id === 2
}

// ─── Precios: una sola regla para tarjetas, ficha, buscador e impresión ───────────────────

export const CONSULTAR_PRECIO = 'Consultar precio'

const CURRENCY_CODES = {
  'Peso Argentino': 'ARS',
  ARS: 'ARS',
  'Dólar Estadounidense': 'USD',
  USD: 'USD',
}

// Un precio cargado a mano en el CRM sin tocar el selector de moneda se guarda sin currency:
// no es que sea en pesos, nunca se llegó a grabar. Se trata como USD.
export const normalizeCurrency = (currency) => CURRENCY_CODES[currency] || (currency ? String(currency) : 'USD')

const operationKind = (op) => {
  const type = (op?.operation_type || '').toLowerCase()
  if (type.includes('temporari') || type.includes('temporal')) return 'temporary'
  if (type.includes('venta') || type === 'sale' || op?.operation_id === 1) return 'sale'
  return 'rent'
}

// Montos de relleno que se cargan en el CRM para poder publicar (1, 10, 11, 100...).
// Venta y temporario por debajo de USD 1.000 no son precios reales; en alquiler anual
// se mantiene el corte de siempre (hasta USD 100). En pesos, menos de $1.000 nunca es real.
export const isPlaceholderPrice = (op, price, currency) => {
  const amount = Number(price)
  if (!Number.isFinite(amount) || amount <= 0) return true
  const code = normalizeCurrency(currency)
  if (code !== 'USD') return amount < 1000
  return operationKind(op) === 'rent' ? amount <= 100 : amount < 1000
}

export const formatMoney = (price, currency) => {
  const code = normalizeCurrency(currency)
  try {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: code,
      currencyDisplay: 'code',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price)
  } catch {
    return `${code} ${Number(price).toLocaleString('es-AR')}`
  }
}

// Precio de una operación puntual (Venta, Alquiler o Alquiler temporario) para mostrar en la web.
// ignoreHidden: la ficha impresa siempre mostró el precio salvo que se apague en el CRM.
export const formatOperationPrice = (op, { ignoreHidden = false } = {}) => {
  if (!op) return CONSULTAR_PRECIO
  if (!ignoreHidden && isOperationPriceHidden(op)) return CONSULTAR_PRECIO
  const priceObj = op.prices?.[0] || {}
  if (isPlaceholderPrice(op, priceObj.price, priceObj.currency)) return CONSULTAR_PRECIO
  return formatMoney(priceObj.price, priceObj.currency)
}

// Precio principal de una propiedad (primera operación), igual en todos los listados.
export const formatPropertyPrice = (property) => {
  if (!property) return CONSULTAR_PRECIO
  const operations = Array.isArray(property.operations) ? property.operations : []
  if (operations.length > 0) return formatOperationPrice(operations[0])
  const price = property.price || property.total_price
  const currency = property.currency?.name || property.currency
  if (isPlaceholderPrice({ operation_type: 'Venta' }, price, currency)) return CONSULTAR_PRECIO
  return formatMoney(price, currency)
}

// ─── Textos de ubicación y medidas ─────────────────────────────────────────────────────────

const LOWERCASE_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'al'])

// «Mar De Las Pampas » -> «Mar de las Pampas»; «Carilo» queda «Carilo».
export const tidyPlaceName = (raw) => {
  const text = String(raw ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  return text
    .split(' ')
    .map((word, index) => {
      const lower = word.toLocaleLowerCase('es')
      if (index > 0 && LOWERCASE_WORDS.has(lower)) return lower
      return lower.charAt(0).toLocaleUpperCase('es') + lower.slice(1)
    })
    .join(' ')
}

// Localidad (y provincia si viene) sin coma colgada.
export const formatPropertyLocation = (property) => {
  const city = property?.address?.city || property?.location?.name || (typeof property?.location === 'string' ? property.location : '')
  const state = property?.address?.state || ''
  return [tidyPlaceName(city), tidyPlaceName(state)].filter(Boolean).join(', ')
}

// distanciaMar es texto libre del CRM («500m», «500 mts», «5 cuadras»).
// Los metros se escriben siempre «500 m»; el resto se muestra tal cual.
export const formatDistanceToSea = (raw) => {
  const text = String(raw ?? '').replace(/\s+/g, ' ').trim()
  if (!text) return ''
  const meters = text.match(/^(\d+(?:[.,]\d+)?)\s*(m|mts?|metros?)?\.?$/i)
  if (meters) return `${meters[1]} m`
  return text
}

// Versión liviana de una foto del CRM (WebP al ancho pedido) vía el optimizador de Next.
// Anchos válidos: 256 (miniatura), 640 (tarjeta), 1080/1200 (foto grande). Otras URLs quedan igual.
const CRM_UPLOADS = 'https://apicrm.silviafernandezpropiedades.com.ar/uploads/'
export const imgUrl = (src, width = 640) => {
  if (!src || typeof src !== 'string' || !src.startsWith(CRM_UPLOADS)) return src
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=72`
}

// Foto de portada elegida en el CRM (is_front_cover); si no hay, la primera.
// Las fotos «PF» (remodelación con IA) y los planos nunca son portada.
export const getCoverPhoto = (property) => {
  const photos = (Array.isArray(property?.photos) ? property.photos : []).filter(
    (photo) => photo && (photo.description || '').trim().toLowerCase() !== 'pf' && !photo.is_blueprint
  )
  const cover = photos.find((photo) => photo.is_front_cover) || photos[0]
  return cover ? cover.image || cover.thumb || cover.original || null : null
}

// Videos de la propiedad, de cualquier fuente cargada en el CRM: YouTube, reel de Instagram o MP4.
// Devuelve una lista lista para mostrar: { kind, key, embedUrl | src, watchUrl, thumb, title }.
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
const INSTAGRAM_RE = /instagram\.com\/(?:[\w.]+\/)?(reel|reels|p|tv)\/([A-Za-z0-9_-]+)/
const MP4_RE = /\.(mp4|m4v|webm|mov)(\?|#|$)/i

export const getPropertyVideos = (property) => {
  const list = Array.isArray(property?.videos) ? [...property.videos] : []
  list.sort((a, b) => (a?.order ?? 0) - (b?.order ?? 0))
  const seen = new Set()
  const out = []
  list.forEach((video, index) => {
    if (!video) return
    const url = String(video.url || video.player_url || '')
    const title = video.title || video.description || ''
    let item = null
    const yt = video.video_id && (!video.provider || video.provider === 'youtube') ? [null, video.video_id] : url.match(YOUTUBE_RE)
    const ig = url.match(INSTAGRAM_RE)
    if (yt && yt[1] && video.provider !== 'instagram' && video.provider !== 'mp4') {
      item = {
        kind: 'youtube',
        key: `yt-${yt[1]}`,
        embedUrl: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&mute=1&rel=0&playsinline=1`,
        watchUrl: `https://www.youtube.com/watch?v=${yt[1]}`,
        thumb: video.thumbnail || `https://i.ytimg.com/vi/${yt[1]}/hqdefault.jpg`,
        title,
      }
    } else if (ig) {
      const type = ig[1] === 'reels' ? 'reel' : ig[1]
      item = {
        kind: 'instagram',
        key: `ig-${ig[2]}`,
        embedUrl: `https://www.instagram.com/${type}/${ig[2]}/embed`,
        watchUrl: `https://www.instagram.com/${type}/${ig[2]}/`,
        // La miniatura que da Instagram es un link firmado que vence a los días: se usa la portada
        thumb: /cdninstagram|fbcdn/i.test(video.thumbnail || '') ? '' : video.thumbnail || '',
        title,
      }
    } else if (video.provider === 'mp4' || MP4_RE.test(url)) {
      item = { kind: 'mp4', key: `mp4-${video._id || index}`, src: url, watchUrl: url, thumb: video.thumbnail || '', title }
    }
    if (item && !seen.has(item.key)) {
      seen.add(item.key)
      out.push(item)
    }
  })
  return out
}

export const VIDEO_KIND_LABEL = { youtube: 'YouTube', instagram: 'Reel', mp4: 'Video' }
