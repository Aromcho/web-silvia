import Link from 'next/link'
import './not-found.css'

export const metadata = {
  title: 'Página no encontrada | Silvia Fernández Inmobiliaria',
}

export default function NotFound() {
  return (
    <div className="error-page">
      <div className="error-bg" />

      <div className="error-content">
        <div className="error-logo">
          <img src="/assets/images/logo.jpg" alt="Silvia Fernández" />
        </div>

        <div className="error-code">404</div>

        <div className="error-house">🏠</div>

        <h1 className="error-title">Esta propiedad no existe</h1>
        <p className="error-subtitle">
          La página que buscás no fue encontrada. Puede que haya sido removida
          o que la dirección sea incorrecta.
        </p>

        <div className="error-actions">
          <Link href="/" className="error-btn error-btn--primary">
            Volver al inicio
          </Link>
          <Link href="/propiedades" className="error-btn error-btn--secondary">
            Ver propiedades
          </Link>
        </div>
      </div>
    </div>
  )
}
