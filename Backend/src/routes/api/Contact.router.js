import express from 'express';
import { sendContactEmail } from "../../controllers/contact.controller.js";

const contactRouter = express.Router();

contactRouter.post('/', sendContactEmail);

export default contactRouter;