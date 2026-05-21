import Property from '../models/Property.model.js';
import PropertyManager from '../manager/property.manager.js';
import Fuse from 'fuse.js';
import fs from 'fs';
import path from 'path';

const normalizeText = (value = '') => String(value)
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .trim()
  .toLowerCase();

const escapeRegex = (value = '') => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const splitQueryValues = (value) => {
  if (value === undefined || value === null) return [];

  const rawValues = Array.isArray(value) ? value : [value];

  return rawValues
    .flatMap((item) => String(item).split(','))
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildRegexList = (values, aliases) => {
  const normalizedValues = values.map(normalizeText);
  const patterns = new Set();

  normalizedValues.forEach((value) => {
    if (!value) return;

    const matchingAlias = Object.entries(aliases).find(([key, entryValues]) => {
      if (normalizeText(key) === value) return true;
      return entryValues.some((entryValue) => normalizeText(entryValue) === value);
    });

    const entryValues = matchingAlias ? matchingAlias[1] : [value];

    entryValues.forEach((entryValue) => {
      if (entryValue) {
        patterns.add(new RegExp(escapeRegex(entryValue), 'i'));
      }
    });
  });

  return Array.from(patterns);
};

const OPERATION_ALIASES = {
  venta: ['Venta', 'Sale'],
  compras: ['Venta', 'Sale'],
  comprar: ['Venta', 'Sale'],
  alquiler: ['Alquiler', 'Rent'],
  alquileres: ['Alquiler', 'Rent'],
  'alquiler temporal': ['Alquiler', 'Alquiler temporal', 'Alquiler Temporario', 'Temporary Rent'],
  'alquiler temporario': ['Alquiler', 'Alquiler temporal', 'Alquiler Temporario', 'Temporary Rent'],
};

const PROPERTY_TYPE_ALIASES = {
  casa: ['Casa', 'Casas', 'House'],
  departamento: ['Departamento', 'Departamentos', 'Apartment', 'Flat'],
  ph: ['PH'],
  terreno: ['Terreno', 'Terrenos', 'Lote', 'Lotes', 'Campo'],
  lote: ['Terreno', 'Terrenos', 'Lote', 'Lotes', 'Campo'],
  local: ['Local', 'Locales', 'Local Comercial'],
  oficina: ['Oficina', 'Oficinas'],
  complejo: ['Complejo', 'Complejos', 'Hotel', 'Hoteles', 'Hotelero', 'Apart Hotel', 'Emprendimiento'],
  hoteles: ['Complejo', 'Complejos', 'Hotel', 'Hoteles', 'Hotelero', 'Apart Hotel', 'Emprendimiento'],
  hotel: ['Complejo', 'Complejos', 'Hotel', 'Hoteles', 'Hotelero', 'Apart Hotel', 'Emprendimiento'],
};


// Obtener la latitud y longitud de todas las propiedades
const getPropertyLocations = async (req, res) => {
  try {
    const { property_type } = req.query; // Obtener el tipo de propiedad del query string

    // Construir el filtro base
    const filter = { 
      geo_lat: { $ne: null }, 
      geo_long: { $ne: null } 
    };

    // Si se especifica un tipo de propiedad, agregarlo al filtro
    if (property_type && property_type !== 'all') {
      filter['type.name'] = property_type;
    }

    const properties = await Property.find(
      filter,
      { id: 1, address: 1, geo_lat: 1, geo_long: 1, publication_title: 1, type: 1, photos: 1 } // Incluimos type y photos
    ).lean();

    if (!properties.length) {
      return res.status(404).json({ message: "No se encontraron propiedades con ubicación" });
    }

    const formattedProperties = properties.map((property) => ({
      id: property.id ? property.id.toString() : "sin-id",
      name: property.publication_title || "Propiedad sin título",
      address: property.address || "Dirección no disponible",
      type: property.type?.name || "Sin tipo",
      photo: property.photos?.[0]?.image || "/images/default-property.jpg", // Primera foto o imagen por defecto
      loc: {
        lat: property.geo_lat,
        lon: property.geo_long,
      },
    }));

    res.status(200).json(formattedProperties);
  } catch (error) {
    console.error("Error al obtener las ubicaciones de propiedades:", error);
    res.status(500).json({ message: "Error al obtener ubicaciones", error });
  }
};

// Crear una nueva propiedad

const createProperty = async (req, res) => {
  try {
    // Obtener los datos enviados en el cuerpo de la solicitud
    const { body } = req.body;

    // Validar datos básicos antes de guardar (puedes ampliar esta validación)
    if (!body.id || !body.address || !body.operations || !Array.isArray(body.operations)) {
      return res.status(400).json({ message: 'Datos incompletos. Se requiere al menos: id, address y operations.' });
    }

    // Crear una nueva instancia de la propiedad
    const newProperty = new Property(body);

    // Guardar la propiedad en la base de datos
    await newProperty.save();

    // Responder con el objeto creado
    res.status(201).json({
      message: 'Propiedad creada exitosamente',
      property: newProperty,
    });
  } catch (error) {
    console.error('Error al crear la propiedad:', error);

    // Manejo de errores específicos, como duplicados
    if (error.code === 11000) {
      return res.status(409).json({ message: 'La propiedad ya existe', error });
    }

    res.status(500).json({ message: 'Error al crear la propiedad', error });
  }
};
// Buscar propiedad por ID
const getpropertyById = async (req, res) => {
  const { id } = req.params;

  try {
    // Convertir el id a número (si es necesario)
    const numericId = parseInt(id, 10);

    // Buscar la propiedad por el campo `id` (en lugar de `_id`) y usar lean() para optimizar
    const property = await property.findOne({ id: numericId }).lean(); // Usamos .lean()

    if (!property) {
      return res.status(404).json({ message: 'Propiedad no encontrada' });
    }

    res.status(200).json(property);
  } catch (error) {
    console.error('Error al obtener la propiedad:', error);
    res.status(500).json({ message: 'Error al obtener la propiedad' });
  }
};

const getProperties = async (req, res) => {
  try {
    const {
      operation_type,
      property_type,
      minRooms,
      maxRooms,
      minPrice,
      maxPrice,
      barrio,
      searchQuery,
      minGarages,
      maxGarages,
      limit = 10,
      offset = 0,
      order = 'DESC',
      is_starred,
    } = req.query;

    const andConditions = [];

    // Filtro por tipo de operación
    const requestedOperations = splitQueryValues(operation_type);
    if (requestedOperations.length > 0) {
      const operationRegexes = buildRegexList(requestedOperations, OPERATION_ALIASES);

      if (operationRegexes.length > 0) {
        andConditions.push({ 'operations.operation_type': { $in: operationRegexes } });
      }
    }

    // Filtro por tipo de propiedad
    const requestedPropertyTypes = splitQueryValues(property_type).filter((value) => value !== '-1' && normalizeText(value) !== 'all');
    if (requestedPropertyTypes.length > 0) {
      const propertyTypeRegexes = buildRegexList(requestedPropertyTypes, PROPERTY_TYPE_ALIASES);

      if (propertyTypeRegexes.length > 0) {
        andConditions.push({ 'type.name': { $in: propertyTypeRegexes } });
      }
    }

    // Filtro por cantidad de habitaciones
    if (minRooms || maxRooms) {
      const roomFilter = {};
      if (minRooms) {
        roomFilter.$gte = parseInt(minRooms, 10);
      }
      if (maxRooms) {
        roomFilter.$lte = parseInt(maxRooms, 10);
      }
      andConditions.push({ suite_amount: roomFilter });
    }

    // Filtro por rango de precios
    if (minPrice || maxPrice) {
      const priceFilter = {};
      if (minPrice) {
        priceFilter.$gte = parseInt(minPrice, 10);
      }
      if (maxPrice) {
        priceFilter.$lte = parseInt(maxPrice, 10);
      }
      andConditions.push({ 'operations.prices.price': priceFilter });
    }

    // Filtro por barrio
    if (barrio && barrio.length > 0) {
      andConditions.push({ 'location.name': { $regex: barrio, $options: 'i' } });
    }

    // Filtro de búsqueda general
    if (searchQuery && searchQuery.length > 0) {
      const trimmedQuery = searchQuery.trim();
      const normalizedTokens = normalizeText(trimmedQuery)
        .split(/\s+/)
        .filter((token) => token.length > 1);

      const searchableFields = [
        'address',
        'location.full_location',
        'location.name',
        'publication_title',
        'real_address',
        'description',
        'rich_description',
        'producer.name',
        'type.name',
      ];

      const searchConditions = [
        { $or: searchableFields.map((field) => ({ [field]: { $regex: trimmedQuery, $options: 'i' } })) },
      ];

      if (normalizedTokens.length > 1) {
        searchConditions.push({
          $and: normalizedTokens.map((token) => ({
            $or: searchableFields.map((field) => ({ [field]: { $regex: token, $options: 'i' } })),
          })),
        });
      }

      const numericSearch = parseInt(trimmedQuery, 10);
      if (!isNaN(numericSearch)) {
        searchConditions.push({ id: numericSearch });
      }

      andConditions.push({ $or: searchConditions });
    }

    // Filtro por cocheras (garages)
    if (minGarages || maxGarages) {
      const garageFilter = {};
      if (minGarages) {
        garageFilter.$gte = parseInt(minGarages, 10);
      }
      if (maxGarages) {
        garageFilter.$lte = parseInt(maxGarages, 10);
      }
      andConditions.push({ parking_lot_amount: garageFilter });
    }

    // Filtro por "destacados"
    if (is_starred === 'true') {
      andConditions.push({ is_starred_on_web: true });
    }

    const filterObj = andConditions.length > 0 ? { $and: andConditions } : {};

    let sortObj;
    if (order === 'price_asc') {
      sortObj = { 'operations.prices.price': 1 };
    } else if (order === 'price_desc') {
      sortObj = { 'operations.prices.price': -1 };
    } else {
      sortObj = { created_at: -1 };
    }


    const properties = await PropertyManager.paginate({
      filter: filterObj,
      opts: {
        sort: sortObj,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      },
      projection: 'id address suite_amount operations.prices location.name created_at',
      lean: true,
    });

    const total_count = properties.totalDocs;

    res.json({
      meta: {
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
        total_count,
      },
      objects: properties.docs,
    });
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    res.status(500).json({ message: 'Error al obtener propiedades', error });
  }
};



const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    // Asumiendo que "id" es un campo en el documento que no es el ObjectId de MongoDB
    const property = await PropertyManager.readByCustomId(id); // Usamos el método que busca por 'id'

    if (!property) {
      return res.status(404).json({ message: 'Propiedad no encontrada' });
    }

    res.json(property);
  } catch (error) {
    console.error('Error al obtener la propiedad:', error);
    res.status(500).json({ message: 'Error al obtener la propiedad' });
  }
};


