// lightbox.js - Visor de fotos a pantalla completa para la galería

document.addEventListener('DOMContentLoaded', () => {
    const fotos = Array.from(document.querySelectorAll('.gallery-grid img'));
    if (fotos.length === 0) return;

    let indice = 0;
    let ultimoFoco = null;
    let inicioX = 0;

    // Crear el visor
    const visor = document.createElement('div');
    visor.className = 'lightbox';
    visor.setAttribute('role', 'dialog');
    visor.setAttribute('aria-modal', 'true');
    visor.setAttribute('aria-label', 'Visor de fotografías');
    visor.innerHTML =
        '<button type="button" class="lightbox-close" aria-label="Cerrar">&times;</button>' +
        '<button type="button" class="lightbox-nav lightbox-prev" aria-label="Foto anterior">&#10094;</button>' +
        '<figure class="lightbox-figure">' +
            '<img class="lightbox-img" alt="">' +
            '<figcaption class="lightbox-caption"></figcaption>' +
        '</figure>' +
        '<button type="button" class="lightbox-nav lightbox-next" aria-label="Foto siguiente">&#10095;</button>';
    document.body.appendChild(visor);

    const imgVisor = visor.querySelector('.lightbox-img');
    const leyenda = visor.querySelector('.lightbox-caption');
    const btnCerrar = visor.querySelector('.lightbox-close');
    const btnPrev = visor.querySelector('.lightbox-prev');
    const btnNext = visor.querySelector('.lightbox-next');

    function mostrar(i) {
        indice = (i + fotos.length) % fotos.length;
        imgVisor.src = fotos[indice].currentSrc || fotos[indice].src;
        imgVisor.alt = fotos[indice].alt;
        leyenda.textContent = fotos[indice].alt + ' (' + (indice + 1) + ' de ' + fotos.length + ')';
    }

    function abrir(i) {
        ultimoFoco = document.activeElement;
        mostrar(i);
        visor.classList.add('open');
        document.body.classList.add('lightbox-open');
        btnCerrar.focus();
    }

    function cerrar() {
        visor.classList.remove('open');
        document.body.classList.remove('lightbox-open');
        imgVisor.removeAttribute('src');
        if (ultimoFoco) ultimoFoco.focus();
    }

    // Abrir al tocar una foto
    fotos.forEach((foto, i) => {
        foto.setAttribute('tabindex', '0');
        foto.setAttribute('role', 'button');
        foto.addEventListener('click', () => abrir(i));
        foto.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                abrir(i);
            }
        });
    });

    // Controles
    btnCerrar.addEventListener('click', cerrar);
    btnPrev.addEventListener('click', (e) => { e.stopPropagation(); mostrar(indice - 1); });
    btnNext.addEventListener('click', (e) => { e.stopPropagation(); mostrar(indice + 1); });

    // Cerrar al tocar el fondo (no la foto)
    visor.addEventListener('click', (e) => {
        if (e.target === visor || e.target.classList.contains('lightbox-figure')) cerrar();
    });

    // Teclado
    document.addEventListener('keydown', (e) => {
        if (!visor.classList.contains('open')) return;
        if (e.key === 'Escape') cerrar();
        if (e.key === 'ArrowLeft') mostrar(indice - 1);
        if (e.key === 'ArrowRight') mostrar(indice + 1);
    });

    // Deslizar con el dedo para cambiar de foto
    visor.addEventListener('touchstart', (e) => {
        inicioX = e.changedTouches[0].clientX;
    }, { passive: true });

    visor.addEventListener('touchend', (e) => {
        const diferencia = e.changedTouches[0].clientX - inicioX;
        if (Math.abs(diferencia) > 50) {
            mostrar(diferencia > 0 ? indice - 1 : indice + 1);
        }
    }, { passive: true });
});