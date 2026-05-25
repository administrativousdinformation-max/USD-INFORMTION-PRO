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
