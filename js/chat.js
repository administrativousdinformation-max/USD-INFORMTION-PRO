//  CONFIGURACIÓN SUPERVISOR — Modos de chat y colores tarjetas
// ══════════════════════════════════════════════════════════════════

function renderSupChatModos() {
    const cont = document.getElementById('supChatModoLista');
    if (!cont) return;
    const asesores = usuarios.filter(u => u.rol === 'asesor');
    if (asesores.length === 0) {
        cont.innerHTML = '<p style="color:var(--textMuted);font-size:13px;">No hay asesores registrados.</p>';
        return;
    }
    cont.innerHTML = asesores.map(u => {
        const foto = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        return `<div style="display:flex;align-items:center;gap:12px;padding:10px 0;border-bottom:1px solid rgba(255,255,255,0.05);">
            <img src="${foto}" style="width:34px;height:34px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
            <div style="flex:1;min-width:0;">
                <div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(u.nombre)}</div>
                <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;">${u.plataforma || '—'}</div>
            </div>
        </div>`;
    }).join('');
}

function supSetModo(uid, modo, btnClickado) {
    // Guard: si ya está en ese modo no hacer nada
    if (getChatModoAsesor(uid) === modo) return;
    setChatModoAsesor(uid, modo);
    // Actualizar botones del panel config-sup en el DOM sin re-renderizar
    const lista = document.getElementById('supChatModoLista');
    if (lista) {
        lista.querySelectorAll(`[data-uid="${uid}"]`).forEach(btn => {
            const esteM = btn.getAttribute('data-modo');
            if (esteM === 'abierto') {
                btn.style.background = modo === 'abierto' ? '#27ae60' : 'transparent';
                btn.style.color = modo === 'abierto' ? '#fff' : '#27ae60';
            } else {
                btn.style.background = modo === 'cerrado' ? '#e74c3c' : 'transparent';
                btn.style.color = modo === 'cerrado' ? '#fff' : '#e74c3c';
            }
        });
    }
    // Actualizar botones en ventana messenger si está abierta
    const btnAb = document.getElementById(`btnModoAb_${uid}`);
    const btnCe = document.getElementById(`btnModoCe_${uid}`);
    if (btnAb) { btnAb.style.background = modo === 'abierto' ? '#27ae60' : 'transparent'; btnAb.style.color = modo === 'abierto' ? '#fff' : '#27ae60'; btnAb.style.border = modo === 'abierto' ? '1px solid #27ae60' : '1px solid rgba(39,174,96,0.5)'; }
    if (btnCe) { btnCe.style.background = modo === 'cerrado' ? '#e74c3c' : 'transparent'; btnCe.style.color = modo === 'cerrado' ? '#fff' : '#e74c3c'; btnCe.style.border = modo === 'cerrado' ? '1px solid #e74c3c' : '1px solid rgba(231,76,60,0.5)'; }
    // Notificar al asesor via BroadcastChannel
    usdBroadcast('chatModos', { usuarioId: uid, nuevoModo: modo });
    // Actualizar listas de contactos
    renderListaContactos && renderListaContactos();
    renderListaContactosAsesor && renderListaContactosAsesor();
}

// ── Colores de tarjetas Por Asesor ────────────────────────────────
const TARJETA_CONFIG_KEY = 'usd_tarjeta_cfg';

function getConfigTarjeta() {
    return JSON.parse(localStorage.getItem(TARJETA_CONFIG_KEY)) || {};
}
function saveConfigTarjeta(cfg) {
    localStorage.setItem(TARJETA_CONFIG_KEY, JSON.stringify(cfg));
}

function cambiarConfigTarjeta(tipo, valor) {
    const cfg = getConfigTarjeta();
    cfg[tipo] = valor;
    saveConfigTarjeta(cfg);
    // Re-renderizar si la vista está activa
    const cont = document.getElementById('graficasPorAsesor');
    if (cont && cont.children.length > 0) renderPorAsesor();
}

function cargarValoresConfigTarjeta() {
    const cfg = getConfigTarjeta();
    const mapa = {
        cardBg:     ['colorCardBg','supCardBg','#1e1e1e'],
        cardTitulo: ['colorCardTitulo','supCardTitulo','#ffffff'],
        cardTexto:  ['colorCardTexto','supCardTexto','#a0a0a0'],
        cardValor:  ['colorCardValor','supCardValor','#ff2d55'],
        cardEmoji:  ['colorCardEmoji','supCardEmoji','#ff2d55'],
        cardBorde:  ['colorCardBorde','supCardBorde','#ff2d55'],
    };
    Object.entries(mapa).forEach(([key, [id1, id2, def]]) => {
        const val = cfg[key] || def;
        const el1 = document.getElementById(id1);
        const el2 = document.getElementById(id2);
        if (el1) el1.value = val;
        if (el2) el2.value = val;
    });
}

// ══════════════════════════════════════════════════════════════════
//  SISTEMA DE CHAT — Multi-ventana (Admin/Super) + Asesor simple
// ══════════════════════════════════════════════════════════════════

const CHAT_KEY = 'usd_chat_mensajes';
// Guarda el modo de chat por asesor: { usuarioId: 'abierto'|'cerrado' }
const CHAT_MODO_KEY = 'usd_chat_modos';
// Clave para mensajes del grupo USD
const CHAT_GRUPO_KEY = 'usd_chat_grupo_mensajes';
// Clave para estado habilitado del grupo
const CHAT_GRUPO_HABILITADO_KEY = 'usd_chat_grupo_habilitado';
// Clave para asesores bloqueados individualmente del grupo
const CHAT_GRUPO_BLOQUEADOS_KEY = 'usd_chat_grupo_bloqueados';


// ── SISTEMA DE PRESENCIA (En línea / Fuera de línea) ─────────────────────────
const PRESENCIA_KEY = 'usd_presencia';
const PRESENCIA_TIMEOUT = 35000; // 35 segundos sin heartbeat = fuera de línea

