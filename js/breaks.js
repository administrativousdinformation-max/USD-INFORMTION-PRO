//  MÓDULO DE BREAKS / PAUSAS
// ══════════════════════════════════════════════════════════════════
const BREAK_MAX_MS = 30 * 60 * 1000; // 30 minutos en ms
const BREAK_KEY    = 'usd_breaks_v1';

function getBreaks() {
    return JSON.parse(localStorage.getItem(BREAK_KEY) || '[]');
}
function saveBreaks(arr) {
    localStorage.setItem(BREAK_KEY, JSON.stringify(arr));
}

// Retorna el break activo del usuario logueado (si hay uno sin fin)
function getBreakActivo() {
    if (!userLogueado) return null;
    const breaks = getBreaks();
    return breaks.find(b => b.usuario === userLogueado.usuario && !b.fin) || null;
}

// Genera clave de fecha YYYY-MM-DD
function fechaHoy() {
    const d = new Date();
    // Usar fecha LOCAL (no UTC) para evitar desfase de zona horaria
    const anio = d.getFullYear();
    const mes  = String(d.getMonth() + 1).padStart(2, '0');
    const dia  = String(d.getDate()).padStart(2, '0');
    return `${anio}-${mes}-${dia}`;
}

// Tiempo usado en ms en el día actual por el usuario logueado
function tiempoBreakHoy() {
    if (!userLogueado) return 0;
    const hoy = fechaHoy();
    const breaks = getBreaks().filter(b => b.usuario === userLogueado.usuario && b.fecha === hoy);
    return breaks.reduce((s, b) => {
        const fin = b.fin || Date.now();
        return s + (fin - b.inicio);
    }, 0);
}

function iniciarBreak() {
    if (!userLogueado || userLogueado.rol !== 'asesor') return;
    if (getBreakActivo()) {
        toast('Ya tienes una pausa activa. Finalízala antes de iniciar otra.', 'warning');
        return;
    }
    const usado = tiempoBreakHoy();
    if (usado >= BREAK_MAX_MS) {
        toast('Ya usaste tus 30 minutos de pausa para hoy.', 'error');
        return;
    }
    const breaks = getBreaks();
    breaks.push({
        usuario: userLogueado.usuario,
        nombre: userLogueado.nombre,
        fecha: fechaHoy(),
        inicio: Date.now(),
        fin: null
    });
    saveBreaks(breaks);
    renderContadoresGeneral(); // refrescar tarjeta
    startBreakTimer();
}

function finalizarBreak() {
    if (!userLogueado) return;
    const breaks = getBreaks();
    const idx = breaks.findIndex(b => b.usuario === userLogueado.usuario && !b.fin);
    if (idx === -1) return;
    breaks[idx].fin = Date.now();
    saveBreaks(breaks);
    if (window._breakTimerInterval) {
        clearInterval(window._breakTimerInterval);
        window._breakTimerInterval = null;
    }
    renderContadoresGeneral();
}

function startBreakTimer() {
    if (window._breakTimerInterval) clearInterval(window._breakTimerInterval);
    window._breakTimerInterval = setInterval(() => {
        const el = document.getElementById('breakTimerDisplay');
        const barEl = document.getElementById('breakTimerBar');
        const b = getBreakActivo();
        if (!b) {
            clearInterval(window._breakTimerInterval);
            window._breakTimerInterval = null;
            renderContadoresGeneral();
            return;
        }
        const transcurrido = Date.now() - b.inicio;
        const usado = tiempoBreakHoy();
        const pct = Math.min(100, Math.round((usado / BREAK_MAX_MS) * 100));
        const restante = Math.max(0, BREAK_MAX_MS - usado);
        const mm = String(Math.floor(restante / 60000)).padStart(2,'0');
        const ss = String(Math.floor((restante % 60000) / 1000)).padStart(2,'0');
        const color = pct >= 90 ? '#e74c3c' : pct >= 60 ? '#f39c12' : '#27ae60';
        if (el) el.textContent = `${mm}:${ss}`;
        if (barEl) {
            barEl.style.width = pct + '%';
            barEl.style.background = color;
        }
        // Auto-fin si supera 30 min
        if (restante <= 0) {
            finalizarBreak();
            toast('⏰ Tu pausa de 30 minutos ha terminado automáticamente.', 'warning', 5000);
        }
    }, 1000);
}

