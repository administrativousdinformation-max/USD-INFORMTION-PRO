async function _hashConSalt(password, usuarioId) {
    const buf = await crypto.subtle.digest(
        'SHA-256',
        new TextEncoder().encode(password + ':usd:' + usuarioId.toUpperCase())
    );
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

const _USUARIOS_BLOQUEADOS = ['ANDERSON.TORRES','JEFERSON.CASTAÑEDA'];
let usuarios = (function() {
    let saved = JSON.parse(localStorage.getItem('usuarios_usd'));
    if (!saved) return listaBase.filter(u => !_USUARIOS_BLOQUEADOS.includes(u.usuario));
    // Filtrar usuarios eliminados
    saved = saved.filter(u => !_USUARIOS_BLOQUEADOS.includes(u.usuario));
    // Sincronizar siempre los campos clave desde listaBase para evitar datos desactualizados
    let changed = false;
    saved = saved.map(u => {
        const base = listaBase.find(b => b.usuario === u.usuario);
        if (!base) return u;
        if (u.plataforma !== base.plataforma) { u.plataforma = base.plataforma || ""; changed = true; }
        if (u.grupo      !== base.grupo)      { u.grupo      = base.grupo      || ""; changed = true; }
        if (u.jornada    !== base.jornada)    { u.jornada    = base.jornada    || ""; changed = true; }
        if (u.rol        !== base.rol)        { u.rol        = base.rol;              changed = true; }
        if (u.password   !== base.password)   { u.password   = base.password;         changed = true; }
        return u;
    });
    // Agregar usuarios nuevos de listaBase que no estén en localStorage (solo si no están bloqueados)
    listaBase.forEach(base => {
        if (!_USUARIOS_BLOQUEADOS.includes(base.usuario) && !saved.find(u => u.usuario === base.usuario)) {
            saved.push({ ...base });
            changed = true;
        }
    });
    if (changed) localStorage.setItem('usuarios_usd', JSON.stringify(saved));
    return saved;
})();
window._usuariosGlobal = usuarios;
const _hojasDev_defaults = {
    "JULIAN.CUBILLOS":    { edad: "23", banco: "Nequi", cuenta: "3224210679" },
    "ALEJANDRO.PEÑA":     { edad: "22", banco: "Nequi", cuenta: "3016743004" },
};
const _hojasDev_saved = JSON.parse(localStorage.getItem('hojas_vida_usd')) || {};
// Merge: saved data takes priority, but fill missing fields from defaults
for (const [usr, defaults] of Object.entries(_hojasDev_defaults)) {
    if (!_hojasDev_saved[usr]) _hojasDev_saved[usr] = {};
    for (const [field, val] of Object.entries(defaults)) {
        if (!_hojasDev_saved[usr][field]) _hojasDev_saved[usr][field] = val;
    }
}
let hojasDev = _hojasDev_saved;
let datosAsis = [], datosPunt = [], userLogueado = null;
let miChart1 = null, miChart2 = null;

// CARGA DE COLORES AL INICIAR
const SESSION_KEY   = 'usd_session_user';
const INTENTOS_KEY  = 'usd_login_intentos';
const MAX_INTENTOS  = 3;

document.addEventListener("DOMContentLoaded", () => {
    // Navegación con teclado para galería de modelos
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('modalFotoModelo');
        if (!modal || modal.style.display === 'none') return;
        if (e.key === 'ArrowRight') navegarFotoModelo(1);
        else if (e.key === 'ArrowLeft') navegarFotoModelo(-1);
        else if (e.key === 'Escape') cerrarFotoModelo();
    });
    // Seguridad: si localStorage tiene datos corruptos, limpiar y usar listaBase
    try {
        const test = JSON.parse(localStorage.getItem('usuarios_usd'));
        if (test && (!Array.isArray(test) || test.length === 0)) {
            localStorage.removeItem('usuarios_usd');
            usuarios = listaBase;
            window._usuariosGlobal = usuarios;
        }
    } catch(e) {
        localStorage.removeItem('usuarios_usd');
        usuarios = listaBase;
        window._usuariosGlobal = usuarios;
    }

    // ── RESTAURAR SESIÓN AL REFRESCAR ────────────────────────────
    const _ocultarSplash = () => {
        const splash = document.getElementById('splashScreen');
        if (splash) {
            splash.style.transition = 'opacity 0.25s ease';
            splash.style.opacity = '0';
            setTimeout(() => splash.remove(), 260);
        }
    };
    try {
        const sesionGuardada = localStorage.getItem(SESSION_KEY);
        if (sesionGuardada) {
            const u = JSON.parse(sesionGuardada);
            // Buscar por usuario solamente (la sesión ya fue validada al hacer login)
            const uActual = listaBase.find(x => x.usuario === u.usuario)
                         || usuarios.find(x => x.usuario === u.usuario);
            if (uActual) {
                userLogueado = uActual;
                iniciarSesionCompleta();
                _ocultarSplash();
                const seccionGuardada = localStorage.getItem('usd_seccion_activa');
                if (seccionGuardada && document.getElementById('sec-' + seccionGuardada)) {
                    setTimeout(() => irA(seccionGuardada), 50);
                }
                return;
            } else {
                localStorage.removeItem(SESSION_KEY);
            }
        }
    } catch(e) {
        localStorage.removeItem(SESSION_KEY);
    }
    // Sin sesión activa: sincronizar intentos desde Firebase antes de mostrar login
    const _mostrarLogin = () => {
        document.getElementById('loginSection').style.display = 'flex';
        _ocultarSplash();
    };
    // Si Firebase está disponible, actualizar intentos desde la nube antes de mostrar el form
    // así si el admin desbloqueó, el asesor verá el form limpio al recargar
    if (window._fbCargar) {
        window._fbCargar(INTENTOS_KEY).then(fbData => {
            if (fbData !== null) {
                Storage.prototype.setItem.call(localStorage, INTENTOS_KEY, JSON.stringify(fbData));
            }
            _mostrarLogin();
        }).catch(_mostrarLogin);
    } else {
        // Firebase no listo aún — esperar el evento firebase-ready o mostrar tras 2s
        const _onFbReady = () => {
            if (window._fbCargar) {
                window._fbCargar(INTENTOS_KEY).then(fbData => {
                    if (fbData !== null) Storage.prototype.setItem.call(localStorage, INTENTOS_KEY, JSON.stringify(fbData));
                }).catch(() => {});
            }
        };
        window.addEventListener('firebase-ready', _onFbReady, { once: true });
        _mostrarLogin();
    }
    // ── FIN RESTAURAR SESIÓN ─────────────────────────────────────

    // Verificar si usuario bloqueado al cargar la página (para desactivar el botón si ya estaba bloqueado)
    const inputUser = document.getElementById('usuarioLogin');
    if (inputUser) {
        inputUser.addEventListener('input', () => {
            const u = inputUser.value.trim();
            const esAdmin = listaBase.find(x => String(x.usuario).trim() === u && esRolAdmin(x.rol))
                         || usuarios.find(x => String(x.usuario).trim() === u && esRolAdmin(x.rol));
            if (u && !esAdmin && esBloqueado(u)) {
                mostrarErrorLogin('🔒 Usuario bloqueado. Contacta al administrador.', 'bloqueado');
                document.getElementById("passLogin").disabled = true;
                document.querySelector(".btn-login-new").disabled = true;
                _iniciarPollingDesbloqueo();
            } else {
                limpiarErrorLogin();
                document.getElementById("passLogin").disabled = false;
                document.querySelector(".btn-login-new").disabled = false;
            }
        });
    }
    const savedColors = JSON.parse(localStorage.getItem('usd_theme_colors'));
    if(savedColors) {
        Object.keys(savedColors).forEach(key => {
            document.documentElement.style.setProperty(key, savedColors[key]);
        });
        if (savedColors['--fontFamily']) cfgCargarFuenteGoogle(savedColors['--fontFamily']);
    }
    // Cargar extras: forma de foto, animaciones, densidad tabla
    const extra = JSON.parse(localStorage.getItem('usd_theme_extra') || '{}');
    if (extra.photoShape) document.documentElement.style.setProperty('--photoRadius', extra.photoShape);
    if (extra.tableDensity) document.documentElement.style.setProperty('--tableRowPadding', extra.tableDensity);
    if (extra.animaciones === false) {
        const s = document.createElement('style'); s.id = 'animStyle';
        s.textContent = '.seccion, .glass-card { animation: none !important; }';
        document.head.appendChild(s);
    }
    // Cargar colores de plataforma guardados en los inputs de config
    const plats = ['AmoLatina','LatinMelodies','WishPark','Dream','TalkyTimes'];
    plats.forEach(plat => {
        const saved = localStorage.getItem('cfg_plat_color_' + plat);
        const el = document.getElementById('colorPlat_' + plat);
        if (saved && el) el.value = saved;
    });
});

