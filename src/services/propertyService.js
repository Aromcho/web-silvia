/**
 * Property Service - Cliente API para consumir endpoints de propiedades
 * API Base: https://api.silviafernandezpropiedades.com.ar/api/property/
 * 
 * Endpoints disponibles:
 * - GET  /properties - Obtener lista de propiedades con filtros y paginación
 * - GET  /propertyDetail/:id - Obtener detalles completos de una propiedad
 * - GET  /:id - Obtener propiedad por ID (para compatibilidad)
 * - GET  /neighborhoods - Obtener lista de barrios/vecindarios
 * - GET  /favorites - Obtener múltiples propiedades por IDs (para favoritos)
 * - GET  /propertyDetail/:id/related - Obtener propiedades relacionadas
 * - GET  /properties/ids - Obtener todos los IDs de propiedades
 * - GET  /autocomplete - Autocompletado de direcciones y barrios
 */

const API_BASE_URL = 'http://localhost:8080/api/property';

/**
 * Realiza una petición GET a la API
 * @param {string} endpoint - Endpoint de la API (ej: /properties)
 * @param {object} params - Parámetros de query
 * @returns {Promise<object>} Respuesta de la API
 */
const fetchFromAPI = async (endpoint, params = {}) => {
  try {
    const url = new URL(`${API_BASE_URL}${endpoint}`);
    
    // Agregar parámetros de query
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        if (Array.isArray(params[key])) {
          params[key].forEach((value) => {
            if (value !== undefined && value !== null && value !== '') {
              url.searchParams.append(key, value);
            }
          });
        } else {
          url.searchParams.append(key, params[key]);
        }
      }
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

/**
 * Obtener lista de propiedades con filtros y paginación
 * @param {object} filters - Filtros disponibles:
 *   - operation_type: string[] - Tipos de operación (Venta, Alquiler, etc)
 *   - property_type: string[] - Tipos de propiedad (Casa, Departamento, etc)
 *   - minRooms: number - Mínimo de habitaciones
 *   - maxRooms: number - Máximo de habitaciones
 *   - minPrice: number - Precio mínimo
 *   - maxPrice: number - Precio máximo
 *   - barrio: string - Nombre del barrio
 *   - searchQuery: string - Búsqueda general (dirección, ubicación, título)
 *   - minGarages: number - Mínimo de cocheras
 *   - maxGarages: number - Máximo de cocheras
 *   - is_starred: boolean - Solo propiedades destacadas
 *   - limit: number - Cantidad de resultados (default: 10)
 *   - offset: number - Desplazamiento para paginación (default: 0)
 *   - order: string - Orden de precios ('ASC' o 'DESC', default: 'DESC')
 * @returns {Promise<object>} Propiedades con metadata de paginación
 * 
 * @example
 * const result = await getProperties({
 *   operation_type: ['Venta'],
 *   property_type: ['Departamento'],
 *   minPrice: 100000,
 *   maxPrice: 500000,
 *   limit: 20,
 *   offset: 0
 * });
 */
export const getProperties = async (filters = {}) => {
  const params = {
    operation_type: filters.operation_type,
    property_type: filters.property_type,
    minRooms: filters.minRooms,
    maxRooms: filters.maxRooms,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
    barrio: filters.barrio,
    searchQuery: filters.searchQuery,
    minGarages: filters.minGarages,
    maxGarages: filters.maxGarages,
    is_starred: filters.is_starred ? 'true' : undefined,
    limit: filters.limit || 10,
    offset: filters.offset || 0,
    order: filters.order || 'DESC',
  };

  return fetchFromAPI('/properties', params);
};

/**
 * Obtener detalles completos de una propiedad por ID
 * @param {number|string} id - ID de la propiedad
 * @returns {Promise<object>} Objeto propiedad completo
 * 
 * @example
 * const property = await getPropertyById(12345);
 */
export const getPropertyById = async (id) => {
  if (!id) {
    throw new Error('Property ID is required');
  }
  return fetchFromAPI(`/${id}`);
};

/**
 * Obtener barrios/vecindarios disponibles
 * Retorna lista de ciudades agrupadas por cantidad de propiedades
 * @returns {Promise<array>} Lista de barrios
 * 
 * @example
 * const neighborhoods = await getNeighborhoods();
 */
export const getNeighborhoods = async () => {
  return fetchFromAPI('/neighborhoods');
};

/**
 * Obtener múltiples propiedades por sus IDs
 * Útil para obtener propiedades favoritas guardadas
 * @param {number[]|string} ids - Array de IDs o string separado por comas
 * @returns {Promise<array>} Lista de propiedades
 * 
 * @example
 * const favorites = await getFavorites([12345, 67890, 11111]);
 * // o
 * const favorites = await getFavorites('12345,67890,11111');
 */
export const getFavorites = async (ids) => {
  if (!ids || (Array.isArray(ids) && ids.length === 0)) {
    throw new Error('IDs are required');
  }

  const list = Array.isArray(ids) ? ids.join(',') : ids;
  return fetchFromAPI('/favorites', { list });
};

/**
 * Obtener propiedades relacionadas a una propiedad específica
 * Busca por precio, ubicación y tipo de propiedad
 * @param {number|string} id - ID de la propiedad de referencia
 * @returns {Promise<array>} Array de propiedades relacionadas (máximo 5)
 * 
 * @example
 * const related = await getRelatedProperties(12345);
 */
export const getRelatedProperties = async (id) => {
  if (!id) {
    throw new Error('Property ID is required');
  }
  return fetchFromAPI(`/propertyDetail/${id}/related`);
};

/**
 * Obtener todos los IDs de propiedades disponibles
 * Útil para inicializar lista de propiedades o validar IDs
 * @returns {Promise<array>} Array de números con todos los IDs
 * 
 * @example
 * const allIds = await getAllPropertyIds();
 */
export const getAllPropertyIds = async () => {
  return fetchFromAPI('/properties/ids');
};

/**
 * Autocompletar direcciones y barrios
 * Búsqueda difusa (fuzzy search) con tolerancia a errores tipográficos
 * @param {string} query - Texto a buscar (dirección o barrio)
 * @returns {Promise<array>} Array de sugerencias con estructura {value, secundvalue}
 * 
 * @example
 * const suggestions = await autocompleteProperties('Belgrano');
 */
export const autocompleteProperties = async (query) => {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const params = {
    query: query.trim(),
  };

  return fetchFromAPI('/autocomplete', params);
};

/**
 * Hook/utilidad para construcción de filtros
 * Útil para manejar filtros complejos en componentes
 */
export const createFilterObject = (filterState) => {
  return {
    operation_type: filterState.operationType,
    property_type: filterState.propertyType,
    minRooms: filterState.minRooms,
    maxRooms: filterState.maxRooms,
    minPrice: filterState.minPrice,
    maxPrice: filterState.maxPrice,
    barrio: filterState.neighborhood,
    searchQuery: filterState.searchQuery,
    minGarages: filterState.minGarages,
    maxGarages: filterState.maxGarages,
    is_starred: filterState.isStarred,
    limit: filterState.limit || 10,
    offset: filterState.offset || 0,
    order: filterState.order || 'DESC',
  };
};

/**
 * Utilidad para formatear precio
 */
export const formatPrice = (price, currency = 'ARS') => {
  const formatter = new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(price);
};

/**
 * Utilidad para obtener la primera foto de una propiedad
 */
export const getFirstPhoto = (property) => {
  if (property.photos && property.photos.length > 0) {
    const frontCover = property.photos.find(photo => photo.is_front_cover);
    return frontCover ? frontCover.image : property.photos[0].image;
  }
  return null;
};

/**
 * Utilidad para obtener el precio de una operación específica
 */
export const getOperationPrice = (property, operationType = null) => {
  if (!property.operations || property.operations.length === 0) {
    return null;
  }

  let operation = property.operations[0];
  
  if (operationType) {
    operation = property.operations.find(
      op => op.operation_type?.toLowerCase() === operationType.toLowerCase()
    ) || property.operations[0];
  }

  if (operation.prices && operation.prices.length > 0) {
    return operation.prices[0].price;
  }

  return null;
};

/**
 * Utilidad para obtener el tipo de operación de una propiedad
 */
export const getOperationType = (property) => {
  if (property.operations && property.operations.length > 0) {
    return property.operations[0].operation_type;
  }
  return null;
};

export default {
  getProperties,
  getPropertyById,
  getNeighborhoods,
  getFavorites,
  getRelatedProperties,
  getAllPropertyIds,
  autocompleteProperties,
  createFilterObject,
  formatPrice,
  getFirstPhoto,
  getOperationPrice,
  getOperationType,
};
