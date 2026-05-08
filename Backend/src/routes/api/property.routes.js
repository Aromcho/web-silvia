import express from 'express';
import {
  createProperty,
  getProperties,
  getPropertyById,
  getRelatedProperties,
  getNeighborhoods,
  getFavorites,
  getAllPropertyIds, // new function
} from '../../controllers/property.controller.js';
import { getpropertyById } from '../../controllers/property.controller.js';
import { autocompleteProperties } from '../../controllers/property.controller.js';



const propertyDetail = express.Router();

propertyDetail.post('/', createProperty);
propertyDetail.get('/autocomplete', autocompleteProperties);
propertyDetail.get('/properties', getProperties);
propertyDetail.get('/propertyDetail/:id', getpropertyById);
propertyDetail.get('/neighborhoods', getNeighborhoods);
propertyDetail.get('/:id', getPropertyById);
propertyDetail.get('/propertyDetail/:id/related', getRelatedProperties);
propertyDetail.get('/favorites', getFavorites);
propertyDetail.get('/properties/ids', getAllPropertyIds);

// details routes



export default propertyDetail;