// ── HELPERS DE SESIÓN Y BLOQUEO ─────────────────────────────────────────────
function getIntentos(usuario) {
    const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
    return data[usuario] || 0;
}
function setIntentos(usuario, n) {
    const data = JSON.parse(localStorage.getItem(INTENTOS_KEY) || '{}');
    data[usuario] = n;
    // Guardar localmente sin hook para evitar dependencia de timing
    Storage.prototype.setItem.call(localStorage, INTENTOS_KEY, JSON.stringify(data));
    // Subir a Firebase directamente o esperar a que est  listo
    function _subirIntentos() {
        if (window._fbGuardar) {
            window._fbGuardar(INTENTOS_KEY, data);
        }
    }
    if (window._fbReady) {
        _subirIntentos();
    } else {
        window.addEventListener('firebase-ready', _subirIntentos, { once: true });
    }
}
function esBloqueado(usuario) {
    return getIntentos(usuario) >= MAX_INTENTOS;
}
window.esBloqueado = esBloqueado;

function _iniciarPollingDesbloqueo() {
    if (window._pollingDesbloqueoActivo) return;
    window._pollingDesbloqueoActivo = true;
    const _poll = setInterval(() => {
        const loginSection = document.getElementById('loginSection');
        const inputPass    = document.getElementById('passLogin');
        if (!loginSection || loginSection.style.display === 'none' || !inputPass || !inputPass.disabled) {
            clearInterval(_poll); window._pollingDesbloqueoActivo = false; return;
        }
        const inputUser = document.getElementById('usuarioLogin');
        const usuario   = inputUser ? inputUser.value.trim() : '';
        if (!usuario) return;
        const revisar = (data) => {
            if (data) Storage.prototype.setItem.call(localStorage, INTENTOS_KEY, JSON.stringify(data));
            if (!esBloqueado(usuario)) {
                const btnLogin = document.querySelector('.btn-login-new');
                if (inputPass) inputPass.disabled = false;
                if (btnLogin)  btnLogin.disabled  = false;
                limpiarErrorLogin();
                clearInterval(_poll); window._pollingDesbloqueoActivo = false;
            }
        };
        if (window._fbCargar) window._fbCargar(INTENTOS_KEY).then(revisar).catch(() => revisar(null));
        else revisar(null);
    }, 5000);
}
window._iniciarPollingDesbloqueo = _iniciarPollingDesbloqueo;
function mostrarErrorLogin(msg, tipo) {
    // tipo: 'advertencia' | 'bloqueado' | 'error'
    const el = document.getElementById('loginErrorMsg');
    if (!el) return;
    const estilos = {
        advertencia: { bg: 'rgba(241,196,15,0.12)', border: '#f1c40f', color: '#f1c40f' },
        bloqueado:   { bg: 'rgba(231,76,60,0.14)',  border: '#e74c3c', color: '#e74c3c' },
        error:       { bg: 'rgba(231,76,60,0.10)',  border: '#e74c3c', color: '#e74c3c' }
    };
    const s = estilos[tipo] || estilos.error;
    el.style.cssText = `display:block;margin-top:14px;padding:12px 16px;border-radius:12px;font-size:13px;font-weight:700;text-align:center;max-width:320px;margin-left:auto;margin-right:auto;background:${s.bg};border:1px solid ${s.border};color:${s.color};`;
    el.innerHTML = msg;
}
function limpiarErrorLogin() {
    const el = document.getElementById('loginErrorMsg');
    if (el) el.style.display = 'none';
}
window.limpiarErrorLogin = limpiarErrorLogin;

