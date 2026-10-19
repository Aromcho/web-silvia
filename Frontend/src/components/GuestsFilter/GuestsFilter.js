'use client'

import { FaUsers, FaMinus, FaPlus } from 'react-icons/fa'
import './GuestsFilter.css'

export const MAX_GUESTS = 16
const QUICK_OPTIONS = [2, 4, 6, 8]

export const guestsText = (n) => (n > 0 ? `${n} ${n === 1 ? 'persona' : 'personas'}` : 'Cualquier cantidad')

// Selector "¿Cuántas personas son?" (stepper + atajos). value = 0 significa sin filtro.
// Lo usan /alquiler-temporario y /propiedades (operación Alquilar).
export default function GuestsFilter({ value, onChange, className = '' }) {
  const set = (n) => onChange(Math.max(0, Math.min(MAX_GUESTS, n)))

  return (
    <div className={`guests-filter ${className}`}>
      <div className="gf-guests">
        <span className="gf-label">
          <FaUsers aria-hidden="true" />
          ¿Cuántas personas son?
        </span>
        <div className="gf-stepper" role="group" aria-label="Cantidad de personas">
          <button type="button" className="gf-step-btn" onClick={() => set(value - 1)} disabled={value === 0} aria-label="Una persona menos">
            <FaMinus />
          </button>
          <span className={`gf-step-value${value === 0 ? ' is-any' : ''}`} aria-live="polite">
            {guestsText(value)}
          </span>
          <button type="button" className="gf-step-btn" onClick={() => set(value + 1)} disabled={value >= MAX_GUESTS} aria-label="Una persona más">
            <FaPlus />
          </button>
        </div>
      </div>

      <div className="gf-quick" role="group" aria-label="Opciones rápidas">
        {QUICK_OPTIONS.map((n) => (
          <button
            key={n}
            type="button"
            className={`gf-chip${value === n ? ' is-active' : ''}`}
            aria-pressed={value === n}
            onClick={() => set(value === n ? 0 : n)}
          >
            {n}+
          </button>
        ))}
        {value > 0 && (
          <button type="button" className="gf-clear" onClick={() => set(0)}>
            Quitar filtro
          </button>
        )}
      </div>
    </div>
  )
}
