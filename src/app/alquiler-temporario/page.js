'use client';
import PropertiesGrid from '../../components/PropertiesGrid/PropertiesGrid';
import '../lotes-terrenos/page.css';

export default function AlquilerTemporarioPage() {
  return (
    <div className="alquiler-temporario-page">
      <div className="page-hero">
        <div className="container">
          <h1>Alquiler Temporario</h1>
          <p>Descubrí opciones de alquiler por temporada en las mejores ubicaciones</p>
        </div>
      </div>
      <PropertiesGrid filters={{ operation: 'alquiler temporario' }} />
    </div>
  );
}
