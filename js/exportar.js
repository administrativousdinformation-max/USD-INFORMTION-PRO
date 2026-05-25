// ══════════════════════════════════════════════════════════════════
//  EXPORTAR PDF — Asistencia
// ══════════════════════════════════════════════════════════════════
function exportarAsistenciaPDF() {
    const titulo = 'Reporte de Asistencia — ' + new Date().toLocaleDateString('es-CO', {month:'long', year:'numeric'});
    _abrirVentanaPDF('graficasAsistencia', titulo);
}

// ══════════════════════════════════════════════════════════════════
//  EXPORTAR PDF — Nómina
// ══════════════════════════════════════════════════════════════════
function exportarNominaPDF() {
    const titulo = 'Reporte de Nómina — ' + new Date().toLocaleDateString('es-CO', {month:'long', year:'numeric'});
    _abrirVentanaPDF('nominaContenido', titulo);
}

function exportarPuntosPDF() {
    const titulo = 'Reporte de Puntos — ' + new Date().toLocaleDateString('es-CO', {month:'long', year:'numeric'});
    _abrirVentanaPDF('tablaPuntos', titulo);
}

function _abrirVentanaPDF(seccionId, titulo) {
    const contenido = document.getElementById(seccionId);
    if (!contenido || !contenido.innerHTML.trim() || contenido.innerHTML.includes('Carga el archivo')) {
        _showPDFToast('No hay datos para exportar. Carga el archivo Excel primero.', 'warning');
        return;
    }
    const estilos = Array.from(document.styleSheets)
        .map(ss => { try { return Array.from(ss.cssRules).map(r => r.cssText).join('\n'); } catch(e) { return ''; } })
        .join('\n');

    const ventana = window.open('', '_blank', 'width=900,height=700');
    if (!ventana) { _showPDFToast('Permite ventanas emergentes para exportar el PDF.', 'warning'); return; }

    // Obtener variables CSS actuales del tema
    const rootStyles = getComputedStyle(document.documentElement);
    const bgMain  = rootStyles.getPropertyValue('--bgMain').trim()  || '#121212';
    const panelBg = rootStyles.getPropertyValue('--panelBg').trim() || '#1e1e1e';
    const textMain= rootStyles.getPropertyValue('--textMain').trim()|| '#ffffff';
    const accent  = rootStyles.getPropertyValue('--accent').trim()  || '#ff2d55';

    ventana.document.write(`<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>${titulo}</title>
<style>
:root {
    --bgMain: ${bgMain};
    --panelBg: ${panelBg};
    --textMain: ${textMain};
    --accent: ${accent};
    --bgSidebar: #1a1a1a;
    --borderRadius: 15px;
    --cardOpacity: 1;
    --tableHeaderColor: #a0a0a0;
    --tableBorderColor: rgba(255,255,255,0.1);
    --tableRowHover: rgba(255,255,255,0.04);
    --tableRowPadding: 10px;
    --cardPadding: 20px;
    --fontFamily: 'Segoe UI', sans-serif;
}
${estilos}
* { box-sizing: border-box; }
body {
    background: ${bgMain};
    color: ${textMain};
    font-family: 'Segoe UI', sans-serif;
    margin: 0;
    padding: 24px;
}
.pdf-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 2px solid ${accent};
    padding-bottom: 14px;
    margin-bottom: 24px;
}
.pdf-header h1 { margin: 0; font-size: 1.3rem; color: ${textMain}; }
.pdf-header .pdf-meta { font-size: 11px; color: #888; text-align: right; }
@media print {
    body { padding: 0; }
    .pdf-header { page-break-after: avoid; }
    button { display: none !important; }
}
canvas { max-width: 100% !important; }
table { width: 100%; border-collapse: collapse; color: ${textMain}; font-size: 11px; }
table th { text-align: left; color: #a0a0a0; padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.1); font-size: 11px; }
table td { padding: 8px; border-bottom: 1px solid rgba(255,255,255,0.07); font-size: 11px; }
</style>
</head>
<body>
<div class="pdf-header">
    <h1>📊 ${titulo}</h1>
    <div class="pdf-meta">
        <div><strong>USDINFORMATION</strong></div>
        <div>${new Date().toLocaleString('es-CO')}</div>
        <button onclick="window.print()" style="margin-top:8px;background:#ff2d55;color:#fff;border:none;padding:7px 18px;border-radius:8px;cursor:pointer;font-weight:700;font-size:12px;">🖨️ Imprimir / Guardar PDF</button>
    </div>
</div>
${contenido.innerHTML}
<\/script>
</body></html>`);
    ventana.document.close();
    _showPDFToast('Ventana de impresión lista. Usa "Guardar como PDF" en la impresora.', 'success');
}

function _showPDFToast(msg, tipo) {
    if (typeof toast === 'function') { toast(msg, tipo, 4000); return; }
    alert(msg);
}

// ══════════════════════════════════════════════════════════════════
//  MINI-GRÁFICAS DE TENDENCIA (Sparklines) — Dashboard Admin
//  Se inyectan en las tarjetas del home mostrando últimos 7 días
// ══════════════════════════════════════════════════════════════════

// Guarda referencias para no recrear infinitamente
const _sparklineCharts = {};

function renderSparklines() {
    // Solo admin/supervisor y cuando hay datos
    if (!userLogueado || userLogueado.rol === 'asesor') return;
    if (!datosAsis || datosAsis.length === 0) return;

    const hoy = new Date().getDate();
    const ultimos7 = Array.from({ length: 7 }, (_, i) => Math.max(1, hoy - 6 + i));

    // ── Sparkline asistencia: % diario de los últimos 7 días ──
    const nombresAsis = [...new Set(datosAsis.map(r => r['Nombre']))];
    const datosUltimos7Asis = ultimos7.map(dia => {
        let asistidos = 0, total = 0;
        nombresAsis.forEach(nombre => {
            const fila = datosAsis.find(r => r['Nombre'] === nombre && parseInt(r['Dia']) === dia);
            if (!fila) return;
            const v = parseInt(fila['Asistencia']);
            if (v === 1 || v === -1) { total++; if (v === 1) asistidos++; }
        });
        return total > 0 ? Math.round((asistidos / total) * 100) : null;
    });

    // ── Sparkline puntos: total diario últimos 7 días ──
    const datosUltimos7Puntos = ultimos7.map(dia => {
        return datosPunt
            .filter(r => {
                const d = parseInt(r['Dia'] || r['dia'] || 0);
                return d === dia;
            })
            .reduce((s, r) => s + (parseFloat(r['Puntos'] || r['puntos'] || 0) || 0), 0);
    });

    // Inyectar sparklines en las tarjetas correspondientes
    _insertarSparkline('sparkline-asistencia', datosUltimos7Asis, '#27ae60', '%', ultimos7);
    _insertarSparkline('sparkline-puntos', datosUltimos7Puntos, '#ff2d55', 'pts', ultimos7);
}

