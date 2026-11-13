import { notFound } from 'next/navigation'
import { getPropertyById } from '../../../services/propertyService'
import PropertyDetail from '../../../components/PropertyDetail/PropertyDetail'
import { buildPropertyMetadata, buildPropertyJsonLd } from '../../../helpers/seo.js'

export async function generateMetadata({ params }) {
  try {
    const property = await getPropertyById(params.id, { cache: 'no-store' })

    if (!property) {
      return {
        title: 'Esta propiedad ya no está disponible | Silvia Fernández Inmobiliaria',
        description: 'La propiedad se vendió, se alquiló o fue dada de baja. Mirá opciones parecidas en Silvia Fernández Inmobiliaria.',
        robots: { index: false, follow: true },
      }
    }

    return buildPropertyMetadata(property)
  } catch {
    return {
      title: 'Detalle de propiedad | Silvia Fernández Inmobiliaria',
      description: 'Consultá propiedades en venta y alquiler con Silvia Fernández Inmobiliaria.',
    }
  }
}

export default async function PropertyPage({ params }) {
  let property = null
  try {
    property = await getPropertyById(params.id, { cache: 'no-store' })
  } catch (error) {
    // Falla del servidor (no una ficha dada de baja): aviso sin el detalle técnico
    console.error(`No se pudo cargar la ficha ${params.id}:`, error.message)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '7rem 1.5rem 3rem', textAlign: 'center' }}>
        <h1 style={{ color: '#0f172a', fontSize: '1.6rem', fontWeight: 800, marginBottom: '0.75rem' }}>No pudimos cargar esta propiedad</h1>
        <p style={{ color: '#475569', marginBottom: '1.5rem', maxWidth: 440 }}>Probá de nuevo en unos segundos. Si sigue igual, escribinos por WhatsApp y te la mandamos.</p>
        <a href={`/propiedad/${params.id}`} style={{ padding: '12px 24px', background: '#00815c', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: 700 }}>
          Reintentar
        </a>
      </div>
    )
  }

  // Ficha dada de baja o inexistente: 404 real para Google y página con parecidas (not-found.js)
  if (!property) notFound()

  const jsonLd = buildPropertyJsonLd(property)
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
        />
      )}
      <PropertyDetail property={property} />
    </>
  )
}
