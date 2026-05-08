import Property from '../models/Property.model.js';

const renderPropertySEO = async (req, res) => {
  const { id } = req.params;
  const userAgent = req.headers["user-agent"] || "";

  // Expresión regular para detectar bots
  const isBot = /bot|crawl|spider|slurp|facebook|whatsapp|telegram|twitter|linkedin/i.test(userAgent);

  try {
    const property = await Property.findOne({ id: parseInt(id) }).lean();

    if (!property) {
      return res.status(404).send('Propiedad no encontrada');
    }


    // Seleccionar la imagen adecuada
    const ogImage =
      property.photos?.find(photo => photo.is_front_cover)?.image ||
      property.photos?.[0]?.image ||
      "https://www.silviafernandezpropiedades.com.ar/images/og_image.png";

    // Genera el HTML con metaetiquetas dinámicas y redirige al frontend
    if (isBot) {
      const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${property.address} | Silvia Fernandez</title>
        <meta property="og:title" content="${property.address} | Silvia Fernandez">
        <meta property="og:description" content="${property.publication_title || property.address}">
        <meta property="og:url" content="https://silviafernandez.mi-hogar.online/propiedad/${property.id}">
        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Silvia Fernandez" />
        <meta property="og:image" content="${ogImage}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta http-equiv="refresh" content="0;url=/propertyDetail/${id}" />
      </head>
      <body>
      </body>
      </html>
    `;

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(html);
     }
     return res.redirect(301, `/propertyDetail/${id}`);
      } catch (error) {
    console.error('Error al generar SEO dinámico:', error);
    res.status(500).send('Error al cargar la propiedad');
  }
};

export default renderPropertySEO;
