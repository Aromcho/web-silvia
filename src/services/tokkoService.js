/**
 * Tokko CRM API Service
 * Migrated from TypeScript to JavaScript
 */

const TOKKO_API_URL = process.env.NEXT_PUBLIC_TOKKO_API_URL || 'https://www.tokkobroker.com/api/v1';
const TOKKO_API_KEY = process.env.NEXT_PUBLIC_TOKKO_API_KEY;

class TokkoService {
  constructor() {
    if (!TOKKO_API_KEY) {
      console.warn('Tokko API key not found. Please set NEXT_PUBLIC_TOKKO_API_KEY in your environment variables.');
    } else {
      console.log('Tokko API initialized with key:', TOKKO_API_KEY.substring(0, 10) + '...');
    }
  }

  /**
   * Make authenticated request to Tokko API
   * @param {string} endpoint - API endpoint
   * @param {object} options - Fetch options
   * @returns {Promise<any>} API response
   */
  async request(endpoint, options = {}) {
    if (!TOKKO_API_KEY) {
      throw new Error('Tokko API key not configured');
    }

    // Add API key as query parameter
    const url = new URL(`${TOKKO_API_URL}${endpoint}`);
    url.searchParams.append('key', TOKKO_API_KEY);
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      console.log('Making request to:', url.toString().replace(TOKKO_API_KEY, 'HIDDEN_KEY'));
      const response = await fetch(url.toString(), config);
      
      if (!response.ok) {
        throw new Error(`Tokko API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Tokko API response received, objects count:', data.objects ? data.objects.length : 0);
      return data;
    } catch (error) {
      console.error('Tokko API request failed:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>} API connection status
   */
  async testConnection() {
    try {
      console.log('Testing Tokko API connection...');
      const response = await this.request('/property/?limit=1&format=json');
      console.log('Connection test successful:', response);
      return response && response.objects !== undefined;
    } catch (error) {
      console.error('API connection test failed:', error);
      return false;
    }
  }

  /**
   * Get all properties
   * @param {object} filters - Query filters
   * @returns {Promise<Array>} List of properties
   */
  async getProperties(filters = {}) {
    try {
      console.log('🔍 Getting properties with filters:', filters);
      
      const queryParams = new URLSearchParams({
        key: TOKKO_API_KEY,
        format: 'json',
        limit: filters.limit || 20,
        offset: filters.offset || 0
      });

      // Filtros directos que sabemos que funcionan
      if (filters.property_type) {
        queryParams.append('property_type', filters.property_type);
      }

      if (filters.property_types && filters.property_types.length > 0) {
        // Usar el primer tipo de la lista para filtros simples
        queryParams.append('property_type', filters.property_types[0]);
      }

      if (filters.operation_type) {
        queryParams.append('operation_type', filters.operation_type);
      }

      if (filters.operation_types && filters.operation_types.length > 0) {
        // Usar el primer tipo de operación de la lista
        queryParams.append('operation_type', filters.operation_types[0]);
      }

      // Filtros de precio
      if (filters.price_from || filters.minPrice) {
        queryParams.append('price_from', filters.price_from || filters.minPrice);
      }
      if (filters.price_to || filters.maxPrice) {
        queryParams.append('price_to', filters.price_to || filters.maxPrice);
      }

      // Otros filtros
      if (filters.location) {
        queryParams.append('location__name__icontains', filters.location);
      }
      
      if (filters.suite_amount_from || filters.bedrooms) {
        queryParams.append('suite_amount_from', filters.suite_amount_from || filters.bedrooms);
      }
      
      if (filters.bathroom_amount_from || filters.bathrooms) {
        queryParams.append('bathroom_amount_from', filters.bathroom_amount_from || filters.bathrooms);
      }
      
      if (filters.surface_from || filters.minSurface) {
        queryParams.append('surface_from', filters.surface_from || filters.minSurface);
      }
      if (filters.surface_to || filters.maxSurface) {
        queryParams.append('surface_to', filters.surface_to || filters.maxSurface);
      }

      const endpoint = `/property/?${queryParams.toString()}`;
      console.log('� Request URL:', `${TOKKO_API_URL}${endpoint}`.replace(TOKKO_API_KEY, 'HIDDEN_KEY'));
      
      const response = await this.request(endpoint);
      console.log('📊 API Response - Properties count:', response.objects ? response.objects.length : 0);
      
      return response.objects || [];
    } catch (error) {
      console.error('❌ Error fetching properties:', error);
      throw error;
    }
  }

  /**
   * Get mock properties data for development
   * @returns {Array} Mock properties data
   */
  getMockProperties() {
    return [
      {
        id: 1,
        title: "Casa moderna en zona residencial",
        type: { name: "Casa" },
        operation: { operation_type: 1 },
        address: {
          street_name: "Av. Libertador 1234",
          city: "San Isidro",
          state: "Buenos Aires"
        },
        price: 450000,
        currency: "USD",
        surface: 180,
        suite_amount: 3,
        bathroom_amount: 2,
        is_starred_on_web: true,
        photos: [
          { image: "https://via.placeholder.com/400x300/34495e/ffffff?text=Casa+Moderna", thumb: "https://via.placeholder.com/400x300/34495e/ffffff?text=Casa+Moderna" }
        ]
      },
      {
        id: 2,
        title: "Departamento con vista al río",
        type: { name: "Departamento" },
        operation: { operation_type: 1 },
        address: {
          street_name: "Puerto Madero 567",
          city: "CABA",
          state: "Buenos Aires"
        },
        price: 320000,
        currency: "USD",
        surface: 85,
        suite_amount: 2,
        bathroom_amount: 2,
        is_starred_on_web: true,
        photos: [
          { image: "https://via.placeholder.com/400x300/3498db/ffffff?text=Departamento+Vista", thumb: "https://via.placeholder.com/400x300/3498db/ffffff?text=Departamento+Vista" }
        ]
      },
      {
        id: 3,
        title: "Casa para alquiler temporario",
        type: { name: "Casa alquiler" },
        operation: { operation_type: 2 },
        address: {
          street_name: "Costa del Sol 890",
          city: "Pinamar",
          state: "Buenos Aires"
        },
        price: 180000,
        currency: "ARS",
        surface: 120,
        suite_amount: 3,
        bathroom_amount: 2,
        is_starred_on_web: false,
        photos: [
          { image: "https://via.placeholder.com/400x300/e74c3c/ffffff?text=Casa+Alquiler", thumb: "https://via.placeholder.com/400x300/e74c3c/ffffff?text=Casa+Alquiler" }
        ]
      },
      {
        id: 4,
        title: "Terreno en zona comercial",
        type: { name: "Terreno" },
        operation: { operation_type: 1 },
        address: {
          street_name: "Ruta 9 Km 45",
          city: "Escobar",
          state: "Buenos Aires"
        },
        price: 85000,
        currency: "USD",
        surface: 500,
        suite_amount: null,
        bathroom_amount: null,
        is_starred_on_web: false,
        photos: [
          { image: "https://via.placeholder.com/400x300/27ae60/ffffff?text=Terreno+Comercial", thumb: "https://via.placeholder.com/400x300/27ae60/ffffff?text=Terreno+Comercial" }
        ]
      },
      {
        id: 5,
        title: "Departamento en el centro",
        type: { name: "Departamento" },
        operation: { operation_type: 2 },
        address: {
          street_name: "San Martín 456",
          city: "La Plata",
          state: "Buenos Aires"
        },
        price: 45000,
        currency: "ARS",
        surface: 65,
        suite_amount: 1,
        bathroom_amount: 1,
        is_starred_on_web: false,
        photos: [
          { image: "https://via.placeholder.com/400x300/9b59b6/ffffff?text=Depto+Centro", thumb: "https://via.placeholder.com/400x300/9b59b6/ffffff?text=Depto+Centro" }
        ]
      },
      {
        id: 6,
        title: "Casa quinta con piscina",
        type: { name: "Casa" },
        operation: { operation_type: 1 },
        address: {
          street_name: "Los Robles 123",
          city: "Tigre",
          state: "Buenos Aires"
        },
        price: 280000,
        currency: "USD",
        surface: 300,
        suite_amount: 4,
        bathroom_amount: 3,
        is_starred_on_web: true,
        photos: [
          { image: "https://via.placeholder.com/400x300/f39c12/ffffff?text=Casa+Quinta", thumb: "https://via.placeholder.com/400x300/f39c12/ffffff?text=Casa+Quinta" }
        ]
      },
      {
        id: 7,
        title: "Loft moderno en Palermo",
        type: { name: "Departamento" },
        operation: { operation_type: 2 },
        address: {
          street_name: "Honduras 2345",
          city: "CABA",
          state: "Buenos Aires"
        },
        price: 95000,
        currency: "ARS",
        surface: 55,
        suite_amount: 1,
        bathroom_amount: 1,
        is_starred_on_web: false,
        photos: [
          { image: "https://via.placeholder.com/400x300/1abc9c/ffffff?text=Loft+Palermo", thumb: "https://via.placeholder.com/400x300/1abc9c/ffffff?text=Loft+Palermo" }
        ]
      },
      {
        id: 8,
        title: "Terreno con vista al lago",
        type: { name: "Lote" },
        operation: { operation_type: 1 },
        address: {
          street_name: "Costanera Sur 789",
          city: "San Carlos de Bariloche",
          state: "Río Negro"
        },
        price: 120000,
        currency: "USD",
        surface: 800,
        suite_amount: null,
        bathroom_amount: null,
        is_starred_on_web: false,
        photos: [
          { image: "https://via.placeholder.com/400x300/2c3e50/ffffff?text=Terreno+Lago", thumb: "https://via.placeholder.com/400x300/2c3e50/ffffff?text=Terreno+Lago" }
        ]
      }
    ];
  }

  /**
   * Get property by ID
   * @param {string|number} id - Property ID
   * @returns {Promise<object>} Property details
   */
  async getPropertyById(id) {
    const endpoint = `/property/${id}`;
    return await this.request(endpoint);
  }

  /**
   * Get featured properties
   * @param {number} limit - Number of properties to return
   * @returns {Promise<Array>} List of featured properties
   */
  async getFeaturedProperties(limit = 6) {
    // Tokko API no permite filtrar directamente por is_starred_on_web
    // Vamos a obtener propiedades normales y filtrar localmente
    const queryParams = new URLSearchParams();
    queryParams.append('limit', (limit * 3).toString()); // Obtener más para filtrar
    queryParams.append('format', 'json');
    
    const endpoint = `/property/?${queryParams.toString()}`;
    const response = await this.request(endpoint);
    const allProperties = response.objects || [];
    
    // Filtrar propiedades destacadas localmente
    const featuredProperties = allProperties.filter(property => property.is_starred_on_web);
    
    // Retornar solo el límite solicitado
    return featuredProperties.slice(0, limit);
  }

  /**
   * Get properties by operation type with additional filters
   * @param {number} operationType - 1 for sale, 2 for rent
   * @param {number} limit - Number of properties to return
   * @param {object} additionalFilters - Additional filters to apply
   * @returns {Promise<Array>} List of properties
   */
  async getPropertiesByOperation(operationType, limit = 6, additionalFilters = {}) {
    const filters = {
      operation_type: operationType,
      limit: limit,
      ...additionalFilters
    };
    return await this.getProperties(filters);
  }

  /**
   * Get properties by type with additional filters
   * @param {string} propertyType - Property type name
   * @param {number} limit - Number of properties to return
   * @param {object} additionalFilters - Additional filters to apply
   * @returns {Promise<Array>} List of properties
   */
  async getPropertiesByType(propertyType, limit = 6, additionalFilters = {}) {
    const filters = {
      property_type__name__icontains: propertyType,
      limit: limit,
      ...additionalFilters
    };
    return await this.getProperties(filters);
  }

  /**
   * Get properties in a specific price range
   * @param {number} minPrice - Minimum price
   * @param {number} maxPrice - Maximum price
   * @param {number} limit - Number of properties to return
   * @param {object} additionalFilters - Additional filters to apply
   * @returns {Promise<Array>} List of properties
   */
  async getPropertiesByPriceRange(minPrice, maxPrice, limit = 20, additionalFilters = {}) {
    const filters = {
      price_from: minPrice,
      price_to: maxPrice,
      limit: limit,
      ...additionalFilters
    };
    return await this.getProperties(filters);
  }

  /**
   * Get properties by location
   * @param {string} location - Location name (partial match)
   * @param {number} limit - Number of properties to return
   * @param {object} additionalFilters - Additional filters to apply
   * @returns {Promise<Array>} List of properties
   */
  async getPropertiesByLocation(location, limit = 20, additionalFilters = {}) {
    const filters = {
      location__name__icontains: location,
      limit: limit,
      ...additionalFilters
    };
    return await this.getProperties(filters);
  }

  /**
   * Search properties by text
   * @param {string} query - Search query
   * @param {object} additionalFilters - Additional filters
   * @returns {Promise<Array>} List of matching properties
   */
  async searchProperties(query, additionalFilters = {}) {
    const filters = {
      search: query,
      ...additionalFilters
    };
    return await this.getProperties(filters);
  }

  /**
   * Get property types
   * @returns {Promise<Array>} List of property types
   */
  async getPropertyTypes() {
    const endpoint = '/property-type';
    const response = await this.request(endpoint);
    return response.objects || [];
  }

  /**
   * Get locations
   * @returns {Promise<Array>} List of locations
   */
  async getLocations() {
    const endpoint = '/location';
    const response = await this.request(endpoint);
    return response.objects || [];
  }

  /**
   * Get agent information
   * @param {string|number} agentId - Agent ID
   * @returns {Promise<object>} Agent details
   */
  async getAgent(agentId) {
    const endpoint = `/agent/${agentId}`;
    return await this.request(endpoint);
  }

  /**
   * Submit contact form
   * @param {object} contactData - Contact form data
   * @returns {Promise<object>} Submission response
   */
  async submitContact(contactData) {
    const endpoint = '/contact';
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(contactData)
    });
  }

  /**
   * Request property viewing
   * @param {object} viewingData - Viewing request data
   * @returns {Promise<object>} Request response
   */
  async requestViewing(viewingData) {
    const endpoint = '/viewing-request';
    return await this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(viewingData)
    });
  }
}

// Create singleton instance
const tokkoService = new TokkoService();

// Export the instance as default and named export
export default tokkoService;
export { tokkoService };

// Named exports for specific methods
export const {
  getProperties,
  getPropertyById,
  getFeaturedProperties,
  searchProperties,
  getPropertyTypes,
  getLocations,
  getAgent,
  submitContact,
  requestViewing
} = tokkoService;