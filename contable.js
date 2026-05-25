// MÓDULO RESUMEN CONTABLE — INGRESOS POR PLATAFORMA
// ═══════════════════════════════════════════════════════════════════
const CONTABLE_KEY       = 'datos_contable_usd';
const INGRESOS_KEY       = 'usd_ingresos_plataformas';
let   _contableChart     = null;

// Plataformas predefinidas (se pueden agregar más)
const _PLAT_DEFAULTS = ['AmoLatina','LatinMelodies','WishPark','Dream','TalkyTimes'];
const _PLAT_COLORS   = { AmoLatina:'#ff0a2e', WishPark:'#9b59b6', Dream:'#2980b9', TalkyTimes:'#3498db', LatinMelodies:'#e91e8c' };

// ── Formato dinero COP ──────────────────────────────────────────────
function _fmtCOP(n) {
    if (isNaN(n)) return '$0';
    return '$' + Math.round(n).toLocaleString('es-CO');
}

// ── Cargar historial de ingresos ────────────────────────────────────
function _ingresosCargar() {
    try { return JSON.parse(localStorage.getItem(INGRESOS_KEY) || '[]'); } catch(e) { return []; }
}
function _ingresosGuardarData(arr) {
    localStorage.setItem(INGRESOS_KEY, JSON.stringify(arr));
    if (window._fbGuardar) window._fbGuardar(INGRESOS_KEY, arr);
}

// ── Inicializar filas de la tabla de entrada ────────────────────────
function ingresosIniciarFilas(forzar) {
    const tbody = document.getElementById('ingresosFilas');
    if (!tbody) return;
    if (!forzar && tbody.children.length > 0) return; // ya tiene filas (sólo saltar si no es forzado)
    tbody.innerHTML = ''; // limpiar antes de repoblar
    _PLAT_DEFAULTS.forEach(p => _ingresosAgregarFilaPlat(p));
    _ingresosTotales();
}

function ingresosAgregarFila() {
    const nombre = prompt('Nombre de la nueva plataforma:');
    if (!nombre || !nombre.trim()) return;
    _ingresosAgregarFilaPlat(nombre.trim());
    _ingresosTotales();
}

function _ingresosAgregarFilaPlat(nombre) {
    const tbody = document.getElementById('ingresosFilas');
    if (!tbody) return;
    const color = _PLAT_COLORS[nombre] || '#a0a0a0';
    const tr = document.createElement('tr');
    tr.dataset.plat = nombre;
    tr.style.cssText = 'transition:0.15s;';
    tr.onmouseover = () => tr.style.background = 'rgba(255,255,255,0.03)';
    tr.onmouseout  = () => tr.style.background = '';
    tr.innerHTML = `
        <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);">
            <span style="background:${color}22;color:${color};border:1px solid ${color}55;border-radius:8px;padding:5px 12px;font-size:12px;font-weight:700;">${nombre}</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
            <input type="number" min="0" placeholder="0" class="ing-puntos" oninput="_ingresosTotales()"
                style="width:0;height:0;opacity:0;position:absolute;pointer-events:none;">
            <span class="ing-puntos-display" style="font-size:14px;font-weight:700;color:#f1c40f;">0</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
            <input type="number" min="0" step="0.01" placeholder="0.00" class="ing-tarifa" oninput="_ingresosTotales()"
                style="width:0;height:0;opacity:0;position:absolute;pointer-events:none;">
            <span class="ing-tarifa-display" style="font-size:14px;font-weight:700;color:#3498db;">0</span>
        </td>
        <td style="padding:12px 16px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;">
            <span class="ing-resultado" style="font-size:15px;font-weight:900;color:#27ae60;">$0</span>
        </td>
        <td style="padding:10px 8px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:center;"></td>`;
    tbody.appendChild(tr);
}

// ── Recalcular totales en tiempo real ───────────────────────────────
function _ingresosTotales() {
    const tbody = document.getElementById('ingresosFilas');
    if (!tbody) return;
    let totalPuntos = 0, totalIngresos = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
        const puntos  = parseFloat(tr.querySelector('.ing-puntos')?.value)  || 0;
        const tarifa  = parseFloat(tr.querySelector('.ing-tarifa')?.value)  || 0;
        const ingreso = puntos * tarifa;
        totalPuntos  += puntos;
        totalIngresos += ingreso;
        const res = tr.querySelector('.ing-resultado');
        if (res) res.textContent = _fmtCOP(ingreso);
        // Actualizar displays
        const dispPuntos = tr.querySelector('.ing-puntos-display');
        if (dispPuntos) dispPuntos.textContent = puntos > 0 ? puntos.toLocaleString('es-CO') : '0';
        const dispTarifa = tr.querySelector('.ing-tarifa-display');
        if (dispTarifa) dispTarifa.textContent = tarifa > 0 ? tarifa.toLocaleString('es-CO') : '0';
    });
    const tfoot = document.getElementById('ingresosTotalesRow');
    if (tfoot) {
        tfoot.innerHTML = `<tr style="border-top:2px solid rgba(255,255,255,0.15);">
            <td style="padding:12px;font-weight:800;color:#fff;font-size:13px;">TOTAL</td>
            <td style="padding:12px;text-align:right;font-weight:900;color:#f1c40f;font-size:14px;">${Math.round(totalPuntos).toLocaleString('es-CO')}</td>
            <td style="padding:12px;text-align:right;color:var(--textMuted);font-size:12px;">—</td>
            <td style="padding:12px;text-align:right;font-weight:900;color:#27ae60;font-size:16px;">${_fmtCOP(totalIngresos)}</td>
            <td></td>
        </tr>`;
    }
}

