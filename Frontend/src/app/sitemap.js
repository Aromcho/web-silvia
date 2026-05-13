export default function sitemap() {
  const baseUrl = 'https://www.silviafernandezpropiedades.com.ar'

  return [
    { url: `${baseUrl}/`, lastModified: new Date() },
    { url: `${baseUrl}/nosotros`, lastModified: new Date() },
    { url: `${baseUrl}/propiedades`, lastModified: new Date() },
    { url: `${baseUrl}/lotes-terrenos`, lastModified: new Date() },
    { url: `${baseUrl}/alquiler-temporario`, lastModified: new Date() },
    { url: `${baseUrl}/complejos`, lastModified: new Date() },
    { url: `${baseUrl}/mapa`, lastModified: new Date() },
  ]
}