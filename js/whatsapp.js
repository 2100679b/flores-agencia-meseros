// whatsapp.js - Enlaces de WhatsApp y formulario de contacto (validación + sugerencias de ubicación)

document.addEventListener('DOMContentLoaded', () => {
    const NUMERO_WHATSAPP = "524433514415";
    const MENSAJE_AMABLE = "Hola, quiero contratar su servicio";
    const MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio",
                   "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

    // Plazo máximo para agendar (en días a partir de hoy). Cambia este número si quieres ampliarlo.
    const DIAS_MAXIMOS = 14;

    // OPCIONAL: clave de Google Maps Platform (Places API (New) habilitada y restringida a tu dominio).
    // Si la dejas vacía, las sugerencias se buscan en OpenStreetMap (Photon), que es gratis pero con menos lugares.
    const GOOGLE_MAPS_API_KEY = "";

    // Zona de búsqueda de sugerencias: Michoacán de Ocampo
    const BBOX = { west: -103.75, south: 17.90, east: -100.05, north: 20.40 };

    const MUNICIPIOS = [
        "Acuitzio", "Aguililla", "Álvaro Obregón", "Angamacutiro", "Angangueo", "Apatzingán", "Aporo",
        "Aquila", "Ario", "Arteaga", "Briseñas", "Buenavista", "Carácuaro", "Charapan", "Charo",
        "Chavinda", "Cherán", "Chilchota", "Chinicuila", "Chucándiro", "Churintzio", "Churumuco",
        "Coahuayana", "Coalcomán de Vázquez Pallares", "Coeneo", "Cojumatlán de Régules", "Contepec",
        "Copándaro", "Cotija", "Cuitzeo", "Ecuandureo", "Epitacio Huerta", "Erongarícuaro",
        "Gabriel Zamora", "Hidalgo", "Huandacareo", "Huaniqueo", "Huetamo", "Huiramba", "Indaparapeo",
        "Irimbo", "Ixtlán", "Jacona", "Jiménez", "Jiquilpan", "José Sixto Verduzco", "Juárez",
        "Jungapeo", "La Huacana", "La Piedad", "Lagunillas", "Lázaro Cárdenas", "Los Reyes", "Madero",
        "Maravatío", "Marcos Castellanos", "Morelia", "Morelos", "Múgica", "Nahuatzen", "Nocupétaro",
        "Nuevo Parangaricutiro", "Nuevo Urecho", "Numarán", "Ocampo", "Pajacuarán", "Panindícuaro",
        "Paracho", "Parácuaro", "Pátzcuaro", "Penjamillo", "Peribán", "Purépero", "Puruándiro",
        "Queréndaro", "Quiroga", "Sahuayo", "Salvador Escalante", "San Lucas", "Santa Ana Maya",
        "Senguio", "Susupuato", "Tacámbaro", "Tancítaro", "Tangamandapio", "Tangancícuaro", "Tanhuato",
        "Taretan", "Tarímbaro", "Tepalcatepec", "Tingambato", "Tingüindín", "Tiquicheo de Nicolás Romero",
        "Tlalpujahua", "Tlazazalca", "Tocumbo", "Tumbiscatío", "Turicato", "Tuxpan", "Tuzantla",
        "Tzintzuntzan", "Tzitzio", "Uruapan", "Venustiano Carranza", "Villamar", "Vista Hermosa",
        "Yurécuaro", "Zacapu", "Zamora", "Zináparo", "Zinapécuaro", "Ziracuaretiro", "Zitácuaro"
    ];

    // Estados y países que NO se atienden (se comparan con los últimos datos de la dirección)
    const FUERA_DE_ZONA = [
        "aguascalientes", "baja california", "baja california sur", "campeche", "chiapas", "chihuahua",
        "ciudad de mexico", "cdmx", "coahuila", "colima", "durango", "estado de mexico", "edomex",
        "guanajuato", "guerrero", "jalisco", "nayarit", "nuevo leon", "oaxaca", "puebla", "queretaro",
        "quintana roo", "san luis potosi", "sinaloa", "sonora", "tabasco", "tamaulipas", "tlaxcala",
        "veracruz", "yucatan", "zacatecas", "china", "estados unidos", "usa", "eeuu", "canada",
        "espana", "francia", "alemania", "japon", "colombia", "argentina", "peru", "brasil"
    ];

    const normalizar = (t) => String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const escaparRegex = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const MUNICIPIOS_NORM = MUNICIPIOS.map(normalizar);

    // 1. Todos los enlaces de WhatsApp sin mensaje abren el chat con el saludo
    document.querySelectorAll('a[href^="https://wa.me/"]').forEach(enlace => {
        const href = enlace.getAttribute('href');
        if (!href.includes('?text=')) {
            enlace.setAttribute('href', `${href}?text=${encodeURIComponent(MENSAJE_AMABLE)}`);
        }
    });

    // 2. Formulario de contacto
    const form = document.getElementById('contact-form');
    if (!form) return;

    const campos = {
        nombre: document.getElementById('nombre'),
        telefono: document.getElementById('telefono'),
        email: document.getElementById('email'),
        fecha: document.getElementById('fecha'),
        lugar: document.getElementById('lugar'),
        mensaje: document.getElementById('mensaje')
    };
    const estado = document.getElementById('form-status');

    // ---------- Utilidades de fecha (hora local del visitante) ----------
    const dosDigitos = (n) => String(n).padStart(2, '0');
    const aTexto = (d) => `${d.getFullYear()}-${dosDigitos(d.getMonth() + 1)}-${dosDigitos(d.getDate())}`;

    function fechasLimite() {
        const hoy = new Date();
        const max = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + DIAS_MAXIMOS);
        return { hoy: aTexto(hoy), max: aTexto(max) };
    }

    function fechaLegible(valor) {
        const [a, m, d] = valor.split('-').map(Number);
        return `${d} de ${MESES[m - 1]} de ${a}`;
    }

    // El calendario solo permite fechas desde hoy hasta dentro de DIAS_MAXIMOS días
    function actualizarLimites() {
        const { hoy, max } = fechasLimite();
        campos.fecha.min = hoy;
        campos.fecha.max = max;
        const pista = document.getElementById('hint-fecha');
        if (pista) {
            pista.textContent = `Disponible desde hoy hasta el ${fechaLegible(max)}.`;
        }
    }
    actualizarLimites();

    // ---------- Ubicación: ¿está dentro de Michoacán? ----------
    let seleccion = null; // { texto, placeId?, lat?, lon? } cuando el cliente elige una sugerencia

    function esMichoacan(texto) {
        const n = normalizar(texto);
        const segmentos = n.split(',').map(s => s.trim()).filter(Boolean);
        while (segmentos.length && segmentos[segmentos.length - 1] === 'mexico') segmentos.pop();

        // Si termina en otro estado o país (ej. "..., Oaxaca"), no se atiende
        if (segmentos.slice(-2).some(s => FUERA_DE_ZONA.includes(s))) return false;

        if (/(^|[^a-z0-9])(michoacan|mich)($|[^a-z0-9])/.test(n)) return true;
        return MUNICIPIOS_NORM.some(m =>
            new RegExp('(^|[^a-z0-9])' + escaparRegex(m) + '($|[^a-z0-9])').test(n));
    }

    // ---------- Validadores: devuelven '' si es válido, o el mensaje de error ----------
    function validarNombre() {
        const v = campos.nombre.value.trim().replace(/\s+/g, ' ');
        if (!v) return 'Escribe tu nombre completo.';
        if (v.length < 3) return 'El nombre es demasiado corto.';
        if (!/^[\p{L}][\p{L}\s.'-]*$/u.test(v)) return 'El nombre solo puede llevar letras y espacios.';
        if ((v.match(/\p{L}/gu) || []).length < 3) return 'Escribe tu nombre completo.';
        return '';
    }

    function limpiarTelefono(valor) {
        let t = valor.replace(/[\s().-]/g, '');
        if (t.startsWith('+52')) t = t.slice(3);
        else if (t.startsWith('52') && t.length === 12) t = t.slice(2);
        return t;
    }

    function validarTelefono() {
        const v = campos.telefono.value.trim();
        if (!v) return 'Escribe tu teléfono o WhatsApp.';
        const t = limpiarTelefono(v);
        if (!/^\d{10}$/.test(t) || /^(\d)\1{9}$/.test(t)) {
            return 'Escribe un teléfono válido de 10 dígitos (ej. 4433514415).';
        }
        return '';
    }

    function validarEmail() {
        const v = campos.email.value.trim();
        if (!v) return ''; // Es opcional
        if (v.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
            return 'Escribe un correo válido (ej. nombre@correo.com) o déjalo vacío.';
        }
        return '';
    }

    function validarFecha() {
        const v = campos.fecha.value;
        const { hoy, max } = fechasLimite();
        if (!v) {
            if (campos.fecha.validity.badInput) {
                return 'La fecha no es válida. Elige una fecha del calendario.';
            }
            return 'Elige la fecha de tu evento.';
        }
        if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) {
            return 'La fecha no es válida. Elige una fecha del calendario.';
        }
        if (v < hoy) {
            return `Esa fecha ya pasó. Hoy es ${fechaLegible(hoy)}; elige una fecha a partir de hoy.`;
        }
        if (v > max) {
            return `Por ahora solo agendamos eventos dentro de las próximas 2 semanas (hasta el ${fechaLegible(max)}). Elige una fecha dentro de ese rango.`;
        }
        return '';
    }

    function validarLugar() {
        const v = campos.lugar.value.trim();
        if (!v) return 'Escribe el nombre del lugar o la dirección del evento.';
        if (v.length < 5) return 'Escribe un poco más: nombre del lugar y ciudad, o la dirección completa.';
        if (v.length > 150) return 'La ubicación es demasiado larga (máximo 150 caracteres).';
        if (seleccion && normalizar(seleccion.texto) === normalizar(v)) return '';
        if (!esMichoacan(v)) {
            return 'Indica el municipio de Michoacán donde será el evento (ej. "Salón Jardín, Morelia"). Solo atendemos eventos en Michoacán de Ocampo.';
        }
        return '';
    }

    function validarMensaje() {
        const v = campos.mensaje.value.trim();
        if (!v) return 'Cuéntanos los detalles de tu evento (meseros, loza, mobiliario, invitados...).';
        if (v.length < 10) return 'Agrega un poco más de detalle (mínimo 10 caracteres).';
        if (v.length > 500) return 'Los detalles son demasiado largos (máximo 500 caracteres).';
        return '';
    }

    const validadores = {
        nombre: validarNombre,
        telefono: validarTelefono,
        email: validarEmail,
        fecha: validarFecha,
        lugar: validarLugar,
        mensaje: validarMensaje
    };

    // ---------- Mostrar / quitar errores ----------
    function mostrarError(clave, mensaje) {
        const campo = campos[clave];
        const caja = document.getElementById('err-' + clave);
        if (mensaje) {
            campo.setAttribute('aria-invalid', 'true');
            if (caja) {
                caja.textContent = mensaje;
                caja.classList.add('show');
            }
        } else {
            campo.removeAttribute('aria-invalid');
            if (caja) {
                caja.textContent = '';
                caja.classList.remove('show');
            }
        }
        return mensaje;
    }

    function validarCampo(clave) {
        return mostrarError(clave, validadores[clave]());
    }

    // Validar al salir del campo y corregir en vivo cuando ya hay error
    Object.keys(campos).forEach(clave => {
        const campo = campos[clave];
        campo.addEventListener('blur', () => {
            if (campo.value.trim() !== '' || campo.hasAttribute('aria-invalid')) validarCampo(clave);
        });
        const reValidar = () => {
            if (campo.hasAttribute('aria-invalid')) validarCampo(clave);
        };
        campo.addEventListener('input', reValidar);
        campo.addEventListener('change', reValidar);
    });

    // ---------- Sugerencias de ubicación (solo Michoacán) ----------
    const lista = document.getElementById('lugar-sugerencias');
    let sugerencias = [];
    let activa = -1;
    let temporizador = null;
    let controlador = null;
    let consulta = 0;

    function cerrarLista() {
        if (!lista) return;
        lista.hidden = true;
        lista.innerHTML = '';
        sugerencias = [];
        activa = -1;
        campos.lugar.setAttribute('aria-expanded', 'false');
        campos.lugar.removeAttribute('aria-activedescendant');
    }

    function unicos(partes) {
        const vistos = new Set();
        return partes.filter(p => {
            const k = normalizar(p);
            if (!p || vistos.has(k)) return false;
            vistos.add(k);
            return true;
        });
    }

    // --- Proveedor 1: Google Places (si hay clave) ---
    let promesaGoogle = null;
    let tokenSesion = null;

    function cargarGoogle() {
        if (!GOOGLE_MAPS_API_KEY) return Promise.resolve(null);
        if (!promesaGoogle) {
            promesaGoogle = new Promise((resolve) => {
                const s = document.createElement('script');
                s.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY) +
                        '&v=weekly&loading=async&language=es&region=MX';
                s.async = true;
                s.onload = async () => {
                    try {
                        const lib = await google.maps.importLibrary('places');
                        resolve(lib);
                    } catch (e) { resolve(null); }
                };
                s.onerror = () => resolve(null);
                document.head.appendChild(s);
            });
        }
        return promesaGoogle;
    }

    async function buscarGoogle(texto, lib) {
        if (!tokenSesion) tokenSesion = new lib.AutocompleteSessionToken();
        const { suggestions } = await lib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: texto,
            language: 'es',
            region: 'mx',
            includedRegionCodes: ['mx'],
            locationRestriction: BBOX,
            sessionToken: tokenSesion
        });
        return suggestions
            .map(s => s.placePrediction)
            .filter(Boolean)
            .map(p => ({
                principal: p.mainText ? p.mainText.text : p.text.text,
                secundario: p.secondaryText ? p.secondaryText.text : '',
                texto: p.text.text,
                placeId: p.placeId
            }))
            .filter(s => /(^|[^a-z])mich/.test(normalizar(s.texto)));
    }

    // --- Proveedor 2: Photon / OpenStreetMap (gratis, sin clave) ---
    function convertirPhoton(feature) {
        const p = feature.properties || {};
        const coords = feature.geometry && feature.geometry.coordinates;
        if (!coords || p.countrycode !== 'MX' || !normalizar(p.state).includes('michoac')) return null;

        const calle = [p.street, p.housenumber].filter(Boolean).join(' ');
        const principal = p.name || calle;
        if (!principal) return null;

        const ciudad = p.city || p.locality || p.county || '';
        const secundarias = unicos([
            p.name ? calle : '',
            p.district,
            ciudad,
            p.county !== ciudad ? p.county : ''
        ]).filter(t => normalizar(t) !== normalizar(principal));

        return {
            principal,
            secundario: unicos([...secundarias, 'Michoacán']).join(', '),
            texto: unicos([principal, ...secundarias, 'Michoacán']).join(', '),
            lat: coords[1],
            lon: coords[0]
        };
    }

    async function consultarPhoton(q, senal) {
        const bbox = `${BBOX.west},${BBOX.south},${BBOX.east},${BBOX.north}`;
        const url = 'https://photon.komoot.io/api/?limit=10&bbox=' + bbox + '&q=' + encodeURIComponent(q);
        const respuesta = await fetch(url, { signal: senal });
        if (!respuesta.ok) throw new Error('HTTP ' + respuesta.status);
        const datos = await respuesta.json();
        return (datos.features || []).map(convertirPhoton).filter(Boolean);
    }

    async function buscarPhoton(texto, senal) {
        let resultados = await consultarPhoton(texto, senal);
        // Si no hay nada, reintentamos sin números (ej. "La Zeta Morelia 96.3" -> "La Zeta Morelia")
        if (!resultados.length && /\d/.test(texto)) {
            const sinNumeros = texto.split(/\s+/).filter(w => !/\d/.test(w)).join(' ').trim();
            if (sinNumeros.length >= 3 && sinNumeros !== texto) {
                resultados = await consultarPhoton(sinNumeros, senal);
            }
        }
        return resultados;
    }

    function dibujarLista(items, mensajeVacio) {
        lista.innerHTML = '';
        if (!items.length) {
            if (!mensajeVacio) { cerrarLista(); return; }
            const info = document.createElement('li');
            info.className = 'sug-info';
            info.textContent = mensajeVacio;
            lista.appendChild(info);
        }
        items.forEach((s, i) => {
            const li = document.createElement('li');
            li.id = 'sug-' + i;
            li.setAttribute('role', 'option');
            li.innerHTML = '<span class="sug-main"></span><span class="sug-sub"></span>';
            li.querySelector('.sug-main').textContent = s.principal;
            li.querySelector('.sug-sub').textContent = s.secundario;
            li.addEventListener('mousedown', (e) => {
                e.preventDefault(); // evita que el campo pierda el foco
                elegir(i);
            });
            lista.appendChild(li);
        });
        lista.hidden = false;
        campos.lugar.setAttribute('aria-expanded', 'true');
    }

    function marcarActiva(nueva) {
        const opciones = lista.querySelectorAll('[role="option"]');
        if (!opciones.length) return;
        activa = (nueva + opciones.length) % opciones.length;
        opciones.forEach((o, i) => o.setAttribute('aria-selected', String(i === activa)));
        campos.lugar.setAttribute('aria-activedescendant', 'sug-' + activa);
        opciones[activa].scrollIntoView({ block: 'nearest' });
    }

    function elegir(i) {
        const s = sugerencias[i];
        if (!s) return;
        campos.lugar.value = s.texto;
        seleccion = { texto: s.texto, placeId: s.placeId, lat: s.lat, lon: s.lon };
        tokenSesion = null; // nueva sesión de búsqueda para Google
        cerrarLista();
        mostrarError('lugar', '');
    }

    async function buscarSugerencias(texto) {
        const numero = ++consulta;
        if (controlador) controlador.abort();
        controlador = new AbortController();

        try {
            const lib = await cargarGoogle();
            const resultados = lib
                ? await buscarGoogle(texto, lib)
                : await buscarPhoton(texto, controlador.signal);
            if (numero !== consulta) return;

            sugerencias = resultados.filter((s, i, arr) =>
                arr.findIndex(o => normalizar(o.texto) === normalizar(s.texto)) === i).slice(0, 5);
            activa = -1;
            dibujarLista(sugerencias, sugerencias.length
                ? ''
                : 'No encontramos ese lugar en el mapa. Escribe el nombre y la ciudad (ej. "La Zeta, Morelia") y se enviará tal cual.');
        } catch (error) {
            if (error.name === 'AbortError') return;
            cerrarLista(); // Si falla el servicio, el cliente puede escribir la dirección a mano
        }
    }

    if (lista) {
        campos.lugar.addEventListener('input', () => {
            // Si cambia el texto después de elegir una sugerencia, ya no es esa ubicación exacta
            if (seleccion && campos.lugar.value.trim() !== seleccion.texto) seleccion = null;
            clearTimeout(temporizador);
            const texto = campos.lugar.value.trim();
            if (texto.length < 3) {
                if (controlador) controlador.abort();
                cerrarLista();
                return;
            }
            temporizador = setTimeout(() => buscarSugerencias(texto), 350);
        });

        campos.lugar.addEventListener('keydown', (e) => {
            if (lista.hidden) return;
            if (e.key === 'ArrowDown') { e.preventDefault(); marcarActiva(activa + 1); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); marcarActiva(activa - 1); }
            else if (e.key === 'Enter' && activa >= 0) { e.preventDefault(); elegir(activa); }
            else if (e.key === 'Escape') { cerrarLista(); }
        });

        campos.lugar.addEventListener('blur', () => setTimeout(cerrarLista, 150));
    }

    function enlaceMapa(lugar) {
        const base = 'https://www.google.com/maps/search/?api=1&query=';
        if (seleccion && seleccion.placeId) {
            return base + encodeURIComponent(seleccion.texto) + '&query_place_id=' + encodeURIComponent(seleccion.placeId);
        }
        if (seleccion && seleccion.lat !== undefined) {
            return base + encodeURIComponent(`${seleccion.lat},${seleccion.lon}`);
        }
        const yaDiceMich = /michoac|(^|[^a-z])mich($|[^a-z])/.test(normalizar(lugar));
        return base + encodeURIComponent(yaDiceMich ? lugar : `${lugar}, Michoacán, México`);
    }

    // ---------- Envío ----------
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        actualizarLimites();
        cerrarLista();
        if (estado) {
            estado.textContent = '';
            estado.classList.remove('show');
        }

        let primerInvalido = null;
        Object.keys(campos).forEach(clave => {
            if (validarCampo(clave) && !primerInvalido) primerInvalido = campos[clave];
        });

        if (primerInvalido) {
            primerInvalido.focus();
            return;
        }

        const nombre = campos.nombre.value.trim().replace(/\s+/g, ' ');
        const telefono = campos.telefono.value.trim();
        const email = campos.email.value.trim();
        const fecha = fechaLegible(campos.fecha.value);
        const lugar = campos.lugar.value.trim();
        const mensaje = campos.mensaje.value.trim();

        const textoMensaje =
            `Hola, quiero contratar su servicio.\n\n` +
            `*Nombre:* ${nombre}\n` +
            `*Teléfono:* ${telefono}\n` +
            (email ? `*Correo:* ${email}\n` : '') +
            `*Fecha del evento:* ${fecha}\n` +
            `*Ubicación:* ${lugar}\n` +
            `*Mapa:* ${enlaceMapa(lugar)}\n` +
            `*Detalles:* ${mensaje}`;

        const url = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(textoMensaje)}`;
        window.open(url, '_blank', 'noopener');

        if (estado) {
            estado.textContent = 'Abriendo WhatsApp con tu solicitud...';
            estado.classList.add('show');
        }
    });
});