function iniciarSesionCompleta() {
    // Guardar sesión en localStorage para persistir al refrescar
    localStorage.setItem(SESSION_KEY, JSON.stringify(userLogueado));

    document.getElementById("loginSection").style.display = "none";
    document.getElementById("mainPanel").style.display = "flex";
    // Chat: messenger para admin/coordinador, botón robot para asesores y roles de solo lectura
    const _rolesMessenger = ['admin', 'coordinador'];
    if (_rolesMessenger.includes(userLogueado.rol)) {
        document.getElementById("btnChatRobot").style.display = "none";
        iniciarMessenger();
    } else {
        document.getElementById("btnChatRobot").style.display = "flex";
        document.getElementById("messengerBar").style.display = "none";
        if (!window._chatInterval) {
            window._chatInterval = setInterval(() => {
                registrarPresencia(); // Heartbeat cada 2 segundos
                actualizarBadgeRobot();
                // Siempre actualizar visibilidad del botón robot (modo abierto/cerrado)
                actualizarVisibilidadBotAsesor && actualizarVisibilidadBotAsesor();
                const panel = document.getElementById('chatPanel');
                if (panel && panel.style.display !== 'none') {
                    const dest = document.getElementById('chatDestinatarioActivo').value;
                    if (dest) {
                        if (dest === '__grupo_usd__') {
                            renderMensajesGrupoAsesor();
                            actualizarInputGrupoAsesor();
                        } else {
                            renderChatMensajesAsesor(dest);
                            // Actualizar área de respuesta en tiempo real (detecta cambio abierto/cerrado)
                            actualizarAreaRespuestaAsesor(dest);
                            // Actualizar dot de presencia del contacto activo
                            const _dot = document.getElementById('chatDotPresenciaActivo');
                            if (_dot) {
                                const _enLinea = isUsuarioEnLinea(dest);
                                _dot.style.background = _enLinea ? '#27ae60' : '#888';
                                _dot.style.boxShadow  = _enLinea ? '0 0 4px #27ae60' : 'none';
                            }
                        }
                    }
                    renderListaContactosAsesor();
                }
            }, 1500);
        }
        actualizarBadgeRobot();
        registrarPresencia(); // Registrar presencia al iniciar sesión
    }

    // 1. Datos básicos del perfil lateral
    document.getElementById("sideNombre").innerText = `¡Hola, ${userLogueado.nombre.split(' ')[0]}!`;
    document.getElementById("sideCedula").innerText = `ID: ${userLogueado.usuario}`;
    document.getElementById("sideCargo").innerText = userLogueado.rol;
    document.getElementById("sideFoto").src = userLogueado.foto || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png";

    // 2. Construcción del Menú Dinámico con Separadores
    let menuHTML = '';
    if (userLogueado.rol === "admin") {
        // Admin: acceso total incluida Configuración
        menuHTML = `
            <div class="menu-separator"></div>
            <div class="menu-item" onclick="irA('comparativo')" style="position:relative;">📋 <span>Historial</span></div>
            <div class="menu-item" onclick="irA('indicadores')">📈 <span>Indicadores</span></div>
            <div class="menu-item" onclick="irA('resumen-contable')">🧾 <span>Resumen Contable</span></div>
            <div class="menu-item" onclick="irA('usuarios')">👤 <span>Personal</span></div>
            <div class="menu-item" onclick="irA('grupos')">👥 <span>Grupos</span></div>
            <div class="menu-item" onclick="irA('config')">⚙️ <span>Configuración</span></div>
        `;
        document.getElementById("sidebarUpload").style.display = "block";
        document.querySelector(".menu-item[onclick=\"irA('hoja-vida')\"]").style.display = "none";
        const mnNominaAdmin = document.getElementById('menuItemNomina');
        if (mnNominaAdmin) mnNominaAdmin.style.display = '';
        setTimeout(() => {
            const bl = document.getElementById('btnCargarNominaLabel');
            if (bl) bl.style.display = 'flex';
            const bd = document.getElementById('btnDiagNomina');
            if (bd) bd.style.display = '';
        }, 100);
    } else if (userLogueado.rol === "coordinador") {
        // Coordinador: solo vista, sin subir Excel ni banner
        menuHTML = `
            <div class="menu-separator"></div>
            <div class="menu-item" onclick="irA('comparativo')" style="position:relative;">📋 <span>Historial</span></div>
            <div class="menu-item" onclick="irA('indicadores')">📈 <span>Indicadores</span></div>
            <div class="menu-item" onclick="irA('resumen-contable')">🧾 <span>Resumen Contable</span></div>
            <div class="menu-item" onclick="irA('usuarios')">👤 <span>Personal</span></div>
            <div class="menu-item" onclick="irA('grupos')">👥 <span>Grupos</span></div>
        `;
        document.getElementById("sidebarUpload").style.display = "none";
        const mnNominaCoord = document.getElementById('menuItemNomina');
        if (mnNominaCoord) mnNominaCoord.style.display = '';
        setTimeout(() => {
            const bl = document.getElementById('btnCargarNominaLabel');
            if (bl) bl.style.display = 'none';
            const bd = document.getElementById('btnDiagNomina');
            if (bd) bd.style.display = 'none';
            // Ocultar botones de edición del historial (solo admin puede subir/borrar meses)
            const btnCargarExcel = document.getElementById('btnCargarExcelMesLabel');
            if (btnCargarExcel) btnCargarExcel.style.display = 'none';
            const btnBorrarMeses = document.getElementById('btnBorrarMesesHistorial');
            if (btnBorrarMeses) btnBorrarMeses.style.display = 'none';
            // Ocultar botón eliminar mes dentro de la tabla del historial (se aplica via CSS)
            const styleCoord = document.createElement('style');
            styleCoord.textContent = '.historial-btn-quitar { display: none !important; }';
            document.head.appendChild(styleCoord);
        }, 100);
    } else if (userLogueado.rol === "supervisor1" || userLogueado.rol === "supervisor2") {
        // Supervisores: solo lectura filtrada por su jornada
        window._filtroJornada = jornadaDeRol(userLogueado.rol);
        menuHTML = ``;
        document.getElementById("sidebarUpload").style.display = "none";
        const mnNominaSup = document.getElementById('menuItemNomina');
        if (mnNominaSup) mnNominaSup.style.display = '';
        // Supervisores no pueden silenciar chat privado, silenciar chat grupal,
        // cerrar el grupo ni borrar conversaciones
        window._rolSinControlChat = true;
    } else if (userLogueado.rol === "capacitador" || userLogueado.rol === "calidad") {
        // Analista de calidad / Formador: Inicio, Asistencia y Puntos (solo bajo promedio), Calidad, Ranking
        menuHTML = ``;
        document.getElementById("sidebarUpload").style.display = "none";
        // Ocultar Nómina
        const mnNomCal = document.getElementById('menuItemNomina');
        if (mnNomCal) mnNomCal.style.display = 'none';
        // Ocultar botones Exportar PDF de asistencia y puntos
        const btnExpAsisCal = document.getElementById('btnExportarAsistenciaPDF');
        if (btnExpAsisCal) btnExpAsisCal.style.display = 'none';
        const btnExpPuntosCal = document.getElementById('btnExportarPuntosPDF');
        if (btnExpPuntosCal) btnExpPuntosCal.style.display = 'none';
        // Filtro: solo asesores bajo el promedio
        window._filtroSolobajoPromedio = true;
        // Marcar que no puede bloquear/cerrar chats
        window._rolSinControlChat = true;
        // Solo ver asesores en ranking (ocultar tabs Por Plataforma y Por Jornada)
        setTimeout(() => {
            const tabPlat = document.getElementById('tabRankPlat');
            const tabJorn = document.getElementById('tabRankJorn');
            if (tabPlat) tabPlat.style.display = 'none';
            if (tabJorn) tabJorn.style.display = 'none';
        }, 200);
    } else {
        setTimeout(() => {
            const tabBtn = document.getElementById('tabPorAsesor');
            if (tabBtn) tabBtn.style.display = 'none';
            const tabPlat = document.getElementById('tabRankPlat');
            if (tabPlat) tabPlat.style.display = 'none';
        }, 200);
        menuHTML = `
            <div class="menu-separator"></div>
            <div class="menu-item" onclick="irA('mi-grupo')">👥 <span>Mi Grupo</span></div>
        `;
        document.getElementById("sidebarUpload").style.display = "none";
        document.body.classList.add("rol-asesor");
        // Nómina visible para asesor (solo sus datos)
        const mnNomina = document.getElementById('menuItemNomina');
        if (mnNomina) mnNomina.style.display = '';
        // Ocultar botón Exportar PDF de nómina para asesor
        const btnExpNomina = document.getElementById('btnExportarNominaPDF');
        if (btnExpNomina) btnExpNomina.style.display = 'none';
        // Ocultar botones Exportar PDF de asistencia y puntos para asesor
        const btnExpAsis = document.getElementById('btnExportarAsistenciaPDF');
        if (btnExpAsis) btnExpAsis.style.display = 'none';
        const btnExpPuntos = document.getElementById('btnExportarPuntosPDF');
        if (btnExpPuntos) btnExpPuntos.style.display = 'none';
    }
    document.getElementById("dynamicMenu").innerHTML = menuHTML;

    // ── CONTROL DE VISIBILIDAD DEL MENÚ ESTÁTICO POR ROL ─────────────────────
    (function() {
        const rol = userLogueado.rol;
        const mnAsistencia= document.querySelector(".menu-item[onclick=\"irA('asistencia')\"]");
        const mnPuntos    = document.querySelector(".menu-item[onclick=\"irA('puntos')\"]");
        const mnRanking   = document.querySelector(".menu-item[onclick=\"irA('ranking')\"]");
        const mnCalidad   = document.getElementById('menuItemCalidad');
        const mnNomina    = document.getElementById('menuItemNomina');
        const mnHV        = document.querySelector(".menu-item[onclick=\"irA('hoja-vida')\"]");

        const ocultarTodos = () => {
            [mnAsistencia, mnPuntos, mnRanking, mnCalidad, mnNomina, mnHV].forEach(el => { if(el) el.style.display = 'none'; });
        };

        if (rol === 'admin') {
            ocultarTodos();
            if(mnAsistencia) mnAsistencia.style.display = '';
            if(mnPuntos)     mnPuntos.style.display = '';
            if(mnRanking)    mnRanking.style.display = '';
            if(mnCalidad)    mnCalidad.style.display = '';
            if(mnNomina)     mnNomina.style.display = '';
        } else if (rol === 'coordinador') {
            ocultarTodos();
            if(mnAsistencia) mnAsistencia.style.display = '';
            if(mnPuntos)     mnPuntos.style.display = '';
            if(mnRanking)    mnRanking.style.display = '';
            if(mnCalidad)    mnCalidad.style.display = '';
            if(mnNomina)     mnNomina.style.display = '';
            if(mnHV)         mnHV.style.display = '';
        } else if (rol === 'supervisor1' || rol === 'supervisor2') {
            ocultarTodos();
            if(mnAsistencia) mnAsistencia.style.display = '';
            if(mnPuntos)     mnPuntos.style.display = '';
            if(mnRanking)    mnRanking.style.display = '';
            if(mnCalidad)    mnCalidad.style.display = '';
            if(mnNomina)     mnNomina.style.display = '';
            if(mnHV)         mnHV.style.display = '';
        } else if (rol === 'capacitador' || rol === 'calidad') {
            ocultarTodos();
            // Ocultar Asistencia para calidad y capacitador
            if(mnAsistencia) mnAsistencia.style.display = 'none';
            if(mnPuntos)     mnPuntos.style.display = '';
            if(mnRanking)    mnRanking.style.display = '';
            if(mnCalidad)    mnCalidad.style.display = '';
            if(mnHV)         mnHV.style.display = '';
        } else if (rol === 'asesor') {
            ocultarTodos();
            if(mnAsistencia) mnAsistencia.style.display = '';
            if(mnPuntos)     mnPuntos.style.display = '';
            if(mnRanking)    mnRanking.style.display = '';
            if(mnCalidad)    mnCalidad.style.display = '';
            if(mnHV)         mnHV.style.display = '';
            if(mnNomina)     mnNomina.style.display = '';
        }
    })();

    // 3. Cargar datos desde Firebase primero (garantiza que coordinadores y otros roles
    //    vean los datos subidos por el admin, incluso si su localStorage estaba vacio)
    function _finalizarInicioSesion() {
        const datosAsisSaved = localStorage.getItem('datos_asis_usd');
        const datosPuntSaved = localStorage.getItem('datos_punt_usd');
        if (datosAsisSaved) datosAsis = JSON.parse(datosAsisSaved);
        if (datosPuntSaved) datosPunt = JSON.parse(datosPuntSaved);

        if (datosAsis.length > 0 || datosPunt.length > 0) {
            const hoy = new Date().getDate();
            let totalAsis = 0, totalFaltas = 0, totalPuntos = 0;
            datosAsis.forEach(r => {
                const dia = parseInt(r['Dia'] || 0);
                if (dia > 0 && dia <= hoy) {
                    if (parseInt(r['Asistencia']) === 1) totalAsis++;
                    else totalFaltas++;
                }
            });
            datosPunt.forEach(r => { totalPuntos += parseFloat(r['Puntos'] || 0); });
            actualizarGraficas(totalAsis, totalFaltas, Math.round(totalPuntos));
            renderRanking();
            renderAsistencia();
            renderPuntos();
        }

        // 4. Carga de datos según permisos
        if (userLogueado.rol !== "asesor") renderListaUsuarios();
        renderHojaDeVida();
        if (datosAsis.length === 0 && datosPunt.length === 0) actualizarGraficas(0, 0);
        if (userLogueado.rol === 'asesor') renderMiGrupo();
        bannerInit();
    }

    // Recargar TODOS los datos desde Firebase antes de iniciar la UI
    // Esto garantiza que coordinadores/supervisores vean los datos del admin al instante
    const _clavesEsenciales = [
        'datos_asis_usd', 'datos_punt_usd', 'datos_nomina_usd', 'datos_contable_usd',
        'usd_ingresos_plataformas', 'usd_ingresos_egresos', 'usd_comparativo_meses',
        'usuarios_usd', 'grupos_usd'
    ];
    const _escr = (k, v) => v !== null && Storage.prototype.setItem.call(localStorage, k, JSON.stringify(v));
    if (window._fbCargar) {
        Promise.all(_clavesEsenciales.map(k => window._fbCargar(k).catch(() => null)))
            .then(valores => {
                _clavesEsenciales.forEach((k, i) => _escr(k, valores[i]));
                // Actualizar comparativoMeses desde Firebase usando helper robusto
                try { comparativoMeses = window._fbValToArray(valores[6]); } catch(e) {}
                _finalizarInicioSesion();
            })
            .catch(() => _finalizarInicioSesion());
    } else {
        _finalizarInicioSesion();
    }
}