// ── Guardar período ─────────────────────────────────────────────────
function ingresosGuardar() {
    const mes  = document.getElementById('ingMes')?.value || '';
    const anio = document.getElementById('ingAnio')?.value || '';
    if (!mes || !anio) { toast('Selecciona mes y año', 'warning'); return; }

    const tbody = document.getElementById('ingresosFilas');
    if (!tbody) return;
    const filas = [];
    tbody.querySelectorAll('tr').forEach(tr => {
        const plat    = tr.dataset.plat || '';
        const puntos  = parseFloat(tr.querySelector('.ing-puntos')?.value)  || 0;
        const tarifa  = parseFloat(tr.querySelector('.ing-tarifa')?.value)  || 0;
        const ingreso = puntos * tarifa;
        if (puntos > 0 || tarifa > 0) filas.push({ plataforma: plat, puntos, tarifa, ingreso });
    });
    if (!filas.length) { toast('Ingresa puntos y tarifa en al menos una plataforma', 'warning'); return; }

    const historial = _ingresosCargar();
    const idx = historial.findIndex(p => p.mes === mes && p.anio === anio);
    const periodo = { mes, anio, label: `${mes} ${anio}`, filas, totalIngresos: filas.reduce((s,f)=>s+f.ingreso,0), fechaGuardado: new Date().toLocaleString('es-CO') };
    if (idx >= 0) historial[idx] = periodo; else historial.unshift(periodo);
    _ingresosGuardarData(historial);
    _ingresosRenderHistorial();
    toast(`✅ Período ${mes} ${anio} guardado correctamente`, 'success');
}

// ── Renderizar historial ────────────────────────────────────────────
function _ingresosRenderHistorial() {
    const historial = _ingresosCargar();
    const el = document.getElementById('ingresosHistorial');
    if (!el) return;
    if (!historial.length) {
        el.innerHTML = '<div style="font-size:13px;color:var(--textMuted);text-align:center;padding:30px 0;">Sin períodos guardados aún.</div>';
        return;
    }
    const CARD_COLORS = ['var(--accent)','#27ae60','#3498db','#f1c40f','#9b59b6','#e67e22'];
    el.innerHTML = historial.map((p, pi) => {
        const col = CARD_COLORS[pi % CARD_COLORS.length];
        const filaHtml = p.filas.map(f => `
            <tr onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background=''">
                <td style="padding:7px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;">${f.plataforma}</td>
                <td style="padding:7px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;text-align:right;color:#f1c40f;font-weight:700;">${Math.round(f.puntos).toLocaleString('es-CO')}</td>
                <td style="padding:7px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;text-align:right;color:#3498db;">${_fmtCOP(f.tarifa)}</td>
                <td style="padding:7px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;text-align:right;font-weight:900;color:#27ae60;">${_fmtCOP(f.ingreso)}</td>
            </tr>`).join('');
        return `<div style="margin-bottom:16px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;overflow:hidden;">
            <div style="background:linear-gradient(135deg,${col}22,${col}44);border-bottom:3px solid ${col};padding:12px 16px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
                <div style="font-size:14px;font-weight:900;color:#fff;">📅 ${p.label}</div>
                <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
                    <span style="font-size:18px;font-weight:900;color:#27ae60;">${_fmtCOP(p.totalIngresos)}</span>
                    <button onclick="_ingresosCargarPeriodo(${pi})" title="Editar este período"
                        style="background:rgba(255,255,255,0.1);border:none;color:#fff;cursor:pointer;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;transition:0.2s;"
                        onmouseover="this.style.background='rgba(255,255,255,0.2)'" onmouseout="this.style.background='rgba(255,255,255,0.1)'">✏️ Editar</button>
                    <button onclick="_ingresosEliminarPeriodo(${pi})" title="Eliminar período"
                        style="background:rgba(231,76,60,0.15);border:1px solid rgba(231,76,60,0.3);color:#e74c3c;cursor:pointer;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;transition:0.2s;"
                        onmouseover="this.style.background='rgba(231,76,60,0.3)'" onmouseout="this.style.background='rgba(231,76,60,0.15)'">🗑️</button>
                </div>
            </div>
            <div style="overflow-x:auto;">
                <table style="width:100%;border-collapse:collapse;">
                    <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.08);">
                        <th style="padding:7px 12px;text-align:left;font-size:10px;color:var(--textMuted);font-weight:700;text-transform:uppercase;">Plataforma</th>
                        <th style="padding:7px 12px;text-align:right;font-size:10px;color:var(--textMuted);font-weight:700;text-transform:uppercase;">Puntos</th>
                        <th style="padding:7px 12px;text-align:right;font-size:10px;color:var(--textMuted);font-weight:700;text-transform:uppercase;">Tarifa</th>
                        <th style="padding:7px 12px;text-align:right;font-size:10px;color:var(--textMuted);font-weight:700;text-transform:uppercase;">Ingreso</th>
                    </tr></thead>
                    <tbody>${filaHtml}</tbody>
                    <tfoot><tr style="border-top:2px solid rgba(255,255,255,0.1);">
                        <td colspan="3" style="padding:8px 12px;font-weight:800;font-size:12px;color:#fff;">TOTAL ${p.label}</td>
                        <td style="padding:8px 12px;text-align:right;font-weight:900;font-size:14px;color:#27ae60;">${_fmtCOP(p.totalIngresos)}</td>
                    </tr></tfoot>
                </table>
            </div>
            <div style="padding:6px 16px;font-size:10px;color:var(--textMuted);border-top:1px solid rgba(255,255,255,0.05);">Guardado: ${p.fechaGuardado || '—'}</div>
        </div>`;
    }).join('');
}

function _ingresosCargarPeriodo(idx, soloLectura) {
    const historial = _ingresosCargar();
    const p = historial[idx];
    if (!p) return;
    const selMes  = document.getElementById('ingMes');
    const selAnio = document.getElementById('ingAnio');
    if (selMes)  selMes.value  = p.mes;
    if (selAnio) selAnio.value = p.anio;
    const tbody = document.getElementById('ingresosFilas');
    if (!tbody) return;
    tbody.innerHTML = '';
    p.filas.forEach(f => {
        _ingresosAgregarFilaPlat(f.plataforma);
        const tr = tbody.lastElementChild;
        if (!tr) return;
        const inPuntos = tr.querySelector('.ing-puntos');
        const inTarifa = tr.querySelector('.ing-tarifa');
        if (inPuntos) inPuntos.value = f.puntos;
        if (inTarifa) inTarifa.value = f.tarifa;
        if (soloLectura) {
            if (inPuntos) { inPuntos.readOnly = true; inPuntos.style.opacity='0'; inPuntos.style.cursor='not-allowed'; inPuntos.title='Dato cargado desde Excel (solo lectura)'; }
            if (inTarifa) { inTarifa.readOnly = true; inTarifa.style.opacity='0'; inTarifa.style.cursor='not-allowed'; inTarifa.title='Dato cargado desde Excel (solo lectura)'; }
            // Ocultar botón de eliminar fila
            const btnElim = tr.querySelector('button[title="Quitar fila"]');
            if (btnElim) btnElim.style.display = 'none';
        }
    });
    _ingresosTotales();
    document.getElementById('sec-resumen-contable')?.scrollIntoView({ behavior:'smooth', block:'start' });
    if (!soloLectura) toast(`Período ${p.label} cargado para edición`, 'info');
}

