// controllers/contactController.js
import Mailjet from 'node-mailjet';
import axios from 'axios';

const mailjet = Mailjet.apiConnect(
    `${process.env.MJ_APIKEY_PUBLIC}`,
    `${process.env.MJ_APIKEY_PRIVATE}`
);

// Además del mail, deja la consulta como Lead en el CRM (source: 'web') para que
// se pueda contar y hacer seguimiento ahí. Nunca debe romper el envío del formulario.
const createCrmLead = ({ name, email, phone, message }) => {
    const baseUrl = process.env.CRM_API_URL;
    if (!baseUrl) return;

    axios.post(`${baseUrl.replace(/\/$/, '')}/api/public/leads`, {
        name,
        email,
        phone,
        message,
        source: 'web',
    }, {
        headers: { 'X-Api-Key': process.env.CRM_API_KEY },
        timeout: 10000,
    }).catch((error) => {
        console.error('Error creando lead en CRM desde formulario de contacto:', error.message);
    });
};

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

        createCrmLead({ name, email, phone, message });

        res.status(200).json({ code: 1, message: 'Email sent successfully' });
    } catch (error) {
        console.error('Error sending email:', error);
        next(error);
    }
};
