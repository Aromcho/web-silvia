import { redirect } from 'next/navigation'

// Link corto para mandar por WhatsApp: /v/123 → la ficha abierta directo en el video.
export default function ShortVideoLink({ params }) {
  const id = String(params?.id || '').replace(/\D/g, '')
  redirect(id ? `/propiedad/${id}?video=1` : '/videos')
}
