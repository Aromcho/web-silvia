'use client';
import PropertiesGrid from '../../components/PropertiesGrid/PropertiesGrid';
import './page.css';

export default function LotesPage() {
  return (
    <div className="lotes-page">
      <div className="page-hero">
        <div className="container">
          <h1>Lotes y Terrenos</h1>
          <p>Encontrá el terreno perfecto para construir tu proyecto</p>
        </div>
      </div>
      <PropertiesGrid filters={{ type: 'terreno', operation: 'venta' }} />
    </div>
  );
}
