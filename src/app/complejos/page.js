'use client';
import PropertiesGrid from '../../components/PropertiesGrid/PropertiesGrid';
import '../lotes-terrenos/page.css';

export default function ComplejosPage() {
  return (
    <div className="complejos-page">
      <div className="page-hero">
        <div className="container">
          <h1>Complejos y Emprendimientos</h1>
          <p>Explorá nuestros complejos exclusivos y emprendimientos destacados</p>
        </div>
      </div>
      <PropertiesGrid filters={{ type: 'hotel' }} />
    </div>
  );
}
