'use client'

// Registra el origen del visitante en cada página y suma «Ref. ABC» a todos los links de WhatsApp
// de la web en el momento del clic (antes de que se abra el chat), sin tocar cada botón.

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { captureAttribution, addRefToWhatsAppUrl } from '../../services/attribution'

export default function AttributionCapture() {
  const pathname = usePathname()

  useEffect(() => {
    captureAttribution()
  }, [pathname])

  useEffect(() => {
    const onClick = (ev) => {
      const link = ev.target?.closest?.('a[href*="wa.me/"], a[href*="api.whatsapp.com/"]')
      if (!link) return
      link.href = addRefToWhatsAppUrl(link.href)
      // Conversión para Google Ads / Analytics y Meta (si el pixel está activo)
      try {
        window.gtag?.('event', 'generate_lead', { method: 'whatsapp', page: window.location.pathname })
        window.fbq?.('track', 'Contact')
      } catch {
        // sin analytics
      }
    }
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
