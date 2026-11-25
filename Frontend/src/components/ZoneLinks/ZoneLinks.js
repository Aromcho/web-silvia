// Home: texto de la inmobiliaria y links a las páginas por zona (Google llega a ellas desde acá)
import Link from 'next/link'
import { FaMapMarkerAlt, FaArrowRight, FaChevronRight, FaHome, FaTree, FaUmbrellaBeach, FaBuilding, FaKey } from 'react-icons/fa'
import { ZONES, ZONE_SLUGS, LANDING_TYPES, LANDING_TYPE_SLUGS, landingPath } from '../../helpers/landings.js'
import './ZoneLinks.css'

// Tarjetas por zona del home: la primera página (venta) va en la cabecera y el resto, en la lista
const [MAIN_TYPE, ...OTHER_TYPES] = LANDING_TYPE_SLUGS
const TYPE_ICONS = {
  'casas-en-venta': FaHome,
  'lotes-terrenos': FaTree,
  'alquiler-temporario': FaUmbrellaBeach,
  'departamentos-en-venta': FaBuilding,
  'alquiler-anual': FaKey,
}

// Zona de la ficha según su localidad (para enlazar la ficha con las páginas de su zona)
const zoneOfProperty = (property) => {
  const name = String(property?.location?.name || property?.address?.city || '').toLowerCase()
  if (name.includes('azul')) return 'mar-azul'
  if (name.includes('pampas')) return 'mar-de-las-pampas'
  if (name.includes('gaviotas')) return 'las-gaviotas'
  if (name.includes('gesell')) return 'villa-gesell'
  return null
}

// Debajo de cada ficha: «Seguí buscando en Mar Azul» con las páginas de esa zona. Así cada una de
// las fichas empuja a las páginas por zona (los links internos le dicen a Google cuáles importan).
export function PropertyZoneLinks({ property }) {
  const zoneKey = zoneOfProperty(property)
  if (!zoneKey) return null
  const zone = ZONES[zoneKey]
  return (
    <section className="property-zone-links container" aria-labelledby="pzl-title">
      <h2 id="pzl-title">Seguí buscando en {zone.name}</h2>
      <ul>
        {LANDING_TYPE_SLUGS.map((typeKey) => (
          <li key={typeKey}>
            <Link href={landingPath(typeKey, zoneKey)} className="zone-chip">
              {LANDING_TYPES[typeKey].short} en {zone.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

// Fila «¿En qué zona?» del panel de filtros de /lotes-terrenos y /alquiler-temporario.
// Sola (standalone) trae su propio panel; dentro del panel de otra página va con standalone={false}.
export function ZoneChips({ typeKey, standalone = true }) {
  const type = LANDING_TYPES[typeKey]
  if (!type) return null
  const row = (
    <nav className="zone-chips" aria-label={`${type.short} por zona`}>
      <span className="zone-chips-label"><FaMapMarkerAlt aria-hidden="true" /> ¿En qué zona?</span>
      <div className="zone-chips-list">
        {ZONE_SLUGS.map((zoneKey) => (
          <Link key={zoneKey} href={landingPath(typeKey, zoneKey)} className="zone-chip">
            {ZONES[zoneKey].name}
          </Link>
        ))}
      </div>
    </nav>
  )
  if (!standalone) return row
  return (
    <div className="filter-panel-wrap">
      <div className="container">
        <div className="filter-panel">{row}</div>
      </div>
    </div>
  )
}

export default function ZoneLinks() {
  return (
    <section className="sf-section" aria-labelledby="zone-links-title">
      <div className="container">
        <header className="sf-head">
          <h2 className="sf-title" id="zone-links-title">Propiedades por <span className="sf-accent">zona</span></h2>
          <p className="sf-subtitle">
            Silvia Fernández Propiedades es una inmobiliaria con oficina central en Mar Azul y sucursal boutique
            en Mar de las Pampas. Trabajamos con casas, lotes, complejos y alquileres temporarios y anuales en
            Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell.
          </p>
        </header>
        <div className="zone-cards">
          {ZONE_SLUGS.map((zoneKey) => {
            const zone = ZONES[zoneKey]
            return (
              <article className="sf-card zone-card" key={zoneKey}>
                {/* Cabecera verde: la zona y su página principal */}
                <Link href={landingPath(MAIN_TYPE, zoneKey)} className="zone-card-head">
                  <FaMapMarkerAlt className="zone-card-pin" aria-hidden="true" />
                  <h3>{zone.name}</h3>
                  <span className="zone-card-all">
                    {LANDING_TYPES[MAIN_TYPE].short}
                    <span className="sr-only"> en {zone.name}</span>
                    <FaArrowRight aria-hidden="true" />
                  </span>
                </Link>
                <ul className="zone-card-list">
                  {OTHER_TYPES.map((typeKey) => {
                    const Icon = TYPE_ICONS[typeKey] || FaHome
                    return (
                      <li key={typeKey}>
                        <Link href={landingPath(typeKey, zoneKey)}>
                          <Icon className="zone-card-icon" aria-hidden="true" />
                          <span className="zone-card-label">
                            {LANDING_TYPES[typeKey].short}
                            <span className="sr-only"> en {zone.name}</span>
                          </span>
                          <FaChevronRight className="zone-card-chevron" aria-hidden="true" />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
