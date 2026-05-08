import express from 'express';
import propertyRoutes from './api/property.routes.js';
import developmentRoutes from './api/Development.routes.js';
import userRouter from './api/User.router.js';
import articuleRouter from './api/Articule.router.js';
import sessionsRouter from './api/session.router.js'; // Aquí importas el router de sesiones
import cookiesRouter from './api/Cookies.router.js';
import contactRouter from './api/Contact.router.js';
import {getPropertyLocations} from '../controllers/property.controller.js';

const router = express.Router();

router.use('/cookies', cookiesRouter);
router.use('/property', propertyRoutes);
router.use('/development', developmentRoutes);
router.use('/sessions', sessionsRouter); // Aquí asegúrate de tener las rutas para sesiones
router.use('/user', userRouter);
router.use('/articule', articuleRouter);
router.use('/contact', contactRouter);
router.get('/locations', (req, res) => {
    getPropertyLocations(req, res);
});

export default router;

