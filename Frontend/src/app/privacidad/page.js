import Link from 'next/link';
import './legal.css';

export const metadata = {
  title: 'Política de Privacidad - Silvia Fernández Inmobiliaria',
  description: 'Cómo Silvia Fernández Inmobiliaria recolecta, usa y protege los datos personales, incluidos los datos de Instagram.',
  alternates: { canonical: '/privacidad' },
};

const CONTACT_EMAIL = 'braicesfernandez@gmail.com';

export default function PrivacidadPage() {
  return (
    <div className="legal-page">
      <div className="page-hero">
        <div className="container">
          <h1>Política de Privacidad</h1>
          <p>Cómo tratamos tus datos personales</p>
        </div>
      </div>

      <div className="legal-content">
        <div className="container">
          <article className="legal-body">
            <p className="legal-updated">Última actualización: 21 de octubre de 2026</p>

            <h2>1. Quiénes somos</h2>
            <p>
              Silvia Fernández Inmobiliaria (en adelante, &quot;la Inmobiliaria&quot;), con oficina central en Calle 34 y Mar del Plata,
              Mar Azul, Provincia de Buenos Aires, Argentina, es responsable del tratamiento de los datos personales descriptos en esta
              política. Podés contactarnos en <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            </p>

            <h2>2. Alcance</h2>
            <p>
              Esta política aplica a este sitio web, a los formularios de contacto y a la automatización de mensajes que usamos en nuestra
              cuenta de Instagram, que funciona mediante la aplicación &quot;SF Propiedades DM&quot; sobre la API oficial de Instagram (Meta).
            </p>

            <h2>3. Datos de Instagram que recolectamos</h2>
            <p>Cuando comentás una publicación o reel de nuestra cuenta de Instagram, podemos recibir y guardar:</p>
            <ul>
              <li>Tu identificador de Instagram (ID asignado por Instagram a nuestra aplicación) y tu nombre de usuario.</li>
              <li>El texto del comentario, su identificador y la fecha.</li>
              <li>La publicación o reel en la que comentaste (identificador y enlace).</li>
              <li>El estado del mensaje directo que te enviamos en respuesta (enviado o con error) y, si respondés por mensaje directo, el contenido de ese mensaje.</li>
            </ul>
            <p>
              No accedemos a tu contraseña, a tus seguidores, a tus mensajes con otras personas ni a ningún otro dato de tu cuenta.
              De la cuenta de Instagram de la Inmobiliaria guardamos el token de acceso que Instagram nos otorga para operar la cuenta.
            </p>

            <h2>4. Para qué usamos los datos</h2>
            <ul>
              <li>Responderte por mensaje directo con la información que pediste en tu comentario (por ejemplo, &quot;info&quot; o &quot;alquiler&quot;): datos de contacto de nuestros asesores y, si corresponde, el enlace a la ficha de la propiedad publicada.</li>
              <li>Opcionalmente, responder públicamente tu comentario para avisarte que te escribimos por mensaje directo.</li>
              <li>Registrar tu consulta en nuestro sistema interno de gestión (CRM) para que un asesor pueda hacer el seguimiento.</li>
              <li>Evitar enviarte el mismo mensaje más de una vez.</li>
            </ul>
            <p>No usamos tus datos para publicidad, perfiles automatizados ni ningún fin distinto de responder tu consulta.</p>

            <h2>5. Dónde se almacenan</h2>
            <p>
              Los datos se guardan en una base de datos propia de la Inmobiliaria, alojada en un servidor privado con acceso restringido por
              usuario y contraseña, y transmitida siempre mediante conexiones cifradas (HTTPS). Solo el personal autorizado de la Inmobiliaria
              puede acceder a ellos.
            </p>

            <h2>6. Cuánto tiempo los conservamos</h2>
            <p>
              Conservamos los datos de cada consulta recibida por Instagram durante un máximo de 12 meses desde que se registró; después se
              eliminan automáticamente. Si pedís la eliminación antes, los borramos según se explica más abajo.
            </p>

            <h2>7. No vendemos ni compartimos tus datos</h2>
            <p>
              No vendemos, alquilamos ni cedemos tus datos personales a terceros. Solo los procesa Meta Platforms, Inc. como proveedor de
              Instagram, para entregar los mensajes, según sus propias políticas. Podríamos revelarlos únicamente si una autoridad competente
              lo exige por ley.
            </p>

            <h2>8. Tus derechos y cómo pedir la eliminación</h2>
            <p>
              Podés pedir en cualquier momento el acceso, la rectificación o la eliminación de tus datos. Para eliminar los datos de Instagram
              seguí las instrucciones de nuestra página de <Link href="/eliminacion-de-datos">eliminación de datos</Link>, o escribinos a{' '}
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> indicando tu usuario de Instagram. Respondemos dentro de los 10 días hábiles.
            </p>
            <div className="legal-box">
              <p>
                El titular de los datos tiene la facultad de ejercer el derecho de acceso a los mismos en forma gratuita a intervalos no
                inferiores a seis meses, salvo que se acredite un interés legítimo al efecto conforme lo establecido en el artículo 14,
                inciso 3 de la Ley Nº 25.326. La Agencia de Acceso a la Información Pública, en su carácter de Órgano de Control de la
                Ley Nº 25.326, tiene la atribución de atender las denuncias y reclamos que interpongan quienes resulten afectados en sus
                derechos por incumplimiento de las normas vigentes en materia de protección de datos personales.
              </p>
            </div>

            <h2>9. Otros datos del sitio web</h2>
            <p>
              Si nos contactás por los formularios o por WhatsApp desde este sitio, usamos tu nombre, teléfono, correo y mensaje solo para
              responder tu consulta inmobiliaria, con los mismos criterios de almacenamiento y confidencialidad.
            </p>

            <h2>10. Cambios a esta política</h2>
            <p>Si modificamos esta política, publicaremos la versión actualizada en esta misma página con su fecha de actualización.</p>

            <h2>11. Contacto</h2>
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
