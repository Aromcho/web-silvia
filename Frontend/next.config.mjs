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

  async redirects() {
    return [
      {
        source: '/propertyDetail/:id',
        destination: '/propiedad/:id',
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

export default nextConfig;