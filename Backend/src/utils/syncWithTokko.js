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

export const syncWithTokko = async () => {
  const limit = 20;
  let offset = 0;
  let total_count = 0;
  const syncedIds = new Set();

  try {
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
        if (property.branch && typeof property.branch === 'object') {
          property.branch = {
            ...property.branch,
            address: property.branch.address || '',
            email: property.branch.email || '',
            logo: property.branch.logo || '',
            phone: property.branch.phone || '',
          };
        }

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
  } catch (error) {
    console.error('Error al sincronizar con Tokko:', error);
  }
};
