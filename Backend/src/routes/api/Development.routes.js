import express from 'express';
import {
  createDevelopment,
  getDevelopments,
  getDevelopmentById,
  getDevelopmentByCustomId, // Importar la nueva función
  updateDevelopment,
  deleteDevelopment,
} from '../../controllers/development.controller.js';
const developmentRoutes = express.Router();

developmentRoutes.get('/custom/:id', getDevelopmentByCustomId);
developmentRoutes.get('/', getDevelopments);
developmentRoutes.get('/:id', getDevelopmentById);
developmentRoutes.post('/', createDevelopment);
developmentRoutes.put('/:id', updateDevelopment);
developmentRoutes.delete('/:id', deleteDevelopment);

export default developmentRoutes;