function _ingresosEliminarPeriodo(idx) {
    const historial = _ingresosCargar();
    const p = historial[idx];
    if (!p) return;
    if (!confirm(`¿Eliminar el período ${p.label}?`)) return;
    historial.splice(idx, 1);
    _ingresosGuardarData(historial);
    _ingresosRenderHistorial();
    toast(`Período ${p.label} eliminado`, 'warning');
}

// ── Exportar mes actual ─────────────────────────────────────────────
function exportarContableIngresosMes() {
    const mes  = document.getElementById('ingMes')?.value || 'Mes';
    const anio = document.getElementById('ingAnio')?.value || '';
    const tbody = document.getElementById('ingresosFilas');
    if (!tbody) { toast('Sin datos para exportar','warning'); return; }
    const filas = [];
    let totalPuntos = 0, totalIngreso = 0;
    tbody.querySelectorAll('tr').forEach(tr => {
        const plat    = tr.dataset.plat || '';
        const puntos  = parseFloat(tr.querySelector('.ing-puntos')?.value)  || 0;
        const tarifa  = parseFloat(tr.querySelector('.ing-tarifa')?.value)  || 0;
        const ingreso = puntos * tarifa;
        totalPuntos  += puntos; totalIngreso += ingreso;
        filas.push({ Plataforma: plat, 'Puntos del Mes': puntos, 'Tarifa (COP/punto)': tarifa, 'Ingreso Total COP': Math.round(ingreso) });
    });
    filas.push({ Plataforma: 'TOTAL', 'Puntos del Mes': totalPuntos, 'Tarifa (COP/punto)': '', 'Ingreso Total COP': Math.round(totalIngreso) });
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(filas);
    // Ancho de columnas
    ws['!cols'] = [{ wch: 20 }, { wch: 16 }, { wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, ws, `${mes} ${anio}`);
    XLSX.writeFile(wb, `Ingresos_${mes}_${anio}_USD.xlsx`);
    toast(`Excel ${mes} ${anio} exportado ✓`, 'success');
}

// ── Exportar resumen completo (todos los períodos) ──────────────────
function exportarContableResumenTotal() {
    const historial = _ingresosCargar();
    if (!historial.length) { toast('No hay períodos guardados para exportar','warning'); return; }
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen por período
    const resumen = historial.map(p => ({
        Período: p.label,
        'Total Ingreso COP': Math.round(p.totalIngresos),
        'Fecha Registro': p.fechaGuardado || ''
    }));
    const wsRes = XLSX.utils.json_to_sheet(resumen);
    wsRes['!cols'] = [{ wch: 18 }, { wch: 20 }, { wch: 22 }];
    XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen General');

    // Hoja 2: Detalle completo
    const detalle = [];
    historial.forEach(p => {
        p.filas.forEach(f => {
            detalle.push({
                Período: p.label,
                Plataforma: f.plataforma,
                Puntos: f.puntos,
                'Tarifa COP/punto': f.tarifa,
                'Ingreso COP': Math.round(f.ingreso)
            });
        });
        detalle.push({ Período: '', Plataforma: `TOTAL ${p.label}`, Puntos: '', 'Tarifa COP/punto': '', 'Ingreso COP': Math.round(p.totalIngresos) });
        detalle.push({});
    });
    const wsDet = XLSX.utils.json_to_sheet(detalle);
    wsDet['!cols'] = [{ wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 }, { wch: 16 }];
    XLSX.utils.book_append_sheet(wb, wsDet, 'Detalle por Plataforma');

    // Hoja 3: Pivot plataformas × meses
    const plataformasSet = new Set();
    historial.forEach(p => p.filas.forEach(f => plataformasSet.add(f.plataforma)));
    const plataformas = [...plataformasSet];
    const pivotHeaders = ['Plataforma', ...historial.map(p => p.label)];
    const pivotRows = plataformas.map(plat => {
        const row = { Plataforma: plat };
        historial.forEach(p => {
            const f = p.filas.find(f => f.plataforma === plat);
            row[p.label] = f ? Math.round(f.ingreso) : 0;
        });
        return row;
    });
    // Fila de totales
    const totRow = { Plataforma: 'TOTAL' };
    historial.forEach(p => { totRow[p.label] = Math.round(p.totalIngresos); });
    pivotRows.push(totRow);
    const wsPivot = XLSX.utils.json_to_sheet(pivotRows);
    wsPivot['!cols'] = pivotHeaders.map((h,i) => ({ wch: i === 0 ? 20 : 16 }));
    XLSX.utils.book_append_sheet(wb, wsPivot, 'Pivot Plataforma × Mes');

    XLSX.writeFile(wb, `Resumen_Contable_USD_${new Date().toLocaleDateString('es-CO').replace(/\//g,'-')}.xlsx`);
    toast('Resumen completo exportado ✓', 'success');
}

// ── Alias para el botón legacy de exportar ─────────────────────────
function exportarContableExcel() {
    // Si hay datos del Excel original, exportarlos; si no, exportar el resumen de plataformas
    const raw = localStorage.getItem(CONTABLE_KEY);
    if (raw) {
        let datos;
        try { datos = JSON.parse(raw); } catch(e) { datos = []; }
        if (datos && datos.length) {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.json_to_sheet(datos);
            XLSX.utils.book_append_sheet(wb, ws, 'Contable');
            XLSX.writeFile(wb, 'Resumen_Contable_USD.xlsx');
            toast('Excel exportado correctamente ✓', 'success');
            return;
        }
    }
    exportarContableResumenTotal();
}

// ── Render legado (datos del Excel) ────────────────────────────────
function renderResumenContable() {
    // Inicializar/refrescar filas de ingresos
    ingresosIniciarFilas(false);
    _ingresosRenderHistorial();
    _ieRenderHistorial();

    const raw = localStorage.getItem(CONTABLE_KEY);
    const vacio     = document.getElementById('resumenContableVacio');
    const contenido = document.getElementById('resumenContableContenido');
    if (!raw) {
        if (vacio) vacio.style.display = 'none'; // usamos módulo nuevo
        if (contenido) contenido.style.display = 'none';
        return;
    }
    let datos;
    try { datos = JSON.parse(raw); } catch(e) { datos = []; }
    if (!datos || !datos.length) {
        if (vacio) vacio.style.display = 'none';
        if (contenido) contenido.style.display = 'none';
        return;
    }
    if (vacio) vacio.style.display = 'none';
    if (contenido) contenido.style.display = '';
    const headers = Object.keys(datos[0]);
    const numCols = headers.filter(h => {
        const vals = datos.map(r => parseFloat(String(r[h]).replace(/[^0-9.\-]/g,''))).filter(v => !isNaN(v) && v !== 0);
        return vals.length >= Math.ceil(datos.length * 0.5);
    });
    const totalesEl = document.getElementById('resumenContableTotales');
    if (totalesEl) {
        const CARD_COLORS = ['var(--accent)','#27ae60','#3498db','#f1c40f','#9b59b6','#e67e22'];
        totalesEl.innerHTML = numCols.map((h, i) => {
            const total = datos.reduce((s, r) => s + (parseFloat(String(r[h]).replace(/[^0-9.\-]/g,'')) || 0), 0);
            const prom  = total / datos.length;
            const fmt   = v => v % 1 === 0 ? v.toLocaleString('es-CO') : v.toLocaleString('es-CO', {minimumFractionDigits:2, maximumFractionDigits:2});
            const col   = CARD_COLORS[i % CARD_COLORS.length];
            return `<div class="glass-card" style="padding:18px 20px;border-left:4px solid ${col};position:relative;overflow:hidden;">
                <div style="position:absolute;top:-10px;right:-10px;font-size:52px;opacity:0.06;">💰</div>
                <div style="font-size:10px;color:var(--textMuted);text-transform:uppercase;letter-spacing:1px;font-weight:700;margin-bottom:8px;">${h}</div>
                <div style="font-size:24px;font-weight:900;color:${col};margin-bottom:4px;">$${fmt(total)}</div>
                <div style="font-size:11px;color:var(--textMuted);">Promedio: <strong style="color:#fff;">$${fmt(prom)}</strong> · ${datos.length} registros</div>
            </div>`;
        }).join('');
    }
    const sel = document.getElementById('resumenContableColGrafica');
    if (sel) { const prev = sel.value; sel.innerHTML = numCols.map(h => `<option value="${h}" ${h===prev?'selected':''}>${h}</option>`).join(''); }
    renderGraficaContable(datos, headers, numCols);
    const thead = document.getElementById('theadResumenContable');
    if (thead) {
        thead.innerHTML = `<tr>${headers.map(h =>
            `<th style="text-align:left;padding:9px 12px;color:var(--textMuted);font-weight:700;font-size:11px;border-bottom:2px solid rgba(255,255,255,0.1);white-space:nowrap;text-transform:uppercase;letter-spacing:0.5px;">${h}</th>`
        ).join('')}</tr>`;
    }
    filtrarResumenContable(datos, headers, numCols);
}

// Exponer como propiedad global para que el listener de Firebase pueda llamarla
window.renderResumenContable = renderResumenContable;

function renderGraficaContable(datos, headers, numCols) {
    if (!datos) {
        const raw = localStorage.getItem(CONTABLE_KEY); if (!raw) return;
        try { datos = JSON.parse(raw); } catch(e) { return; }
        headers = Object.keys(datos[0]);
        numCols = headers.filter(h => { const vals = datos.map(r => parseFloat(String(r[h]).replace(/[^0-9.\-]/g,''))).filter(v => !isNaN(v) && v !== 0); return vals.length >= Math.ceil(datos.length * 0.5); });
    }
    const sel = document.getElementById('resumenContableColGrafica');
    const colGraf = sel ? sel.value : (numCols[0] || ''); if (!colGraf) return;
    const colNombre = headers.find(h => /nombre|asesor|name/i.test(h)) || headers[0];
    const labels = datos.map(r => String(r[colNombre] || '').trim());
    const values = datos.map(r => parseFloat(String(r[colGraf]).replace(/[^0-9.\-]/g,'')) || 0);
    const GRAF_COLORS = ['#ff2d55','#27ae60','#3498db','#f1c40f','#9b59b6','#e67e22','#1abc9c','#e74c3c'];
    const ctx = document.getElementById('graficaResumenContable'); if (!ctx) return;
    if (_contableChart) { try { _contableChart.destroy(); } catch(e){} }
    _contableChart = new Chart(ctx.getContext('2d'), {
        type: 'bar',
        data: { labels, datasets: [{ label: colGraf, data: values, backgroundColor: labels.map((_, i) => GRAF_COLORS[i % GRAF_COLORS.length] + 'bb'), borderColor: labels.map((_, i) => GRAF_COLORS[i % GRAF_COLORS.length]), borderWidth: 2, borderRadius: 6 }] },
        options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` $${c.parsed.y.toLocaleString('es-CO')}` } } }, scales: { x: { ticks: { color: '#a0a0a0', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.05)' } }, y: { ticks: { color: '#a0a0a0', font: { size: 11 }, callback: v => '$' + (v >= 1000 ? (v/1000).toFixed(1)+'k' : v) }, grid: { color: 'rgba(255,255,255,0.05)' } } } }
    });
}

