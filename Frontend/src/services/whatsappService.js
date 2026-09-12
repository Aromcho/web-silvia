/**
 * WhatsApp Service - rotación de agentes y tracking de consultas
 * API Base: /api/whatsapp/
 */

const buildUrl = (endpoint) => `/api/whatsapp${endpoint}`;

/**
 * Pide el próximo agente en la rotación para mostrar en el botón de WhatsApp
 * de una ficha de propiedad. Devuelve null si el backend no responde.
 * @returns {Promise<{name: string, phone: string} | null>}
 */
export const getNextWhatsAppAgent = async () => {
  try {
    const res = await fetch(buildUrl('/next-agent'), { cache: 'no-store' });
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
      body: JSON.stringify(payload),
    }).catch(() => {});
  } catch {
    // no-op
  }
};