// Firebase prohíbe . # $ / [ ] en claves → sanitizar antes de guardar
function _fbSanitizarClave(k) {
    return (k || '').replace(/[.#$\/\[\]]/g, '_');
}

function registrarPresencia() {
    if (!userLogueado) return;
    try {
        const data = JSON.parse(localStorage.getItem(PRESENCIA_KEY) || '{}');
        data[userLogueado.usuario] = Date.now();
        // Usar Storage.prototype para evitar que el hook dispare _fbGuardar dos veces
        Storage.prototype.setItem.call(localStorage, PRESENCIA_KEY, JSON.stringify(data));
        // Enviar a Firebase con claves sanitizadas (sin . # $ / [ ])
        if (window._fbGuardar) {
            const dataFb = {};
            Object.keys(data).forEach(k => { dataFb[_fbSanitizarClave(k)] = data[k]; });
            window._fbGuardar(PRESENCIA_KEY, dataFb);
        }
    } catch(e) {}
}

function isUsuarioEnLinea(usuarioId) {
    try {
        const data = JSON.parse(localStorage.getItem(PRESENCIA_KEY) || '{}');
        // Buscar por clave original y también sanitizada (por si vino de Firebase)
        const ts = data[usuarioId] || data[_fbSanitizarClave(usuarioId)];
        if (!ts) return false;
        return (Date.now() - ts) < PRESENCIA_TIMEOUT;
    } catch(e) { return false; }
}
// ── FIN SISTEMA DE PRESENCIA ──────────────────────────────────────────────────

function getGrupoBloqueados() {
    try {
        const raw = JSON.parse(localStorage.getItem(CHAT_GRUPO_BLOQUEADOS_KEY));
        if (!raw) return [];
        // Firebase Realtime DB convierte arrays en objetos {0:'x', 1:'y'} — normalizamos
        if (Array.isArray(raw)) return raw;
        return Object.values(raw);
    } catch(e) { return []; }
}
function saveGrupoBloqueados(lista) {
    // Garantizar que siempre sea array limpio antes de guardar
    const listaLimpia = Array.isArray(lista) ? lista : Object.values(lista || {});
    localStorage.setItem(CHAT_GRUPO_BLOQUEADOS_KEY, JSON.stringify(listaLimpia));
    // Forzar sincronía con Firebase
    if (window._fbGuardar) window._fbGuardar(CHAT_GRUPO_BLOQUEADOS_KEY, listaLimpia);
    // Re-render local inmediato
    renderBtnPermisosGrupo();
    // Si el dropdown de permisos está abierto, regenerarlo para reflejar el nuevo estado
    const dropExistente = document.getElementById('dropdownPermisosGrupo');
    if (dropExistente) {
        dropExistente.remove();
        const btnRef = document.getElementById('btnPermisosGrupo');
        if (btnRef) {
            const fakeEvt = { stopPropagation: () => {} };
            abrirDropdownPermisosGrupo(fakeEvt);
        }
    }
    renderListaContactos();
    renderListaContactosAsesor();
    actualizarInputGrupoAsesor();
    usdBroadcast('grupoBloqueados', listaLimpia);
}

// ══ SINCRONIZACIÓN MULTI-PESTAÑA ══════════════════════════════════════════════
// Usa BroadcastChannel para notificar a otras pestañas del mismo origen
// y el evento 'storage' como fallback para Safari / browsers sin BroadcastChannel.
const _usdChannel = (typeof BroadcastChannel !== 'undefined') ? new BroadcastChannel('usd_chat_sync') : null;

function usdBroadcast(tipo, payload) {
    const msg = { tipo, payload, ts: Date.now() };
    if (_usdChannel) _usdChannel.postMessage(msg);
    // storage event fallback: escribir y leer de inmediato para triggear
    try {
        localStorage.setItem('_usd_bc_', JSON.stringify(msg));
        localStorage.removeItem('_usd_bc_');
    } catch(e) {}
}

window.usdBroadcast = usdBroadcast;
function _usdHandleSync(tipo, payload) {
    switch(tipo) {
        case 'chatMensajes':
            // Refresca vista si el panel está abierto
            if (userLogueado) {
                const _usaMessenger = ['admin','coordinador'].includes(userLogueado.rol);
                if (_usaMessenger) {
                    actualizarBadgesVentanas();
                    actualizarBadgeTotal();
                    renderListaContactos();
                } else {
                    // Roles con panel asesor: asesor, supervisor1/2, capacitador, calidad
                    actualizarBadgeRobot();
                    renderListaContactosAsesor();
                    const panel = document.getElementById('chatPanel');
                    if (panel && panel.style.display !== 'none') {
                        const dest = document.getElementById('chatDestinatarioActivo').value;
                        if (dest && dest !== '__grupo_usd__') renderChatMensajesAsesor(dest);
                    }
                }
            }
            break;
        case 'grupoMensajes':
            if (userLogueado) {
                renderListaContactos && renderListaContactos();
                renderListaContactosAsesor && renderListaContactosAsesor();
                // Refrescar ventana grupo admin/super si está abierta
                const wg = document.getElementById('ventana_grupo_usd');
                if (wg && wg.style.display !== 'none') renderMensajesGrupo && renderMensajesGrupo();
                // Refrescar panel asesor si está en el grupo
                const panel = document.getElementById('chatPanel');
                if (panel && panel.style.display !== 'none') {
                    const dest = document.getElementById('chatDestinatarioActivo') && document.getElementById('chatDestinatarioActivo').value;
                    if (dest === '__grupo_usd__') renderMensajesGrupoAsesor && renderMensajesGrupoAsesor();
                }
                actualizarBadgeTotal && actualizarBadgeTotal();
                actualizarBadgeRobot && actualizarBadgeRobot();
            }
            break;
        case 'grupoHabilitado':
            if (userLogueado) {
                // Actualizar botón toggle en ventana grupo si está abierta
                const btnToggle = document.getElementById('btnToggleGrupo');
                if (btnToggle) btnToggle.textContent = payload ? '🔓 Abierto' : '🔒 Cerrado';
                renderListaContactos && renderListaContactos();
                renderListaContactosAsesor && renderListaContactosAsesor();
                // Si el asesor tiene el grupo activo, actualizar su input
                const destActivo = document.getElementById('chatDestinatarioActivo');
                if (destActivo && destActivo.value === '__grupo_usd__') {
                    actualizarInputGrupoAsesor && actualizarInputGrupoAsesor();
                    actualizarAreaRespuestaAsesor && actualizarAreaRespuestaAsesor('__grupo_usd__');
                }
            }
            break;
        case 'grupoBloqueados':
            if (userLogueado) {
                renderBtnPermisosGrupo && renderBtnPermisosGrupo();
                renderListaContactos && renderListaContactos();
                renderListaContactosAsesor && renderListaContactosAsesor();
                // Si el asesor tiene el grupo activo, actualizar su área de respuesta
                const destActivo2 = document.getElementById('chatDestinatarioActivo');
                if (destActivo2 && destActivo2.value === '__grupo_usd__') {
                    actualizarAreaRespuestaAsesor && actualizarAreaRespuestaAsesor('__grupo_usd__');
                } else {
                    actualizarInputGrupoAsesor && actualizarInputGrupoAsesor();
                }
            }
            break;

        case 'chatModos':
            if (userLogueado) {
                const _usaPanelAsesorBc = ['asesor','supervisor1','supervisor2','capacitador','calidad'].includes(userLogueado.rol);
                if (_usaPanelAsesorBc) {
                    renderListaContactosAsesor && renderListaContactosAsesor();
                    actualizarVisibilidadBotAsesor && actualizarVisibilidadBotAsesor();
                    actualizarBadgeRobot && actualizarBadgeRobot();
                    const panel = document.getElementById('chatPanel');
                    // Actualizar área de respuesta siempre (panel abierto o no) para que
                    // las 4 respuestas rápidas aparezcan en cuanto el asesor abra el chat
                    const dest = document.getElementById('chatDestinatarioActivo');
                    const destVal = dest ? dest.value : '';
                    if (destVal && destVal !== '__grupo_usd__') {
                        actualizarAreaRespuestaAsesor && actualizarAreaRespuestaAsesor(destVal);
                    }
                }
            }
            break;
    }
}

if (_usdChannel) {
    _usdChannel.onmessage = (e) => _usdHandleSync(e.data.tipo, e.data.payload);
}
// Fallback storage event (Safari y misma pestaña no recibe storage event, ok)
window.addEventListener('storage', (e) => {
    if (e.key === '_usd_bc_' && e.newValue) {
        try { const d = JSON.parse(e.newValue); _usdHandleSync(d.tipo, d.payload); } catch(ex) {}
    }
});

// Polling unificado: sincroniza estado del chat privado y del grupo para el asesor
// Necesario cuando admin y asesor usan el mismo navegador/pestaña (BroadcastChannel no alcanza)
setInterval(async () => {
    if (!userLogueado || !window._fbCargar) return;

    // — Polling para roles que usan el panel de chat asesor (botón robot) —
    const _usaPanelAsesor = ['asesor','supervisor1','supervisor2','capacitador','calidad'].includes(userLogueado.rol);
    if (_usaPanelAsesor) {
        try {
            // Sincronizar modos de chat privado
            const modos = await window._fbCargar('usd_chat_modos');
            if (modos !== null) {
                const modosLocal = localStorage.getItem('usd_chat_modos');
                if (JSON.stringify(modos) !== modosLocal) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_modos', JSON.stringify(modos));
                    renderListaContactosAsesor && renderListaContactosAsesor();
                    actualizarVisibilidadBotAsesor && actualizarVisibilidadBotAsesor();
                    // Actualizar área de respuesta SIEMPRE (panel abierto o no) para bloqueo inmediato
                    const dest = document.getElementById('chatDestinatarioActivo');
                    if (dest && dest.value && dest.value !== '__grupo_usd__') {
                        actualizarAreaRespuestaAsesor(dest.value);
                        // Limpiar input si el chat fue cerrado
                        const _inp = document.getElementById('chatInput');
                        if (_inp) _inp.value = '';
                    }
                }
            }
        } catch(e) {}

        try {
            // Sincronizar estado abierto/cerrado del grupo
            const habilitado = await window._fbCargar('usd_chat_grupo_habilitado');
            if (habilitado !== null) {
                const habilitadoVal = habilitado === true || habilitado === 'true';
                const localVal = localStorage.getItem('usd_chat_grupo_habilitado') === 'true';
                if (habilitadoVal !== localVal) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_grupo_habilitado', habilitadoVal ? 'true' : 'false');
                    renderListaContactosAsesor && renderListaContactosAsesor();
                    const dest = document.getElementById('chatDestinatarioActivo');
                    if (dest && dest.value === '__grupo_usd__') {
                        actualizarInputGrupoAsesor && actualizarInputGrupoAsesor();
                        actualizarAreaRespuestaAsesor && actualizarAreaRespuestaAsesor('__grupo_usd__');
                    }
                }
            }
        } catch(e) {}

        try {
            // Sincronizar mensajes del grupo para el asesor (para ver fotos enviadas por admin/super)
            const grupoMsgs = await window._fbCargar('usd_chat_grupo_mensajes');
            if (grupoMsgs !== null) {
                const localStr = localStorage.getItem('usd_chat_grupo_mensajes');
                if (JSON.stringify(grupoMsgs) !== localStr) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_grupo_mensajes', JSON.stringify(grupoMsgs));
                    renderListaContactosAsesor && renderListaContactosAsesor();
                    actualizarBadgeRobot && actualizarBadgeRobot();
                    const panel = document.getElementById('chatPanel');
                    const dest = document.getElementById('chatDestinatarioActivo');
                    if (panel && panel.style.display !== 'none' && dest && dest.value === '__grupo_usd__') {
                        renderMensajesGrupoAsesor && renderMensajesGrupoAsesor();
                    }
                }
            }
        } catch(e) {}

        try {
            // Sincronizar mensajes privados para el asesor y roles con panel asesor
            const chatMsgs = await window._fbCargar('usd_chat_mensajes');
            if (chatMsgs !== null) {
                const localStr = localStorage.getItem('usd_chat_mensajes');
                if (JSON.stringify(chatMsgs) !== localStr) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_mensajes', JSON.stringify(chatMsgs));
                    actualizarBadgeRobot && actualizarBadgeRobot();
                    renderListaContactosAsesor && renderListaContactosAsesor();
                    const panel = document.getElementById('chatPanel');
                    const dest = document.getElementById('chatDestinatarioActivo');
                    if (panel && panel.style.display !== 'none' && dest && dest.value && dest.value !== '__grupo_usd__') {
                        renderChatMensajesAsesor && renderChatMensajesAsesor(dest.value);
                    }
                }
            }
        } catch(e) {}

        // Sincronizar bloqueados del grupo para que supervisores/formación/calidad vean estado correcto
        try {
            const bloqueados = await window._fbCargar('usd_chat_grupo_bloqueados');
            if (bloqueados !== null) {
                const localStr = localStorage.getItem('usd_chat_grupo_bloqueados');
                if (JSON.stringify(bloqueados) !== localStr) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_grupo_bloqueados', JSON.stringify(bloqueados));
                    actualizarInputGrupoAsesor && actualizarInputGrupoAsesor();
                }
            }
        } catch(e) {}
    }

    // — Polling para ADMIN/COORDINADOR (messenger) —
    const _esAdminMessenger = ['admin','coordinador'].includes(userLogueado.rol);
    if (_esAdminMessenger) {
        try {
            // Sincronizar mensajes del grupo para admin/coordinador
            const grupoMsgs = await window._fbCargar('usd_chat_grupo_mensajes');
            if (grupoMsgs !== null) {
                const localStr = localStorage.getItem('usd_chat_grupo_mensajes');
                if (JSON.stringify(grupoMsgs) !== localStr) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_grupo_mensajes', JSON.stringify(grupoMsgs));
                    renderListaContactos && renderListaContactos();
                    actualizarBadgeTotal && actualizarBadgeTotal();
                    const wg = document.getElementById('ventana_grupo_usd');
                    if (wg && wg.style.display !== 'none') renderMensajesGrupo && renderMensajesGrupo();
                }
            }
        } catch(e) {}

        try {
            // Sincronizar mensajes PRIVADOS para admin/coordinador (ver mensajes de asesores)
            const chatMsgs = await window._fbCargar('usd_chat_mensajes');
            if (chatMsgs !== null) {
                const localStr = localStorage.getItem('usd_chat_mensajes');
                if (JSON.stringify(chatMsgs) !== localStr) {
                    Storage.prototype.setItem.call(localStorage, 'usd_chat_mensajes', JSON.stringify(chatMsgs));
                    renderListaContactos && renderListaContactos();
                    actualizarBadgeTotal && actualizarBadgeTotal();
                    // Re-renderizar todas las ventanas abiertas
                    if (typeof ventanasAbiertas !== 'undefined') {
                        Object.keys(ventanasAbiertas).forEach(uid => {
                            if (ventanasAbiertas[uid]) renderMensajesVentana && renderMensajesVentana(uid);
                        });
                    }
                }
            }
        } catch(e) {}
    }
}, 2000);
// ══ FIN SINCRONIZACIÓN ════════════════════════════════════════════════════════
function isAsesorBloqueadoEnGrupo(uid) { return getGrupoBloqueados().includes(uid); }
function toggleBloqueadoEnGrupo(uid) {
    // Leer array actual (normalizado contra objetos de Firebase) y hacer toggle INDIVIDUAL
    let lista = getGrupoBloqueados();
    const idx = lista.indexOf(uid);
    if (idx === -1) {
        lista.push(uid);       // bloquear
    } else {
        lista.splice(idx, 1);  // habilitar
    }
    // Usar saveGrupoBloqueados para garantizar normalización, Firebase sync y broadcast correcto
    saveGrupoBloqueados(lista);
}
function actualizarInputGrupoAsesor() {
    // Delegar en actualizarAreaRespuestaAsesor para tener una sola fuente de verdad
    if (userLogueado && typeof actualizarAreaRespuestaAsesor === 'function') {
        actualizarAreaRespuestaAsesor('__grupo_usd__');
    }
}
function renderBtnPermisosGrupo() {
    const btn = document.getElementById('btnPermisosGrupo');
    if (!btn) return;
    const bloqueados = getGrupoBloqueados();
    if (bloqueados.length > 0) {
        btn.style.display = '';
        btn.textContent = '🚫 ' + bloqueados.length;
        btn.title = bloqueados.length + ' asesor(es) bloqueado(s) del grupo';
    } else {
        btn.style.display = 'none';
    }
}
function abrirDropdownPermisosGrupo(e) {
    e.stopPropagation();
    const existente = document.getElementById('dropdownPermisosGrupo');
    if (existente) { existente.remove(); return; }
    const asesores = (typeof usuarios !== 'undefined' ? usuarios : []).filter(u => u.rol === 'asesor');
    if (asesores.length === 0) return;
    const drop = document.createElement('div');
    drop.id = 'dropdownPermisosGrupo';
    drop.style.cssText = 'position:absolute;top:36px;right:0;width:220px;background:#1a1a1a;border:1px solid rgba(255,45,85,0.35);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,0.7);z-index:9999;overflow:hidden;';
    drop.innerHTML = `<div style="padding:7px 12px;font-size:9px;color:rgba(255,255,255,0.3);text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid rgba(255,255,255,0.06);">Control de escritura por asesor</div>` +
        asesores.map((u, i) => {
            const bloqueado = isAsesorBloqueadoEnGrupo(u.usuario);
            const iniciales = (u.nombre || u.usuario).split(' ').slice(0,2).map(p=>p[0]).join('').toUpperCase();
            const borde = i < asesores.length - 1 ? 'border-bottom:1px solid rgba(255,255,255,0.04);' : '';
            const bgFila = bloqueado ? 'background:rgba(255,45,85,0.04);' : '';
            return `<div style="display:flex;align-items:center;gap:8px;padding:8px 12px;${borde}${bgFila}">
                <div style="width:28px;height:28px;border-radius:50%;background:rgba(255,45,85,0.18);color:#ff6b6b;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0;">${iniciales}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:12px;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${(u.nombre||u.usuario).split(' ').slice(0,2).join(' ')}</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.3);">Asesor</div>
                </div>
                <button onclick="toggleBloqueadoEnGrupo('${u.usuario}')" style="font-size:10px;font-weight:700;padding:3px 8px;border-radius:7px;cursor:pointer;border:1px solid;white-space:nowrap;${bloqueado?'background:rgba(255,45,85,0.15);border-color:rgba(255,45,85,0.4);color:#ff6b6b;':'background:rgba(39,174,96,0.12);border-color:rgba(39,174,96,0.4);color:#27ae60;'}">${bloqueado?'🚫 Bloqueado':'✅ Libre'}</button>
            </div>`;
        }).join('');
    const btnRef = document.getElementById('btnPermisosGrupo');
    if (btnRef) { btnRef.parentElement.style.position = 'relative'; btnRef.parentElement.appendChild(drop); }
    const cerrarFuera = (ev) => { if (!drop.contains(ev.target)) { drop.remove(); document.removeEventListener('click', cerrarFuera); } };
    setTimeout(() => document.addEventListener('click', cerrarFuera), 0);
}

function getChatMensajes() { return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; }
function saveChatMensajes(msgs) {
    // Deduplicar por id único antes de guardar para evitar duplicados
    const vistos = new Set();
    const limpios = msgs.filter(m => {
        const key = m.id || (m.de + '|' + m.para + '|' + m.timestamp + '|' + (m.texto||'').substring(0,20));
        if (vistos.has(key)) return false;
        vistos.add(key);
        return true;
    });
    localStorage.setItem(CHAT_KEY, JSON.stringify(limpios));
    if (window._fbGuardar) window._fbGuardar(CHAT_KEY, limpios);
    usdBroadcast('chatMensajes', null);
}
function getChatModos() { return JSON.parse(localStorage.getItem(CHAT_MODO_KEY)) || {}; }
function saveChatModos(m) {
    localStorage.setItem(CHAT_MODO_KEY, JSON.stringify(m));
    // Sincronizar con Firebase
    if (window._fbGuardar) window._fbGuardar(CHAT_MODO_KEY, m);
    // Re-render local inmediato para quien hizo el cambio
    if (typeof actualizarVisibilidadBotAsesor === 'function') actualizarVisibilidadBotAsesor();
    if (typeof renderListaContactos === 'function') renderListaContactos();
    if (typeof renderListaContactosAsesor === 'function') renderListaContactosAsesor();
    // Refrescar área de respuesta del contacto activo inmediatamente
    const _panel = document.getElementById('chatPanel');
    const _dest  = document.getElementById('chatDestinatarioActivo');
    if (_dest && _dest.value && _dest.value !== '__grupo_usd__') {
        if (typeof actualizarAreaRespuestaAsesor === 'function') actualizarAreaRespuestaAsesor(_dest.value);
        // Limpiar input por si el asesor estaba escribiendo
        const _inp = document.getElementById('chatInput');
        if (_inp) _inp.value = '';
    }
    usdBroadcast('chatModos', null);
}

// ── CHAT GRUPO USD ────────────────────────────────────────────────────────────
function getGrupoMensajes() { return JSON.parse(localStorage.getItem(CHAT_GRUPO_KEY)) || []; }
function saveGrupoMensajes(msgs) {
    // Deduplicar por id único
    const vistos = new Set();
    const limpios = msgs.filter(m => {
        const key = m.id || (m.de + '|' + (m.ts||m.timestamp||0) + '|' + (m.texto||'').substring(0,20));
        if (vistos.has(key)) return false;
        vistos.add(key);
        return true;
    });
    localStorage.setItem(CHAT_GRUPO_KEY, JSON.stringify(limpios));
    if (window._fbGuardar) window._fbGuardar(CHAT_GRUPO_KEY, limpios);
    usdBroadcast('grupoMensajes', null);
}
function isGrupoHabilitado() { const v = localStorage.getItem(CHAT_GRUPO_HABILITADO_KEY); return v === null ? true : v === 'true'; } // Abierto por defecto si nunca se ha configurado
function setGrupoHabilitado(val) {
    localStorage.setItem(CHAT_GRUPO_HABILITADO_KEY, val ? 'true' : 'false');
    // Forzar sincronía con Firebase para que bloqueo/desbloqueo sea visible en todos los dispositivos
    if (window._fbGuardar) window._fbGuardar(CHAT_GRUPO_HABILITADO_KEY, val);
    usdBroadcast('grupoHabilitado', val);
}

