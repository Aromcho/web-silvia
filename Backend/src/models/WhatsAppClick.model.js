import { Schema, model } from 'mongoose';

const collection = 'whatsapp_clicks';
const schema = new Schema({
  name: { type: String },
  phone: { type: String, required: true },
  source: { type: String, default: 'unknown' }, // property-detail | floating-chat | contact-page
  propertyId: { type: String },
  propertyTitle: { type: String },
  assigned: { type: Boolean, default: false }, // true si el número vino de la rotación automática
  // Origen del visitante (X6): canal (meta-ads, google, instagram, directo…), código «Ref.» que va
  // en el mensaje, utm_* y sitio desde el que llegó
  channel: { type: String, default: 'directo', index: true },
  ref: { type: String, index: true },
  utm: { source: String, medium: String, campaign: String, content: String, term: String },
  referrer: String,
  landing: String,
}, {
  timestamps: true
});

const WhatsAppClick = model(collection, schema);
export default WhatsAppClick;
