# Guía de Uso - Property Service

## 📋 Descripción

Este servicio proporciona una interfaz completa para consumir la API de propiedades desde Next.js. Está ubicado en la raíz del proyecto: `propertyService.js`

**API Base:** `https://api.silviafernandezpropiedades.com.ar/api/property/properties`

---

## 🚀 Importación

```javascript
// En tu componente Next.js
import {
  getProperties,
  getPropertyById,
  getNeighborhoods,
  getFavorites,
  getRelatedProperties,
  getAllPropertyIds,
  autocompleteProperties,
  formatPrice,
  getFirstPhoto,
  getOperationPrice,
  getOperationType,
} from '@/propertyService';
```

---

## 📚 Funciones Principales

### 1. **getProperties(filters)**

Obtiene lista de propiedades con filtros y paginación.

#### Parámetros de filtro:

```javascript
{
  operation_type: ['Venta', 'Alquiler'],      // string[] - Tipos de operación
  property_type: ['Departamento', 'Casa'],    // string[] - Tipos de propiedad
  minRooms: 2,                                 // number - Mínimo de habitaciones
  maxRooms: 5,                                 // number - Máximo de habitaciones
  minPrice: 100000,                            // number - Precio mínimo
  maxPrice: 500000,                            // number - Precio máximo
  barrio: 'Belgrano',                         // string - Nombre del barrio
  searchQuery: 'Av. Libertador',              // string - Búsqueda general
  minGarages: 1,                              // number - Mínimo de cocheras
  maxGarages: 3,                              // number - Máximo de cocheras
  is_starred: true,                           // boolean - Solo destacadas
  limit: 20,                                  // number - Items por página (default: 10)
  offset: 0,                                  // number - Desplazamiento (default: 0)
  order: 'ASC'                                // string - 'ASC' o 'DESC' (default: 'DESC')
}
```

#### Respuesta:

```javascript
{
  meta: {
    limit: 20,
    offset: 0,
    total_count: 1250
  },
  objects: [
    {
      id: 12345,
      address: "Av. Libertador 1500",
      suite_amount: 2,
      operations: [...],
      location: {...},
      // ...más campos
    },
    // ...más propiedades
  ]
}
```

#### Ejemplo de uso:

```javascript
'use client'; // Si estás en componente cliente

import { useState, useEffect } from 'react';
import { getProperties } from '@/propertyService';

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const result = await getProperties({
          operation_type: ['Venta'],
          property_type: ['Departamento'],
          minPrice: 100000,
          maxPrice: 500000,
          limit: 12,
          offset: 0,
        });
        setProperties(result.objects);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  if (loading) return <div>Cargando...</div>;

  return (
    <div className="grid grid-cols-3 gap-4">
      {properties.map(prop => (
        <div key={prop.id} className="card">
          <h3>{prop.publication_title}</h3>
          <p>{prop.address}</p>
        </div>
      ))}
    </div>
  );
}
```

---

### 2. **getPropertyById(id)**

Obtiene detalles completos de una propiedad.

```javascript
const property = await getPropertyById(12345);

// Retorna objeto con todos los campos:
{
  id: 12345,
  address: "Av. Libertador 1500",
  publication_title: "Hermoso departamento...",
  suite_amount: 2,
  bathroom_amount: 2,
  parking_lot_amount: 1,
  operations: [
    {
      operation_id: 1,
      operation_type: "Venta",
      prices: [
        {
          currency: "ARS",
          period: "Única vez",
          price: 350000
        }
      ]
    }
  ],
  photos: [
    {
      image: "https://...",
      is_front_cover: true,
      // ...más fotos
    }
  ],
  location: {
    name: "Belgrano",
    full_location: "CABA, Belgrano",
    // ...
  },
  // ...muchos más campos
}
```

#### Ejemplo - Página de detalle:

```javascript
'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPropertyById, formatPrice, getFirstPhoto } from '@/propertyService';

export default function PropertyDetail() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);

  useEffect(() => {
    getPropertyById(id).then(setProperty).catch(console.error);
  }, [id]);

  if (!property) return <div>Cargando...</div>;

  const photo = getFirstPhoto(property);
  const price = property.operations?.[0]?.prices?.[0]?.price;

  return (
    <div>
      {photo && <img src={photo} alt={property.publication_title} />}
      <h1>{property.publication_title}</h1>
      <p>{property.address}</p>
      <p className="text-2xl font-bold">
        {price ? formatPrice(price) : 'Precio no disponible'}
      </p>
      <div className="specs">
        <span>🏠 {property.suite_amount} suites</span>
        <span>🚿 {property.bathroom_amount} baños</span>
        <span>🚗 {property.parking_lot_amount} cocheras</span>
      </div>
    </div>
  );
}
```