function toggleGrupoUSD() {
    const actual = isGrupoHabilitado();
    setGrupoHabilitado(!actual);
    // Actualizar label del botón en la ventana del grupo si está abierta
    const btnToggle = document.getElementById('btnToggleGrupo');
    if (btnToggle) btnToggle.textContent = !actual ? '🔓 Abierto' : '🔒 Cerrado';
    // Actualizar también el título del botón para reflejar el nuevo estado
    if (btnToggle) btnToggle.title = !actual ? 'Grupo abierto - clic para cerrar' : 'Grupo cerrado - clic para abrir';
    renderListaContactos();
    renderListaContactosAsesor();
    actualizarBadgeTotal();
    // Si hay un asesor viendo el grupo, actualizar su área de respuesta
    const destActivo = document.getElementById('chatDestinatarioActivo');
    if (destActivo && destActivo.value === '__grupo_usd__') {
        if (!actual) {
            document.getElementById('chatInputArea').style.display = 'flex';
            document.getElementById('chatSoloLectura').style.display = 'none';
        } else {
            document.getElementById('chatInputArea').style.display = 'none';
            document.getElementById('chatSoloLectura').style.display = 'flex';
            const span = document.getElementById('chatSoloLectura').querySelector('span');
            if (span) span.textContent = '🔒 El grupo está cerrado';
        }
    }
}

async function eliminarChatGrupo() {
    const okElimChat = await confirmar({ titulo: '¿Eliminar todos los mensajes?', msg: 'Se borrarán los mensajes del Grupo USD. Esta acción no se puede deshacer.', icono: '🗑️', labelOk: 'Eliminar', colorOk: '#e74c3c' });
    if (!okElimChat) return;
    saveGrupoMensajes([]);
    renderMensajesGrupo();
    renderMensajesGrupoAsesor();
    renderListaContactos();
    renderListaContactosAsesor();
    actualizarBadgeTotal();
    actualizarBadgeRobot();
}

function abrirChatGrupoUSD() {
    // Para admin/super: abrir en ventana messenger
    if (esRolSuperior(userLogueado.rol)) {
        abrirVentanaChatGrupo();
    } else {
        // Para asesores: siempre abrir (si cerrado verán solo lectura)
        abrirConversacionGrupoAsesor();
    }
}

// Estado de minimización del chat grupal
if (!window._grupoMinimizado) window._grupoMinimizado = false;

function abrirVentanaChatGrupo() {
    const winId = 'ventana_grupo_usd';
    let win = document.getElementById(winId);
    // Marcar mensajes del grupo como leídos para este usuario
    const _marcarLeidosGrupo = () => {
        const _gmsgs = getGrupoMensajes();
        let _cambio = false;
        _gmsgs.forEach(m => { if (m.de !== userLogueado.usuario && !m['leido_' + userLogueado.usuario]) { m['leido_' + userLogueado.usuario] = true; _cambio = true; } });
        if (_cambio) { saveGrupoMensajes(_gmsgs); actualizarBadgeTotal(); renderListaContactos(); }
    };
    if (win) {
        // Si está visible y no minimizado: solo renderizar mensajes
        win.style.display = 'flex';
        window._grupoMinimizado = false;
        const body = win.querySelector('.grupoWinBody');
        if (body) body.style.display = 'flex';
        win.style.height = '480px';
        // Actualizar botón candado con estado actual
        const btnToggle = document.getElementById('btnToggleGrupo');
        if (btnToggle) btnToggle.textContent = isGrupoHabilitado() ? '🔓 Abierto' : '🔒 Cerrado';
        renderMensajesGrupo();
        _marcarLeidosGrupo();
        return;
    }
    const container = document.getElementById('messengerWindows');
    const div = document.createElement('div');
    div.id = winId;
    div.style.cssText = 'width:320px;height:480px;background:#0f0f0f;border-radius:14px 14px 0 0;border:1px solid rgba(255,45,85,0.3);box-shadow:0 -4px 24px rgba(0,0,0,0.5);display:flex;flex-direction:column;overflow:hidden;transition:height 0.2s;';
    div.innerHTML = `
        <!-- Header: clic en zona izquierda minimiza, botones a la derecha con stopPropagation -->
        <div style="background:linear-gradient(135deg,#1a0a10,#2a0e1a);padding:10px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(255,45,85,0.25);flex-shrink:0;cursor:pointer;user-select:none;" onclick="toggleMinimizarGrupo()">
            <div style="display:flex;align-items:center;gap:8px;">
                <div style="width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,#ff2d55,#c0153a);display:flex;align-items:center;justify-content:center;font-size:15px;">👥</div>
                <div>
                    <div style="font-weight:800;font-size:13px;color:#fff;">GRUPO USD</div>
                    <div style="font-size:9px;color:rgba(255,45,85,0.8);font-weight:600;text-transform:uppercase;letter-spacing:1px;">Todos los integrantes</div>
                </div>
            </div>
            <div style="display:flex;gap:4px;align-items:center;" onclick="event.stopPropagation()">
                <button onclick="toggleGrupoUSD()" id="btnToggleGrupo" title="Abrir/Cerrar grupo" style="background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);padding:3px 7px;border-radius:7px;cursor:pointer;font-size:9px;font-weight:700;transition:0.2s;" onmouseover="this.style.background='rgba(255,200,0,0.15)';this.style.color='#f1c40f'" onmouseout="this.style.background='rgba(255,255,255,0.07)';this.style.color='rgba(255,255,255,0.6)'">${isGrupoHabilitado() ? '🔓 Abierto' : '🔒 Cerrado'}</button>
                <button id="btnPermisosGrupo" onclick="abrirDropdownPermisosGrupo(event)" title="Control de escritura por asesor" style="display:none;background:rgba(255,45,85,0.12);border:1px solid rgba(255,45,85,0.4);color:rgba(255,100,100,0.9);padding:3px 7px;border-radius:7px;cursor:pointer;font-size:9px;font-weight:700;transition:0.2s;" onmouseover="this.style.background='rgba(255,45,85,0.28)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,45,85,0.12)';this.style.color='rgba(255,100,100,0.9)'">🚫 0</button>
                <button onclick="eliminarChatGrupo()" title="Eliminar todos los mensajes del grupo" style="background:rgba(255,45,85,0.1);border:1px solid rgba(255,45,85,0.3);color:rgba(255,100,100,0.8);padding:3px 7px;border-radius:7px;cursor:pointer;font-size:9px;font-weight:700;transition:0.2s;" onmouseover="this.style.background='rgba(255,45,85,0.28)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,45,85,0.1)';this.style.color='rgba(255,100,100,0.8)'">🗑️ Eliminar</button>
                <button onclick="toggleMinimizarGrupo()" id="btnMinGrupo" title="Minimizar" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:bold;display:flex;align-items:center;justify-content:center;transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.18)'" onmouseout="this.style.background='rgba(255,255,255,0.08)'">—</button>
                <button onclick="cerrarVentanaChatGrupo()" title="Cerrar" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.6);width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:10px;font-weight:bold;display:flex;align-items:center;justify-content:center;transition:0.2s;" onmouseover="this.style.background='rgba(255,45,85,0.3)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">✕</button>
            </div>
        </div>
        <!-- Cuerpo con clase grupoWinBody igual que chatWinBody -->
        <div class="grupoWinBody" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;">
            <div id="grupoMensajesZona" style="flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:4px;background:linear-gradient(180deg,#0d0d0d,#0f0f0f);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent;"></div>
            <div id="grupoAdjPreview" style="display:none;flex-wrap:wrap;gap:5px;padding:7px 10px 0;background:#0a0a0a;border-top:1px solid rgba(255,255,255,0.05);max-height:80px;overflow-y:auto;"></div>
            <div style="padding:10px 12px;background:#0a0a0a;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:6px;align-items:center;flex-shrink:0;">
                <button onclick="chatGrupoAbrirAdjunto()" title="Adjuntar archivo" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.6);width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:0.2s;flex-shrink:0;" onmouseover="this.style.background='rgba(255,45,85,0.18)';this.style.color='#ff2d55';this.style.borderColor='rgba(255,45,85,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.6)';this.style.borderColor='rgba(255,255,255,0.1)'">📎</button>
                <input type="file" id="grupoFileInput" multiple accept="image/*,video/*,.pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.txt,.csv,.zip" style="display:none;" onchange="chatGrupoArchivoSeleccionado(this.files)">
                <input id="grupoInputAdmin" onkeydown="if(event.key==='Enter')enviarMensajeGrupo()" placeholder="Escribe al grupo..." style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:8px 12px;color:#fff;font-size:13px;outline:none;" onfocus="this.style.borderColor='rgba(255,45,85,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.09)'">
                <button onclick="enviarMensajeGrupo()" style="background:linear-gradient(135deg,#ff2d55,#c0153a);border:none;color:#fff;width:34px;height:34px;border-radius:10px;cursor:pointer;font-size:15px;display:flex;align-items:center;justify-content:center;flex-shrink:0;">➤</button>
            </div>
        </div>`;
    container.appendChild(div);
    window._grupoMinimizado = false;
    // Ocultar controles de administración para roles sin permiso
    if (window._rolSinControlChat) {
        const btnTog = document.getElementById('btnToggleGrupo');
        const btnElim = div.querySelector('[onclick="eliminarChatGrupo()"]');
        const btnPerm = document.getElementById('btnPermisosGrupo');
        if (btnTog) btnTog.style.display = 'none';
        if (btnElim) btnElim.style.display = 'none';
        if (btnPerm) btnPerm.style.display = 'none';
    }
    renderMensajesGrupo();
    _marcarLeidosGrupo();
    if (!window._rolSinControlChat) renderBtnPermisosGrupo();
}

function toggleMinimizarGrupo() {
    const win = document.getElementById('ventana_grupo_usd');
    if (!win) return;
    const body = win.querySelector('.grupoWinBody');
    const btnMin = document.getElementById('btnMinGrupo');
    const btnToggle = document.getElementById('btnToggleGrupo');
    const btnEliminar = win.querySelector('[onclick="eliminarChatGrupo()"]');
    const btnPermisos = document.getElementById('btnPermisosGrupo');
    window._grupoMinimizado = !window._grupoMinimizado;
    if (window._grupoMinimizado) {
        body.style.display = 'none';
        win.style.height = 'auto';
        if (btnMin) btnMin.textContent = '▲';
        if (btnToggle) btnToggle.style.display = 'none';
        if (btnEliminar) btnEliminar.style.display = 'none';
        if (btnPermisos) btnPermisos.style.display = 'none';
    } else {
        body.style.display = 'flex';
        win.style.height = '480px';
        if (btnMin) btnMin.textContent = '—';
        if (!window._rolSinControlChat) {
            if (btnToggle) { btnToggle.style.display = ''; btnToggle.textContent = isGrupoHabilitado() ? '🔓 Abierto' : '🔒 Cerrado'; }
            if (btnEliminar) btnEliminar.style.display = '';
            renderBtnPermisosGrupo();
        }
        renderMensajesGrupo();
    }
}

function cerrarVentanaChatGrupo() {
    const win = document.getElementById('ventana_grupo_usd');
    if (win) win.remove();
    window._grupoMinimizado = false;
    renderListaContactos();
}

function abrirConversacionGrupoAsesor() {
    // El asesor siempre puede ver el grupo, pero solo escribe si está habilitado
    document.getElementById('chatDestinatarioActivo').value = '__grupo_usd__';
    document.getElementById('chatNombreActivo').textContent = 'GRUPO USD';
    document.getElementById('chatRolActivo').textContent = 'Todos los integrantes';
    document.getElementById('chatFotoActivo').src = 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png';
    document.getElementById('chatConversacion').style.display = 'flex';
    document.getElementById('chatBienvenida').style.display = 'none';
    document.getElementById('chatRespuestasCerradas').style.display = 'none';
    if (isGrupoHabilitado() || esRolSup(userLogueado.rol)) {
        // Grupo abierto, o supervisor (siempre puede escribir aunque el grupo esté cerrado)
        actualizarInputGrupoAsesor();
    } else {
        // Grupo cerrado: solo lectura (no aplica a supervisores)
        document.getElementById('chatInputArea').style.display = 'none';
        document.getElementById('chatSoloLectura').style.display = 'flex';
        document.getElementById('chatSoloLectura').querySelector('span').textContent = '🔒 El grupo está cerrado';
    }
    renderMensajesGrupoAsesor();
    // Marcar leídos
    const msgs = getGrupoMensajes();
    msgs.forEach(m => { if (m.de !== userLogueado.usuario) m['leido_' + userLogueado.usuario] = true; });
    saveGrupoMensajes(msgs);
    actualizarBadgeRobot();
    renderListaContactosAsesor();
}

