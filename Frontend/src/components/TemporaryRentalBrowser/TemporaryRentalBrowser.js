'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaUsers } from 'react-icons/fa'
import PropertiesGrid from '../PropertiesGrid/PropertiesGrid'
import GuestsFilter, { MAX_GUESTS, guestsText } from '../GuestsFilter/GuestsFilter'
import './TemporaryRentalBrowser.css'

// Listado de alquileres temporarios con filtro por cantidad de personas.
// La cantidad queda en la URL (?personas=4) para poder compartir la búsqueda.
export default function TemporaryRentalBrowser() {
  const [guests, setGuests] = useState(0)
  const [count, setCount] = useState(null)

  useEffect(() => {
    const fromUrl = parseInt(new URLSearchParams(window.location.search).get('personas'), 10)
    if (fromUrl > 0) setGuests(Math.min(fromUrl, MAX_GUESTS))
  }, [])

  const updateGuests = useCallback((next) => {
    setGuests(next)
    const url = new URL(window.location.href)
    if (next > 0) url.searchParams.set('personas', String(next))
    else url.searchParams.delete('personas')
    window.history.replaceState(null, '', url)
  }, [])

  const filters = useMemo(() => ({
    operation: 'alquiler temporario',
    ...(guests > 0 ? { minGuests: guests } : {}),
  }), [guests])

  let summary = ''
  if (count !== null) {
    const noun = count === 1 ? 'alquiler disponible' : 'alquileres disponibles'
    summary = guests > 0 ? `${count} ${noun} para ${guestsText(guests)} o más` : `${count} ${noun}`
  }

  return (
    <>
      <div className="trb-bar-wrap">
        <div className="container">
          <GuestsFilter value={guests} onChange={updateGuests} className="trb-bar" />
          <p className="trb-summary" aria-live="polite">{summary || ' '}</p>
        </div>
      </div>

      <PropertiesGrid
        filters={filters}
        onCountChange={setCount}
        emptyState={guests > 0 ? (
          <div className="trb-empty">
            <FaUsers className="trb-empty-icon" aria-hidden="true" />
            <p>No encontramos alquileres para {guestsText(guests)} o más.</p>
            <span>Probá con menos personas o escribinos y te ayudamos a encontrar opciones.</span>
            <button type="button" className="trb-empty-btn" onClick={() => updateGuests(0)}>
              Ver todos los alquileres
            </button>
          </div>
        ) : null}
      />
    </>
  )
}
