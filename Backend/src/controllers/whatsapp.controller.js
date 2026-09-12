import WhatsAppContact from '../models/WhatsAppContact.model.js';
import WhatsAppClick from '../models/WhatsAppClick.model.js';
import WhatsAppRotation from '../models/WhatsAppRotation.model.js';

// Mismos contactos que ya se mostraban hardcodeados en el frontend (Contact.js / WhatsAppChat.js).
// Se usan para poblar la colección la primera vez; después el listado vive en la base.
const DEFAULT_CONTACTS = [
  { name: 'Silvia', phone: '5492255509408', order: 0 },
  { name: 'Fabiana', phone: '5492255626092', order: 1 },
  { name: 'Sucursal Mar Azul', phone: '5492255622841', order: 2 },
  { name: 'Paul', phone: '5492254602453', order: 3 },
  { name: 'Cecilia', phone: '5492216006474', order: 4 },
  { name: 'Pablo', phone: '5492255609992', order: 5 },
];

const ROTATION_KEY = 'property-detail';

export const seedWhatsAppContacts = async () => {
  for (const contact of DEFAULT_CONTACTS) {
    await WhatsAppContact.updateOne(
      { phone: contact.phone },
      { $setOnInsert: contact },
      { upsert: true }
    );
  }
};

// Asigna, de forma rotativa y atómica (a prueba de los workers del cluster), el próximo
// contacto activo. Se usa para elegir a quién le llega el botón de WhatsApp de cada
// propiedad, repartiendo las consultas entre todos en vez de mandarlas siempre al mismo.
export const getNextAgent = async (req, res, next) => {
  try {
    const contacts = await WhatsAppContact.find({ active: true }).sort({ order: 1, _id: 1 });
    if (!contacts.length) {
      return res.status(404).json({ message: 'No hay contactos de WhatsApp activos' });
    }

    const state = await WhatsAppRotation.findOneAndUpdate(
      { key: ROTATION_KEY },
      { $inc: { cursor: 1 } },
      { upsert: true, new: true }
    );

    const index = (state.cursor - 1) % contacts.length;
    const agent = contacts[index];

    res.json({ name: agent.name, phone: agent.phone });
  } catch (error) {
    next(error);
  }
};

// Registra una consulta real enviada por WhatsApp (click en el botón), sea que el número
// haya salido de la rotación automática o que el visitante haya elegido el contacto a mano.
export const logClick = async (req, res, next) => {
  try {
    const { name, phone, source, propertyId, propertyTitle, assigned } = req.body || {};
    if (!phone) {
      return res.status(400).json({ message: 'phone es requerido' });
    }

    await WhatsAppClick.create({
      name,
      phone,
      source,
      propertyId,
      propertyTitle,
      assigned: Boolean(assigned),
    });
    await WhatsAppContact.updateOne({ phone }, { $inc: { totalClicks: 1 } });

    res.status(201).json({ ok: true });
  } catch (error) {
    next(error);
  }
};

// Endpoint de solo lectura para ver cuántas consultas se mandaron y a quién.
// Protegido con una clave simple por header porque este frontend no tiene panel de admin.
export const getStats = async (req, res, next) => {
  try {
    const key = req.headers['x-stats-key'];
    if (!process.env.WHATSAPP_STATS_KEY || key !== process.env.WHATSAPP_STATS_KEY) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    const { from, to } = req.query;
    const dateFilter = {};
    if (from) dateFilter.$gte = new Date(from);
    if (to) dateFilter.$lte = new Date(to);
    const match = Object.keys(dateFilter).length ? { createdAt: dateFilter } : {};

    const [byContact, bySource, totalClicks] = await Promise.all([
      WhatsAppClick.aggregate([
        { $match: match },
        { $group: { _id: { name: '$name', phone: '$phone' }, total: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      WhatsAppClick.aggregate([
        { $match: match },
        { $group: { _id: '$source', total: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      WhatsAppClick.countDocuments(match),
    ]);

    res.json({
      totalClicks,
      byContact: byContact.map((row) => ({
        name: row._id.name || 'Sin nombre',
        phone: row._id.phone,
        total: row.total,
      })),
      bySource: bySource.map((row) => ({ source: row._id || 'unknown', total: row.total })),
    });
  } catch (error) {
    next(error);
  }
};
