'use client';
import { useEffect, useState } from 'react';
import './page.css';

export default function MapaPage() {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    // Cargar propiedades para mostrar en el mapa
    const loadProperties = async () => {
      try {
        // Aquí conectarías con tu API
        const response = await fetch('http://localhost:8080/api/property/properties?limit=100');
        const data = await response.json();
        setProperties(data.properties || []);
      } catch (error) {
        console.error('Error cargando propiedades:', error);
      }
    };

    loadProperties();
    setMapLoaded(true);
  }, []);

  return (
    <div className="mapa-page">
      <div className="page-hero">
        <div className="container">
          <h1>Mapa de Propiedades</h1>
          <p>Explorá nuestras propiedades en el mapa interactivo</p>
        </div>
      </div>
      
      <div className="mapa-content">
        <div className="container">
          <div className="map-info">
            <h2>Mapa Interactivo de Propiedades</h2>
            <p>Visualizá todas nuestras propiedades disponibles en Mar Azul y alrededores</p>
          </div>

          <div className="map-container">
            {/* Mapa embebido de Google Maps como placeholder */}
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d50445.84318996028!2d-57.02280000000001!3d-37.3195!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x959c6d7b6e8e8e8f%3A0x1234567890abcdef!2sMar%20Azul%2C%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1234567890123!5m2!1ses!2sar"
              width="100%"
              height="600"
              style={{ border: 0, borderRadius: '20px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          <div className="map-stats">
            <div className="stat-card">
              <div className="stat-number">{properties.length || 0}</div>
              <div className="stat-label">Propiedades Disponibles</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">5+</div>
              <div className="stat-label">Barrios Cubiertos</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Ubicaciones Verificadas</div>
            </div>
          </div>

          <div className="map-instructions">
            <h3>¿Cómo usar el mapa?</h3>
            <div className="instructions-grid">
              <div className="instruction-item">
                <span className="instruction-icon">🔍</span>
                <h4>Explora</h4>
                <p>Navega por el mapa para ver todas las propiedades disponibles</p>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">📍</span>
                <h4>Ubica</h4>
                <p>Encuentra propiedades en tu zona de interés</p>
              </div>
              <div className="instruction-item">
                <span className="instruction-icon">💬</span>
                <h4>Consulta</h4>
                <p>Haz clic en una propiedad para ver más detalles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
