import express from 'express';
import {
    createArticule,
    getArticules,
    getArticuleById,
    updateArticule,
    deleteArticule,
} from '../../controllers/articule.controller.js';

const articuleRouter = express.Router();

articuleRouter.post('/', createArticule);
articuleRouter.get('/', getArticules);
articuleRouter.get('/:id', getArticuleById);
articuleRouter.put('/:id', updateArticule);
articuleRouter.delete('/:id', deleteArticule);

export default articuleRouter;