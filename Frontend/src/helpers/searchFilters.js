// Un solo buscador para todo el sitio: /propiedades.
// Acá se definen sus filtros y cómo se arma un link que llega con el filtro ya puesto.
// Menú, hero, accesos rápidos, footer y páginas por zona usan estas mismas funciones,
// así no vuelven a existir buscadores distintos que devuelven resultados distintos.
// (Sin imports de servidor: lo usan componentes de cliente y de servidor.)

export const SEARCH_PATH = '/propiedades'

// operation: 'venta' | 'temporario' | 'anual'
export const OPERATION_LABELS = {
  venta: 'en venta',
  temporario: 'en alquiler temporario',
  anual: 'en alquiler anual',
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

// Tipos que solo se alquilan por año: con «Alquilar» se muestran en alquiler anual
const ANNUAL_ONLY_TYPES = ['Local']

// Valores viejos de ?operation= que siguen llegando por links guardados o compartidos
export const normalizeOperation = (value) => {
  const v = String(value || '').toLowerCase().trim()
  if (['alquiler', 'temporario', 'alquiler_temporal', 'alquiler-temporario', 'alquiler temporario'].includes(v)) return 'temporario'
  if (['anual', 'alquiler-anual', 'alquiler anual'].includes(v)) return 'anual'
  return 'venta'
}

// «Alquilar un local» es alquiler anual: no existe en temporario y antes no devolvía nada
export const resolveOperation = (operation, type) => (
  operation === 'temporario' && ANNUAL_ONLY_TYPES.includes(type) ? 'anual' : operation
)

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
  'alquiler-temporario': { operation: 'temporario' },
  'alquiler-anual': { operation: 'anual' },
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
  const operation = resolveOperation(normalizeOperation(pick('operation')), type)
  const zona = zoneLabel(pick('zona')) ? pick('zona') : ''
  const filters = { operation, type, zona }
  const where = zoneLabel(zona) || 'Mar Azul y Mar de las Pampas'
  const base = searchTitle({ operation, type })
  const hasFilters = operation !== 'venta' || type || zona

  return {
    title: hasFilters
      ? `${base} en ${where} | Silvia Fernández`
      : 'Propiedades en venta y alquiler en Mar Azul y Mar de las Pampas | Silvia Fernández',
    description: hasFilters
      ? `${base} en ${where}: fotos, ubicación y contacto directo con Silvia Fernández Propiedades.`
      : 'Buscá casas, departamentos, lotes y complejos en venta y alquiler en Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell, con filtros por tipo, operación y zona.',
    // Con zona, Google toma la página de esa zona; sin zona, la búsqueda por operación y tipo
    alternates: { canonical: landingPathForSearch(filters) || searchHref({ operation, type }) },
  }
}
