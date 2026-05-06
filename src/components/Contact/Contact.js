'use client'

import { useState } from 'react'
import { FaEnvelope, FaMapMarkerAlt, FaPhone, FaWhatsapp, FaFacebookF, FaInstagram, FaLinkedin } from 'react-icons/fa'
import './Contact.css'

const contacts = [
  { name: 'Silvia', phone: '5492255509408' },
  { name: 'Fabiana', phone: '5492255626092' },
  { name: 'Conrado', phone: '5492255622841' },
  { name: 'Paul', phone: '5492254602453' },
  { name: 'Cecilia', phone: '5492216006474' }
]

const formatDisplayPhone = (phone) => `+54 9 ${phone.slice(3, 7)} ${phone.slice(7, 9)}-${phone.slice(9)}`

const makeWhatsAppLink = (phone, message) => `https://wa.me/${phone}?text=${encodeURIComponent(message)}`

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    const subject = encodeURIComponent(`Consulta desde la web - ${form.name || 'Sin nombre'}`)
    const body = encodeURIComponent(
      `Nombre: ${form.name}\nEmail: ${form.email}\nTeléfono: ${form.phone}\n\nMensaje:\n${form.message}`
    )

    window.location.href = `mailto:braicesfernandez@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <section className="contact-home-section" id="contacto" aria-labelledby="contact-home-title">
      <div className="container">
        <div className="contact-home-panel">
          <div className="contact-home-header">
            <p className="contact-kicker">Contáctanos</p>
            <h2 id="contact-home-title">Estamos aquí para ayudarte</h2>
            <p className="contact-home-copy">
              Envíanos un mensaje y nos pondremos en contacto contigo lo antes posible.
            </p>
          </div>

          <div className="contact-home-grid">
            <form className="contact-form-card" onSubmit={handleSubmit}>
              <label>
                Nombre Completo *
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Nombre Completo *" required />
              </label>
              <label>
                Correo Electrónico *
                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Correo Electrónico *" required />
              </label>
              <label>
                Teléfono *
                <input type="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Teléfono *" required />
              </label>
              <label>
                Mensaje
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="5"
                  placeholder="Escribe tu mensaje aquí..."
                  required
                ></textarea>
              </label>
              <button type="submit" className="contact-submit-btn">Enviar Mensaje</button>
            </form>

            <div className="contact-divider" aria-hidden="true" />

            <aside className="contact-info-card">
              <div className="contact-info-column">
              <div className="contact-info-block">
                <FaEnvelope />
                <div>
                  <span className="contact-info-label">Correo</span>
                  <a href="mailto:braicesfernandez@gmail.com">braicesfernandez@gmail.com</a>
                </div>
              </div>

              <div className="contact-info-block">
                <FaMapMarkerAlt />
                <div>
                  <span className="contact-info-label">Direcciones</span>
                  <p>Central: Calle 34 y Mar del Plata - Mar Azul</p>
                  <p>Sucursal boutique: Av del Plata y Uritorco - Mar de las Pampas</p>
                </div>
              </div>

              <div className="contact-info-block contact-info-block-stack">
                <FaWhatsapp />
                <div>
                  <span className="contact-info-label">WhatsApp directos</span>
                  <div className="contact-whatsapp-list">
                    {contacts.map((contact) => (
                      <a
                        key={contact.name}
                        href={makeWhatsAppLink(contact.phone, `Hola ${contact.name}, consulto por una propiedad`)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-whatsapp-link"
                      >
                        {contact.name}: {formatDisplayPhone(contact.phone)}
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <div className="contact-info-block">
                <FaPhone />
                <div>
                  <span className="contact-info-label">Atención</span>
                  <p>Te ayudamos a elegir la propiedad adecuada y te orientamos en la consulta.</p>
                </div>
              </div>

              <div className="contact-socials">
                <a href="#" aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" aria-label="Instagram"><FaInstagram /></a>
                <a href="#" aria-label="LinkedIn"><FaLinkedin /></a>
              </div>

              </div>
            </aside>
          </div>
        </div>
      </div>
    </section>
  )
}