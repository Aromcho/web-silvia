import { getPropertyById } from '../../../services/propertyService'
import PropertyDetail from '../../../components/PropertyDetail/PropertyDetail'

const buildPropertyMetadata = (property) => {
  const title = property?.publication_title || property?.type?.name || 'Propiedad'
  const location = property?.location?.name || property?.address?.city || property?.address?.street_name || 'Mar de las Pampas'
  const operation = property?.operations?.[0]?.operation_type || 'venta o alquiler'

  return {
    title: `${title} | Silvia Fernández Inmobiliaria`,
    description: `Detalle de ${title} en ${location}. Consultá esta propiedad para ${operation} con Silvia Fernández Inmobiliaria.`,
    alternates: {
      canonical: `/propiedad/${property?.id || ''}`,
    },
    openGraph: {
      title: `${title} | Silvia Fernández Inmobiliaria`,
      description: `Detalle de ${title} en ${location}. Consultá esta propiedad para ${operation} con Silvia Fernández Inmobiliaria.`,
      url: `/propiedad/${property?.id || ''}`,
      type: 'article',
    },
  }
}

export async function generateMetadata({ params }) {
  try {
    const property = await getPropertyById(params.id)

    if (!property) {
      return {
        title: 'Propiedad no encontrada | Silvia Fernández Inmobiliaria',
        description: 'No encontramos la propiedad solicitada en Silvia Fernández Inmobiliaria.',
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
  try {
    const property = await getPropertyById(params.id)

    if (!property) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem', textAlign: 'center' }}>
          <h2 style={{ color: '#64748b', marginBottom: '1rem' }}>Propiedad no encontrada</h2>
          <a href="/propiedades" style={{ padding: '12px 24px', background: '#00815c', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>
            Volver a Propiedades
          </a>
        </div>
      )
    }

    return <PropertyDetail property={property} />
  } catch (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', padding: '2rem', textAlign: 'center' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error al cargar la propiedad</h2>
        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>{error.message}</p>
        <a href="/propiedades" style={{ padding: '12px 24px', background: '#00815c', color: 'white', borderRadius: '12px', textDecoration: 'none', fontWeight: '600' }}>
          Volver a Propiedades
        </a>
      </div>
    )
  }
}
