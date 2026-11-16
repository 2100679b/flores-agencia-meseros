// whatsapp.js - Enlaces y formulario de contacto por WhatsApp

document.addEventListener('DOMContentLoaded', () => {
    const NUMERO_WHATSAPP = "524433514415";
    const MENSAJE_AMABLE = "Hola, quiero contratar su servicio";

    // 1. Todos los enlaces de WhatsApp sin mensaje abren el chat con el saludo
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(enlace => {
        const href = enlace.getAttribute('href');
        if (!href.includes('?text=')) {
            enlace.setAttribute('href', `${href}?text=${encodeURIComponent(MENSAJE_AMABLE)}`);
        }
    });

    // 2. Formulario de contacto
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('nombre').value.trim();
            const telefono = document.getElementById('telefono').value.trim();
            const email = document.getElementById('email').value.trim();
            const fecha = document.getElementById('fecha').value;
            const lugar = document.getElementById('lugar').value.trim();
            const mensaje = document.getElementById('mensaje').value.trim();

            const textoMensaje =
                `Hola, quiero contratar su servicio.\n\n` +
                `📌 *NUEVA SOLICITUD DE COTIZACIÓN*\n\n` +
                `👤 *Nombre:* ${nombre}\n` +
                `📞 *Teléfono:* ${telefono}\n` +
                `✉️ *Correo:* ${email || 'No especificado'}\n` +
                `📅 *Fecha Evento:* ${fecha}\n` +
                `📍 *Ubicación:* ${lugar || 'No especificada'}\n` +
                `📝 *Detalles:* ${mensaje || 'Sin detalles adicionales'}`;

            const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(textoMensaje)}`;
            window.open(urlWhatsApp, '_blank', 'noopener');
        });
    }
});