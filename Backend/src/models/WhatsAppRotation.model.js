import { Schema, model } from 'mongoose';

const collection = 'whatsapp_rotation_state';
const schema = new Schema({
  key: { type: String, required: true, unique: true },
  cursor: { type: Number, default: 0 },
});

const WhatsAppRotation = model(collection, schema);
export default WhatsAppRotation;
