// Un solo buscador para todo el sitio: /propiedades.
// Acá se definen sus filtros y cómo se arma un link que llega con el filtro ya puesto.
// Menú, hero, accesos rápidos, footer y páginas por zona usan estas mismas funciones,
// así no vuelven a existir buscadores distintos que devuelven resultados distintos.
// (Sin imports de servidor: lo usan componentes de cliente y de servidor.)

export const SEARCH_PATH = '/propiedades'

// operation: 'venta' | 'alquiler'
export const OPERATION_LABELS = {
  venta: 'en venta',
  alquiler: 'en alquiler',
}

export const ZONE_OPTIONS = [
  { key: 'mar-azul', label: 'Mar Azul', barrio: 'Mar Azul' },
  { key: 'mar-de-las-pampas', label: 'Mar de las Pampas', barrio: 'Mar de las Pampas' },
  { key: 'las-gaviotas', label: 'Las Gaviotas', barrio: 'Gaviotas' },
  { key: 'villa-gesell', label: 'Villa Gesell', barrio: 'Villa Gesell' },
]

export const PROPERTY_TYPE_PLURALS = {
  Casa: 'Casas',
  Departamento: 'Departamentos',
  Terreno: 'Lotes y terrenos',
  Local: 'Locales',
  Complejo: 'Complejos',
}

// Los locales no se mezclan con los alquileres para alojarse: en «Alquilar» no aparecen,
// salvo que se elija el tipo «Local» (ahí se muestran solo los locales en alquiler).
export const LOCAL_TYPE = 'Local'
export const rentExcludesLocals = ({ operation, type } = {}) => operation === 'alquiler' && type !== LOCAL_TYPE

// Valores de ?operation= que siguen llegando por links viejos, guardados o compartidos
export const normalizeOperation = (value) => {
  const v = String(value || '').toLowerCase().trim()
  return v.includes('alquil') || ['temporario', 'anual', 'rent'].includes(v) ? 'alquiler' : 'venta'
}

export const zoneLabel = (zona) => ZONE_OPTIONS.find((z) => z.key === zona)?.label || ''

// Link al buscador con los filtros dados (solo se escriben los que tienen valor)
export const searchHref = ({ operation, type, zona, location, personas } = {}) => {
  const params = new URLSearchParams()
  if (operation && operation !== 'venta') params.set('operation', operation)
  if (type) params.set('type', type)
  if (zona) params.set('zona', zona)
  if (location) params.set('location', location)
  if (personas) params.set('personas', String(personas))
  const qs = params.toString()
  return qs ? `${SEARCH_PATH}?${qs}` : SEARCH_PATH
}

// Título de la búsqueda según sus filtros: «Casas en venta en Mar Azul»
export const searchTitle = ({ operation = 'venta', type = '', zona = '' } = {}) => {
  const noun = PROPERTY_TYPE_PLURALS[type] || 'Propiedades'
  const zone = zoneLabel(zona)
  return `${noun} ${OPERATION_LABELS[operation] || OPERATION_LABELS.venta}${zone ? ` en ${zone}` : ''}`
}

// Cada página por zona (SEO) equivale a estos filtros del buscador
export const LANDING_TO_SEARCH = {
  venta: { operation: 'venta' },
  'casas-en-venta': { operation: 'venta', type: 'Casa' },
  'departamentos-en-venta': { operation: 'venta', type: 'Departamento' },
  'lotes-terrenos': { operation: 'venta', type: 'Terreno' },
  'alquiler-temporario': { operation: 'alquiler' },
  // Hoy todo el alquiler anual son locales
  'alquiler-anual': { operation: 'alquiler', type: 'Local' },
}

// Las secciones que antes tenían página propia (Alquileres, Lotes, Complejos) conservan
// su título y descripción en Google: ahora son el buscador con ese filtro.
const SECTION_META = {
  'alquiler|': {
    title: 'Alquiler temporario en Mar Azul y Mar de las Pampas | Silvia Fernández',
    description: 'Casas, cabañas y departamentos en alquiler temporario en Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell, con fotos, capacidad y contacto directo.',
  },
  'venta|Terreno': {
    title: 'Lotes y terrenos en venta en Mar Azul y Mar de las Pampas | Silvia Fernández',
    description: 'Encontrá lotes y terrenos en venta en Mar de las Pampas, Mar Azul y alrededores con asesoramiento inmobiliario profesional.',
  },
  'venta|Complejo': {
    title: 'Complejos y emprendimientos en venta en Mar Azul y Mar de las Pampas | Silvia Fernández',
    description: 'Explorá complejos y emprendimientos en venta en Mar de las Pampas, Mar Azul y zonas cercanas con Silvia Fernández Propiedades.',
  },
}

// Página por zona que corresponde a una búsqueda (para el canonical), o null
export const landingPathForSearch = ({ operation = 'venta', type = '', zona = '' } = {}) => {
  if (!zona || !zoneLabel(zona)) return null
  const key = Object.keys(LANDING_TO_SEARCH).find((k) => {
    const f = LANDING_TO_SEARCH[k]
    return f.operation === operation && (f.type || '') === type
  })
  return key ? `/${key}/${zona}` : null
}

// Metadatos de /propiedades según los filtros de la URL
export const searchMetadata = (searchParams = {}) => {
  const pick = (key) => {
    const value = searchParams?.[key]
    return Array.isArray(value) ? value[0] : (value || '')
  }
  const type = PROPERTY_TYPE_PLURALS[pick('type')] ? pick('type') : ''
  const operation = normalizeOperation(pick('operation'))
  const zona = zoneLabel(pick('zona')) ? pick('zona') : ''
  const filters = { operation, type, zona }
  const where = zoneLabel(zona) || 'Mar Azul y Mar de las Pampas'
  const base = searchTitle({ operation, type })
  const hasFilters = operation !== 'venta' || type || zona
  const section = zona ? null : SECTION_META[`${operation}|${type}`]

  return {
    title: section?.title || (hasFilters
      ? `${base} en ${where} | Silvia Fernández`
      : 'Propiedades en venta y alquiler en Mar Azul y Mar de las Pampas | Silvia Fernández'),
    description: section?.description || (hasFilters
      ? `${base} en ${where}: fotos, ubicación y contacto directo con Silvia Fernández Propiedades.`
      : 'Buscá casas, departamentos, lotes y complejos en venta y alquiler en Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell, con filtros por tipo, operación y zona.'),
    // Con zona, Google toma la página de esa zona; sin zona, la búsqueda por operación y tipo
    alternates: { canonical: landingPathForSearch(filters) || searchHref({ operation, type }) },
  }
}
