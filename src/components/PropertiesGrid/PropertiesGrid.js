'use client';
import { useState, useEffect, useRef } from 'react';
import { getProperties } from '../../services/propertyService';
import PropertyCard from '../PropertyCard/PropertyCard';
import './PropertiesGrid.css';

const PAGE_SIZE = 12;
const CATEGORY_CACHE_KEY_PREFIX = 'silvia-category-properties-cache-v1';

let cachedCategoryResults = null;

const safeStorageGet = (key) => {
  if (typeof window === 'undefined') return null;

  try {
    return window.sessionStorage.getItem(key);
  } catch (error) {
    console.warn('No se pudo leer el cache de categorias:', error);
    return null;
  }
};

const safeStorageSet = (key, value) => {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(key, value);
  } catch (error) {
    console.warn('No se pudo guardar el cache de categorias:', error);
  }
};

const buildCategoryCacheKey = (filters) => {
  return `${CATEGORY_CACHE_KEY_PREFIX}:${JSON.stringify({
    type: filters.type || '',
    operation: filters.operation || '',
    barrio: filters.barrio || '',
    minPrice: filters.minPrice || '',
    maxPrice: filters.maxPrice || '',
    minRooms: filters.minRooms || '',
    maxRooms: filters.maxRooms || '',
  })}`;
};

const readCategoryCache = (cacheKey) => {
  if (cachedCategoryResults?.[cacheKey]) {
    return cachedCategoryResults[cacheKey];
  }

  const rawValue = safeStorageGet(cacheKey);
  if (!rawValue) return null;

  try {
    const parsedValue = JSON.parse(rawValue);
    cachedCategoryResults = cachedCategoryResults || {};
    cachedCategoryResults[cacheKey] = parsedValue;
    return parsedValue;
  } catch (error) {
    console.warn('No se pudo parsear el cache de categorias:', error);
    return null;
  }
};

const writeCategoryCache = (cacheKey, value) => {
  cachedCategoryResults = cachedCategoryResults || {};
  cachedCategoryResults[cacheKey] = value;
  safeStorageSet(cacheKey, JSON.stringify(value));
};

const PropertiesGrid = ({ filters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const loadMoreRef = useRef(null);
  const requestIdRef = useRef(0);
  const cacheKeyRef = useRef(buildCategoryCacheKey(filters));

  useEffect(() => {
    const cacheKey = buildCategoryCacheKey(filters);
    cacheKeyRef.current = cacheKey;

    const cachedData = readCategoryCache(cacheKey);
    if (cachedData) {
      setProperties(cachedData.properties || []);
      setPage(cachedData.page || 0);
      setHasMore(Boolean(cachedData.hasMore));
      setTotalCount(cachedData.totalCount || (cachedData.properties?.length || 0));
      setLoading(false);
      setLoadingMore(false);
      return undefined;
    }

    setProperties([]);
    setPage(0);
    setHasMore(true);
    setTotalCount(0);
    loadProperties({ pageToLoad: 0, replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const buildApiFilters = (pageToLoad = 0) => {
    const apiFilters = {
      limit: PAGE_SIZE,
      offset: pageToLoad * PAGE_SIZE,
      order: 'DESC'
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
        'hotel': 'Hotel',
        'hoteles': 'Hotel',
        'emprendimiento': 'Emprendimiento',
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
        'alquiler temporario': 'Alquiler Temporario',
        'alquiler temporal': 'Alquiler Temporario',
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

    return apiFilters;
  };

  const loadProperties = async ({ pageToLoad = 0, replace = false } = {}) => {
    const requestId = ++requestIdRef.current;

    if (pageToLoad === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const apiFilters = buildApiFilters(pageToLoad);

      console.log('🔍 PropertiesGrid loading with filters:', apiFilters);
      const response = await getProperties(apiFilters);
      if (requestId !== requestIdRef.current) {
        return;
      }

      console.log('📦 PropertiesGrid response:', response);
      console.log('✅ Properties loaded:', response?.objects?.length || 0);
      const nextProperties = response?.objects || [];
      const total = response?.meta?.total_count || 0;
      setPage(pageToLoad);
      setTotalCount(total);
      setHasMore(nextProperties.length === PAGE_SIZE && (pageToLoad + 1) * PAGE_SIZE < total);
      setProperties((previous) => {
        const mergedProperties = replace ? nextProperties : [...previous, ...nextProperties];

        writeCategoryCache(cacheKeyRef.current, {
          properties: mergedProperties,
          page: pageToLoad,
          hasMore: nextProperties.length === PAGE_SIZE && (pageToLoad + 1) * PAGE_SIZE < total,
          totalCount: total,
        });

        return mergedProperties;
      });
    } catch (error) {
      if (requestId !== requestIdRef.current) {
        return;
      }
      console.error('❌ Error loading properties:', error);
      setProperties([]);
      setHasMore(false);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    if (!loadMoreRef.current || loading || loadingMore || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !loading && !loadingMore && hasMore) {
          loadProperties({ pageToLoad: page + 1, replace: false });
        }
      },
      {
        root: null,
        rootMargin: '300px 0px',
        threshold: 0.1,
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, page]);

  const formatPrice = (property) => {
    if (!property) return 'Consultar precio';

    // Verificar si es alquiler
    if (property.operations && property.operations.length > 0) {
      const operationType = property.operations[0].operation_type
      if (operationType && (operationType.includes('Alquiler') || operationType === 'Rent')) {
        return 'Consultar precio'
      }
    }

    let price = null;
    let currency = 'ARS';

    if (property.operations && property.operations.length > 0) {
      const operation = property.operations[0];
      if (operation.prices && operation.prices.length > 0) {
        price = operation.prices[0].price;
        currency = operation.prices[0].currency;
      }
    } else {
      price = property.price || property.total_price;
      currency = property.currency?.name || property.currency || 'ARS';
    }

    if (!price) return 'Consultar precio';

    const currencyMap = {
      'Peso Argentino': 'ARS',
      'Dólar Estadounidense': 'USD',
      USD: 'USD',
      ARS: 'ARS',
    };

    const mappedCurrency = currencyMap[currency] || currency;
    
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: mappedCurrency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(price);
    } catch (error) {
      return `${mappedCurrency} ${price.toLocaleString('es-AR')}`;
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
              <h3>{properties.length} propiedades encontradas{totalCount ? ` de ${totalCount}` : ''}</h3>
            </div>
            
            <div className="properties-grid">
              {properties.length === 0 ? (
                <div className="no-results">
                  <p>No se encontraron propiedades con los criterios seleccionados.</p>
                </div>
              ) : (
                properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    formatPrice={formatPrice}
                  />
                ))
              )}
            </div>

            <div ref={loadMoreRef} className="infinite-scroll-sentinel" aria-hidden="true" />

            {loadingMore && (
              <div className="loading-grid loading-more-grid">
                {[...Array(3)].map((_, i) => (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PropertiesGrid;