---

### 3. **getNeighborhoods()**

Obtiene lista de barrios con cantidad de propiedades.

```javascript
const neighborhoods = await getNeighborhoods();

// Retorna:
[
  {
    _id: "Belgrano",
    count: 125
  },
  {
    _id: "Caballito",
    count: 98
  },
  // ...
]
```

#### Ejemplo - Filtro de barrios:

```javascript
import { useEffect, useState } from 'react';
import { getNeighborhoods } from '@/propertyService';

export function NeighborhoodFilter({ onSelect }) {
  const [neighborhoods, setNeighborhoods] = useState([]);

  useEffect(() => {
    getNeighborhoods().then(setNeighborhoods);
  }, []);

  return (
    <select onChange={(e) => onSelect(e.target.value)}>
      <option value="">Todos los barrios</option>
      {neighborhoods.map(nb => (
        <option key={nb._id} value={nb._id}>
          {nb._id} ({nb.count})
        </option>
      ))}
    </select>
  );
}
```

---

### 4. **getFavorites(ids)**

Obtiene múltiples propiedades por sus IDs (para favoritos).

```javascript
// Acepta array o string separado por comas
const favorites1 = await getFavorites([12345, 67890, 11111]);
const favorites2 = await getFavorites('12345,67890,11111');

// Retorna array de propiedades
```

#### Ejemplo - Guardar/Cargar favoritos:

```javascript
'use client';

import { useState, useEffect } from 'react';
import { getFavorites } from '@/propertyService';

export function FavoritesList() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    // Obtener favoritos del localStorage
    const savedIds = JSON.parse(localStorage.getItem('favoriteIds') || '[]');
    if (savedIds.length > 0) {
      getFavorites(savedIds).then(setFavorites);
    }
  }, []);

  const toggleFavorite = (propertyId) => {
    const savedIds = JSON.parse(localStorage.getItem('favoriteIds') || '[]');
    const newIds = savedIds.includes(propertyId)
      ? savedIds.filter(id => id !== propertyId)
      : [...savedIds, propertyId];
    localStorage.setItem('favoriteIds', JSON.stringify(newIds));
  };

  return (
    <div>
      {favorites.map(prop => (
        <div key={prop.id}>
          <h3>{prop.publication_title}</h3>
          <button onClick={() => toggleFavorite(prop.id)}>
            ❤️ Favorito
          </button>
        </div>
      ))}
    </div>
  );
}
```

---

### 5. **getRelatedProperties(id)**

Obtiene propiedades relacionadas (similar precio, ubicación, tipo).

```javascript
const related = await getRelatedProperties(12345);

// Retorna array con máximo 5 propiedades similares
[
  { id: 54321, address: "...", score: 3 },
  { id: 99999, address: "...", score: 2 },
  // ...
]
```

#### Ejemplo:

```javascript
export function RelatedProperties({ propertyId }) {
  const [related, setRelated] = useState([]);

  useEffect(() => {
    getRelatedProperties(propertyId).then(setRelated);
  }, [propertyId]);

  return (
    <section>
      <h2>Propiedades Relacionadas</h2>
      <div className="grid grid-cols-4 gap-4">
        {related.map(prop => (
          <PropertyCard key={prop.id} property={prop} />
        ))}
      </div>
    </section>
  );
}
```

---

### 6. **getAllPropertyIds()**

Obtiene todos los IDs disponibles (útil para SEO, validaciones, etc).

```javascript
const allIds = await getAllPropertyIds();

// Retorna: [12345, 67890, 11111, ...]
```

---

### 7. **autocompleteProperties(query)**

Autocompletado fuzzy de direcciones y barrios.

```javascript
const suggestions = await autocompleteProperties('Belgrano');

// Retorna:
[
  {
    value: "Belgrano, CABA",
    secundvalue: "Buenos Aires"
  },
  {
    value: "Belgrano Sur, CABA",
    secundvalue: "Buenos Aires"
  },
  // ...
]
```

#### Ejemplo - Input con autocompletado:

