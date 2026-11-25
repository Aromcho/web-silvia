import { Suspense } from 'react'
import PropertiesSearchNew from '../../components/PropertiesSearch/PropertiesSearchNew';

export const metadata = {
  title: 'Propiedades en venta y alquiler en Mar Azul y Mar de las Pampas | Silvia Fernández',
  description: 'Buscá casas, departamentos, lotes y complejos en venta y alquiler en Mar Azul, Las Gaviotas, Mar de las Pampas y Villa Gesell, con filtros por tipo, precio y zona.',
  keywords: 'propiedades, casas, departamentos, alquiler, venta, inmobiliaria, mar de las pampas, mar azul, alquileres temporales',
  // Los filtros (?operation=...&type=...) son la misma página: Google indexa una sola
  alternates: { canonical: '/propiedades' },
};

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesSearchNew />
    </Suspense>
  );
}