function filtrarResumenContable(datos, headers, numCols) {
    if (!datos) {
        const raw = localStorage.getItem(CONTABLE_KEY); if (!raw) return;
        try { datos = JSON.parse(raw); } catch(e) { return; }
        headers = Object.keys(datos[0]);
        numCols = headers.filter(h => { const vals = datos.map(r => parseFloat(String(r[h]).replace(/[^0-9.\-]/g,''))).filter(v => !isNaN(v) && v !== 0); return vals.length >= Math.ceil(datos.length * 0.5); });
    }
    const q = (document.getElementById('resumenContableBuscar')?.value || '').toLowerCase().trim();
    const filas = q ? datos.filter(r => Object.values(r).some(v => String(v).toLowerCase().includes(q))) : datos;
    const count = document.getElementById('resumenContableCount');
    if (count) count.textContent = `${filas.length} registro${filas.length !== 1 ? 's' : ''}`;
    const MONEY_RE = /salario|pagar|bono|adelanto|descuento|deducci|total|pago/i;
    const tbody = document.getElementById('tbodyResumenContable'); if (!tbody) return;
    tbody.innerHTML = filas.length
        ? filas.map(r => `<tr style="transition:0.15s;" onmouseover="this.style.background='rgba(255,255,255,0.04)'" onmouseout="this.style.background=''">${
            headers.map(h => { const val = r[h] ?? ''; const isNum = numCols.includes(h); const isMoney = isNum && MONEY_RE.test(h); const num = isNum ? parseFloat(String(val).replace(/[^0-9.\-]/g,'')) : NaN; let display = val; if (isMoney && !isNaN(num)) { display = `<strong style="color:#27ae60;">$${num.toLocaleString('es-CO',{minimumFractionDigits:0,maximumFractionDigits:0})}</strong>`; } else if (isNum && !isNaN(num)) { display = `<span style="color:#f1c40f;">${num.toLocaleString('es-CO')}</span>`; } return `<td style="padding:9px 12px;border-bottom:1px solid rgba(255,255,255,0.05);font-size:12px;${isNum?'text-align:right;':''}">${display}</td>`; }).join('')
          }</tr>`).join('')
        : `<tr><td colspan="${headers.length}" style="text-align:center;color:var(--textMuted);padding:40px;">Sin resultados para "<em>${q}</em>"</td></tr>`;
}

