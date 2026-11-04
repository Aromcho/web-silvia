import axios from 'axios';
import Property from '../models/Property.model.js';
import RemovedProperty from '../models/RemovedProperty.model.js';

// Sincronización de propiedades desde el CRM (única fuente). Reemplaza a syncWithTokko.js:
// ya no se trabaja con Tokko, así que se sacó ese camino y el default PROPERTY_SOURCE='tokko'.

const chunkArray = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

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

  // Solo copias propias (las fotos que sirve el CRM desde su propio servidor).
  const photos = Array.isArray(property.photos)
    ? property.photos.map(img => ({
        image: img.local_image || '',
        description: img.description || '',
        is_blueprint: img.is_blueprint || false,
        is_front_cover: img.is_front_cover || false,
        order: img.order || 0,
        original: img.local_original || '',
        thumb: img.local_thumb || '',
      }))
    : [];

  const operations = Array.isArray(property.operations)
    ? property.operations.map(op => ({
        operation_type: op.operation_type || null,
        ...(typeof op.show_price === 'boolean' ? { show_price: op.show_price } : {}),
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
  const syncStartedAt = new Date();
  const properties = await fetchAllFromCRM(lastCrmSyncAt);

  if (properties.length > 0) {
    console.log(`Sync con el CRM: ${properties.length} propiedades${lastCrmSyncAt ? ` (delta desde ${lastCrmSyncAt.toISOString()})` : ' (sync completo)'}.`);
    const operations = properties.map(property => ({
      updateOne: {
        filter: { id: property.id },
        update: { $set: mapCrmProperty(property) },
        upsert: true,
      },
    }));

    for (const chunk of chunkArray(operations, 100)) {
      const result = await Property.bulkWrite(chunk);
      console.log(`Actualizadas ${result.modifiedCount} propiedades, insertadas ${result.upsertedCount} propiedades.`);
    }
  }

  lastCrmSyncAt = syncStartedAt;
}

export async function syncPropertiesFromCRM() {
  try {
    await syncFromCRM();
  } catch (error) {
    console.error('Error al sincronizar propiedades con el CRM:', error.message);
  }
}

// Borrados: no se detectan por delta (una baja no es un "update"), se reconcilian contra la lista
// de IDs activos del CRM. Con freno: si el CRM devuelve una lista vacía o la baja sería de más del
// 20 % de golpe, no se borra nada (antes un error del CRM vaciaba todas las fichas de la web).
const MAX_DELETE_RATIO = 0.2;

export async function reconcileDeletedProperties() {
  const baseUrl = (process.env.CRM_API_URL || '').replace(/\/$/, '');
  const response = await axios.get(`${baseUrl}/api/public/properties/ids`, {
    headers: { 'X-Api-Key': process.env.CRM_API_KEY },
    timeout: 30000,
  });
  const activeIds = Array.isArray(response.data?.ids) ? response.data.ids : [];
  if (activeIds.length === 0) {
    console.error('Reconciliación de borrados abortada: el CRM devolvió 0 IDs activos.');
    return 0;
  }

  const filter = { id: { $nin: activeIds } };
  const [toDelete, total] = await Promise.all([Property.countDocuments(filter), Property.estimatedDocumentCount()]);
  if (toDelete === 0) return 0;
  if (total > 0 && toDelete / total > MAX_DELETE_RATIO) {
    console.error(`Reconciliación de borrados abortada: se iban a borrar ${toDelete} de ${total} propiedades (más del ${MAX_DELETE_RATIO * 100} %).`);
    return 0;
  }

  // Antes de borrar se guarda un rastro mínimo (zona, tipo, operación) para la página
  // «Esta propiedad ya no está disponible» con parecidas.
  try {
    const removed = await Property.find(filter, {
      id: 1, publication_title: 1, address: 1, 'location.name': 1, 'type.name': 1, 'operations.operation_type': 1,
    }).lean();
    if (removed.length) {
      await RemovedProperty.bulkWrite(removed.map((p) => ({
        updateOne: {
          filter: { id: p.id },
          update: {
            $set: {
              title: p.publication_title || (typeof p.address === 'string' ? p.address : '') || '',
              location_name: (p.location?.name || '').trim(),
              type_name: p.type?.name || '',
              operation_types: (p.operations || []).map((op) => op.operation_type).filter(Boolean),
              removedAt: new Date(),
            },
          },
          upsert: true,
        },
      })));
    }
  } catch (err) {
    console.error('No se pudo guardar el rastro de las bajas:', err.message);
  }

  const result = await Property.deleteMany(filter);
  console.log(`Reconciliación de borrados: ${result.deletedCount} propiedades eliminadas.`);
  return result.deletedCount;
}
