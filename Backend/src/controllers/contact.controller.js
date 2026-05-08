// controllers/contactController.js
import Mailjet from 'node-mailjet';

const mailjet = Mailjet.apiConnect(
    `${process.env.MJ_APIKEY_PUBLIC}`,
    `${process.env.MJ_APIKEY_PRIVATE}`
);

export const sendContactEmail = async (req, res, next) => {
    const { name, email, phone, message, subject, url, property, direction } = req.body;

    try {
        const request = await mailjet.post('send', { version: 'v3.1' }).request({
            Messages: [
                {
                    From: {
                        Email: 'barriosarom@gmail.com',
                        Name: 'Formulario de contacto - Nueva web'
                    },
                    To: [
                        { Email: 'braicesfernandez@gmail.com' },
                        { Email: 'barriosarom@gmail.com' }
                    ],
                    Subject: subject || 'Contacto',
                    TextPart: `
                        Nueva consulta ${subject || 'Contacto'}
                        URL: ${url || 'No especificado'}
                        Nombre: ${name}
                        Teléfono de contacto: ${phone}
                        E-mail: ${email}
                        Mensaje: ${message}
                        Tipo de Propiedad: ${property || 'No especificado'}
                        Dirección: ${direction || 'No especificado'}
                    `,
                }
            ]
        });

        res.status(200).json({ code: 1, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        next(error);
    }
};