function _insertarSparkline(containerId, data, color, unidad, labels) {
    const el = document.getElementById(containerId);
    if (!el) return;

    // Destruir chart anterior si existe
    if (_sparklineCharts[containerId]) {
        try { _sparklineCharts[containerId].destroy(); } catch(e) {}
        delete _sparklineCharts[containerId];
    }

    const canvas = document.createElement('canvas');
    canvas.width  = el.offsetWidth || 200;
    canvas.height = 52;
    canvas.style.cssText = 'width:100%;height:52px;display:block;';
    el.innerHTML = '';
    el.appendChild(canvas);

    const datosLimpios = data.map(v => v === null ? undefined : v);
    const hasData = datosLimpios.some(v => v !== undefined);
    if (!hasData) {
        el.innerHTML = '<div style="font-size:10px;color:rgba(255,255,255,0.2);text-align:center;padding:16px 0;">Sin datos</div>';
        return;
    }

    _sparklineCharts[containerId] = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels.map(d => 'D' + d),
            datasets: [{
                data: datosLimpios,
                borderColor: color,
                backgroundColor: color + '22',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: color,
                fill: true,
                tension: 0.4,
                spanGaps: true
            }]
        },
        options: {
            responsive: false,
            animation: { duration: 600 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => (ctx.parsed.y !== null ? ctx.parsed.y + ' ' + unidad : '—')
                    }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

// ── Parchear renderContadoresGeneral para inyectar sparklines ──
const _origRenderContadoresGeneral = renderContadoresGeneral;
renderContadoresGeneral = function() {
    _origRenderContadoresGeneral.apply(this, arguments);
    // Breve timeout para que el DOM se actualice antes de buscar los contenedores
    setTimeout(renderSparklines, 120);
};

// ══════════════════════════════════════════════════════════════════
//  MINI-GRÁFICAS DE TENDENCIA (Sparklines) — Dashboard Admin
//  Se inyectan en las tarjetas del home mostrando últimos 7 días
// ══════════════════════════════════════════════════════════════════

// Guarda referencias para no recrear infinitamente
const _sparklineCharts = {};

function renderSparklines() {
    // Solo admin/supervisor y cuando hay datos
    if (!userLogueado || userLogueado.rol === 'asesor') return;
    if (!datosAsis || datosAsis.length === 0) return;

    const hoy = new Date().getDate();
    const ultimos7 = Array.from({ length: 7 }, (_, i) => Math.max(1, hoy - 6 + i));

    // ── Sparkline asistencia: % diario de los últimos 7 días ──
    const nombresAsis = [...new Set(datosAsis.map(r => r['Nombre']))];
    const datosUltimos7Asis = ultimos7.map(dia => {
        let asistidos = 0, total = 0;
        nombresAsis.forEach(nombre => {
            const fila = datosAsis.find(r => r['Nombre'] === nombre && parseInt(r['Dia']) === dia);
            if (!fila) return;
            const v = parseInt(fila['Asistencia']);
            if (v === 1 || v === -1) { total++; if (v === 1) asistidos++; }
        });
        return total > 0 ? Math.round((asistidos / total) * 100) : null;
    });

    // ── Sparkline puntos: total diario últimos 7 días ──
    const datosUltimos7Puntos = ultimos7.map(dia => {
        return datosPunt
            .filter(r => {
                const d = parseInt(r['Dia'] || r['dia'] || 0);
                return d === dia;
            })
            .reduce((s, r) => s + (parseFloat(r['Puntos'] || r['puntos'] || 0) || 0), 0);
    });

    // Inyectar sparklines en las tarjetas correspondientes
    _insertarSparkline('sparkline-asistencia', datosUltimos7Asis, '#27ae60', '%', ultimos7);
    _insertarSparkline('sparkline-puntos', datosUltimos7Puntos, '#ff2d55', 'pts', ultimos7);
}

function _insertarSparkline(containerId, data, color, unidad, labels) {
    const el = document.getElementById(containerId);
    if (!el) return;

    // Destruir chart anterior si existe
    if (_sparklineCharts[containerId]) {
        try { _sparklineCharts[containerId].destroy(); } catch(e) {}
        delete _sparklineCharts[containerId];
    }

    const canvas = document.createElement('canvas');
    canvas.width  = el.offsetWidth || 200;
    canvas.height = 52;
    canvas.style.cssText = 'width:100%;height:52px;display:block;';
    el.innerHTML = '';
    el.appendChild(canvas);

    const datosLimpios = data.map(v => v === null ? undefined : v);
    const hasData = datosLimpios.some(v => v !== undefined);
    if (!hasData) {
        el.innerHTML = '<div style="font-size:10px;color:rgba(255,255,255,0.2);text-align:center;padding:16px 0;">Sin datos</div>';
        return;
    }

    _sparklineCharts[containerId] = new Chart(canvas.getContext('2d'), {
        type: 'line',
        data: {
            labels: labels.map(d => 'D' + d),
            datasets: [{
                data: datosLimpios,
                borderColor: color,
                backgroundColor: color + '22',
                borderWidth: 2,
                pointRadius: 3,
                pointBackgroundColor: color,
                fill: true,
                tension: 0.4,
                spanGaps: true
            }]
        },
        options: {
            responsive: false,
            animation: { duration: 600 },
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: ctx => (ctx.parsed.y !== null ? ctx.parsed.y + ' ' + unidad : '—')
                    }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    display: false,
                    beginAtZero: true
                }
            }
        }
    });
}

// ── Parchear renderContadoresGeneral para inyectar sparklines ──
const _origRenderContadoresGeneral = renderContadoresGeneral;
renderContadoresGeneral = function() {
    _origRenderContadoresGeneral.apply(this, arguments);
    // Breve timeout para que el DOM se actualice antes de buscar los contenedores
    setTimeout(renderSparklines, 120);
};

// ══════════════════════════════════════════════════════════════════
//  MÓDULO: HISTORIAL COMPARATIVO — diseño mejorado
// ══════════════════════════════════════════════════════════════════

const MESES_NOMBRES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                       'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

// Paleta de colores para cada mes
const HIST_COLORS = [
    '#ff2d55','#3498db','#27ae60','#f1c40f','#9b59b6','#1abc9c','#e67e22','#2ecc71',
    '#e74c3c','#2980b9','#16a085','#8e44ad','#d35400'
];

let comparativoMeses = JSON.parse(localStorage.getItem('usd_comparativo_meses') || '[]');
let _historialChartType = 'line'; // 'bar' | 'line' | 'bar_h' | 'pie' | 'doughnut' | 'radar' | 'polarArea' | 'bubble' | 'scatter'

// ── Helper: normaliza valor de Firebase → array siempre ──────────
function _fbValToArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val.filter(x => x != null);
    if (typeof val === 'object') {
        // Firebase convierte arrays con índices numéricos a objetos {0:{...}, 1:{...}}
        const keys = Object.keys(val).sort((a, b) => Number(a) - Number(b));
        return keys.map(k => val[k]).filter(x => x != null);
    }
    return [];
}

// ── Recarga manual desde Firebase (botón para coordinador) ────────
function recargarHistorialDesdeFirebase() {
    const btn = document.getElementById('btnRecargarHistorial');
    if (btn) { btn.textContent = '⏳ Cargando...'; btn.disabled = true; }
    if (window._fbCargar) {
        window._fbCargar('usd_comparativo_meses').then(val => {
            comparativoMeses = _fbValToArray(val);
            Storage.prototype.setItem.call(localStorage, 'usd_comparativo_meses', JSON.stringify(comparativoMeses));
            renderHistorialCompleto();
            if (btn) { btn.textContent = '🔄 Recargar datos'; btn.disabled = false; }
        }).catch(() => {
            if (btn) { btn.textContent = '🔄 Recargar datos'; btn.disabled = false; }
        });
    }
}

