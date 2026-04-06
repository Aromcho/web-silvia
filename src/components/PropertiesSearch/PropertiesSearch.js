'use client';
import { useState, useEffect } from 'react';
import { getProperties } from '../../services/propertyService';
import './PropertiesSearch.css';

const PropertiesSearch = ({ defaultFilters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    operation: defaultFilters.operation || 'venta',
    type: defaultFilters.type || '',
    location: defaultFilters.location || '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    minSurface: '',
    maxSurface: '',
    currency: 'USD',
    sortBy: 'recent'
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
  }, [filters]); // Recargar cuando cambien los filtros

  const loadProperties = async () => {
    setLoading(true);
    try {
      console.log('🔍 Loading properties with filters:', filters);
      
      // Mapear filtros para la API
      const apiFilters = {
        limit: 20,
        offset: 0
      };

      // Tipo de operación
      if (filters.operation) {
        apiFilters.operation = filters.operation;
        console.log('📋 Applied operation filter:', filters.operation);
      }

      // Tipo de propiedad
      if (filters.type) {
        apiFilters.type = filters.type;
        console.log('🏠 Applied type filter:', filters.type);
      }

      // Ubicación
      if (filters.location) {
        apiFilters.location = filters.location;
        console.log('📍 Applied location filter:', filters.location);
      }

      // Precio
      if (filters.minPrice) {
        apiFilters.minPrice = parseInt(filters.minPrice);
        console.log('💰 Applied min price filter:', filters.minPrice);
      }
      if (filters.maxPrice) {
        apiFilters.maxPrice = parseInt(filters.maxPrice);
        console.log('💰 Applied max price filter:', filters.maxPrice);
      }

      // Dormitorios
      if (filters.bedrooms) {
        apiFilters.bedrooms = parseInt(filters.bedrooms);
        console.log('🛏️ Applied bedrooms filter:', filters.bedrooms);
      }

      // Baños
      if (filters.bathrooms) {
        apiFilters.bathrooms = parseInt(filters.bathrooms);
        console.log('🚿 Applied bathrooms filter:', filters.bathrooms);
      }

      // Superficie
      if (filters.minSurface) {
        apiFilters.minSurface = parseInt(filters.minSurface);
        console.log('📐 Applied min surface filter:', filters.minSurface);
      }
      if (filters.maxSurface) {
        apiFilters.maxSurface = parseInt(filters.maxSurface);
        console.log('📐 Applied max surface filter:', filters.maxSurface);
      }

      console.log('📡 Final API filters:', apiFilters);
      const response = await getProperties(apiFilters);
      console.log('✅ Properties loaded from API:', response?.properties?.length || 0);
      setProperties(response?.properties || []);
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
    <div className="properties-search">
      <div className="container">
        {/* Filtros de búsqueda */}
        <div className="search-filters">
          <form onSubmit={handleSearch} className="filters-form">
            {/* Filtros siempre visibles */}
            <div className="filters-always-visible">
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

              {/* Ubicación */}
              <div className="filter-group filter-search">
                <label>Ubicación</label>
                <input
                  type="text"
                  placeholder="Ingresá una ubicación"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </div>

              {/* Ordenar por */}
              <div className="filter-group">
                <label>Ordenar</label>
                <select 
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                >
                  <option value="recent">Más recientes</option>
                  <option value="price-asc">Precio: menor a mayor</option>
                  <option value="price-desc">Precio: mayor a menor</option>
                  <option value="surface-desc">Mayor superficie</option>
                </select>
              </div>

              {/* Botón para mostrar más filtros en mobile */}
              <button 
                type="button" 
                className="toggle-filters-btn"
                onClick={() => setShowFilters(!showFilters)}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 4H21M3 8H21M10 12H21M10 16H21M3 12L7 16M3 16L7 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {showFilters ? 'Ocultar filtros' : 'Más filtros'}
              </button>
            </div>

            {/* Filtros adicionales (colapsables en mobile) */}
            <div className={`filters-collapsible ${showFilters ? 'filters-open' : ''}`}>
              <div className="filters-grid">
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
                    <option value="lote">Lote</option>
                    <option value="local">Local</option>
                    <option value="oficina">Oficina</option>
                    <option value="hotel">Complejo</option>
                  </select>
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

                {/* Baños */}
                <div className="filter-group">
                  <label>Baños</label>
                  <select 
                    value={filters.bathrooms}
                    onChange={(e) => handleFilterChange('bathrooms', e.target.value)}
                  >
                    <option value="">Cualquiera</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>

                {/* Superficie mínima */}
                <div className="filter-group">
                  <label>Superficie mín. (m²)</label>
                  <input
                    type="number"
                    placeholder="Desde"
                    value={filters.minSurface}
                    onChange={(e) => handleFilterChange('minSurface', e.target.value)}
                  />
                </div>

                {/* Superficie máxima */}
                <div className="filter-group">
                  <label>Superficie máx. (m²)</label>
                  <input
                    type="number"
                    placeholder="Hasta"
                    value={filters.maxSurface}
                    onChange={(e) => handleFilterChange('maxSurface', e.target.value)}
                  />
                </div>
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertiesSearch;