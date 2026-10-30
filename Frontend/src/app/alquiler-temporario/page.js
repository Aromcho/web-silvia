import TemporaryRentalBrowser from '../../components/TemporaryRentalBrowser/TemporaryRentalBrowser';
import '../lotes-terrenos/page.css';

export const metadata = {
  title: 'Alquileres temporarios y anuales | Silvia Fernández Inmobiliaria',
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
      <TemporaryRentalBrowser />
    </div>
  );
}
