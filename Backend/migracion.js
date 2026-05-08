import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Property from './src/models/Property.model.js'; // Asegurate de que la ruta es correcta

dotenv.config(); // Carga las variables de entorno desde el .env

const migratePropertyStatus = async () => {
  try {
    // Conectarse a la base de datos
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Conectado a MongoDB. Iniciando migración...');

    // Actualizar todas las propiedades cambiando el `status` de número a string
    const result = await Property.updateMany({}, [
      {
        $set: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$status", 0] }, then: "disponible" },
                { case: { $eq: ["$status", 1] }, then: "reservada" },
                { case: { $eq: ["$status", 2] }, then: "vendida" }
              ],
              default: "disponible" // Si hay algún valor desconocido, lo deja en "disponible"
            }
          }
        }
      }
    ]);

    console.log(`✅ Migración completada. Documentos modificados: ${result.modifiedCount}`);

    // Cerrar la conexión
    await mongoose.disconnect();
    console.log('🔌 Conexión a MongoDB cerrada.');
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    await mongoose.disconnect();
  }
};

// Ejecutar la migración
migratePropertyStatus();
