import express from 'express';
import { getNextAgent, logClick, getStats } from '../../controllers/whatsapp.controller.js';

const whatsappRouter = express.Router();

whatsappRouter.get('/next-agent', getNextAgent);
whatsappRouter.post('/click', logClick);
whatsappRouter.get('/stats', getStats);

export default whatsappRouter;
