import { readFileSync } from 'fs';
import mongoose from 'mongoose';
import WhatsAppClick from '../models/WhatsAppClick.model.js';
import Articule from '../models/Articule.model.js';
import Property from '../models/Property.model.js';
import { baDay, bump, emptySeries, parseRange, totalsOf } from '../utils/internal.util.js';

// Módulo /internal de la web (panel central). Solo lectura.
// Contrato: GET /internal/health · /internal/metrics?desde=&hasta= · /internal/upcoming?limite=
const SERVICE = 'web';
const { version } = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));

// Contadores de la serie diaria. La web no guarda visitas a las fichas (eso está en Google
// Analytics): lo que registra son los clics al botón de WhatsApp, con propiedad y origen.
const COUNTERS = ['whatsappClicks', 'noticias'];
// Qué contadores propios alimentan cada contador común del panel. Las consultas del formulario
// de contacto no se cuentan acá: entran al CRM como Lead (source: 'web').
const COMMON = { publicaciones: [], consultas: ['whatsappClicks'], ventas: [], visitas: [] };
const MAX_PROPERTIES = 200;

const countBy = (map, key) => { map[key] = (map[key] || 0) + 1; };

export function health(_req, res) {
  const db = mongoose.connection.readyState === 1 ? 'up' : 'down';
  res.json({ ok: db === 'up', service: SERVICE, version, uptime: Math.round(process.uptime()), db, now: new Date().toISOString() });
}

export async function metrics(req, res, next) {
  try {
    const range = parseRange(req.query);
    const created = { createdAt: { $gte: range.from, $lt: range.to } };
    const [clicks, articles, propiedadesEnLaWeb] = await Promise.all([
      WhatsAppClick.find(created, { name: 1, source: 1, channel: 1, propertyId: 1, propertyTitle: 1, createdAt: 1 }).lean(),
      Articule.find(created, { createdAt: 1 }).lean(),
      Property.countDocuments(),
    ]);

    const series = emptySeries(range, COUNTERS);
    const whatsappPorOrigen = {};
    const whatsappPorCanal = {};
    const whatsappPorAsesor = {};
    const props = new Map();
    for (const click of clicks) {
      bump(series, baDay(click.createdAt), 'whatsappClicks');
      countBy(whatsappPorOrigen, click.source || 'unknown');
      // Los clics anteriores al registro de origen no tienen canal
      countBy(whatsappPorCanal, click.channel || 'sin dato');
      countBy(whatsappPorAsesor, click.name || 'Sin nombre');
      if (click.propertyId) {
        const key = String(click.propertyId);
        const row = props.get(key) || { propertyId: key, title: '', whatsappClicks: 0 };
        row.whatsappClicks += 1;
        if (!row.title && click.propertyTitle) row.title = click.propertyTitle;
        props.set(key, row);
      }
    }
    articles.forEach((a) => bump(series, baDay(a.createdAt), 'noticias'));

    res.json({
      service: SERVICE,
      desde: range.desde,
      hasta: range.hasta,
      totals: { ...totalsOf(series, COUNTERS), whatsappPorOrigen, whatsappPorCanal, whatsappPorAsesor, propiedadesEnLaWeb },
      common: COMMON,
      series: [...series.values()],
      byProperty: [...props.values()].sort((a, b) => b.whatsappClicks - a.whatsappClicks).slice(0, MAX_PROPERTIES),
    });
  } catch (error) {
    next(error);
  }
}

// La web no tiene nada con fecha futura: el contrato se cumple con una lista vacía
export function upcoming(_req, res) {
  res.json({ service: SERVICE, generatedAt: new Date().toISOString(), items: [] });
}