const getRelatedProperties = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, location, propertyType } = req.query;

    // 1. Buscar la propiedad de referencia usando el campo 'id' (no '_id')
    const currentProperty = await Property.findOne({ id: parseInt(id) }).lean();
    if (!currentProperty) {
      return res.status(404).json({ message: 'Propiedad no encontrada' });
    }

    const currentPrice = currentProperty.operations[0].prices[0].price;
    const currentLocation = currentProperty.location.name;
    const currentType = currentProperty.type.name;

    // 2. Configurar un margen de tolerancia para los precios (por ejemplo, ± 20%)
    const priceTolerance = 0.2; // 20% de margen
    const minPrice = currentPrice * (1 - priceTolerance);
    const maxPrice = currentPrice * (1 + priceTolerance);

    // 3. Intentar encontrar propiedades que coincidan en precio, ubicación y tipo
    let relatedProperties = await Property.find({
      "operations.prices.price": { $gte: minPrice, $lte: maxPrice },
      "location.name": currentLocation,
      "type.name": currentType,
      id: { $ne: currentProperty.id } // Excluir la propiedad actual
    }).lean();

    // 4. Si no encontramos propiedades, relajamos los criterios progresivamente
    if (relatedProperties.length === 0) {
      // Buscar solo por precio y tipo
      relatedProperties = await Property.find({
        "operations.prices.price": { $gte: minPrice, $lte: maxPrice },
        "type.name": currentType,
        id: { $ne: currentProperty.id }
      }).lean();
    }

    // 5. Si aún no hay resultados, relajamos aún más, buscando solo por precio
    if (relatedProperties.length === 0) {
      relatedProperties = await Property.find({
        "operations.prices.price": { $gte: minPrice, $lte: maxPrice },
        id: { $ne: currentProperty.id }
      }).lean();
    }

    // 6. Aplicar "puntuación" de coincidencia (cuantos más criterios coinciden, mayor es la puntuación)
    relatedProperties = relatedProperties.map((property) => {
      let score = 0;
      if (property.type.name === currentType) score += 2; // Coincidencia de tipo tiene más peso
      if (property.location.name === currentLocation) score += 1; // Coincidencia de ubicación
      return { ...property, score };
    });

    // 7. Ordenar las propiedades por la puntuación de coincidencia
    relatedProperties.sort((a, b) => b.score - a.score);

    // 8. Limitar el número de propiedades a devolver (por ejemplo, 5 propiedades)
    const maxResults = 5;
    const topRelatedProperties = relatedProperties.slice(0, maxResults);

    // 9. Enviar el resultado de las propiedades relacionadas
    res.status(200).json(topRelatedProperties);
  } catch (error) {
    console.error('Error al obtener propiedades relacionadas:', error);
    res.status(500).json({ message: 'Error al obtener propiedades relacionadas', error });
  }
};

