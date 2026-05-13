import { Suspense } from 'react'
import PropertiesSearchNew from '../../components/PropertiesSearch/PropertiesSearchNew';

export const metadata = {
  title: 'Propiedades - Silvia Fernández | Inmobiliaria',
  description: 'Explorá todas nuestras propiedades disponibles para venta y alquiler. Usá nuestros filtros de búsqueda para encontrar la propiedad perfecta.',
  keywords: 'propiedades, casas, departamentos, alquiler, venta, inmobiliaria, mar de las pampas, mar azul, alquileres temporales',
  viewport: 'width=device-width, initial-scale=1.0'
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesSearchNew />
    </Suspense>
  );
}