```javascript
'use client';

import { useState } from 'react';
import { autocompleteProperties } from '@/propertyService';

export function SearchInput() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    
    if (value.length > 2) {
      const results = await autocompleteProperties(value);
      setSuggestions(results);
    }
  };

  return (
    <div className="search-container">
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Buscar por dirección o barrio..."
      />
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((sug, idx) => (
            <li key={idx} onClick={() => setQuery(sug.value)}>
              <strong>{sug.value}</strong>
              <small>{sug.secundvalue}</small>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🛠️ Funciones Utilidad

### **formatPrice(price, currency)**

Formatea precio en formato ARS

```javascript
formatPrice(350000, 'ARS');
// Retorna: "$350.000"
```

### **getFirstPhoto(property)**

Obtiene la primera foto (portada si existe)

```javascript
const photoUrl = getFirstPhoto(property);
```

### **getOperationPrice(property, operationType)**

Obtiene el precio de una operación específica

```javascript
const ventaPrice = getOperationPrice(property, 'Venta');
const alquilerPrice = getOperationPrice(property, 'Alquiler');
```

### **getOperationType(property)**

Obtiene el tipo de operación principal

```javascript
const type = getOperationType(property);
// Retorna: "Venta" o "Alquiler"
```

---

## 🔧 Manejo de Errores

```javascript
try {
  const properties = await getProperties({ limit: 10 });
} catch (error) {
  console.error('Error:', error);
  // Mostrar mensaje al usuario
}
```

---

## 📝 Estructura de Propiedad Completa

```javascript
{
  id: Number,
  address: String,
  publication_title: String,
  suite_amount: Number,
  bathroom_amount: Number,
  parking_lot_amount: Number,
  room_amount: Number,
  operations: [
    {
      operation_id: Number,
      operation_type: String, // "Venta", "Alquiler", etc
      prices: [
        {
          currency: String,   // "ARS"
          period: String,     // "Única vez", "Mensual", etc
          price: Number
        }
      ]
    }
  ],
  photos: [
    {
      image: String,
      thumb: String,
      is_front_cover: Boolean,
      description: String,
      order: Number
    }
  ],
  location: {
    name: String,           // Barrio
    full_location: String,  // Ubicación completa
    city: String
  },
  type: {
    name: String,           // "Departamento", "Casa", etc
    code: String,
    id: Number
  },
  geo_lat: Number,
  geo_long: Number,
  is_starred_on_web: Boolean,
  status: String,           // "disponible", "reservada", "vendida"
  created_at: Date,
  description: String,
  producer: {
    name: String,
    email: String,
    phone: String,
    picture: String
  },
  branch: Object
}
```

---

## 🎯 Ejemplos Completos

### Búsqueda Avanzada con Filtros

```javascript
'use client';

import { useState } from 'react';
import { getProperties } from '@/propertyService';

export default function AdvancedSearch() {
  const [filters, setFilters] = useState({
    operation_type: [],
    property_type: [],
    minPrice: '',
    maxPrice: '',
    minRooms: '',
    maxRooms: '',
  });
  
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await getProperties({
        operation_type: filters.operation_type.length > 0 ? filters.operation_type : undefined,
        property_type: filters.property_type.length > 0 ? filters.property_type : undefined,
        minPrice: filters.minPrice ? parseInt(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseInt(filters.maxPrice) : undefined,
        minRooms: filters.minRooms ? parseInt(filters.minRooms) : undefined,
        maxRooms: filters.maxRooms ? parseInt(filters.maxRooms) : undefined,
        limit: 20,
        offset: 0,
      });
      setResults(result);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Filtros aquí */}
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Buscando...' : 'Buscar'}
      </button>
      
      {results && (
        <div>
          <p>Se encontraron {results.meta.total_count} propiedades</p>
          {/* Mostrar resultados */}
        </div>
      )}
    </div>
  );
}
```

---

## 📌 Notas Importantes

1. **CORS**: La API debe estar configurada para aceptar requests desde tu dominio de Next.js
2. **Performance**: Considera cachear resultados localmente
3. **Paginación**: Usa `limit` y `offset` para implementar paginación eficiente
4. **Favoritos**: Guarda IDs en `localStorage` para persistencia en cliente
5. **Imágenes**: Las URLs de las fotos son externas, asegúrate de optimizarlas con Next.js Image

---

¡Listo! Ya puedes usar este servicio en tu aplicación Next.js. 🚀
