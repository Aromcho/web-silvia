'use client';
import { useState, useEffect } from 'react';
import tokkoService from '../../services/tokkoService';
import './PropertiesSearch.css';

const PropertiesSearch = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    operation: 'venta',
    type: '',
    location: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: ''
  });

  // Mock data para desarrollo
  const mockProperties = [
    {
      id: 1,
      title: "Casa Moderna en Mar de las Pampas",
      price: 350000,
      operation: "venta",
      type: "casa",
      location: "Mar de las Pampas",
      bedrooms: 3,
      bathrooms: 2,
      surface: 180,
      images: ["/assets/images/property-1.jpg"],
      description: "Hermosa casa moderna con amplios espacios y excelente ubicación."
    },
    {
      id: 2,
      title: "Departamento Vista al Mar",
      price: 2500,
      operation: "alquiler",
      type: "departamento",
      location: "Centro",
      bedrooms: 2,
      bathrooms: 1,
      surface: 85,
      images: ["/assets/images/property-2.jpg"],
      description: "Departamento con vista panorámica al mar, totalmente equipado."
    },
    {
      id: 3,
      title: "Terreno en Zona Residencial",
      price: 120000,
      operation: "venta",
      type: "terreno",
      location: "Barrio Norte",
      bedrooms: 0,
      bathrooms: 0,
      surface: 600,
      images: ["/assets/images/property-3.jpg"],
      description: "Excelente terreno para construcción en zona tranquila."
    }
  ];

  useEffect(() => {
    loadProperties();
  }, [filters]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      console.log('Loading properties with filters:', filters);
      // Usar el servicio de Tokko actualizado
      const apiProperties = await tokkoService.getProperties(filters);
      console.log('Properties loaded from API:', apiProperties.length, apiProperties);
      setProperties(apiProperties);
    } catch (error) {
      console.error('Error loading properties:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    loadProperties();
  };

  const formatPrice = (property) => {
    if (!property) return 'Consultar precio'
    
    // Manejar estructura de Tokko API
    let price = null
    let currency = 'ARS'
    
    if (property.operations && property.operations.length > 0) {
      const operation = property.operations[0]
      if (operation.prices && operation.prices.length > 0) {
        price = operation.prices[0].price
        currency = operation.prices[0].currency
      }
    } else {
      price = property.price || property.total_price
      currency = property.currency?.name || property.currency || 'ARS'
    }
    
    if (!price) return 'Consultar precio'
    
    try {
      // Mapear códigos de moneda de Tokko
      const currencyMap = {
        'Peso Argentino': 'ARS',
        'USD': 'USD',
        'Dólar Estadounidense': 'USD',
        'ARS': 'ARS'
      }
      
      const mappedCurrency = currencyMap[currency] || currency
      
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: mappedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price)
    } catch (error) {
      return `${currency} ${price.toLocaleString()}`
    }
  }

  return (
    <div className="properties-search">
      <div className="container">
        {/* Header */}
        <div className="properties-header">
          <h1>Todas las Propiedades</h1>
          <p>Encontrá la propiedad perfecta con nuestros filtros de búsqueda</p>
        </div>

        {/* Filtros de búsqueda */}
        <div className="search-filters">
          <form onSubmit={handleSearch} className="filters-form">
            <div className="filters-grid">
              {/* Operación */}
              <div className="filter-group">
                <label>Operación</label>
                <select 
                  value={filters.operation}
                  onChange={(e) => handleFilterChange('operation', e.target.value)}
                >
                  <option value="venta">Venta</option>
                  <option value="alquiler">Alquiler</option>
                </select>
              </div>

              {/* Tipo */}
              <div className="filter-group">
                <label>Tipo</label>
                <select 
                  value={filters.type}
                  onChange={(e) => handleFilterChange('type', e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="casa">Casa</option>
                  <option value="departamento">Departamento</option>
                  <option value="ph">PH</option>
                  <option value="terreno">Terreno</option>
                  <option value="local">Local</option>
                </select>
              </div>

              {/* Ubicación */}
              <div className="filter-group">
                <label>Ubicación</label>
                <input
                  type="text"
                  placeholder="Ingresá una ubicación"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Precio mínimo */}
              <div className="filter-group">
                <label>Precio mínimo</label>
                <input
                  type="number"
                  placeholder="Desde"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
              </div>

              {/* Precio máximo */}
              <div className="filter-group">
                <label>Precio máximo</label>
                <input
                  type="number"
                  placeholder="Hasta"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </div>

              {/* Dormitorios */}
              <div className="filter-group">
                <label>Dormitorios</label>
                <select 
                  value={filters.bedrooms}
                  onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                >
                  <option value="">Cualquiera</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                </select>
              </div>
            </div>

            <button type="submit" className="search-btn" disabled={loading}>
              {loading ? 'Buscando...' : 'Buscar Propiedades'}
            </button>
          </form>
        </div>

        {/* Resultados */}
        <div className="properties-results">
          <div className="results-header">
            <h3>
              {loading ? 'Cargando...' : `${properties.length} propiedades encontradas`}
            </h3>
          </div>

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
            <div className="properties-grid">
              {properties.map((property) => (
                <div key={property.id} className="property-card">
                  <div className="property-image">
                    <img 
                      src={
                        property.photos?.[0]?.image || 
                        property.photos?.[0]?.thumb || 
                        property.images?.[0] || 
                        'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen'
                      } 
                      alt={property.publication_title || property.title || property.address?.street_name || 'Propiedad'}
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/34495e/ffffff?text=Sin+Imagen';
                      }}
                    />
                    <div className="property-badge">
                      {property.operations && property.operations.length > 0 
                        ? (property.operations[0].operation_type === 'Sale' || property.operations[0].operation_id === 1 ? 'Venta' : 'Alquiler')
                        : (property.operation?.operation_type === 1 || property.operation === 'venta' ? 'Venta' : 'Alquiler')
                      }
                    </div>
                  </div>
                  
                  <div className="property-content">
                    <h4 className="property-title">
                      {property.publication_title || property.title || property.address?.street_name || 'Propiedad'}
                    </h4>
                    <p className="property-price">{formatPrice(property)}</p>
                    
                    <div className="property-details">
                      <span className="detail-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2"/>
                        </svg>
                        {property.surface}m²
                      </span>
                      
                      {(property.suite_amount || property.bedrooms) > 0 && (
                        <span className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M7 7h10v10H7z" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {property.suite_amount || property.bedrooms} dorm.
                        </span>
                      )}
                      
                      {(property.bathroom_amount || property.bathrooms) > 0 && (
                        <span className="detail-item">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2"/>
                          </svg>
                          {property.bathroom_amount || property.bathrooms} baños
                        </span>
                      )}
                    </div>
                    
                    <p className="property-location">
                      📍 {property.address?.city || property.location?.name || property.location || 'Ubicación no disponible'}, {property.address?.state || ''}
                    </p>
                    
                    <div className="property-actions">
                      <button className="btn-view">Ver Detalles</button>
                      <button className="btn-contact">Contactar</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesSearch;