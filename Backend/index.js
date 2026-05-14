import express from 'express';
import dotenv from 'dotenv';
import cluster from 'cluster';
import { cpus } from 'os';
import morgan from 'morgan';
import cron from 'node-cron';
import cors from 'cors'; 
import connectDB from './src/utils/db.js';
import { syncWithTokko } from './src/utils/syncWithTokko.js';
import router from './src/routes/index.router.js';
import pathHandler from './src/middelwares/pathHandler.mid.js';
import path from 'path';
import { fileURLToPath } from 'url'; // Para obtener __dirname si usas módulos ES6
import { syncDevelopmentsWithTokko } from './src/utils/syncDevelopmentsWithTokko.js';
import { generateJSON } from './src/utils/jsonGenerator.js';
import renderPropertySEO from './src/controllers/SEO.controller.js';
import renderArticuleSEO from './src/controllers/renderArticuleSEO.controller.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const PORT = process.env.PORT || 3001;
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isPrimary = cluster.isPrimary;
const numCPUs = cpus().length;
connectDB();

if (isPrimary) {
  // Sincronización con Tokko cada 5 minutos
  cron.schedule('*/5 * * * *', () => {
    console.log('Ejecutando sincronización con Tokko');
    syncWithTokko();
  });

  // Regenerar direcciones_y_barrios.json todos los días a las 3:00 AM
  cron.schedule('0 3 * * *', () => {
    console.log('Regenerando direcciones y barrios...');
    generateJSON();
  });

  // Generar el JSON al iniciar el servidor por primera vez
  generateJSON();

  for (let i = 1; i <= numCPUs; i++) {
    cluster.fork();
  }
  console.log('proceso primario');
} else {
  console.log('proseso worker');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    
  });
}

app.use(morgan('dev'));
app.use(express.json());
app.use(cors());
app.use(cookieParser(process.env.SECRET));

// Servir la carpeta de imágenes de manera estática
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.static('dist'));
app.use('/api', router);
app.get('/propertyDetail/:id', (req, res) => {
  const userAgent = req.headers["user-agent"] || "";
  const isBot = /bot|crawl|spider|slurp|facebook|whatsapp|telegram|twitter|linkedin/i.test(userAgent);

  if (isBot) {
    return renderPropertySEO(req, res); // Llamar directamente a la función SEO
  }

  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

app.get('/propiedad/:id', renderPropertySEO);
app.get('/noticia/:id', renderArticuleSEO);




// Ruta catch-all para servir index.html
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "dist", "index.html"));
});

// Manejo de errores
app.use(pathHandler);
