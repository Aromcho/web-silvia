// Un solo dominio para Google: silviafernandezpropiedades.com.ar (sin www) redirige con 301 a www,
// así no hay dos copias de cada página compitiendo entre sí.
import { NextResponse } from 'next/server'

const APEX = 'silviafernandezpropiedades.com.ar'

export function middleware(request) {
  const host = (request.headers.get('x-forwarded-host') || request.headers.get('host') || '')
    .split(',')[0]
    .split(':')[0]
    .trim()
    .toLowerCase()

  if (host === APEX) {
    const { pathname, search } = request.nextUrl
    return NextResponse.redirect(`https://www.${APEX}${pathname}${search}`, 301)
  }
  return NextResponse.next()
}

// No pasa por acá: archivos internos de Next ni la API (formularios, webhooks)
export const config = {
  matcher: ['/((?!_next/static|_next/image|api/).*)'],
}
