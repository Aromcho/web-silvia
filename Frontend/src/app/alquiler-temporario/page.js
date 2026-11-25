import { Suspense } from 'react';
import TemporaryRentalBrowser from '../../components/TemporaryRentalBrowser/TemporaryRentalBrowser';
import { PropertiesGridSkeleton } from '../../components/PropertiesGrid/PropertiesGrid';
import { ZoneChips } from '../../components/ZoneLinks/ZoneLinks';
import '../lotes-terrenos/page.css';

export const metadata = {
  title: 'Alquiler temporario y anual en Mar Azul y Mar de las Pampas | Silvia Fernández',
  description: 'Descubrí opciones de alquiler temporario y anual en las mejores ubicaciones de Mar de las Pampas y Mar Azul.',
  alternates: {
    canonical: '/alquiler-temporario',
  },
};

export default function AlquilerTemporarioPage() {
  return (
    <div className="alquiler-temporario-page">
      <div className="page-hero">
        <div className="container">
          <h1>Alquileres</h1>
          <p>Alquileres temporarios y anuales en las mejores ubicaciones</p>
        </div>
      </div>
      <ZoneChips typeKey="alquiler-temporario" />
      {/* TemporaryRentalBrowser lee ?tipo y ?personas con useSearchParams: Next pide un Suspense */}
      <Suspense fallback={<PropertiesGridSkeleton />}>
        <TemporaryRentalBrowser />
      </Suspense>
    </div>
  );
}
