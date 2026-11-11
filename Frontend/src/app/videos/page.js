import Videoteca from '../../components/Videoteca/Videoteca'

export const metadata = {
  title: 'Videos de propiedades | Silvia Fernández Propiedades',
  description:
    'Recorré en video casas, departamentos y alquileres temporarios en Villa Gesell, Mar de las Pampas y la zona. Cada video con link para compartir.',
  alternates: { canonical: '/videos' },
  openGraph: {
    title: 'Videos de propiedades | Silvia Fernández Propiedades',
    description: 'Recorré las propiedades en video antes de visitarlas.',
    url: 'https://www.silviafernandezpropiedades.com.ar/videos',
    type: 'website',
  },
}

export default function VideosPage() {
  return <Videoteca />
}
