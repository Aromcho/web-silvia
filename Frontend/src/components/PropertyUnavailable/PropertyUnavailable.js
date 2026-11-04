'use client'

// Ficha dada de baja o inexistente (link viejo de un anuncio, de WhatsApp o de Google).
// La página responde 404 real (notFound() en page.js) y acá ofrece hasta 3 parecidas de la
// misma zona y operación, más un atajo a WhatsApp.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { FaWhatsapp, FaArrowRight } from 'react-icons/fa'
import PropertyCard from '../PropertyCard/PropertyCard'
import { getSimilarToRemoved } from '../../services/propertyService'
import { getNextWhatsAppAgent, logWhatsAppClick } from '../../services/whatsappService'
import { tidyPlaceName } from '../../helpers/index.js'
import './PropertyUnavailable.css'

const DEFAULT_PHONE = '5492255626092'

const operationLabel = (operation) => {
  const t = String(operation || '').toLowerCase()
  if (t.includes('temporari') || t.includes('temporal')) return 'alquiler temporario'
  if (t.includes('alquiler')) return 'alquiler'
  if (t.includes('venta')) return 'venta'
  return ''
}

export default function PropertyUnavailable() {
  const pathname = usePathname() || ''
  const id = (pathname.match(/\/(\d+)\/?$/) || [])[1] || ''
  const [state, setState] = useState({ loading: true, removed: null, similar: [] })

  useEffect(() => {
    let cancelled = false
    getSimilarToRemoved(id || '0')
      .then((data) => {
        if (cancelled) return
        setState({
          loading: false,
          removed: data?.removed || null,
          similar: Array.isArray(data?.similar) ? data.similar : [],
        })
      })
      .catch(() => {
        if (!cancelled) setState({ loading: false, removed: null, similar: [] })
      })
    return () => { cancelled = true }
  }, [id])

  const place = tidyPlaceName(state.removed?.location)
  const operation = operationLabel(state.removed?.operation)
  const lookingFor = [operation, place && `en ${place}`].filter(Boolean).join(' ')
  const similarTitle = place ? `Opciones parecidas en ${place}` : 'Opciones que te pueden interesar'

  const handleWhatsApp = async () => {
    const agent = await getNextWhatsAppAgent()
    const phone = agent?.phone || DEFAULT_PHONE
    const text = id
      ? `Hola, entré a la ficha #${id} y ya no está disponible. Busco algo parecido${lookingFor ? ` (${lookingFor})` : ''}.`
      : 'Hola, busco una propiedad y quería que me ayuden.'
    logWhatsAppClick({
      name: agent?.name,
      phone,
      source: 'ficha-no-disponible',
      propertyId: id || undefined,
      assigned: Boolean(agent),
    })
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank', 'noopener')
  }

  return (
    <main className="pu-page">
      <section className="pu-hero" aria-labelledby="pu-title">
        {id && <p className="pu-kicker">Ficha #{id}</p>}
        <h1 id="pu-title" className="pu-title">Esta propiedad ya no está disponible</h1>
        <p className="pu-copy">
          Se vendió, se alquiló o la dieron de baja.
          {lookingFor
            ? ` Te mostramos otras de ${lookingFor} que siguen disponibles.`
            : ' Te mostramos otras que siguen disponibles.'}
        </p>
        <div className="pu-actions">
          <button type="button" className="pu-btn pu-btn--whatsapp" onClick={handleWhatsApp}>
            <FaWhatsapp aria-hidden="true" />
            <span>Pedir algo parecido por WhatsApp</span>
          </button>
          <Link href="/propiedades" className="pu-btn pu-btn--ghost">
            <span>Ver todas las propiedades</span>
            <FaArrowRight aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="pu-similar" aria-labelledby="pu-similar-title" aria-busy={state.loading}>
        <h2 id="pu-similar-title" className="pu-similar-title">{similarTitle}</h2>
        {state.loading ? (
          <div className="pu-grid">
            {[0, 1, 2].map((i) => (
              <div key={i} className="pu-skeleton" aria-hidden="true">
                <div className="pu-skeleton-img" />
                <div className="pu-skeleton-line" />
                <div className="pu-skeleton-line pu-skeleton-line--short" />
              </div>
            ))}
          </div>
        ) : state.similar.length > 0 ? (
          <div className="pu-grid">
            {state.similar.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <p className="pu-empty">
            Ahora no tenemos otras parecidas publicadas. Escribinos y te avisamos cuando entre una.
          </p>
        )}
      </section>
    </main>
  )
}
