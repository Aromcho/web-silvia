/**
 * WhatsApp Service - rotación de agentes y tracking de consultas
 * API Base: /api/whatsapp/
 */

import { getAttribution } from './attribution';

const buildUrl = (endpoint) => `/api/whatsapp${endpoint}`;

/**
 * Asesor de turno para el botón de WhatsApp y «Llamar». Solo mira el turno (peek): la rotación
 * avanza cuando alguien consulta de verdad (logWhatsAppClick), no cada vez que se abre una página.
 * Devuelve null si el backend no responde.
 * @returns {Promise<{name: string, phone: string} | null>}
 */
export const getNextWhatsAppAgent = async () => {
  try {
    const res = await fetch(buildUrl('/next-agent?peek=1'), { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
};

/**
 * Registra una consulta enviada por WhatsApp. Nunca debe romper la navegación
 * al chat, por eso no propaga errores.
 * @param {{name?: string, phone: string, source: string, propertyId?: string, propertyTitle?: string, assigned?: boolean}} payload
 */
export const logWhatsAppClick = (payload) => {
  try {
    fetch(buildUrl('/click'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      // Con el origen del visitante (campaña, anuncio o sitio) y su código «Ref.» (X6)
      body: JSON.stringify({ ...payload, attribution: getAttribution() }),
    }).catch(() => {});
  } catch {
    // no-op
  }
};
