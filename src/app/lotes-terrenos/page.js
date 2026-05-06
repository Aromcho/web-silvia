import PropertiesGrid from '../../components/PropertiesGrid/PropertiesGrid';
import './page.css';

export const metadata = {
  title: 'Lotes y Terrenos | Silvia Fernández Inmobiliaria',
  description: 'Encontrá lotes y terrenos en venta en Mar de las Pampas, Mar Azul y alrededores con asesoramiento inmobiliario profesional.',
  alternates: {
    canonical: '/lotes-terrenos',
  },
};

export default function LotesPage() {
  return (
    <div className="lotes-page">
      <div className="page-hero">
        <div className="container">
          <h1>Lotes y Terrenos</h1>
          <p>Encontrá el terreno perfecto para construir tu proyecto</p>
        </div>
      </div>
      <PropertiesGrid filters={{ type: 'terreno' }} />
    </div>
  );
}
