import axios from 'axios';
import Development from '../models/Development.model.js';

export const syncDevelopmentsWithTokko = async () => {
  const limit = 20;
  let offset = 0;
  let total_count = 0;

  try {
    console.log('Iniciando sincronización de desarrollos con Tokko...');

    do {
      const response = await axios.get('https://www.tokkobroker.com/api/v1/development/', {
        params: {
          key: process.env.TOKKO_TOKEN,
          limit,
          offset,
          lang: 'es_ar',
          format: 'json',
        },
      });

      const developments = response.data.objects;
      total_count = response.data.meta.total_count;

      const operations = developments.map(development => {
        // Procesar fotos, fases y otros datos de los desarrollos como ya se explicó
        return {
          updateOne: {
            filter: { id: development.id },
            update: { $set: development },
            upsert: true,
          }
        };
      });

      const result = await Development.bulkWrite(operations);
      console.log(`Actualizados ${result.modifiedCount} desarrollos, insertados ${result.upsertedCount} desarrollos.`);

      offset += limit;

    } while (offset < total_count);

    console.log('Sincronización de desarrollos completada');
  } catch (error) {
    console.error('Error al sincronizar desarrollos con Tokko:', error);
  }
};