function toggleChartTypeDropdown() {
    const dd = document.getElementById('chartTypeDropdown');
    const arrow = document.getElementById('chartTypeArrow');
    if (!dd) return;
    const open = dd.style.display !== 'none';
    dd.style.display = open ? 'none' : 'block';
    if (arrow) arrow.style.transform = open ? '' : 'rotate(180deg)';
}

function setChartType(tipo, emoji, label) {
    _historialChartType = tipo;
    const btnLabel = document.getElementById('chartTypeBtnLabel');
    if (btnLabel) btnLabel.textContent = emoji + ' ' + label;
    // Marcar el item activo
    document.querySelectorAll('.ctype-item').forEach(el => {
        el.style.background = '';
        el.style.color = 'var(--textMuted)';
    });
    const active = document.getElementById('ctype-' + tipo);
    if (active) { active.style.background = 'rgba(255,45,85,0.12)'; active.style.color = '#fff'; }
    // Cerrar dropdown
    const dd = document.getElementById('chartTypeDropdown');
    const arrow = document.getElementById('chartTypeArrow');
    if (dd) dd.style.display = 'none';
    if (arrow) arrow.style.transform = '';
    _renderHistorialChart();
}

// Cerrar dropdown al hacer click fuera
document.addEventListener('click', function(e) {
    const wrap = document.getElementById('chartTypeDropdownWrap');
    if (wrap && !wrap.contains(e.target)) {
        const dd = document.getElementById('chartTypeDropdown');
        const arrow = document.getElementById('chartTypeArrow');
        if (dd) dd.style.display = 'none';
        if (arrow) arrow.style.transform = '';
    }
});
let _chartHistorial  = null;
let _historialTab    = 'asis'; // 'asis' | 'puntos' | 'ambos'

// ── Helpers ──────────────────────────────────────────────────────
function _hColor(i, alpha) {
    const c = HIST_COLORS[i % HIST_COLORS.length];
    // parse hex → rgba
    const r = parseInt(c.slice(1,3),16), g = parseInt(c.slice(3,5),16), b = parseInt(c.slice(5,7),16);
    return `rgba(${r},${g},${b},${alpha})`;
}

function _pctAsis(m) {
    const t = m.asisOk + m.asisFalta;
    return t > 0 ? Math.round((m.asisOk / t) * 100) : 0;
}

// ── Estadísticas rápidas ─────────────────────────────────────────
function _renderHistorialStats() {
    const cont = document.getElementById('historialStatsRow');
    if (!cont) return;
    if (comparativoMeses.length === 0) { cont.innerHTML = ''; return; }

    const pcts   = comparativoMeses.map(_pctAsis);
    const puntos = comparativoMeses.map(m => m.puntosTotal);
    const mejor  = comparativoMeses.reduce((a, b) => _pctAsis(a) >= _pctAsis(b) ? a : b);
    const avg    = Math.round(pcts.reduce((s,v)=>s+v,0) / pcts.length);
    const tendencia = pcts.length >= 2 ? pcts[pcts.length-1] - pcts[pcts.length-2] : 0;
    const maxPuntos = Math.max(...puntos);
    const maxPuntosLabel = comparativoMeses[puntos.indexOf(maxPuntos)].label;
    const rangoLabel = comparativoMeses.length >= 2
        ? comparativoMeses[0].label.split(' ').pop() + ' — ' + comparativoMeses[comparativoMeses.length-1].label
        : comparativoMeses[0].label;

    const tendColor = tendencia >= 0 ? '#27ae60' : '#ff2d55';
    const tendIcon  = tendencia >= 0 ? '▲' : '▼';

    cont.innerHTML = `
        <div class="glass-card" style="padding:16px 18px;">
            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">MEJOR MES</div>
            <div style="font-size:22px;font-weight:900;color:#27ae60;">${mejor.label}</div>
            <div style="font-size:11px;color:#27ae60;margin-top:3px;">▲ ${_pctAsis(mejor)}% asistencia</div>
        </div>
        <div class="glass-card" style="padding:16px 18px;">
            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">TENDENCIA</div>
            <div style="font-size:22px;font-weight:900;color:${tendColor};">${tendIcon} ${tendencia >= 0 ? '+' : ''}${tendencia}%</div>
            <div style="font-size:11px;color:var(--textMuted);margin-top:3px;">vs mes anterior</div>
        </div>
        <div class="glass-card" style="padding:16px 18px;">
            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">MESES CARGADOS</div>
            <div style="font-size:22px;font-weight:900;color:#3498db;">${comparativoMeses.length}</div>
            <div style="font-size:11px;color:var(--textMuted);margin-top:3px;">${rangoLabel}</div>
        </div>
        <div class="glass-card" style="padding:16px 18px;">
            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">PTS MÁX.</div>
            <div style="font-size:22px;font-weight:900;color:var(--accent);">${maxPuntos.toLocaleString('es-CO',{maximumFractionDigits:1})}</div>
            <div style="font-size:11px;color:var(--textMuted);margin-top:3px;">${maxPuntosLabel}</div>
        </div>
        <div class="glass-card" style="padding:16px 18px;">
            <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:6px;">PROMEDIO ASIS.</div>
            <div style="font-size:22px;font-weight:900;color:#1abc9c;">${avg}%</div>
            <div style="font-size:11px;color:var(--textMuted);margin-top:3px;">${comparativoMeses.length} mes${comparativoMeses.length!==1?'es':''}</div>
        </div>`;
}

// ── Leyenda de meses ─────────────────────────────────────────────
function _renderHistorialLeyenda() {
    const el = document.getElementById('historialLeyenda');
    if (!el) return;
    el.innerHTML = comparativoMeses.map((m, i) =>
        `<span style="display:inline-flex;align-items:center;gap:5px;font-size:12px;font-weight:600;color:var(--textMain);">
            <span style="width:10px;height:10px;border-radius:50%;background:${HIST_COLORS[i % HIST_COLORS.length]};flex-shrink:0;display:inline-block;"></span>
            ${m.label}
        </span>`
    ).join('');
}

