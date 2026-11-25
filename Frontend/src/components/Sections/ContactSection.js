'use client'

// Sección de contacto compartida (home y Nosotros): un solo diseño para todo el sitio.
import { useState } from 'react'
import { FaEnvelope, FaMapMarkerAlt, FaWhatsapp, FaFacebookF, FaInstagram } from 'react-icons/fa'
import { logWhatsAppClick } from '../../services/whatsappService'
import { getAttribution } from '../../services/attribution'
import './ContactSection.css'

const contacts = [
  { name: 'Silvia', phone: '5492255509408' },
  { name: 'Fabiana', phone: '5492255626092' },
  { name: 'Valentin', phone: '5492255622841' },
  { name: 'Paul', phone: '5492254602453' },
  { name: 'Cecilia', phone: '5492216006474' },
  { name: 'Pablo', phone: '5492255609992' }
]

const formatDisplayPhone = (phone) => `+54 9 ${phone.slice(3, 7)} ${phone.slice(7, 9)}-${phone.slice(9)}`

const makeWhatsAppLink = (phone, message) => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

export default function ContactSection() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState('idle') // idle | loading | success | error

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setStatus('loading')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, attribution: getAttribution() }),
      })

      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  return (
    <section className="sf-section sf-section--tint" id="contacto" aria-labelledby="contact-title">
      <div className="container">
        <header className="sf-head">
          <h2 className="sf-title" id="contact-title">¿Tenés alguna <span className="sf-accent">consulta</span>?</h2>
          <p className="sf-subtitle">Escribinos y te respondemos lo antes posible.</p>
        </header>

        <div className="sf-contact-panel">
          {/* Lado verde: el WhatsApp de cada persona del equipo, correo y oficinas */}
          <aside className="sf-contact-info" aria-label="Datos de contacto">
            <h3 className="sf-contact-info-title">Hablá directo por WhatsApp</h3>
            <p className="sf-contact-info-text">Elegí a quién escribirle de nuestro equipo.</p>
            <ul className="sf-contact-wa">
              {contacts.map((contact) => (
                <li key={contact.name}>
                  <a
                    href={makeWhatsAppLink(contact.phone, `Hola ${contact.name}, consulto por una propiedad`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => logWhatsAppClick({
                      name: contact.name,
                      phone: contact.phone,
                      source: 'contact-page',
                      assigned: false,
                    })}
                  >
                    <span className="sf-contact-wa-icon"><FaWhatsapp aria-hidden="true" /></span>
                    <span className="sf-contact-wa-text">
                      <strong>{contact.name}</strong>
                      <span>{formatDisplayPhone(contact.phone)}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="sf-contact-rows">
              <a className="sf-contact-row" href="mailto:braicesfernandez@gmail.com">
                <FaEnvelope aria-hidden="true" />
                <span>braicesfernandez@gmail.com</span>
              </a>
              <p className="sf-contact-row">
                <FaMapMarkerAlt aria-hidden="true" />
                <span><strong>Central:</strong> Calle 34 y Mar del Plata - Mar Azul</span>
              </p>
              <p className="sf-contact-row">
                <FaMapMarkerAlt aria-hidden="true" />
                <span><strong>Sucursal boutique:</strong> Av del Plata y Uritorco - Mar de las Pampas</span>
              </p>
            </div>

            <div className="sf-contact-socials">
              <a href="https://www.facebook.com/Silviafernadezpropiedades/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebookF aria-hidden="true" /></a>
              <a href="https://www.instagram.com/silviafernandezpropiedades/" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram aria-hidden="true" /></a>
            </div>
          </aside>

          <form className="sf-contact-form" onSubmit={handleSubmit}>
            <h3 className="sf-contact-form-title">O dejanos tu mensaje</h3>
            <div className="sf-field sf-field--full">
              <label htmlFor="contact-name">Nombre completo</label>
              <input id="contact-name" type="text" name="name" value={form.name} onChange={handleChange} autoComplete="name" required />
            </div>
            <div className="sf-field">
              <label htmlFor="contact-email">Correo electrónico</label>
              <input id="contact-email" type="email" name="email" value={form.email} onChange={handleChange} autoComplete="email" required />
            </div>
            <div className="sf-field">
              <label htmlFor="contact-phone">Teléfono</label>
              <input id="contact-phone" type="tel" name="phone" value={form.phone} onChange={handleChange} autoComplete="tel" required />
            </div>
            <div className="sf-field sf-field--full">
              <label htmlFor="contact-message">Mensaje</label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                rows="5"
                placeholder="Contanos qué estás buscando"
                required
              ></textarea>
            </div>
            <button type="submit" className="sf-contact-submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Enviando...' : 'Enviar mensaje'}
            </button>
            {status === 'success' && (
              <p className="sf-contact-status sf-contact-status--ok" role="status">
                ¡Mensaje enviado! Te contactamos a la brevedad.
              </p>
            )}
            {status === 'error' && (
              <p className="sf-contact-status sf-contact-status--error" role="alert">
                No se pudo enviar. Probá de nuevo o escribinos por WhatsApp.
              </p>
            )}
          </form>

        </div>
      </div>
    </section>
  )
}