// ═══════════════════════════════════════════════════════════════════
// MÓDULO INGRESOS / EGRESOS  (hoja CONTABLE del Excel)
// ═══════════════════════════════════════════════════════════════════
const IE_KEY = 'usd_ingresos_egresos';

function _ieCargar() { try { return JSON.parse(localStorage.getItem(IE_KEY) || '[]'); } catch(e) { return []; } }
function _ieGuardarData(arr) {
    localStorage.setItem(IE_KEY, JSON.stringify(arr));
    if (window._fbGuardar) window._fbGuardar(IE_KEY, arr);
}

function ieRecalcular() {
    const g = id => parseFloat(document.getElementById(id)?.value) || 0;
    const ing  = g('ie_ing_puntos') + g('ie_ing_bonos') + g('ie_ing_otros');
    const egr  = g('ie_eg_nomina')  + g('ie_eg_deducibles') + g('ie_eg_bonos') + g('ie_eg_otros');
    const net  = ing - egr;
    const set  = (elId, val, col) => { const el = document.getElementById(elId); if (el) { el.textContent = _fmtCOP(val); el.style.color = col; } };
    set('ie_total_ingresos', ing,  '#27ae60');
    set('ie_total_egresos',  egr,  '#e74c3c');
    set('ie_ganancia_neta',  net,  net >= 0 ? '#27ae60' : '#e74c3c');
}

function ieGuardar() {
    const mes  = document.getElementById('ieMes')?.value  || '';
    const anio = document.getElementById('ieAnio')?.value || '';
    if (!mes || !anio) { toast('Selecciona mes y año', 'warning'); return; }
    const g = id => parseFloat(document.getElementById(id)?.value) || 0;
    const datos = {
        mes, anio, label: `${mes} ${anio}`,
        ing_puntos:    g('ie_ing_puntos'),
        ing_bonos:     g('ie_ing_bonos'),
        ing_otros:     g('ie_ing_otros'),
        eg_nomina:     g('ie_eg_nomina'),
        eg_deducibles: g('ie_eg_deducibles'),
        eg_bonos:      g('ie_eg_bonos'),
        eg_otros:      g('ie_eg_otros'),
        total_ingresos: g('ie_ing_puntos') + g('ie_ing_bonos') + g('ie_ing_otros'),
        total_egresos:  g('ie_eg_nomina')  + g('ie_eg_deducibles') + g('ie_eg_bonos') + g('ie_eg_otros'),
        ganancia_neta:  (g('ie_ing_puntos') + g('ie_ing_bonos') + g('ie_ing_otros')) - (g('ie_eg_nomina') + g('ie_eg_deducibles') + g('ie_eg_bonos') + g('ie_eg_otros')),
        fechaGuardado:  new Date().toLocaleString('es-CO')
    };
    const hist = _ieCargar();
    const idx  = hist.findIndex(p => p.mes === mes && p.anio === anio);
    if (idx >= 0) hist[idx] = datos; else hist.unshift(datos);
    _ieGuardarData(hist);
    _ieRenderHistorial();
    toast(`✅ Período ${mes} ${anio} guardado`, 'success');
}

function _ieCargarPeriodo(idx) {
    const p = _ieCargar()[idx]; if (!p) return;
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.value = val || '';
        // Actualizar span display
        const disp = document.getElementById(id + '_display');
        if (disp) disp.textContent = (val > 0) ? Number(val).toLocaleString('es-CO') : '0';
    };
    document.getElementById('ieMes') && (document.getElementById('ieMes').value  = p.mes);
    document.getElementById('ieAnio') && (document.getElementById('ieAnio').value = p.anio);
    // Soportar ambos formatos de nombres (ingPuntos/ing_puntos, etc.)
    set('ie_ing_puntos', p.ingPuntos    ?? p.ing_puntos    ?? 0);
    set('ie_ing_bonos',  p.ingBonos     ?? p.ing_bonos     ?? 0);
    set('ie_ing_otros',  p.ingOtros     ?? p.ing_otros     ?? 0);
    set('ie_eg_nomina',  p.egNomina     ?? p.eg_nomina     ?? 0);
    set('ie_eg_deducibles', p.egDed     ?? p.eg_deducibles ?? 0);
    set('ie_eg_bonos',   p.egBonos      ?? p.eg_bonos      ?? 0);
    set('ie_eg_otros',   p.egOtros      ?? p.eg_otros      ?? 0);
    ieRecalcular();
    toast(`Período ${p.label} cargado`, 'info');
}

