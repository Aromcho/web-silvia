// De dónde vino cada consulta (X6). Guarda 30 días el último origen conocido del visitante
// (campaña utm_*, clic de anuncio de Meta o Google, o el sitio desde el que llegó) y un código corto
// que viaja en el mensaje de WhatsApp («Ref. W7K») para que el CRM sepa de dónde vino la charla.

const KEY = 'sf_attr'
const TTL = 30 * 24 * 60 * 60 * 1000
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

function read() {
  try {
    const data = JSON.parse(window.localStorage.getItem(KEY) || 'null')
    if (!data || Date.now() - (data.at || 0) > TTL) return null
    return data
  } catch {
    return null
  }
}

function makeCode() {
  let code = ''
  for (let i = 0; i < 3; i += 1) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  return code
}

export function channelOf(d) {
  if (!d) return 'directo'
  const source = String(d.utm?.source || '').toLowerCase()
  const medium = String(d.utm?.medium || '').toLowerCase()
  if (d.gclid) return 'google-ads'
  if (d.fbclid || /facebook|instagram|meta|^fb$|^ig$/.test(source)) {
    return d.fbclid || /paid|cpc|ads?|pago/.test(medium) ? 'meta-ads' : (source.includes('face') ? 'facebook' : 'instagram')
  }
  if (source) return source.slice(0, 40)
  const ref = String(d.referrer || '')
  if (/google\./.test(ref)) return 'google'
  if (/instagram\./.test(ref)) return 'instagram'
  if (/facebook\.|fb\.com|fb\.me/.test(ref)) return 'facebook'
  if (/mercadolibre\./.test(ref)) return 'mercadolibre'
  if (/zonaprop\./.test(ref)) return 'zonaprop'
  if (ref) return 'otro-sitio'
  return 'directo'
}

// Se llama en cada carga de página: si la URL trae datos de campaña o vino de otro sitio, ese
// pasa a ser el origen; si no, se mantiene el que había (o «directo»).
export function captureAttribution() {
  if (typeof window === 'undefined') return
  try {
    const params = new URLSearchParams(window.location.search)
    const utm = {}
    ;['source', 'medium', 'campaign', 'content', 'term'].forEach((k) => {
      const v = params.get(`utm_${k}`)
      if (v) utm[k] = v.slice(0, 120)
    })
    const fbclid = params.has('fbclid')
    const gclid = params.has('gclid') || params.has('gbraid') || params.has('wbraid')
    const referrer = document.referrer && !document.referrer.includes(window.location.hostname) ? document.referrer.slice(0, 300) : ''
    const prev = read()
    const fresh = Object.keys(utm).length > 0 || fbclid || gclid || Boolean(referrer)
    if (!fresh && prev) return
    const data = {
      utm: fresh ? utm : {},
      fbclid,
      gclid,
      referrer,
      landing: window.location.pathname.slice(0, 200),
      at: Date.now(),
      code: prev?.code || makeCode(),
    }
    data.channel = channelOf(data)
    window.localStorage.setItem(KEY, JSON.stringify(data))
  } catch {
    // sin localStorage (modo privado viejo): no se registra el origen
  }
}

export function getAttribution() {
  if (typeof window === 'undefined') return null
  const d = read()
  if (!d) return null
  return {
    channel: d.channel || channelOf(d),
    source: d.utm?.source || '',
    medium: d.utm?.medium || '',
    campaign: d.utm?.campaign || '',
    content: d.utm?.content || '',
    term: d.utm?.term || '',
    referrer: d.referrer || '',
    landing: d.landing || '',
    code: d.code || '',
    firstSeen: d.at ? new Date(d.at).toISOString() : '',
  }
}

// Agrega «Ref. ABC» al texto de un link de WhatsApp (una sola vez)
export function addRefToWhatsAppUrl(href) {
  try {
    const d = read()
    if (!d?.code) return href
    const url = new URL(href)
    const text = url.searchParams.get('text') || ''
    if (/\bRef\. [A-Z0-9]{3}\b/.test(text)) return href
    url.searchParams.set('text', `${text}${text ? '\n\n' : ''}Ref. ${d.code}`)
    // URLSearchParams codifica los espacios como «+»; WhatsApp espera %20
    url.search = url.searchParams.toString().replace(/\+/g, '%20')
    return url.toString()
  } catch {
    return href
  }
}
