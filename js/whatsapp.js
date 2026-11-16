// whatsapp.js - Envío de formulario de contacto por WhatsApp

document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    // Reemplazar con el número real de la agencia
    const NUMERO_WHATSAPP = "524431234567";

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value;
            const telefono = document.getElementById('telefono').value;
            const email = document.getElementById('email').value;
            const fecha = document.getElementById('fecha').value;
            const lugar = document.getElementById('lugar').value;
            const mensaje = document.getElementById('mensaje').value;

            // Formatear el texto para el mensaje de WhatsApp
            const textoMensaje = 
                `📌 *NUEVA SOLICITUD DE COTIZACIÓN*\n\n` +
                `👤 *Nombre:* ${nombre}\n` +
                `📞 *Teléfono:* ${telefono}\n` +
                `✉️ *Correo:* ${email}\n` +
                `📅 *Fecha Evento:* ${fecha}\n` +
                `📍 *Ubicación:* ${lugar || 'No especificada'}\n` +
                `📝 *Detalles:* ${mensaje || 'Sin detalles adicionales'}`;

            // Crear la URL y abrir la ventana de WhatsApp
            const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(textoMensaje)}`;
            window.open(urlWhatsApp, '_blank');
        });
    }
});