function _ieEliminarPeriodo(idx) {
    const hist = _ieCargar(); const p = hist[idx]; if (!p) return;
    if (!confirm(`¿Eliminar el período ${p.label}?`)) return;
    hist.splice(idx, 1);
    _ieGuardarData(hist);
    _ieRenderHistorial();
    toast(`Período ${p.label} eliminado`, 'warning');
}

function _ieRenderHistorial() {
    const hist = _ieCargar();
    const el   = document.getElementById('ieHistorialLista'); if (!el) return;
    if (!hist.length) { el.innerHTML = '<div style="font-size:12px;color:var(--textMuted);text-align:center;padding:20px 0;">Sin períodos guardados.</div>'; return; }
    el.innerHTML = `<div style="overflow-x:auto;"><table style="width:100%;border-collapse:collapse;font-size:12px;min-width:600px;">
        <thead><tr style="border-bottom:1px solid rgba(255,255,255,0.1);">
            <th style="padding:7px 10px;text-align:left;color:var(--textMuted);font-size:10px;font-weight:700;text-transform:uppercase;">Período</th>
            <th style="padding:7px 10px;text-align:right;color:#27ae60;font-size:10px;font-weight:700;text-transform:uppercase;">Ingresos</th>
            <th style="padding:7px 10px;text-align:right;color:#e74c3c;font-size:10px;font-weight:700;text-transform:uppercase;">Egresos</th>
            <th style="padding:7px 10px;text-align:right;color:#3498db;font-size:10px;font-weight:700;text-transform:uppercase;">Ganancia Neta</th>
            <th style="padding:7px 10px;"></th>
        </tr></thead>
        <tbody>${hist.map((p, i) => {
            const tIng = p.totalIngresos ?? p.total_ingresos ?? 0;
            const tEgr = p.totalEgresos  ?? p.total_egresos  ?? 0;
            const tGan = p.gananciaNeta  ?? p.ganancia_neta  ?? (tIng - tEgr);
            return `<tr onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background=''">
            <td style="padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.05);font-weight:700;color:#fff;">${p.label}</td>
            <td style="padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;color:#27ae60;font-weight:700;">${_fmtCOP(tIng)}</td>
            <td style="padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;color:#e74c3c;font-weight:700;">${_fmtCOP(tEgr)}</td>
            <td style="padding:7px 10px;border-bottom:1px solid rgba(255,255,255,0.05);text-align:right;font-weight:900;font-size:13px;color:${tGan>=0?'#27ae60':'#e74c3c'};">${_fmtCOP(tGan)}</td>
            <td style="padding:7px 6px;border-bottom:1px solid rgba(255,255,255,0.05);white-space:nowrap;">
                <button onclick="_ieCargarPeriodo(${i})" style="background:rgba(255,255,255,0.07);border:none;color:#fff;cursor:pointer;padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;margin-right:4px;transition:0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.07)'">✏️</button>
                <button onclick="_ieEliminarPeriodo(${i})" style="background:rgba(231,76,60,0.12);border:1px solid rgba(231,76,60,0.3);color:#e74c3c;cursor:pointer;padding:3px 9px;border-radius:6px;font-size:10px;font-weight:700;transition:0.2s;" onmouseover="this.style.background='rgba(231,76,60,0.25)'" onmouseout="this.style.background='rgba(231,76,60,0.12)'">🗑️</button>
            </td>
        </tr>`;}).join('')}</tbody>
    </table></div>`;
}

// ── Exportar mes actual IE ──────────────────────────────────────────
function exportarIEExcel() {
    const mes  = document.getElementById('ieMes')?.value  || 'Mes';
    const anio = document.getElementById('ieAnio')?.value || '';
    const g = id => parseFloat(document.getElementById(id)?.value) || 0;
    const ing  = g('ie_ing_puntos') + g('ie_ing_bonos') + g('ie_ing_otros');
    const egr  = g('ie_eg_nomina')  + g('ie_eg_deducibles') + g('ie_eg_bonos') + g('ie_eg_otros');
    const rows = [
        { Concepto: '── INGRESOS ──', Valor_COP: '' },
        { Concepto: 'Ingresos por Puntos',   Valor_COP: g('ie_ing_puntos') },
        { Concepto: 'Bonos Adicionales',      Valor_COP: g('ie_ing_bonos') },
        { Concepto: 'Otros Ingresos',         Valor_COP: g('ie_ing_otros') },
        { Concepto: 'TOTAL INGRESOS',         Valor_COP: ing },
        { Concepto: '', Valor_COP: '' },
        { Concepto: '── EGRESOS ──', Valor_COP: '' },
        { Concepto: 'Salida de Nómina',       Valor_COP: g('ie_eg_nomina') },
        { Concepto: 'Deducibles / Préstamos', Valor_COP: g('ie_eg_deducibles') },
        { Concepto: 'Bonos Pagados',          Valor_COP: g('ie_eg_bonos') },
        { Concepto: 'Otros Egresos',          Valor_COP: g('ie_eg_otros') },
        { Concepto: 'TOTAL EGRESOS',          Valor_COP: egr },
        { Concepto: '', Valor_COP: '' },
        { Concepto: 'GANANCIA NETA',          Valor_COP: ing - egr },
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 28 }, { wch: 18 }];
    XLSX.utils.book_append_sheet(wb, ws, `${mes} ${anio}`);
    XLSX.writeFile(wb, `Contable_IE_${mes}_${anio}.xlsx`);
    toast(`Excel ${mes} ${anio} exportado ✓`, 'success');
}

