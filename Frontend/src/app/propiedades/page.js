import { Suspense } from 'react'
import PropertiesSearchNew from '../../components/PropertiesSearch/PropertiesSearchNew';
import { searchMetadata } from '../../helpers/searchFilters';

// El único buscador del sitio. Título, descripción y canonical salen de los filtros de la URL
// (operación, tipo y zona): «Lotes y terrenos en venta…», «Propiedades en alquiler temporario…».
export function generateMetadata({ searchParams }) {
  return searchMetadata(searchParams);
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <PropertiesSearchNew />
    </Suspense>
  );
}