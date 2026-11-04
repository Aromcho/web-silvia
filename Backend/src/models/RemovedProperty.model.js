import { Schema, model } from 'mongoose';

// Rastro mínimo de las fichas que el CRM dio de baja. Sirve para que un link viejo
// (anuncio, WhatsApp, Google) muestre «ya no está disponible» con propiedades parecidas
// de la misma zona y operación, en vez de un error.
const schema = new Schema(
  {
    id: { type: Number, required: true, unique: true, index: true },
    title: { type: String, default: '' },
    location_name: { type: String, default: '' },
    type_name: { type: String, default: '' },
    operation_types: { type: [String], default: [] },
    removedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

const RemovedProperty = model('removed_properties', schema);
export default RemovedProperty;
