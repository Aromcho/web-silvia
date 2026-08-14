import axios from 'axios';
import Property from '../models/Property.model.js';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

// PROPERTY_SOURCE=crm: la fuente de propiedades es la API del CRM, que a su vez es la única
// que le habla a Tokko. Default 'tokko' (comportamiento actual) para que desplegar este código
// no cambie nada hasta setear CRM_API_URL/CRM_API_KEY y flipear la env var a propósito.
// Se lee en cada llamada (no una const de módulo): los imports de ES modules se evalúan
// antes que dotenv.config() en index.js, así que capturarla al importar siempre daba 'tokko'.
const getPropertySource = () => process.env.PROPERTY_SOURCE || 'tokko';

// Timestamp del último sync exitoso contra el CRM, en memoria (solo corre en el proceso
// primario del cluster). null en el primer run del proceso => trae todo, no solo el delta.
let lastCrmSyncAt = null;

function mapBranch(branch) {
  if (!branch || typeof branch !== 'object') return branch;
  return {
    ...branch,
    address: branch.address || '',
    email: branch.email || '',
    logo: branch.logo || '',
    phone: branch.phone || '',
  };
}

// El status que devuelve la API pública del CRM ya viene traducido a disponible/reservada/vendida
// (en_tasacion nunca se expone). Se pasa tal cual, no hay que re-derivarlo de un código numérico.
function mapCrmProperty(property) {
  // La API pública del CRM expone su propio _id de Mongo, que no tiene relación con el _id
  // del documento local: hay que descartarlo o el $set del bulkWrite falla con
  // "Performing an update on the path '_id' would modify the immutable field '_id'".
  const { _id, ...propertyWithoutId } = property;

  const photos = Array.isArray(property.photos)
    ? property.photos.map(img => ({
        image: img.local_image || img.image_url || '',
        description: img.description || '',
        is_blueprint: img.is_blueprint || false,
        is_front_cover: img.is_front_cover || false,
        order: img.order || 0,
        original: img.local_original || img.original_url || '',
        thumb: img.local_thumb || img.thumb_url || '',
      }))
    : [];

  const operations = Array.isArray(property.operations)
    ? property.operations.map(op => ({
        operation_type: op.operation_type || null,
        prices: (op.prices || []).map(price => ({
          currency: price.currency,
          price: price.price || 0,
          period: price.period || '',
        })),
      }))
    : [];

  return {
    ...propertyWithoutId,
    photos,
    operations,
    branch: mapBranch(property.branch),
    description: property.description || '',
    rich_description: property.rich_description || '',
  };
}

async function fetchAllFromCRM(updatedSince) {
  const baseUrl = (process.env.CRM_API_URL || '').replace(/\/$/, '');
  const limit = 500;
  let offset = 0;
  let total_count = 0;
  const all = [];

  do {
    const response = await axios.get(`${baseUrl}/api/public/properties`, {
      headers: { 'X-Api-Key': process.env.CRM_API_KEY },
      params: { updatedSince: updatedSince || undefined, limit, offset },
      timeout: 30000,
    });
    all.push(...response.data.objects);
    total_count = response.data.meta.total_count;
    offset += limit;
  } while (offset < total_count);

  return all;
}

async function syncFromCRM() {
  console.log('Iniciando sincronización con el CRM...');
  const syncStartedAt = new Date();

  const properties = await fetchAllFromCRM(lastCrmSyncAt);
  console.log(`Obtenidas ${properties.length} propiedades del CRM${lastCrmSyncAt ? ` (delta desde ${lastCrmSyncAt.toISOString()})` : ' (sync completo)'}.`);

  if (properties.length > 0) {
    const operations = properties.map(property => ({
      updateOne: {
        filter: { id: property.id },
        update: { $set: mapCrmProperty(property) },
        upsert: true,
      },
    }));

    const operationsChunks = chunkArray(operations, 100);
    for (const chunk of operationsChunks) {
      const result = await Property.bulkWrite(chunk);
      console.log(`Actualizadas ${result.modifiedCount} propiedades, insertadas ${result.upsertedCount} propiedades.`);
    }
  }

  lastCrmSyncAt = syncStartedAt;
  console.log('Sincronización con el CRM completada.');
}