// ── Exportar historial completo IE ─────────────────────────────────
function exportarIEHistorialExcel() {
    const hist = _ieCargar();
    if (!hist.length) { toast('No hay períodos guardados','warning'); return; }
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen mes a mes
    const resumen = hist.map(p => ({
        Período:          p.label,
        'Ing. Puntos':    p.ing_puntos    || 0,
        'Ing. Bonos':     p.ing_bonos     || 0,
        'Otros Ing.':     p.ing_otros     || 0,
        'Total Ingresos': p.total_ingresos|| 0,
        'Nómina':         p.eg_nomina     || 0,
        'Deducibles':     p.eg_deducibles || 0,
        'Bonos Pag.':     p.eg_bonos      || 0,
        'Otros Egr.':     p.eg_otros      || 0,
        'Total Egresos':  p.total_egresos || 0,
        'Ganancia Neta':  p.ganancia_neta || 0,
        'Fecha Registro': p.fechaGuardado || ''
    }));
    const wsRes = XLSX.utils.json_to_sheet(resumen);
    wsRes['!cols'] = Object.keys(resumen[0]).map((k,i) => ({ wch: i === 0 ? 15 : i === 11 ? 22 : 14 }));
    XLSX.utils.book_append_sheet(wb, wsRes, 'Resumen Mensual');

    // Hoja 2: Formato contable vertical (como el Excel original)
    const conceptos = [
        { label: '── INGRESOS ──────────────────────', key: null, tipo: 'header' },
        { label: 'Ingresos por Puntos',   key: 'ing_puntos' },
        { label: 'Bonos Adicionales',     key: 'ing_bonos' },
        { label: 'Otros Ingresos',        key: 'ing_otros' },
        { label: 'TOTAL INGRESOS',        key: 'total_ingresos', tipo: 'subtotal' },
        { label: '── EGRESOS ──────────────────────', key: null, tipo: 'header' },
        { label: 'Salida de Nómina',      key: 'eg_nomina' },
        { label: 'Deducibles / Préstamos',key: 'eg_deducibles' },
        { label: 'Bonos Pagados',         key: 'eg_bonos' },
        { label: 'Otros Egresos',         key: 'eg_otros' },
        { label: 'TOTAL EGRESOS',         key: 'total_egresos', tipo: 'subtotal' },
        { label: '── RESULTADO ────────────────────', key: null, tipo: 'header' },
        { label: 'GANANCIA NETA',         key: 'ganancia_neta', tipo: 'total' },
    ];
    const colsMeses = hist.map(p => p.label);
    const detalleRows = conceptos.map(c => {
        const row = { Concepto: c.label };
        hist.forEach(p => { row[p.label] = c.key ? (p[c.key] || 0) : ''; });
        if (c.key) row['TOTAL'] = hist.reduce((s,p) => s + (p[c.key]||0), 0);
        else row['TOTAL'] = '';
        return row;
    });
    const wsDet = XLSX.utils.json_to_sheet(detalleRows);
    wsDet['!cols'] = [{ wch: 28 }, ...colsMeses.map(() => ({ wch: 15 })), { wch: 15 }];
    XLSX.utils.book_append_sheet(wb, wsDet, 'Detalle Contable');

    XLSX.writeFile(wb, `Resumen_Contable_IE_${new Date().toLocaleDateString('es-CO').replace(/\//g,'-')}.xlsx`);
    toast('Historial completo exportado ✓', 'success');
}

// Inicializar módulo al entrar a la sección
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => { ingresosIniciarFilas(); _ingresosRenderHistorial(); _ieRenderHistorial(); }, 800);
});
// ─────────────────────────────────────────────────────────────────────────────