// ── Gráfica principal ────────────────────────────────────────────
function _renderHistorialChart() {
    const canvasEl = document.getElementById('chartHistorial');
    const emptyEl  = document.getElementById('historialEmpty');
    if (!canvasEl) return;

    if (comparativoMeses.length === 0) {
        canvasEl.style.display = 'none';
        if (emptyEl) {
            emptyEl.style.display = 'block';
            // Mostrar botón de recarga para roles que no pueden subir Excel
            const btnRecargar = document.getElementById('btnRecargarHistorial');
            const msgEmpty = document.getElementById('historialEmptyMsg');
            if (typeof userLogueado !== 'undefined' && userLogueado && userLogueado.rol !== 'admin') {
                if (btnRecargar) btnRecargar.style.display = 'inline-block';
                if (msgEmpty) msgEmpty.textContent = 'No hay meses cargados aún. El Admin debe subir los datos.';
            }
        }
        return;
    }
    canvasEl.style.display = 'block';
    if (emptyEl) emptyEl.style.display = 'none';

    if (_chartHistorial) { try { _chartHistorial.destroy(); } catch(e) {} _chartHistorial = null; }

    const axisStyle = {
        ticks: { color: '#a0a0a0', font: { size: 11 } },
        grid:  { color: 'rgba(255,255,255,0.06)' }
    };

    // ── Determinar tipo Chart.js real ─────────────────────────────────────────
    const _isRadial = ['pie','doughnut','polarArea'].includes(_historialChartType);
    const _ctType   = _historialChartType === 'bar_h' ? 'bar' : _historialChartType;
    const _isHoriz  = _historialChartType === 'bar_h';
    const _isBubble = _historialChartType === 'bubble';
    const _isScatter= _historialChartType === 'scatter';

    // ── Determinar rango de días (1–31) cubierto por todos los meses ──────────
    let maxDia = 0;
    comparativoMeses.forEach(m => {
        if (m.asisPorDia) Object.keys(m.asisPorDia).forEach(d => { if (+d > maxDia) maxDia = +d; });
        if (m.puntosPorDia) Object.keys(m.puntosPorDia).forEach(d => { if (+d > maxDia) maxDia = +d; });
    });
    // Si no hay datos diarios (meses guardados antes de esta actualización), caer al modo anterior
    const usarDias = maxDia > 0;

    let labels, datasets = [];

    if (usarDias) {
        // Eje X = días del mes (1 … maxDia)
        labels = Array.from({ length: maxDia }, (_, i) => 'Día ' + (i + 1));

        comparativoMeses.forEach((m, idx) => {
            const color = HIST_COLORS[idx % HIST_COLORS.length];

            if (_historialTab === 'asis' || _historialTab === 'ambos') {
                // % asistencia acumulada hasta cada día
                const dataPct = labels.map((_, i) => {
                    const dia = i + 1;
                    let ok = 0, falta = 0;
                    for (let d = 1; d <= dia; d++) {
                        if (m.asisPorDia && m.asisPorDia[d]) {
                            ok    += m.asisPorDia[d].asisOk    || 0;
                            falta += m.asisPorDia[d].asisFalta || 0;
                        }
                    }
                    const total = ok + falta;
                    return total > 0 ? Math.round((ok / total) * 100) : null;
                });
                datasets.push({
                    label: m.label + ' — Asistencia %',
                    data: dataPct,
                    borderColor: color,
                    backgroundColor: color + '1A',
                    borderWidth: 2,
                    pointBackgroundColor: color,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: _historialTab === 'asis',
                    spanGaps: true,
                    yAxisID: _historialTab === 'ambos' ? 'yAsis' : 'y'
                });
            }

            if (_historialTab === 'puntos' || _historialTab === 'ambos') {
                // Puntos acumulados hasta cada día
                const dataPuntos = labels.map((_, i) => {
                    const dia = i + 1;
                    let acum = 0;
                    for (let d = 1; d <= dia; d++) {
                        if (m.puntosPorDia && m.puntosPorDia[d]) acum += m.puntosPorDia[d];
                    }
                    return acum > 0 ? acum : null;
                });
                datasets.push({
                    label: m.label + ' — Puntos',
                    data: dataPuntos,
                    borderColor: color,
                    backgroundColor: color + '1A',
                    borderWidth: 2,
                    pointBackgroundColor: color,
                    pointRadius: 3,
                    pointHoverRadius: 6,
                    tension: 0.4,
                    fill: _historialTab === 'puntos',
                    spanGaps: true,
                    borderDash: _historialTab === 'ambos' ? [5, 3] : [],
                    yAxisID: _historialTab === 'ambos' ? 'yPuntos' : 'y'
                });
            }
        });

    } else {
        // Fallback: modo anterior (un punto por mes)
        labels = comparativoMeses.map(m => m.label);
        const pcts   = comparativoMeses.map(_pctAsis);
        const puntos = comparativoMeses.map(m => m.puntosTotal);

        if (_historialTab === 'asis' || _historialTab === 'ambos') {
            datasets.push({
                label: 'Asistencia %',
                data: pcts,
                borderColor: '#ff2d55',
                backgroundColor: 'rgba(255,45,85,0.10)',
                borderWidth: 2.5,
                pointBackgroundColor: '#ff2d55',
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: _historialTab === 'asis',
                yAxisID: _historialTab === 'ambos' ? 'yAsis' : 'y'
            });
        }
        if (_historialTab === 'puntos' || _historialTab === 'ambos') {
            datasets.push({
                label: 'Puntos totales',
                data: puntos,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52,152,219,0.10)',
                borderWidth: 2.5,
                pointBackgroundColor: '#3498db',
                pointRadius: 5,
                pointHoverRadius: 7,
                tension: 0.4,
                fill: _historialTab === 'puntos',
                borderDash: _historialTab === 'ambos' ? [5,3] : [],
                yAxisID: _historialTab === 'ambos' ? 'yPuntos' : 'y'
            });
        }
    }

    let scales = {
        x: {
            ...axisStyle,
            ticks: {
                ...axisStyle.ticks,
                maxTicksLimit: usarDias ? 31 : undefined,
                autoSkip: usarDias,
                maxRotation: 45,
                minRotation: 0
            }
        }
    };

    if (_historialTab === 'asis') {
        scales.y = { ...axisStyle, min: 0, max: 105, ticks: { ...axisStyle.ticks, callback: v => v + '%' } };
    } else if (_historialTab === 'puntos') {
        scales.y = { ...axisStyle, beginAtZero: true, ticks: { ...axisStyle.ticks, callback: v => v.toLocaleString('es-CO') } };
    } else {
        scales.yAsis = {
            ...axisStyle,
            position: 'left',
            min: 0, max: 105,
            ticks: { ...axisStyle.ticks, callback: v => v + '%' },
            title: { display: true, text: 'Asistencia %', color: '#ff2d55', font: { size: 10, weight: 'bold' } }
        };
        scales.yPuntos = {
            ...axisStyle,
            position: 'right',
            beginAtZero: true,
            grid: { drawOnChartArea: false },
            ticks: { ...axisStyle.ticks, callback: v => v.toLocaleString('es-CO') },
            title: { display: true, text: 'Puntos', color: '#3498db', font: { size: 10, weight: 'bold' } }
        };
    }

    // ── Para gráficas radiales (pie/doughnut/polarArea) usar un punto por mes ──
    if (_isRadial) {
        const rLabels = comparativoMeses.map(m => m.label);
        const rColors = comparativoMeses.map((_, i) => HIST_COLORS[i % HIST_COLORS.length]);
        let rData = [];
        if (_historialTab === 'asis' || _historialTab === 'ambos') {
            rData = comparativoMeses.map(_pctAsis);
        } else {
            rData = comparativoMeses.map(m => m.puntosTotal);
        }
        _chartHistorial = new Chart(canvasEl.getContext('2d'), {
            type: _ctType,
            data: {
                labels: rLabels,
                datasets: [{ data: rData, backgroundColor: rColors.map(c => c + 'CC'), borderColor: rColors, borderWidth: 2 }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: '#a0a0a0', font: { size: 11 }, usePointStyle: true } },
                    tooltip: {
                        backgroundColor: 'rgba(18,18,18,0.92)',
                        borderColor: 'rgba(255,255,255,0.12)', borderWidth: 1,
                        titleColor: '#fff', bodyColor: '#a0a0a0',
                        callbacks: { label: ctx => _historialTab === 'puntos' ? ` ${ctx.label}: ${ctx.parsed.toLocaleString('es-CO')}` : ` ${ctx.label}: ${ctx.parsed}%` }
                    }
                }
            }
        });
        return;
    }

    // ── Para bubble/scatter adaptar datasets ──────────────────────────────────
    if (_isBubble || _isScatter) {
        const bDatasets = comparativoMeses.map((m, idx) => {
            const color = HIST_COLORS[idx % HIST_COLORS.length];
            const pts   = _isBubble
                ? [{ x: idx + 1, y: _pctAsis(m), r: Math.max(5, Math.round(m.puntosTotal / 100)) }]
                : [{ x: idx + 1, y: _pctAsis(m) }];
            return { label: m.label, data: pts, backgroundColor: color + 'AA', borderColor: color, borderWidth: 2 };
        });
        _chartHistorial = new Chart(canvasEl.getContext('2d'), {
            type: _isScatter ? 'scatter' : 'bubble',
            data: { datasets: bDatasets },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: { legend: { display: true, labels: { color: '#a0a0a0', font: { size: 11 } } } },
                scales: {
                    x: { ticks: { color: '#a0a0a0' }, grid: { color: 'rgba(255,255,255,0.06)' }, title: { display: true, text: 'Mes #', color: '#a0a0a0' } },
                    y: { ticks: { color: '#a0a0a0', callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.06)' }, min: 0, max: 105 }
                }
            }
        });
        return;
    }

    // ── Agregar línea de tendencia cuando el tipo es barras ───────────────────
    const _trendDatasets = [];
    if (_ctType === 'bar' && !_isHoriz && datasets.length > 0) {
        datasets.forEach(ds => {
            const vals = ds.data.map(v => (v === null || v === undefined) ? null : v);
            const nonNull = vals.map((v,i)=>v!==null?{i,v}:null).filter(Boolean);
            if (nonNull.length >= 2) {
                const n = nonNull.length;
                const sumX = nonNull.reduce((s,p)=>s+p.i,0);
                const sumY = nonNull.reduce((s,p)=>s+p.v,0);
                const sumXY= nonNull.reduce((s,p)=>s+p.i*p.v,0);
                const sumX2= nonNull.reduce((s,p)=>s+p.i*p.i,0);
                const denom= n*sumX2 - sumX*sumX;
                if (denom !== 0) {
                    const slope=(n*sumXY - sumX*sumY)/denom;
                    const intercept=(sumY - slope*sumX)/n;
                    const trendData = vals.map((_,i) => parseFloat((slope*i+intercept).toFixed(2)));
                    _trendDatasets.push({
                        label: ds.label + ' (tendencia)',
                        data: trendData,
                        type: 'line',
                        borderColor: ds.borderColor,
                        backgroundColor: 'transparent',
                        borderWidth: 2,
                        borderDash: [6, 4],
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        tension: 0,
                        fill: false,
                        spanGaps: true,
                        yAxisID: ds.yAxisID || 'y',
                        order: -1
                    });
                }
            }
        });
    }

    _chartHistorial = new Chart(canvasEl.getContext('2d'), {
        type: _ctType,
        data: { labels, datasets: [...datasets.map(ds => ({
            ...ds,
            // Para barras: usar backgroundColor sólido
            backgroundColor: (_ctType === 'bar') ? (ds.borderColor + '99') : ds.backgroundColor,
            borderRadius: (_ctType === 'bar') ? 6 : 0,
            borderSkipped: false
        })), ..._trendDatasets]},
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: _isHoriz ? 'y' : 'x',
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: true, labels: { color: '#a0a0a0', font: { size: 11 }, usePointStyle: true } },
                tooltip: {
                    backgroundColor: 'rgba(18,18,18,0.92)',
                    borderColor: 'rgba(255,255,255,0.12)',
                    borderWidth: 1,
                    titleColor: '#fff',
                    bodyColor: '#a0a0a0',
                    callbacks: {
                        label: ctx => {
                            if (ctx.parsed.y === null || ctx.parsed.y === undefined) return null;
                            if (ctx.dataset.label.includes('Asistencia') || ctx.dataset.yAxisID === 'yAsis')
                                return ` ${ctx.dataset.label}: ${ctx.parsed.y}%`;
                            return ` ${ctx.dataset.label}: ${ctx.parsed.y.toLocaleString('es-CO')}`;
                        }
                    }
                }
            },
            scales
        }
    });
}

