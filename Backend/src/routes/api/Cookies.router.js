import express from 'express';
import { setProductCookie, getProductCookies, deleteProductCookie, setSearchCookie, getSearchCookies, deleteSearchCookie } from '../../controllers/cookies.controller.js';

const cookiesRouter = express.Router();

// Rutas para manejar cookies de productos
cookiesRouter.post('/set-product', setProductCookie);
cookiesRouter.get('/get-products', getProductCookies);
cookiesRouter.delete('/delete-product/:product', deleteProductCookie);

// Rutas para manejar cookies de búsquedas
cookiesRouter.post('/set-search', setSearchCookie);
cookiesRouter.get('/get-searches', getSearchCookies);
cookiesRouter.delete('/delete-search/:search', deleteSearchCookie);

export default cookiesRouter;