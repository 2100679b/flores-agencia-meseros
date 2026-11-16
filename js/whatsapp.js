// whatsapp.js - Enlaces y formulario de contacto por WhatsApp

document.addEventListener('DOMContentLoaded', () => {
    const NUMERO_WHATSAPP = "524433514415";
    const MENSAJE_AMABLE = "Hola, quiero contratar su servicio";

    // Emojis con códigos Unicode (evitan problemas de codificación del archivo)
    const E_PIN = "\u{1F4CC}";
    const E_USER = "\u{1F464}";
    const E_TEL = "\u{1F4DE}";
    const E_MAIL = "\u2709\uFE0F";
    const E_FECHA = "\u{1F4C5}";
    const E_LUGAR = "\u{1F4CD}";
    const E_NOTA = "\u{1F4DD}";

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
                `${E_PIN} *NUEVA SOLICITUD DE COTIZACIÓN*\n\n` +
                `${E_USER} *Nombre:* ${nombre}\n` +
                `${E_TEL} *Teléfono:* ${telefono}\n` +
                `${E_MAIL} *Correo:* ${email || 'No especificado'}\n` +
                `${E_FECHA} *Fecha Evento:* ${fecha}\n` +
                `${E_LUGAR} *Ubicación:* ${lugar || 'No especificada'}\n` +
                `${E_NOTA} *Detalles:* ${mensaje || 'Sin detalles adicionales'}`;

            const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(textoMensaje)}`;
            window.open(urlWhatsApp, '_blank', 'noopener');
        });
    }
});