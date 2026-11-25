// Home: texto de la inmobiliaria y links a las páginas por zona (Google llega a ellas desde acá)
import Link from 'next/link'
import { ZONES, ZONE_SLUGS, LANDING_TYPES, LANDING_TYPE_SLUGS, landingPath } from '../../helpers/landings.js'
import './ZoneLinks.css'

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

// Fila de links «por zona» debajo del encabezado de /lotes-terrenos y /alquiler-temporario
export function ZoneChips({ typeKey }) {
  const type = LANDING_TYPES[typeKey]
  if (!type) return null
  return (
    <nav className="zone-chips container" aria-label={`${type.short} por zona`}>
      <span className="zone-chips-label">Por zona:</span>
      {ZONE_SLUGS.map((zoneKey) => (
        <Link key={zoneKey} href={landingPath(typeKey, zoneKey)} className="zone-chip">
          {ZONES[zoneKey].name}
        </Link>
      ))}
    </nav>
  )
}

export default function ZoneLinks() {
  return (
    <section className="zone-links-section" aria-labelledby="zone-links-title">
      <div className="container">
        <h2 id="zone-links-title">Propiedades por <span className="underline">zona</span></h2>
        <p className="zone-links-intro">
          Silvia Fernández Propiedades es una inmobiliaria con oficina central en Mar Azul y sucursal boutique
          en Mar de las Pampas. Trabajamos con casas, lotes, complejos y alquileres temporarios y anuales en
          Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell.
        </p>
        <div className="zone-links-grid">
          {ZONE_SLUGS.map((zoneKey) => (
            <div className="zone-links-card" key={zoneKey}>
              <h3>{ZONES[zoneKey].name}</h3>
              <ul>
                {LANDING_TYPE_SLUGS.map((typeKey) => (
                  <li key={typeKey}>
                    <Link href={landingPath(typeKey, zoneKey)}>
                      {LANDING_TYPES[typeKey].short} en {ZONES[zoneKey].name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
