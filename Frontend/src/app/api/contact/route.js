import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

function buildPropertyHTML({ name, email, phone, message, propertyTitle, propertyUrl }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a6b45; padding: 20px 24px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Nueva consulta desde la web</h2>
        <p style="color: #a8d5be; margin: 4px 0 0; font-size: 13px;">Inmobiliaria Silvia Fernández</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 13px; width: 110px;"><strong>Nombre:</strong></td>
            <td style="padding: 8px 0; color: #222; font-size: 14px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 13px;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #1a6b45;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 13px;"><strong>Teléfono:</strong></td>
            <td style="padding: 8px 0; color: #222; font-size: 14px;">${phone}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 20px 24px; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0 0 8px; color: #555; font-size: 13px;"><strong>Propiedad de interés:</strong></p>
        <p style="margin: 0 0 6px; color: #222; font-size: 14px;">${propertyTitle}</p>
        <a href="${propertyUrl}" style="color: #1a6b45; font-size: 13px; word-break: break-all;">${propertyUrl}</a>
      </div>

      ${message ? `
      <div style="padding: 20px 24px; border-top: 1px solid #e0e0e0; background: #fff;">
        <p style="margin: 0 0 8px; color: #555; font-size: 13px;"><strong>Mensaje:</strong></p>
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
      </div>
      ` : ''}

      <div style="padding: 14px 24px; background: #f0f7f4; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #888; font-size: 12px;">
          Consulta recibida desde <strong>silviafernandezpropiedades.com.ar</strong>
        </p>
      </div>
    </div>
  `
}

function buildGeneralHTML({ name, email, phone, message }) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #1a6b45; padding: 20px 24px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px;">Nueva consulta general desde la web</h2>
        <p style="color: #a8d5be; margin: 4px 0 0; font-size: 13px;">Inmobiliaria Silvia Fernández</p>
      </div>

      <div style="padding: 24px; background: #f9f9f9;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 13px; width: 110px;"><strong>Nombre:</strong></td>
            <td style="padding: 8px 0; color: #222; font-size: 14px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 13px;"><strong>Email:</strong></td>
            <td style="padding: 8px 0; font-size: 14px;"><a href="mailto:${email}" style="color: #1a6b45;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #555; font-size: 13px;"><strong>Teléfono:</strong></td>
            <td style="padding: 8px 0; color: #222; font-size: 14px;">${phone}</td>
          </tr>
        </table>
      </div>

      <div style="padding: 20px 24px; border-top: 1px solid #e0e0e0; background: #fff;">
        <p style="margin: 0 0 8px; color: #555; font-size: 13px;"><strong>Mensaje:</strong></p>
        <p style="margin: 0; color: #333; font-size: 14px; line-height: 1.6;">${message.replace(/\n/g, '<br/>')}</p>
      </div>

      <div style="padding: 14px 24px; background: #f0f7f4; border-top: 1px solid #e0e0e0;">
        <p style="margin: 0; color: #888; font-size: 12px;">
          Consulta recibida desde <strong>silviafernandezpropiedades.com.ar</strong>
        </p>
      </div>
    </div>
  `
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, email, phone, message, propertyTitle, propertyUrl } = body

    if (!name || !email || !phone) {
      return Response.json({ error: 'Nombre, email y teléfono son obligatorios' }, { status: 400 })
    }

    const isPropertyInquiry = Boolean(propertyTitle)

    const subject = isPropertyInquiry
      ? `Consulta por propiedad: ${propertyTitle}`
      : `Consulta general desde la web - ${name}`

    const html = isPropertyInquiry
      ? buildPropertyHTML({ name, email, phone, message, propertyTitle, propertyUrl })
      : buildGeneralHTML({ name, email, phone, message })

    await transporter.sendMail({
      from: `"Web Silvia Fernández" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || process.env.EMAIL_USER,
      replyTo: email,
      subject,
      html,
    })

    return Response.json({ success: true })
  } catch (error) {
    console.error('Error sending email:', error)
    return Response.json({ error: 'Error al enviar el mensaje' }, { status: 500 })
  }
}
