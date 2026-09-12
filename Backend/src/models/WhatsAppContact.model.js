import { Schema, model } from 'mongoose';

const collection = 'whatsapp_contacts';
const schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  totalClicks: { type: Number, default: 0 },
}, {
  timestamps: true
});

const WhatsAppContact = model(collection, schema);
export default WhatsAppContact;
