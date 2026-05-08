import { Schema, model } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate-v2';

// Schema para las operaciones de la propiedad
const operationSchema = new Schema({
  operation_id: { type: Number, index: true },
  operation_type: { type: String, index: true }, // Tipo de operación indexado
  prices: [
    {
      currency: String,
      period: String,
      price: { type: Number, index: true }, // Precio indexado
    },
  ],
});

// Schema para las imágenes de la propiedad
const photoSchema = new Schema({
  description: String,
  image: String,
  is_blueprint: Boolean,
  is_front_cover: Boolean,
  order: Number,
  original: String,
  thumb: String,
});

// Schema para los tags personalizados
const tagSchema = new Schema({
  id: Number,
  name: { type: String, index: true }, // Nombre del tag indexado
  type: Number,
});

// Schema para los videos
const videoSchema = new Schema({
  description: String,
  id: Number,
  order: Number,
  player_url: String,
  provider: String,
  provider_id: Number,
  title: String,
  url: String,
  video_id: String,
});

// Schema principal para PropertyDetails
const propertySchema = new Schema({
  id: { type: Number, required: true, unique: true, index: true }, // ID indexado
  address: { type: String, text: true }, // Dirección con índice de texto
  age: { type: Number, index: true }, // Índice en edad
  bathroom_amount: { type: Number, index: true }, // Índice en cantidad de baños
  branch: {
    address: String,
    alternative_phone: String,
    alternative_phone_area: String,
    alternative_phone_country_code: String,
    alternative_phone_extension: String,
    branch_type: String,
    contact_time: String,
    created_date: Date,
    display_name: String,
    email: String,
    geo_lat: Number,
    geo_long: Number,
    gm_location_type: String,
    id: { type: Number, index: true },
    is_default: Boolean,
    logo: String,
    name: { type: String, index: true },
    pdf_footer_text: String,
    phone: String,
    phone_area: String,
    phone_country_code: String,
    phone_extension: String,
    use_pdf_footer: Boolean,
  },
  created_at: Date,
  credit_eligible: { type: String, index: true },
  custom1: String,
  custom_tags: [tagSchema],
  deleted_at: Date,
  depth_measure: String,
  description: { type: String, text: true }, // Descripción con índice de texto
  description_only: String,
  development: Object,
  development_excel_extra_data: String,
  disposition: String,
  expenses: Number,
  extra_attributes: Array,
  fake_address: String,
  files: Array,
  floors_amount: Number,
  footer: String,
  front_measure: String,
  geo_lat: { type: Number, index: true }, // Latitud indexada
  geo_long: { type: Number, index: true }, // Longitud indexada
  gm_location_type: String,
  has_temporary_rent: Boolean,
  is_denounced: Boolean,
  is_starred_on_web: Boolean,
  legally_checked: String,
  location: {
    divisions: { type: Array, index: true }, // Divisiones de ubicación indexadas
    full_location: { type: String, text: true }, // Ubicación completa con índice de texto
    name: { type: String, index: true }, // Nombre de ubicación indexado
    parent_division: String,
    short_location: String,
    state: String,
    weight: Number,
  },
  occupation: Array,
  operations: [operationSchema],
  orientation: String,
  parking_lot_amount: { type: Number, index: true }, // Cantidad de cocheras indexada
  photos: [photoSchema],
  producer: {
    cellphone: String,
    email: String,
    id: Number,
    name: { type: String, text: true }, // Nombre del productor con índice de texto
    phone: String,
    picture: String,
    position: String,
  },
  property_condition: { type: String, text: true }, // Condición de la propiedad con índice de texto
  public_url: String,
  publication_title: { type: String, text: true }, // Título de la publicación con índice de texto
  real_address: {type: String, text:true}, // Dirección real con índice de texto,
  reference_code: String,
  rich_description: String,
  roofed_surface: String,
  room_amount: { type: Number, index: true }, // Cantidad de habitaciones indexada
  semiroofed_surface: String,
  situation: String,
  status:{ type: String, enum: ["disponible", "reservada", "vendida"], index: true },
  suite_amount: { type: Number, index: true }, // Cantidad de suites indexada
  surface: String,
  surface_measurement: String,
  tags: [tagSchema],
  toilet_amount: Number,
  total_surface: { type: String, index: true }, // Superficie total indexada
  transaction_requirements: String,
  type: {
    code: String,
    id: Number,
    name: { type: String, index: true }, // Tipo de propiedad con índice de texto
  },
  unroofed_surface: String,
  videos: [videoSchema],
  web_price: Boolean,
  zonification: String,
}, { timestamps: true }); // timestamps añade createdAt y updatedAt automáticamente

// Añadir el plugin de paginación
propertySchema.plugin(mongoosePaginate);

// Añadir más campos al índice de texto
propertySchema.index({
  address: "text",
  "location.full_location": "text",
  "location.name": "text",
  "type.name": "text",
  "producer.name": "text",
  property_condition: "text",
});

// Crear índices compuestos para mejorar consultas de filtrado
propertySchema.index({
  "operations.operation_type": 1,
  "type.name": 1,
  "operations.prices.price": 1,
  "room_amount": 1,
  "bathroom_amount": 1,
  "suite_amount": 1,
});


// Índice compuesto para geo_lat y geo_long para optimizar consultas geoespaciales
propertySchema.index({
  geo_lat: 1,
  geo_long: 1,
});

const Property = model('Property', propertySchema);

export default Property;