// Genera HTML de la tarjeta pausa para el asesor
function renderTarjetaPausa() {
    const breakActivo = getBreakActivo();
    const usado = tiempoBreakHoy();
    const restante = Math.max(0, BREAK_MAX_MS - usado);
    const pct = Math.min(100, Math.round((usado / BREAK_MAX_MS) * 100));
    const color = pct >= 90 ? '#e74c3c' : pct >= 60 ? '#f39c12' : '#2980b9';
    const mm = String(Math.floor(restante / 60000)).padStart(2,'0');
    const ss = String(Math.floor((restante % 60000) / 1000)).padStart(2,'0');
    const usadoMin = Math.floor(usado / 60000);
    const usadoSec = Math.floor((usado % 60000) / 1000);
    const usadoStr = `${String(usadoMin).padStart(2,'0')}:${String(usadoSec).padStart(2,'0')}`;

    const agotado = restante <= 0;

    if (breakActivo) {
        // Break activo
        setTimeout(startBreakTimer, 100);
        return `
        <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(41,128,185,0.3);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,rgba(41,128,185,0.15),rgba(41,128,185,0.35));border-bottom:3px solid #2980b9;padding:20px 22px;display:flex;align-items:center;gap:14px;">
                <div style="width:54px;height:54px;border-radius:14px;background:#2980b9;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;box-shadow:0 4px 14px rgba(41,128,185,0.5);">⏸️</div>
                <div>
                    <div style="font-size:15px;font-weight:900;">BREAK</div>
                    <div style="font-size:11px;color:var(--textMuted);margin-top:2px;">Máximo 30 minutos</div>
                </div>
            </div>
            <div style="padding:20px 22px;text-align:center;">
                <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">⏱️ Tiempo Restante</div>
                <div id="breakTimerDisplay" style="font-size:58px;font-weight:900;color:#2980b9;line-height:1;margin:8px 0;font-variant-numeric:tabular-nums;">${mm}:${ss}</div>
                <div style="background:#2a2a2a;border-radius:8px;height:10px;overflow:hidden;margin:12px 0;">
                    <div id="breakTimerBar" style="background:${color};width:${pct}%;height:100%;border-radius:8px;transition:width 1s linear;"></div>
                </div>
                <div style="font-size:12px;color:var(--textMuted);margin-bottom:14px;">Usado: ${usadoStr} / 30:00</div>
                <button onclick="finalizarBreak()" style="background:#e74c3c;color:white;border:none;padding:12px 32px;border-radius:30px;cursor:pointer;font-weight:800;font-size:14px;transition:0.2s;width:100%;letter-spacing:0.5px;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                    ▶️ FINALIZAR BREAK
                </button>
            </div>
        </div>`;
    } else {
        // Sin break activo
        return `
        <div style="background:var(--panelBg);border-radius:18px;border:1px solid rgba(41,128,185,0.2);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.2);">
            <div style="background:linear-gradient(135deg,rgba(41,128,185,0.15),rgba(41,128,185,0.35));border-bottom:3px solid #2980b9;padding:20px 22px;display:flex;align-items:center;gap:14px;">
                <div style="width:54px;height:54px;border-radius:14px;background:#2980b9;display:flex;align-items:center;justify-content:center;font-size:26px;flex-shrink:0;box-shadow:0 4px 14px rgba(41,128,185,0.5);">☕</div>
                <div>
                    <div style="font-size:15px;font-weight:900;">BREAK</div>
                    <div style="font-size:11px;color:var(--textMuted);margin-top:2px;">Máximo 30 minutos por día</div>
                </div>
            </div>
            <div style="padding:20px 22px;text-align:center;">
                <div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">⏱️ Tiempo Disponible</div>
                <div style="font-size:58px;font-weight:900;color:${agotado ? '#e74c3c' : color};line-height:1;margin:8px 0;font-variant-numeric:tabular-nums;">${mm}:${ss}</div>
                <div style="background:#2a2a2a;border-radius:8px;height:10px;overflow:hidden;margin:12px 0;">
                    <div style="background:${color};width:${pct}%;height:100%;border-radius:8px;"></div>
                </div>
                <div style="font-size:12px;color:var(--textMuted);margin-bottom:14px;">Usado: ${usadoStr} / 30:00</div>
                ${agotado
                    ? `<div style="background:rgba(231,76,60,0.1);border:1px solid #e74c3c;border-radius:12px;padding:12px;color:#e74c3c;font-weight:700;font-size:13px;">⛔ Has agotado tu break de hoy</div>`
                    : `<button onclick="iniciarBreak()" style="background:#2980b9;color:white;border:none;padding:12px 32px;border-radius:30px;cursor:pointer;font-weight:800;font-size:14px;transition:0.2s;width:100%;letter-spacing:0.5px;" onmouseover="this.style.opacity='0.85'" onmouseout="this.style.opacity='1'">
                        ⏸️ INICIAR BREAK
                    </button>`
                }
            </div>
        </div>`;
    }
}

