// Página por zona (SEO), renderizada en el servidor: título y texto propios de la búsqueda,
// las propiedades en el HTML, paginación con links reales y links a las otras zonas.
import Link from 'next/link'
import { notFound } from 'next/navigation'
import PropertyCard from '../PropertyCard/PropertyCard'
import {
  SITE,
  ZONES,
  LANDING_TYPES,
  ZONE_SLUGS,
  LANDING_TYPE_SLUGS,
  LANDING_PAGE_SIZE,
  fetchLanding,
  landingPath,
  parsePage,
  getLandingStats,
  buildSummary,
  buildFaq,
} from '../../helpers/landings.js'
import { ZoneChips } from '../ZoneLinks/ZoneLinks'
import '../../app/lotes-terrenos/page.css'
import '../PropertiesGrid/PropertiesGrid.css'
import './ZoneLanding.css'

const WHATSAPP = '5492255509408'

// Corta en una palabra entera (Google muestra ~155 caracteres de la descripción)
const clipWords = (text, max) => {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:]+$/, '')}…`
}

async function load(typeKey, zoneKey, searchParams) {
  if (!LANDING_TYPES[typeKey] || !ZONES[zoneKey]) notFound()
  const page = parsePage(searchParams?.pagina)
  try {
    return { page, ...(await fetchLanding(typeKey, zoneKey, { page })), failed: false }
  } catch (error) {
    console.error(`No se pudo cargar ${typeKey}/${zoneKey}:`, error.message)
    return { page, total: 0, items: [], failed: true }
  }
}

export async function buildLandingMetadata(typeKey, { params, searchParams }) {
  const type = LANDING_TYPES[typeKey]
  const zone = ZONES[params?.zona]
  if (!type || !zone) return {}
  const { page, total, failed } = await load(typeKey, params.zona, searchParams)
  const stats = await getLandingStats(typeKey, params.zona).catch(() => null)
  const pages = Math.max(1, Math.ceil(total / LANDING_PAGE_SIZE))
  const title = `${type.title ? type.title(zone.name, stats) : type.h1(zone.name)}${page > 1 ? ` (página ${page})` : ''} | Silvia Fernández`
  const summary = buildSummary(typeKey, zone.name, stats)
  const description = summary
    ? clipWords(`${summary} Fotos y ubicación de cada una. Inmobiliaria Silvia Fernández.`, 158)
    : `${type.short} en ${zone.name}, con fotos, precio y ubicación. Inmobiliaria Silvia Fernández, con oficinas en Mar Azul y Mar de las Pampas.`
  const url = landingPath(typeKey, params.zona, page)
  return {
    title,
    description,
    alternates: { canonical: url },
    // Sin resultados (o página fuera de rango) no se indexa, pero se siguen los links
    ...(failed || total === 0 || page > pages ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      locale: 'es_AR',
      siteName: 'Silvia Fernández Propiedades',
    },
  }
}

export default async function ZoneLanding({ typeKey, params, searchParams }) {
  const zoneKey = params?.zona
  const { page, total, items } = await load(typeKey, zoneKey, searchParams)
  const type = LANDING_TYPES[typeKey]
  const zone = ZONES[zoneKey]
  const stats = await getLandingStats(typeKey, zoneKey).catch(() => null)
  const summary = buildSummary(typeKey, zone.name, stats)
  const faq = buildFaq(typeKey, zone.name, stats)
  const pages = Math.max(1, Math.ceil(total / LANDING_PAGE_SIZE))
  const h1 = type.h1(zone.name)
  const offset = (page - 1) * LANDING_PAGE_SIZE

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Inicio', item: `${SITE}/` },
          { '@type': 'ListItem', position: 2, name: type.parent.label, item: `${SITE}${type.parent.href}` },
          { '@type': 'ListItem', position: 3, name: h1, item: `${SITE}${landingPath(typeKey, zoneKey)}` },
        ],
      },
      {
        '@type': 'ItemList',
        name: h1,
        numberOfItems: total,
        itemListElement: items.map((property, index) => ({
          '@type': 'ListItem',
          position: offset + index + 1,
          url: `${SITE}/propiedad/${property.id}`,
        })),
      },
      ...(faq.length
        ? [{
            '@type': 'FAQPage',
            mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
          }]
        : []),
    ],
  }

  const otherZones = ZONE_SLUGS.filter((key) => key !== zoneKey)
  const otherTypes = LANDING_TYPE_SLUGS.filter((key) => key !== typeKey)
  const whatsappText = `Hola, busco ${type.short.toLowerCase()} en ${zone.name}`

  return (
    <div className="zone-landing">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />

      <div className="page-hero page-hero--with-panel">
        <div className="container">
          <nav className="zl-breadcrumb" aria-label="Estás en">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href={type.parent.href}>{type.parent.label}</Link>
            <span aria-hidden="true">›</span>
            <span>{zone.name}</span>
          </nav>
          <h1>{h1}</h1>
          <p>
            {total > 0
              ? `${total} ${total === 1 ? 'propiedad disponible' : 'propiedades disponibles'}`
              : 'Pronto vas a encontrar opciones acá'}
          </p>
        </div>
      </div>

      {/* Mismo panel de zonas que los listados, con esta zona marcada */}
      <ZoneChips typeKey={typeKey} activeZone={zoneKey} allHref={type.parent.href} />

      {items.length > 0 ? (
        <div className="properties-grid-container zl-grid">
          <div className="container">
            <div className="properties-grid">
              {items.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>

            {pages > 1 && (
              <nav className="zl-pagination" aria-label="Páginas">
                {page > 1 && (
                  <Link href={landingPath(typeKey, zoneKey, page - 1)} rel="prev">← Anterior</Link>
                )}
                {Array.from({ length: pages }, (_, i) => i + 1).map((n) =>
                  n === page ? (
                    <span key={n} className="zl-page is-current" aria-current="page">{n}</span>
                  ) : (
                    <Link key={n} href={landingPath(typeKey, zoneKey, n)} className="zl-page">{n}</Link>
                  )
                )}
                {page < pages && (
                  <Link href={landingPath(typeKey, zoneKey, page + 1)} rel="next">Siguiente →</Link>
                )}
              </nav>
            )}
          </div>
        </div>
      ) : (
        <section className="container zl-empty">
          <p>
            En este momento no tenemos {type.short.toLowerCase()} publicadas en {zone.name}, pero muchas
            propiedades nos llegan antes de publicarse.
          </p>
          <a
            className="zl-whatsapp"
            href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contanos qué buscás por WhatsApp
          </a>
        </section>
      )}

      {/* Texto de la zona: va después del listado, no antes (arriba era un bloque de letras) */}
      <section className="zl-about" aria-labelledby="zl-about-title">
        <div className="container zl-about-grid">
          <div className="zl-about-text">
            <h2 id="zl-about-title">Sobre {zone.name}</h2>
            <p>{zone.intro}</p>
            <p>{type.lead}</p>
          </div>
          <aside className="sf-card zl-about-card">
            <p className="zl-about-kicker">Hoy en {zone.name}</p>
            {summary && <p className="zl-summary">{summary}</p>}
            <a
              className="zl-whatsapp"
              href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(whatsappText)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Consultar por WhatsApp
            </a>
          </aside>
        </div>
      </section>

      {faq.length > 0 && (
        <section className="container zl-faq" aria-labelledby="zl-faq-title">
          <h2 id="zl-faq-title">Preguntas frecuentes sobre {type.short.toLowerCase()} en {zone.name}</h2>
          {faq.map(({ q, a }) => (
            <div className="zl-faq-item" key={q}>
              <h3>{q}</h3>
              <p>{a}</p>
            </div>
          ))}
        </section>
      )}

      <section className="container zl-more" aria-labelledby="zl-more-title">
        <h2 id="zl-more-title">Seguí buscando</h2>
        <div className="zl-more-grid">
          <div>
            <h3>{type.short} en otras zonas</h3>
            <ul>
              {otherZones.map((key) => (
                <li key={key}>
                  <Link href={landingPath(typeKey, key)}>{type.h1(ZONES[key].name)}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3>Más opciones en {zone.name}</h3>
            <ul>
              {otherTypes.map((key) => (
                <li key={key}>
                  <Link href={landingPath(key, zoneKey)}>{LANDING_TYPES[key].h1(zone.name)}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  )
}
