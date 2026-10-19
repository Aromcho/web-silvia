import TemporaryRentalBrowser from '../../components/TemporaryRentalBrowser/TemporaryRentalBrowser';
import '../lotes-terrenos/page.css';

export const metadata = {
  title: 'Alquiler Temporario | Silvia Fernández Inmobiliaria',
  description: 'Descubrí opciones de alquiler temporario en las mejores ubicaciones de Mar de las Pampas y Mar Azul.',
  alternates: {
    canonical: '/alquiler-temporario',
  },
};

export default function AlquilerTemporarioPage() {
  return (
    <div className="alquiler-temporario-page">
      <div className="page-hero">
        <div className="container">
          <h1>Alquiler Temporario</h1>
          <p>Descubrí opciones de alquiler por temporada en las mejores ubicaciones</p>
        </div>
      </div>
      <TemporaryRentalBrowser />
    </div>
  );
}
