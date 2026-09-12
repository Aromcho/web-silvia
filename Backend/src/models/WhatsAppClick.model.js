import { Schema, model } from 'mongoose';

const collection = 'whatsapp_clicks';
const schema = new Schema({
  name: { type: String },
  phone: { type: String, required: true },
  source: { type: String, default: 'unknown' }, // property-detail | floating-chat | contact-page
  propertyId: { type: String },
  propertyTitle: { type: String },
  assigned: { type: Boolean, default: false }, // true si el número vino de la rotación automática
}, {
  timestamps: true
});

const WhatsAppClick = model(collection, schema);
export default WhatsAppClick;
