// js/cotizador.js

document.addEventListener('DOMContentLoaded', () => {
    const btnCalcular = document.getElementById('btn-calcular');
    const inputInvitados = document.getElementById('invitados');
    const inputHoras = document.getElementById('horas');
    const selectTipo = document.getElementById('tipo-servicio');
    const inputMeseros = document.getElementById('meseros-solicitados');
    const chkLoza = document.getElementById('req-loza');
    const chkMobiliario = document.getElementById('req-mobiliario');
    
    const resultadoBox = document.getElementById('resultado-cotizacion');
    const textoRecomendacion = document.getElementById('recomendacion-texto');
    const btnWhatsapp = document.getElementById('btn-cotizar-whatsapp');

    const NUMERO_WHATSAPP = "524433514415"; 

    if (btnCalcular) {
        btnCalcular.addEventListener('click', () => {
            const invitados = parseInt(inputInvitados.value);
            const horas = parseInt(inputHoras.value);
            const tipo = selectTipo.value;
            const meserosPersonalizados = parseInt(inputMeseros.value);
            const requiereLoza = chkLoza ? chkLoza.checked : false;
            const requiereMobiliario = chkMobiliario ? chkMobiliario.checked : false;

            if (!invitados || invitados <= 0 || !horas || horas <= 0) {
                alert('Por favor, ingresa un número válido de invitados y horas.');
                return;
            }

            let meseros = 0;
            let capitanes = 0;

            if (meserosPersonalizados && meserosPersonalizados > 0) {
                meseros = meserosPersonalizados;
            } else {
                meseros = Math.max(1, Math.ceil(invitados / 28));
            }

            if (invitados >= 100 || meseros >= 4) {
                capitanes = 1;
            }

            let resumen = `Para tu evento **${tipo}** con **${invitados} invitados** (${horas} horas de servicio):\n`;
            resumen += `• **${meseros}** Mesero(s) deseado(s)\n`;
            if (capitanes > 0) {
                resumen += `• **${capitanes}** Capitán de meseros (Coordinación)\n`;
            }
            if (requiereLoza) {
                resumen += `• **Incluir cotización de Loza y Cristalería**\n`;
            }
            if (requiereMobiliario) {
                resumen += `• **Incluir cotización de Mobiliario (Mesas/Sillas/Mantelería)**\n`;
            }

            textoRecomendacion.innerHTML = resumen.replace(/\n/g, '<br>');
            resultadoBox.classList.remove('hidden');

            let mensajeWhatsApp = `Hola *Flores. Agencia de Meseros*, me gustaría cotizar para mi evento:\n` +
                `• *Tipo de Evento:* ${tipo}\n` +
                `• *Invitados:* ${invitados}\n` +
                `• *Horas:* ${horas}\n` +
                `• *Meseros:* ${meseros} mesero(s)${capitanes ? ' + 1 capitán' : ''}\n`;

            if (requiereLoza || requiereMobiliario) {
                mensajeWhatsApp += `• *Servicios extra:* `;
                let extras = [];
                if (requiereLoza) extras.push("Renta de Loza/Cristalería");
                if (requiereMobiliario) extras.push("Renta de Mobiliario");
                mensajeWhatsApp += extras.join(" y ");
            }

            const urlWS = `https://wa.me/${NUMERO_WHATSAPP}?text=${encodeURIComponent(mensajeWhatsApp)}`;
            btnWhatsapp.setAttribute('href', urlWS);
        });
    }
});