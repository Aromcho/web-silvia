import Link from 'next/link';
import '../privacidad/legal.css';

export const metadata = {
  title: 'Eliminación de datos - Silvia Fernández Inmobiliaria',
  description: 'Cómo pedir la eliminación de tus datos de Instagram guardados por Silvia Fernández Inmobiliaria.',
  alternates: { canonical: '/eliminacion-de-datos' },
};

const CONTACT_EMAIL = 'braicesfernandez@gmail.com';

export default function EliminacionDeDatosPage() {
  return (
    <div className="legal-page">
      <div className="page-hero">
        <div className="container">
          <h1>Eliminación de datos</h1>
          <p>Cómo pedir que borremos tus datos de Instagram</p>
        </div>
      </div>

      <div className="legal-content">
        <div className="container">
          <article className="legal-body">
            <p className="legal-updated">Última actualización: 21 de octubre de 2026</p>

            <p>
              Si comentaste una publicación de nuestra cuenta de Instagram y te respondimos por mensaje directo, guardamos tu usuario de
              Instagram, tu comentario y el estado del mensaje enviado, como se detalla en nuestra{' '}
              <Link href="/privacidad">Política de Privacidad</Link>. Podés pedir que los eliminemos de cualquiera de estas formas:
            </p>

            <h2>Opción 1: por correo electrónico</h2>
            <ol>
              <li>Escribinos a <a href={`mailto:${CONTACT_EMAIL}?subject=Eliminación%20de%20datos%20de%20Instagram`}>{CONTACT_EMAIL}</a> con el asunto &quot;Eliminación de datos de Instagram&quot;.</li>
              <li>Indicá tu nombre de usuario de Instagram.</li>
              <li>Eliminamos todos tus datos dentro de los 10 días hábiles y te confirmamos por el mismo medio.</li>
            </ol>

            <h2>Opción 2: por mensaje directo de Instagram</h2>
            <p>
              Enviá un mensaje directo a nuestra cuenta de Instagram con el texto &quot;eliminar mis datos&quot;. Un asesor procesa el pedido y te
              confirma por la misma conversación.
            </p>

            <h2>Opción 3: desde la configuración de Instagram</h2>
            <p>
              Si conectaste tu cuenta a nuestra aplicación &quot;SF Propiedades DM&quot;, podés quitarla desde Instagram en{' '}
              <strong>Configuración → Apps y sitios web</strong>, eligiendo la aplicación y tocando <strong>Eliminar</strong>. Meta nos
              notifica automáticamente y borramos los datos asociados a tu cuenta. Vas a recibir un código de confirmación con el que podés
              consultar el estado del pedido.
            </p>

            <div className="legal-box">
              <p>
                <strong>Qué se elimina:</strong> tu identificador y usuario de Instagram, el texto de tus comentarios, los enlaces a las
                publicaciones comentadas y el registro de los mensajes que te enviamos. La eliminación es definitiva.
              </p>
            </div>

            <h2>Contacto</h2>
            <p>
              Silvia Fernández Inmobiliaria — Calle 34 y Mar del Plata, Mar Azul, Buenos Aires, Argentina.<br />
              Correo: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </article>
        </div>
      </div>
    </div>
  );
}
