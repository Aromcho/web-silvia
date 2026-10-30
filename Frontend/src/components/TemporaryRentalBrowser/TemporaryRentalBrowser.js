'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { FaUsers } from 'react-icons/fa'
import PropertiesGrid from '../PropertiesGrid/PropertiesGrid'
import GuestsFilter, { MAX_GUESTS, guestsText } from '../GuestsFilter/GuestsFilter'
import './TemporaryRentalBrowser.css'

// Listado de alquileres temporarios con filtro por cantidad de personas.
// La cantidad queda en la URL (?personas=4) para poder compartir la búsqueda.
// Pestañas: Temporario (por defecto) y Anual (?tipo=anual), así los locales en alquiler anual no aparecen primero.
const TABS = [
  { key: 'temporario', label: 'Temporario' },
  { key: 'anual', label: 'Anual' },
]

export default function TemporaryRentalBrowser() {
  const [guests, setGuests] = useState(0)
  const [count, setCount] = useState(null)
  const [tab, setTab] = useState('temporario')
  const isAnnual = tab === 'anual'

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const fromUrl = parseInt(params.get('personas'), 10)
    if (fromUrl > 0) setGuests(Math.min(fromUrl, MAX_GUESTS))
    if (params.get('tipo') === 'anual') setTab('anual')
  }, [])

  const changeTab = useCallback((next) => {
    setTab(next)
    setCount(null)
    const url = new URL(window.location.href)
    if (next === 'anual') url.searchParams.set('tipo', 'anual')
    else url.searchParams.delete('tipo')
    window.history.replaceState(null, '', url)
  }, [])

  const updateGuests = useCallback((next) => {
    setGuests(next)
    const url = new URL(window.location.href)
    if (next > 0) url.searchParams.set('personas', String(next))
    else url.searchParams.delete('personas')
    window.history.replaceState(null, '', url)
  }, [])

  const filters = useMemo(() => (isAnnual
    ? { operation: 'alquiler-anual' }
    : {
      operation: 'alquiler temporario',
      ...(guests > 0 ? { minGuests: guests } : {}),
    }), [guests, isAnnual])

  let summary = ''
  if (count !== null) {
    if (isAnnual) {
      summary = `${count} ${count === 1 ? 'alquiler anual disponible' : 'alquileres anuales disponibles'}`
    } else {
      const noun = count === 1 ? 'alquiler disponible' : 'alquileres disponibles'
      summary = guests > 0 ? `${count} ${noun} para ${guestsText(guests)} o más` : `${count} ${noun}`
    }
  }

  return (
    <>
      <div className="trb-bar-wrap">
        <div className="container">
          <div className="trb-tabs" role="tablist" aria-label="Tipo de alquiler">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                className={`trb-tab${tab === t.key ? ' is-active' : ''}`}
                onClick={() => changeTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
          {!isAnnual && <GuestsFilter value={guests} onChange={updateGuests} className="trb-bar" />}
          <p className="trb-summary" aria-live="polite">{summary || ' '}</p>
        </div>
      </div>

      <PropertiesGrid
        filters={filters}
        onCountChange={setCount}
        emptyState={isAnnual ? (
          <div className="trb-empty">
            <p>Por ahora no hay alquileres anuales publicados.</p>
            <span>Escribinos y te avisamos cuando haya opciones.</span>
          </div>
        ) : guests > 0 ? (
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
