import mongoose from 'mongoose';

const DevelopmentSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  branch: {
    address: { type: String, default: '' },
    alternative_phone: { type: String, default: '' },
    alternative_phone_area: { type: String, default: '' },
    alternative_phone_country_code: { type: String, default: '' },
    alternative_phone_extension: { type: String, default: '' },
    branch_type: { type: String, default: '' },
    contact_time: { type: String, default: '' },
    created_date: { type: Date, default: null },
    display_name: { type: String, default: '' },
    email: { type: String, default: '' },
    geo_lat: { type: Number, default: null },
    geo_long: { type: Number, default: null },
    gm_location_type: { type: String, default: '' },
    id: { type: Number, required: true },
    is_default: { type: Boolean, default: false },
    logo: { type: String, default: '' },
    phone: { type: String, default: '' },
    phone_area: { type: String, default: '' },
    phone_country_code: { type: String, default: '' },
    phone_extension: { type: String, default: '' },
    use_pdf_footer: { type: Boolean, default: false },
  },
  construction_date: { type: Date, default: null },
  construction_status: { type: Number, default: null },
  custom_tags: [
    {
      group_name: { type: String, default: null },
      id: { type: Number, required: true },
      name: { type: String, default: '' },
      public_name: { type: String, default: '' },
    }
  ],
  deleted_at: { type: Date, default: null },
  description: { type: String, default: '' },
  display_on_web: { type: Boolean, default: true },
  excel_extra_headers: { type: String, default: '[]' },
  fake_address: { type: String, default: '' },
  files: { type: Array, default: [] },
  financing_details: { type: String, default: '' },
  geo_lat: { type: Number, default: null },
  geo_long: { type: Number, default: null },
  id: { type: Number, required: true },
  is_starred_on_web: { type: Boolean, default: false },
  location: {
    divisions: { type: Array, default: [] },
    full_location: { type: String, default: '' },
    id: { type: Number, required: true },
    name: { type: String, default: '' },
    parent_division: { type: String, default: '' },
    short_location: { type: String, default: '' },
    state: { type: String, default: null },
    weight: { type: Number, default: 0 },
  },
  name: { type: String, required: true },
  photos: [
    {
      description: { type: String, default: null },
      image: { type: String, default: '' },
      is_blueprint: { type: Boolean, default: false },
      is_front_cover: { type: Boolean, default: false },
      order: { type: Number, default: 0 },
      original: { type: String, default: '' },
      thumb: { type: String, default: '' },
    }
  ],
  publication_title: { type: String, default: '' },
  reference_code: { type: String, default: '' },
  resource_uri: { type: String, default: '' },
  tags: [
    {
      id: { type: Number, required: true },
      name: { type: String, default: '' },
      type: { type: Number, default: 0 },
    }
  ],
  type: {
    code: { type: String, default: '' },
    id: { type: Number, required: true },
    name: { type: String, default: '' },
  },
  users_in_charge: {
    cellphone: { type: String, default: '' },
    email: { type: String, default: '' },
    id: { type: Number, required: true },
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    picture: { type: String, default: '' },
    position: { type: String, default: '' },
  },
  videos: { type: Array, default: [] },
  web_url: { type: String, default: '' },
});

const Development = mongoose.model('Development', DevelopmentSchema);

export default Development;