// ── Tabla resumen ────────────────────────────────────────────────
function _renderHistorialTabla() {
    const el = document.getElementById('tablaResumenMeses');
    const countEl = document.getElementById('historialMesesCount');
    if (!el) return;
    if (countEl) countEl.textContent = comparativoMeses.length + ' mes' + (comparativoMeses.length!==1?'es':'') + ' cargados';

    if (comparativoMeses.length === 0) {
        el.innerHTML = '<p style="color:var(--textMuted);text-align:center;padding:20px;">Sin datos. Carga un Excel para comenzar.</p>';
        return;
    }

    const showAsis   = _historialTab === 'asis'   || _historialTab === 'ambos';
    const showPuntos = _historialTab === 'puntos' || _historialTab === 'ambos';

    const filas = comparativoMeses.map((m, i) => {
        const pct = _pctAsis(m);
        const pColor = pct >= 90 ? '#27ae60' : pct >= 70 ? '#f39c12' : '#ff2d55';
        return `<tr>
            <td><span style="display:inline-flex;align-items:center;gap:7px;">
                <span style="width:10px;height:10px;border-radius:50%;background:${HIST_COLORS[i % HIST_COLORS.length]};flex-shrink:0;display:inline-block;"></span>
                <strong>${m.label}</strong>
            </span></td>
            ${showAsis ? `
            <td style="text-align:center;color:#27ae60;font-weight:700;">${m.asisOk}</td>
            <td style="text-align:center;color:var(--accent);font-weight:700;">${m.asisFalta}</td>
            <td style="text-align:center;font-weight:900;color:${pColor};">${pct}%</td>
            ` : ''}
            ${showPuntos ? `
            <td style="text-align:center;color:#f1c40f;font-weight:700;">${m.puntosTotal.toLocaleString('es-CO',{maximumFractionDigits:1})}</td>
            ` : ''}
            <td style="text-align:center;">
                <button onclick="eliminarMes(${i})" class="historial-btn-quitar" style="background:rgba(255,45,85,0.15);border:none;color:var(--accent);padding:4px 10px;border-radius:6px;cursor:pointer;font-size:11px;font-weight:700;transition:0.2s;" onmouseover="this.style.background='rgba(255,45,85,0.3)'" onmouseout="this.style.background='rgba(255,45,85,0.15)'">✕ Quitar</button>
            </td>
        </tr>`;
    }).join('');

    const thAsis   = showAsis   ? `<th style="text-align:center;">✅ Asistencias</th><th style="text-align:center;">❌ Faltas</th><th style="text-align:center;">% Asistencia</th>` : '';
    const thPuntos = showPuntos ? `<th style="text-align:center;">⭐ Puntos</th>` : '';

    el.innerHTML = `
        <table>
            <thead><tr>
                <th>Mes</th>
                ${thAsis}
                ${thPuntos}
                <th style="text-align:center;"></th>
            </tr></thead>
            <tbody>${filas}</tbody>
        </table>`;
}

