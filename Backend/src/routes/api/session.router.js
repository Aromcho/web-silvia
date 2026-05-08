import express from 'express';
import {
  register,
    login,
    online,
    logout,
} from '../../controllers/session.controller.js';

const sessionRouter = express.Router();

sessionRouter.post('/register',register);
sessionRouter.post('/login', login);
sessionRouter.get('/online', online);
sessionRouter.delete('/logout', logout);

export default sessionRouter;