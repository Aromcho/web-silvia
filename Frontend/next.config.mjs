/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
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
      ],
    }
  },
}

export default nextConfig;