// ── Render completo ──────────────────────────────────────────────
function _renderHistorialArchivos() {
    const cont = document.getElementById('historialArchivosLista');
    if (!cont) return;
    if (comparativoMeses.length === 0) { cont.style.display = 'none'; return; }
    cont.style.display = 'flex';
    cont.innerHTML = comparativoMeses.map((m, i) =>
        `<div style="display:inline-flex;align-items:center;gap:6px;background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);border-radius:20px;padding:4px 10px 4px 8px;font-size:11px;color:rgba(255,255,255,0.75);">
            <span style="font-size:13px;">📄</span>
            <span>${m.label}</span>
            <button onclick="eliminarMes(${i})" title="Eliminar" class="historial-btn-quitar" style="background:none;border:none;color:rgba(255,255,255,0.3);cursor:pointer;font-size:12px;padding:0;line-height:1;" onmouseover="this.style.color='#ff2d55'" onmouseout="this.style.color='rgba(255,255,255,0.3)'">✕</button>
        </div>`
    ).join('');
}

function renderHistorialCompleto() {
    _renderHistorialArchivos();
    _renderHistorialStats();
    _renderHistorialLeyenda();
    _renderHistorialChart();
    _renderHistorialTabla();
}

// ── Switch de tabs ───────────────────────────────────────────────
function switchHistorialTab(tab) {
    _historialTab = tab;
    const tabs = ['asis','puntos','ambos','asesores','grupos'];
    tabs.forEach(t => {
        const btn = document.getElementById('tabHist' + t.charAt(0).toUpperCase() + t.slice(1));
        if (!btn) return;
        if (t === tab) {
            if (t === 'asesores') { btn.style.background='linear-gradient(135deg,#6c3fbf,#9b59b6)';btn.style.color='#fff';btn.style.border='none'; }
            else if (t === 'grupos') { btn.style.background='#27ae60';btn.style.color='#fff';btn.style.border='none'; }
            else { btn.style.background='var(--accent)';btn.style.color='#fff';btn.style.border='none'; }
        } else {
            if (t === 'asesores') { btn.style.background='transparent';btn.style.color='#9b59b6';btn.style.border='2px solid #9b59b6'; }
            else if (t === 'grupos') { btn.style.background='transparent';btn.style.color='#27ae60';btn.style.border='2px solid #27ae60'; }
            else { btn.style.background='transparent';btn.style.color='var(--accent)';btn.style.border='2px solid var(--accent)'; }
        }
    });
    const chartWrap    = document.getElementById('historialChartWrap');
    const leyenda      = document.getElementById('historialLeyenda');
    const asesoresWrap = document.getElementById('historialAsesoresWrap');
    const gruposWrap   = document.getElementById('historialGruposWrap');
    if (tab === 'asesores') {
        if (chartWrap) chartWrap.style.display='none';
        if (leyenda) leyenda.style.display='none';
        if (asesoresWrap) asesoresWrap.style.display='block';
        if (gruposWrap) gruposWrap.style.display='none';
        _renderAsesoresGrid();
    } else if (tab === 'grupos') {
        if (chartWrap) chartWrap.style.display='none';
        if (leyenda) leyenda.style.display='none';
        if (asesoresWrap) asesoresWrap.style.display='none';
        if (gruposWrap) gruposWrap.style.display='block';
        _renderGruposGrid();
    } else {
        if (chartWrap) chartWrap.style.display='';
        if (leyenda) leyenda.style.display='';
        if (asesoresWrap) asesoresWrap.style.display='none';
        if (gruposWrap) gruposWrap.style.display='none';
        _renderHistorialChart();
    }
}

// ── Carga Excel ──────────────────────────────────────────────────
function agregarMesDesdeExcel(input) {
    const file = input.files[0];
    if (!file) return;

    const hoy = new Date();
    const labelDefault = MESES_NOMBRES[hoy.getMonth()] + ' ' + hoy.getFullYear();
    const label = window.prompt('¿Cómo se llama este mes?', labelDefault);
    if (!label) { input.value = ''; return; }

    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const wb = XLSX.read(new Uint8Array(ev.target.result), { type: 'array' });

            const asisRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
            let asisOk = 0, asisFalta = 0;
            // Datos por día: { dia: { asisOk, asisFalta } }
            const asisPorDia = {};
            asisRows.forEach(r => {
                const v   = parseInt(r['Asistencia'] || 0);
                const dia = parseInt(r['Dia'] || r['dia'] || 0);
                if (v === 1) asisOk++;
                else if (v === -1) asisFalta++;
                if (dia > 0) {
                    if (!asisPorDia[dia]) asisPorDia[dia] = { asisOk: 0, asisFalta: 0 };
                    if (v === 1)  asisPorDia[dia].asisOk++;
                    else if (v === -1) asisPorDia[dia].asisFalta++;
                }
            });

            let puntosTotal = 0;
            const puntosPorDia    = {};
            const puntosPorAsesor = {}; // { "Nombre": { dia: pts, ... } }
            if (wb.SheetNames[1]) {
                const puntRows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[1]], { defval: '' });
                puntRows.forEach(r => {
                    const pts    = parseFloat(r['Puntos'] || r['puntos'] || 0) || 0;
                    const dia    = parseInt(r['Dia']    || r['dia']    || 0);
                    const nombre = (r['Nombre'] || r['nombre'] || '').trim();
                    puntosTotal += pts;
                    if (dia > 0) {
                        puntosPorDia[dia] = (puntosPorDia[dia] || 0) + pts;
                    }
                    if (nombre && dia > 0) {
                        if (!puntosPorAsesor[nombre]) puntosPorAsesor[nombre] = {};
                        puntosPorAsesor[nombre][dia] = (puntosPorAsesor[nombre][dia] || 0) + pts;
                    }
                });
            }

            comparativoMeses.push({ label, asisOk, asisFalta, puntosTotal, asisPorDia, puntosPorDia, puntosPorAsesor });
            localStorage.setItem('usd_comparativo_meses', JSON.stringify(comparativoMeses));
            if (window._fbGuardar) window._fbGuardar('usd_comparativo_meses', comparativoMeses);
            input.value = '';
            renderHistorialCompleto();
            if (typeof toast === 'function') toast(`✅ "${label}" agregado al historial.`, 'success');
        } catch(e) {
            if (typeof toast === 'function') toast('Error al leer el archivo.', 'error');
            console.error(e);
        }
    };
    reader.readAsArrayBuffer(file);
}

function eliminarMes(idx) {
    comparativoMeses.splice(idx, 1);
    localStorage.setItem('usd_comparativo_meses', JSON.stringify(comparativoMeses));
    if (window._fbGuardar) window._fbGuardar('usd_comparativo_meses', comparativoMeses);
    renderHistorialCompleto();
}

function limpiarMeses() {
    comparativoMeses = [];
    localStorage.removeItem('usd_comparativo_meses');
    if (window._fbGuardar) window._fbGuardar('usd_comparativo_meses', []);
    renderHistorialCompleto();
}