// ── Gráficas por GRUPO ───────────────────────────────────────────
let _grupoCharts = [];
function _renderGruposGrid() {
    const grid  = document.getElementById('historialGruposGrid');
    const empty = document.getElementById('historialGruposEmpty');
    if (!grid) return;
    _grupoCharts.forEach(c => { try { c.destroy(); } catch(e){} });
    _grupoCharts = [];
    if (!comparativoMeses || comparativoMeses.length === 0) { grid.innerHTML=''; if(empty)empty.style.display='block'; return; }
    const asesorAGrupo = {};
    (typeof usuarios!=='undefined'?usuarios:[]).forEach(u=>{ if(u.nombre&&u.grupo) asesorAGrupo[u.nombre.trim().toLowerCase()]=u.grupo.trim().toUpperCase(); });
    let maxDia=31;
    comparativoMeses.forEach(m=>{ if(m.puntosPorAsesor)Object.values(m.puntosPorAsesor).forEach(d=>Object.keys(d).forEach(k=>{if(+k>maxDia)maxDia=+k;})); });
    const todosLosDias=Array.from({length:maxDia},(_,i)=>i+1);
    const labelsEje=todosLosDias.map(d=>'D'+d);
    const gruposMap={};
    comparativoMeses.forEach((mes)=>{
        if(!mes.puntosPorAsesor)return;
        Object.entries(mes.puntosPorAsesor).forEach(([nombre,diasObj])=>{
            const grupo=asesorAGrupo[nombre.trim().toLowerCase()];
            if(!grupo)return;
            if(!gruposMap[grupo])gruposMap[grupo]={meses:{},asesores:new Set()};
            gruposMap[grupo].asesores.add(nombre);
            if(!gruposMap[grupo].meses[mes.label])gruposMap[grupo].meses[mes.label]={data:new Array(maxDia).fill(0),total:0};
            Object.entries(diasObj).forEach(([dia,pts])=>{
                const i=parseInt(dia)-1;
                if(i>=0&&i<maxDia)gruposMap[grupo].meses[mes.label].data[i]+=pts;
                gruposMap[grupo].meses[mes.label].total+=pts;
            });
        });
    });
    const grupos=Object.entries(gruposMap);
    if(!grupos.length){grid.innerHTML='';if(empty)empty.style.display='block';return;}
    if(empty)empty.style.display='none';
    grid.innerHTML=grupos.map(([grupo,data],idx)=>{
        const color=HIST_COLORS[idx%HIST_COLORS.length];
        const inicial=grupo.charAt(0).toUpperCase();
        const nAs=data.asesores.size;
        const mesesArr=comparativoMeses.map(m=>data.meses[m.label]||{data:new Array(maxDia).fill(0),total:0});
        const totalG=mesesArr.reduce((s,m)=>s+m.total,0);
        const mejorIdx=mesesArr.reduce((bi,m,i)=>m.total>mesesArr[bi].total?i:bi,0);
        const mejorMesLabel=comparativoMeses[mejorIdx]?comparativoMeses[mejorIdx].label:'—';
        const mejorPts=mesesArr[mejorIdx]?mesesArr[mejorIdx].total:0;
        const tL=totalG>=1000?(totalG/1000).toFixed(1)+'k':Math.round(totalG);
        const mL=mejorPts>=1000?(mejorPts/1000).toFixed(1)+'k':Math.round(mejorPts);
        return `<div style="background:var(--panelBg);border-radius:14px;border:1px solid rgba(255,255,255,0.1);overflow:hidden;">
            <div style="background:linear-gradient(135deg,${color}22,${color}44);border-bottom:3px solid ${color};padding:14px 16px;display:flex;align-items:center;gap:12px;">
                <div style="width:44px;height:44px;border-radius:12px;background:${color};border:3px solid ${color};display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:900;color:#fff;flex-shrink:0;box-shadow:0 4px 12px ${color}55;">${inicial}</div>
                <div style="flex:1;min-width:0;">
                    <div style="font-size:14px;font-weight:900;color:#fff;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${grupo}</div>
                    <div style="font-size:10px;color:${color};font-weight:700;text-transform:uppercase;margin-top:2px;">${nAs} asesor${nAs!==1?'es':''} · ${comparativoMeses.length} mes${comparativoMeses.length!==1?'es':''} · puntos sumados</div>
                </div>
            </div>
            <div style="padding:12px 14px;height:320px;position:relative;"><canvas id="chartGrupo_${idx}"></canvas></div>
            <div style="display:flex;gap:6px;padding:0 14px 12px;">
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;text-align:center;">
                    <div style="font-size:8px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Pts acumulados</div>
                    <div style="font-size:14px;font-weight:900;color:#f1c40f;margin-top:2px;">${tL}</div>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;text-align:center;">
                    <div style="font-size:8px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Mejor mes</div>
                    <div style="font-size:14px;font-weight:900;color:#27ae60;margin-top:2px;">${mejorMesLabel}</div>
                </div>
                <div style="flex:1;background:rgba(255,255,255,0.04);border-radius:8px;padding:6px 8px;text-align:center;">
                    <div style="font-size:8px;color:var(--textMuted);text-transform:uppercase;letter-spacing:0.5px;">Pts mejor mes</div>
                    <div style="font-size:14px;font-weight:900;color:#3498db;margin-top:2px;">${mL}</div>
                </div>
            </div>
        </div>`;
    }).join('');
    setTimeout(()=>{
        grupos.forEach(([grupo,data],idx)=>{
            const ctx=document.getElementById('chartGrupo_'+idx);
            if(!ctx)return;
            const isRadial=['pie','doughnut','polarArea'].includes(_historialChartType);
            const isRadar=_historialChartType==='radar';
            const isHoriz=_historialChartType==='bar_h';
            const chartType=isHoriz?'bar':(['bubble','scatter'].includes(_historialChartType)?'bar':_historialChartType);
            const datasets=comparativoMeses.map((mes,mi)=>{
                const md=data.meses[mes.label]||{data:new Array(maxDia).fill(null)};
                const c=HIST_COLORS[mi%HIST_COLORS.length];
                return{label:mes.label,data:md.data.map(v=>v===0?null:v),backgroundColor:c+(isRadial?'cc':'88'),borderColor:c,borderWidth:2,borderRadius:chartType==='bar'?4:0,pointRadius:chartType==='line'?2:undefined,fill:false,tension:0.35,spanGaps:true};
            });
            // ── Líneas de tendencia para gráficas de barras de grupos ─────────
            const trendDatasetsGrupo=[];
            if(chartType==='bar'&&!isHoriz&&datasets.length>0){
                datasets.forEach(ds=>{
                    const vals=ds.data.map(v=>(v===null||v===undefined)?null:v);
                    const nonNull=vals.map((v,i)=>v!==null?{i,v}:null).filter(Boolean);
                    if(nonNull.length>=2){
                        const n=nonNull.length;
                        const sumX=nonNull.reduce((s,p)=>s+p.i,0);
                        const sumY=nonNull.reduce((s,p)=>s+p.v,0);
                        const sumXY=nonNull.reduce((s,p)=>s+p.i*p.v,0);
                        const sumX2=nonNull.reduce((s,p)=>s+p.i*p.i,0);
                        const denom=n*sumX2-sumX*sumX;
                        if(denom!==0){
                            const slope=(n*sumXY-sumX*sumY)/denom;
                            const intercept=(sumY-slope*sumX)/n;
                            trendDatasetsGrupo.push({label:ds.label+' (tendencia)',data:vals.map((_,i)=>parseFloat((slope*i+intercept).toFixed(2))),type:'line',borderColor:ds.borderColor,backgroundColor:'transparent',borderWidth:2,borderDash:[6,4],pointRadius:0,pointHoverRadius:0,tension:0,fill:false,spanGaps:true,order:-1});
                        }
                    }
                });
            }
            const options={responsive:true,maintainAspectRatio:false,animation:{duration:400},plugins:{legend:{display:true,labels:{color:'#a0a0a0',font:{size:9},boxWidth:10,padding:6}},tooltip:{callbacks:{label:c=>c.parsed.y!==null?` ${c.dataset.label}: ${c.parsed.y.toLocaleString('es-CO')} pts`:null}}}};
            if(!isRadial&&!isRadar){options.indexAxis=isHoriz?'y':'x';options.scales={x:{ticks:{color:'#a0a0a0',font:{size:8},maxTicksLimit:31},grid:{color:'rgba(255,255,255,0.05)'}},y:{ticks:{color:'#f1c40f',font:{size:8},callback:v=>v>=1000?(v/1000).toFixed(1)+'k':v},grid:{color:'rgba(255,255,255,0.05)'},title:{display:true,text:'Puntos del grupo',color:'#a0a0a0',font:{size:9}}}};}
            const ch=new Chart(ctx.getContext('2d'),{type:isRadial?_historialChartType:(isRadar?'radar':chartType),data:{labels:labelsEje,datasets:[...datasets,...trendDatasetsGrupo]},options});
            _grupoCharts.push(ch);
        });
    },50);
}

// Enganchar setChartType para que también actualice las gráficas de asesores y grupos
(function() {
    const _origSetChartType = setChartType;
    setChartType = function(tipo, emoji, label) {
        _origSetChartType(tipo, emoji, label);
        if (_historialTab === 'asesores') _renderAsesoresGrid();
        if (_historialTab === 'grupos')   _renderGruposGrid();
    };
})();

</script>