// Borrados: no se detectan por delta (una baja no es un "update"). Corre aparte, con menos
// frecuencia, vía reconcileDeletedProperties() en el cron diario (ver index.js).
export async function reconcileDeletedProperties() {
  const baseUrl = (process.env.CRM_API_URL || '').replace(/\/$/, '');
  const response = await axios.get(`${baseUrl}/api/public/properties/ids`, {
    headers: { 'X-Api-Key': process.env.CRM_API_KEY },
    timeout: 30000,
  });
  const activeIds = response.data.ids || [];
  const result = await Property.deleteMany({ id: { $nin: activeIds } });
  console.log(`Reconciliación de borrados: ${result.deletedCount} propiedades eliminadas.`);
  return result.deletedCount;
}

async function syncFromTokkoDirect() {
  const limit = 20;
  let offset = 0;
  let total_count = 0;
  const syncedIds = new Set();

  console.log('Iniciando sincronización con Tokko...');

  do {
    console.log(`Obteniendo propiedades con offset: ${offset}`);

    const response = await axios.get('https://www.tokkobroker.com/api/v1/property/search/', {
      params: {
        key: process.env.TOKKO_TOKEN,
        lang: 'es_ar',
        format: 'json',
        limit,
        offset,
        data: JSON.stringify({
          with_custom_tags: [],
          current_localization_id: 0,
          current_localization_type: "country",
          price_from: 0,
          price_to: 999999999,
          operation_types: [1, 2, 3], // Venta, Alquiler, Alquiler temporal
          property_types: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 19, 20, 21, 22, 23, 24],
          currency: "ANY",
          filters: [],
          only_available: false, // 🔥 Esto habilita traer todas las propiedades, no solo disponibles
          append_available: "checked",
        }),
      },
    });

    // Primero filtras las propiedades excluidas para mostrarlas después
    const excludedProperties = response.data.objects.filter(property =>
      property.id === 4260629 || Number(property.status) === 1
    );

    // Luego, muestras las propiedades excluidas por consola
    if (excludedProperties.length > 0) {
      console.log('Propiedades excluidas en esta sincronización:', excludedProperties.map(p => ({
        id: p.id,
        status: p.status,
        title: p.publication_title || 'Sin título'
      })));
    }

    // Ahora sí filtras las propiedades que sí deseas sincronizar
    const properties = response.data.objects.filter(property =>
      property.id !== 4260629 && Number(property.status) !== 1
    );


    total_count = response.data.meta.total_count;

    console.log(`Obtenidas ${properties.length} propiedades de un total de ${total_count}.`);

    const operations = properties.map(property => {
      syncedIds.add(property.id);

      // Procesamiento de imágenes
      if (property.photos && Array.isArray(property.photos)) {
        property.photos = property.photos.map(img => ({
          image: img.image || '',
          description: img.description || '',
          is_blueprint: img.is_blueprint || false,
          is_front_cover: img.is_front_cover || false,
          order: img.order || 0,
          original: img.original || '',
          thumb: img.thumb || '',
        }));
      } else {
        property.photos = [];
      }

      // Procesamiento de operaciones
      if (property.operations && Array.isArray(property.operations)) {
        property.operations = property.operations.map(op => ({
          operation_type: op.operation_type || null,
          prices: op.prices.map(price => ({
            currency: price.currency,
            price: price.price || 0,
            period: price.period || ''
          }))
        }));
      } else {
        property.operations = [];
      }

      // Validaciones de branch
      property.branch = mapBranch(property.branch);

      property.description = property.description || '';
      property.rich_description = property.rich_description || '';

      // **Definir el estado de la propiedad**
      let status = "disponible"; // Valor por defecto

      // Convertimos `status` a número antes de evaluarlo
      const propertyStatus = Number(property.status);

      if (propertyStatus === 3) {
        status = "reservado";
      } else if (propertyStatus === 4) {
        status = "vendida";
      }

      return {
        updateOne: {
          filter: { id: property.id },
          update: {
            $set: { ...property, status } // Guardamos la propiedad con el nuevo `status`
          },
          upsert: true,
        }
      };
    });

    const operationsChunks = chunkArray(operations, 100);
    for (const chunk of operationsChunks) {
      const result = await Property.bulkWrite(chunk);
      console.log(`Actualizadas ${result.modifiedCount} propiedades, insertadas ${result.upsertedCount} propiedades.`);
      await delay(1000);
    }

    offset += limit;

  } while (offset < total_count);

  // **Eliminar propiedades que ya no están en Tokko**
  await Property.deleteMany({
    id: { $nin: Array.from(syncedIds) }
  });

  console.log('Sincronización completada y propiedades eliminadas si es necesario.');
}

export const syncWithTokko = async () => {
  try {
    if (getPropertySource() === 'crm') {
      await syncFromCRM();
    } else {
      await syncFromTokkoDirect();
    }
  } catch (error) {
    console.error('Error al sincronizar propiedades:', error);
  }
};
