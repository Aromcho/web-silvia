import MapaClient from './MapaClient'

export const metadata = {
  title: 'Mapa de Propiedades | Silvia Fernández Inmobiliaria',
  description: 'Explorá nuestras propiedades en un mapa interactivo y ubicá oportunidades en Mar Azul y alrededores.',
  alternates: { canonical: '/mapa' },
}

async function getLocations() {
  try {
    const res = await fetch(
      'https://www.silviafernandezpropiedades.com.ar/api/locations',
      { next: { revalidate: 300 } } // cache 5 minutos en el servidor
    )
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

export default async function MapaPage() {
  const locations = await getLocations()
  return <MapaClient initialLocations={locations} />
}