// ── SECCIÓN INDICADORES (admin / supervisor) ─────────────────────
function renderIndicadores() {
    const filtro = (document.getElementById('filtroFechaIndicadores') || {}).value || 'hoy';
    const hoy = fechaHoy();
    const ahora = new Date();

    let fechasValidas;
    if (filtro === 'hoy') {
        fechasValidas = new Set([hoy]);
    } else if (filtro === 'semana') {
        fechasValidas = new Set();
        for (let i = 0; i < 7; i++) {
            const d = new Date(ahora);
            d.setDate(d.getDate() - i);
            const a = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
            fechasValidas.add(`${a}-${m}-${dd}`);
        }
    } else {
        fechasValidas = new Set();
        const año = ahora.getFullYear(), mes = ahora.getMonth();
        const diasMes = new Date(año, mes + 1, 0).getDate();
        for (let i = 1; i <= diasMes; i++) {
            const d = new Date(año, mes, i);
            const a = d.getFullYear(), m = String(d.getMonth()+1).padStart(2,'0'), dd = String(d.getDate()).padStart(2,'0');
            fechasValidas.add(`${a}-${m}-${dd}`);
        }
    }

    const breaks = getBreaks().filter(b => fechasValidas.has(b.fecha));

    // Agrupar por usuario
    const porUsuario = {};
    breaks.forEach(b => {
        if (!porUsuario[b.usuario]) {
            porUsuario[b.usuario] = { nombre: b.nombre, sesiones: [] };
        }
        porUsuario[b.usuario].sesiones.push(b);
    });

    // Stats globales
    const totalAsesores = Object.keys(porUsuario).length;
    const totalSesiones = breaks.length;
    const totalMs = breaks.reduce((s, b) => s + ((b.fin || Date.now()) - b.inicio), 0);
    const totalMin = Math.floor(totalMs / 60000);
    const excedidos = Object.values(porUsuario).filter(u => {
        // agrupar por fecha
        const porFecha = {};
        u.sesiones.forEach(s => {
            if (!porFecha[s.fecha]) porFecha[s.fecha] = 0;
            porFecha[s.fecha] += (s.fin || Date.now()) - s.inicio;
        });
        return Object.values(porFecha).some(ms => ms > BREAK_MAX_MS);
    }).length;

    // Render stats
    const statsEl = document.getElementById('indicadoresStats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div class="glass-card" style="background:var(--panelBg);border-radius:14px;padding:16px 20px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;animation-delay:0s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:28px;">🧑‍💼</div>
                <div><div style="font-size:24px;font-weight:900;color:var(--accent);">${totalAsesores}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Asesores con pausa</div></div>
            </div>
            <div class="glass-card" style="background:var(--panelBg);border-radius:14px;padding:16px 20px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;animation-delay:0.08s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:28px;">☕</div>
                <div><div style="font-size:24px;font-weight:900;color:#f1c40f;">${totalSesiones}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Pausas registradas</div></div>
            </div>
            <div class="glass-card" style="background:var(--panelBg);border-radius:14px;padding:16px 20px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;animation-delay:0.16s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:28px;">⏱️</div>
                <div><div style="font-size:24px;font-weight:900;color:#3498db;">${totalMin}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Minutos totales</div></div>
            </div>
            <div class="glass-card" style="background:var(--panelBg);border-radius:14px;padding:16px 20px;border:1px solid rgba(255,255,255,0.08);display:flex;align-items:center;gap:12px;animation-delay:0.24s;transition:0.25s;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='0 10px 28px rgba(0,0,0,0.35)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="font-size:28px;">⚠️</div>
                <div><div style="font-size:24px;font-weight:900;color:#e74c3c;">${excedidos}</div><div style="font-size:11px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;">Excedieron 30 min</div></div>
            </div>`;
    }

    // Tabla
    const tablaEl = document.getElementById('indicadoresTabla');
    if (!tablaEl) return;

    if (Object.keys(porUsuario).length === 0) {
        tablaEl.innerHTML = `<div style="text-align:center;padding:40px;color:var(--textMuted);font-size:14px;">
            <div style="font-size:40px;margin-bottom:10px;">📭</div>
            Sin registros de pausas para el periodo seleccionado.
        </div>`;
        return;
    }

    // Agrupar usuarios por jornada
    const porJornada = {};
    Object.entries(porUsuario).forEach(([uid, data]) => {
        const uObj = usuarios.find(u => u.usuario === uid);
        const gj = uObj ? getGrupoJornada(uObj.nombre) : {};
        const jornada = (uObj && (uObj.jornada || gj.jornada) || 'SIN JORNADA').toUpperCase();
        if (!porJornada[jornada]) porJornada[jornada] = [];
        porJornada[jornada].push({ uid, data, uObj, gj });
    });

    const ordenJ = ['MAÑANA','TARDE','MADRUGADA','MADRUGADA'];
    const jornadasOrder = [...ordenJ.filter(j => porJornada[j]), ...Object.keys(porJornada).filter(j => !ordenJ.includes(j))];
    const jornadaCfgI = { 'TARDE':{color:'#3498db',icon:'🌆'}, 'MAÑANA':{color:'#27ae60',icon:'🌅'}, 'MADRUGADA':{color:'#9b59b6',icon:'🌙'}, 'ÚNICA':{color:'#e67e22',icon:'⭐'}, 'MADRUGADA':{color:'#e74c3c',icon:'🌃'}, 'SIN JORNADA':{color:'#888',icon:'🕐'} };

    let sectionsHTML = '';
    jornadasOrder.forEach(jornada => {
        const jCfg = jornadaCfgI[jornada] || {color:'#888', icon:'🕐'};
        const miembros = porJornada[jornada];

        const cards = miembros.map(({ uid, data, uObj, gj }) => {
            const foto = uObj ? (uObj.foto || '') : '';
            const plat = (uObj && uObj.plataforma) ? uObj.plataforma : '';
            const grupo = (uObj && (uObj.grupo || (gj && gj.grupo))) ? (uObj.grupo || gj.grupo) : '';
            const cfg = getPlatConfig(plat);

            // Agrupar sesiones por fecha
            const porFecha = {};
            data.sesiones.forEach(s => {
                if (!porFecha[s.fecha]) porFecha[s.fecha] = [];
                porFecha[s.fecha].push(s);
            });

            // Total general del usuario
            const msGlobal = data.sesiones.reduce((s, b) => s + ((b.fin || Date.now()) - b.inicio), 0);
            const minGlobal = Math.floor(msGlobal / 60000);
            const secGlobal = Math.floor((msGlobal % 60000) / 1000);
            const tiempoGlobal = `${String(minGlobal).padStart(2,'0')}:${String(secGlobal).padStart(2,'0')}`;
            const excedeGlobal = data.sesiones.some(s => {
                const pF = {};
                data.sesiones.forEach(b => { if (!pF[b.fecha]) pF[b.fecha] = 0; pF[b.fecha] += (b.fin || Date.now()) - b.inicio; });
                return Object.values(pF).some(ms => ms > BREAK_MAX_MS);
            });
            const hayActivo = data.sesiones.some(b => !b.fin);
            const pctGlobal = Math.min(100, Math.round((msGlobal / BREAK_MAX_MS) * 100));
            const barColorG = excedeGlobal ? '#e74c3c' : pctGlobal >= 70 ? '#f39c12' : '#27ae60';

            // Filas de fechas detalladas
            const fechasHTML = Object.entries(porFecha).sort((a,b) => b[0].localeCompare(a[0])).map(([fecha, sesiones]) => {
                const msF = sesiones.reduce((s, b) => s + ((b.fin || Date.now()) - b.inicio), 0);
                const minF = Math.floor(msF / 60000);
                const secF = Math.floor((msF % 60000) / 1000);
                const tiempoF = `${String(minF).padStart(2,'0')}:${String(secF).padStart(2,'0')}`;
                const excedeF = msF > BREAK_MAX_MS;
                const pctF = Math.min(100, Math.round((msF / BREAK_MAX_MS) * 100));
                const barF = excedeF ? '#e74c3c' : pctF >= 70 ? '#f39c12' : '#27ae60';
                const activaF = sesiones.some(b => !b.fin);

                const sesList = sesiones.map((s, si) => {
                    const ini = new Date(s.inicio).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'});
                    const fin = s.fin ? new Date(s.fin).toLocaleTimeString('es-CO', {hour:'2-digit', minute:'2-digit'}) : '—';
                    const dur = s.fin ? Math.floor((s.fin - s.inicio) / 60000) + ' min' : '🟡 Activa';
                    return `<div style="display:flex;align-items:center;gap:6px;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.03);font-size:11px;color:var(--textMuted);">
                        <span style="color:var(--accent);font-weight:700;">↳ S${si+1}</span>
                        <span>${ini}</span><span style="color:var(--textMuted);">→</span><span>${fin}</span>
                        <span style="margin-left:auto;font-weight:600;">${dur}</span>
                    </div>`;
                }).join('');

                return `<div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px 10px;margin-bottom:6px;border:1px solid rgba(255,255,255,0.05);">
                    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                        <span style="font-size:11px;color:var(--textMuted);font-weight:700;">📅 ${fecha}</span>
                        <div style="display:flex;align-items:center;gap:6px;">
                            <span style="font-size:13px;font-weight:800;color:${barF};font-variant-numeric:tabular-nums;">${tiempoF}</span>
                            ${activaF ? '<span style="background:rgba(241,196,15,0.15);color:#f1c40f;border:1px solid #f1c40f55;border-radius:6px;padding:1px 6px;font-size:9px;font-weight:700;">EN PAUSA</span>' : ''}
                            ${excedeF ? '<span style="background:rgba(231,76,60,0.15);color:#e74c3c;border:1px solid #e74c3c55;border-radius:6px;padding:1px 6px;font-size:9px;font-weight:700;">⚠️ EXCEDE</span>' : ''}
                        </div>
                    </div>
                    <div style="background:#2a2a2a;border-radius:4px;height:4px;overflow:hidden;margin-bottom:6px;">
                        <div style="background:${barF};width:${pctF}%;height:100%;border-radius:4px;transition:width 0.4s;"></div>
                    </div>
                    <div style="display:flex;flex-direction:column;gap:3px;">${sesList}</div>
                </div>`;
            }).join('');

            return `<div style="background:var(--panelBg);border-radius:14px;border:1px solid rgba(255,255,255,0.08);overflow:hidden;transition:0.2s;" onmouseover="this.style.transform='translateY(-2px)';this.style.boxShadow='0 6px 20px rgba(0,0,0,0.25)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
                <div style="background:linear-gradient(135deg,${jCfg.color}15,${jCfg.color}30);border-bottom:2px solid ${jCfg.color};padding:12px 14px;display:flex;align-items:center;gap:10px;">
                    <img src="${foto}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:2px solid ${jCfg.color};flex-shrink:0;">
                    <div style="flex:1;min-width:0;">
                        <div style="font-size:13px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${aNombrePropio(data.nombre)}</div>
                        <div style="display:flex;gap:4px;margin-top:3px;flex-wrap:wrap;">
                            ${plat ? `<span style="background:${cfg.color};color:#fff;border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">${plat}</span>` : ''}
                            ${grupo ? `<span style="background:rgba(255,255,255,0.08);color:var(--textMuted);border-radius:8px;padding:1px 7px;font-size:10px;font-weight:700;">👥 ${grupo}</span>` : ''}
                        </div>
                    </div>
                    <div style="text-align:center;flex-shrink:0;">
                        <div style="font-size:20px;font-weight:900;color:${barColorG};line-height:1;font-variant-numeric:tabular-nums;">${tiempoGlobal}</div>
                        <div style="font-size:9px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Total</div>
                    </div>
                </div>
                <div style="padding:10px 14px;">
                    <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;padding-bottom:8px;border-bottom:1px solid rgba(255,255,255,0.06);">
                        <div style="flex:1;background:#2a2a2a;border-radius:6px;height:6px;overflow:hidden;">
                            <div style="background:${barColorG};width:${pctGlobal}%;height:100%;border-radius:6px;"></div>
                        </div>
                        <span style="font-size:10px;color:${barColorG};font-weight:700;">${pctGlobal}% usado</span>
                        ${hayActivo ? '<span style="background:rgba(241,196,15,0.15);color:#f1c40f;border:1px solid #f1c40f55;border-radius:6px;padding:1px 6px;font-size:9px;font-weight:700;">🟡 EN PAUSA</span>' : ''}
                        ${excedeGlobal ? '<span style="background:rgba(231,76,60,0.15);color:#e74c3c;border:1px solid #e74c3c55;border-radius:6px;padding:1px 6px;font-size:9px;font-weight:700;">⚠️ EXCEDE</span>' : ''}
                    </div>
                    <div style="display:flex;flex-direction:column;gap:2px;">${fechasHTML}</div>
                </div>
            </div>`;
        }).join('');

        const totalJornada = miembros.length;
        sectionsHTML += `
        <div style="margin-bottom:28px;">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:14px;padding-bottom:8px;border-bottom:2px solid ${jCfg.color}44;">
                <span style="font-size:18px;">${jCfg.icon}</span>
                <span style="font-size:14px;font-weight:800;text-transform:uppercase;letter-spacing:1px;color:${jCfg.color};">Jornada ${jornada}</span>
                <span style="background:${jCfg.color}22;color:${jCfg.color};border:1px solid ${jCfg.color}55;border-radius:10px;padding:2px 9px;font-size:11px;font-weight:700;">${totalJornada} asesor${totalJornada!==1?'es':''}</span>
            </div>
            <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px;">${cards}</div>
        </div>`;
    });

    tablaEl.innerHTML = sectionsHTML;
}

window.renderTarjetaPausa = renderTarjetaPausa;
function exportarBreaksExcel() {
    const breaks = getBreaks();
    if (breaks.length === 0) { toast('Sin registros de pausas para exportar.', 'warning'); return; }
    const rows = breaks.map(b => ({
        Usuario: b.usuario,
        Nombre: aNombrePropio(b.nombre),
        Fecha: b.fecha,
        Inicio: new Date(b.inicio).toLocaleTimeString('es-CO'),
        Fin: b.fin ? new Date(b.fin).toLocaleTimeString('es-CO') : 'Activa',
        DuraciónMin: b.fin ? Math.round((b.fin - b.inicio) / 60000) : 'N/A'
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Breaks');
    XLSX.writeFile(wb, 'Breaks_USD_' + fechaHoy() + '.xlsx');
}

// ── REINICIAR BREAK DE UN ASESOR (solo admin/supervisor) ─────────────────────
function abrirModalReiniciarBreak() {
    const asesoresConBreak = usuarios.filter(u => u.rol === 'asesor').map(u => {
        const breaks = getBreaks();
        const activo = breaks.find(b => b.usuario === u.usuario && !b.fin);
        const hoy = fechaHoy();
        const msHoy = breaks.filter(b => b.usuario === u.usuario && b.fecha === hoy)
            .reduce((s, b) => s + ((b.fin || Date.now()) - b.inicio), 0);
        return { u, activo, msHoy };
    }).filter(x => x.activo || x.msHoy > 0);

    const opciones = asesoresConBreak.length > 0
        ? asesoresConBreak.map(({ u, activo, msHoy }) => {
            const min = Math.floor(msHoy / 60000);
            const sec = Math.floor((msHoy % 60000) / 1000);
            const estado = activo ? '🟡 EN PAUSA' : '✅ Finalizado';
            return `<div onclick="reiniciarBreakAsesor('${u.usuario}','${aNombrePropio(u.nombre).replace(/'/g,"\\'")}',this)"
                style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(255,255,255,0.04);border-radius:10px;border:1px solid rgba(255,255,255,0.07);cursor:pointer;transition:0.2s;margin-bottom:6px;"
                onmouseover="this.style.background='rgba(241,196,15,0.1)';this.style.borderColor='rgba(241,196,15,0.3)'"
                onmouseout="this.style.background='rgba(255,255,255,0.04)';this.style.borderColor='rgba(255,255,255,0.07)'">
                <img src="${u.foto||'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}" onerror="this.src='https://cdn-icons-png.flaticon.com/512/3135/3135715.png'" style="width:36px;height:36px;border-radius:50%;object-fit:cover;border:2px solid rgba(241,196,15,0.5);flex-shrink:0;">
                <div style="flex:1;min-width:0;">
                    <div style="font-size:13px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(u.nombre)}</div>
                    <div style="font-size:11px;color:var(--textMuted);">Usado hoy: ${String(min).padStart(2,'0')}:${String(sec).padStart(2,'0')} · ${estado}</div>
                </div>
                <span style="font-size:11px;font-weight:700;color:#f1c40f;">🔄 Reiniciar</span>
            </div>`;
        }).join('')
        : `<div style="text-align:center;padding:30px;color:var(--textMuted);font-size:13px;">📭 Ningún asesor tiene break activo o registrado hoy.</div>`;

    confirmar({
        titulo: '🔄 Reiniciar Break de Asesor',
        msg: '',
        icono: '⏱️',
        labelOk: 'Cerrar',
        labelCancel: '',
        colorOk: 'rgba(255,255,255,0.1)'
    });

    // Inyectar contenido custom en el modal de confirmación
    setTimeout(() => {
        const msgEl = document.getElementById('confirm-msg');
        const btnsEl = document.getElementById('confirm-btns');
        const cancelBtn = document.getElementById('btn-confirm-cancel');
        if (cancelBtn) cancelBtn.style.display = 'none';
        if (msgEl) msgEl.innerHTML = `
            <div style="font-size:12px;color:var(--textMuted);margin-bottom:10px;text-align:left;">Selecciona el asesor cuyo break quieres reiniciar (se borrará su registro de hoy):</div>
            <div style="max-height:300px;overflow-y:auto;">${opciones}</div>`;
    }, 0);
}

function reiniciarBreakAsesor(usuarioId, nombreAsesor, elEl) {
    const breaks = getBreaks();
    const hoy = fechaHoy();
    const nuevosBreaks = breaks.filter(b => !(b.usuario === usuarioId && b.fecha === hoy));
    saveBreaks(nuevosBreaks);
    if (window._fbGuardar) window._fbGuardar(BREAK_KEY, nuevosBreaks);
    renderIndicadores();
    // Feedback visual en el item
    if (elEl) {
        elEl.style.background = 'rgba(39,174,96,0.15)';
        elEl.style.borderColor = 'rgba(39,174,96,0.4)';
        elEl.querySelector('span:last-child').textContent = '✅ Reiniciado';
    }
    toast(`Break de ${nombreAsesor} reiniciado correctamente.`, 'success');
}
window.reiniciarBreakAsesor = reiniciarBreakAsesor;
// ── FIN REINICIAR BREAK ───────────────────────────────────────────────────────