// ── HELPERS DE ROLES ─────────────────────────────────────────────────────────
function esRolAdmin(rol)       { return rol === 'admin' || rol === 'coordinador'; }
function esRolCoord(rol)       { return rol === 'admin' || rol === 'coordinador'; }
function esRolSuperior(rol)    { return ['admin','coordinador','supervisor1','supervisor2','capacitador','calidad'].includes(rol); }
function esRolSup(rol)         { return ['supervisor1','supervisor2'].includes(rol); }
function esRolEditor(rol)      { return ['admin','coordinador','supervisor1','supervisor2','capacitador','calidad'].includes(rol); }
function esRolAsesor(rol)      { return rol === 'asesor'; }
function jornadaDeRol(rol)     { if(rol==='supervisor1') return 'MAÑANA'; if(rol==='supervisor2') return 'TARDE'; return null; }
// ─────────────────────────────────────────────────────────────────────────────

// ── FIN HELPERS DE SESIÓN ────────────────────────────────────────────────────

function cerrarSesion() {
    document.body.classList.remove("rol-asesor");
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('usd_seccion_activa');
    userLogueado = null;
    location.reload();
}

function login() {
    const u = document.getElementById("usuarioLogin").value.trim();
    const p = document.getElementById("passLogin").value.trim();

    limpiarErrorLogin();

    // Validar campos vacíos
    if (!u || !p) {
        mostrarErrorLogin('⚠️ Por favor ingresa tu usuario y contraseña.', 'error');
        return;
    }

    // Función async interna para poder usar await limpiamente
    async function _ejecutarLogin() {
        // Hashear con salt: hash(contraseña + ":usd:" + usuario)
        const pHashSalted  = await _hashConSalt(p, u);
        const pHashSinSalt = await _hashConSalt(p, ''); // hash simple para migración

        // Bloqueo aplica a TODOS los roles sin excepción (excepto admin)
        const _esAdminLogin = listaBase.find(x => String(x.usuario).trim().toUpperCase() === u.toUpperCase() && x.rol === 'admin')
                           || usuarios.find(x => String(x.usuario).trim().toUpperCase() === u.toUpperCase() && x.rol === 'admin');
        if (!_esAdminLogin && esBloqueado(u)) {
            mostrarErrorLogin('🔒 Usuario bloqueado por múltiples intentos fallidos.<br>Contacta al administrador.', 'bloqueado');
            document.getElementById("passLogin").disabled = true;
            document.querySelector(".btn-login-new").disabled = true;
            _iniciarPollingDesbloqueo();
            return;
        }

        // ── 1. Buscar con hash CON SALT (formato nuevo y seguro) ────────────
        userLogueado = listaBase.find(x =>
            String(x.usuario).trim().toUpperCase() === u.toUpperCase() &&
            String(x.password).trim() === pHashSalted
        ) || usuarios.find(x =>
            String(x.usuario).trim().toUpperCase() === u.toUpperCase() &&
            String(x.password).trim() === pHashSalted
        ) || null;

        // ── 2. Migración: hash SIN salt (formato viejo de listaBase) ────────
        if (!userLogueado) {
            // Calcular hash simple (SHA-256 sin salt) para compatibilidad con hashes existentes
            const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(p));
            const pHashViejo = Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');

            const candidato = listaBase.find(x =>
                String(x.usuario).trim().toUpperCase() === u.toUpperCase() &&
                String(x.password).trim() === pHashViejo
            ) || usuarios.find(x =>
                String(x.usuario).trim().toUpperCase() === u.toUpperCase() &&
                String(x.password).trim() === pHashViejo
            ) || null;

            if (candidato) {
                // Migrar al formato nuevo con salt
                const idxU = usuarios.findIndex(x => x.usuario === candidato.usuario);
                if (idxU !== -1) {
                    usuarios[idxU].password = pHashSalted;
                    localStorage.setItem('usuarios_usd', JSON.stringify(usuarios));
                    if (window._fbGuardar) window._fbGuardar('usuarios_usd', usuarios);
                }
                userLogueado = { ...candidato, password: pHashSalted };
            }
        }

        if (!userLogueado) {
            const intentosActuales = getIntentos(u) + 1;
            setIntentos(u, intentosActuales);
            const restantes = MAX_INTENTOS - intentosActuales;
            if (intentosActuales >= MAX_INTENTOS) {
                mostrarErrorLogin('🔒 <strong>Usuario bloqueado.</strong><br>Has superado el número máximo de intentos.<br>Contacta al administrador.', 'bloqueado');
                document.getElementById("passLogin").disabled = true;
                document.querySelector(".btn-login-new").disabled = true;
            } else {
                mostrarErrorLogin(`⚠️ Credenciales incorrectas.<br>Te queda${restantes === 1 ? '' : 'n'} <strong>${restantes} intento${restantes === 1 ? '' : 's'}</strong> antes del bloqueo.`, 'advertencia');
            }
            return;
        }

        // Login exitoso
        iniciarSesionCompleta();
    }
    _ejecutarLogin();
}

