(function () {
    'use strict';

    var NUMERO_WHATSAPP = '524433514415';
    var MENSAJE = 'Hola, quiero contratar su servicio';

    var toggle = document.querySelector('.nav-toggle');
    if (!toggle) return;

    toggle.setAttribute('aria-label', 'Contratar servicio por WhatsApp');
    toggle.removeAttribute('aria-controls');
    toggle.removeAttribute('aria-expanded');

    toggle.addEventListener('click', function () {
        var url = 'https://wa.me/' + NUMERO_WHATSAPP + '?text=' + encodeURIComponent(MENSAJE);
        window.open(url, '_blank', 'noopener');
    });
})();