const getNeighborhoods = async (req, res) => {
  try {
    const neighborhoods = await PropertyManager.aggregate([
      {
        $group: {
          _id: "$location.city",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]).lean(); // Usamos lean()

    res.status(200).json(neighborhoods);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener vecindarios', error });
  }
};

const getFavorites = async (req, res) => {
  try {
    const { list } = req.query;
    const ids = list.split(',').map(id => parseInt(id, 10));

    const properties = await PropertyManager.read({ id: { $in: ids } }).lean(); // Usamos lean()

    res.status(200).json(properties);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener propiedades favoritas', error });
  }
};



const getAllPropertyIds = async (req, res) => {
  try {
    const properties = await PropertyManager.read({}, { id: 1 }).lean(); // Usamos lean()

    const ids = properties.map(property => property.id);

    res.status(200).json(ids);
  } catch (error) {
    console.error('Error al obtener los IDs de las propiedades:', error);
    res.status(500).json({ message: 'Error al obtener los IDs de las propiedades', error });
  }
};


const autocompleteProperties = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(400).json({ message: 'Query is required' });
    }

    // Cargar el archivo JSON
    const filePath = path.join(process.cwd(), 'direcciones_y_barrios.json');
    const jsonData = fs.readFileSync(filePath, 'utf-8');
    const properties = JSON.parse(jsonData);

    // Configuración de Fuse.js
    const options = {
      keys: ['value'], // Solo buscamos en el campo 'value'
      threshold: 0.3,  // Nivel de coincidencia para errores tipográficos
    };

    // Inicializa Fuse.js con los datos del archivo JSON
    const fuse = new Fuse(properties, options);

    // Realiza la búsqueda difusa
    const results = fuse.search(query);

    // Mapea los resultados a la estructura que necesitas para la respuesta
    const response = results.map(({ item }) => ({
      value: item.value,
      secundvalue: item.secundvalue || ''  // Si no tiene secundvalue, dejamos vacío
    }));

    res.json(response);
  } catch (error) {
    console.error('Error en autocompletado con Fuse.js:', error);
    res.status(500).json({ message: 'Error en autocompletado con Fuse.js', error });
  }
};



export {
  createProperty,
  getProperties,
  getPropertyById,
  getRelatedProperties,
  getNeighborhoods,
  getFavorites,
  getAllPropertyIds,
  getpropertyById,
  autocompleteProperties,
  getPropertyLocations,
};
