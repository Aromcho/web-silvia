import MapaClient from './MapaClient';

export const metadata = {
  title: 'Mapa de Propiedades | Silvia Fernández Inmobiliaria',
  description: 'Explorá nuestras propiedades en un mapa interactivo y ubicá oportunidades en Mar Azul y alrededores.',
  alternates: {
    canonical: '/mapa',
  },
};

export default function MapaPage() {
  return <MapaClient />;
}