function renderMensajesGrupo() {
    const cont = document.getElementById('grupoMensajesZona');
    if (!cont) return;
    const msgs = getGrupoMensajes();
    if (msgs.length === 0) {
        cont.innerHTML = '<div style="color:rgba(255,255,255,0.2);font-size:12px;text-align:center;padding:30px 10px;">¡El grupo está activo! Sé el primero en escribir 👋</div>';
        return;
    }
    cont.innerHTML = msgs.map(m => {
        const esYo = m.de === userLogueado.usuario;
        const uObj = usuarios.find(u => u.usuario === m.de);
        const nombreCorto = uObj ? aNombrePropio(uObj.nombre).split(' ').slice(0,2).join(' ') : m.de;
        const foto = uObj ? (uObj.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png') : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const hora = m.ts ? new Date(m.ts).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : '';
        return `<div style="display:flex;flex-direction:${esYo?'row-reverse':'row'};align-items:flex-end;gap:6px;margin-bottom:6px;" class="chat-msg-item">
            <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid rgba(255,45,85,0.4);">
            <div style="max-width:75%;">
                ${!esYo ? `<div style="font-size:9px;color:rgba(255,45,85,0.8);font-weight:700;margin-bottom:2px;padding-left:4px;">${nombreCorto}</div>` : ''}
                ${m.reenviado ? `<div style="font-size:9px;color:rgba(255,255,255,0.35);font-style:italic;margin-bottom:2px;padding-left:4px;">↪ Reenviado de ${m.autorOriginal || ''}</div>` : ''}
                ${m.adjunto ? renderAdjuntoHTML(m.adjunto, esYo) : ''}
                ${m.texto ? `<div style="background:${esYo?'linear-gradient(135deg,#ff2d55,#c0153a)':'rgba(255,255,255,0.07)'};color:#fff;padding:8px 11px;border-radius:${esYo?'12px 12px 3px 12px':'12px 12px 12px 3px'};font-size:12px;line-height:1.4;word-break:break-word;">${m.texto}</div>` : ''}
                <div style="font-size:9px;color:rgba(255,255,255,0.25);margin-top:2px;text-align:${esYo?'right':'left'};padding:0 4px;">${hora}</div>
            </div>
        </div>`;
    }).join('');
    cont.scrollTop = cont.scrollHeight;
}

function renderMensajesGrupoAsesor() {
    const cont = document.getElementById('chatMensajes');
    if (!cont) return;
    const msgs = getGrupoMensajes();
    if (msgs.length === 0) {
        const textoVacio = isGrupoHabilitado()
            ? '¡El grupo está activo! Sé el primero en escribir 👥'
            : '🔒 El grupo está cerrado. Aún no hay mensajes.';
        const vaciHTML = `<div style="color:rgba(255,255,255,0.2);font-size:12px;text-align:center;padding:30px 20px;">${textoVacio}</div>`;
        if (cont.innerHTML !== vaciHTML) cont.innerHTML = vaciHTML;
        return;
    }
    const nuevoHTML = msgs.map(m => {
        const esYo = m.de === userLogueado.usuario;
        const uObj = usuarios.find(u => u.usuario === m.de);
        const nombreCorto = uObj ? aNombrePropio(uObj.nombre).split(' ').slice(0,2).join(' ') : m.de;
        const foto = uObj ? (uObj.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png') : 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const hora = m.ts ? new Date(m.ts).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : '';
        return `<div style="display:flex;flex-direction:${esYo?'row-reverse':'row'};align-items:flex-end;gap:6px;margin-bottom:6px;" class="chat-msg-item">
            <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:26px;height:26px;border-radius:50%;object-fit:cover;flex-shrink:0;border:1px solid rgba(255,45,85,0.4);">
            <div style="max-width:75%;">
                ${!esYo ? `<div style="font-size:9px;color:rgba(255,45,85,0.8);font-weight:700;margin-bottom:2px;padding-left:4px;">${nombreCorto}</div>` : ''}
                ${m.reenviado ? `<div style="font-size:9px;color:rgba(255,255,255,0.35);font-style:italic;margin-bottom:2px;padding-left:4px;">↪ Reenviado de ${m.autorOriginal || ''}</div>` : ''}
                ${m.adjunto ? renderAdjuntoHTML(m.adjunto, esYo) : ''}
                ${m.texto ? `<div style="background:${esYo?'linear-gradient(135deg,#ff2d55,#c0153a)':'rgba(255,255,255,0.07)'};color:#fff;padding:8px 11px;border-radius:${esYo?'12px 12px 3px 12px':'12px 12px 12px 3px'};font-size:12px;line-height:1.4;word-break:break-word;">${m.texto}</div>` : ''}
                <div style="font-size:9px;color:rgba(255,255,255,0.25);margin-top:2px;text-align:${esYo?'right':'left'};padding:0 4px;">${hora}</div>
            </div>
        </div>`;
    }).join('');
    const atBottom = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 60;
    // Siempre actualizar para no perder mensajes nuevos del grupo
    cont.innerHTML = nuevoHTML;
    if (atBottom || cont.scrollTop === 0) cont.scrollTop = cont.scrollHeight;
}

function enviarMensajeGrupo() {
    const inputAdmin = document.getElementById('grupoInputAdmin');
    const inputAsesor = document.getElementById('chatInput');
    const destActivo = document.getElementById('chatDestinatarioActivo');

    // Detectar desde qué input viene
    let texto = '';
    let desdeAsesor = false;
    if (destActivo && destActivo.value === '__grupo_usd__' && inputAsesor) {
        texto = inputAsesor.value.trim();
        desdeAsesor = true;
    } else if (inputAdmin) {
        texto = inputAdmin.value.trim();
    }

    // Validar que el asesor no esté bloqueado individualmente del grupo (solo aplica a rol asesor)
    if (desdeAsesor && esRolAsesor(userLogueado.rol) && isAsesorBloqueadoEnGrupo(userLogueado.usuario)) {
        actualizarInputGrupoAsesor();
        return;
    }

    let huboCambios = false;

    if (desdeAsesor) {
        // Adjuntos pendientes del asesor en el grupo
        if (window._chatAdjuntosPendientes && window._chatAdjuntosPendientes.length > 0) {
            const msgs = getGrupoMensajes();
            window._chatAdjuntosPendientes.forEach(adj => {
                msgs.push({ de: userLogueado.usuario, texto: '', adjunto: adj, ts: Date.now() });
            });
            saveGrupoMensajes(msgs);
            window._chatAdjuntosPendientes = [];
            chatLimpiarPreview();
            huboCambios = true;
        }
        if (texto) {
            const msgs = getGrupoMensajes();
            msgs.push({ id: `${userLogueado.usuario}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, de: userLogueado.usuario, texto, ts: Date.now() });
            saveGrupoMensajes(msgs);
            inputAsesor.value = '';
            huboCambios = true;
        }
        if (huboCambios) {
            renderMensajesGrupoAsesor();
            actualizarBadgeTotal();
            actualizarBadgeRobot();
        }
    } else {
        // Adjuntos pendientes del admin/super en el grupo
        if (window._chatGrupoAdjuntosPendientes && window._chatGrupoAdjuntosPendientes.length > 0) {
            const msgs = getGrupoMensajes();
            window._chatGrupoAdjuntosPendientes.forEach(adj => {
                msgs.push({ de: userLogueado.usuario, texto: '', adjunto: adj, ts: Date.now() });
            });
            saveGrupoMensajes(msgs);
            window._chatGrupoAdjuntosPendientes = [];
            chatGrupoLimpiarPreview();
            huboCambios = true;
        }
        if (texto) {
            const msgs = getGrupoMensajes();
            msgs.push({ id: `${userLogueado.usuario}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, de: userLogueado.usuario, texto, ts: Date.now() });
            saveGrupoMensajes(msgs);
            inputAdmin.value = '';
            huboCambios = true;
        }
        if (huboCambios) {
            renderMensajesGrupo();
            actualizarBadgeTotal();
            actualizarBadgeRobot();
        }
    }
}
// ── FIN CHAT GRUPO USD ────────────────────────────────────────────────────────

// Modo por PAR: adminId_asesorId (el que cierra y a quien le cierra)
function getChatModoAsesor(asesorId) {
    if (!userLogueado) return 'abierto';
    const key = userLogueado.usuario + '_' + asesorId;
    const modos = getChatModos();
    return modos[key] || 'abierto';
}
function setChatModoAsesor(asesorId, modo) {
    if (!userLogueado) return;
    const key = userLogueado.usuario + '_' + asesorId;
    const modos = getChatModos();
    modos[key] = modo;
    saveChatModos(modos);
}
// Verifica si el asesor tiene el chat cerrado con el remitente especifico
function getModoParaAsesor(adminId, asesorId) {
    const key = adminId + '_' + asesorId;
    const modos = getChatModos();
    return modos[key] || 'abierto';
}

// Retorna los destinatarios disponibles para el usuario logueado
function getChatDestinatarios() {
    if (!userLogueado) return [];
    const rol = userLogueado.rol;
    const otros = usuarios.filter(u => u.usuario !== userLogueado.usuario);
    // Admin/coordinadores: ven a todos — administrativos primero, asesores después
    if (esRolAdmin(rol)) return [
        ...otros.filter(u => !esRolAsesor(u.rol)),
        ...otros.filter(u => esRolAsesor(u.rol))
    ];
    // Supervisores, capacitador y calidad: ven a todos — administrativos primero, asesores después
    if (esRolSup(rol) || rol === 'capacitador' || rol === 'calidad') return [
        ...otros.filter(u => !esRolAsesor(u.rol)),
        ...otros.filter(u => esRolAsesor(u.rol))
    ];
    return [];
}

// ── Abrir chat desde HV del asesor (admin/super) ─────────────────
function abrirChatDesdeCV() {
    const i = parseInt(document.getElementById("cvUserIndex").value);
    if (i < 0) return;
    const u = usuarios[i];
    cerrarModalCV();
    abrirVentanaChat(u.usuario);
}

// ── MESSENGER BAR (admin / supervisor) ───────────────────────────
let messengerListaAbierta = false;
// ventanas abiertas: { usuarioId: { minimizado: bool } }
let ventanasAbiertas = {};

// Persistir ventanas abiertas en sessionStorage para restaurar al refrescar
function _guardarEstadoVentanas() {
    const estado = {};
    Object.keys(ventanasAbiertas).forEach(uid => {
        estado[uid] = { minimizado: true }; // siempre restaurar minimizadas
    });
    sessionStorage.setItem('usd_ventanas_chat', JSON.stringify(estado));
}
window.addEventListener('beforeunload', _guardarEstadoVentanas);

function iniciarMessenger() {
    const bar = document.getElementById('messengerBar');
    if (!bar) return;
    bar.style.display = 'flex';
    renderListaContactos();
    registrarPresencia(); // Registrar presencia al iniciar
    // Polling global
    if (!window._chatInterval) {
        window._chatInterval = setInterval(() => {
            registrarPresencia(); // Heartbeat cada 1.5 segundos (instancia asesor panel)
            renderListaContactos();
            actualizarBadgesVentanas();
            actualizarBadgeTotal();
        }, 1500);
    }
    // Restaurar ventanas de chat que estaban abiertas antes del refresco (minimizadas)
    setTimeout(_restaurarVentanasChat, 600);
}

function toggleListaContactos() {
    messengerListaAbierta = !messengerListaAbierta;
    const panel = document.getElementById('messengerLista');
    const arrow = document.getElementById('messengerArrow');
    panel.style.display = messengerListaAbierta ? 'block' : 'none';
    arrow.textContent = messengerListaAbierta ? '▼' : '▲';
    if (messengerListaAbierta) renderListaContactos();
}

function renderListaContactos() {
    const cont = document.getElementById('messengerListaContactos');
    if (!cont) return;
    const msgs = getChatMensajes();
    const contactos = getChatDestinatarios();

    // GRUPO USD al tope
    const grupoMsgs = getGrupoMensajes();
    const ultimoGrupo = grupoMsgs.length > 0 ? grupoMsgs[grupoMsgs.length - 1] : null;
    const ultimoTextoGrupo = ultimoGrupo ? ultimoGrupo.texto.substring(0, 28) + (ultimoGrupo.texto.length > 28 ? '…' : '') : 'Sin mensajes aún';
    const grupoActivo = isGrupoHabilitado();
    const _noLeidosGrupoAdmin = grupoMsgs.filter(m => m.de !== userLogueado.usuario && !m['leido_' + userLogueado.usuario]).length;
    const grupoHTML = `<div onclick="abrirVentanaChatGrupo()" style="display:flex;align-items:center;gap:10px;padding:10px 14px;cursor:pointer;border-bottom:1px solid rgba(255,45,85,0.12);transition:0.15s;background:rgba(255,45,85,0.05);" onmouseover="this.style.background='rgba(255,45,85,0.1)'" onmouseout="this.style.background='rgba(255,45,85,0.05)'">
        <div style="position:relative;">
            <div style="width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#ff2d55,#c0153a);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;">👥</div>
            <div style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;border-radius:50%;background:${grupoActivo?'#27ae60':'#888'};border:2px solid #0f0f0f;"></div>
            ${_noLeidosGrupoAdmin > 0 ? `<span style="position:absolute;top:-6px;left:-6px;background:#ff2d55;color:#fff;border-radius:50%;min-width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;padding:0 2px;border:2px solid #0f0f0f;">${_noLeidosGrupoAdmin}</span>` : ''}
        </div>
        <div style="flex:1;min-width:0;">
            <div style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:13px;font-weight:800;color:#fff;">GRUPO USD</span>
                <span style="font-size:9px;color:rgba(255,255,255,0.3);">${ultimoGrupo ? new Date(ultimoGrupo.ts).toLocaleTimeString('es-CO',{hour:'2-digit',minute:'2-digit'}) : ''}</span>
            </div>
            <div style="font-size:11px;color:${grupoActivo?'rgba(39,174,96,0.9)':'rgba(231,76,60,0.8)'};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${grupoActivo ? ultimoTextoGrupo : '🔒 Grupo cerrado'}</div>
        </div>
    </div>`;

    if (contactos.length === 0) {
        const noContactHTML = grupoHTML + '<div style="color:rgba(255,255,255,0.25);font-size:12px;padding:16px;text-align:center;">Sin contactos disponibles.</div>';
        if (cont.innerHTML !== noContactHTML) cont.innerHTML = noContactHTML;
        actualizarBadgeTotal();
        return;
    }
    // Administrativos primero, asesores después
    const contactosOrdenados = [
        ...contactos.filter(u => !esRolAsesor(u.rol)),
        ...contactos.filter(u => esRolAsesor(u.rol))
    ];
    const contactosHTML = contactosOrdenados.map(u => {
        const noLeidos = msgs.filter(m => m.para === userLogueado.usuario && m.de === u.usuario && !m.leido).length;
        const badge = noLeidos > 0 ? `<span style="background:#ff2d55;color:#fff;border-radius:10px;min-width:18px;height:18px;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;padding:0 4px;">${noLeidos}</span>` : '';
        const foto = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const abierta = ventanasAbiertas[u.usuario] ? 'rgba(255,45,85,0.1)' : 'transparent';
        const borderLeft = ventanasAbiertas[u.usuario] ? 'border-left:2px solid #ff2d55;' : 'border-left:2px solid transparent;';
        const esBloqueadoGrupo = u.rol === 'asesor' && isAsesorBloqueadoEnGrupo(u.usuario);
        const btnBloqueoGrupo = '';
        const candadoPrivado = '';
        // Estado en línea
        const enLinea = isUsuarioEnLinea(u.usuario);
        const dotColor = enLinea ? '#27ae60' : '#888';
        const dotShadow = enLinea ? 'box-shadow:0 0 4px #27ae60;' : '';
        return `<div onclick="abrirVentanaChat('${u.usuario}')" style="display:flex;align-items:center;gap:10px;padding:9px 12px;cursor:pointer;background:${esBloqueadoGrupo ? 'rgba(255,45,85,0.04)' : abierta};${borderLeft}transition:0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.06)'" onmouseout="this.style.background='${esBloqueadoGrupo ? 'rgba(255,45,85,0.04)' : abierta}'">
            <div style="position:relative;flex-shrink:0;">
                <img src="${foto}" style="width:34px;height:34px;border-radius:10px;object-fit:cover;border:2px solid ${esBloqueadoGrupo ? 'rgba(255,45,85,0.6)' : 'rgba(255,45,85,0.4)'};" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                <div style="position:absolute;bottom:-1px;right:-1px;width:8px;height:8px;border-radius:50%;background:${dotColor};border:2px solid #0f0f0f;${dotShadow}"></div>
                ${noLeidos > 0 ? `<span style="position:absolute;top:-6px;left:-6px;background:#ff2d55;color:#fff;border-radius:50%;min-width:17px;height:17px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;padding:0 2px;border:2px solid #0f0f0f;">${noLeidos}</span>` : ''}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                    <div style="font-size:12px;font-weight:700;color:${esBloqueadoGrupo ? 'rgba(255,150,150,0.9)' : '#fff'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(u.nombre).split(' ').slice(0,2).join(' ')}</div>
                    ${noLeidos > 0 ? `<span style="background:#ff2d55;color:#fff;border-radius:10px;min-width:18px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;padding:0 4px;flex-shrink:0;">${noLeidos}</span>` : ''}
                </div>
                <div style="font-size:9px;color:${esBloqueadoGrupo ? 'rgba(255,100,100,0.6)' : 'rgba(255,45,85,0.7)'};text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${esBloqueadoGrupo ? 'Sin permiso en grupo' : enLinea ? 'En línea' : 'Fuera de línea'}</div>
            </div>
            ${candadoPrivado}
            ${btnBloqueoGrupo}
        </div>`;
    }).join('');
    const nuevoHTML = grupoHTML + contactosHTML;
    if (cont.innerHTML !== nuevoHTML) cont.innerHTML = nuevoHTML;
    actualizarBadgeTotal();
}

function actualizarBadgeTotal() {
    const msgs = getChatMensajes();
    const total = msgs.filter(m => m.para === userLogueado.usuario && !m.leido).length;
    const badgeEl = document.getElementById('messengerTotalBadge');
    if (badgeEl) {
        badgeEl.style.display = total > 0 ? 'inline-flex' : 'none';
        badgeEl.textContent = total;
    }
}

// ── Abrir / traer al frente ventana de chat ───────────────────────
function abrirVentanaChat(usuarioId) {
    // Cerrar lista
    messengerListaAbierta = false;
    const panel = document.getElementById('messengerLista');
    if (panel) panel.style.display = 'none';
    const arrow = document.getElementById('messengerArrow');
    if (arrow) arrow.textContent = '▲';

    if (ventanasAbiertas[usuarioId]) {
        // Ya existe: des-minimizar
        const win = document.getElementById(`chatWin_${usuarioId}`);
        if (win) {
            ventanasAbiertas[usuarioId].minimizado = false;
            win.querySelector('.chatWinBody').style.display = 'flex';
            win.style.height = '520px';
        }
        return;
    }

    ventanasAbiertas[usuarioId] = { minimizado: false };
    crearVentanaChat(usuarioId);
    renderListaContactos();
}

function crearVentanaChat(usuarioId) {
    const u = usuarios.find(x => x.usuario === usuarioId);
    if (!u) return;
    const winId = `chatWin_${usuarioId}`;
    const cont = document.getElementById('messengerWindows');
    const modo = getChatModoAsesor(usuarioId);

    const win = document.createElement('div');
    win.id = winId;
    win.style.cssText = `width:360px;height:520px;background:#0f0f0f;border-radius:16px 16px 0 0;box-shadow:0 -6px 30px rgba(0,0,0,0.7),0 0 0 1px rgba(255,255,255,0.07);display:flex;flex-direction:column;overflow:hidden;transition:height 0.2s;position:relative;`;

    const nombreCorto = aNombrePropio(u.nombre).split(' ').slice(0,2).join(' ');
    const foto = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';

    win.innerHTML = `
    <!-- Header rediseñado -->
    <div style="background:linear-gradient(135deg,#1a0a10,#2a0e1a);padding:10px 12px;display:flex;align-items:center;gap:9px;cursor:pointer;user-select:none;border-bottom:1px solid rgba(255,45,85,0.25);flex-shrink:0;" onclick="toggleMinimizarVentana('${usuarioId}')">
        <div style="position:relative;flex-shrink:0;">
            <img src="${foto}" style="width:32px;height:32px;border-radius:10px;object-fit:cover;border:2px solid #ff2d55;" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
            <div id="dotEstado_${usuarioId}" style="position:absolute;bottom:-2px;right:-2px;width:9px;height:9px;border-radius:50%;background:${isUsuarioEnLinea(usuarioId)?'#27ae60':'#888'};border:2px solid #0f0f0f;${isUsuarioEnLinea(usuarioId)?'box-shadow:0 0 4px #27ae60;':''}"></div>
        </div>
        <div style="flex:1;min-width:0;">
            <div style="display:flex;align-items:center;gap:5px;">
                <div style="font-size:12px;font-weight:800;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${nombreCorto}</div>
                <span id="chatWinBadge_${usuarioId}" style="display:none;background:#ff2d55;color:#fff;border-radius:10px;min-width:18px;height:16px;font-size:9px;font-weight:900;align-items:center;justify-content:center;padding:0 4px;flex-shrink:0;"></span>
            </div>
            <div style="font-size:9px;color:rgba(255,45,85,0.8);text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">${u.rol}</div>
        </div>
        <button onclick="event.stopPropagation();cerrarVentanaChat('${usuarioId}')" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.12);color:rgba(255,255,255,0.6);width:24px;height:24px;border-radius:7px;cursor:pointer;font-size:11px;font-weight:bold;flex-shrink:0;transition:0.2s;" onmouseover="this.style.background='rgba(255,45,85,0.3)';this.style.color='#fff'" onmouseout="this.style.background='rgba(255,255,255,0.08)';this.style.color='rgba(255,255,255,0.6)'">✕</button>
    </div>
    <!-- Cuerpo -->
    <div class="chatWinBody" style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-height:0;">
        <!-- Barra acciones ventana -->
        <div style="display:flex;padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.06);align-items:center;gap:6px;background:#0a0a0a;flex-shrink:0;">

            <button onclick="borrarConversacionVentana('${usuarioId}')" style="margin-left:auto;background:transparent;border:none;color:rgba(255,255,255,0.25);padding:3px 6px;border-radius:6px;cursor:pointer;font-size:10px;transition:0.2s;" onmouseover="this.style.color='#e74c3c'" onmouseout="this.style.color='rgba(255,255,255,0.25)'" title="Vaciar conversación">🗑</button>
        </div>
        <!-- Mensajes -->
        <div id="chatWinMsgs_${usuarioId}" style="flex:1;overflow-y:auto;padding:12px 10px;display:flex;flex-direction:column;gap:2px;background:linear-gradient(180deg,#0d0d0d,#0f0f0f);scrollbar-width:thin;scrollbar-color:rgba(255,255,255,0.1) transparent;"></div>
        <!-- Preview adjuntos ventana -->
        <div id="chatWinAdjPreview_${usuarioId}" style="display:none;flex-wrap:wrap;gap:5px;padding:7px 10px 0;background:#0a0a0a;border-top:1px solid rgba(255,255,255,0.05);max-height:80px;overflow-y:auto;"></div>
        <!-- Input con adjuntar -->
        <div style="padding:9px 10px 10px;border-top:1px solid rgba(255,255,255,0.06);display:flex;gap:6px;align-items:center;background:#0a0a0a;flex-shrink:0;">
            <button onclick="chatWinAbrirAdjunto('${usuarioId}')" title="Adjuntar" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:9px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;transition:0.2s;flex-shrink:0;" onmouseover="this.style.background='rgba(255,45,85,0.18)';this.style.color='#ff2d55';this.style.borderColor='rgba(255,45,85,0.4)'" onmouseout="this.style.background='rgba(255,255,255,0.06)';this.style.color='rgba(255,255,255,0.5)';this.style.borderColor='rgba(255,255,255,0.1)'">📎</button>
            <input type="file" id="chatWinFileInput_${usuarioId}" multiple accept="image/*,video/*,.pdf,.xlsx,.xls,.docx,.doc,.pptx,.ppt,.txt,.csv,.zip" style="display:none;" onchange="chatWinArchivoSeleccionado(this.files,'${usuarioId}')">
            <input id="chatWinInput_${usuarioId}" placeholder="Escribe un mensaje..." onkeydown="chatWinKeyDown(event,'${usuarioId}')" style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.09);border-radius:10px;padding:8px 12px;color:#fff;font-size:12px;outline:none;transition:border 0.2s;" onfocus="this.style.borderColor='rgba(255,45,85,0.5)'" onblur="this.style.borderColor='rgba(255,255,255,0.09)'">
            <button onclick="enviarMensajeVentana('${usuarioId}')" style="background:linear-gradient(135deg,#ff2d55,#c0153a);border:none;color:#fff;width:32px;height:32px;border-radius:10px;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 3px 10px rgba(255,45,85,0.35);transition:0.2s;" onmouseover="this.style.transform='scale(1.08)'" onmouseout="this.style.transform='scale(1)'">➤</button>
        </div>
    </div>`;

    cont.appendChild(win);

    // Ocultar botón borrar conversación para roles sin permiso
    if (window._rolSinControlChat) {
        const bDel = win.querySelector('[title="Vaciar conversación"]');
        if (bDel) bDel.style.display = 'none';
    }


    // Drag & drop en esta ventana
    win.addEventListener('dragover', (e) => {
        e.preventDefault();
        win.style.outline = '2px dashed #ff2d55';
        win.style.outlineOffset = '-4px';
    });
    win.addEventListener('dragleave', (e) => {
        if (!win.contains(e.relatedTarget)) {
            win.style.outline = '';
            win.style.outlineOffset = '';
        }
    });
    win.addEventListener('drop', (e) => {
        e.preventDefault();
        win.style.outline = '';
        win.style.outlineOffset = '';
        const files = e.dataTransfer.files;
        if (files.length > 0) Array.from(files).forEach(f => chatWinProcesarArchivo(f, usuarioId));
    });

    renderMensajesVentana(usuarioId);
    marcarLeidosVentana(usuarioId);
}

// ── ADJUNTOS VENTANAS ADMIN/SUPER ────────────────────────────────────────────
if (!window._chatWinAdjuntos) window._chatWinAdjuntos = {};

function chatWinAbrirAdjunto(uid) {
    document.getElementById(`chatWinFileInput_${uid}`).click();
}

function chatWinArchivoSeleccionado(files, uid) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(f => chatWinProcesarArchivo(f, uid));
    document.getElementById(`chatWinFileInput_${uid}`).value = '';
}

// ── Compresión de imágenes para reducir tamaño antes de guardar en Firebase ──
function _chatComprimirImagen(dataUrl, maxKB, callback) {
    const MAX_BYTES = maxKB * 1024;
    if (dataUrl.length <= MAX_BYTES) { callback(dataUrl); return; }
    const img = new Image();
    img.onload = function() {
        let w = img.width, h = img.height;
        const MAX_DIM = 1024;
        if (w > MAX_DIM || h > MAX_DIM) {
            if (w > h) { h = Math.round(h * MAX_DIM / w); w = MAX_DIM; }
            else       { w = Math.round(w * MAX_DIM / h); h = MAX_DIM; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        let quality = 0.82;
        let result = canvas.toDataURL('image/jpeg', quality);
        while (result.length > MAX_BYTES && quality > 0.3) {
            quality -= 0.1;
            result = canvas.toDataURL('image/jpeg', quality);
        }
        callback(result);
    };
    img.onerror = () => callback(dataUrl);
    img.src = dataUrl;
}

// Procesador base unificado con compresión automática de imágenes
function _chatProcesarArchivoBase(file, onReady) {
    if (file.size > 25 * 1024 * 1024) { toast(`"${file.name}" supera los 25 MB permitidos para videos.`, "warning"); return; }
    const tipo = file.type || 'application/octet-stream';
    // Videos: usar Blob URL directamente para evitar bloqueos con readAsDataURL
    if (tipo.startsWith('video/')) {
        const blobUrl = URL.createObjectURL(file);
        onReady({ nombre: file.name, tipo, tamaño: chatFormatSize(file.size), dataUrl: blobUrl, esBlobUrl: true });
        return;
    }
    if (file.size > 10 * 1024 * 1024) { toast(`"${file.name}" supera los 10MB permitidos.`, "warning"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        const raw = e.target.result;
        if (tipo.startsWith('image/')) {
            _chatComprimirImagen(raw, 600, (comprimido) => {
                onReady({ nombre: file.name, tipo: 'image/jpeg', tamaño: chatFormatSize(Math.round(comprimido.length * 0.75)), dataUrl: comprimido });
            });
        } else {
            onReady({ nombre: file.name, tipo, tamaño: chatFormatSize(file.size), dataUrl: raw });
        }
    };
    reader.readAsDataURL(file);
}

function chatWinProcesarArchivo(file, uid) {
    _chatProcesarArchivoBase(file, (adj) => {
        if (!window._chatWinAdjuntos[uid]) window._chatWinAdjuntos[uid] = [];
        window._chatWinAdjuntos[uid].push(adj);
        chatWinActualizarPreview(uid);
    });
}

function chatWinActualizarPreview(uid) {
    const zona = document.getElementById(`chatWinAdjPreview_${uid}`);
    if (!zona) return;
    const adjs = window._chatWinAdjuntos[uid] || [];
    if (adjs.length === 0) { zona.style.display = 'none'; zona.innerHTML = ''; return; }
    zona.style.display = 'flex';
    zona.innerHTML = adjs.map((adj, i) => {
        let ic = '📎';
        if (adj.tipo.startsWith('image/')) ic = '📷';
        else if (adj.tipo.startsWith('video/')) ic = '🎥';
        else if (adj.tipo.includes('pdf')) ic = '📄';
        else if (adj.tipo.includes('sheet') || adj.tipo.includes('excel') || adj.tipo.includes('csv')) ic = '📊';
        else if (adj.tipo.includes('word')) ic = '📝';
        return `<div class="adjunto-chip">${ic}<span title="${adj.nombre}">${adj.nombre}</span><button onclick="chatWinEliminarAdj(${i},'${uid}')">✕</button></div>`;
    }).join('');
}

function chatWinEliminarAdj(idx, uid) {
    if (window._chatWinAdjuntos[uid]) window._chatWinAdjuntos[uid].splice(idx, 1);
    chatWinActualizarPreview(uid);
}

// ── ADJUNTOS CHAT GRUPO (admin/super) ────────────────────────────────────────
window._chatGrupoAdjuntosPendientes = [];

function chatGrupoAbrirAdjunto() {
    const inp = document.getElementById('grupoFileInput');
    if (inp) inp.click();
}

function chatGrupoArchivoSeleccionado(files) {
    if (!files || files.length === 0) return;
    Array.from(files).forEach(f => chatGrupoProcesarArchivo(f));
    const inp = document.getElementById('grupoFileInput');
    if (inp) inp.value = '';
}

function chatGrupoProcesarArchivo(file) {
    _chatProcesarArchivoBase(file, (adj) => {
        window._chatGrupoAdjuntosPendientes.push(adj);
        chatGrupoActualizarPreview();
    });
}

function chatGrupoActualizarPreview() {
    const zona = document.getElementById('grupoAdjPreview');
    if (!zona) return;
    const adjs = window._chatGrupoAdjuntosPendientes;
    if (adjs.length === 0) { zona.style.display = 'none'; zona.innerHTML = ''; return; }
    zona.style.display = 'flex';
    zona.innerHTML = adjs.map((adj, i) => {
        let ic = '📎';
        if (adj.tipo.startsWith('image/')) ic = '📷';
        else if (adj.tipo.startsWith('video/')) ic = '🎥';
        else if (adj.tipo.includes('pdf')) ic = '📄';
        else if (adj.tipo.includes('sheet') || adj.tipo.includes('excel') || adj.tipo.includes('csv')) ic = '📊';
        else if (adj.tipo.includes('word')) ic = '📝';
        return `<div class="adjunto-chip">${ic}<span title="${adj.nombre}">${adj.nombre}</span><button onclick="chatGrupoEliminarAdj(${i})">✕</button></div>`;
    }).join('');
}

function chatGrupoEliminarAdj(idx) {
    window._chatGrupoAdjuntosPendientes.splice(idx, 1);
    chatGrupoActualizarPreview();
}

function chatGrupoLimpiarPreview() {
    window._chatGrupoAdjuntosPendientes = [];
    chatGrupoActualizarPreview();
}

function cambiarModoVentana(usuarioId, nuevoModo) {
    // Guard: si ya está en ese modo no hacer nada
    if (getChatModoAsesor(usuarioId) === nuevoModo) return;
    // Solo admin y coordinador pueden cambiar el modo
    if (!esRolCoord(userLogueado ? userLogueado.rol : '')) return;

    setChatModoAsesor(usuarioId, nuevoModo);

    // Actualizar botones de la ventana messenger
    const btnAb = document.getElementById(`btnModoAb_${usuarioId}`);
    const btnCe = document.getElementById(`btnModoCe_${usuarioId}`);
    if (btnAb) {
        btnAb.style.background = nuevoModo === 'abierto' ? '#27ae60' : 'transparent';
        btnAb.style.color      = nuevoModo === 'abierto' ? '#fff'    : '#27ae60';
        btnAb.style.border     = nuevoModo === 'abierto' ? '1px solid #27ae60' : '1px solid rgba(39,174,96,0.5)';
    }
    if (btnCe) {
        btnCe.style.background = nuevoModo === 'cerrado' ? '#e74c3c' : 'transparent';
        btnCe.style.color      = nuevoModo === 'cerrado' ? '#fff'    : '#e74c3c';
        btnCe.style.border     = nuevoModo === 'cerrado' ? '1px solid #e74c3c' : '1px solid rgba(231,76,60,0.5)';
    }
    // Actualizar también botones del panel config-sup si están visibles
    const lista = document.getElementById('supChatModoLista');
    if (lista) {
        lista.querySelectorAll(`[data-uid="${usuarioId}"]`).forEach(btn => {
            const esteM = btn.getAttribute('data-modo');
            if (esteM === 'abierto') { btn.style.background = nuevoModo === 'abierto' ? '#27ae60' : 'transparent'; btn.style.color = nuevoModo === 'abierto' ? '#fff' : '#27ae60'; }
            else { btn.style.background = nuevoModo === 'cerrado' ? '#e74c3c' : 'transparent'; btn.style.color = nuevoModo === 'cerrado' ? '#fff' : '#e74c3c'; }
        });
    }
    // Notificar al asesor via BroadcastChannel
    usdBroadcast('chatModos', { usuarioId, nuevoModo });
    // Actualizar listas de contactos
    renderListaContactos();
    if (typeof renderListaContactosAsesor === 'function') renderListaContactosAsesor();
}

// Actualiza el area de input del panel asesor segun el modo del contacto activo
// Logica: el modo es POR PAR (adminId_asesorId)
// Si el remitente activo cerro el chat con este asesor -> 4 respuestas
// Si el remitente activo tiene abierto -> puede escribir
function actualizarAreaRespuestaAsesor(usuarioId) {
    const inputArea = document.getElementById('chatInputArea');
    const soloLectura = document.getElementById('chatSoloLectura');
    const respCerradas = document.getElementById('chatRespuestasCerradas');
    if (!inputArea) return;

    // Caso especial: el asesor está viendo el chat grupal
    if (usuarioId === '__grupo_usd__') {
        // Admin, coordinador y supervisores pueden escribir siempre en el grupo (abierto o cerrado)
        const _puedeEscribirSiempre = userLogueado && (
            esRolAdmin(userLogueado.rol) ||
            esRolCoord(userLogueado.rol) ||
            userLogueado.rol === 'supervisor1' ||
            userLogueado.rol === 'supervisor2'
        );
        if (!isGrupoHabilitado() && !_puedeEscribirSiempre) {
            inputArea.style.display = 'none';
            if (respCerradas) respCerradas.style.display = 'none';
            if (soloLectura) {
                soloLectura.style.display = 'flex';
                const span = soloLectura.querySelector('span');
                if (span) span.textContent = '🔒 El grupo está cerrado';
            }
        } else if (esRolAsesor(userLogueado.rol) && isAsesorBloqueadoEnGrupo(userLogueado.usuario)) {
            // Asesor silenciado del grupo
            inputArea.style.display = 'none';
            if (respCerradas) respCerradas.style.display = 'none';
            if (soloLectura) {
                soloLectura.style.display = 'flex';
                const span = soloLectura.querySelector('span');
                if (span) span.textContent = '🔇 No tienes permiso para escribir en el grupo';
            }
        } else if (['capacitador','calidad'].includes(userLogueado.rol)) {
            // Capacitador y calidad: solo lectura en el grupo
            inputArea.style.display = 'none';
            if (respCerradas) respCerradas.style.display = 'none';
            if (soloLectura) {
                soloLectura.style.display = 'flex';
                const span = soloLectura.querySelector('span');
                if (span) span.textContent = '👁 Solo tienes permiso de lectura en el grupo';
            }
        } else {
            // Puede escribir (admin, coordinador, supervisor, asesores habilitados)
            inputArea.style.display = 'flex';
            if (soloLectura) soloLectura.style.display = 'none';
            if (respCerradas) respCerradas.style.display = 'none';
        }
        return;
    }

    // Caso normal: chat individual con admin/super
    const modo = getModoParaAsesor(usuarioId, userLogueado.usuario);
    // Supervisores/calidad/capacitadores siempre pueden escribir a los asesores
    const _esSuperLect = userLogueado && ['supervisor1','supervisor2','capacitador','calidad'].includes(userLogueado.rol);

    if (!_esSuperLect && modo === 'cerrado') {
        inputArea.style.display = 'none';
        if (soloLectura) soloLectura.style.display = 'none';
        if (respCerradas) {
            respCerradas.style.display = 'flex';
            respCerradas.style.flexDirection = 'column';
        }
        // Mostrar aviso en el sub-header
        const rolEl = document.getElementById('chatRolActivo');
        if (rolEl) rolEl.innerHTML = '<span style="color:#e74c3c;font-weight:700;">🔒 CHAT CERRADO</span>';
    } else {
        inputArea.style.display = 'flex';
        if (soloLectura) soloLectura.style.display = 'none';
        if (respCerradas) respCerradas.style.display = 'none';
        // Restaurar rol en el sub-header
        const rolEl = document.getElementById('chatRolActivo');
        const dest = document.getElementById('chatDestinatarioActivo');
        if (rolEl && dest && dest.value) {
            const uObj = (typeof usuarios !== 'undefined' ? usuarios : []).find(u => u.usuario === dest.value);
            if (uObj) rolEl.innerHTML = uObj.rol.toUpperCase();
        }
    }
}

function toggleMinimizarVentana(usuarioId) {
    if (!ventanasAbiertas[usuarioId]) return;
    const win = document.getElementById(`chatWin_${usuarioId}`);
    if (!win) return;
    const body = win.querySelector('.chatWinBody');
    const estaMin = ventanasAbiertas[usuarioId].minimizado;
    ventanasAbiertas[usuarioId].minimizado = !estaMin;
    body.style.display = estaMin ? 'flex' : 'none';
    win.style.height = estaMin ? '520px' : 'auto';
}

function cerrarVentanaChat(usuarioId) {
    const win = document.getElementById(`chatWin_${usuarioId}`);
    if (win) win.remove();
    delete ventanasAbiertas[usuarioId];
    _guardarEstadoVentanas();
    renderListaContactos();
}

// Restaurar ventanas abiertas (minimizadas) después del login
function _restaurarVentanasChat() {
    try {
        const estado = JSON.parse(sessionStorage.getItem('usd_ventanas_chat') || '{}');
        sessionStorage.removeItem('usd_ventanas_chat');
        const uids = Object.keys(estado);
        if (!uids.length) return;
        uids.forEach(uid => {
            abrirVentanaChat(uid);          // abre la ventana normal
            // luego la minimiza
            const win = document.getElementById(`chatWin_${uid}`);
            if (win) {
                const body = win.querySelector('.chatWinBody');
                if (body) body.style.display = 'none';
                win.style.height = 'auto';
            }
            if (ventanasAbiertas[uid]) ventanasAbiertas[uid].minimizado = true;
        });
    } catch(e) {}
}

function renderMensajesVentana(usuarioId) {
    const cont = document.getElementById(`chatWinMsgs_${usuarioId}`);
    if (!cont) return;
    const msgs = getChatMensajes().filter(m =>
        (m.de === userLogueado.usuario && m.para === usuarioId) ||
        (m.de === usuarioId && m.para === userLogueado.usuario)
    );
    if (msgs.length === 0) {
        cont.innerHTML = '<div style="color:#555;font-size:12px;text-align:center;padding:20px;">¡Envía el primer mensaje!</div>';
        return;
    }
    const msgsArr = msgs;
    cont.innerHTML = msgsArr.map((m, idx) => {
        const esMio = m.de === userLogueado.usuario;
        const hora = new Date(m.timestamp).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'});
        let adjuntoHTML = '';
        if (m.adjunto) adjuntoHTML = renderAdjuntoHTML(m.adjunto, esMio);
        const textoHTML = m.texto ? `<div style="max-width:80%;background:${esMio?'var(--accent)':'rgba(255,255,255,0.08)'};color:#fff;padding:8px 12px;border-radius:${esMio?'14px 14px 3px 14px':'14px 14px 14px 3px'};font-size:12px;line-height:1.4;word-break:break-word;">${m.texto}</div>` : '';
        // Guardar datos del mensaje en array global para el botón reenviar
        if (!window._chatWinMsgCache) window._chatWinMsgCache = {};
        const cacheKey = `${usuarioId}_${idx}`;
        window._chatWinMsgCache[cacheKey] = { texto: m.texto || '', adjNombre: m.adjunto ? (m.adjunto.nombre || '') : '', adjunto: m.adjunto || null, uid: usuarioId, autorOriginal: m.autorOriginal || m.de || '' };
        const btnReenviar = `<button onclick="event.stopPropagation();reenviarMensajeCompleto(window._chatWinMsgCache['${cacheKey}'],'${usuarioId}')" title="Reenviar" style="background:transparent;border:none;color:rgba(255,255,255,0.25);font-size:15px;cursor:pointer;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:0.2s;" onmouseover="this.style.color='#ff2d55';this.style.background='rgba(255,45,85,0.15)'" onmouseout="this.style.color='rgba(255,255,255,0.25)';this.style.background='transparent'">↪</button>`;
        const nombreRemitente = !esMio ? (m.de || '') : '';
        const etiquetaReenviado = m.reenviado ? `<div style="font-size:9px;color:rgba(255,255,255,0.35);font-style:italic;margin-bottom:2px;">↪ Reenviado de ${m.autorOriginal || ''}</div>` : '';
        return `<div style="display:flex;flex-direction:row;align-items:flex-end;justify-content:${esMio?'flex-end':'flex-start'};margin-bottom:8px;gap:4px;">
            ${esMio ? btnReenviar : ''}
            <div style="display:flex;flex-direction:column;align-items:${esMio?'flex-end':'flex-start'};">
                ${etiquetaReenviado}
                ${adjuntoHTML}
                ${textoHTML}
                <div style="font-size:9px;color:#555;margin-top:2px;">${hora}</div>
            </div>
            ${!esMio ? btnReenviar : ''}
        </div>`;
    }).join('');
    cont.scrollTop = cont.scrollHeight;
}

function actualizarBadgesVentanas() {
    const msgs = getChatMensajes();
    Object.keys(ventanasAbiertas).forEach(uid => {
        const noLeidos = msgs.filter(m => m.para === userLogueado.usuario && m.de === uid && !m.leido).length;
        const badgeEl = document.getElementById(`chatWinBadge_${uid}`);
        if (badgeEl) {
            badgeEl.style.display = noLeidos > 0 ? 'inline-flex' : 'none';
            badgeEl.textContent = noLeidos;
        }
        // Actualizar punto de estado en tiempo real
        const dotEl = document.getElementById(`dotEstado_${uid}`);
        if (dotEl) {
            const enLinea = isUsuarioEnLinea(uid);
            dotEl.style.background = enLinea ? '#27ae60' : '#888';
            dotEl.style.boxShadow = enLinea ? '0 0 4px #27ae60' : 'none';
        }
        // Refrescar mensajes si ventana abierta y no minimizada
        if (ventanasAbiertas[uid] && !ventanasAbiertas[uid].minimizado) {
            renderMensajesVentana(uid);
        }
    });
    actualizarBadgeTotal();
}

function marcarLeidosVentana(usuarioId) {
    const msgs = getChatMensajes();
    msgs.forEach(m => {
        if (m.de === usuarioId && m.para === userLogueado.usuario) m.leido = true;
    });
    saveChatMensajes(msgs);
    actualizarBadgeTotal();
}

function enviarMensajeVentana(usuarioId) {
    const input = document.getElementById(`chatWinInput_${usuarioId}`);
    if (!input) return;
    const texto = input.value.trim();
    // Enviar adjuntos pendientes
    const adjs = window._chatWinAdjuntos && window._chatWinAdjuntos[usuarioId];
    if (adjs && adjs.length > 0) {
        adjs.forEach(adj => {
            const msgs = getChatMensajes();
            msgs.push({ de: userLogueado.usuario, para: usuarioId, texto: '', adjunto: adj, timestamp: Date.now(), leido: false });
            saveChatMensajes(msgs);
        });
        window._chatWinAdjuntos[usuarioId] = [];
        chatWinActualizarPreview(usuarioId);
    }
    if (texto) {
        const msgs = getChatMensajes();
        msgs.push({ id: `${userLogueado.usuario}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`, de: userLogueado.usuario, para: usuarioId, texto, timestamp: Date.now(), leido: false });
        saveChatMensajes(msgs);
    }
    if (!texto && (!adjs || adjs.length === 0)) return;
    input.value = '';
    renderMensajesVentana(usuarioId);
    marcarLeidosVentana(usuarioId);
}

function chatWinKeyDown(e, usuarioId) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviarMensajeVentana(usuarioId); }
}

// ── CHAT ASESOR (panel único, solo recibe / responde) ─────────────
async function abrirChatAsesor() {
    const panelAsesor = document.getElementById('chatPanel');
    panelAsesor.style.display = 'flex';

    // Recargar modos y mensajes desde Firebase ANTES de renderizar,
    // para que el estado abierto/cerrado sea siempre el actual
    if (window._fbCargar) {
        try {
            const modos = await window._fbCargar('usd_chat_modos');
            if (modos !== null) Storage.prototype.setItem.call(localStorage, 'usd_chat_modos', JSON.stringify(modos));
            const chatMsgs = await window._fbCargar('usd_chat_mensajes');
            if (chatMsgs !== null) Storage.prototype.setItem.call(localStorage, 'usd_chat_mensajes', JSON.stringify(chatMsgs));
        } catch(e) {}
    }

    renderListaContactosAsesor();
    const msgs = getChatMensajes();
    const _esSuperLect = userLogueado && ['supervisor1','supervisor2','capacitador','calidad'].includes(userLogueado.rol);
    const todosContactos = _esSuperLect
        ? usuarios.filter(u => u.usuario !== userLogueado.usuario)
        : usuarios.filter(u => esRolSuperior(u.rol));
    const remitentes = [...new Set(msgs.filter(m => m.para === userLogueado.usuario).map(m => m.de))];
    const contactosPrioritarios = todosContactos.filter(u => remitentes.includes(u.usuario));
    const primeraConversacion = contactosPrioritarios[0] || todosContactos[0];
    if (primeraConversacion) {
        abrirConversacionAsesor(primeraConversacion.usuario);
    } else {
        const todosAdmins = usuarios.filter(u => esRolSuperior(u.rol));
        if (todosAdmins.length > 0) {
            actualizarAreaRespuestaAsesor(todosAdmins[0].usuario);
        }
    }
    // Sincronizar estado del área de respuesta con el modo actual (ya con datos frescos de Firebase)
    const destActivo = document.getElementById('chatDestinatarioActivo');
    if (destActivo && destActivo.value) {
        actualizarAreaRespuestaAsesor(destActivo.value);
    }
    actualizarBadgeRobot();
    actualizarVisibilidadBotAsesor();
}

// Badge rojo sobre el botón robot (privados + grupo)
function actualizarBadgeRobot() {
    if (!userLogueado || ['admin','coordinador'].includes(userLogueado.rol)) return;
    const msgs = getChatMensajes();
    const noLeidosPrivados = msgs.filter(m => m.para === userLogueado.usuario && !m.leido).length;
    // Sumar mensajes no leídos del grupo
    const grupoMsgs = (typeof getGrupoMensajes === 'function') ? getGrupoMensajes() : [];
    const noLeidosGrupo = grupoMsgs.filter(m => m.de !== userLogueado.usuario && !m['leido_' + userLogueado.usuario]).length;
    const noLeidos = noLeidosPrivados + noLeidosGrupo;
    const badge = document.getElementById('btnChatRobotBadge');
    if (!badge) return;
    badge.style.display = noLeidos > 0 ? 'inline-flex' : 'none';
    badge.textContent = noLeidos;
}

// Borrar conversación — vista asesor
// Muestra u oculta el boton robot segun si el asesor tiene chat cerrado
function actualizarVisibilidadBotAsesor() {
    if (!userLogueado || ['admin','coordinador'].includes(userLogueado.rol)) return;
    const btn = document.getElementById('btnChatRobot');
    if (!btn) return;
    // Supervisores/calidad/capacitadores: siempre visible (ellos inician el chat)
    const _esSuperLect = ['supervisor1','supervisor2','capacitador','calidad'].includes(userLogueado.rol);
    if (_esSuperLect) { btn.style.display = 'flex'; return; }
    // Revisar si algun admin/super tiene chat ABIERTO con este asesor
    // La clave correcta es adminId_asesorId → usamos getModoParaAsesor(adminId, asesorId)
    const contactos = usuarios.filter(u => esRolSuperior(u.rol));
    const hayAlgunoAbierto = contactos.some(u => getModoParaAsesor(u.usuario, userLogueado.usuario) === 'abierto');
    // Si todos cerrados: ocultar boton, si hay abiertos: mostrar
    btn.style.display = hayAlgunoAbierto ? 'flex' : 'none';
    // Si el panel esta abierto → siempre actualizar el área de respuesta
    const panel = document.getElementById('chatPanel');
    if (panel && panel.style.display !== 'none') {
        const dest = document.getElementById('chatDestinatarioActivo');
        const destVal = dest ? dest.value : '';
        if (destVal && destVal !== '__grupo_usd__') {
            // Actualizar área de respuesta (muestra/oculta input o los 4 botones)
            actualizarAreaRespuestaAsesor(destVal);
        }
        // Si ya no hay ninguno abierto, cerrar el panel
        if (!hayAlgunoAbierto) {
            cerrarChatAsesor();
        }
    }
}

async function borrarConversacionAsesor() {
    const uid = document.getElementById('chatDestinatarioActivo').value;
    if (!uid) return;
    const ok = await confirmar({ titulo: '¿Borrar conversación?', msg: 'Se eliminarán todos los mensajes con este contacto.', icono: '🗑️', labelOk: 'Borrar', colorOk: '#e74c3c' });
    if (!ok) return;
    let msgs = getChatMensajes();
    msgs = msgs.filter(m => !((m.de === userLogueado.usuario && m.para === uid) || (m.de === uid && m.para === userLogueado.usuario)));
    // Guardar directo en localStorage y Firebase sin broadcast
    localStorage.setItem('usd_chat_mensajes', JSON.stringify(msgs));
    if (window._fbGuardar) await window._fbGuardar('usd_chat_mensajes', msgs);
    // Invalidar hash para forzar re-render limpio
    if (window._asesorHTMLHash) window._asesorHTMLHash[uid] = null;
    renderChatMensajesAsesor(uid);
    renderListaContactosAsesor();
    actualizarBadgeRobot();
}

// Borrar conversación — ventana messenger admin/super
async function borrarConversacionVentana(usuarioId) {
    const ok = await confirmar({ titulo: '¿Borrar conversación?', msg: 'Se eliminarán todos los mensajes con este contacto.', icono: '🗑️', labelOk: 'Borrar', colorOk: '#e74c3c' });
    if (!ok) return;
    let msgs = getChatMensajes();
    msgs = msgs.filter(m => !((m.de === userLogueado.usuario && m.para === usuarioId) || (m.de === usuarioId && m.para === userLogueado.usuario)));
    // Guardar en localStorage y Firebase directamente (sin broadcast para evitar restauración)
    localStorage.setItem('usd_chat_mensajes', JSON.stringify(msgs));
    if (window._fbGuardar) await window._fbGuardar('usd_chat_mensajes', msgs);
    renderMensajesVentana(usuarioId);
    renderListaContactos();
    actualizarBadgeTotal();
}

function toggleChatAsesor() {
    const panel = document.getElementById('chatPanel');
    if (panel && panel.style.display !== 'none') {
        cerrarChatAsesor();
    } else {
        abrirChatAsesor();
    }
}

function cerrarChatAsesor() {
    const panel = document.getElementById('chatPanel');
    if (panel) panel.style.display = 'none';
    // Limpiar destinatario activo y TODOS los hashes de render para reiniciar estado al reabrir
    const dest = document.getElementById('chatDestinatarioActivo');
    if (dest) dest.value = '';
    // Limpiar vistas de conversación para que no queden datos del usuario anterior
    const contMsgs = document.getElementById('chatMensajes');
    if (contMsgs) contMsgs.innerHTML = '';
    const contConv = document.getElementById('chatConversacion');
    if (contConv) contConv.style.display = 'none';
    const contBienvenida = document.getElementById('chatBienvenida');
    if (contBienvenida) contBienvenida.style.display = 'flex';
    // Resetear todos los hashes de render
    window._grupoAsesorHash = 0;
    window._chatAsesorHash  = 0;
    window._listaAsesorHash = 0;
    if (window._asesorHTMLHash) window._asesorHTMLHash = {};
}

function renderListaContactosAsesor() {
    const lista = document.getElementById('chatListaAsesor');
    if (!lista) return;
    const msgs = getChatMensajes();
    // Supervisores/calidad/capacitadores ven a todos excepto a sí mismos (asesores + admin + coordinador + entre ellos)
    // Asesores solo ven roles superiores
    const _esSupervisorLectura = userLogueado && ['supervisor1','supervisor2','capacitador','calidad'].includes(userLogueado.rol);
    let contactos;
    if (_esSupervisorLectura) {
        // Orden: admin/coordinador primero, luego sup/calidad/capacitador, luego asesores
        const todos = usuarios.filter(u => u.usuario !== userLogueado.usuario);
        contactos = [
            ...todos.filter(u => esRolAdmin(u.rol)),
            ...todos.filter(u => ['supervisor1','supervisor2','capacitador','calidad'].includes(u.rol)),
            ...todos.filter(u => esRolAsesor(u.rol)),
        ];
    } else {
        const todosContactos = usuarios.filter(u => esRolSuperior(u.rol));
        contactos = [
            ...todosContactos.filter(u => !esRolAsesor(u.rol) && (esRolAdmin(u.rol) || u.rol === 'supervisor1' || u.rol === 'supervisor2')),
            ...todosContactos.filter(u => u.rol === 'capacitador' || u.rol === 'calidad'),
        ];
    }
    const destActivo = document.getElementById('chatDestinatarioActivo');

    // Grupo USD siempre visible al inicio (habilitado o no)
    let grupoHTML = '';
    {
        const grupoEsActivo = isGrupoHabilitado();
        const grupoSeleccionado = destActivo && destActivo.value === '__grupo_usd__';
        const grupoMsgs = getGrupoMensajes();
        const noLeidosGrupo = grupoMsgs.filter(m => m.de !== userLogueado.usuario && !m['leido_' + userLogueado.usuario]).length;
        const badgeGrupo = noLeidosGrupo > 0 ? `<span style="background:var(--accent);color:#fff;border-radius:50%;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;padding:0 2px;">${noLeidosGrupo}</span>` : '';
        grupoHTML = `<div onclick="abrirConversacionGrupoAsesor()" style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;background:${grupoSeleccionado?'rgba(255,45,85,0.15)':'rgba(255,45,85,0.05)'};border-bottom:1px solid rgba(255,45,85,0.15);transition:0.15s;" onmouseover="this.style.background='rgba(255,45,85,0.12)'" onmouseout="this.style.background='${grupoSeleccionado?'rgba(255,45,85,0.15)':'rgba(255,45,85,0.05)'}'">
            <div style="position:relative;flex-shrink:0;">
                <div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,#ff2d55,#c0153a);display:flex;align-items:center;justify-content:center;font-size:14px;">👥</div>
                ${noLeidosGrupo > 0 ? `<span style="position:absolute;top:-5px;right:-5px;background:#ff2d55;color:#fff;border-radius:50%;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;padding:0 2px;border:2px solid #0f0f0f;">${noLeidosGrupo}</span>` : ''}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="font-size:11px;font-weight:${noLeidosGrupo>0?'900':'800'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#fff;">
                    GRUPO USD
                </div>
                ${grupoEsActivo
                    ? '<span style="font-size:9px;color:#27ae60;font-weight:700;">🔓 Abierto</span>'
                    : '<span style="font-size:9px;color:#e74c3c;font-weight:700;">🔒 Cerrado</span>'}
            </div>
        </div>`;
    }

    if (contactos.length === 0) {
        lista.innerHTML = '<div style="color:var(--textMuted);font-size:12px;padding:12px;text-align:center;">Sin contactos.</div>';
        return;
    }
    const nuevoHTML = grupoHTML + contactos.map(u => {
        const noLeidos = msgs.filter(m => m.de === u.usuario && m.para === userLogueado.usuario && !m.leido).length;
        const badge = noLeidos > 0 ? `<span style="background:var(--accent);color:#fff;border-radius:50%;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:800;padding:0 2px;">${noLeidos}</span>` : '';
        const modo = getModoParaAsesor(u.usuario, userLogueado.usuario);

        const foto = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
        const destActivo = document.getElementById('chatDestinatarioActivo');
        const esActivo = destActivo && destActivo.value === u.usuario;
        return `<div onclick="abrirConversacionAsesor('${u.usuario}')" style="display:flex;align-items:center;gap:8px;padding:8px 10px;cursor:pointer;background:${esActivo?'rgba(255,45,85,0.12)':'transparent'};border-bottom:1px solid rgba(255,255,255,0.05);transition:0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.07)'" onmouseout="this.style.background='${esActivo?'rgba(255,45,85,0.12)':'transparent'}'">
            <div style="position:relative;flex-shrink:0;">
                <img src="${foto}" style="width:30px;height:30px;border-radius:50%;object-fit:cover;border:2px solid var(--accent);" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'">
                ${noLeidos > 0 ? `<span style="position:absolute;top:-5px;right:-5px;background:#ff2d55;color:#fff;border-radius:50%;min-width:16px;height:16px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;padding:0 2px;border:2px solid #0f0f0f;">${noLeidos}</span>` : ''}
            </div>
            <div style="flex:1;min-width:0;">
                <div style="display:flex;align-items:center;justify-content:space-between;gap:4px;">
                    <div style="font-size:12px;font-weight:${noLeidos>0?'900':'700'};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${noLeidos>0?'#fff':'rgba(255,255,255,0.85)'};">
                        ${aNombrePropio(u.nombre).split(' ').slice(0,2).join(' ')}
                    </div>
                    ${noLeidos > 0 ? `<span style="background:var(--accent);color:#fff;border-radius:10px;min-width:16px;height:15px;display:inline-flex;align-items:center;justify-content:center;font-size:9px;font-weight:900;padding:0 3px;flex-shrink:0;">${noLeidos}</span>` : ''}
                </div>
            </div>
        </div>`;
    }).join('');
    if (!window._listaAsesorHash) window._listaAsesorHash = 0;
    const nuevoHashLista = _chatHash(nuevoHTML);
    if (window._listaAsesorHash !== nuevoHashLista) {
        window._listaAsesorHash = nuevoHashLista;
        lista.innerHTML = nuevoHTML;
    }
}

function abrirConversacionAsesor(usuarioId) {
    const u = usuarios.find(x => x.usuario === usuarioId);
    if (!u) return;

    // Limpiar INMEDIATAMENTE el contenido del chat anterior
    const contChat = document.getElementById('chatMensajes');
    if (contChat) contChat.innerHTML = '<div style="color:rgba(255,255,255,0.2);font-size:12px;text-align:center;padding:30px 20px;">Cargando...</div>';
    // Invalidar hash para forzar re-render completo
    if (window._asesorHTMLHash) window._asesorHTMLHash[usuarioId] = null;

    document.getElementById('chatDestinatarioActivo').value = usuarioId;
    document.getElementById('chatNombreActivo').textContent = aNombrePropio(u.nombre);
    document.getElementById('chatRolActivo').textContent = u.rol.toUpperCase();
    document.getElementById('chatFotoActivo').src = u.foto || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png';
    document.getElementById('chatConversacion').style.display = 'flex';
    document.getElementById('chatBienvenida').style.display = 'none';

    // Aplicar estado y mensajes inmediatamente
    actualizarAreaRespuestaAsesor(usuarioId);
    renderChatMensajesAsesor(usuarioId);

    // Luego recargar modos desde Firebase por si cambió
    (async () => {
        if (window._fbCargar) {
            try {
                const modos = await window._fbCargar('usd_chat_modos');
                if (modos !== null) Storage.prototype.setItem.call(localStorage, 'usd_chat_modos', JSON.stringify(modos));
                const msgs2 = await window._fbCargar('usd_chat_mensajes');
                if (msgs2 !== null) Storage.prototype.setItem.call(localStorage, 'usd_chat_mensajes', JSON.stringify(msgs2));
            } catch(e) {}
        }
        // Solo aplicar si el usuario activo sigue siendo el mismo
        const destActivo = document.getElementById('chatDestinatarioActivo');
        if (destActivo && destActivo.value === usuarioId) {
            actualizarAreaRespuestaAsesor(usuarioId);
            renderChatMensajesAsesor(usuarioId);
        }
    })();

    // Marcar leídos y refrescar badge + lista
    const msgs = getChatMensajes();
    msgs.forEach(m => { if (m.de === usuarioId && m.para === userLogueado.usuario) m.leido = true; });
    saveChatMensajes(msgs);
    actualizarBadgeRobot();
    renderListaContactosAsesor();
}

function renderChatMensajesAsesor(usuarioId) {
    const cont = document.getElementById('chatMensajes');
    if (!cont) return;
    // Actualizar dot de presencia del contacto activo
    const dot = document.getElementById('chatDotPresenciaActivo');
    if (dot) {
        const enLinea = isUsuarioEnLinea(usuarioId);
        dot.style.background = enLinea ? '#27ae60' : '#888';
        dot.style.boxShadow  = enLinea ? '0 0 4px #27ae60' : 'none';
    }
    const msgs = getChatMensajes().filter(m =>
        (m.de === userLogueado.usuario && m.para === usuarioId) ||
        (m.de === usuarioId && m.para === userLogueado.usuario)
    );
    if (msgs.length === 0) {
        const vacio = '<div style="color:rgba(255,255,255,0.2);font-size:12px;text-align:center;padding:30px 20px;">¡Inicia la conversación! 👋</div>';
        if (cont.innerHTML !== vacio) cont.innerHTML = vacio;
        return;
    }
    const nuevoHTML = msgs.map((m, idx) => {
        const esMio = m.de === userLogueado.usuario;
        const hora = new Date(m.timestamp).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'});
        // Renderizar adjunto si existe
        let adjuntoHTML = '';
        if (m.adjunto) {
            adjuntoHTML = renderAdjuntoHTML(m.adjunto, esMio);
        }
        const textoHTML = m.texto ? `<div style="max-width:240px;background:${esMio?'linear-gradient(135deg,#ff2d55,#c0153a)':'rgba(255,255,255,0.08)'};color:#fff;padding:9px 13px;border-radius:${esMio?'14px 14px 3px 14px':'14px 14px 14px 3px'};font-size:13px;line-height:1.5;word-break:break-word;">${m.texto}</div>` : '';
        if (!window._asesorMsgCache) window._asesorMsgCache = {};
        const cacheKey = `${usuarioId}_${idx}`;
        window._asesorMsgCache[cacheKey] = { texto: m.texto || '', adjNombre: m.adjunto ? (m.adjunto.nombre || '') : '', adjunto: m.adjunto || null, autorOriginal: m.autorOriginal || m.de || '' };
        const btnReenviar = `<button onclick="event.stopPropagation();reenviarMensajeAsesorCompleto(window._asesorMsgCache['${cacheKey}'])" title="Reenviar" style="background:transparent;border:none;color:rgba(255,255,255,0.25);font-size:15px;cursor:pointer;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:0.2s;" onmouseover="this.style.color='#ff2d55';this.style.background='rgba(255,45,85,0.15)'" onmouseout="this.style.color='rgba(255,255,255,0.25)';this.style.background='transparent'">↪</button>`;
        const nombreRemitenteAsesor = !esMio ? (m.de || '') : '';
        const etiquetaReenviadoAsesor = m.reenviado ? `<div style="font-size:9px;color:rgba(255,255,255,0.35);font-style:italic;margin-bottom:2px;">↪ Reenviado de ${m.autorOriginal || ''}</div>` : '';
        return `<div class="chat-msg-item" style="display:flex;flex-direction:row;align-items:flex-end;justify-content:${esMio?'flex-end':'flex-start'};margin-bottom:6px;gap:4px;">
            ${esMio ? btnReenviar : ''}
            <div style="display:flex;flex-direction:column;align-items:${esMio?'flex-end':'flex-start'};">
                ${etiquetaReenviadoAsesor}
                ${adjuntoHTML}
                ${textoHTML}
                <div style="font-size:10px;color:rgba(255,255,255,0.25);margin-top:3px;">${hora}</div>
            </div>
            ${!esMio ? btnReenviar : ''}
        </div>`;
    }).join('');
    const atBottom = cont.scrollHeight - cont.scrollTop - cont.clientHeight < 60;
    if (!window._asesorHTMLHash) window._asesorHTMLHash = {};
    const nuevoHashAsesor = _chatHash(nuevoHTML);
    if (window._asesorHTMLHash[usuarioId] !== nuevoHashAsesor) {
        window._asesorHTMLHash[usuarioId] = nuevoHashAsesor;
        cont.innerHTML = nuevoHTML;
        cont.scrollTop = cont.scrollHeight;
    } else if (atBottom) {
        cont.scrollTop = cont.scrollHeight;
    }
}


// ── HASH RÁPIDO PARA EVITAR PARPADEO EN RENDERS ──────────────────────────────
function _chatHash(str) {
    let h = 0;
    for (let i = 0; i < str.length; i++) { h = Math.imul(31, h) + str.charCodeAt(i) | 0; }
    return h;
}
// Almacén global de dataUrls para evitar romper atributos HTML inline
if (!window._chatDataUrls) window._chatDataUrls = [];
function _chatStoreDataUrl(dataUrl) {
    const idx = window._chatDataUrls.length;
    window._chatDataUrls.push(dataUrl);
    return idx;
}

function renderAdjuntoHTML(adjunto, esMio) {
    const bg = esMio ? 'rgba(255,45,85,0.15)' : 'rgba(255,255,255,0.07)';
    const border = esMio ? 'rgba(255,45,85,0.35)' : 'rgba(255,255,255,0.12)';
    const { tipo, nombre, dataUrl, tamaño } = adjunto;
    if (tipo && tipo.startsWith('image/')) {
        const idx = _chatStoreDataUrl(dataUrl);
        return `<div style="max-width:220px;border-radius:12px;overflow:hidden;border:1px solid ${border};">
            <div style="cursor:pointer;" onclick="chatVerImagen(window._chatDataUrls[${idx}])">
                <img src="${dataUrl}" style="width:100%;display:block;max-height:180px;object-fit:cover;" onerror="this.style.display='none'">
            </div>
            <div style="padding:5px 8px;background:${bg};display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-size:10px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📷 ${nombre}</span>
                <a href="${dataUrl}" download="${nombre}" title="Descargar imagen" onclick="event.stopPropagation()"
                   style="flex-shrink:0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:7px;padding:3px 8px;font-size:11px;color:#fff;text-decoration:none;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:4px;"
                   onmouseover="this.style.background='rgba(255,45,85,0.3)';this.style.borderColor='rgba(255,45,85,0.5)'"
                   onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='rgba(255,255,255,0.18)'">
                    ⬇️ <span style="font-size:10px;font-weight:700;">Descargar</span>
                </a>
            </div>
        </div>`;
    }
    if (tipo && tipo.startsWith('video/')) {
        // dataUrl ya es un Blob URL generado en _chatProcesarArchivoBase
        return `<div style="max-width:240px;border-radius:12px;overflow:hidden;border:1px solid ${border};">
            <video src="${dataUrl}" controls style="width:100%;max-height:160px;display:block;" preload="metadata"></video>
            <div style="padding:5px 8px;background:${bg};display:flex;align-items:center;justify-content:space-between;gap:6px;">
                <span style="font-size:10px;color:rgba(255,255,255,0.5);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">🎥 ${nombre}</span>
                <a href="${dataUrl}" download="${nombre}" title="Descargar video" onclick="event.stopPropagation()"
                   style="flex-shrink:0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:7px;padding:3px 8px;font-size:11px;color:#fff;text-decoration:none;cursor:pointer;transition:0.2s;display:flex;align-items:center;gap:4px;"
                   onmouseover="this.style.background='rgba(255,45,85,0.3)';this.style.borderColor='rgba(255,45,85,0.5)'"
                   onmouseout="this.style.background='rgba(255,255,255,0.1)';this.style.borderColor='rgba(255,255,255,0.18)'">
                    ⬇️ <span style="font-size:10px;font-weight:700;">Descargar</span>
                </a>
            </div>
        </div>`;
    }
    // Archivo genérico
    const iconos = { 'application/pdf':'📄', 'application/vnd.ms-excel':'📊', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':'📊', 'application/vnd.ms-powerpoint':'📊', 'application/vnd.openxmlformats-officedocument.presentationml.presentation':'📊', 'application/msword':'📝', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'📝', 'application/zip':'📦', 'text/plain':'📃', 'text/csv':'📊' };
    const icono = iconos[tipo] || '📎';
    const idx = _chatStoreDataUrl(dataUrl);
    return `<a href="${dataUrl}" download="${nombre}" style="max-width:220px;background:${bg};border:1px solid ${border};border-radius:12px;padding:10px 12px;display:flex;align-items:center;gap:10px;text-decoration:none;cursor:pointer;transition:0.2s;" onmouseover="this.style.background='rgba(255,45,85,0.2)'" onmouseout="this.style.background='${bg}'">
        <div style="font-size:26px;flex-shrink:0;">${icono}</div>
        <div style="min-width:0;flex:1;">
            <div style="font-size:12px;font-weight:700;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${nombre}</div>
            <div style="font-size:10px;color:rgba(255,255,255,0.35);">${tamaño} · Tap para descargar</div>
        </div>
        <div style="flex-shrink:0;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.18);border-radius:7px;padding:4px 8px;font-size:10px;color:#fff;font-weight:700;">⬇️</div>
    </a>`;
}


// Filtra un array de filas por jornada si el usuario es supervisor1/supervisor2
function filtrarPorJornada(filas, campoJornada) {
    const jornada = window._filtroJornada;
    if (!jornada) return filas;
    return filas.filter(fila => {
        const j = (fila[campoJornada] || fila['jornada'] || fila['Jornada'] || '').toString().toUpperCase().trim();
        return j === jornada || j === '';
    });
}

// Filtra asesores cuyo valor numérico está por debajo del promedio global de la lista
function filtrarBajoPromedio(filas, campoValor) {
    if (!window._filtroSolobajoPromedio) return filas;
    if (!filas || filas.length === 0) return filas;
    const vals = filas.map(f => parseFloat(f[campoValor] || 0)).filter(v => !isNaN(v));
    if (vals.length === 0) return filas;
    const promedio = vals.reduce((a, b) => a + b, 0) / vals.length;
    return filas.filter(f => {
        const v = parseFloat(f[campoValor] || 0);
        return !isNaN(v) && v < promedio;
    });
}
// ═══════════════════════════════════════════════════════
