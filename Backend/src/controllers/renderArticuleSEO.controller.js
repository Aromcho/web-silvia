import Articule from '../models/Articule.model.js';

const renderArticuleSEO = async (req, res) => {
  const { id } = req.params;

  try {
    const articule = await Articule.findById(id).lean();

    if (!articule) {
      return res.status(404).send('Artículo no encontrado');
    }

    // Seleccionar la imagen adecuada
    const ogImage = articule.photos?.[0] || "https://www.silviafernandezpropiedades.com.ar/images/og_image.png";

    // Genera el HTML con metaetiquetas dinámicas y redirige al frontend
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${articule.title} | Blog Silvia Fernandez</title>
        <meta property="og:title" content="${articule.title} | Blog Silvia Fernandez">
        <meta property="og:description" content="${articule.subtitle}">
        <meta property="og:url" content="https://www.silviafernandezpropiedades.com.ar/blog/${articule._id}">
        <meta property="og:type" content="article">
        <meta property="og:site_name" content="Silvia Fernandez" />
        <meta property="og:image" content="${ogImage}">
        <meta property="og:image:width" content="1200">
        <meta property="og:image:height" content="630">
        <meta http-equiv="refresh" content="0;url=/blog/${id}" />
      </head>
      <body>
      </body>
      </html>
    `;

    res.setHeader("Cache-Control", "public, max-age=3600");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(html);
  } catch (error) {
    console.error('Error al generar SEO dinámico:', error);
    res.status(500).send('Error al cargar el artículo');
  }
};

export default renderArticuleSEO;
