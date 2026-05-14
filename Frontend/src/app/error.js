'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import './not-found.css'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="error-page">
      <div className="error-bg" />

      <div className="error-content">
        <div className="error-logo">
          <img src="/assets/images/logo.jpg" alt="Silvia Fernández" />
        </div>

        <div className="error-code error-code--500">500</div>

        <div className="error-house">⚠️</div>

        <h1 className="error-title">Algo salió mal</h1>
        <p className="error-subtitle">
          Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
        </p>

        <div className="error-actions">
          <button onClick={reset} className="error-btn error-btn--primary">
            Intentar de nuevo
          </button>
          <Link href="/" className="error-btn error-btn--secondary">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