function exportarHistorialPDF() {
    if (typeof toast === 'function') toast('Preparando ventana de impresión...', 'info', 2000);
    const secEl = document.getElementById('sec-comparativo');
    const ventana = window.open('', '_blank');
    ventana.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8">
        <title>Historial Comparativo — USDINFORMATION</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"><\/script>
        <style>
            body { margin:20px; font-family:'Segoe UI',sans-serif; background:#121212; color:#fff; }
            table { width:100%; border-collapse:collapse; margin-top:10px; }
            th,td { padding:10px; border-bottom:1px solid rgba(255,255,255,0.1); font-size:13px; }
            th { color:#a0a0a0; font-size:11px; text-transform:uppercase; letter-spacing:1px; }
            h1 { font-size:1.4rem; color:#ff2d55; }
            @media print { body { background:#fff; color:#000; } }
        <\/style>
    </head><body>
    <h1>📋 Historial Comparativo — USDINFORMATION</h1>
    <p style="color:#a0a0a0;font-size:12px;">${new Date().toLocaleString('es-CO')}</p>
    ${secEl ? secEl.innerHTML : ''}
    <script>window.onload=()=>{setTimeout(()=>window.print(),600);}<\/script>
    </body></html>`);
    ventana.document.close();
}


// ── Gráficas por asesor ──────────────────────────────────────────
let _asesorCharts = []; // referencias para destruir al redibujar

function _renderAsesoresGrid() {
    const grid  = document.getElementById('historialAsesoresGrid');
    const empty = document.getElementById('historialAsesoresEmpty');
    if (!grid) return;

    // Destruir gráficas anteriores
    _asesorCharts.forEach(c => { try { c.destroy(); } catch(e){} });
    _asesorCharts = [];

    // ── Leer de comparativoMeses (🗂️ Cargar Excel mes) ───────────────────────
    // Cada mes tiene: { label, puntosPorDia: {dia: pts}, puntosTotal }
    // puntosPorAsesor: { "Nombre": { dia: pts, ... } } — si existe
    if (!comparativoMeses || comparativoMeses.length === 0) {
        grid.innerHTML = '';
        if (empty) empty.style.display = 'block';
        return;
    }

    // Calcular máximo de días entre todos los meses cargados
    let maxDia = 31;
    comparativoMeses.forEach(m => {
        if (m.puntosPorAsesor) {
            Object.values(m.puntosPorAsesor).forEach(diasObj => {
                Object.keys(diasObj).forEach(d => { if (+d > maxDia) maxDia = +d; });
            });
        }
        if (m.puntosPorDia) {
            Object.keys(m.puntosPorDia).forEach(d => { if (+d > maxDia) maxDia = +d; });
        }
    });

    // Eje X: todos los días del mes (D1 … D31)
    const todosLosDias = Array.from({ length: maxDia }, (_, i) => i + 1);
    const labelsEje    = todosLosDias.map(d => 'D' + d);

    // Obtener lista de asesores únicos de todos los meses
    const nombresSet = new Set();
    comparativoMeses.forEach(m => {
        if (m.puntosPorAsesor) {
            Object.keys(m.puntosPorAsesor).forEach(n => nombresSet.add(n.trim()));
        }
    });
    const nombresUnicos = [...nombresSet].filter(Boolean);

    // Si no hay datos por asesor, mostrar mensaje orientativo
    if (nombresUnicos.length === 0) {
        grid.innerHTML = '';
        if (empty) {
            empty.style.display = 'block';
            empty.innerHTML = '<div style="font-size:28px;margin-bottom:10px;">📂</div><div style="font-size:14px;font-weight:600;">Sin datos por asesor</div><div style="font-size:12px;margin-top:6px;color:var(--textMuted);">Asegúrate de que la hoja de Puntos del Excel<br>tenga las columnas <strong>Nombre</strong>, <strong>Dia</strong> y <strong>Puntos</strong></div>';
        }
        return;
    }
    if (empty) empty.style.display = 'none';

    // Construir lista de asesores con sus datos por mes y por día
    // Separar asesores reales de oficinas
    const esAsesorReal = (nombre) => (typeof usuarios !== 'undefined' ? usuarios : []).some(u => u.rol === 'asesor' && u.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
    const getPlatColorForNombre = (nombre) => {
        const u = (typeof usuarios !== 'undefined' ? usuarios : []).find(x => x.nombre.trim().toLowerCase() === nombre.trim().toLowerCase());
        if (u && u.plataforma) return getPlatConfig(u.plataforma).color;
        // Si es oficina, detectar por nombre
        const { esOficina, plataforma } = detectarOficina ? detectarOficina(nombre) : { esOficina: false, plataforma: null };
        if (esOficina && plataforma) return getPlatConfig(plataforma).color;
        return null;
    };
    const nombresAsesores = nombresUnicos.filter(n => esAsesorReal(n));
    const nombresOficinas = nombresUnicos.filter(n => !esAsesorReal(n));
    const nombresOrdenados = [...nombresAsesores, ...nombresOficinas];

    const lista = nombresOrdenados.map((nombre, idx) => {
        const platColor = getPlatColorForNombre(nombre);
        const color = platColor || HIST_COLORS[idx % HIST_COLORS.length];

        // Para cada mes, construir serie de puntos por día (todos los días del mes)
        const seriesPorMes = comparativoMeses.map((m, mi) => {
            const diasAsesor = (m.puntosPorAsesor && m.puntosPorAsesor[nombre]) || {};
            const data = todosLosDias.map(d => {
                const v = diasAsesor[d] !== undefined ? diasAsesor[d] : null;
                return v;
            });
            const totalMes = Object.values(diasAsesor).reduce((s, v) => s + v, 0);
            return { label: m.label, data, totalMes, color: HIST_COLORS[mi % HIST_COLORS.length] };
        });

        const totalGlobal = seriesPorMes.reduce((s, m) => s + m.totalMes, 0);
        const mejorMes    = seriesPorMes.reduce((a, b) => a.totalMes >= b.totalMes ? a : b);

        return { nombre, color, seriesPorMes, totalGlobal, mejorMes };
    });

    // ── Renderizar tarjetas (doble de tamaño: height 320px) ──────────────────
    grid.innerHTML = lista.map((a, idx) => {
        const initials  = a.nombre.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
        const totalLabel = a.totalGlobal >= 1000
            ? (a.totalGlobal / 1000).toFixed(1) + 'k'
            : Math.round(a.totalGlobal);
        const mejorLabel = a.mejorMes.totalMes >= 1000
            ? (a.mejorMes.totalMes / 1000).toFixed(1) + 'k'
            : Math.round(a.mejorMes.totalMes);
        const uObj = (typeof usuarios !== 'undefined' ? usuarios : []).find(x => x.nombre.trim().toLowerCase() === a.nombre.trim().toLowerCase());
        const fotoAsesor = uObj && uObj.foto ? uObj.foto : `Fotos Empresa/${a.nombre.trim().split(' ')[0]}.jpg`;
        const platNombre = uObj && uObj.plataforma ? uObj.plataforma : '';
        const esOficinaCard = !esAsesorReal(a.nombre);
        const subtitulo = esOficinaCard
            ? `🏢 OFICINA · ${comparativoMeses.length} mes${comparativoMeses.length !== 1 ? 'es' : ''}`
            : `${platNombre ? platNombre + ' · ' : ''}${comparativoMeses.length} mes${comparativoMeses.length !== 1 ? 'es' : ''} · Comparativo`;
        return `
        <div style="background:var(--panelBg);border-radius:14px;border:1px solid ${esOficinaCard ? a.color+'44' : 'rgba(255,255,255,0.1)'};overflow:hidden;${esOficinaCard ? 'opacity:0.88;' : ''}">
            <div style="background:linear-gradient(135deg,${a.color}22,${a.color}44);border-bottom:3px solid ${a.color};padding:14px 16px;display:flex;align-items:center;gap:12px;">
                <div style="width:44px;height:44px;border-radius:${esOficinaCard?'10px':'50%'};border:3px solid ${a.color};overflow:hidden;flex-shrink:0;background:${a.color}22;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px ${a.color}55;">
                    <img src="${fotoAsesor}" style="width:100%;height:100%;object-fit:cover;display:block;" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
                    <span style="display:none;font-size:${esOficinaCard?'18px':'13px'};font-weight:900;color:${a.color};width:100%;height:100%;align-items:center;justify-content:center;">${esOficinaCard?'🏢':initials}</span>
                </div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:900;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${aNombrePropio(a.nombre)}</div>
                    <div style="font-size:10px;color:${a.color};font-weight:700;text-transform:uppercase;margin-top:2px;">${subtitulo}</div>
                </div>
            </div>
            <div style="padding:12px 14px;height:320px;position:relative;">
                <canvas id="chartAsesor_${idx}"></canvas>
            </div>
            <div style="display:flex;gap:6px;padding:0 14px 12px;">
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;text-align:center;">
                    <div style="font-size:8px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Puntos acumulados</div>
                    <div style="font-size:14px;font-weight:900;color:#f1c40f;margin-top:2px;">${totalLabel}</div>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;text-align:center;">
                    <div style="font-size:8px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Mejor mes</div>
                    <div style="font-size:14px;font-weight:900;color:#27ae60;margin-top:2px;">${a.mejorMes.label}</div>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;text-align:center;">
                    <div style="font-size:8px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Pts mejor mes</div>
                    <div style="font-size:14px;font-weight:900;color:#3498db;margin-top:2px;">${mejorLabel}</div>
                </div>
            </div>
        </div>`;
    }).join('');

    // ── Crear gráficas ────────────────────────────────────────────────────────
    setTimeout(() => {
        lista.forEach((a, idx) => {
            const ctx = document.getElementById('chartAsesor_' + idx);
            if (!ctx) return;

            const isRadial  = ['pie','doughnut','polarArea'].includes(_historialChartType);
            const isRadar   = _historialChartType === 'radar';
            const isHoriz   = _historialChartType === 'bar_h';
            const chartType = isHoriz ? 'bar' : (_historialChartType === 'bubble' || _historialChartType === 'scatter' ? 'bar' : _historialChartType);

            // Cada mes es un dataset con su color y sus puntos por día
            const datasets = a.seriesPorMes.map(serie => ({
                label: serie.label,
                data:  serie.data,
                backgroundColor: serie.color + (isRadial ? 'cc' : '88'),
                borderColor:     serie.color,
                borderWidth: 2,
                borderRadius: chartType === 'bar' ? 4 : 0,
                pointRadius: chartType === 'line' ? 2 : undefined,
                fill: false,
                tension: 0.35,
                spanGaps: true,
            }));

            // ── Líneas de tendencia para gráficas de barras ──────────────────────
            const trendDatasetsAsesor = [];
            if (chartType === 'bar' && !isHoriz && datasets.length > 0) {
                datasets.forEach(ds => {
                    const vals = ds.data.map(v => (v === null || v === undefined) ? null : v);
                    const nonNull = vals.map((v,i) => v !== null ? {i, v} : null).filter(Boolean);
                    if (nonNull.length >= 2) {
                        const n = nonNull.length;
                        const sumX  = nonNull.reduce((s,p) => s + p.i, 0);
                        const sumY  = nonNull.reduce((s,p) => s + p.v, 0);
                        const sumXY = nonNull.reduce((s,p) => s + p.i * p.v, 0);
                        const sumX2 = nonNull.reduce((s,p) => s + p.i * p.i, 0);
                        const denom = n * sumX2 - sumX * sumX;
                        if (denom !== 0) {
                            const slope = (n * sumXY - sumX * sumY) / denom;
                            const intercept = (sumY - slope * sumX) / n;
                            trendDatasetsAsesor.push({
                                label: ds.label + ' (tendencia)',
                                data: vals.map((_, i) => parseFloat((slope * i + intercept).toFixed(2))),
                                type: 'line',
                                borderColor: ds.borderColor,
                                backgroundColor: 'transparent',
                                borderWidth: 2,
                                borderDash: [6, 4],
                                pointRadius: 0,
                                pointHoverRadius: 0,
                                tension: 0,
                                fill: false,
                                spanGaps: true,
                                order: -1
                            });
                        }
                    }
                });
            }

            const options = {
                responsive: true,
                maintainAspectRatio: false,
                animation: { duration: 400 },
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#a0a0a0', font: { size: 9 }, boxWidth: 10, padding: 6 }
                    },
                    tooltip: {
                        callbacks: {
                            label: c => c.parsed.y !== null
                                ? ` ${c.dataset.label}: ${c.parsed.y.toLocaleString('es-CO')} pts`
                                : null
                        }
                    }
                },
            };

            if (!isRadial && !isRadar) {
                options.indexAxis = isHoriz ? 'y' : 'x';
                options.scales = {
                    x: {
                        ticks: { color: '#a0a0a0', font: { size: 8 }, maxTicksLimit: 31 },
                        grid:  { color: 'rgba(255,255,255,0.05)' }
                    },
                    y: {
                        ticks: { color: '#f1c40f', font: { size: 8 },
                            callback: v => v >= 1000 ? (v/1000).toFixed(1)+'k' : v },
                        grid:  { color: 'rgba(255,255,255,0.05)' },
                        title: { display: true, text: 'Puntos', color: '#a0a0a0', font: { size: 9 } }
                    }
                };
            }

            const ch = new Chart(ctx.getContext('2d'), {
                type: isRadial ? _historialChartType : (isRadar ? 'radar' : chartType),
                data: { labels: labelsEje, datasets: [...datasets, ...trendDatasetsAsesor] },
                options
            });
            _asesorCharts.push(ch);
        });
    }, 50);
}


// ── TABS DE RESUMEN CONTABLE ──────────────────────────────────────────────────
function switchContableTab(tab) {
    const tabs = ['ingresos','ie','historial'];
    const labels = { ingresos:'💰 Ingresos Plataforma', ie:'📊 Ingresos & Egresos', historial:'📅 Historial' };
    tabs.forEach(t => {
        const btn = document.getElementById('tabContable_' + t);
        const panel = document.getElementById('contablePanel_' + t);
        if (!btn || !panel) return;
        if (t === tab) {
            btn.style.background = 'var(--accent)';
            btn.style.color = '#fff';
            btn.style.borderBottom = '2px solid var(--accent)';
            panel.style.display = '';
        } else {
            btn.style.background = 'transparent';
            btn.style.color = 'var(--textMuted)';
            btn.style.borderBottom = '2px solid transparent';
            panel.style.display = 'none';
        }
    });
    // Re-render historial cuando se cambia a esa pestaña
    if (tab === 'ingresos') { _ingresosRenderHistorial(); }
    if (tab === 'historial') { _ingresosRenderHistorial(); _ieRenderHistorial(); }
}
// ─────────────────────────────────────────────────────────────────────────────

// ── RESUMEN CONTABLE ─────────────────────────────────────────────────────────
// ═══════════════════════════════════════════════════════════════════
