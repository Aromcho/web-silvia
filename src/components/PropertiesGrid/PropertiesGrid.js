'use client';
import { useState, useEffect } from 'react';
import { getProperties } from '../../services/propertyService';
import './PropertiesGrid.css';

const PropertiesGrid = ({ filters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      // Mapear filtros del componente al formato de la API
      const apiFilters = {
        limit: 50,
        offset: 0
      };

      // Mapear type a property_type (array)
      if (filters.type) {
        const typeMap = {
          'casa': 'Casa',
          'departamento': 'Departamento',
          'terreno': 'Lote',
          'lote': 'Lote',
          'campo': 'Campo',
          'complejo': 'Complejo',
          'cochera': 'Cochera'
        };
        const mappedType = typeMap[filters.type.toLowerCase()] || filters.type;
        apiFilters.property_type = [mappedType];
      }

      // Mapear operation a operation_type (array)
      if (filters.operation) {
        const operationMap = {
          'venta': 'Venta',
          'alquiler': 'Alquiler',
          'alquiler-temporario': 'Alquiler Temporario',
          'alquiler-anual': 'Alquiler Anual'
        };
        const mappedOperation = operationMap[filters.operation.toLowerCase()] || filters.operation;
        apiFilters.operation_type = [mappedOperation];
      }

      // Otros filtros opcionales
      if (filters.barrio) apiFilters.barrio = filters.barrio;
      if (filters.minPrice) apiFilters.minPrice = filters.minPrice;
      if (filters.maxPrice) apiFilters.maxPrice = filters.maxPrice;
      if (filters.minRooms) apiFilters.minRooms = filters.minRooms;
      if (filters.maxRooms) apiFilters.maxRooms = filters.maxRooms;

      console.log('🔍 PropertiesGrid loading with filters:', apiFilters);
      const response = await getProperties(apiFilters);
      console.log('📦 PropertiesGrid response:', response);
      console.log('✅ Properties loaded:', response?.objects?.length || 0);
      setProperties(response?.objects || []);
    } catch (error) {
      console.error('❌ Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (property) => {
    if (!property || !property.price) return 'Consultar precio';
    
    const currency = property.currency || 'USD';
    const price = property.price;
    
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    } catch (error) {
      return `${currency} ${price.toLocaleString()}`;
    }
  };

  return (
    <div className="properties-grid-container">
      <div className="container">
        {loading ? (
          <div className="loading-grid">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="property-skeleton">
                <div className="skeleton-image"></div>
                <div className="skeleton-content">
                  <div className="skeleton-title"></div>
                  <div className="skeleton-price"></div>
                  <div className="skeleton-details"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="results-count">
              <h3>{properties.length} propiedades encontradas</h3>
            </div>
            
            <div className="properties-grid">
              {properties.length === 0 ? (
                <div className="no-results">
                  <p>No se encontraron propiedades con los criterios seleccionados.</p>
                </div>
              ) : (
                properties.map((property) => (
                  <div key={property.id} className="property-card">
                    <div className="property-image">
                      <img 
                        src={property.images?.[0] || 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen'} 
                        alt={property.title || 'Propiedad'}
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen';
                        }}
                      />
                      <div className="property-badge">
                        {property.operation === 'venta' ? 'Venta' : 'Alquiler'}
                      </div>
                    </div>
                    
                    <div className="property-content">
                      <h4 className="property-title">
                        {property.title || 'Propiedad'}
                      </h4>
                      <p className="property-price">{formatPrice(property)}</p>
                      
                      <div className="property-details">
                        <span className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {property.surface || 0}m²
                        </span>
                        
                        {property.bedrooms > 0 && (
                          <span className="detail-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {property.bedrooms} dorm.
                          </span>
                        )}
                        
                        {property.bathrooms > 0 && (
                          <span className="detail-item">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                            </svg>
                            {property.bathrooms} baños
                          </span>
                        )}
                      </div>
                      
                      <p className="property-location">
                        📍 {property.location || 'Ubicación no disponible'}
                      </p>
                      
                      <div className="property-actions">
                        <button className="btn-view">Ver Detalles</button>
                        <button className="btn-contact">Contactar</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesGrid;
