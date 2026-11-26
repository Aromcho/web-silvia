import { PHASE_PRODUCTION_BUILD } from 'next/constants.js'
import { linkPersistentImageCache } from './scripts/persistent-image-cache.mjs'
import { ensureSharp } from './scripts/ensure-sharp.mjs'

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Build sin downtime: se compila en otra carpeta (NEXT_DIST_DIR=.next-new) mientras prod sigue sirviendo .next
  distDir: process.env.NEXT_DIST_DIR || '.next',
  // El proyecto es JavaScript. tsconfig.json y next-env.d.ts están en el repo solo porque el deploy del VPS
  // hace `git checkout -- tsconfig.json next-env.d.ts` después del build. Apuntamos a un archivo que no
  // existe para que Next no lo tome como proyecto TypeScript ni intente instalar typescript.
  typescript: { tsconfigPath: 'tsconfig.no-usar.json' },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // En producción no quedan console.log de desarrollo (errores y avisos sí)
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error', 'warn', 'info'] } : false,
  },

  // Fotos livianas (C10/W6): las fotos del CRM se sirven achicadas y en WebP desde /_next/image
  // (ver imgUrl en helpers). La primera vez se generan (con sharp, ~0,1-0,3 s) y después salen de
  // la caché, que se conserva entre deploys (ver scripts/persistent-image-cache.mjs).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'apicrm.silviafernandezpropiedades.com.ar', pathname: '/uploads/**' },
    ],
    formats: ['image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },

  async redirects() {
    return [
      {
        source: '/propertyDetail/:id',
        destination: '/propiedad/:id',
        permanent: true,
      },
      // SEO: una sola URL por página (las otras quedaban duplicadas)
      {
        source: '/propiedades/:id(\\d+)',
        destination: '/propiedad/:id',
        permanent: true,
      },
      {
        source: '/about',
        destination: '/nosotros',
        permanent: true,
      },
      // El mapa se sacó de la web: su URL lleva al listado
      {
        source: '/mapa',
        destination: '/propiedades',
        permanent: true,
      },
      // Un solo buscador: los listados viejos abren /propiedades con su filtro puesto.
      // (Las páginas por zona, /lotes-terrenos/mar-azul y demás, siguen existiendo.)
      {
        source: '/lotes-terrenos',
        destination: '/propiedades?type=Terreno',
        permanent: true,
      },
      // El listado viejo de alquileres tenía la pestaña «Anual» en ?tipo=anual (hoy son todos locales)
      {
        source: '/alquiler-temporario',
        has: [{ type: 'query', key: 'tipo', value: 'anual' }],
        destination: '/propiedades?operation=alquiler&type=Local',
        permanent: true,
      },
      {
        source: '/alquiler-temporario',
        destination: '/propiedades?operation=alquiler',
        permanent: true,
      },
      {
        source: '/complejos',
        destination: '/propiedades?type=Complejo',
        permanent: true,
      },
    ]
  },

  async rewrites() {
    // afterFiles: primero se verifican las rutas de Next.js (/api/contact, etc.)
    // y si no hay match, se proxea al backend Express en el puerto 3001.
    return {
      afterFiles: [
        {
          source: '/api/property/:path*',
          destination: 'http://localhost:3001/api/property/:path*',
        },
        {
          source: '/api/locations',
          destination: 'http://localhost:3001/api/locations',
        },
        {
          source: '/api/development/:path*',
          destination: 'http://localhost:3001/api/development/:path*',
        },
        {
          source: '/api/whatsapp/:path*',
          destination: 'http://localhost:3001/api/whatsapp/:path*',
        },
      ],
    }
  },
}

export default function config(phase) {
  // En cada build la caché de fotos de la carpeta nueva (.next-new) apunta a la carpeta fija
  if (phase === PHASE_PRODUCTION_BUILD) {
    ensureSharp()
    linkPersistentImageCache(nextConfig.distDir)
  }
  return nextConfig
}